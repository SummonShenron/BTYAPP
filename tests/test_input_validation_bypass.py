from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_request_validation_handler_malformed_string_input():
    response = client.post(
        "/api/consultations",
        json="'",
    )
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert data["detail"] == "Invalid input format"
