"""
Tests for server responsiveness during CPU-intensive inference (Step 10 Part A).
"""

import io
import time
import threading
import pytest
from PIL import Image
from starlette.testclient import TestClient
from app.main import app


@pytest.mark.model
def test_health_responsive_during_active_analysis():
    """Verify /api/health responds within 2 seconds while an analysis is running in background thread."""
    client = TestClient(app)

    # Create a test image
    buf = io.BytesIO()
    Image.new("RGB", (256, 256), color=(100, 150, 200)).save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    analysis_finished = threading.Event()
    analysis_error = []

    def run_analysis():
        try:
            resp = client.post(
                "/api/analyze/image",
                files={"file": ("concurrent_test.jpg", img_bytes, "image/jpeg")}
            )
            assert resp.status_code == 200
        except Exception as e:
            analysis_error.append(e)
        finally:
            analysis_finished.set()

    # Launch analysis in a background thread
    t = threading.Thread(target=run_analysis, daemon=True)
    t.start()

    # Poll /api/health while analysis is executing
    # It must answer well within 2.0 seconds
    time.sleep(0.1)  # Allow thread to start request
    t0 = time.time()
    health_resp = client.get("/api/health")
    latency = time.time() - t0

    assert health_resp.status_code == 200
    assert latency < 2.0, f"Health check took {latency:.3f}s, exceeding 2.0s responsiveness threshold"

    # Wait for thread to finish
    analysis_finished.wait(timeout=30.0)
    assert not analysis_error, f"Analysis thread encountered errors: {analysis_error}"
