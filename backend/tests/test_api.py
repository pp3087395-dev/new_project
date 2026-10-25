"""
Tests for API endpoint behavior and error status codes (Step 10 Part A).
"""

import io
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_ping_responds_200():
    """Verify /api/ping returns HTTP 200 with {'ok': True}."""
    resp = client.get("/api/ping")
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}


def test_api_health_responds_200():
    """Verify /api/health returns HTTP 200 with service health dictionary."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "service" in data
    assert "capabilities" in data


def test_corrupt_file_returns_400():
    """Verify corrupt image file upload returns HTTP 400."""
    corrupt_bytes = b"NOT_A_VALID_IMAGE_HEADER_GARBAGE_PAYLOAD"
    resp = client.post(
        "/api/analyze/image",
        files={"file": ("corrupt.jpg", corrupt_bytes, "image/jpeg")}
    )
    assert resp.status_code == 400
    assert "detail" in resp.json()


def test_empty_file_returns_400():
    """Verify empty 0-byte upload returns HTTP 400."""
    resp = client.post(
        "/api/analyze/image",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert resp.status_code == 400
    assert "empty" in resp.json()["detail"].lower()


def test_file_over_15mb_returns_413():
    """Verify upload exceeding 15MB returns HTTP 413 Payload Too Large."""
    oversized_bytes = b"0" * (15 * 1024 * 1024 + 1024)
    resp = client.post(
        "/api/analyze/image",
        files={"file": ("oversized.jpg", oversized_bytes, "image/jpeg")}
    )
    assert resp.status_code == 413
    assert "maximum size limit" in resp.json()["detail"].lower()


def test_non_image_returns_400():
    """Verify non-image text file returns HTTP 400."""
    text_bytes = b"Hello world, this is a plain text document."
    resp = client.post(
        "/api/analyze/image",
        files={"file": ("document.txt", text_bytes, "text/plain")}
    )
    assert resp.status_code == 400


def test_video_endpoint_returns_501():
    """Verify /api/analyze/video returns HTTP 501 Not Implemented."""
    dummy_video = b"FAKE_VIDEO_STREAM"
    resp = client.post(
        "/api/analyze/video",
        files={"file": ("test.mp4", dummy_video, "video/mp4")}
    )
    assert resp.status_code == 501
    assert "scheduled for Phase 4" in resp.json()["detail"]
