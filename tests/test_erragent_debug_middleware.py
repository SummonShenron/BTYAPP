import pytest
from fastapi.testclient import TestClient
from app import app

@pytest.fixture
def client():
    return TestClient(app)

def test_erragent_debug_endpoint_handled_by_global_exception_handler(client):
    response = client.get("/api/erragent-debug")
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data
    assert data["detail"] == "Internal Server Error"
