import os

from fastapi.testclient import TestClient

os.environ["ERRAGENT_BTY_SYNTHETIC_MUTATIONS_SAFE"] = "true"

from app import app  # noqa: E402  (env var must be set before app import side effects)

client = TestClient(app)

VALID_LEAD = {
    "name": "Fuzz Bot",
    "email": "fuzzbot@example.com",
    "program": "1-on-1 Private Coaching",
    "goals": "Synthetic test payload",
}


def test_capability_endpoint_reports_safety_flag():
    response = client.get("/api/synthetic/capabilities")
    assert response.status_code == 200
    body = response.json()
    assert body["synthetic_mutations_safe"] is True
    assert body["synthetic_header"] == "x-erragent-synthetic"
    assert "/api/consultations" in body["guarded_endpoints"]


def test_synthetic_consultation_skips_side_effects():
    response = client.post(
        "/api/consultations",
        json=VALID_LEAD,
        headers={"x-erragent-synthetic": "true", "x-erragent-correlation-id": "test-corr-1"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["synthetic"] is True
    assert body["correlation_id"] == "test-corr-1"


def test_synthetic_flag_does_not_bypass_validation():
    invalid_lead = {**VALID_LEAD, "email": "not-an-email"}
    response = client.post(
        "/api/consultations",
        json=invalid_lead,
        headers={"x-erragent-synthetic": "true"},
    )
    assert response.status_code == 422


def test_synthetic_header_rejected_when_flag_disabled(monkeypatch):
    monkeypatch.setenv("ERRAGENT_BTY_SYNTHETIC_MUTATIONS_SAFE", "false")
    response = client.post(
        "/api/consultations",
        json=VALID_LEAD,
        headers={"x-erragent-synthetic": "true"},
    )
    assert response.status_code == 403
