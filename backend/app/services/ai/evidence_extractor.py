import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.ai.tracker import TrackedObject
from app.services.ai.collision_analyzer import CollisionCandidate

class EvidenceExtractor:
    @staticmethod
    def annotate_frame(
        frame: np.ndarray,
        tracks: List[TrackedObject],
        candidate: Optional[CollisionCandidate] = None,
        frame_idx: int = 0
    ) -> np.ndarray:
        """
        Draw rich bounding boxes, tracking labels, velocities, trajectory trails,
        and high-visibility collision alerts on the frame.
        """
        annotated = frame.copy()
        h, w = annotated.shape[:2]

        # Draw trajectory trails
        for track in tracks:
            pts = [h_entry["centroid"] for h_entry in track.history[-15:]]
            for p1, p2 in zip(pts[:-1], pts[1:]):
                pt1 = (int(p1[0]), int(p1[1]))
                pt2 = (int(p2[0]), int(p2[1]))
                cv2.line(annotated, pt1, pt2, (0, 200, 255), 2)

        # Draw bounding boxes and metadata
        for track in tracks:
            x, y, bw, bh = track.bbox
            is_involved = candidate and track.track_id in candidate.involved_tracks

            color = (0, 0, 255) if is_involved else (0, 255, 128)
            thickness = 3 if is_involved else 2
            cv2.rectangle(annotated, (x, y), (x + bw, y + bh), color, thickness)

            # Label box
            label = f"ID:{track.track_id} {track.class_name} {int(track.current_speed_px_per_sec)}px/s"
            (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            cv2.rectangle(annotated, (x, y - th - 6), (x + tw + 6, y), color, -1)
            cv2.putText(annotated, label, (x + 3, y - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1, cv2.LINE_AA)

        # Draw Top HUD
        cv2.rectangle(annotated, (0, 0), (w, 36), (15, 23, 42), -1)
        hud_text = f"RoadGuard AI Engine | Frame: {frame_idx} | Tracked Objects: {len(tracks)}"
        cv2.putText(annotated, hud_text, (15, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (226, 232, 240), 1, cv2.LINE_AA)

        # If a candidate collision is present in this frame, draw prominent alert HUD
        if candidate:
            sev_color = (0, 0, 255) if candidate.severity == "HIGH" else (0, 140, 255)
            cv2.rectangle(annotated, (20, h - 85), (w - 20, h - 20), (15, 23, 42), -1)
            cv2.rectangle(annotated, (20, h - 85), (w - 20, h - 20), sev_color, 2)
            alert_title = f"[!] POTENTIAL COLLISION CANDIDATE -- SEVERITY: {candidate.severity} (Score: {int(candidate.candidate_score * 100)}%)"
            cv2.putText(annotated, alert_title, (35, h - 55), cv2.FONT_HERSHEY_SIMPLEX, 0.60, sev_color, 2, cv2.LINE_AA)
            alert_desc = f"Vehicles involved: #{', #'.join(map(str, candidate.involved_tracks))} | Confidence: {round(candidate.candidate_score, 2)} | Status: Needs Operator Verification"
            cv2.putText(annotated, alert_desc, (35, h - 32), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (203, 213, 225), 1, cv2.LINE_AA)

        return annotated

    @staticmethod
    def save_evidence_frame(
        incident_id: str,
        frame: np.ndarray,
        frame_idx: int,
        offset_seconds: float
    ) -> str:
        """
        Saves annotated image to the evidence folder and returns relative safe filename.
        """
        filename = f"evidence_{incident_id}_f{frame_idx}.jpg"
        full_path = settings.EVIDENCE_DIR / filename
        cv2.imwrite(str(full_path), frame)
        return filename
