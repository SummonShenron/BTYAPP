from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_submit_consultation_malformed_input_rejected():
    response = client.post(
        "/api/consultations",
        json={"name": "Bad Input", "email": "", "goals": "'"}
    )
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
