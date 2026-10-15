import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "uploads"
EVIDENCE_DIR = BASE_DIR / "evidence"

STORAGE_DIR.mkdir(parents=True, exist_ok=True)
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "RoadGuard AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "roadguard-super-secret-key-production-grade-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/roadguard.db")
    
    # Storage & Upload limits
    UPLOAD_DIR: Path = STORAGE_DIR
    EVIDENCE_DIR: Path = EVIDENCE_DIR
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "150"))
    
    # Model & Inference settings
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/yolov8n.pt")
    DETECTION_CONFIDENCE: float = float(os.getenv("DETECTION_CONFIDENCE", "0.40"))
    COLLISION_IOU_THRESHOLD: float = float(os.getenv("COLLISION_IOU_THRESHOLD", "0.25"))
    COLLISION_DECEL_THRESHOLD: float = float(os.getenv("COLLISION_DECEL_THRESHOLD", "22.0"))
    COLLISION_WINDOW_FRAMES: int = int(os.getenv("COLLISION_WINDOW_FRAMES", "15"))
    
    # Severity thresholds
    SEVERITY_HIGH_SCORE: float = 0.75
    SEVERITY_MED_SCORE: float = 0.50
    
    # Demo & Simulation
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    SIMULATE_EMERGENCY_DISPATCH: bool = True
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

settings = Settings()
