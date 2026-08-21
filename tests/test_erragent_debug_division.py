from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_erragent_debug_division_by_zero_handled():
    response = client.get("/api/erragent-debug")
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert data["detail"] == "Division by zero is not allowed."
