# TruthLens Evaluation Harness

This directory contains the automated evaluation framework used to quantitatively measure TruthLens classifier accuracy, false-positive rates (FPR), and false-negative rates (FNR) across models and thresholds.

---

## Dataset Setup Instructions

To establish a statistically meaningful benchmark, please add images to the evaluation folders:

### 1. Authentic Real-World Photos: `backend/eval/real/`
Add **at least 30 real photos**:
- **Smartphone camera shots** (iPhone / Android) of people, objects, and landscapes.
- **WhatsApp / Telegram compressed images** (to test social compression resilience).
- **Screenshots** (capturing news, messages, or websites).
- **Photos with and without embedded EXIF camera metadata**.

### 2. Synthetic AI-Generated Images: `backend/eval/fake/`
Add **at least 30 AI images** from modern generative engines:
- **Midjourney** (v5, v6, v7 photorealistic portraits & scenes)
- **FLUX** (Flux.1 Dev / Schnell)
- **Stable Diffusion XL (SDXL)**
- **OpenAI DALL-E 3 / GPT-image**
- **Google Gemini / Imagen 3**

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`.

---

## Running the Benchmark

From the `backend` folder, run:

```bash
# Baseline legacy model (umm-maybe ViT)
python eval/run_eval.py --backend legacy

# Lightweight SigLIP model (Ateeqq)
python eval/run_eval.py --backend siglip

# Smaug AI model (Abacus AI)
python eval/run_eval.py --backend smaug
```

### Metrics Reported
- **Accuracy**: Total correct predictions over total images.
- **Confusion Matrix**: True Positives, True Negatives, False Positives, False Negatives.
- **False-Positive Rate (FPR)**: Real images incorrectly flagged as FAKE (target: < 5%).
- **False-Negative Rate (FNR)**: AI images missed and flagged as REAL.
- **Threshold Sweep**: Scans decision cutoffs from 0.05 to 0.95 to find the optimal operating threshold.
- **Per-file breakdown & list of misclassified assets**.
