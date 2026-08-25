from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from bson import ObjectId
import pytest

from app import app
from backend.utils.auth_utils import verify_admin

# Override verify_admin dependency to bypass authentication
app.dependency_overrides[verify_admin] = lambda: {"sub": "admin_user"}

client = TestClient(app)

def test_update_lead_status_success():
    # Mock the database and collection
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_db.__getitem__.return_value = mock_collection
    
    # Mock update_one to return a result with matched_count = 1
    mock_result = MagicMock()
    mock_result.matched_count = 1
    mock_collection.update_one.return_value = mock_result

    lead_id = str(ObjectId())

    with patch("backend.utils.db_utils.get_db", return_value=mock_db):
        response = client.patch(
            f"/api/admin/leads/{lead_id}/status",
            json={"status": "contacted"}
        )
        
    assert response.status_code == 200
    assert response.json() == {"status": "success", "updated_status": "contacted"}
    
    # Verify update_one was called with correct arguments
    mock_collection.update_one.assert_called_once_with(
        {"_id": ObjectId(lead_id)},
        {"$set": {"status": "contacted"}}
    )

def test_update_lead_status_not_found():
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_db.__getitem__.return_value = mock_collection
    
    # Mock update_one to return a result with matched_count = 0
    mock_result = MagicMock()
    mock_result.matched_count = 0
    mock_collection.update_one.return_value = mock_result

    lead_id = str(ObjectId())

    with patch("backend.utils.db_utils.get_db", return_value=mock_db):
        response = client.patch(
            f"/api/admin/leads/{lead_id}/status",
            json={"status": "confirmed"}
        )
        
    assert response.status_code == 400
    assert "Invalid lead ID or update failed" in response.json()["detail"]
