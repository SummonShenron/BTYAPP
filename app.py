# app.py
import logging
import os
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException, status, Request
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware

from backend.utils.db_utils import test_connection
from backend.logging.bty_logger import setup_logging
from backend.utils.leads_utils import (
    ConsultationLead, 
    AppointmentBooking, 
    save_lead, 
    save_booking, 
    fetch_all_leads
)
from backend.utils.schedule_utils import (
    generate_upcoming_slots,
    get_schedule_settings,
    save_schedule_settings,
    find_slot,
)
from backend.utils.notifications_utils import notify_madison_of_lead
from backend.utils.auth_utils import get_optional_user, get_current_client, verify_admin
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(
    title="BTY Fitness API",
    description="Backend API for Madison Spear - Better Than Yesterday Fitness",
    version="1.0.0"
)

logger = setup_logging()
logger.info("--- Launching BTY Fitness API ---")

# CORS setup for front-end integration
app.add_middleware(
    CORSMiddleware,
    # This regex matches any port on localhost/127.0.0.1 and any Vercel deployment preview/production URL
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StatusUpdate(BaseModel):
    status: str


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    logger.info("[REQ] %s %s", request.method, request.url.path)
    response = await call_next(request)
    logger.info("[RES] %s %s -> %s", request.method, request.url.path, response.status_code)
    return response

@app.on_event("startup")
async def startup_db_check():
    """Verify DB connection on API launch."""
    connected = test_connection()
    logger.info("Startup DB connection status: %s", "connected" if connected else "disabled_or_failed")


# -------------------------------------------------------------
# 1. PUBLIC ROUTES (Zero Auth Needed)
# -------------------------------------------------------------

@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {"status": "online", "brand": "BTY Fitness"}

@app.post("/api/consultations", status_code=status.HTTP_201_CREATED)
async def submit_consultation(lead: ConsultationLead, background_tasks: BackgroundTasks):
    """
    Public Endpoint: Lead capture form on the landing page / consultation page.
    Saves to MongoDB and fires an alert email task to Madison.
    """
    logger.info("Consultation submission received for email=%s", lead.email)
    saved_lead = await save_lead(lead)
    logger.info("Consultation lead saved with id=%s", saved_lead.get("_id"))
    
    # Send background email alert to jackharper0517@outlook.com
    background_tasks.add_task(notify_madison_of_lead, saved_lead)
    logger.info("Consultation notification task queued for id=%s", saved_lead.get("_id"))
    
    return {
        "success": True,
        "message": "Consultation request received! Madison will reach out shortly."
    }


@app.post("/api/consultation", status_code=status.HTTP_201_CREATED)
async def submit_consultation_alias(lead: ConsultationLead, background_tasks: BackgroundTasks):
    """Backward-compatible alias for clients posting to singular endpoint path."""
    logger.info("Consultation alias endpoint hit: /api/consultation")
    return await submit_consultation(lead, background_tasks)


# -------------------------------------------------------------
# 2. CLIENT / BOOKING ROUTES
# -------------------------------------------------------------

@app.post("/api/bookings", status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking: AppointmentBooking, 
    background_tasks: BackgroundTasks,
    user: Optional[dict] = Depends(get_optional_user) # Supports guest or logged-in clients
):
    """
    Book an appointment from Book.tsx.
    Saves document to MongoDB 'bookings' collection and fires an email notification to Madison.
    """
    logger.info("Booking submission received for email=%s session_type=%s", booking.email, booking.session_type)

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
        "client_type": saved_booking["client_type"]
    }


@app.get("/api/schedule/settings")
async def get_public_schedule_settings():
    logger.info("Public schedule settings requested")
    return get_schedule_settings()


@app.get("/api/schedule/slots")
async def get_public_schedule_slots(days: int = 14, duration_minutes: Optional[int] = None):
    logger.info("Public schedule slots requested for days=%s duration_minutes=%s", days, duration_minutes)
    settings = get_schedule_settings()
    slots = generate_upcoming_slots(settings, days_ahead=days, appointment_minutes=duration_minutes)
    return {
        "timezone": settings.get("timezone", "America/Chicago"),
        "booking_window_days": settings.get("booking_window_days", days),
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