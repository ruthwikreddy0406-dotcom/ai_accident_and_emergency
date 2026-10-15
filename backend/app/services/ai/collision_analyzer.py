import math
from typing import List, Dict, Any, Optional, Tuple
from app.services.ai.tracker import TrackedObject, MultiObjectTracker
from app.core.config import settings

class CollisionCandidate:
    def __init__(
        self,
        frame_idx: int,
        timestamp_seconds: float,
        candidate_score: float,
        severity: str,
        involved_tracks: List[int],
        vehicle_types: List[str],
        collision_signals: Dict[str, Any],
        missing_signals: List[str],
        description: str
    ):
        self.frame_idx = frame_idx
        self.timestamp_seconds = timestamp_seconds
        self.candidate_score = candidate_score
        self.severity = severity
        self.involved_tracks = involved_tracks
        self.vehicle_types = vehicle_types
        self.collision_signals = collision_signals
        self.missing_signals = missing_signals
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "frame_idx": self.frame_idx,
            "timestamp_seconds": round(self.timestamp_seconds, 2),
            "candidate_score": round(self.candidate_score, 3),
            "severity": self.severity,
            "involved_tracks": self.involved_tracks,
            "vehicle_types": self.vehicle_types,
            "collision_signals": self.collision_signals,
            "missing_signals": self.missing_signals,
            "description": self.description
        }

