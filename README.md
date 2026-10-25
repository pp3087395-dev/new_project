# TruthLens — AI Deepfake & Media Forensics Platform

> **"Look Beyond What You See."**  
> An explainable, multi-spectral media forensics inspection platform designed to detect fully AI-generated images with calibrated confidence and transparent uncertainty states.

---

## 🌟 Executive Overview

**TruthLens** addresses the challenge of generative synthetic media (diffusion models, GANs) by providing transparent, multi-spectral forensic inspection rather than an opaque binary output. 

Rather than declaring media as definitively "Authentic" or "Fake", TruthLens extracts discrete signals—spatial patch activations via deep Vision Transformers, 2D-FFT frequency domain periodicities, EXIF metadata, and digital provenance tags—and communicates findings probabilistically.

---

## ⚠️ Accuracy and Limits

**No automated AI detector is 100% accurate.** TruthLens estimates whether an image is **fully AI-generated** by modern generative architectures (e.g., Midjourney, DALL-E 3, Stable Diffusion, Flux). 

- **Not an Edit/Enhancement Detector:** The system cannot determine if an authentic photograph was retouched, color-graded, upscaled, or edited with generative fill tools.
- **Compression Degradation:** Heavy re-compression (e.g., WhatsApp, messaging apps, social networks) and taking screenshots destroy micro-textures and high-frequency spectral cues, which may reduce confidence or produce inconclusive results.
- **Probabilistic Calibration:** Scores represent neural model activations and must never be treated as legal or definitive proof of authenticity without independent human corroboration.

---

## 🏗️ Architecture & Technology Stack

```
truthlens/
├── frontend/                   # React 19 + Vite 8 + TypeScript + Tailwind CSS v4
│   ├── src/
│   │   ├── components/         # Modular UI Components
│   │   │   ├── Navbar.tsx             # Header with status badge & tab navigation
│   │   │   ├── Hero.tsx               # Value proposition & quick-load samples
│   │   │   ├── LiveScannerDemo.tsx    # Interactive scanner demo with filter toggles
│   │   │   ├── Features.tsx           # Forensic inspection capabilities
│   │   │   ├── HowItWorks.tsx         # 3-step pipeline breakdown
│   │   │   ├── ResponsibleAI.tsx      # Ethics, limitations & probabilistic charter
│   │   │   ├── AnalyzeMedia.tsx       # Drag-and-drop studio with cold-start polling
│   │   │   ├── ResultsDashboard.tsx   # Evidence breakdown with 3-way verdict badge
│   │   │   ├── ExplainabilityGuide.tsx# Educational guide to forensic heuristics
│   │   │   ├── HistoryDashboard.tsx   # LocalStorage-backed scan audit log
│   │   │   ├── ReportModal.tsx        # Printable forensic audit report (PDF / JSON)
│   │   │   └── Footer.tsx             # Privacy disclosure & copyright
│   │   ├── services/
│   │   │   ├── analysisService.ts     # API client, 2-tier health check & thumbnails
│   │   │   └── historyService.ts      # LocalStorage manager with 480px WebP storage
│   │   ├── types/
│   │   │   └── index.ts               # Strict TypeScript models
│   │   ├── App.tsx                    # State coordinator & tab router
│   │   └── index.css                  # Tailwind v4 theme & print styles
│   ├── .oxlintrc.json                 # Oxlint linter rules
│   └── package.json                   # Frontend dependencies
│
├── backend/                    # Python 3.10+ + FastAPI + PyTorch CPU + Pillow
│   ├── app/
│   │   ├── routes/
│   │   │   └── analysis.py            # /api/analyze/image, /api/health, /api/ping
│   │   ├── services/
│   │   │   ├── classifier.py          # Unified classifier service (Smaug, SigLIP, Legacy)
│   │   │   ├── detector.py            # 2D-FFT Fourier & SHA-256 Audit ID generator
│   │   │   └── provenance.py          # IPTC DigitalSourceType & C2PA tag inspector
│   │   ├── schemas/
│   │   │   └── analysis.py            # Pydantic schemas (ForensicAnalysisResponse)
│   │   └── main.py                    # FastAPI entrypoint with CORS & async lifespan
│   ├── eval/                          # Evaluation harness & ground-truth benchmark
│   │   ├── run_eval.py                # 3-way evaluation harness with Wilson CI
│   │   ├── real/                      # Authentic test photographs (.gitignore)
│   │   └── fake/                      # AI-generated test images (.gitignore)
│   ├── tests/                         # Pytest automated test suite (42 tests)
│   ├── requirements.txt               # Production requirements
│   ├── requirements-dev.txt           # Testing dependencies (pytest)
│   ├── Dockerfile                     # Multi-stage production container
│   └── pytest.ini                     # Pytest configuration
│
├── CHANGES.md                  # Comprehensive step-by-step engineering log
└── README.md                   # Project documentation
```

---

## 🧠 Supported Classifier Backends

TruthLens features a modular backend architecture selectable via the `CLASSIFIER_BACKEND` environment variable:

