# TruthLens — AI Deepfake & Media Authenticity Detector

> **"Look Beyond What You See."**  
> An explainable, multi-spectral media authenticity inspection platform built for university hackathon competition.

---

## 🌟 Executive Overview

**TruthLens** is designed to address the escalating challenge of AI-generated synthetic media, deepfakes, and manipulated visual assets. Rather than delivering an opaque, unaccountable binary verdict, TruthLens breaks down media files through **multi-spectral forensic heuristics** and presents human-readable, calibrated evidence.

### Core Distinctions
* **Transparent & Explainable:** Every result itemizes discrete anomalies (2D-FFT Fourier periodicities, boundary gradient smoothing, corneal reflection vectors).
* **Ethical & Probabilistic:** Explicitly communicates that automated detection is statistical, cannot guarantee 100% authenticity, and must never be treated as legal proof without human corroboration.
* **Privacy by Design:** File inspection runs in-memory with client-side preview generation; media is never archived on public remote servers.
* **Honest Demonstration Mode:** Phase 1 uses clearly labeled, deterministic heuristic simulation so the team never misrepresents mock results as trained neural predictions.

---

## 🏗️ Architecture & Technology Stack

```
truthlens/
├── frontend/                   # React 19 + Vite 8 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Modular UI Components
│   │   │   ├── Navbar.tsx             # Sticky header with active tab and Demo badge
│   │   │   ├── Hero.tsx               # Main hero with value proposition & metrics
│   │   │   ├── LiveScannerDemo.tsx    # Interactive scanner demo with filter toggles
│   │   │   ├── Features.tsx           # Feature cards (Image, Video, Explainability, Reports)
│   │   │   ├── HowItWorks.tsx         # 3-step pipeline breakdown
│   │   │   ├── ResponsibleAI.tsx      # Ethics, limitations, and probabilistic warnings
│   │   │   ├── AnalyzeMedia.tsx       # Drag-and-drop upload studio & sample selector
│   │   │   ├── ResultsDashboard.tsx   # Evidence breakdown, media viewer & next steps
│   │   │   ├── ExplainabilityGuide.tsx# "Understand the Evidence" forensic education hub
│   │   │   ├── HistoryDashboard.tsx   # LocalStorage-backed scan history log
│   │   │   ├── ReportModal.tsx        # Printable forensic audit report (PDF / JSON)
│   │   │   └── Footer.tsx             # Privacy note and navigation
│   │   ├── services/
│   │   │   ├── analysisService.ts     # Heuristic engine, progress ticker, sample datasets
│   │   │   └── historyService.ts      # LocalStorage persistence manager
│   │   ├── types/
│   │   │   └── index.ts               # Strict TypeScript models and interfaces
│   │   ├── App.tsx                    # View router and state coordinator
│   │   ├── main.tsx                   # React DOM entry point
│   │   └── index.css                  # Tailwind v4 theme, animations & @media print styles
│   ├── index.html                     # HTML5 shell with Inter & Outfit typography
│   ├── vite.config.ts                 # Vite + Tailwind plugin configuration
│   └── package.json                   # Frontend dependencies
│
├── backend/                    # Python + FastAPI + Uvicorn (Phase 2 Ready)
│   ├── app/
│   │   ├── routes/
│   │   │   └── analysis.py            # POST /api/analyze/image, video & GET /api/health
│   │   ├── services/
│   │   │   └── detector.py            # Media detector service with clean AI hooks
│   │   ├── schemas/
│   │   │   └── analysis.py            # Pydantic validation schemas
│   │   └── main.py                    # FastAPI server entry point with CORS
│   └── requirements.txt               # Backend dependencies
│
├── package.json                # Root convenience scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # Hackathon project documentation
```

---

## 🚀 Quickstart Guide (Windows & VS Code)

### Prerequisites
* **Node.js:** v18+ (tested on v24)
* **Python:** 3.10+ (tested on 3.13)
* **Visual Studio Code**

---

### Step 1: Running the Frontend (Phase 1 Prototype)

1. Open VS Code in the project root: `c:\Users\hp\new_project`
2. Open the built-in terminal (`Ctrl + ~`) and navigate to the frontend folder:
   ```powershell
   cd frontend
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
4. **Instant Hackathon Test:**
   * In the top navigation, click **"Analyze Media"**.
   * Under the upload box, click one of the **Curated Demonstration Samples** (e.g. *"Suspect Deepfake Portrait"* or *"Camera Captured Photo"*).
   * Click **"Analyze Media"** to watch the animated 5-stage heuristic inspection.
   * Review the **Results Dashboard**, switch between **Standard**, **2D-FFT Spectra**, and **Boundary Heatmap** overlays.
   * Click **"Generate Audit Report (PDF/Print)"** to view or print the executive audit certificate!

---

### Step 2: Running the Backend (Phase 2 Ready)

1. Open a second terminal tab in VS Code:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python app/main.py
   ```
2. The FastAPI server will start on:
   ```
   http://127.0.0.1:8000
   ```
3. Interactive Swagger API documentation is available at:
   ```
   http://127.0.0.1:8000/docs
   ```

---

## 🔬 Scientific Forensics Overview

TruthLens inspects media across four foundational axes:

1. **2D-FFT Frequency Domain Analysis:**
   Transposed convolutions in generative models leave subtle periodic checkerboard harmonics across the spatial frequency spectrum. Natural lenses produce a continuous roll-off following natural $1/f$ optical decay.
2. **Spatial Boundary Gradient Analysis:**
   Composited face swaps rely on color blending and boundary smoothing along facial contours (jawline, hairline), creating a detectable sharpness drop relative to background camera sensor noise.
3. **Corneal Specular Reflection Consistency:**
   Natural photographs preserve physical 3D ray-tracing lighting angles across both pupils. Synthetic faces often render asymmetrical light reflection vectors.
4. **Keyframe Temporal Optical Flow:**
   Video frames are sampled uniformly to detect high-frequency micro-jitter or warping artifacts during rapid movement and head rotation.

---

## ⚖️ Responsible AI & Ethical Disclosures

* **Probabilistic Scoring:** Machine learning results are statistical estimates, not judicial proof.
* **No Negative Guarantees:** *"No Strong Signs of Manipulation Detected"* does not certify that media is unaltered; novel generative models or slight manual retouching may evade detection.
* **Compression Degradation:** Heavy social media compression (WhatsApp, TikTok, Instagram) strips high-frequency signals and may induce false-positive macroblocking.

---

## 🗺️ Project Hackathon Roadmap

* [x] **Phase 1 (Complete):** High-fidelity responsive frontend, upload studio, interactive scanner demo, explainable heuristics engine, local history logging, and printable PDF audit reports.
* [ ] **Phase 2:** Connect React upload studio to the live FastAPI backend via Axios/fetch.
* [ ] **Phase 3:** Integrate an open-source pretrained model (e.g., EfficientNet-B4 or MesoNet weights).
* [ ] **Phase 4:** Deep video keyframe decoding with OpenCV and temporal heatmap timeline.
* [ ] **Phase 5:** End-to-end stress testing, accessibility audit, and hackathon presentation pitch deck.
