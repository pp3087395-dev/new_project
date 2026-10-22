import time
import io
import psutil
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.services.classifier import classifier_service, AIClassifierService

def run_tests():
    print("=" * 60)
    print("TRUTHLENS PHASE 2 VERIFICATION SUITE")
    print("=" * 60)

    # 1. Check Model loads on CPU
    t0 = time.time()
    load_ok = classifier_service.initialize()
    t_load = time.time() - t0
    print(f"[CHECK 1] Model loads on CPU: {load_ok} (initialized in {t_load:.3f}s)")
    assert load_ok is True
    assert classifier_service.is_available is True

    # 2. Check Model loaded once and reused
    sess_id_1 = id(classifier_service._session)
    classifier_service.initialize()
    sess_id_2 = id(classifier_service._session)
    print(f"[CHECK 2] Model loaded once and reused: {sess_id_1 == sess_id_2}")
    assert sess_id_1 == sess_id_2

    with TestClient(app) as client:
        # 3. Check /api/health
        r_health = client.get("/api/health")
        h_data = r_health.json()
        print(f"[CHECK 3] /api/health HTTP {r_health.status_code}, status={h_data.get('status')}, ai_connected={h_data.get('ai_model_connected')}")
        assert r_health.status_code == 200
        assert h_data['ai_model_connected'] is True
        assert h_data['ai_model_status'] == 'ready'

        # 4. Check valid image receives actual model inference
        img = Image.new("RGB", (300, 300), color=(120, 160, 200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        img_bytes = buf.getvalue()

        t_inf_start = time.time()
        r_img = client.post("/api/analyze/image", files={"file": ("valid_test.jpg", img_bytes, "image/jpeg")})
        t_inf_total = time.time() - t_inf_start
        res_data = r_img.json()
        ai = res_data.get("ai_classification", {})
        
        print(f"[CHECK 4] Valid image inference: status={r_img.status_code}, class={ai.get('predicted_class')}, confidence={ai.get('confidence_score')}%, latency={ai.get('inference_time_ms')}ms")
        assert r_img.status_code == 200
        assert ai["status"] == "success"
        assert ai["predicted_class"] in ["REAL", "FAKE"]
        assert ai["confidence_score"] is not None
        assert "REAL" in ai["scores"] and "FAKE" in ai["scores"]
        assert res_data["frequency_analysis"]["fft_visualization_base64"].startswith("data:image/png;base64,")

        # 5. Check invalid image upload rejected safely
        r_bad = client.post("/api/analyze/image", files={"file": ("bad.jpg", b"corrupt_non_image_payload", "image/jpeg")})
        print(f"[CHECK 5] Invalid image rejected safely: HTTP {r_bad.status_code}, detail='{r_bad.json().get('detail')}'")
        assert r_bad.status_code == 400

        # 6. Check model failure does not produce fake predictions
        dummy_broken = AIClassifierService()
        dummy_broken.MODEL_REPO_ID = "invalid/nonexistent-model"
        res_broken = dummy_broken.predict(img)
        print(f"[CHECK 6] Model failure produces honest state: status={res_broken['status']}, predicted_class={res_broken['predicted_class']}, confidence={res_broken['confidence_score']}")
        assert res_broken["status"] == "unavailable"
        assert res_broken["predicted_class"] is None
        assert res_broken["confidence_score"] is None

        # 7. Check filename invariance for identical bytes
        r_name_a = client.post("/api/analyze/image", files={"file": ("original_name.jpg", img_bytes, "image/jpeg")})
        r_name_b = client.post("/api/analyze/image", files={"file": ("renamed_file_different.jpg", img_bytes, "image/jpeg")})
        ai_a = r_name_a.json()["ai_classification"]
        ai_b = r_name_b.json()["ai_classification"]
        print(f"[CHECK 7] Filename invariance: class_a={ai_a['predicted_class']}, class_b={ai_b['predicted_class']}, scores_match={ai_a['scores'] == ai_b['scores']}")
        assert ai_a["predicted_class"] == ai_b["predicted_class"]
        assert ai_a["scores"] == ai_b["scores"]

        # 8. Check memory and latency limits on CPU
        process = psutil.Process()
        mem_mb = process.memory_info().rss / (1024 * 1024)
        print(f"[CHECK 8] Resource utilization: Process RSS memory = {mem_mb:.1f} MB, Total request time = {t_inf_total*1000:.1f} ms")
        assert mem_mb < 1500
        assert ai["inference_time_ms"] < 1000

    print("=" * 60)
    print("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
