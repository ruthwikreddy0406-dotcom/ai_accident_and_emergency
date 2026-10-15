import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("/{filename}")
def get_evidence_file(filename: str):
    # Prevent path traversal attacks
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename identifier")

    file_path = (settings.EVIDENCE_DIR / filename).resolve()
    # Ensure resolved path is within evidence directory
    if not str(file_path).startswith(str(settings.EVIDENCE_DIR.resolve())):
        raise HTTPException(status_code=403, detail="Access denied to requested file")

    if not file_path.exists():
        # Fallback to demo placeholder frame if evidence file not generated yet
        raise HTTPException(status_code=404, detail="Evidence frame not found")

    return FileResponse(path=str(file_path), media_type="image/jpeg")
