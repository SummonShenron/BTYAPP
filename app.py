# app.py
from datetime import datetime, timezone
import logging
import os
import threading
import time
import asyncio
import json
import re
import traceback
import re
from urllib import error as urllib_error
from urllib import request as urllib_request
from typing import List, Optional, Dict, Any
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException, status, Request, Header
from fastapi.exceptions import RequestValidationError
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from backend.logging.bty_logger import setup_logging
from backend.logging.erragent_handler import install_erragent_logging
from backend.utils.notifications_utils import notify_madison_of_lead
from dotenv import load_dotenv
from backend.utils.db_utils import (
    test_connection,
    resolve_service_registry_repo,
    save_error_event,
)
from backend.utils.cms_utils import (
    ALLOWED_CONTENT_KEYS,
    get_content_map,
    update_content_bulk,
    update_content_key,
)
from backend.utils.leads_utils import (
    ConsultationLead, 
    AppointmentBooking, 
    save_lead, 
    save_booking, 
    fetch_all_leads,
)
from backend.utils.pr_utils import (
    PRRecordPayload,
    save_pr_record,
    fetch_all_pr_records,
    delete_pr_record,
)
from backend.utils.schedule_utils import (
    generate_upcoming_slots,
    get_schedule_settings,
    save_schedule_settings,
    find_slot,
)
from backend.utils.app_utils import (
    resolve_target_repo, 
    pick_repo_from_metadata,
    post_erragent_ingest,
    send_erragent_ingest,
    dispatch_erragent_ingest,
    build_error_payload,
    send_erragent_client_error,
)
from backend.utils.auth_utils import ( 
    get_optional_user, 
    get_current_client, 
    verify_admin
)
from backend.utils.synthetic_utils import (
    SyntheticContext,
    get_synthetic_context,
    synthetic_mutations_safe,
    synthetic_response_fields,
    SYNTHETIC_HEADER,
    CORRELATION_HEADER,
    REASON_HEADER,
)