| Model Backend | Architecture | Parameters | Default Cutoff | Uncertainty Window | Memory (RAM) | Primary Use Case |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **`smaug`** *(Default / Recommended)* | [`abacusai/Smaug-AI-Image-Detector`](https://huggingface.co/abacusai/Smaug-AI-Image-Detector) | 439M | `0.50` | `[0.40, 0.60]` | ~2.7 GB | High-precision production detection; 0.0% false-positive rate on test set. |
| **`siglip`** *(Lightweight)* | [`Ateeqq/ai-vs-human-image-detector`](https://huggingface.co/Ateeqq/ai-vs-human-image-detector) | 92.9M | `0.40` | `[0.30, 0.50]` | ~885 MB | Resource-constrained hosts (e.g. 1GB–2GB RAM) with multi-view tiling. |
| **`legacy`** *(Baseline Comparison)* | [`umm-maybe/AI-image-detector`](https://huggingface.co/umm-maybe/AI-image-detector) | 85M | `0.50` | `[0.40, 0.60]` | ~880 MB | Reference baseline; 2022 VQGAN-era ViT showing benchmark regression. |

---

## ⚙️ Environment Variables Reference

| Variable | Scope | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `CLASSIFIER_BACKEND` | Backend | `smaug` | Active classifier model: `smaug`, `siglip`, or `legacy`. |
| `CLASSIFIER_FAKE_THRESHOLD` | Backend | `0.50` (smaug) / `0.40` (siglip) | Decision cutoff probability above which an image is considered FAKE. |
| `CLASSIFIER_UNCERTAIN_BAND` | Backend | `0.10` | Half-width around cutoff mapped to `INCONCLUSIVE` verdict. |
| `SMAUG_CROPS` | Backend | `1` | Number of crop evaluations for Smaug (`1`, `2`, or `3`). |
| `ALLOWED_ORIGINS` | Backend | Localhost origins | Comma-separated CORS allowed origins (e.g. `https://your-app.vercel.app`). |
| `PORT` | Backend | `8000` | Port for Uvicorn server in Docker / cloud deployments. |
| `HF_TOKEN` | Backend | *None* | Optional Hugging Face access token for higher download rate limits. |
| `VITE_API_BASE_URL` | Frontend | `http://127.0.0.1:8000` | Public backend API URL (set in Vercel to your cloud API endpoint). |

---

## 🚀 Quickstart Guide (Windows PowerShell)

### 1. Backend Setup & Local Server

```powershell
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install runtime dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run the backend server (defaults to Smaug on port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Verify backend health at: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup & Local Development

```powershell
cd frontend

# Install dependencies
npm install

# Start development dev server (Vite)
npm run dev
```

Navigate browser to: `http://localhost:5173`

---

## 🧪 Running Tests & Evaluation

### Automated Test Suite (Pytest)
```powershell
cd backend

# Run fast unit tests (label mapping, EXIF, API status codes, CORS - excludes model):
python -m pytest -m "not model" -v

# Run full test suite (including model inference, responsiveness & dataset regressions):
python -m pytest -v
```

### Frontend Linting & Build Verification
```powershell
cd frontend

# Run Oxlint (0 errors, 0 warnings expected):
npm run lint

# Run TypeScript check and production bundle:
npm run build
```

### Model Evaluation Benchmark
```powershell
cd backend

# Run evaluation on benchmark dataset (55 images):
python eval/run_eval.py --backend smaug --threshold 0.50 --uncertain-band 0.10 --use-cache
python eval/run_eval.py --backend siglip --threshold 0.40 --uncertain-band 0.10 --use-cache
python eval/run_eval.py --backend legacy --threshold 0.50 --uncertain-band 0.10 --use-cache
```

---

## 🛡️ Responsible AI Disclosures & Verdict Mapping

TruthLens maps raw model outputs into three calibrated categories:

1. **`Likely fully AI-generated` (`FAKE`):** Probability exceeds threshold + band ($> 0.60$ for Smaug). Indicates high statistical similarity to generative diffusion training patterns.
2. **`No signs of full AI generation` (`REAL`):** Probability is below threshold - band ($< 0.40$ for Smaug). Indicates absence of strong generative artifacts; this is **not** proof that the image is authentic or unretouched.
3. **`Inconclusive` (`INCONCLUSIVE`):** Probability falls inside $[0.40, 0.60]$. The system explicitly withholds judgment on ambiguous, heavily compressed, or borderline media.

### Provenance Clues
The system inspects EXIF and IPTC XMP metadata for digital source tags (such as `trainedAlgorithmicMedia` or Adobe generator strings) and C2PA manifests. **Provenance clues are presented strictly as supplementary context and never alter the classifier's pixel-level verdict.**

---

## 🗺️ Project Roadmap

- [x] **Phase 1: Explainable Forensic UI** — Responsive React dashboard, drag-and-drop studio, 2D-FFT viewer, local history logging, and printable audit reports.
- [x] **Phase 2: Modern Neural Classifier Integration** — High-accuracy Smaug (439M) and SigLIP (92.9M) backends with dynamic Hugging Face label mapping and auto-oriented PIL pipeline.
- [x] **Phase 3: Calibrated Uncertainty & Honest Labels** — 3-way verdict boundaries, honest non-absolutist terminology, and IPTC/C2PA provenance inspection.
- [x] **Phase 4: Latency & Deployment Readiness** — Async non-blocking startup, 2048px downscaling optimization, 2-tier frontend health polling, and containerization.
- [ ] **Phase 5: Video Keyframe Extraction** — Multi-frame temporal sampling for video deepfake analysis.
