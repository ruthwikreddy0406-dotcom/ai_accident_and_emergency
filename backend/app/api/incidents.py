from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models.models import (
    Incident, Evidence, ResponseAction, AuditLog, Notification,
    User, VerificationState, WorkflowStatus, SeverityLevel, DeliveryState
)
from app.schemas.schemas import (
    IncidentResponse, IncidentVerifyRequest, IncidentStatusUpdateRequest,
    IncidentSeverityUpdateRequest, IncidentAssignRequest, ResponseActionCreate,
    ResponseActionResponse
)
from app.api.auth import get_current_user
from app.services.notifications.dispatcher import ws_manager

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    verification_state: Optional[str] = Query(None),
    camera_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Incident).options(
        joinedload(Incident.camera),
        joinedload(Incident.assigned_operator),
        joinedload(Incident.evidence_items),
        joinedload(Incident.response_actions)
    )

    if severity:
        query = query.filter(Incident.severity == severity.upper())
    if status:
        query = query.filter(Incident.workflow_status == status.upper())
    if verification_state:
        query = query.filter(Incident.verification_state == verification_state.upper())
    if camera_id:
        query = query.filter(Incident.camera_id == camera_id)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Incident.id.ilike(term)) |
            (Incident.description.ilike(term)) |
            (Incident.location_description.ilike(term))
        )

    incidents = query.order_by(Incident.timestamp.desc()).offset(offset).limit(limit).all()
    return [IncidentResponse.model_validate(inc) for inc in incidents]

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).options(
        joinedload(Incident.camera),
        joinedload(Incident.assigned_operator),
        joinedload(Incident.evidence_items),
        joinedload(Incident.response_actions)
    ).filter(Incident.id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse.model_validate(incident)

@router.post("/{incident_id}/verify", response_model=IncidentResponse)
async def verify_incident(
    incident_id: str,
    payload: IncidentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    target_state = payload.verification_state.upper()
    if target_state not in [VerificationState.VERIFIED.value, VerificationState.FALSE_POSITIVE.value]:
        raise HTTPException(status_code=400, detail="State must be VERIFIED or FALSE_POSITIVE")

    old_state = incident.verification_state
    incident.verification_state = target_state

    # Transition workflow status accordingly
    if target_state == VerificationState.VERIFIED.value:
        incident.workflow_status = WorkflowStatus.VERIFIED.value
    else:
        incident.workflow_status = WorkflowStatus.FALSE_POSITIVE.value

    if payload.notes:
        incident.operator_notes = (incident.operator_notes or "") + f"\n[{datetime.utcnow().strftime('%Y-%m-%d %H:%M')}] Verification: {payload.notes}"

    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        action="VERIFY_INCIDENT",
        entity_type="INCIDENT",
        entity_id=incident.id,
        change_summary=f"Changed verification state from {old_state} to {target_state}. Notes: {payload.notes or 'None'}"
    )
    db.add(audit)
    db.commit()
    db.refresh(incident)

    await ws_manager.broadcast("INCIDENT_VERIFIED", {
        "incident_id": incident.id,
        "verification_state": incident.verification_state,
        "workflow_status": incident.workflow_status,
        "operator": current_user.full_name
    })

    return IncidentResponse.model_validate(incident)

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_status(
    incident_id: str,
    payload: IncidentStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_status = incident.workflow_status
    new_status = payload.workflow_status.upper()
    incident.workflow_status = new_status

    if payload.notes:
        incident.operator_notes = (incident.operator_notes or "") + f"\n[{datetime.utcnow().strftime('%Y-%m-%d %H:%M')}] Status -> {new_status}: {payload.notes}"

    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        action="UPDATE_STATUS",
        entity_type="INCIDENT",
        entity_id=incident.id,
        change_summary=f"Workflow status moved from {old_status} to {new_status}. Notes: {payload.notes or 'None'}"
    )
    db.add(audit)
    db.commit()
    db.refresh(incident)

    await ws_manager.broadcast("STATUS_UPDATED", {
        "incident_id": incident.id,
        "new_status": new_status,
        "operator": current_user.full_name
    })

    return IncidentResponse.model_validate(incident)

@router.post("/{incident_id}/severity", response_model=IncidentResponse)
async def update_severity(
    incident_id: str,
    payload: IncidentSeverityUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_sev = incident.severity
    new_sev = payload.severity.upper()
    if new_sev not in [SeverityLevel.LOW.value, SeverityLevel.MEDIUM.value, SeverityLevel.HIGH.value]:
        raise HTTPException(status_code=400, detail="Invalid severity level")

    incident.severity = new_sev
    incident.operator_notes = (incident.operator_notes or "") + f"\n[{datetime.utcnow().strftime('%Y-%m-%d %H:%M')}] Severity override {old_sev}->{new_sev}. Reason: {payload.reason}"

    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        action="UPDATE_SEVERITY",
        entity_type="INCIDENT",
        entity_id=incident.id,
        change_summary=f"Manual severity override from {old_sev} to {new_sev}. Justification: {payload.reason}"
    )
    db.add(audit)
    db.commit()
    db.refresh(incident)

    return IncidentResponse.model_validate(incident)

@router.post("/{incident_id}/assign", response_model=IncidentResponse)
async def assign_operator(
    incident_id: str,
    payload: IncidentAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    target_op = db.query(User).filter(User.id == payload.operator_id).first()
    if not target_op:
        raise HTTPException(status_code=404, detail="Operator user not found")

    incident.assigned_operator_id = target_op.id
    if incident.workflow_status == WorkflowStatus.DETECTED.value:
        incident.workflow_status = WorkflowStatus.NEEDS_REVIEW.value

    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        action="ASSIGN_OPERATOR",
        entity_type="INCIDENT",
        entity_id=incident.id,
        change_summary=f"Incident assigned to operator {target_op.full_name} ({target_op.email})"
    )
    db.add(audit)
    db.commit()
    db.refresh(incident)

    return IncidentResponse.model_validate(incident)

@router.post("/{incident_id}/response-actions", response_model=ResponseActionResponse)
async def create_response_action(
    incident_id: str,
    payload: ResponseActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Safety guarantee: Never place real 911/emergency calls in demo mode
    # Record as a clearly tagged simulated or mock dispatch
    action = ResponseAction(
        incident_id=incident.id,
        action_type=payload.action_type,
        initiated_by=current_user.full_name,
        notes=payload.notes,
        status=DeliveryState.SIMULATED.value,
        provider_reference=f"SIM-DISPATCH-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        is_simulation=True
    )
    db.add(action)

    # Transition workflow status to RESPONSE_REQUESTED
    incident.workflow_status = WorkflowStatus.RESPONSE_REQUESTED.value

    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        action="DISPATCH_RESPONSE_SIMULATED",
        entity_type="INCIDENT",
        entity_id=incident.id,
        change_summary=f"Dispatched simulated emergency action: {payload.action_type}. Notes: {payload.notes or 'None'}"
    )
    db.add(audit)
    db.commit()
    db.refresh(action)

    await ws_manager.broadcast("RESPONSE_ACTION_LOGGED", {
        "incident_id": incident.id,
        "action_type": action.action_type,
        "initiated_by": action.initiated_by,
        "is_simulation": True
    })

    return ResponseActionResponse.model_validate(action)
