from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class LoginRequest(BaseModel):
    email: str
    password: str

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "operator"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Camera Schemas
class CameraBase(BaseModel):
    name: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    stream_url: Optional[str] = None
    status: str = "online"
    source_type: str = "cctv_feed"
    fps: float = 30.0

class CameraCreate(CameraBase):
    pass

class CameraResponse(CameraBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Evidence Schemas
class EvidenceResponse(BaseModel):
    id: int
    incident_id: str
    evidence_type: str
    file_path: str
    mime_type: str
    timestamp_offset_seconds: float
    frame_number: int
    metadata_json: Dict[str, Any]
    retention_policy: str
    created_at: datetime

    class Config:
        from_attributes = True

# Response Action Schemas
class ResponseActionCreate(BaseModel):
    action_type: str
    notes: Optional[str] = None
    is_simulation: bool = True

class ResponseActionResponse(BaseModel):
    id: int
    incident_id: str
    action_type: str
    initiated_by: str
    notes: Optional[str] = None
    status: str
    provider_reference: Optional[str] = None
    is_simulation: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Incident Schemas
class IncidentBase(BaseModel):
    camera_id: Optional[int] = None
    video_job_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_description: Optional[str] = None
    candidate_score: float
    severity: str = "MEDIUM"
    verification_state: str = "UNVERIFIED"
    workflow_status: str = "DETECTED"
    description: Optional[str] = None
    operator_notes: Optional[str] = None
    vehicle_types: List[str] = []
    collision_signals: Dict[str, Any] = {}
    missing_signals: List[str] = []
    model_version: str = "yolo-v8n-roadguard-v1"
    is_demo: bool = False

class IncidentCreate(IncidentBase):
    id: Optional[str] = None

class IncidentVerifyRequest(BaseModel):
    verification_state: str  # VERIFIED or FALSE_POSITIVE
    notes: Optional[str] = None

class IncidentStatusUpdateRequest(BaseModel):
    workflow_status: str
    notes: Optional[str] = None

class IncidentSeverityUpdateRequest(BaseModel):
    severity: str
    reason: str

class IncidentAssignRequest(BaseModel):
    operator_id: int
    notes: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: str
    timestamp: datetime
    assigned_operator_id: Optional[int] = None
    assigned_operator: Optional[UserResponse] = None
    camera: Optional[CameraResponse] = None
    evidence_items: List[EvidenceResponse] = []
    response_actions: List[ResponseActionResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Video Job Schemas
class VideoJobResponse(BaseModel):
    id: str
    filename: str
    file_path: str
    status: str
    progress: float
    model_version: str
    total_frames: int
    processed_frames: int
    fps: float
    error_message: Optional[str] = None
    candidates_count: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    incident_id: Optional[str] = None
    is_read: bool
    delivery_state: str
    created_at: datetime

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_name: str
    action: str
    entity_type: str
    entity_id: str
    change_summary: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class DashboardKPIs(BaseModel):
    total_candidates: int
    awaiting_review: int
    human_verified: int
    high_priority: int
    false_positive_count: int
    reviewed_sample_size: int
    false_positive_rate: float
    average_review_time_minutes: float
    system_status: str
    ai_inference_status: str
    db_status: str
    demo_mode_active: bool

class AnalyticsTrends(BaseModel):
    daily_incidents: List[Dict[str, Any]]
    severity_distribution: Dict[str, int]
    workflow_status_distribution: Dict[str, int]
    camera_incident_counts: List[Dict[str, Any]]
    detection_metrics: Dict[str, Any]
