from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

def test_erragent_debug_endpoint_regression():
    # Mock test_connection to avoid DB connection attempts during startup/test
    with patch("app.test_connection", return_value=False), \
         patch("app.build_error_payload") as mock_build_payload, \
         patch("app.dispatch_erragent_ingest") as mock_dispatch:
        
        dummy_payload = {"error": "mocked_payload"}
        mock_build_payload.return_value = dummy_payload
        
        from app import app
        client = TestClient(app)
        response = client.get("/api/erragent-debug")
        
        assert response.status_code == 500
        assert response.json() == {"detail": "Intentionally triggered division by zero for debugging"}
        
        # Verify build_error_payload was called with correct arguments
        mock_build_payload.assert_called_once()
        _, kwargs = mock_build_payload.call_args
        assert isinstance(kwargs["exc"], ZeroDivisionError)
        assert kwargs["service_default"] == "btyapp"
        assert kwargs["source"] == "/api/erragent-debug"
        assert kwargs["method"] == "GET"
        assert kwargs["metadata"] is None
        
        # Verify dispatch_erragent_ingest was called with the built payload
        mock_dispatch.assert_called_once_with(dummy_payload)