load_dotenv()
app = FastAPI(
    title="BTY Fitness API",
    description="Backend API for Madison Spear - Better Than Yesterday Fitness",
    version="1.0.0"
)
logger = setup_logging()
install_erragent_logging(logger)
logger.info("--- Launching BTY Fitness API ---")
logger.info("BTY synthetic mutations safe: %s", os.getenv("ERRAGENT_BTY_SYNTHETIC_MUTATIONS_SAFE"))
logger.info("BTY production read-only: %s", os.getenv("BTY_PRODUCTION_READ_ONLY"))
logger.info("Allow production synthetics: %s", os.getenv("ERRAGENT_ALLOW_PRODUCTION_SYNTHETICS"))
# CORS setup for front-end integration
app.add_middleware(
    CORSMiddleware,
    # This regex matches any port on localhost/127.0.0.1 and any Vercel deployment preview/production URL
    allow_origin_regex=r"^https://([a-z0-9-]+.)btyfitness.app$|^https://([a-z0-9-]+.)vercel.app$|^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_TARGET_REPO_FALLBACK = "summonshenron/SAAPP"
DEFAULT_ERRAGENT_INGEST_URL = "https://erragent.onrender.com/api/v1/webhooks/ingest"

class IngestPayload(BaseModel):
    service_name: str
    error_message: str
    stack_trace: str
    environment: Optional[str] = None
    repository: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class StatusUpdate(BaseModel):
    status: str


class ClientErrorPayload(BaseModel):
    service: str
    environment: str = "production"
    release: Optional[str] = None
    route: Optional[str] = None
    source: str = "frontend"
    message: str
    stack: Optional[str] = None
    metadata: Dict[str, Any] = {}

class ContentValueUpdate(BaseModel):
    value: str

class BulkContentUpdate(BaseModel):
    items: Dict[str, str]

# -------------------------------------------------------------
# 0. GLOBAL EXCEPTION HANDLER & MIDDLEWARE
# -------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def request_validation_handler(request: Request, exc: RequestValidationError):
    """Return stable, safe validation messages for public form endpoints."""
    errors = exc.errors()
    email_error = next(
        (error for error in errors if "email" in {str(part) for part in error.get("loc", ())}),
        None,
    )
    if email_error:
        return JSONResponse(
            status_code=422,
            content={"detail": "Invalid email address format"},
        )
    if any(error.get("type") == "model_attributes_type" for error in errors):
        return JSONResponse(
            status_code=422,
            content={"detail": "Invalid input format"},
        )
    return JSONResponse(status_code=422, content={"detail": errors})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Re-raise standard FastAPI HTTP exceptions so they return their intended status code (e.g. 401, 404)
    if isinstance(exc, HTTPException):
        raise exc

    logger.error("--> Caught unhandled exception on %s [%s]: %s", request.url.path, request.method, str(exc))

    # 1. Build standardized error payload
    payload = build_error_payload(
        exc=exc,
        service_default="btyapp",
        source=request.url.path,
        method=request.method,
    )

    # 2. Fire-and-forget in background
    dispatch_erragent_ingest(payload)

    # 3. Return clean 500
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    started_at = time.perf_counter()
    logger.info("[REQ] %s %s", request.method, request.url.path)

    try:
        response = await call_next(request)
    except Exception:
        logger.exception(
            "[ERR] %s %s failed",
            request.method,
            request.url.path,
            extra={
                "erragent_context": {
                    "method": request.method,
                    "path": request.url.path,
                    "environment": os.getenv("ENVIRONMENT", "production"),
                }
            },
        )
        raise

    duration_ms = round((time.perf_counter() - started_at) * 1000)

    if response.status_code >= 500:
        logger.error(
            "[RES] %s %s -> %s",
            request.method,
            request.url.path,
            response.status_code,
            extra={
                "erragent_context": {
                    "method": request.method,
                    "path": request.url.path,
                    "statusCode": response.status_code,
                    "durationMs": duration_ms,
                    "environment": os.getenv("ENVIRONMENT", "production"),
                }
            },
        )
    else:
        logger.info(
            "[RES] %s %s -> %s",
            request.method,
            request.url.path,
            response.status_code,
        )

    return response

@app.on_event("startup")
async def startup_db_check():
    # Recalling inside the running loop installs asyncio capture.
    install_erragent_logging(logger)

    connected = test_connection()
    logger.info(
        "Startup DB connection status: %s",
        "connected" if connected else "disabled_or_failed",
    )


# -------------------------------------------------------------
# 1. PUBLIC ROUTES (Zero Auth Needed)
# -------------------------------------------------------------

@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {"status": "online", "brand": "BTY Fitness"}


@app.get("/api/synthetic/capabilities")
async def get_synthetic_capabilities():
    """
    Read-only capability check for fuzz/chaos testing tools (e.g. errAgent's
    Patchy). Callers MUST check this before sending X-ErrAgent-Synthetic
    traffic against a deployment — the env flag alone is not proof of safety;
    it must be paired with this endpoint confirming synthetic mode is honored.
    """
    return {
        "service": "btyapp",
        "environment": os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "production")),
        "synthetic_mutations_safe": synthetic_mutations_safe(),
        "synthetic_header": SYNTHETIC_HEADER,
        "correlation_header": CORRELATION_HEADER,
        "reason_header": REASON_HEADER,
        "guarded_endpoints": [
            "/api/consultations",
            "/api/consultation",
            "/api/bookings",
        ],
    }


@app.post("/api/client-errors", status_code=status.HTTP_202_ACCEPTED)
async def report_client_error(payload: ClientErrorPayload):
    """
    Receives errors captured by the BTY frontend (window.onerror, React error
    boundary, unhandled rejections, failed API calls) and forwards them to
    errAgent for triage. Never surfaces errAgent downtime to the browser.
    """
    safe_payload = {
        "service": "btyapp",
        "environment": payload.environment,
        "release": payload.release,
        "route": payload.route,
        "source": payload.source,
        "message": payload.message[:4000],
        "stack": payload.stack[:12000] if payload.stack else None,
        "metadata": payload.metadata,
    }

    try:
        result = await send_erragent_client_error(safe_payload)
        logger.info(
            "--> [errAgent] client-error forwarded status=%s",
            result.get("status_code"),
        )
    except Exception as exc:
        logger.error("--> [errAgent] client-error forward failed: %s", str(exc))

    return {"status": "accepted"}

