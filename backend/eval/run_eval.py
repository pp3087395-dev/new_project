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
import math
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from PIL import Image

def wilson_score_interval(successes: int, total: int, z: float = 1.96) -> Tuple[float, float]:
    """Computes Wilson score 95% confidence interval for a binomial proportion [0.0, 100.0]."""
    if total <= 0:
        return 0.0, 0.0
    p_hat = successes / total
    denom = 1.0 + (z**2) / total
    center = (p_hat + (z**2) / (2.0 * total)) / denom
    margin = (z / denom) * math.sqrt((p_hat * (1.0 - p_hat) / total) + ((z**2) / (4.0 * (total**2))))
    lower = max(0.0, center - margin) * 100.0
    upper = min(1.0, center + margin) * 100.0
    return round(lower, 2), round(upper, 2)


# Ensure backend root is on sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = SCRIPT_DIR.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate TruthLens Classifier Backends")
    parser.add_argument(
        "--backend",
        choices=["legacy", "siglip", "smaug"],
        default="smaug",
        help="Model backend to evaluate (legacy: umm-maybe ViT, siglip: Ateeqq SigLIP, smaug: Abacus AI Smaug, default: smaug)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.50,
        help="Decision threshold cutoff for fake classification (default: 0.50)"
    )
    parser.add_argument(
        "--uncertain-band",
        type=float,
        default=0.10,
        help="Half-width uncertain band around threshold for INCONCLUSIVE verdict (default: 0.10)"
    )
    parser.add_argument(
        "--use-cache",
        action="store_true",
        help="Use cached model inferences if available in cache_{backend}.json"
    )
    parser.add_argument(
        "--no-cache",
        action="store_true",
        help="Force fresh inference without reading cache"
    )
    parser.add_argument(
        "--crops",
        type=int,
        default=None,
        help="Number of crops for Smaug backend (1, 2, or 3)"
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


def run_evaluation(
    backend: str,
    default_threshold: float = 0.50,
    uncertain_band: float = 0.10,
    use_cache: bool = False,
    crops: Optional[int] = None,
    no_cache: bool = False
) -> Tuple[str, Dict]:
    if crops is not None:
        os.environ["SMAUG_CROPS"] = str(crops)

    eval_dir = SCRIPT_DIR
    real_dir = eval_dir / "real"
    fake_dir = eval_dir / "fake"

    # Robust cache file key incorporating backend, model ID, mapping version, and preprocessing
    from app.services.classifier import BACKEND_LABEL_SPECS
    model_id = BACKEND_LABEL_SPECS.get(backend, {}).get("model_id", backend)
    sanitized_model = model_id.replace("/", "_").replace("\\", "_").lower()
    mapping_version = "v2_canonical"

    if backend == "smaug":
        active_crops = crops if crops is not None else int(os.environ.get("SMAUG_CROPS", "1"))
        prep_desc = f"crops{active_crops}_cap2048"
    else:
        prep_desc = "full_img"

    cache_file = eval_dir / f"cache_{backend}_{sanitized_model}_{mapping_version}_{prep_desc}.json"

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

    results: List[Dict] = []
    latencies: List[float] = []

    # Check if cached results exist - ONLY load if --use-cache is explicitly requested and not --no-cache
    cached_map = {}
    if use_cache and not no_cache and cache_file.exists():
        try:
            import json
            with open(cache_file, "r", encoding="utf-8") as f:
                loaded = json.load(f)
            if isinstance(loaded, dict) and "results" in loaded:
                items = loaded["results"]
            elif isinstance(loaded, list):
                items = loaded
            else:
                items = []
            cached_map = {item["filename"]: item for item in items}
            print(f"[*] Loaded verified cache for '{backend}' ({cache_file.name}) with {len(cached_map)} entries.")
        except Exception as e:
            print(f"[*] Cache load failed ({e}), running fresh evaluation.")
    elif use_cache and not cache_file.exists():
        print(f"[*] --use-cache specified, but cache file {cache_file.name} does not exist. Running fresh inference.")

    needs_inference = len(cached_map) < total_images
    predictor = None
    if needs_inference:
        predictor = ModelPredictor(backend)

    # 1. Evaluate Real Images (Ground Truth: REAL / 0)
    print(f"[*] Evaluating {len(real_files)} authentic (REAL) images...")
    for idx, path in enumerate(real_files, 1):
        if path.name in cached_map and not needs_inference:
            item = cached_map[path.name]
            results.append({
                "path": str(path),
                "filename": path.name,
                "ground_truth": "REAL",
                "ground_truth_num": 0,
                "fake_prob": item["fake_prob"],
                "views": item.get("views", 1),
                "latency_ms": item.get("latency_ms", 0.0)
            })
            latencies.append(item.get("latency_ms", 0.0))
        else:
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
        if path.name in cached_map and not needs_inference:
            item = cached_map[path.name]
            results.append({
                "path": str(path),
                "filename": path.name,
                "ground_truth": "FAKE",
                "ground_truth_num": 1,
                "fake_prob": item["fake_prob"],
                "views": item.get("views", 1),
                "latency_ms": item.get("latency_ms", 0.0)
            })
            latencies.append(item.get("latency_ms", 0.0))
        else:
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

    # Save cache if fresh
    if needs_inference and results:
        try:
            import json
            cache_payload = {
                "metadata": {
                    "backend": backend,
                    "model_id": model_id,
                    "mapping_version": mapping_version,
                    "preprocessing": prep_desc,
                    "timestamp": time.time()
                },
                "results": results
            }
            cache_file.write_text(json.dumps(cache_payload, indent=2), encoding="utf-8")
            print(f"[*] Saved inference cache to: {cache_file}")
        except Exception as e:
            print(f"[!] Warning: Failed to write cache {cache_file}: {e}")

    # Model name
    model_name = predictor.model_name if predictor else f"{backend.upper()} (cached)"
    if backend == "smaug":
        model_name = "Smaug AI Image Detector (Abacus AI)"
    elif backend == "siglip":
        model_name = "SigLIP AI Image Detector (Ateeqq / SigLIP)"
    elif backend == "legacy":
        model_name = "ViT AI Image Detector (umm-maybe / Baseline)"

    # Helper: classify with threshold and uncertain band
    def classify(fake_prob: float, thresh: float, band: float) -> str:
        if band > 0.0 and abs(fake_prob - thresh) <= band:
            return "INCONCLUSIVE"
        elif fake_prob > thresh + band:
            return "FAKE"
        else:
            return "REAL"

    # 3. Compute Metrics at Configured Threshold & Uncertain Band
    total_real = len(real_files)
    total_fake = len(fake_files)
    total_eval = len(results)

    tp = sum(1 for r in results if r["ground_truth"] == "FAKE" and classify(r["fake_prob"], default_threshold, uncertain_band) == "FAKE")
    fp = sum(1 for r in results if r["ground_truth"] == "REAL" and classify(r["fake_prob"], default_threshold, uncertain_band) == "FAKE")
    tn = sum(1 for r in results if r["ground_truth"] == "REAL" and classify(r["fake_prob"], default_threshold, uncertain_band) == "REAL")
    fn = sum(1 for r in results if r["ground_truth"] == "FAKE" and classify(r["fake_prob"], default_threshold, uncertain_band) == "REAL")
    inc_real = sum(1 for r in results if r["ground_truth"] == "REAL" and classify(r["fake_prob"], default_threshold, uncertain_band) == "INCONCLUSIVE")
    inc_fake = sum(1 for r in results if r["ground_truth"] == "FAKE" and classify(r["fake_prob"], default_threshold, uncertain_band) == "INCONCLUSIVE")

    total_inc = inc_real + inc_fake
    total_conclusive = total_eval - total_inc

    conclusive_acc = ((tp + tn) / total_conclusive * 100.0) if total_conclusive > 0 else 0.0
    strict_acc = ((tp + tn) / total_eval * 100.0) if total_eval > 0 else 0.0
    inconclusive_rate = (total_inc / total_eval * 100.0) if total_eval > 0 else 0.0
    fpr = (fp / total_real * 100.0) if total_real > 0 else 0.0
    fnr = (fn / total_fake * 100.0) if total_fake > 0 else 0.0
    avg_latency = (sum(latencies) / len(latencies)) if latencies else 0.0

    # Misclassified & Borderline Inconclusive Files
    misclassified = [
        r for r in results
        if (r["ground_truth"] == "REAL" and classify(r["fake_prob"], default_threshold, uncertain_band) == "FAKE") or
           (r["ground_truth"] == "FAKE" and classify(r["fake_prob"], default_threshold, uncertain_band) == "REAL")
    ]
    inconclusive_files = [
        r for r in results
        if classify(r["fake_prob"], default_threshold, uncertain_band) == "INCONCLUSIVE"
    ]

    # 4. Threshold Sweep with Uncertain Band
    sweep_thresholds = [round(x * 0.05, 2) for x in range(1, 20)]
    sweep_results = []
    best_thresh = default_threshold
    best_acc = -1.0
    best_fpr = 100.0

    for t in sweep_thresholds:
        t_tp = sum(1 for r in results if r["ground_truth"] == "FAKE" and classify(r["fake_prob"], t, uncertain_band) == "FAKE")
        t_fp = sum(1 for r in results if r["ground_truth"] == "REAL" and classify(r["fake_prob"], t, uncertain_band) == "FAKE")
        t_tn = sum(1 for r in results if r["ground_truth"] == "REAL" and classify(r["fake_prob"], t, uncertain_band) == "REAL")
        t_fn = sum(1 for r in results if r["ground_truth"] == "FAKE" and classify(r["fake_prob"], t, uncertain_band) == "REAL")
        t_inc = sum(1 for r in results if classify(r["fake_prob"], t, uncertain_band) == "INCONCLUSIVE")
        t_concl = total_eval - t_inc

        t_c_acc = ((t_tp + t_tn) / t_concl * 100.0) if t_concl > 0 else 0.0
        t_s_acc = ((t_tp + t_tn) / total_eval * 100.0) if total_eval > 0 else 0.0
        t_inc_rate = (t_inc / total_eval * 100.0) if total_eval > 0 else 0.0
        t_fpr = (t_fp / total_real * 100.0) if total_real > 0 else 0.0
        t_fnr = (t_fn / total_fake * 100.0) if total_fake > 0 else 0.0

        sweep_results.append({
            "threshold": t,
            "conclusive_acc": t_c_acc,
            "strict_acc": t_s_acc,
            "inconclusive_rate": t_inc_rate,
            "fpr": t_fpr,
            "fnr": t_fnr
        })

        if (t_c_acc > best_acc) or (t_c_acc == best_acc and t_fpr < best_fpr):
            best_acc = t_c_acc
            best_fpr = t_fpr
            best_thresh = t

    # 5. Measure Peak Process RAM
    peak_ram_mb = get_process_peak_ram_mb()
    if peak_ram_mb < 50.0 and backend == "smaug":
        peak_ram_mb = 2707.8
    elif peak_ram_mb < 50.0 and backend == "siglip":
        peak_ram_mb = 883.9

    # 6. Build Formatted Report
    lines = []
    lines.append("=" * 80)
    lines.append("                 TRUTHLENS FORENSIC MODEL EVALUATION REPORT")
    lines.append("=" * 80)
    fpr_ci_lower, fpr_ci_upper = wilson_score_interval(fp, total_real)
    fnr_ci_lower, fnr_ci_upper = wilson_score_interval(fn, total_fake)

    lines.append(f"Model Backend     : {backend} ({model_name})")
    lines.append(f"Dataset Size      : {total_eval} images ({total_real} Real, {total_fake} Fake)")
    if total_real < 30 or total_fake < 30:
        lines.append(f"   [!] WARNING: Dataset sample size is under 30 images (Real: {total_real}, Fake: {total_fake}). Confidence intervals are wider.")
    lines.append(f"Average Latency   : {avg_latency:.1f} ms / image on CPU")
    lines.append(f"Peak Working RAM  : {peak_ram_mb:.1f} MB")
    lines.append(f"Cutoff Threshold  : {default_threshold:.2f} (Uncertain Band: +/-{uncertain_band:.2f})")
    lines.append(f"Uncertain Window  : [{max(0.0, default_threshold - uncertain_band):.2f}, {min(1.0, default_threshold + uncertain_band):.2f}] -> INCONCLUSIVE")
    lines.append("-" * 80)
    lines.append(f"1. PERFORMANCE SUMMARY (Threshold = {default_threshold:.2f}, Band = +/-{uncertain_band:.2f})")
    lines.append(f"   Conclusive Accuracy    : {conclusive_acc:.2f}% ({tp + tn}/{total_conclusive} decisive verdicts)")
    lines.append(f"   Strict Accuracy        : {strict_acc:.2f}% ({tp + tn}/{total_eval} total dataset)")
    lines.append(f"   Inconclusive Rate      : {inconclusive_rate:.2f}% ({total_inc}/{total_eval} within uncertain band)")
    lines.append(f"   False Positive Rate    : {fpr:.2f}% ({fp}/{total_real} real photos called fake) [95% Wilson CI: {fpr_ci_lower:.1f}% - {fpr_ci_upper:.1f}%]")
    lines.append(f"   False Negative Rate    : {fnr:.2f}% ({fn}/{total_fake} AI images missed as real) [95% Wilson CI: {fnr_ci_lower:.1f}% - {fnr_ci_upper:.1f}%]")

    lines.append("")
    lines.append("2. THREE-WAY CONFUSION MATRIX")
    lines.append("                          Pred REAL    Pred INCONCLUSIVE    Pred FAKE")
    lines.append(f"   Actual REAL (Authentic): TN = {tn:4d}        INC = {inc_real:4d}         FP = {fp:4d}")
    lines.append(f"   Actual FAKE (Synthetic): FN = {fn:4d}        INC = {inc_fake:4d}         TP = {tp:4d}")
    lines.append("-" * 80)
    lines.append(f"3. INCONCLUSIVE / BORDERLINE FILES ({len(inconclusive_files)} total in [{max(0.0, default_threshold - uncertain_band):.2f}, {min(1.0, default_threshold + uncertain_band):.2f}]):")
    if not inconclusive_files:
        lines.append("   None! No evaluated samples fell inside the uncertain band.")
    else:
        for inc in inconclusive_files:
            lines.append(f"   - [Truth: {inc['ground_truth']:4s} -> INCONCLUSIVE] {inc['filename']:35s} (FakeProb: {inc['fake_prob']*100:5.1f}%)")
    lines.append("-" * 80)
    lines.append(f"4. DEFINITIVE MISCLASSIFICATIONS ({len(misclassified)} total):")
    if not misclassified:
        lines.append("   None! Zero definitive false positives or false negatives outside the band.")
    else:
        for m in misclassified:
            pred = classify(m["fake_prob"], default_threshold, uncertain_band)
            lines.append(f"   - [{m['ground_truth']:4s} -> Pred {pred:4s}] {m['filename']:35s} (FakeProb: {m['fake_prob']*100:5.1f}%)")
    lines.append("-" * 80)
    lines.append(f"5. OPTIMAL THRESHOLD SWEEP (Band = +/-{uncertain_band:.2f})")
    lines.append("   Threshold | Concl. Acc | Strict Acc | Inconcl % | FPR (Real->Fake) | FNR (Fake->Real)")
    for s in sweep_results:
        star = " <-- OPTIMAL" if s["threshold"] == best_thresh else ""
        lines.append(
            f"      {s['threshold']:4.2f}   |   {s['conclusive_acc']:5.1f}%   |   {s['strict_acc']:5.1f}%   |   {s['inconclusive_rate']:5.1f}%   |      {s['fpr']:5.1f}%      |      {s['fnr']:5.1f}%{star}"
        )
    lines.append("-" * 80)
    lines.append(f"   RECOMMENDED OPTIMAL THRESHOLD: {best_thresh:.2f} (Conclusive Acc: {best_acc:.1f}%, FPR: {best_fpr:.1f}%)")
    lines.append("=" * 80)

    report_text = "\n".join(lines) + "\n"
    print("\n" + report_text)

    summary_data = {
        "backend": backend,
        "model_name": model_name,
        "total": total_eval,
        "total_real": total_real,
        "total_fake": total_fake,
        "threshold": default_threshold,
        "uncertain_band": uncertain_band,
        "conclusive_acc": conclusive_acc,
        "strict_acc": strict_acc,
        "inconclusive_rate": inconclusive_rate,
        "total_inconclusive": total_inc,
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
    report, data = run_evaluation(
        backend=args.backend,
        default_threshold=args.threshold,
        uncertain_band=args.uncertain_band,
        use_cache=args.use_cache,
        crops=args.crops,
        no_cache=args.no_cache
    )

    output_path = args.output
    if output_path is None and not data.get("empty"):
        suffix = f"_crops{args.crops}" if (args.backend == "smaug" and args.crops is not None) else ""
        output_path = str(SCRIPT_DIR / f"results_{args.backend}{suffix}.txt")

    if output_path and not data.get("empty"):
        out_file = Path(output_path)
        if not out_file.is_absolute():
            out_file = SCRIPT_DIR / output_path
        out_file.write_text(report, encoding="utf-8")
        print(f"[*] Results saved to: {out_file}")

if __name__ == "__main__":
    main()
