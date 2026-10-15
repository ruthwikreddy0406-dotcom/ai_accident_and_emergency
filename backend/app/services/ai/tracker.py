import math
from typing import List, Dict, Any, Optional
from app.services.ai.detector import DetectedObject

class TrackedObject:
    def __init__(self, track_id: int, class_name: str, bbox: List[int], frame_idx: int, fps: float):
        self.track_id = track_id
        self.class_name = class_name
        self.bbox = bbox  # [x, y, w, h]
        self.fps = fps
        self.history: List[Dict[str, Any]] = []
        self.missed_frames = 0
        self.current_speed_px_per_sec = 0.0
        self.acceleration_px_per_sec2 = 0.0
        self.heading_degrees = 0.0
        self.update(bbox, frame_idx)

    @property
    def centroid(self) -> tuple[float, float]:
        x, y, w, h = self.bbox
        return (x + w / 2.0, y + h / 2.0)

    def update(self, bbox: List[int], frame_idx: int):
        self.bbox = bbox
        self.missed_frames = 0
        cx, cy = self.centroid

        prev_speed = self.current_speed_px_per_sec

        if self.history:
            prev_entry = self.history[-1]
            prev_cx, prev_cy = prev_entry["centroid"]
            dx = cx - prev_cx
            dy = cy - prev_cy
            frame_diff = max(1, frame_idx - prev_entry["frame_idx"])
            dt = frame_diff / self.fps if self.fps > 0 else 0.033

            dist_px = math.hypot(dx, dy)
            self.current_speed_px_per_sec = dist_px / dt
            self.acceleration_px_per_sec2 = (self.current_speed_px_per_sec - prev_speed) / dt
            self.heading_degrees = (math.degrees(math.atan2(dy, dx)) + 360) % 360
        else:
            self.current_speed_px_per_sec = 0.0
            self.acceleration_px_per_sec2 = 0.0
            self.heading_degrees = 0.0

        self.history.append({
            "frame_idx": frame_idx,
            "centroid": (cx, cy),
            "bbox": bbox,
            "speed_px_s": round(self.current_speed_px_per_sec, 2),
            "heading": round(self.heading_degrees, 1)
        })

        # Keep last 60 frames in memory
        if len(self.history) > 60:
            self.history.pop(0)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "track_id": self.track_id,
            "class_name": self.class_name,
            "bbox": self.bbox,
            "speed_image_space_px_s": round(self.current_speed_px_per_sec, 2),
            "acceleration_image_space_px_s2": round(self.acceleration_px_per_sec2, 2),
            "heading_degrees": round(self.heading_degrees, 1),
            "trajectory_points": [h["centroid"] for h in self.history[-15:]]
        }


class MultiObjectTracker:
    def __init__(self, max_missed_frames: int = 10, iou_match_threshold: float = 0.25):
        self.next_id = 1
        self.tracks: Dict[int, TrackedObject] = {}
        self.max_missed_frames = max_missed_frames
        self.iou_match_threshold = iou_match_threshold

    @staticmethod
    def calculate_iou(boxA: List[int], boxB: List[int]) -> float:
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[0] + boxA[2], boxB[0] + boxB[2])
        yB = min(boxA[1] + boxA[3], boxB[1] + boxB[3])

        interW = max(0, xB - xA)
        interH = max(0, yB - yA)
        interArea = interW * interH

        boxAArea = boxA[2] * boxA[3]
        boxBArea = boxB[2] * boxB[3]
        unionArea = float(boxAArea + boxBArea - interArea)

        if unionArea <= 0:
            return 0.0
        return interArea / unionArea

    def update(self, detections: List[DetectedObject], frame_idx: int, fps: float = 30.0) -> List[TrackedObject]:
        matched_tracks = set()
        matched_dets = set()

        # Step 1: Match existing tracks with detections via IoU and distance
        track_ids = list(self.tracks.keys())
        for t_id in track_ids:
            track = self.tracks[t_id]
            best_iou = 0.0
            best_det_idx = -1

            for d_idx, det in enumerate(detections):
                if d_idx in matched_dets:
                    continue
                iou = self.calculate_iou(track.bbox, det.bbox)
                if iou > best_iou:
                    best_iou = iou
                    best_det_idx = d_idx

            if best_iou >= self.iou_match_threshold and best_det_idx != -1:
                track.update(detections[best_det_idx].bbox, frame_idx)
                matched_tracks.add(t_id)
                matched_dets.add(best_det_idx)
            else:
                track.missed_frames += 1

        # Step 2: Remove dead tracks
        dead_ids = [t_id for t_id, t in self.tracks.items() if t.missed_frames > self.max_missed_frames]
        for t_id in dead_ids:
            del self.tracks[t_id]

        # Step 3: Create new tracks for unmatched detections
        for d_idx, det in enumerate(detections):
            if d_idx not in matched_dets:
                new_track = TrackedObject(self.next_id, det.class_name, det.bbox, frame_idx, fps)
                self.tracks[self.next_id] = new_track
                self.next_id += 1

        return list(self.tracks.values())
