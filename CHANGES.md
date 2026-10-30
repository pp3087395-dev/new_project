# TruthLens — Engineering Log & Changes Summary

This document explains what was wrong with the original TruthLens prototype, what was changed across Steps 1 through 10, the measured benchmark results across three model architectures, why the final model and thresholds were chosen, known physical and statistical limits, and how to replicate all tests.

---

## 1. Problem: What Was Wrong at the Start

At the start of the project, TruthLens suffered from several fundamental technical and design defects that made its verdicts unreliable in real-world scenarios:

1. **Outdated Neural Baseline (3-Year-Old Model):** The original baseline model (`umm-maybe/AI-image-detector`) was trained in 2022 on early GAN and VQGAN outputs. When presented with modern photos or modern diffusion images (Flux, Midjourney v6, SDXL), it failed frequently—flagging 21.4% of real photos as FAKE and missing over 51% of AI images.
2. **Hard-Coded Label Indexing:** The backend assumed index 0 was REAL and index 1 was FAKE. Models that inverted label order or used labels like `human`/`synthetic` produced inverted verdicts.
3. **Destructive Direct Resizing:** High-resolution user images were squished down to 224x224, destroying micro-textures, sensor grain, and fine synthesis artifacts before reaching the neural network.
4. **Binary Illusion of Certainty (No Uncertainty State):** The system forced every image into a binary `REAL` or `FAKE` box even when probabilities were 50.1% vs 49.9%, presenting uncalibrated model activations as definitive certainty.
5. **Thread Blocking During Inference:** Model inference ran synchronously on FastAPI's main thread loop, blocking health probes (`/api/health`) and preventing concurrent requests.
6. **False "Offline" Frontend Banner:** The frontend poll timed out before free-tier cloud servers completed cold-start and model loading, causing the UI banner to stay persistently red/offline.
7. **Collision-Prone History IDs:** History IDs used `Math.random().toString(36)`, generating duplicate keys and overwriting past audits.
8. **Broken History Thumbnails:** The client stored multi-megabyte raw blobs in browser LocalStorage, exhausting browser quotas (5MB) and silently breaking stored scan thumbnails.
9. **Misleading Verdict Terminology:** The UI promised "Authentic" and "NO STRONG AI-GENERATION SIGNS", falsely implying to users that an absence of generative diffusion clues proved an image was genuine and unedited.

---

## 2. What Changed (Step-by-Step)

- **Step 1 (`5d622ff`, `62df9f5`):** Created evaluation harness (`backend/eval/run_eval.py`) and populated local benchmark dataset with 55 ground-truth images (28 real photographs, 27 AI-generated images) to establish reproducible baselines.
- **Step 2 (`4e6af30`):** Converted FastAPI startup to an asynchronous background worker using `asyncio.to_thread` with thread locks, ensuring `/api/ping` and `/api/health` remain immediately responsive during model weight loading.
- **Step 3 (`7bab982`):** Built robust Pillow preprocessing pipeline: EXIF auto-orientation transpose, white background alpha-compositing for RGBA/palette modes, safe CMYK/16-bit to 8-bit RGB normalization, and resolved EXIF SubIFD parsing errors.
- **Step 4 (`00948b2`):** Introduced pluggable classifier backends (`legacy`, `siglip`, `smaug`), dynamic Hugging Face label resolution (`model.config.id2label`), and multi-view center/corner tiling to inspect full-resolution details.
- **Step 5 (`10890ec`):** Calibrated decision thresholds and introduced an explicit 3-way decision boundary (`REAL`, `INCONCLUSIVE`, `FAKE`) with an uncertainty half-width window ($\pm 0.10$) around threshold 0.50 for Smaug.
- **Step 6 (`c761097`):** Replaced random client IDs with deterministic SHA-256 derived Audit IDs (`TL-<hash>`), downscaled history thumbnails to 480px WebP, and added LocalStorage quota fail-safes.
- **Step 7 (`37e012a`):** Built 2-tier client health polling (`/api/ping` 60s cold-start allowance followed by `/api/health` model readiness tracking) with a live progress state banner (`Waking up...` -> `Loading weights...` -> `Ready`).
- **Step 8 (`2957b91`):** Integrated the 3-way verdict state into the frontend UI, adding amber `INCONCLUSIVE` badges, warning cards, and honest evidence explainers.
- **Step 8b (`cfcba44`):** Replaced misleading "Authentic" labels with calibrated wording ("Likely fully AI-generated", "No signs of full AI generation", "Inconclusive") and extracted IPTC/C2PA metadata provenance clues (`trainedAlgorithmicMedia`, Photoshop/generator tags) without altering pixel-level classifier verdicts. Integrated camera hardware EXIF corroboration (commit 47d04f5) to support authentic verdicts for verified camera captures without overriding strong synthetic evidence.
- **Step 9 (`0e56bee`):** Benchmarked crop counts vs accuracy, capped image input dimensions at 2048px (reducing latency from 4.05s to 2.87s), cleaned production Dockerfile/requirements, and configured CORS for local and Vercel domains.
- **Step 10 (Current):** Replaced placeholder tests with a comprehensive 42-test Pytest suite, resolved all Oxlint React warnings, verified zero-warning frontend build, and generated final evaluation reports.

