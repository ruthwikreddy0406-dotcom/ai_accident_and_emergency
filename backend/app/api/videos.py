import os
import uuid
import shutil
import asyncio
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.models.models import VideoJob, Incident, Evidence, Notification, JobStatus, DeliveryState
from app.schemas.schemas import VideoJobResponse
from app.core.config import settings
from app.services.video_service import process_video_background
from app.services.notifications.dispatcher import ws_manager

router = APIRouter(prefix="/videos", tags=["Videos"])

ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}

@router.post("/upload", response_model=VideoJobResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    camera_id: int = Form(None),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video file format {ext}. Supported formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
    safe_filename = f"{job_id}_{file.filename}"
    file_path = settings.UPLOAD_DIR / safe_filename

    # Save uploaded bytes safely
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {str(e)}")

    # Check file size limit
    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        os.remove(file_path)
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Create job in database
    job = VideoJob(
        id=job_id,
        filename=file.filename,
        file_path=str(file_path),
        status=JobStatus.PENDING.value,
        progress=0.0,
        model_version="RoadGuard-VisualCV-v1",
        created_at=datetime.utcnow()
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Enqueue background processing
    background_tasks.add_task(process_video_background, job_id, str(file_path), camera_id)

    return VideoJobResponse.model_validate(job)

@router.post("/simulate-analysis", response_model=VideoJobResponse)
async def simulate_live_road_analysis(
    background_tasks: BackgroundTasks,
    scenario_type: str = Form("highway_rear_end"),
    db: Session = Depends(get_db)
):
    """
    Demonstration accelerator for hackathon evaluations:
    Creates a simulated live camera stream analysis job with realistic synthetic frames and candidate detection.
    """
    job_id = f"JOB-DEMO-{uuid.uuid4().hex[:6].upper()}"
    job = VideoJob(
        id=job_id,
        filename=f"synthetic_{scenario_type}_feed.mp4",
        file_path="synthetic_stream",
        status=JobStatus.PROCESSING.value,
        progress=10.0,
        model_version="RoadGuard-LiveSimulator-v1",
        total_frames=300,
        processed_frames=30,
        fps=30.0,
        created_at=datetime.utcnow()
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    async def run_simulation():
        for p in range(20, 101, 20):
            await asyncio.sleep(0.8)
            with Session(db.get_bind()) as sim_db:
                j = sim_db.query(VideoJob).filter(VideoJob.id == job_id).first()
                if j:
                    j.progress = float(p)
                    j.processed_frames = int((p / 100.0) * 300)
                    if p == 60:
                        # Trigger simulated incident
                        inc_id = f"INC-DEMO-{uuid.uuid4().hex[:6].upper()}"
                        j.candidates_count = 1
                        new_inc = Incident(
                            id=inc_id,
                            camera_id=1,
                            video_job_id=job_id,
                            timestamp=datetime.utcnow(),
                            latitude=37.7749,
                            longitude=-122.4194,
                            location_description="US-101 Northbound @ Mile 14.2",
                            candidate_score=0.88,
                            severity="HIGH",
                            verification_state="UNVERIFIED",
                            workflow_status="DETECTED",
                            description="Rapid deceleration (-34 px/s2) and 38% bbox overlap between SUV and Delivery Truck.",
                            vehicle_types=["car", "truck"],
                            collision_signals={
                                "bbox_iou": 0.38,
                                "deceleration_intensity": 0.85,
                                "heading_deviation_degrees": 42.5,
                                "post_impact_immobility": 0.92
                            },
                            missing_signals=[],
                            model_version="RoadGuard-LiveSimulator-v1",
                            is_demo=True
                        )
                        sim_db.add(new_inc)
                        notif = Notification(
                            title="Candidate Incident Detected (HIGH)",
                            message=f"Live feed flagged potential collision {inc_id} on US-101 Northbound.",
                            severity="HIGH",
                            incident_id=inc_id,
                            delivery_state=DeliveryState.SIMULATED.value
                        )
                        sim_db.add(notif)
                    if p == 100:
                        j.status = JobStatus.COMPLETED.value
                        j.completed_at = datetime.utcnow()
                    sim_db.commit()

            await ws_manager.broadcast("JOB_PROGRESS", {
                "job_id": job_id,
                "progress": float(p),
                "status": "completed" if p == 100 else "processing"
            })

    background_tasks.add_task(run_simulation)
    return VideoJobResponse.model_validate(job)
