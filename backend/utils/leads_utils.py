# backend/utils/leads_utils.py
import logging
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from backend.utils.db_utils import get_db

logger = logging.getLogger("BTY Logger")


# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------

class ConsultationLead(BaseModel):
    name: str = Field(..., alias="full_name")
    email: EmailStr
    phone: Optional[str] = None
    program: Optional[str] = Field("1-on-1 Private Coaching", alias="coaching_preference")
    goals: Optional[str] = Field(None, alias="primary_goal")
    message: Optional[str] = None

    class Config:
        populate_by_name = True


class AppointmentBooking(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    session_type: Optional[str] = "1-on-1 Personal Training"
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = "morning"
    preferred_slot_start: Optional[str] = None
    preferred_slot_end: Optional[str] = None
    preferred_slot_label: Optional[str] = None
    timezone: Optional[str] = "America/Chicago"
    notes: Optional[str] = ""


# -------------------------------------------------------------
# MONGO DB STORAGE HELPERS
# -------------------------------------------------------------

async def save_lead(lead: ConsultationLead) -> dict:
    """Inserts a new consultation lead into the MongoDB 'leads' collection."""
    logger.info("save_lead called for email=%s", lead.email)
    db = get_db()
    lead_doc = lead.model_dump() if hasattr(lead, "model_dump") else lead.dict()
    lead_doc["type"] = "consultation"
    lead_doc["status"] = "New"
    lead_doc["created_at"] = datetime.utcnow()

    if db is not None:
        result = db["leads"].insert_one(lead_doc)
        lead_doc["_id"] = str(result.inserted_id)
        logger.info("Lead inserted into MongoDB with id=%s", lead_doc["_id"])
    else:
        # Fallback if local testing without active DB
        lead_doc["_id"] = "mock_lead_123"
        logger.info("Lead saved in mock mode with id=%s", lead_doc["_id"])

    return lead_doc


async def save_booking(booking: AppointmentBooking) -> dict:
    """Inserts a new appointment booking into the MongoDB 'bookings' collection."""
    logger.info("save_booking called for email=%s session_type=%s", booking.email, booking.session_type)
    db = get_db()
    booking_doc = booking.model_dump() if hasattr(booking, "model_dump") else booking.dict()
    booking_doc["type"] = "booking"
    booking_doc["status"] = "Pending"
    booking_doc["created_at"] = datetime.utcnow()

    if db is not None:
        result = db["bookings"].insert_one(booking_doc)
        booking_doc["_id"] = str(result.inserted_id)
        logger.info("Booking inserted into MongoDB with id=%s", booking_doc["_id"])
    else:
        # Fallback if local testing without active DB
        booking_doc["_id"] = "mock_booking_123"
        logger.info("Booking saved in mock mode with id=%s", booking_doc["_id"])

    return booking_doc


async def fetch_all_leads() -> List[dict]:
    """Retrieves all consultation leads from MongoDB for Madison's dashboard."""
    logger.info("fetch_all_leads called")
    db = get_db()
    if db is None:
        logger.info("fetch_all_leads returning empty list because DB is disabled")
        return []

    # Fetch leads sorted by newest first
    leads = list(db["leads"].find().sort("created_at", -1))
    
    # Convert BSON ObjectId & datetime to JSON serializable formats
    for lead in leads:
        lead["_id"] = str(lead["_id"])
        if isinstance(lead.get("created_at"), datetime):
            lead["created_at"] = lead["created_at"].isoformat()

            logger.info("fetch_all_leads returning count=%s", len(leads))

    return leads