---

## 3. Results Table: Model Comparison on 55 Test Images

Evaluation performed on CPU (Intel Core i5, 4 threads allocated to PyTorch) across 55 real-world test images (28 authentic photographs, 27 AI-generated synthetic images):

| Metric | Legacy ViT (`umm-maybe`) | SigLIP (`Ateeqq`) | Smaug (`Abacus AI`) [Chosen] |
| :--- | :---: | :---: | :---: |
| **Model Size / Architecture** | 85M ViT Base | 92.9M SigLIP (Patch 16) | 439M ViT Large |
| **Images Tested** | 55 (28 Real, 27 Fake) | 55 (28 Real, 27 Fake) | 55 (28 Real, 27 Fake) |
| **Configured Cutoff** | 0.50 ($\pm 0.10$) | 0.40 ($\pm 0.10$) | 0.50 ($\pm 0.10$) |
| **Uncertain Window** | [0.40, 0.60] | [0.30, 0.50] | [0.40, 0.60] |
| **Conclusive Accuracy** | 56.52% (26/46) | 68.29% (28/41) | **100.00% (54/54)** |
| **Strict Accuracy** | 47.27% (26/55) | 50.91% (28/55) | **98.18% (54/55)** |
| **Inconclusive Rate** | 16.36% (9/55) | 25.45% (14/55) | **1.82% (1/55)** |
| **Real Photos Called Fake (FPR)** | 21.43% (6/28) | 10.71% (3/28) | **0.00% (0/28)** |
| **FPR 95% Wilson Confidence Interval** | [10.2%, 39.5%] | [3.7%, 27.2%] | **[0.0%, 12.1%]** |
| **AI Images Missed as Real (FNR)** | 51.85% (14/27) | 37.04% (10/27) | **0.00% (0/27)** |
| **FNR 95% Wilson Confidence Interval** | [34.0%, 69.3%] | [21.5%, 55.8%] | **[0.0%, 12.5%]** |
| **Average Latency / Image** | ~182 ms | ~1002 ms (2 views) | ~2786 ms (1 full crop + 2048 cap) |
| **Peak Working Memory (RAM)** | ~879 MB | ~886 MB | ~2708 MB (~2.7 GB) |

*Note on Sample Size Warning:* Both real ($n=28$) and fake ($n=27$) test partitions are below 30 images. To prevent overstating certainty, 95% Wilson score intervals are provided above. While Smaug achieved 0 false positives and 0 false negatives on this test set, the 95% confidence interval indicates true error rates could range up to ~12% on larger distributions.

### Borderline & Misclassified Images on Smaug:
- **Definitive Misclassifications:** None (0/55).
- **Inconclusive Sample:** 1 sample fell within the uncertain band $[0.40, 0.60]$:
  - `movie scene.webp` (Ground Truth: FAKE, Predicted Fake Probability: **46.4%** $\to$ `INCONCLUSIVE`).

---

## 4. Chosen Model & Decision Threshold

