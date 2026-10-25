"""
Measure speed, peak RAM, and accuracy across SMAUG_CROPS = 1, 2, 3
and measure the impact of capping maximum dimension at 2048px.
"""

import os
import sys
import time
from pathlib import Path
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = SCRIPT_DIR.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.classifier import SmaugBackend, safe_to_rgb

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def get_peak_ram_mb() -> float:
    try:
        import subprocess
        pid = os.getpid()
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-Command", f"(Get-Process -Id {pid}).PeakWorkingSet64 / 1MB"],
            text=True,
            timeout=5.0
        )
        return round(float(out.strip()), 1)
    except Exception:
        return 0.0

def classify(fake_prob: float, thresh: float = 0.50, band: float = 0.10) -> str:
    if band > 0.0 and abs(fake_prob - thresh) <= band:
        return "INCONCLUSIVE"
    elif fake_prob > thresh + band:
        return "FAKE"
    else:
        return "REAL"

def run_experiment():
    real_files = sorted([p for p in (SCRIPT_DIR / "real").iterdir() if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS])
    fake_files = sorted([p for p in (SCRIPT_DIR / "fake").iterdir() if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS])
    all_files = [(p, "REAL") for p in real_files] + [(p, "FAKE") for p in fake_files]
    total_real = len(real_files)
    total_fake = len(fake_files)
    total_images = len(all_files)

    print(f"[*] Total dataset: {total_images} images ({total_real} Real, {total_fake} Fake)")
    print("[*] Initializing Smaug detector once...")
    smaug = SmaugBackend()
    smaug.initialize()

    # Pre-load all PIL images into memory to isolate model inference latency from disk I/O
    print("[*] Pre-loading image files into memory...")
    loaded_images = []
    for path, gt in all_files:
        with Image.open(path) as img:
            loaded_images.append((path.name, img.copy(), gt))

    configs = [
        {"crops": 1, "name": "SMAUG_CROPS=1", "cap_2048": True},
        {"crops": 2, "name": "SMAUG_CROPS=2", "cap_2048": True},
        {"crops": 3, "name": "SMAUG_CROPS=3", "cap_2048": True},
        {"crops": 1, "name": "SMAUG_CROPS=1 (no 2048 cap)", "cap_2048": False},
    ]

    results_table = []

    for cfg in configs:
        crops = cfg["crops"]
        cap_2048 = cfg["cap_2048"]
        os.environ["SMAUG_CROPS"] = str(crops)
        os.environ["CAP_INPUT_2048"] = "true" if cap_2048 else "false"
        smaug.crops = crops

        print(f"\n========================================================")
        print(f" Running evaluation: {cfg['name']} (crops={crops}, cap_2048={cap_2048})")
        print(f"========================================================")

        t_start = time.time()
        latencies = []
        preds = []

        for idx, (name, orig_img, gt) in enumerate(loaded_images, 1):
            img = orig_img.copy()
            if not cap_2048:
                # Bypass the 2048 cap
                pass
            t0 = time.time()
            fake_prob, views_eval, _ = smaug.predict_fake_probability(img)
            dur = time.time() - t0
            latencies.append(dur)
            verdict = classify(fake_prob, 0.50, 0.10)
            preds.append({"name": name, "gt": gt, "fake_prob": fake_prob, "verdict": verdict, "latency": dur})
            if idx % 10 == 0 or idx == total_images:
                print(f"  [{idx}/{total_images}] {name:30} -> {verdict:12} ({fake_prob*100:5.1f}%, {dur:.2f}s)")

        total_time = time.time() - t_start
        avg_sec = sum(latencies) / len(latencies)
        peak_ram = get_peak_ram_mb()

        # Compute metrics
        tp = sum(1 for p in preds if p["gt"] == "FAKE" and p["verdict"] == "FAKE")
        tn = sum(1 for p in preds if p["gt"] == "REAL" and p["verdict"] == "REAL")
        fp = sum(1 for p in preds if p["gt"] == "REAL" and p["verdict"] == "FAKE")
        fn = sum(1 for p in preds if p["gt"] == "FAKE" and p["verdict"] == "REAL")
        inc_real = sum(1 for p in preds if p["gt"] == "REAL" and p["verdict"] == "INCONCLUSIVE")
        inc_fake = sum(1 for p in preds if p["gt"] == "FAKE" and p["verdict"] == "INCONCLUSIVE")
        total_inc = inc_real + inc_fake
        conclusive = total_images - total_inc

        acc = (tp + tn) / conclusive * 100.0 if conclusive > 0 else 0.0
        strict_acc = (tp + tn) / total_images * 100.0
        inc_rate = total_inc / total_images * 100.0

        row = {
            "name": cfg["name"],
            "crops": crops,
            "cap_2048": cap_2048,
            "conclusive_acc": round(acc, 2),
            "strict_acc": round(strict_acc, 2),
            "real_called_fake_fp": fp,
            "ai_missed_fn": fn,
            "inconclusive_count": total_inc,
            "inconclusive_rate": round(inc_rate, 2),
            "avg_sec": round(avg_sec, 2),
            "peak_ram_mb": peak_ram
        }
        results_table.append(row)
        print(f"\nCompleted {cfg['name']}: Accuracy = {acc:.2f}%, FP = {fp}, FN = {fn}, Inc = {total_inc} ({inc_rate:.1f}%), Avg = {avg_sec:.2f}s/img, Peak RAM = {peak_ram} MB")

    print("\n" + "=" * 90)
    print("                      SPEED VS ACCURACY COMPARISON TABLE")
    print("=" * 90)
    header = f"{'Config':<28} | {'Concl Acc':<9} | {'Strict Acc':<10} | {'FP (Real->Fake)':<15} | {'FN (AI Miss)':<12} | {'Inc Rate':<8} | {'Avg s/img':<9} | {'Peak RAM':<9}"
    print(header)
    print("-" * len(header))
    for r in results_table:
        print(f"{r['name']:<28} | {r['conclusive_acc']:>7.2f}% | {r['strict_acc']:>8.2f}% | {r['real_called_fake_fp']:>15} | {r['ai_missed_fn']:>12} | {r['inconclusive_rate']:>6.1f}% | {r['avg_sec']:>7.2f}s | {r['peak_ram_mb']:>7.1f}MB")
    print("=" * 90)

    # Save summary to file
    import json
    out_path = SCRIPT_DIR / "crops_speed_experiment.json"
    out_path.write_text(json.dumps(results_table, indent=2), encoding="utf-8")
    print(f"[*] Results saved to {out_path}")

if __name__ == "__main__":
    run_experiment()
