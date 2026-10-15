from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import Camera
from app.schemas.schemas import CameraResponse, CameraCreate

router = APIRouter(prefix="/cameras", tags=["Cameras"])

@router.get("", response_model=List[CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).order_by(Camera.id.asc()).all()
    return [CameraResponse.model_validate(c) for c in cameras]

@router.post("", response_model=CameraResponse)
def create_camera(payload: CameraCreate, db: Session = Depends(get_db)):
    cam = Camera(
        name=payload.name,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        stream_url=payload.stream_url,
        status=payload.status,
        source_type=payload.source_type,
        fps=payload.fps
    )
    db.add(cam)
    db.commit()
    db.refresh(cam)
    return CameraResponse.model_validate(cam)

@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: int, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return CameraResponse.model_validate(cam)
