# app.py
import logging
import os
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from backend.utils.db_utils import test_connection
from backend.utils.leads_utils import (
    ConsultationLead, 
    AppointmentBooking, 
    save_lead, 
    save_booking, 
    fetch_all_leads
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

logger = logging.getLogger("BTY Logger")
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

@app.on_event("startup")
async def startup_db_check():
    """Verify DB connection on API launch."""
    test_connection()


# -------------------------------------------------------------
# 1. PUBLIC ROUTES (Zero Auth Needed)
# -------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {"status": "online", "brand": "BTY Fitness"}

@app.post("/api/consultations", status_code=status.HTTP_201_CREATED)
async def submit_consultation(lead: ConsultationLead, background_tasks: BackgroundTasks):
    """
    Public Endpoint: Lead capture form on the landing page / consultation page.
    Saves to MongoDB and fires an alert email task to Madison.
    """
    saved_lead = await save_lead(lead)
    
    # Send background email alert to jackharper0517@outlook.com
    background_tasks.add_task(notify_madison_of_lead, saved_lead)
    
    return {
        "success": True,
        "message": "Consultation request received! Madison will reach out shortly."
    }


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
    # 1. Save document to MongoDB
    saved_booking = await save_booking(booking)
    
    # 2. Add metadata for email alert
    saved_booking["client_type"] = "Registered Client" if user else "Guest"
    saved_booking["target_email"] = "jackharper0517@outlook.com"

    # 3. Fire background task
    background_tasks.add_task(notify_madison_of_lead, saved_booking)
    
    return {
        "success": True,
        "booking_id": saved_booking["_id"],
        "message": "Booking received and saved! Confirmation email queued for Madison.",
        "client_type": saved_booking["client_type"]
    }

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
async def get_consultation_leads():
    leads = await fetch_all_leads()
    return leads

@app.patch("/api/admin/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, status_data: StatusUpdate):
    """Update a lead's status (pending, contacted, confirmed)."""
    try:
        # Convert string ID to MongoDB ObjectId
        object_id = ObjectId(lead_id)
        
        # Update document in MongoDB collection
        result = await leads_collection.update_one(
            {"_id": object_id},
            {"$set": {"status": status_data.status}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")

        return {"status": "success", "updated_status": status_data.status}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid lead ID or update failed: {str(e)}")