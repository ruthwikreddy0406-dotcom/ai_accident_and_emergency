import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.services.ai.detector import ObjectDetector, DetectedObject
from app.services.ai.tracker import MultiObjectTracker
from app.services.ai.collision_analyzer import TemporalCollisionAnalyzer

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "RoadGuard AI Platform"
    assert data["database"] == "healthy"

def test_auth_login_and_me():
    # Login with seeded demo credentials
    res = client.post("/api/auth/login", json={"email": "operator@roadguard.ai", "password": "operator123"})
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Verify /me endpoint
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "operator@roadguard.ai"

def test_dashboard_kpis():
    response = client.get("/api/dashboard/kpis")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] >= 4
    assert data["system_status"] == "HEALTHY"
    assert "false_positive_rate" in data

def test_incidents_lifecycle():
    # Get incidents list
    res = client.get("/api/incidents")
    assert res.status_code == 200
    incidents = res.json()
    assert len(incidents) > 0

    first_id = incidents[0]["id"]

    # Verify incident
    verify_res = client.post(f"/api/incidents/{first_id}/verify", json={
        "verification_state": "VERIFIED",
        "notes": "Verified collision during test suite run."
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["verification_state"] == "VERIFIED"

    # Status update
    status_res = client.patch(f"/api/incidents/{first_id}/status", json={
        "workflow_status": "RESPONSE_ACKNOWLEDGED",
        "notes": "Units on scene."
    })
    assert status_res.status_code == 200
    assert status_res.json()["workflow_status"] == "RESPONSE_ACKNOWLEDGED"

    # Severity update
    sev_res = client.post(f"/api/incidents/{first_id}/severity", json={
        "severity": "HIGH",
        "reason": "Vulnerable road user identified on camera 2."
    })
    assert sev_res.status_code == 200
    assert sev_res.json()["severity"] == "HIGH"

    # Simulated response action dispatch
    disp_res = client.post(f"/api/incidents/{first_id}/response-actions", json={
        "action_type": "DISPATCH_EMS",
        "notes": "Paramedic dispatch requested via automated simulation.",
        "is_simulation": True
    })
    assert disp_res.status_code == 200
    assert disp_res.json()["is_simulation"] is True

def test_ai_pipeline_temporal_analysis():
    tracker = MultiObjectTracker()
    analyzer = TemporalCollisionAnalyzer(fps=30.0)

    triggered_candidate = None
    for idx in range(1, 22):
        x1 = min(150, 100 + idx * 3)
        x2 = max(152, 200 - idx * 3)
        d = [
            DetectedObject("car", 0.9, [x1, 100, 60, 40]),
            DetectedObject("truck", 0.88, [x2, 100, 70, 50])
        ]
        tracks = tracker.update(d, idx)
        candidate = analyzer.analyze_frame(tracks, idx)
        if candidate:
            triggered_candidate = candidate
            break

    assert triggered_candidate is not None
    assert triggered_candidate.candidate_score > 0.40
    assert "bbox_iou" in triggered_candidate.collision_signals
    assert triggered_candidate.severity in ["MEDIUM", "HIGH"]

def test_analytics_and_csv_export():
    res = client.get("/api/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert "detection_metrics" in data
    assert "precision" in data["detection_metrics"]

    # CSV Export
    csv_res = client.get("/api/analytics/export-csv")
    assert csv_res.status_code == 200
    assert "Incident ID,Timestamp,Location" in csv_res.text