@app.post("/api/consultations", status_code=status.HTTP_201_CREATED)
async def submit_consultation(
    lead: ConsultationLead,
    background_tasks: BackgroundTasks,
    synthetic: SyntheticContext = Depends(get_synthetic_context),
):
    """
    Public Endpoint: Lead capture form on the landing page / consultation page.
    Saves to MongoDB and fires an alert email task to Madison, unless the
    request is tagged synthetic (see GET /api/synthetic/capabilities).
    """
    if not lead or not lead.email or not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", lead.email):
        raise HTTPException(status_code=422, detail="Invalid email address format")

    logger.info(
        "Consultation submission received for email=%s synthetic=%s",
        lead.email,
        synthetic.is_synthetic,
    )

    if synthetic.is_synthetic:
        return {
            "success": True,
            "message": "Synthetic consultation validated; no lead was created and no email was sent.",
            **synthetic_response_fields(synthetic),
        }

    saved_lead = await save_lead(lead)
    logger.info("Consultation lead saved with id=%s", saved_lead.get("_id"))
    
    # Send background email alert to jackharper0517@outlook.com
    background_tasks.add_task(notify_madison_of_lead, saved_lead)
    logger.info("Consultation notification task queued for id=%s", saved_lead.get("_id"))
    
    return {
        "success": True,
        "message": "Consultation request received! Madison will reach out shortly.",
        **synthetic_response_fields(synthetic),
    }


@app.post("/api/consultation", status_code=status.HTTP_201_CREATED)
async def submit_consultation_alias(
    lead: ConsultationLead,
    background_tasks: BackgroundTasks,
    synthetic: SyntheticContext = Depends(get_synthetic_context),
):
    """Backward-compatible alias for clients posting to singular endpoint path."""
    logger.info("Consultation alias endpoint hit: /api/consultation")
    return await submit_consultation(lead, background_tasks, synthetic)


# -------------------------------------------------------------
# 2. CLIENT / BOOKING ROUTES
# -------------------------------------------------------------

@app.post("/api/bookings", status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking: AppointmentBooking, 
    background_tasks: BackgroundTasks,
    user: Optional[dict] = Depends(get_optional_user), # Supports guest or logged-in clients
    synthetic: SyntheticContext = Depends(get_synthetic_context),
):
    """
    Book an appointment from Book.tsx.
    Saves document to MongoDB 'bookings' collection and fires an email notification
    to Madison, unless the request is tagged synthetic (see GET /api/synthetic/capabilities).
    """
    logger.info(
        "Booking submission received for email=%s session_type=%s synthetic=%s",
        booking.email,
        booking.session_type,
        synthetic.is_synthetic,
    )

    if not booking or not booking.email or "@" not in booking.email or "." not in booking.email:
        raise HTTPException(status_code=422, detail="Invalid email address format")

    # If the user selected a concrete scheduler slot, validate it against the recurring schedule.
    if booking.preferred_date and booking.preferred_slot_start:
        duration_minutes: Optional[int] = None
        if booking.preferred_slot_end:
            try:
                start_parts = booking.preferred_slot_start.split(":")
                end_parts = booking.preferred_slot_end.split(":")
                start_total = int(start_parts[0]) * 60 + int(start_parts[1])
                end_total = int(end_parts[0]) * 60 + int(end_parts[1])
                if end_total > start_total:
                    duration_minutes = end_total - start_total
            except Exception:
                duration_minutes = None

        settings = get_schedule_settings()
        matched_slot = find_slot(
            settings,
            booking.preferred_date,
            booking.preferred_slot_start,
            appointment_minutes=duration_minutes,
            preferred_slot_end=booking.preferred_slot_end,
        )
        if matched_slot is None:
            raise HTTPException(status_code=409, detail="Selected time slot is not available.")

        if matched_slot.get("is_booked"):
            raise HTTPException(status_code=409, detail="Selected time slot is already booked.")

    if synthetic.is_synthetic:
        return {
            "success": True,
            "booking_id": None,
            "message": "Synthetic booking validated; no appointment was created and no email was sent.",
            "client_type": "Registered Client" if user else "Guest",
            **synthetic_response_fields(synthetic),
        }

    # 1. Save document to MongoDB
    saved_booking = await save_booking(booking)
    logger.info("Booking saved with id=%s", saved_booking.get("_id"))
    
    # 2. Add metadata for email alert
    saved_booking["client_type"] = "Registered Client" if user else "Guest"
    saved_booking["target_email"] = "jackharper0517@outlook.com"

    # 3. Fire background task
    background_tasks.add_task(notify_madison_of_lead, saved_booking)
    logger.info("Booking notification task queued for id=%s", saved_booking.get("_id"))
    
    return {
        "success": True,
        "booking_id": saved_booking["_id"],
        "message": "Booking received and saved! Confirmation email queued for Madison.",
        "client_type": saved_booking["client_type"],
        **synthetic_response_fields(synthetic),
    }


