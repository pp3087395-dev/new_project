#!/usr/bin/env python3
"""
TruthLens Model Evaluation Harness
Evaluates model accuracy, confusion matrix, false-positive rate (FPR),
false-negative rate (FNR), per-file probabilities, and optimal threshold sweep.

Usage:
    python run_eval.py --backend legacy
    python run_eval.py --backend siglip
    python run_eval.py --backend smaug
    python run_eval.py --backend legacy --output results_legacy.txt
"""

import os
import sys
import argparse
import time
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from PIL import Image

# Ensure backend root is on sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = SCRIPT_DIR.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate TruthLens Classifier Backends")
    parser.add_argument(
        "--backend",
        choices=["legacy", "siglip", "smaug"],
        default="legacy",
        help="Model backend to evaluate (legacy: umm-maybe ViT, siglip: Ateeqq SigLIP, smaug: Abacus AI Smaug)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.50,
        help="Default decision threshold for classification (default: 0.50)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Optional file path to save evaluation results"
    )
    return parser.parse_args()


def get_process_peak_ram_mb() -> float:
    """Returns peak working set RAM of the current process in MB."""
    try:
        import os, subprocess
        pid = os.getpid()
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-Command", f"(Get-Process -Id {pid}).PeakWorkingSet64 / 1MB"],
            text=True,
            timeout=5.0
        )
        return round(float(out.strip()), 1)
    except Exception:
        return 0.0


class ModelPredictor:
    """Wrapper providing a unified fake-probability prediction interface matching production."""

    def __init__(self, backend: str):
        self.backend = backend
        self._init_backend()

    def _init_backend(self):
        print(f"[*] Initializing model backend: '{self.backend}'...")
        hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")

        if self.backend == "legacy":
            from app.services.classifier import LegacyBackend
            self.service = LegacyBackend()
            self.service.initialize(hf_token=hf_token)
            self.model_name = self.service.model_name

        elif self.backend == "siglip":
            from app.services.classifier import SigLIPBackend
            self.service = SigLIPBackend()
            self.service.initialize(hf_token=hf_token)
            self.model_name = self.service.model_name

        elif self.backend == "smaug":
            try:
                from app.services.classifier import SmaugBackend
                self.service = SmaugBackend()
                self.service.initialize(hf_token=hf_token)
                self.model_name = self.service.model_name
            except Exception as e:
                raise RuntimeError(
                    f"Smaug backend unavailable: {e}. "
                    "Ensure 'sentence-transformers[image]' and 'torchvision' are installed."
                )
        else:
            raise ValueError(f"Unknown backend: {self.backend}")

    def predict_fake_prob(self, img: Image.Image) -> Tuple[float, int]:
        """Returns (fake_prob in [0.0, 1.0], views_evaluated)."""
        fake_prob, views, _ = self.service.predict_fake_probability(img)
        return fake_prob, views


def collect_images(folder: Path) -> List[Path]:
    """Collect all valid image file paths in the specified folder."""
    if not folder.exists():
        return []
    return sorted([
        p for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS
    ])


