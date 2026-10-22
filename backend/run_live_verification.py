import os
import sys
import time
import io
import json
import urllib.request
import urllib.parse
import mimetypes
import psutil
from PIL import Image

def post_multipart(url: str, filename: str, file_bytes: bytes, mime_type: str = "image/jpeg"):
    boundary = "----WebKitFormBoundaryTruthLensTestBoundary7MA4YWxkTrZu0gW"
    body = io.BytesIO()
    body.write(f"--{boundary}\r\n".encode())
    body.write(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode())
    body.write(f"Content-Type: {mime_type}\r\n\r\n".encode())
    body.write(file_bytes)
    body.write(b"\r\n")
    body.write(f"--{boundary}--\r\n".encode())
    
    req = urllib.request.Request(
        url,
        data=body.getvalue(),
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}"
        },
        method="POST"
    )
    return req

def run_all_tests():
    print("=" * 75)
    print("      TRUTHLENS LIVE END-TO-END MODEL & API TEST EXECUTION SUITE      ")
    print("=" * 75)
    
    BASE_URL = "http://127.0.0.1:8000"
    all_passed = True
    
    # -------------------------------------------------------------
    # TEST 1 & 2: Backend starts successfully & /api/health works
    # -------------------------------------------------------------
    print("\n[TEST 1 & 2] Checking Live Backend Server & /api/health Endpoint...")
    try:
        t0 = time.time()
        with urllib.request.urlopen(f"{BASE_URL}/api/health", timeout=5) as resp:
            status_code = resp.status
            health_json = json.loads(resp.read().decode())
        t_health = (time.time() - t0) * 1000
        
        print(f"  --> HTTP Status: {status_code} OK (responded in {t_health:.1f}ms)")
        print(f"  --> Service: {health_json.get('service')} (version {health_json.get('version')})")
        print(f"  --> Mode: {health_json.get('mode')}")
        print(f"  --> AI Model Connected: {health_json.get('ai_model_connected')}")
        print(f"  --> AI Model Name: {health_json.get('ai_model_name')}")
        print(f"  --> AI Model Status: {health_json.get('ai_model_status')}")
        print(f"  --> Active Capabilities: {len(health_json.get('capabilities', []))} items")
        
        assert status_code == 200, f"Expected 200, got {status_code}"
        assert health_json.get("status") == "healthy", "Server status is not healthy"
        assert health_json.get("ai_model_connected") is True, "AI model is not reported as connected"
        assert health_json.get("ai_model_status") == "ready", "AI model status is not 'ready'"
        print("  [RESULT]: PASSED - Backend is live, healthy, and AI model is connected.")
    except Exception as e:
        print(f"  [RESULT]: FAILED - {e}")
        all_passed = False

    # -------------------------------------------------------------
    # TEST 3: Model loads successfully on CPU
    # -------------------------------------------------------------
    print("\n[TEST 3] Verifying Model Loading & CPU Runtime Environment...")
    try:
        from app.services.classifier import classifier_service
        
        t0 = time.time()
        is_ready = classifier_service.initialize()
        t_init = time.time() - t0
        
        print(f"  --> Classifier Service initialized: {is_ready} ({t_init:.3f}s)")
        print(f"  --> Model Repository ID: {classifier_service.MODEL_REPO_ID}")
        print(f"  --> Model File: {classifier_service.MODEL_FILENAME}")
        print(f"  --> Target Preprocessing Size: {classifier_service.TARGET_SIZE}")
        print(f"  --> Supported Class Mapping: {classifier_service.ID2LABEL}")
        print(f"  --> ONNX Session Providers: {classifier_service._session.get_providers()}")
        
        assert is_ready is True, "Model initialization returned False"
        assert "CPUExecutionProvider" in classifier_service._session.get_providers(), "CPUExecutionProvider missing"
        print("  [RESULT]: PASSED - Model is confirmed loaded on CPU using CPUExecutionProvider.")
    except Exception as e:
        print(f"  [RESULT]: FAILED - {e}")
        all_passed = False

    # -------------------------------------------------------------
    # TEST 4: Valid image receives actual model inference
    # -------------------------------------------------------------
    print("\n[TEST 4] Testing Actual Model Inference via HTTP POST /api/analyze/image...")
    try:
        # Create a synthetic image buffer with identifiable patterns
        test_img = Image.new("RGB", (320, 240), color=(140, 180, 210))
        buf = io.BytesIO()
        test_img.save(buf, format="JPEG", quality=95)
        valid_bytes = buf.getvalue()
        
        req = post_multipart(f"{BASE_URL}/api/analyze/image", "sample_test_image.jpg", valid_bytes)
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=10) as resp:
            status_code = resp.status
            res_json = json.loads(resp.read().decode())
        t_req = (time.time() - t0) * 1000
        
        ai = res_json.get("ai_classification", {})
        fft = res_json.get("frequency_analysis", {})
        meta = res_json.get("metadata_analysis", {})
        
        print(f"  --> HTTP Status: {status_code} OK (Roundtrip: {t_req:.1f}ms)")
        print(f"  --> Audit ID: {res_json.get('id')}")
        print(f"  --> SHA-256: {res_json.get('sha256_hash')[:24]}...")
        print(f"  --> AI Predicted Class: {ai.get('predicted_class')} ({ai.get('predicted_label_description')})")
        print(f"  --> Confidence Score: {ai.get('confidence_score')}%")
        print(f"  --> Class Scores: FAKE = {ai.get('scores', {}).get('FAKE')}, REAL = {ai.get('scores', {}).get('REAL')}")
        print(f"  --> Raw Logits: FAKE = {ai.get('raw_logits', {}).get('FAKE')}, REAL = {ai.get('raw_logits', {}).get('REAL')}")
        print(f"  --> Inference Latency: {ai.get('inference_time_ms')} ms")
        print(f"  --> Calibration Statement: '{ai.get('calibration_statement')[:75]}...'")
        print(f"  --> Scope Limitation: '{ai.get('scope_limitation')[:75]}...'")
        print(f"  --> 2D-FFT Computed Magnitude Spectrum: {fft.get('method')} ({len(fft.get('fft_visualization_base64', ''))} chars)")
        print(f"  --> Radial Energy Distribution: Low={fft.get('energy_distribution', {}).get('low_frequency_pct')}%, Mid={fft.get('energy_distribution', {}).get('mid_frequency_pct')}%, High={fft.get('energy_distribution', {}).get('high_frequency_pct')}%")
        print(f"  --> Image Metadata Dimensions: {meta.get('dimensions', {}).get('width')}x{meta.get('dimensions', {}).get('height')}")
        
        assert status_code == 200, f"Expected 200, got {status_code}"
        assert ai.get("status") == "success", "AI status is not success"
        assert ai.get("predicted_class") in ["REAL", "FAKE"], "Invalid predicted class"
        assert ai.get("confidence_score") is not None, "Confidence score is None"
        assert ai.get("scores", {}).get("FAKE") is not None, "Fake score missing"
        assert ai.get("scores", {}).get("REAL") is not None, "Real score missing"
        assert fft.get("fft_visualization_base64", "").startswith("data:image/png;base64,"), "FFT visualization missing"
        print("  [RESULT]: PASSED - Real ONNX inference executed and returned genuine classification scores.")
    except Exception as e:
        print(f"  [RESULT]: FAILED - {e}")
        all_passed = False

    # -------------------------------------------------------------
    # TEST 5: Invalid image uploads are rejected safely
    # -------------------------------------------------------------
    print("\n[TEST 5] Testing Rejection of Invalid/Corrupted Image Uploads...")
    try:
        # A. Corrupted bytes
        corrupted_bytes = b"CORRUPTED_NON_IMAGE_DATA_123456789"
        req_corrupt = post_multipart(f"{BASE_URL}/api/analyze/image", "corrupt.jpg", corrupted_bytes)
        try:
            with urllib.request.urlopen(req_corrupt, timeout=5) as resp:
                status_code = resp.status
        except urllib.error.HTTPError as err:
            status_code = err.code
            err_msg = json.loads(err.read().decode()).get("detail")
        
        print(f"  --> Corrupt Upload HTTP Status: {status_code} (Expected 400)")
        print(f"  --> Error Detail: '{err_msg}'")
        assert status_code == 400, f"Expected HTTP 400, got {status_code}"
        
        # B. Empty file (0 bytes)
        req_empty = post_multipart(f"{BASE_URL}/api/analyze/image", "empty.jpg", b"")
        try:
            with urllib.request.urlopen(req_empty, timeout=5) as resp:
                status_empty = resp.status
        except urllib.error.HTTPError as err:
            status_empty = err.code
            empty_msg = json.loads(err.read().decode()).get("detail")
            
        print(f"  --> Empty File Upload HTTP Status: {status_empty} (Expected 400)")
        print(f"  --> Error Detail: '{empty_msg}'")
        assert status_empty == 400, f"Expected HTTP 400, got {status_empty}"
        print("  [RESULT]: PASSED - Invalid and corrupted uploads safely rejected without server errors.")
    except Exception as e:
        print(f"  [RESULT]: FAILED - {e}")
        all_passed = False

    # -------------------------------------------------------------
    # TEST 6: Model failure does not produce fake predictions
    # -------------------------------------------------------------
    print("\n[TEST 6] Testing That Model Failures Produce Honest Unavailable Status (No Mock Fallbacks)...")
    try:
        from app.services.classifier import AIClassifierService
        
        broken_service = AIClassifierService()
        broken_service.MODEL_REPO_ID = "nonexistent/invalid-weights-repo"
        
        dummy_img = Image.new("RGB", (100, 100))
        fallback_res = broken_service.predict(dummy_img)
        
        print(f"  --> Status: '{fallback_res.get('status')}'")
        print(f"  --> Predicted Class: {fallback_res.get('predicted_class')} (Must be None)")
        print(f"  --> Confidence Score: {fallback_res.get('confidence_score')} (Must be None)")
        print(f"  --> Class Scores Dict: {fallback_res.get('scores')} (Must be None)")
        print(f"  --> Error Message: '{fallback_res.get('error_message')[:70]}...'")
        
        assert fallback_res.get("status") == "unavailable", "Expected status 'unavailable'"
        assert fallback_res.get("predicted_class") is None, "Fabricated predicted_class found"
        assert fallback_res.get("confidence_score") is None, "Fabricated confidence_score found"
        assert fallback_res.get("scores") is None, "Fabricated scores dictionary found"
        print("  [RESULT]: PASSED - System never fabricates scores on model initialization failure.")
    except Exception as e:
        print(f"  [RESULT]: FAILED - {e}")
        all_passed = False

    # -------------------------------------------------------------
    # TEST 7: Changing only filename does not change model prediction
    # -------------------------------------------------------------
    print("\n[TEST 7] Testing Invariance to Filename Changes for Identical Image Bytes...")
    try:
        # Same exact bytes sent under different names
        req_name1 = post_multipart(f"{BASE_URL}/api/analyze/image", "original_photo_filename.jpg", valid_bytes)
        req_name2 = post_multipart(f"{BASE_URL}/api/analyze/image", "completely_different_name_007.jpeg", valid_bytes)
        
        with urllib.request.urlopen(req_name1, timeout=5) as r1:
            data1 = json.loads(r1.read().decode())
        with urllib.request.urlopen(req_name2, timeout=5) as r2:
            data2 = json.loads(r2.read().decode())
            
        ai1 = data1["ai_classification"]
        ai2 = data2["ai_classification"]
        
        print(f"  --> Request 1 ('{data1['file_name']}'): Class = {ai1['predicted_class']}, Fake Score = {ai1['scores']['FAKE']}, Real Score = {ai1['scores']['REAL']}")
        print(f"  --> Request 2 ('{data2['file_name']}'): Class = {ai2['predicted_class']}, Fake Score = {ai2['scores']['FAKE']}, Real Score = {ai2['scores']['REAL']}")
        print(f"  --> SHA-256 Identical: {data1['sha256_hash'] == data2['sha256_hash']}")
        print(f"  --> Predictions Exactly Match: {ai1['predicted_class'] == ai2['predicted_class'] and ai1['scores'] == ai2['scores']}")
        
        assert data1["sha256_hash"] == data2["sha256_hash"], "SHA-256 hash mismatch for identical bytes"
        assert ai1["predicted_class"] == ai2["predicted_class"], "Class changed with filename"
        assert ai1["scores"] == ai2["scores"], "Scores changed with filename"
        print("  [RESULT]: PASSED - Model predictions are strictly deterministic and invariant to filename.")
    except Exception as e:
        print(f"  [RESULT]: FAILED - {e}")
        all_passed = False

    # -------------------------------------------------------------
    # TEST 8: Model is loaded once and reused
    # -------------------------------------------------------------
    print("\n[TEST 8] Testing Model Session Persistence and Reuse...")
    try:
        from app.services.classifier import classifier_service
        
        sess_before = classifier_service._session
        id_before = id(sess_before)
        
        # Fire 3 consecutive inferences and track timings
        latencies = []
        for i in range(3):
            t_start = time.time()
            classifier_service.predict(test_img)
            latencies.append((time.time() - t_start) * 1000)
            
        sess_after = classifier_service._session
        id_after = id(sess_after)
        
        print(f"  --> Session Object ID: Before = {id_before}, After = {id_after} (Identical: {id_before == id_after})")
        print(f"  --> Latencies across 3 consecutive runs: {latencies[0]:.1f}ms, {latencies[1]:.1f}ms, {latencies[2]:.1f}ms")
        
        assert id_before == id_after, "Session object was recreated instead of reused"
        assert all(l < 300 for l in latencies), "Inference latency exceeded expected threshold"
        print("  [RESULT]: PASSED - Single ONNX session persisted and reused across calls.")
    except Exception as e:
        print(f"  [RESULT]: FAILED - {e}")
        all_passed = False

    # -------------------------------------------------------------
    # TEST 9: Resource & CPU memory limits
    # -------------------------------------------------------------
    print("\n[TEST 9] Testing Memory & Latency Limits on CPU...")
    try:
        process = psutil.Process(os.getpid())
        mem_rss_mb = process.memory_info().rss / (1024 * 1024)
        print(f"  --> Current Process RSS Memory: {mem_rss_mb:.1f} MB (Limit: 1500 MB)")
        print(f"  --> System Physical RAM: {psutil.virtual_memory().total / (1024**3):.1f} GB")
        print(f"  --> CPU Count (Logical): {psutil.cpu_count()}")
        
        assert mem_rss_mb < 1500, f"Memory RSS exceeded limit: {mem_rss_mb} MB"
        print("  [RESULT]: PASSED - Memory footprint well within 16 GB laptop limits.")
    except Exception as e:
        print(f"  [RESULT]: FAILED - {e}")
        all_passed = False

    print("\n" + "=" * 75)
    if all_passed:
        print("    SUMMARY: ALL BACKEND & MODEL VERIFICATION CHECKS PASSED (100%)    ")
    else:
        print("    SUMMARY: ONE OR MORE CHECKS FAILED                               ")
    print("=" * 75)
    return all_passed

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