@app.get("/api/schedule/settings")
async def get_public_schedule_settings():
    logger.info("Public schedule settings requested")
    return get_schedule_settings()


@app.get("/api/schedule/slots")
async def get_public_schedule_slots(days: Optional[int] = None, duration_minutes: Optional[int] = None):
    logger.info("Public schedule slots requested for days=%s duration_minutes=%s", days, duration_minutes)
    settings = get_schedule_settings()
    slots = generate_upcoming_slots(settings, days_ahead=days, appointment_minutes=duration_minutes)
    return {
        "timezone": settings.get("timezone", "America/Chicago"),
        "booking_window_days": settings.get("booking_window_days", 14),
        "slot_minutes": settings.get("slot_minutes", 30),
        "slots": slots,
    }


@app.get("/api/admin/schedule/settings")
async def get_admin_schedule_settings(admin: dict = Depends(verify_admin)):
    logger.info("Admin schedule settings requested")
    return get_schedule_settings()


@app.put("/api/admin/schedule/settings")
async def update_admin_schedule_settings(settings_payload: dict, admin: dict = Depends(verify_admin)):
    logger.info(
        "Admin schedule update requested: timezone=%s blocks=%s",
        settings_payload.get("timezone"),
        len(settings_payload.get("weekly_blocks", [])),
    )
    saved = save_schedule_settings(settings_payload)
    return {"success": True, "settings": saved}

@app.get("/api/client/appointments")
async def get_my_appointments(current_user: dict = Depends(get_current_client)):
    """Client Portal: Get logged-in client's upcoming workouts & bookings."""
    client_id = current_user.get("sub")
    return [{"id": "bk_12345", "service": "1-on-1 Personal Training", "status": "Confirmed"}]


# -------------------------------------------------------------
# 3. ADMIN ROUTES (Madison & You Only)
# -------------------------------------------------------------

@app.get("/api/admin/schedule")
async def get_master_schedule(admin: dict = Depends(verify_admin)):
    """Admin Only: View all client appointments and manage availability."""
    return {"status": "Master schedule data"}

@app.get("/api/admin/leads", response_model=List[dict])
async def get_consultation_leads(admin: dict = Depends(verify_admin)):
    logger.info("Admin leads fetch requested")
    leads = await fetch_all_leads()
    logger.info("Admin leads fetch returned count=%s", len(leads))
    return leads

