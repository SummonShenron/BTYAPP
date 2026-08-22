from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_consultation_rejects_malformed_email():
    payload = {
        "name": "Test User",
        "email": "'",
        "program": "1-on-1",
        "goals": "Checking malformed input"
    }
    response = client.post("/api/consultations", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert "Invalid email address format" in data["detail"]
