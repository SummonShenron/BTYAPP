import os
os.environ["ERRAGENT_BTY_SYNTHETIC_MUTATIONS_SAFE"] = "true"

from fastapi.testclient import TestClient
from app import app
from backend.utils.leads_utils import AppointmentBooking

client = TestClient(app)

def test_booking_email_validation_synthetic():
    # Construct a valid payload dynamically based on AppointmentBooking fields
    payload = {}
    
    def get_default_value(field):
        if hasattr(field, "annotation"):
            ann = field.annotation
            if ann == str:
                return "test"
            if ann == int:
                return 1
            # Handle Optional or Union types in annotation
            ann_str = str(ann)
            if "str" in ann_str:
                return "test"
            if "int" in ann_str:
                return 1
            return "test"
        if hasattr(field, "type_"):
            t = field.type_
            if t == str:
                return "test"
            if t == int:
                return 1
            try:
                if isinstance(t, type) and issubclass(t, str):
                    return "test"
                if isinstance(t, type) and issubclass(t, int):
                    return 1
            except TypeError:
                pass
        return "test"

    if hasattr(AppointmentBooking, "model_fields"):
        # Pydantic v2
        for name, field in AppointmentBooking.model_fields.items():
            if field.is_required():
                payload[name] = get_default_value(field)
    elif hasattr(AppointmentBooking, "__fields__"):
        # Pydantic v1
        for name, field in AppointmentBooking.__fields__.items():
            if field.required:
                payload[name] = get_default_value(field)
    else:
        # Fallback
        payload = {
            "name": "Test User",
            "program": "1-on-1 Private Coaching",
            "goals": "Synthetic test payload",
        }

    # Ensure required fields for the endpoint are set correctly
    payload["email"] = "test@example.com"
    payload["session_type"] = "Personal Training"

    # 1. Test with a valid email and synthetic header -> should succeed (201)
    response = client.post(
        "/api/bookings",
        json=payload,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "test-corr-booking-1"},
    )
    assert response.status_code == 201, f"Expected 201, got {response.status_code} with body {response.text}"
    body = response.json()
    assert body["synthetic"] is True
    assert body["success"] is True

    # 2. Test with an invalid email (e.g. single quote) and synthetic header -> should be rejected with 422
    invalid_payload = dict(payload)
    invalid_payload["email"] = "'"
    response = client.post(
        "/api/bookings",
        json=invalid_payload,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "test-corr-booking-2"},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email address format"

    # 3. Test with another invalid email (missing dot) and synthetic header -> should be rejected with 422
    invalid_payload2 = dict(payload)
    invalid_payload2["email"] = "test@example"
    response = client.post(
        "/api/bookings",
        json=invalid_payload2,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "test-corr-booking-3"},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email address format"

    # 4. Test with another invalid email (missing @) and synthetic header -> should be rejected with 422
    invalid_payload3 = dict(payload)
    invalid_payload3["email"] = "test.example.com"
    response = client.post(
        "/api/bookings",
        json=invalid_payload3,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "test-corr-booking-4"},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email address format"

    # 5. Test non-synthetic request with invalid email -> should also be rejected with 422
    response = client.post(
        "/api/bookings",
        json=invalid_payload,
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email address format"
