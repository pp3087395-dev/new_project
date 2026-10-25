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
├── backend/                    # Python + FastAPI + Uvicorn + ONNX Runtime CPU
│   ├── app/
│   │   ├── routes/
│   │   │   └── analysis.py            # POST /api/analyze/image, video & GET /api/health
│   │   ├── services/
│   │   │   ├── classifier.py          # Pretrained ViT ONNX Classifier Service (Singleton)
│   │   │   └── detector.py            # Multi-spectral forensics (2D-FFT + EXIF + ViT)
│   │   ├── schemas/
│   │   │   └── analysis.py            # Pydantic validation schemas (AIClassificationSchema)
│   │   └── main.py                    # FastAPI server entry point with startup lifespan
│   └── requirements.txt               # Backend dependencies (onnxruntime, huggingface_hub, etc.)
│
├── package.json                # Root convenience scripts
├── .gitignore                  # Git ignore rules (includes model weights & cache)
└── README.md                   # Hackathon project documentation
```

---

## 🚀 Quickstart Guide (Windows & VS Code)

### Prerequisites
* **Node.js:** v18+ (tested on v24)
* **Python:** 3.10+ (tested on 3.13)
* **Visual Studio Code**
* **Hardware:** Compatible with standard 16 GB RAM laptops with CPU-only / integrated graphics.

---

### Step 1: Running the Frontend

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

---

### Step 2: Running the Backend & AI Model Service

1. Open a second terminal tab in VS Code:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   # Or for production / Render: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
2. **Automatic Model Download & Cache:**
   * On startup, the backend automatically downloads the quantized ONNX model weights (`onnx-community/ai-image-detection-ONNX`, 83.3 MB) into the local Hugging Face cache.
   * Model weights are **loaded once** into memory on server start via FastAPI lifespan and reused across all requests.
   * Model weights are excluded from Git commits via `.gitignore`.
3. Check backend health:
   ```
   http://127.0.0.1:8000/api/health
   ```
4. Interactive Swagger API documentation is available at:
   ```
   http://127.0.0.1:8000/docs
   ```

---

## 🧠 Pretrained AI Model Integration

| Attribute | Specification |
| :--- | :--- |
| **Model Repository** | [`onnx-community/ai-image-detection-ONNX`](https://huggingface.co/onnx-community/ai-image-detection-ONNX) |
| **Base Architecture** | Vision Transformer (`google/vit-base-patch16-224-in21k`, Google, Apache 2.0) |
| **Fine-Tuning Dataset** | CIFAKE (AI-generated synthetic media vs real photographs) |
| **Model Origin** | CapCheck (`capcheck/ai-image-detection`, Apache 2.0) |
| **Runtime Engine** | ONNX Runtime (`CPUExecutionProvider`) |
| **Weight Variant** | `model_quantized.onnx` (83.29 MB, INT8 quantized for ultra-low CPU latency) |
| **Input Shape** | `[1, 3, 224, 224]` float32 (Bilinear interpolation, rescale 1/255, mean 0.5, std 0.5) |
| **Output Classes** | `REAL` (Class 0), `FAKE` (Class 1) |
| **Inference Latency** | ~110–135 ms on CPU |
| **Memory Footprint** | ~150–200 MB RAM |

### Important Scientific & Ethical Limitations
* **Full AI Generation vs AI Enhancement:** This tool estimates whether an image is fully AI-generated. It cannot tell whether a real photo was edited, retouched, upscaled or AI-enhanced. Absence of detection is not proof the image is untouched.
* **Honest Probabilistic Labels:** Verdicts are explicitly labeled as "Likely fully AI-generated", "No signs of full AI generation", or "Inconclusive". We never claim an image is definitively "Authentic" or "Real" based on automated scores.
* **Uncalibrated Activations:** Scores are raw softmax outputs from the Vision Transformer and represent relative model activation on training distributions, not calibrated statistical probabilities.
* **Specialized Domain:** The model detects AI-generated synthetic images (diffusion, GANs) and has **not** been established as a universal facial manipulation or face-swap detector.
* **Separation of Evidence:** Mathematical 2D-FFT frequency spectrum analysis, EXIF metadata extraction, and provenance clues (IPTC DigitalSourceType, C2PA) remain strictly separated from the model prediction. Provenance clues never alter the classifier verdict.
* **Honest Failure Handling:** If model weights cannot be loaded or inference fails, the system returns an honest `unavailable` status with error details; it never fabricates mock confidence scores.

---

## 🔬 Scientific Forensics Overview

TruthLens inspects media across four foundational axes:

1. **Pretrained Vision Transformer (ViT) Classifier:**
   Deep patch-based self-attention analyzing multi-scale synthetic synthesis artifacts across 224×224 normalized color patches.
2. **2D-FFT Frequency Domain Analysis:**
   Transposed convolutions in generative models leave subtle periodic checkerboard harmonics across the spatial frequency spectrum. Natural lenses produce a continuous roll-off following natural $1/f$ optical decay.
3. **EXIF & Container Provenance:**
   Detects missing camera hardware tags, capture timestamps, and software generation flags.
4. **Spatial Boundary Gradient Analysis:**
   Inspects resolution, color space, and pixel density for compression degradation.

---

## 🗺️ Project Hackathon Roadmap

* [x] **Phase 1 (Complete):** High-fidelity responsive frontend, upload studio, interactive scanner demo, explainable heuristics engine, local history logging, and printable PDF audit reports.
* [x] **Phase 2 (Complete):** Real pretrained Vision Transformer ONNX classification model integration (`onnx-community/ai-image-detection-ONNX`), live FastAPI connection, real 2D-FFT magnitude spectrum computation, and uncalibrated probability disclosures.
* [ ] **Phase 3:** Enhanced multi-generator fine-tuning (Flux, SDXL, Midjourney v6) and facial landmark crop pipeline.
* [ ] **Phase 4:** Deep video keyframe decoding with OpenCV and temporal heatmap timeline.
* [ ] **Phase 5:** End-to-end stress testing, accessibility audit, and hackathon presentation pitch deck.
