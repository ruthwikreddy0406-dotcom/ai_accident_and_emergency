import cv2
import uuid
import asyncio
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import SessionLocal
from app.models.models import VideoJob, Incident, Evidence, Notification, JobStatus, DeliveryState
from app.services.ai.detector import ObjectDetector
from app.services.ai.tracker import MultiObjectTracker
from app.services.ai.collision_analyzer import TemporalCollisionAnalyzer
from app.services.ai.evidence_extractor import EvidenceExtractor
from app.services.notifications.dispatcher import ws_manager

async def process_video_background(job_id: str, file_path: str, camera_id: int = None):
    """
    Asynchronous background video processing pipeline.
    Runs frame extraction, object detection, multi-object tracking,
    temporal collision analysis, and evidence persistence.
    """
    db: Session = SessionLocal()
    try:
        job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
        if not job:
            return

        job.status = JobStatus.PROCESSING.value
        job.progress = 5.0
        db.commit()

        await ws_manager.broadcast("JOB_UPDATED", {
            "job_id": job_id,
            "status": job.status,
            "progress": job.progress
        })

        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            job.status = JobStatus.FAILED.value
            job.error_message = f"Failed to open video file at {file_path}. Unsupported codec or corrupted stream."
            db.commit()
            await ws_manager.broadcast("JOB_FAILED", {"job_id": job_id, "error": job.error_message})
            return

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0 or fps > 120:
            fps = 30.0

        job.total_frames = total_frames
        job.fps = fps
        db.commit()

        detector = ObjectDetector()
        tracker = MultiObjectTracker(max_missed_frames=12, iou_match_threshold=settings.COLLISION_IOU_THRESHOLD)
        analyzer = TemporalCollisionAnalyzer(fps=fps)

        frame_idx = 0
        step = 2  # Sample every 2nd frame for optimal performance while maintaining temporal continuity
        detected_candidates = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            if frame_idx % step != 0:
                continue

            # Step 1: Detect road objects
            detections = detector.detect_frame(frame, frame_idx)

            # Step 2: Track objects across frames
            tracks = tracker.update(detections, frame_idx, fps)

            # Step 3: Analyze motion and interactions over temporal window
            candidate = analyzer.analyze_frame(tracks, frame_idx)

            if candidate:
                detected_candidates += 1
                incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"

                # Generate annotated evidence snapshot
                annotated = EvidenceExtractor.annotate_frame(frame, tracks, candidate, frame_idx)
                evidence_file = EvidenceExtractor.save_evidence_frame(
                    incident_id, annotated, frame_idx, candidate.timestamp_seconds
                )

                # Persist Incident
                new_incident = Incident(
                    id=incident_id,
                    camera_id=camera_id,
                    video_job_id=job_id,
                    timestamp=datetime.utcnow(),
                    candidate_score=candidate.candidate_score,
                    severity=candidate.severity,
                    verification_state="UNVERIFIED",
                    workflow_status="DETECTED",
                    description=candidate.description,
                    vehicle_types=candidate.vehicle_types,
                    collision_signals=candidate.collision_signals,
                    missing_signals=candidate.missing_signals,
                    model_version=detector.model_name,
                    is_demo=False
                )
                db.add(new_incident)

                # Persist Evidence
                evidence_item = Evidence(
                    incident_id=incident_id,
                    evidence_type="frame_snapshot",
                    file_path=evidence_file,
                    mime_type="image/jpeg",
                    timestamp_offset_seconds=candidate.timestamp_seconds,
                    frame_number=frame_idx,
                    metadata_json=candidate.to_dict()
                )
                db.add(evidence_item)

                # Persist In-app Notification
                notif = Notification(
                    title=f"Potential Accident Candidate ({candidate.severity})",
                    message=f"Candidate incident {incident_id} flagged: {candidate.description}",
                    severity=candidate.severity,
                    incident_id=incident_id,
                    delivery_state=DeliveryState.SIMULATED.value
                )
                db.add(notif)
                db.commit()

                # Broadcast new incident to active dashboards via WebSocket
                await ws_manager.broadcast("INCIDENT_DETECTED", {
                    "incident_id": incident_id,
                    "severity": candidate.severity,
                    "candidate_score": candidate.candidate_score,
                    "description": candidate.description,
                    "timestamp": datetime.utcnow().isoformat(),
                    "evidence_file": evidence_file
                })

            # Periodically update progress every 15 sampled frames
            if frame_idx % 15 == 0 and total_frames > 0:
                prog = min(98.0, (frame_idx / total_frames) * 100.0)
                job.progress = round(prog, 1)
                job.processed_frames = frame_idx
                job.candidates_count = detected_candidates
                db.commit()
                await ws_manager.broadcast("JOB_PROGRESS", {
                    "job_id": job_id,
                    "progress": job.progress,
                    "processed_frames": frame_idx,
                    "candidates_count": detected_candidates
                })
                # Yield to asyncio event loop
                await asyncio.sleep(0.001)

        cap.release()

        # Job Completed
        job.status = JobStatus.COMPLETED.value
        job.progress = 100.0
        job.processed_frames = frame_idx
        job.candidates_count = detected_candidates
        job.completed_at = datetime.utcnow()
        db.commit()

        await ws_manager.broadcast("JOB_COMPLETED", {
            "job_id": job_id,
            "candidates_count": detected_candidates,
            "processed_frames": frame_idx
        })

    except Exception as e:
        print(f"[VideoProcessing] Error in job {job_id}: {e}")
        try:
            job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
            if job:
                job.status = JobStatus.FAILED.value
                job.error_message = str(e)
                db.commit()
                await ws_manager.broadcast("JOB_FAILED", {"job_id": job_id, "error": str(e)})
        except Exception:
            pass
    finally:
        db.close()
