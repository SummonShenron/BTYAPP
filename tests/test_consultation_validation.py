import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

VALID_LEAD = {
    "name": "Test User",
    "email": "testuser@example.com",
    "program": "1-on-1 Private Coaching",
    "goals": "General fitness",
}

@pytest.mark.asyncio
@patch("app.save_lead", new_callable=AsyncMock)
async def test_submit_consultation_fails_when_lead_save_returns_none(mock_save_lead):
    mock_save_lead.return_value = None
    response = client.post("/api/consultations", json=VALID_LEAD)
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid consultation lead data."