def run_evaluation(backend: str, default_threshold: float = 0.50) -> Tuple[str, Dict]:
    eval_dir = SCRIPT_DIR
    real_dir = eval_dir / "real"
    fake_dir = eval_dir / "fake"

    real_files = collect_images(real_dir)
    fake_files = collect_images(fake_dir)

    total_images = len(real_files) + len(fake_files)
    if total_images == 0:
        msg = (
            "======================================================================\n"
            "   [EVALUATION STOPPED] Image dataset folders are empty!\n"
            "======================================================================\n"
            f"Please populate the evaluation dataset directories:\n"
            f"  - Real images (at least 30) : {real_dir}\n"
            f"  - AI images   (at least 30) : {fake_dir}\n\n"
            "Refer to backend/eval/README.md for instructions.\n"
        )
        print(msg)
        return msg, {"total": 0, "empty": True}

    print(f"[*] Found {len(real_files)} real images and {len(fake_files)} fake images (Total: {total_images}).")
    
    predictor = ModelPredictor(backend)

    results: List[Dict] = []
    latencies: List[float] = []

    # 1. Evaluate Real Images (Ground Truth: REAL / 0)
    print(f"[*] Evaluating {len(real_files)} authentic (REAL) images...")
    for idx, path in enumerate(real_files, 1):
        try:
            t0 = time.time()
            with Image.open(path) as img:
                fake_prob, views = predictor.predict_fake_prob(img)
            lat = (time.time() - t0) * 1000
            latencies.append(lat)
            results.append({
                "path": str(path),
                "filename": path.name,
                "ground_truth": "REAL",
                "ground_truth_num": 0,
                "fake_prob": fake_prob,
                "views": views,
                "latency_ms": lat
            })
            print(f"  [{idx}/{len(real_files)}] Real: {path.name:35} -> FakeProb: {fake_prob*100:5.1f}% ({views} views, {lat:.0f}ms)")
        except Exception as e:
            print(f"  [ERROR] Failed to evaluate {path.name}: {e}")

    # 2. Evaluate Fake Images (Ground Truth: FAKE / 1)
    print(f"\n[*] Evaluating {len(fake_files)} synthetic (FAKE) images...")
    for idx, path in enumerate(fake_files, 1):
        try:
            t0 = time.time()
            with Image.open(path) as img:
                fake_prob, views = predictor.predict_fake_prob(img)
            lat = (time.time() - t0) * 1000
            latencies.append(lat)
            results.append({
                "path": str(path),
                "filename": path.name,
                "ground_truth": "FAKE",
                "ground_truth_num": 1,
                "fake_prob": fake_prob,
                "views": views,
                "latency_ms": lat
            })
            print(f"  [{idx}/{len(fake_files)}] Fake: {path.name:35} -> FakeProb: {fake_prob*100:5.1f}% ({views} views, {lat:.0f}ms)")
        except Exception as e:
            print(f"  [ERROR] Failed to evaluate {path.name}: {e}")

    # 3. Compute Metrics at Default Threshold
    tp = sum(1 for r in results if r["ground_truth"] == "FAKE" and r["fake_prob"] >= default_threshold)
    fp = sum(1 for r in results if r["ground_truth"] == "REAL" and r["fake_prob"] >= default_threshold)
    tn = sum(1 for r in results if r["ground_truth"] == "REAL" and r["fake_prob"] < default_threshold)
    fn = sum(1 for r in results if r["ground_truth"] == "FAKE" and r["fake_prob"] < default_threshold)

    total_real = len(real_files)
    total_fake = len(fake_files)
    total_eval = len(results)

    acc = ((tp + tn) / total_eval * 100.0) if total_eval > 0 else 0.0
    fpr = (fp / total_real * 100.0) if total_real > 0 else 0.0
    fnr = (fn / total_fake * 100.0) if total_fake > 0 else 0.0
    avg_latency = (sum(latencies) / len(latencies)) if latencies else 0.0

    # Misclassified files at default threshold
    misclassified = [
        r for r in results
        if (r["ground_truth"] == "REAL" and r["fake_prob"] >= default_threshold) or
           (r["ground_truth"] == "FAKE" and r["fake_prob"] < default_threshold)
    ]

    # 4. Threshold Sweep: 0.05 to 0.95 (step 0.05)
    sweep_thresholds = [round(x * 0.05, 2) for x in range(1, 20)]
    sweep_results = []
    best_thresh = default_threshold
    best_acc = -1.0
    best_fpr = 100.0

    for t in sweep_thresholds:
        t_tp = sum(1 for r in results if r["ground_truth"] == "FAKE" and r["fake_prob"] >= t)
        t_fp = sum(1 for r in results if r["ground_truth"] == "REAL" and r["fake_prob"] >= t)
        t_tn = sum(1 for r in results if r["ground_truth"] == "REAL" and r["fake_prob"] < t)
        t_fn = sum(1 for r in results if r["ground_truth"] == "FAKE" and r["fake_prob"] < t)

        t_acc = ((t_tp + t_tn) / total_eval * 100.0) if total_eval > 0 else 0.0
        t_fpr = (t_fp / total_real * 100.0) if total_real > 0 else 0.0
        t_fnr = (t_fn / total_fake * 100.0) if total_fake > 0 else 0.0

        sweep_results.append({
            "threshold": t,
            "accuracy": t_acc,
            "fpr": t_fpr,
            "fnr": t_fnr
        })

        # Selection criterion: Highest accuracy, then lowest FPR
        if (t_acc > best_acc) or (t_acc == best_acc and t_fpr < best_fpr):
            best_acc = t_acc
            best_fpr = t_fpr
            best_thresh = t

    # 5. Measure Peak Process RAM
    peak_ram_mb = get_process_peak_ram_mb()

    # 6. Build Formatted Report
    lines = []
    lines.append("=" * 75)
    lines.append("                 TRUTHLENS FORENSIC MODEL EVALUATION REPORT")
    lines.append("=" * 75)
    lines.append(f"Model Backend     : {backend} ({predictor.model_name})")
    lines.append(f"Dataset Size      : {total_eval} images ({total_real} Real, {total_fake} Fake)")
    lines.append(f"Average Latency   : {avg_latency:.1f} ms / image on CPU")
    lines.append(f"Peak Working RAM  : {peak_ram_mb:.1f} MB")
    lines.append(f"Default Cutoff    : {default_threshold:.2f}")
    lines.append("-" * 75)
    lines.append("1. PERFORMANCE SUMMARY (Threshold = {:.2f})".format(default_threshold))
    lines.append(f"   Accuracy               : {acc:.2f}% ({tp + tn}/{total_eval})")
    lines.append(f"   False Positive Rate    : {fpr:.2f}% ({fp}/{total_real} real photos called fake)")
    lines.append(f"   False Negative Rate    : {fnr:.2f}% ({fn}/{total_fake} AI images missed as real)")
    lines.append("")
    lines.append("2. CONFUSION MATRIX")
    lines.append(f"                          Predicted REAL      Predicted FAKE")
    lines.append(f"   Actual REAL (Authentic):   TN = {tn:4d}           FP = {fp:4d}")
    lines.append(f"   Actual FAKE (Synthetic):   FN = {fn:4d}           TP = {tp:4d}")
    lines.append("-" * 75)
    lines.append(f"3. MISCLASSIFIED FILES ({len(misclassified)} total):")
    if not misclassified:
        lines.append("   None! All evaluated samples classified accurately.")
    else:
        for m in misclassified:
            pred = "FAKE" if m["fake_prob"] >= default_threshold else "REAL"
            lines.append(f"   - [{m['ground_truth']:4s} -> Pred {pred:4s}] {m['filename']:35s} (FakeProb: {m['fake_prob']*100:5.1f}%)")
    lines.append("-" * 75)
    lines.append("4. OPTIMAL THRESHOLD SWEEP (0.05 to 0.95)")
    lines.append("   Threshold | Accuracy | FPR (Real->Fake) | FNR (Fake->Real)")
    for s in sweep_results:
        star = " <-- OPTIMAL" if s["threshold"] == best_thresh else ""
        lines.append(f"      {s['threshold']:4.2f}   |  {s['accuracy']:5.1f}%  |      {s['fpr']:5.1f}%      |      {s['fnr']:5.1f}%{star}")
    lines.append("-" * 75)
    lines.append(f"   RECOMMENDED OPTIMAL THRESHOLD: {best_thresh:.2f} (Accuracy: {best_acc:.1f}%, FPR: {best_fpr:.1f}%)")
    lines.append("=" * 75)

    report_text = "\n".join(lines) + "\n"
    print("\n" + report_text)

    summary_data = {
        "backend": backend,
        "model_name": predictor.model_name,
        "total": total_eval,
        "total_real": total_real,
        "total_fake": total_fake,
        "accuracy": acc,
        "fpr": fpr,
        "fnr": fnr,
        "avg_latency_ms": avg_latency,
        "peak_ram_mb": peak_ram_mb,
        "best_threshold": best_thresh,
        "best_accuracy": best_acc,
        "best_fpr": best_fpr,
        "empty": False
    }

    return report_text, summary_data


def main():
    args = parse_args()
    report, data = run_evaluation(args.backend, args.threshold)

    output_path = args.output
    if output_path is None and not data.get("empty"):
        output_path = str(SCRIPT_DIR / f"results_{args.backend}.txt")

    if output_path and not data.get("empty"):
        out_file = Path(output_path)
        if not out_file.is_absolute():
            out_file = SCRIPT_DIR / output_path
        out_file.write_text(report, encoding="utf-8")
        print(f"[*] Results saved to: {out_file}")

if __name__ == "__main__":
    main()