@app.patch("/api/admin/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, status_data: StatusUpdate, admin: dict = Depends(verify_admin)):
    """Update a lead's status (pending, contacted, confirmed)."""
    try:
        logger.info("Lead status update requested: lead_id=%s status=%s", lead_id, status_data.status)
        from backend.utils.db_utils import get_db
        db = get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database is not enabled")

        leads_collection = db["leads"]
        # Convert string ID to MongoDB ObjectId
        object_id = ObjectId(lead_id)
        
        # Update document in MongoDB collection
        result = await leads_collection.update_one(
            {"_id": object_id},
            {"$set": {"status": status_data.status}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")

        logger.info("Lead status updated successfully: lead_id=%s status=%s", lead_id, status_data.status)

        return {"status": "success", "updated_status": status_data.status}

    except Exception as e:
        logger.error("Failed lead status update for lead_id=%s: %s", lead_id, str(e))
        raise HTTPException(status_code=400, detail=f"Invalid lead ID or update failed: {str(e)}")

@app.get("/api/prs")
async def get_public_prs():
    logger.info("Public PR records requested")
    return await fetch_all_pr_records()


@app.post("/api/prs", status_code=status.HTTP_201_CREATED)
async def create_public_pr(payload: PRRecordPayload):
    logger.info("New PR record submitted for %s / %s", payload.name, payload.liftName)
    saved = await save_pr_record(payload)
    return {"success": True, "record": saved}


@app.delete("/api/prs/{pr_id}")
async def delete_public_pr(pr_id: str):
    logger.info("Delete PR request for id=%s", pr_id)
    try:
        deleted = await delete_pr_record(pr_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if not deleted:
        raise HTTPException(status_code=404, detail="PR not found")

    return {"success": True, "deleted_id": pr_id}


@app.get("/api/content")
async def get_public_content():
    logger.info("Public content requested")
    return get_content_map()


@app.get("/api/admin/content")
async def get_admin_content(admin: dict = Depends(verify_admin)):
    logger.info("Admin content requested")
    return get_content_map()


@app.put("/api/admin/content/{key}")
async def put_admin_content_key(
    key: str,
    payload: ContentValueUpdate,
    admin: dict = Depends(verify_admin),
):
    try:
        if key not in ALLOWED_CONTENT_KEYS:
            raise HTTPException(status_code=400, detail="Invalid content key.")
        item = update_content_key(
            key=key,
            value=payload.value,
            updated_by=admin.get("sub"),
        )
        return {"success": True, "item": item}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.put("/api/admin/content")
async def put_admin_content_bulk(
    payload: BulkContentUpdate,
    admin: dict = Depends(verify_admin),
):
    try:
        updated_count, updated_at = update_content_bulk(
            items=payload.items,
            updated_by=admin.get("sub"),
        )
        return {
            "success": True,
            "updated_count": updated_count,
            "updated_at": updated_at,
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

# -------------------------------------------------------------
# 4. WEBHOOK ROUTES
# -------------------------------------------------------------
@app.post("/api/v1/webhooks/ingest", status_code=status.HTTP_200_OK)
async def ingest_error_webhook(
    payload: IngestPayload,
    x_ingest_secret: Optional[str] = Header(default=None, alias="X-Ingest-Secret"),
):
    configured_secret = os.getenv("INGEST_WEBHOOK_SECRET")
    if not configured_secret:
        logger.error("INGEST_WEBHOOK_SECRET is not configured")
        raise HTTPException(status_code=503, detail="Ingest is not configured")

    if x_ingest_secret != configured_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"accepted": False, "error": "invalid_ingest_secret"},
        )

    resolved_repo, resolved_via = resolve_target_repo(
        service_name=payload.service_name,
        payload_repo=payload.repository,
        metadata=payload.metadata,
    )

    event_doc = {
        "service_name": payload.service_name.strip(),
        "error_message": payload.error_message,
        "stack_trace": payload.stack_trace,
        "environment": payload.environment or "unknown",
        "repository": resolved_repo,
        "resolved_via": resolved_via,
        "metadata": payload.metadata or {},
        "source": "direct_ingest",
    }

    try:
        event_id = save_error_event(event_doc)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Failed to persist ingest event: %s", str(exc))
        raise HTTPException(status_code=500, detail="Failed to store ingest event") from exc

    return {
        "accepted": True,
        "status": "stored",
        "event_id": event_id,
        "service_name": payload.service_name,
        "resolved_repository": resolved_repo,
        "resolved_via": resolved_via,
    }

# -------------------------------------------------------------
# 5. TEST ROUTES
# -------------------------------------------------------------
@app.get("/api/erragent-debug")
async def trigger_error():
    logger.info("--> /api/erragent-debug endpoint hit!")
    # Intentionally trigger zero division; caught automatically by global_exception_handler!
    try:
        return 1 / 0
    except ZeroDivisionError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Division by zero error triggered for debugging"
        ) from exc

@app.get("/debug/erragent-thread")
async def test_thread():
    def fail():
        raise RuntimeError("errAgent thread capture test")

    threading.Thread(target=fail, name="erragent-test-thread").start()
    return {"triggered": "thread"}


@app.get("/debug/erragent-async")
async def test_async():
    async def fail():
        await asyncio.sleep(0.1)
        raise RuntimeError("errAgent async capture test")

    asyncio.create_task(fail())
    return {"triggered": "async"}

# -------------------------------------------------------------
# 6. HEALTH ROUTES
# -------------------------------------------------------------
@app.get("/api/health", tags=["Health"])
def bty_health_check():
    """
    Lightweight health endpoint for BTY.
    Used by errAgent to monitor uptime and latency.
    """
    db_status = "connected" if test_connection() else "disabled_or_failed"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "db": db_status,
        "service": "BTY Fitness API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }



