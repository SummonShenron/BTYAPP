import os
os.environ["ERRAGENT_BTY_SYNTHETIC_MUTATIONS_SAFE"] = "true"

import pytest
from fastapi.testclient import TestClient
from app import app
from backend.utils.leads_utils import AppointmentBooking

client = TestClient(app)

def test_booking_email_validation_regression():
    # Construct a valid payload dynamically based on AppointmentBooking fields
    payload = {}
    
    def get_default_value(field):
        if hasattr(field, "annotation"):
            ann = field.annotation
            if ann == str:
                return "test"
            if ann == int:
                return 1
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
        for name, field in AppointmentBooking.model_fields.items():
            if field.is_required():
                payload[name] = get_default_value(field)
    elif hasattr(AppointmentBooking, "__fields__"):
        for name, field in AppointmentBooking.__fields__.items():
            if field.required:
                payload[name] = get_default_value(field)
    else:
        payload = {
            "name": "Test User",
            "program": "1-on-1 Private Coaching",
            "goals": "Synthetic test payload",
        }

    payload["session_type"] = "Personal Training"

    # 1. Test invalid email with single quote (the exact incident trigger)
    invalid_payload = dict(payload)
    invalid_payload["email"] = "test@example.com'"
    response = client.post(
        "/api/bookings",
        json=invalid_payload,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "regression-corr-1"},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email address format"

    # 2. Test invalid email with just a single quote
    invalid_payload_quote = dict(payload)
    invalid_payload_quote["email"] = "'"
    response = client.post(
        "/api/bookings",
        json=invalid_payload_quote,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "regression-corr-2"},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email address format"

    # 3. Test valid email format
    valid_payload = dict(payload)
    valid_payload["email"] = "valid.user+testing@example-domain.com"
    response = client.post(
        "/api/bookings",
        json=valid_payload,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "regression-corr-3"},
    )
    assert response.status_code == 201
    assert response.json()["success"] is True
