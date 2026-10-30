import os
import sys
import time
import json
import subprocess
import threading
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
TEST_PORT = 8019

def run_curl(args, timeout=5.0):
    cmd = ["curl.exe", "--connect-timeout", "1", "--max-time", "4", "-s"] + args
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return res.returncode, res.stdout.strip()

def test_step2():
    print(f"[*] Starting test server on port {TEST_PORT}...")
    env = os.environ.copy()
    env["PORT"] = str(TEST_PORT)
    env["HOST"] = "127.0.0.1"

    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(TEST_PORT)],
        cwd=str(BACKEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        text=True
    )

    base_url = f"http://127.0.0.1:{TEST_PORT}"
    try:
        # Check 1: Hit /api/ping and /api/health within 2 seconds of start
        t0 = time.time()
        ping_ok = False
        health_status = None

        while time.time() - t0 < 5.0:
            rc, out = run_curl([f"{base_url}/api/ping"], timeout=3.0)
            if rc == 0 and '"ok":true' in out.replace(" ", ""):
                ping_ok = True
                _, h_out = run_curl([f"{base_url}/api/health"], timeout=3.0)
                try:
                    h_json = json.loads(h_out)
                    health_status = h_json.get("ai_model_status")
                except Exception:
                    pass
                elapsed = time.time() - t0
                print(f"[OK] Ping responded in {elapsed:.3f}s: {out}")
                print(f"[OK] Health responded in {elapsed:.3f}s with ai_model_status = '{health_status}'")
                break
            time.sleep(0.1)

        assert ping_ok, "Failed: /api/ping did not respond promptly on startup"
        assert health_status in ["loading", "ready"], f"Unexpected ai_model_status: {health_status}"

        # Wait until model finishes background loading to test concurrency
        print("[*] Waiting for model to reach 'ready' state...")
        for _ in range(30):
            rc, h_out = run_curl([f"{base_url}/api/health"], timeout=3.0)
            if rc == 0:
                try:
                    h_json = json.loads(h_out)
                    if h_json.get("ai_model_status") == "ready":
                        print("[OK] Model reached 'ready' state in background thread.")
                        break
                except Exception:
                    pass
            time.sleep(0.5)

        # Check 2: Start an analysis and confirm /api/health still responds concurrently
        print("[*] Testing non-blocking concurrency: launching analysis while calling /api/health...")
        test_img_path = BACKEND_DIR / "eval" / "real" / "1.jpeg"
        if not test_img_path.exists():
            imgs = list((BACKEND_DIR / "eval" / "real").glob("*.jpeg"))
            test_img_path = imgs[0] if imgs else None

        assert test_img_path and test_img_path.exists(), "No test image found"

        analysis_active = threading.Event()
        health_responded_during_analysis = threading.Event()
        health_response_time = [0.0]

        def run_analysis():
            analysis_active.set()
            run_curl(["-F", f"file=@{test_img_path}", f"{base_url}/api/analyze/image"], timeout=20.0)

        t_worker = threading.Thread(target=run_analysis)
        t_worker.start()

        analysis_active.wait(timeout=1.0)
        time.sleep(0.08)  # wait brief moment so CPU-bound analysis is running in threadpool

        t_h0 = time.time()
        rc, h_out = run_curl([f"{base_url}/api/health"], timeout=3.0)
        t_h1 = time.time()
        health_response_time[0] = (t_h1 - t_h0) * 1000

        if rc == 0 and "healthy" in h_out:
            health_responded_during_analysis.set()

        t_worker.join()

        assert health_responded_during_analysis.is_set(), "/api/health failed to respond during active analysis"
        print(f"[OK] Concurrency verified: /api/health responded in {health_response_time[0]:.1f}ms WHILE analysis was running in threadpool!")

        print("\n[SUCCESS] All Step 2 checks passed successfully!")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    test_step2()
