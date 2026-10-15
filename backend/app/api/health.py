from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "service": "RoadGuard AI Platform",
        "version": settings.VERSION,
        "database": db_status,
        "model_status": "loaded",
        "demo_mode": settings.DEMO_MODE,
        "emergency_dispatch": "simulated"
    }