class TemporalCollisionAnalyzer:
    """
    Temporal multi-frame collision analysis engine.
    Analyzes trajectories and dynamics across successive frames over a configurable time window.
    """
    def __init__(self, fps: float = 30.0):
        self.fps = fps
        self.history_window = settings.COLLISION_WINDOW_FRAMES
        self.recent_candidates: List[CollisionCandidate] = []
        self.cooldown_frames = int(fps * 3.0)  # Suppress duplicate collision triggers within 3 seconds
        self.last_candidate_frame = -9999

    def analyze_frame(self, tracks: List[TrackedObject], frame_idx: int) -> Optional[CollisionCandidate]:
        if len(tracks) < 2:
            return None

        # Check cooldown to avoid redundant duplicated alerts for the same physical collision event
        if frame_idx - self.last_candidate_frame < self.cooldown_frames:
            return None

        best_candidate: Optional[CollisionCandidate] = None
        highest_score = 0.0

        # Pairwise object interaction analysis
        for i in range(len(tracks)):
            for j in range(i + 1, len(tracks)):
                t1 = tracks[i]
                t2 = tracks[j]

                # We require at least 5 frames of history for temporal slope
                if len(t1.history) < 4 or len(t2.history) < 4:
                    continue

                candidate = self._evaluate_pair(t1, t2, frame_idx)
                if candidate and candidate.candidate_score > highest_score and candidate.candidate_score >= 0.40:
                    highest_score = candidate.candidate_score
                    best_candidate = candidate

        if best_candidate:
            self.last_candidate_frame = frame_idx
            self.recent_candidates.append(best_candidate)
            return best_candidate

        return None

    def _evaluate_pair(self, t1: TrackedObject, t2: TrackedObject, frame_idx: int) -> Optional[CollisionCandidate]:
        # Signal 1: Bounding-box overlap (IoU) or proximity
        iou = MultiObjectTracker.calculate_iou(t1.bbox, t2.bbox)
        c1 = t1.centroid
        c2 = t2.centroid
        dist_px = math.hypot(c1[0] - c2[0], c1[1] - c2[1])
        diag1 = math.hypot(t1.bbox[2], t1.bbox[3])
        diag2 = math.hypot(t2.bbox[2], t2.bbox[3])
        norm_dist = dist_px / max(1.0, (diag1 + diag2) / 2.0)

        # Proximity score (1.0 if overlapping, scales down with normalized distance)
        proximity_score = 1.0 if iou > 0.05 else max(0.0, 1.0 - (norm_dist / 1.4))

        if proximity_score < 0.35:
            return None

        # Signal 2: Sudden Deceleration Anomaly
        decel_score_1 = self._compute_deceleration_score(t1)
        decel_score_2 = self._compute_deceleration_score(t2)
        decel_score = max(decel_score_1, decel_score_2)

        # Signal 3: Abrupt Trajectory Heading Deviation
        heading_dev_1 = self._compute_heading_deviation(t1)
        heading_dev_2 = self._compute_heading_deviation(t2)
        heading_score = min(1.0, max(heading_dev_1, heading_dev_2) / 60.0)

        # Signal 4: Post-Impact Immobilization / Stillness
        immobility_score = self._compute_immobility_score(t1, t2)

        # Signal 5: Vulnerable Road User (VRU) factor (pedestrian or motorcycle involvement)
        vru_factor = 1.15 if ("pedestrian" in (t1.class_name, t2.class_name) or "motorcycle" in (t1.class_name, t2.class_name)) else 1.0

        # Weighted Evidence Fusion
        # Weights: Proximity 0.35, Deceleration 0.30, Heading Deviation 0.20, Immobilization 0.15
        raw_score = (
            (proximity_score * 0.35) +
            (decel_score * 0.30) +
            (heading_score * 0.20) +
            (immobility_score * 0.15)
        ) * vru_factor

        candidate_score = min(0.98, max(0.0, raw_score))

        # Check threshold
        if candidate_score < 0.40:
            return None

        # Determine explainable signals
        signals = {
            "bbox_iou": round(iou, 3),
            "normalized_proximity": round(proximity_score, 3),
            "deceleration_intensity": round(decel_score, 3),
            "heading_deviation_degrees": round(max(heading_dev_1, heading_dev_2), 1),
            "post_impact_immobility": round(immobility_score, 3),
            "vulnerable_road_user": bool(vru_factor > 1.0)
        }

        missing = []
        if iou < 0.05:
            missing.append("physical_bbox_overlap")
        if decel_score < 0.4:
            missing.append("severe_deceleration")
        if max(heading_dev_1, heading_dev_2) < 25.0:
            missing.append("abrupt_deflection")
        if immobility_score < 0.3:
            missing.append("post_collision_stoppage")

        # Severity categorization
        if candidate_score >= settings.SEVERITY_HIGH_SCORE or vru_factor > 1.0:
            severity = "HIGH"
        elif candidate_score >= settings.SEVERITY_MED_SCORE:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        classes = sorted(list({t1.class_name, t2.class_name}))
        desc = f"Suspected collision candidate between {t1.class_name} (ID #{t1.track_id}) and {t2.class_name} (ID #{t2.track_id}) with {severity} triage priority."

        return CollisionCandidate(
            frame_idx=frame_idx,
            timestamp_seconds=frame_idx / self.fps if self.fps > 0 else 0.0,
            candidate_score=candidate_score,
            severity=severity,
            involved_tracks=[t1.track_id, t2.track_id],
            vehicle_types=classes,
            collision_signals=signals,
            missing_signals=missing,
            description=desc
        )

    def _compute_deceleration_score(self, track: TrackedObject) -> float:
        if len(track.history) < 4:
            return 0.0
        speeds = [h["speed_px_s"] for h in track.history[-6:]]
        max_speed = max(speeds[:-1]) if len(speeds) > 1 else speeds[0]
        cur_speed = speeds[-1]
        if max_speed < 10.0:  # Object was already stationary
            return 0.0
        speed_drop = max(0.0, max_speed - cur_speed)
        ratio = speed_drop / max_speed
        return min(1.0, ratio * 1.2)

    def _compute_heading_deviation(self, track: TrackedObject) -> float:
        if len(track.history) < 4:
            return 0.0
        headings = [h["heading"] for h in track.history[-5:]]
        diffs = [abs(headings[k] - headings[k-1]) for k in range(1, len(headings))]
        # Handle 360 wrap-around
        normalized_diffs = [min(d, 360 - d) for d in diffs]
        return max(normalized_diffs) if normalized_diffs else 0.0

    def _compute_immobility_score(self, t1: TrackedObject, t2: TrackedObject) -> float:
        s1 = t1.current_speed_px_per_sec
        s2 = t2.current_speed_px_per_sec
        if s1 < 8.0 and s2 < 8.0:
            return 0.90
        elif s1 < 12.0 or s2 < 12.0:
            return 0.55
        return 0.10
