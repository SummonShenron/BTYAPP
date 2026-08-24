import os
os.environ["ERRAGENT_BTY_SYNTHETIC_MUTATIONS_SAFE"] = "true"

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_consultation_email_validation_with_re():
    # 1. Test with a valid email format. This triggers re.match and should succeed (201) under synthetic mode.
    valid_payload = {
        "name": "Test User",
        "email": "test@example.com",
        "program": "1-on-1 Private Coaching",
        "goals": "Get fit",
    }
    response = client.post(
        "/api/consultations",
        json=valid_payload,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "test-re-1"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["synthetic"] is True

    # 2. Test with an invalid email format (double dots). This triggers re.match and should return 422.
    invalid_payload = {
        "name": "Test User",
        "email": "test@domain..com",
        "program": "1-on-1 Private Coaching",
        "goals": "Get fit",
    }
    response = client.post(
        "/api/consultations",
        json=invalid_payload,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "test-re-2"},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid email address format"