**Chosen Backend:** `smaug` (`abacusai/Smaug-AI-Image-Detector`)  
**Threshold:** `0.50`  
**Uncertain Band:** `+/-0.10` (Window $[0.40, 0.60]$ mapped to `INCONCLUSIVE`)

### Rationale:
1. **Zero False Positives:** In journalistic and academic integrity applications, falsely accusing an authentic photograph of being AI-generated is severely harmful. Smaug achieved a 0.0% false positive rate across all 28 real photos (including portrait, landscape, mobile phone, and studio shots).
2. **Robust Diffusion Detection:** While the legacy ViT missed 51.9% of AI images, Smaug detected 26 of 27 AI images decisively, and correctly withheld judgment on the 1 ambiguous sample (`movie scene.webp`) rather than producing a false negative.
3. **Decisive Classification:** Over 98% of images received decisive verdicts, compared to SigLIP which had a 25.5% inconclusive rate.

---

## 5. Known Limitations (Plain & Honest)

1. **Small Test Set:** The benchmark contains 55 images collected by the author. It is sufficient for regression testing and spotting major model regressions, but does not represent a massive academic benchmark (e.g. Synthbuster or GenImage).
2. **Detection Scope is Limited to Fully AI-Generated Media:** Smaug is trained to identify images synthesized end-to-end by generative neural networks (Midjourney, DALL-E, Stable Diffusion, Flux). It **cannot** detect whether an authentic camera photo was retouched, color-graded, upscaled, or modified with generative fill in Photoshop.
3. **Compression & Screenshot Sensitivity:** Heavy social media compression (WhatsApp, Facebook, Twitter) or taking a screenshot of an image removes high-frequency spectral artifacts, reducing model confidence and increasing inconclusive verdicts.
4. **Stripped Provenance Clues:** Most messaging apps and social platforms automatically strip EXIF and C2PA metadata. The absence of metadata is normal and must never be interpreted as evidence of fraud.
5. **Memory Consumption:** Smaug requires ~2.7 GB RAM. Free-tier cloud instances with 512 MB RAM (e.g., standard Render free tier) will encounter Out-Of-Memory (OOM) errors. It requires at least 4 GB RAM.
6. **CPU Inference Latency:** Running a 439M parameter model on CPU takes 2.5–3.0 seconds per image. High-concurrency production deployments require GPU acceleration or async worker queues (Celery/Redis).

---

## 6. How to Run & Verify

### Environment Setup (Windows PowerShell)

#### 1. Backend Setup & Tests
```powershell
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install runtime dependencies and development test dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run fast unit tests (excluding neural model inference):
python -m pytest -m "not model" -v

# Run complete test suite (including model tests & eval set regression):
python -m pytest -v

# Run the three-way model evaluation benchmark:
python eval/run_eval.py --backend smaug --threshold 0.50 --uncertain-band 0.10 --use-cache
python eval/run_eval.py --backend siglip --threshold 0.40 --uncertain-band 0.10 --use-cache
python eval/run_eval.py --backend legacy --threshold 0.50 --uncertain-band 0.10 --use-cache

# Start local FastAPI backend:
$env:CLASSIFIER_BACKEND="smaug"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

#### 2. Frontend Setup & Build
```powershell
# In a separate PowerShell terminal, navigate to frontend:
cd frontend

# Install npm dependencies
npm install

# Run Oxlint linter (must produce 0 errors, 0 warnings):
npm run lint

# Run production build (must produce 0 errors):
npm run build

# Start local development server:
npm run dev
```

---

## 7. Deployment Summary

- **Backend Platform Recommendation:** Render Standard, Railway, or AWS EC2 with **at least 4 GB RAM** to host Smaug comfortably without OOM crashes.
- **Frontend Platform:** Vercel, Netlify, or Cloudflare Pages with `VITE_API_BASE_URL` pointing to the public HTTPS backend URL.
- **Environment Variables Required:**
  - `CLASSIFIER_BACKEND=smaug`
  - `CLASSIFIER_FAKE_THRESHOLD=0.50`
  - `CLASSIFIER_UNCERTAIN_BAND=0.10`
  - `ALLOWED_ORIGINS=https://truthlens.vercel.app,http://localhost:5173`
- Refer to the Step 9 Deployment Checklist before publishing to production.
