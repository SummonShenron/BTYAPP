import os
import logging
from dotenv import load_dotenv

try:
    import resend
except ImportError:
    resend = None

load_dotenv()
logger = logging.getLogger("BTY Logger")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
COACH_EMAIL = "madspear9@gmail.com"
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "BTY Fitness <bty@sonicassistant.com>")

async def notify_madison_of_lead(lead_data: dict):
    """
    Triggers an email notification to Madison when a lead 
    submits a booking or consultation request.
    """
    try:
        # Normalize fields from both Consultation and Booking payloads
        name = lead_data.get("name") or lead_data.get("full_name", "N/A")
        email = lead_data.get("email", "N/A")
        phone = lead_data.get("phone", "N/A")
        service = (
            lead_data.get("session_type") 
            or lead_data.get("program") 
            or lead_data.get("coaching_preference") 
            or "General Consultation"
        )
        notes = (
            lead_data.get("notes") 
            or lead_data.get("message") 
            or lead_data.get("primary_goal") 
            or "None"
        )
        pref_date = lead_data.get("preferred_date", "N/A")
        pref_time = lead_data.get("preferred_time", "N/A")

        logger.info("Lead notification started: name=%s email=%s service=%s", name, email, service)

        # Dispatch real email if API key is set
        if RESEND_API_KEY and resend is not None:
            resend.api_key = RESEND_API_KEY
            
            email_body = f"""
            <h2>New BTY Lead Submitted</h2>
            <p><strong>Client Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Service / Program:</strong> {service}</p>
            <p><strong>Preferred Date / Time:</strong> {pref_date} ({pref_time})</p>
            <p><strong>Goals / Notes:</strong> {notes}</p>
            <hr />
            <p><em>Reply directly to this email or reach out to the client at {email}.</em></p>
            """

            resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": [COACH_EMAIL],
                "subject": f"New Lead: {name} ({service})",
                "html": email_body,
            })
            logger.info("Notification email sent from %s to %s", RESEND_FROM_EMAIL, COACH_EMAIL)
        elif RESEND_API_KEY and resend is None:
            logger.warning("RESEND_API_KEY is present but resend package is not installed; skipping email")
        else:
            logger.warning("RESEND_API_KEY missing in .env. Skipping email delivery.")

        return True

    except Exception as e:
        logger.error("Failed to send lead notification: %s", str(e))
        return False