import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from app.database.session import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"

class CameraStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"

class JobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class VerificationState(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    VERIFIED = "VERIFIED"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class WorkflowStatus(str, enum.Enum):
    DETECTED = "DETECTED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    VERIFIED = "VERIFIED"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    RESPONSE_REQUESTED = "RESPONSE_REQUESTED"
    RESPONSE_ACKNOWLEDGED = "RESPONSE_ACKNOWLEDGED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"
    ESCALATED = "ESCALATED"

class DeliveryState(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    SIMULATED = "simulated"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.OPERATOR.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    incidents_assigned = relationship("Incident", back_populates="assigned_operator")

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    stream_url = Column(String(500), nullable=True)
    status = Column(String(50), default=CameraStatus.ONLINE.value, nullable=False)
    source_type = Column(String(50), default="cctv_feed", nullable=False)
    fps = Column(Float, default=30.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    incidents = relationship("Incident", back_populates="camera")

class VideoJob(Base):
    __tablename__ = "video_jobs"

    id = Column(String(64), primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    status = Column(String(50), default=JobStatus.PENDING.value, nullable=False)
    progress = Column(Float, default=0.0, nullable=False)
    model_version = Column(String(50), default="yolo-v8n-roadguard-v1", nullable=False)
    total_frames = Column(Integer, default=0, nullable=False)
    processed_frames = Column(Integer, default=0, nullable=False)
    fps = Column(Float, default=30.0, nullable=False)
    error_message = Column(Text, nullable=True)
    candidates_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    incidents = relationship("Incident", back_populates="video_job")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(64), primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=True)
    video_job_id = Column(String(64), ForeignKey("video_jobs.id"), nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_description = Column(String(255), nullable=True)
    
    candidate_score = Column(Float, nullable=False)  # 0.0 to 1.0 heuristic score
    severity = Column(String(20), default=SeverityLevel.MEDIUM.value, nullable=False)
    verification_state = Column(String(50), default=VerificationState.UNVERIFIED.value, nullable=False)
    workflow_status = Column(String(50), default=WorkflowStatus.DETECTED.value, nullable=False)
    
    assigned_operator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    description = Column(Text, nullable=True)
    operator_notes = Column(Text, nullable=True)
    
    # AI Breakdown signals
    vehicle_types = Column(JSON, default=list)  # ["car", "truck"]
    collision_signals = Column(JSON, default=dict)  # {"motion_deceleration": true, "iou_overlap": 0.42}
    missing_signals = Column(JSON, default=list)
    model_version = Column(String(50), default="yolo-v8n-roadguard-v1", nullable=False)
    
    # Safe demo tagging
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    camera = relationship("Camera", back_populates="incidents")
    video_job = relationship("VideoJob", back_populates="incidents")
    assigned_operator = relationship("User", back_populates="incidents_assigned")
    evidence_items = relationship("Evidence", back_populates="incident", cascade="all, delete-orphan")
    response_actions = relationship("ResponseAction", back_populates="incident", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=False)
    evidence_type = Column(String(50), default="frame", nullable=False)  # frame, clip, telemetry
    file_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), default="image/jpeg", nullable=False)
    timestamp_offset_seconds = Column(Float, default=0.0, nullable=False)
    frame_number = Column(Integer, default=0, nullable=False)
    metadata_json = Column(JSON, default=dict)
    retention_policy = Column(String(50), default="30_days", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    incident = relationship("Incident", back_populates="evidence_items")

class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=False)
    action_type = Column(String(100), nullable=False)  # DISPATCH_EMS, NOTIFY_POLICE, ROAD_CLEARANCE, CONTACT_TOWING
    initiated_by = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default=DeliveryState.SIMULATED.value, nullable=False)
    provider_reference = Column(String(255), nullable=True)
    is_simulation = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    incident = relationship("Incident", back_populates="response_actions")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_name = Column(String(255), default="System", nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(64), nullable=False)
    change_summary = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default=SeverityLevel.MEDIUM.value, nullable=False)
    incident_id = Column(String(64), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    delivery_state = Column(String(50), default=DeliveryState.SIMULATED.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
