# RoadGuard AI — Hackathon 5-Minute Demonstration Guide

## Overview
**RoadGuard AI** is an intelligent road safety and accident detection command center. It bridges computer vision collision candidate analysis with human-in-the-loop verification and coordinated emergency response dispatches.

---

## 5-Minute Demonstration Walkthrough

### Step 1: Open the Dashboard (0:00 - 0:45)
- Navigate to: **`http://localhost:5173/`**
- Observe the **Live Command Center**:
  - **KPI Cards**: Real-time counter of total candidate incidents, awaiting operator review, human verified crashes, and false-positive rates calculated exclusively on reviewed samples.
  - **Live Incident Detection Feed**: Dynamic stream of collision candidates flagged by the AI engine.
  - **Subsystem Status**: Health checks for FastAPI, Computer Vision Engine, and WebSocket telemetry.

### Step 2: Ingest Video or Trigger Live Simulation (0:45 - 1:45)
- Click **"Video Analysis Studio"** on the sidebar or top banner.
- You can upload an MP4/AVI dashcam video, or click **"Demo Highway Crash"** / **"Demo Intersection Crash"**.
- Watch the **background processing pipeline** update in real-time over WebSockets:
  - Frame sampling and extraction.
  - Multi-object detection (cars, trucks, motorcycles, pedestrians).
  - Trajectory tracking and velocity vectors.
  - Temporal collision heuristic evaluation.
  - Instant alert banner pops up when an incident candidate is detected.

### Step 3: Inspect Visual Evidence & Explainable AI Signals (1:45 - 2:45)
- Click **"Inspect"** on an incident (e.g. `INC-A94F81B2`).
- Inspect the **two-column dossier**:
  - **Visual HUD Frame Viewer**: Annotated snapshot with bounding boxes, speeds (image space), and collision alert banner.
  - **Multi-Signal Heuristic Breakdown**: Bounding box IoU overlap, acute deceleration spike, trajectory deviation angle, and post-impact immobilization.
  - **Missing Signals Transparency**: Honest explanation of why certain signals were absent.
  - **GIS Map**: Real coordinates on OpenStreetMap. Note that for records without GPS, it cleanly displays *"Location unavailable"* rather than fabricating coordinates.

### Step 4: Human-in-the-Loop Triage & Severity Override (2:45 - 3:30)
- Demonstrate that AI predictions are probabilistic aids, not proof.
- Click **"Confirm Accident"** (or **"Mark False Positive"**).
- Click **"Override Severity"** to adjust the triage priority (e.g., from MEDIUM to HIGH) with a mandatory justification note that persists in the immutable audit log.

### Step 5: Coordinated Emergency Response Dispatch (3:30 - 4:15)
- Open **"Response Coordination"** (`/response`).
- Select the verified incident and click **"Request Emergency Medical (EMS)"** or **"Deploy Road Clearance"**.
- View the **safety confirmation dialog**.
- Note the **Simulation Banner**: emphasizes that the platform operates in simulated sandbox mode to protect public 911 infrastructure.
- Advance the lifecycle to **"ACKNOWLEDGED"** and **"RESOLVED"**.

### Step 6: Empirical Analytics & Model Evaluation (4:15 - 5:00)
- Navigate to **"Analytics & Models"** (`/analytics`).
- Review the **Confusion Matrix** (True Positives, False Positives, Misses), Precision (PPV), Recall, and F1 Score calculated from verified ground truth records.
- Click **"Export CSV Dataset"** to download the authorized incident registry for external audit.
