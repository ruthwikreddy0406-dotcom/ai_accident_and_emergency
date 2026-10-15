import os
import cv2
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import hash_password
from app.database.session import engine, Base, SessionLocal
from app.models.models import (
    User, Camera, VideoJob, Incident, Evidence, ResponseAction,
    AuditLog, Notification, VerificationState, WorkflowStatus,
    SeverityLevel, DeliveryState, JobStatus
)

def create_sample_evidence_image(incident_id: str, severity: str, score: float, text_label: str) -> str:
    """
    Generates a realistic synthetic CCTV road frame with visual bounding boxes,
    trajectories, and HUD alerts for demo evidence preview.
    """
    filename = f"evidence_{incident_id}_preview.jpg"
    filepath = settings.EVIDENCE_DIR / filename

    # Create dark asphalt road scene (640x360)
    img = np.zeros((360, 640, 3), dtype=np.uint8)
    img[:] = (35, 42, 49)  # Asphalt charcoal

    # Road lanes
    cv2.line(img, (0, 180), (640, 180), (70, 80, 90), 2)
    for x in range(30, 640, 60):
        cv2.line(img, (x, 180), (x + 30, 180), (200, 200, 200), 2)  # Dashed lane divider

    # Road curbs
    cv2.line(img, (0, 45), (640, 45), (100, 100, 100), 4)
    cv2.line(img, (0, 315), (640, 315), (100, 100, 100), 4)

    # Vehicle 1 (Sedan)
    box1 = [240, 140, 100, 65]
    cv2.rectangle(img, (box1[0], box1[1]), (box1[0] + box1[2], box1[1] + box1[3]), (0, 0, 240), 2)
    cv2.putText(img, "ID:1 Car 0px/s", (box1[0], box1[1] - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)

    # Vehicle 2 (Truck)
    box2 = [305, 130, 120, 85]
    cv2.rectangle(img, (box2[0], box2[1]), (box2[0] + box2[2], box2[1] + box2[3]), (0, 0, 240), 2)
    cv2.putText(img, "ID:2 Truck 0px/s", (box2[0], box2[1] - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)

    # Overlap / collision indicator circle
    cv2.circle(img, (315, 170), 35, (0, 140, 255), 2)

    # Trajectory skid line
    cv2.line(img, (120, 172), (240, 172), (0, 220, 255), 2)

    # Top CCTV telemetry HUD
    cv2.rectangle(img, (0, 0), (640, 32), (15, 23, 42), -1)
    hud = f"CAM-01 [LIVE] | {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | FPS: 29.97 | AI INFERENCE"
    cv2.putText(img, hud, (12, 21), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (226, 232, 240), 1)

    # Bottom Alert Banner
    cv2.rectangle(img, (15, 290), (625, 345), (15, 23, 42), -1)
    sev_color = (0, 0, 255) if severity == "HIGH" else (0, 165, 255)
    cv2.rectangle(img, (15, 290), (625, 345), sev_color, 2)
    alert_t = f"[!] INCIDENT CANDIDATE ({severity}) - CONFIDENCE: {int(score * 100)}%"
    cv2.putText(img, alert_t, (28, 315), cv2.FONT_HERSHEY_SIMPLEX, 0.50, sev_color, 2)
    cv2.putText(img, text_label, (28, 335), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (203, 213, 225), 1)

    cv2.imwrite(str(filepath), img)
    return filename

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if users already seeded
    if db.query(User).count() > 0:
        db.close()
        return

    print("[Seeder] Initializing RoadGuard AI database with demo data...")

    # 1. Seed Users
    admin_user = User(
        email="admin@roadguard.ai",
        full_name="Sarah Chen (Lead Supervisor)",
        hashed_password=hash_password("admin123"),
        role="admin",
        is_active=True
    )
    operator_user = User(
        email="operator@roadguard.ai",
        full_name="Marcus Vance (Triage Specialist)",
        hashed_password=hash_password("operator123"),
        role="operator",
        is_active=True
    )
    db.add_all([admin_user, operator_user])
    db.commit()

    # 2. Seed Cameras
    cameras = [
        Camera(
            name="CCTV-101 (Highway Junction)",
            location_name="Interstate 80 & Bay Bridge Interchange",
            latitude=37.7983,
            longitude=-122.3778,
            stream_url="rtsp://simulated-cctv/stream1",
            status="online",
            source_type="cctv_feed",
            fps=30.0
        ),
        Camera(
            name="CCTV-102 (Downtown Intersection)",
            location_name="Market St & 4th Ave Crossing",
            latitude=37.7858,
            longitude=-122.4065,
            stream_url="rtsp://simulated-cctv/stream2",
            status="online",
            source_type="cctv_feed",
            fps=30.0
        ),
        Camera(
            name="CCTV-103 (Tunnel Entrance)",
            location_name="Broadway Tunnel West Portal",
            latitude=37.7981,
            longitude=-122.4172,
            stream_url="rtsp://simulated-cctv/stream3",
            status="online",
            source_type="cctv_feed",
            fps=30.0
        ),
        Camera(
            name="CCTV-104 (Expressway South)",
            location_name="US-101 Southbound Exit 432",
            latitude=37.7510,
            longitude=-122.4035,
            stream_url="rtsp://simulated-cctv/stream4",
            status="online",
            source_type="cctv_feed",
            fps=30.0
        )
    ]
    db.add_all(cameras)
    db.commit()

    # 3. Seed Realistic Incidents across all required lifecycle states
    now = datetime.utcnow()

    # Incident A: HIGH Severity - Awaiting Review
    inc_a_id = "INC-A94F81B2"
    ev_a = create_sample_evidence_image(inc_a_id, "HIGH", 0.91, "Multi-vehicle collision: Sedan rear-ended by flatbed truck with 42px/s deceleration")
    inc_a = Incident(
        id=inc_a_id,
        camera_id=1,
        timestamp=now - timedelta(minutes=14),
        latitude=37.7983,
        longitude=-122.3778,
        location_description="Interstate 80 & Bay Bridge Interchange",
        candidate_score=0.91,
        severity="HIGH",
        verification_state="UNVERIFIED",
        workflow_status="NEEDS_REVIEW",
        assigned_operator_id=operator_user.id,
        description="High-velocity rear-end collision candidate. Bounding box contact detected with acute deceleration spike (-42 px/s2) and immediate immobilization.",
        operator_notes="Assigned for immediate operator review. Video evidence captured.",
        vehicle_types=["car", "truck"],
        collision_signals={
            "bbox_iou": 0.41,
            "normalized_proximity": 1.0,
            "deceleration_intensity": 0.94,
            "heading_deviation_degrees": 52.0,
            "post_impact_immobility": 0.92,
            "vulnerable_road_user": False
        },
        missing_signals=[],
        model_version="RoadGuard-VisualCV-v1",
        is_demo=True
    )
    db.add(inc_a)
    db.commit()

    db.add(Evidence(
        incident_id=inc_a_id,
        evidence_type="frame_snapshot",
        file_path=ev_a,
        mime_type="image/jpeg",
        timestamp_offset_seconds=8.4,
        frame_number=252,
        metadata_json={"detected_tracks": [1, 2], "impact_velocity": 42.0}
    ))

    # Incident B: MEDIUM Severity - Human Verified & Response Requested
    inc_b_id = "INC-B73E29C1"
    ev_b = create_sample_evidence_image(inc_b_id, "MEDIUM", 0.74, "Sideswipe collision between 2 passenger vehicles on Market St")
    inc_b = Incident(
        id=inc_b_id,
        camera_id=2,
        timestamp=now - timedelta(hours=1, minutes=20),
        latitude=37.7858,
        longitude=-122.4065,
        location_description="Market St & 4th Ave Crossing",
        candidate_score=0.74,
        severity="MEDIUM",
        verification_state="VERIFIED",
        workflow_status="RESPONSE_REQUESTED",
        assigned_operator_id=operator_user.id,
        description="Sideswipe collision during lane change. Vehicles came to a stop in middle lane.",
        operator_notes="Verified via camera footage. No visible flames. Notified road clearance unit.",
        vehicle_types=["car", "car"],
        collision_signals={
            "bbox_iou": 0.28,
            "normalized_proximity": 0.85,
            "deceleration_intensity": 0.68,
            "heading_deviation_degrees": 34.0,
            "post_impact_immobility": 0.88,
            "vulnerable_road_user": False
        },
        missing_signals=["vulnerable_road_user"],
        model_version="RoadGuard-VisualCV-v1",
        is_demo=True
    )
    db.add(inc_b)
    db.commit()

    db.add(Evidence(
        incident_id=inc_b_id,
        evidence_type="frame_snapshot",
        file_path=ev_b,
        mime_type="image/jpeg",
        timestamp_offset_seconds=12.1,
        frame_number=363,
        metadata_json={"detected_tracks": [3, 4], "impact_velocity": 24.5}
    ))

    db.add(ResponseAction(
        incident_id=inc_b_id,
        action_type="ROAD_CLEARANCE_DISPATCH",
        initiated_by="Marcus Vance (Operator)",
        notes="Simulated dispatch for incident clearance and safety cone deployment.",
        status=DeliveryState.SIMULATED.value,
        provider_reference="SIM-DISP-892110",
        is_simulation=True
    ))

    # Incident C: FALSE POSITIVE - Close Tailgate / Hard Braking
    inc_c_id = "INC-C10A98F4"
    ev_c = create_sample_evidence_image(inc_c_id, "LOW", 0.52, "False Positive: Hard braking near intersection stop line without impact")
    inc_c = Incident(
        id=inc_c_id,
        camera_id=3,
        timestamp=now - timedelta(hours=3, minutes=10),
        latitude=37.7981,
        longitude=-122.4172,
        location_description="Broadway Tunnel West Portal",
        candidate_score=0.52,
        severity="LOW",
        verification_state="FALSE_POSITIVE",
        workflow_status="FALSE_POSITIVE",
        assigned_operator_id=admin_user.id,
        description="Aggressive deceleration and close following distance flagged as potential rear-end candidate.",
        operator_notes="Reviewed: Vehicles stopped cleanly without physical contact. Flagged as false positive to improve model calibration.",
        vehicle_types=["car", "car"],
        collision_signals={
            "bbox_iou": 0.08,
            "normalized_proximity": 0.62,
            "deceleration_intensity": 0.72,
            "heading_deviation_degrees": 8.0,
            "post_impact_immobility": 0.40,
            "vulnerable_road_user": False
        },
        missing_signals=["physical_bbox_overlap", "abrupt_deflection"],
        model_version="RoadGuard-VisualCV-v1",
        is_demo=True
    )
    db.add(inc_c)
    db.commit()

    db.add(Evidence(
        incident_id=inc_c_id,
        evidence_type="frame_snapshot",
        file_path=ev_c,
        mime_type="image/jpeg",
        timestamp_offset_seconds=4.0,
        frame_number=120,
        metadata_json={"detected_tracks": [5, 6]}
    ))

    # Incident D: RESOLVED & CLOSED
    inc_d_id = "INC-D88B52E3"
    ev_d = create_sample_evidence_image(inc_d_id, "HIGH", 0.89, "Resolved: Vehicle spin-out on expressway resolved with tow team")
    inc_d = Incident(
        id=inc_d_id,
        camera_id=4,
        timestamp=now - timedelta(days=1, hours=2),
        latitude=37.7510,
        longitude=-122.4035,
        location_description="US-101 Southbound Exit 432",
        candidate_score=0.89,
        severity="HIGH",
        verification_state="VERIFIED",
        workflow_status="RESOLVED",
        assigned_operator_id=operator_user.id,
        description="Vehicle spun 180 degrees after hydroplaning into guard rail. Lane blocked for 22 minutes.",
        operator_notes="Tow team cleared vehicle at 14:35. Traffic flow resumed. Incident successfully resolved.",
        vehicle_types=["car"],
        collision_signals={
            "bbox_iou": 0.35,
            "normalized_proximity": 0.90,
            "deceleration_intensity": 0.88,
            "heading_deviation_degrees": 165.0,
            "post_impact_immobility": 0.95,
            "vulnerable_road_user": False
        },
        missing_signals=[],
        model_version="RoadGuard-VisualCV-v1",
        is_demo=True
    )
    db.add(inc_d)
    db.commit()

    db.add(Evidence(
        incident_id=inc_d_id,
        evidence_type="frame_snapshot",
        file_path=ev_d,
        mime_type="image/jpeg",
        timestamp_offset_seconds=15.0,
        frame_number=450,
        metadata_json={"detected_tracks": [7]}
    ))

    # Incident E: Location Unavailable Candidate (Testing Section 7 requirement: Never fabricate GPS coordinates)
    inc_e_id = "INC-E41C77F9"
    ev_e = create_sample_evidence_image(inc_e_id, "MEDIUM", 0.65, "Dashcam upload candidate - GPS Coordinates Unavailable")
    inc_e = Incident(
        id=inc_e_id,
        camera_id=None,
        timestamp=now - timedelta(hours=4),
        latitude=None,
        longitude=None,
        location_description=None,  # Location unavailable test
        candidate_score=0.65,
        severity="MEDIUM",
        verification_state="UNVERIFIED",
        workflow_status="DETECTED",
        description="Dashcam upload analysis: Near collision candidate during merging maneuver.",
        vehicle_types=["car", "motorcycle"],
        collision_signals={
            "bbox_iou": 0.18,
            "normalized_proximity": 0.75,
            "deceleration_intensity": 0.65,
            "heading_deviation_degrees": 38.0,
            "post_impact_immobility": 0.50,
            "vulnerable_road_user": True
        },
        missing_signals=["physical_bbox_overlap"],
        model_version="RoadGuard-VisualCV-v1",
        is_demo=True
    )
    db.add(inc_e)
    db.commit()

    # 4. Seed Notifications
    notifs = [
        Notification(
            title="Candidate Incident Detected (HIGH)",
            message="Candidate incident INC-A94F81B2 flagged on Interstate 80 & Bay Bridge Interchange.",
            severity="HIGH",
            incident_id=inc_a_id,
            is_read=False,
            delivery_state=DeliveryState.SIMULATED.value,
            created_at=now - timedelta(minutes=14)
        ),
        Notification(
            title="Incident Verified (MEDIUM)",
            message="Marcus Vance verified incident INC-B73E29C1 on Market St & 4th Ave Crossing.",
            severity="MEDIUM",
            incident_id=inc_b_id,
            is_read=True,
            delivery_state=DeliveryState.SIMULATED.value,
            created_at=now - timedelta(hours=1, minutes=10)
        ),
        Notification(
            title="Operator Review: False Positive Marked",
            message="Sarah Chen marked candidate INC-C10A98F4 as False Positive (Hard Braking / No Contact).",
            severity="LOW",
            incident_id=inc_c_id,
            is_read=True,
            delivery_state=DeliveryState.SIMULATED.value,
            created_at=now - timedelta(hours=3, minutes=5)
        )
    ]
    db.add_all(notifs)

    # 5. Seed Audit Logs
    audit_logs = [
        AuditLog(
            actor_id=admin_user.id,
            actor_name="Sarah Chen",
            action="SYSTEM_INIT",
            entity_type="SYSTEM",
            entity_id="ROADGUARD-SYS",
            change_summary="System initialized in production-grade demo mode with seeded camera network."
        ),
        AuditLog(
            actor_id=operator_user.id,
            actor_name="Marcus Vance",
            action="VERIFY_INCIDENT",
            entity_type="INCIDENT",
            entity_id=inc_b_id,
            change_summary="Operator verified collision candidate INC-B73E29C1 as valid crash."
        ),
        AuditLog(
            actor_id=operator_user.id,
            actor_name="Marcus Vance",
            action="DISPATCH_RESPONSE_SIMULATED",
            entity_type="INCIDENT",
            entity_id=inc_b_id,
            change_summary="Logged simulated road clearance assistance request."
        )
    ]
    db.add_all(audit_logs)
    db.commit()
    db.close()
    print("[Seeder] Successfully populated database with realistic demo scenarios!")
