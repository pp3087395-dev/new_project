"""
Tests for deterministic SHA-256 Audit IDs (Step 10 Part A).
"""

import hashlib
from PIL import Image
import io
from app.services.detector import detector_service


def test_audit_id_identical_for_identical_bytes():
    """Identical image bytes must produce the exact identical Audit ID."""
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), color=(50, 100, 150)).save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    resp1 = detector_service.analyze_image(img_bytes, "file1.jpg")
    resp2 = detector_service.analyze_image(img_bytes, "different_name.jpg")

    assert resp1.id == resp2.id
    assert resp1.sha256_hash == resp2.sha256_hash


def test_audit_id_different_for_different_images():
    """Different image payloads must produce distinct Audit IDs."""
    buf1 = io.BytesIO()
    Image.new("RGB", (64, 64), color=(10, 20, 30)).save(buf1, format="PNG")

    buf2 = io.BytesIO()
    Image.new("RGB", (64, 64), color=(200, 210, 220)).save(buf2, format="PNG")

    resp1 = detector_service.analyze_image(buf1.getvalue(), "img1.png")
    resp2 = detector_service.analyze_image(buf2.getvalue(), "img2.png")

    assert resp1.id != resp2.id
    assert resp1.sha256_hash != resp2.sha256_hash


def test_audit_id_derived_from_sha256():
    """Audit ID must be derived deterministically from the SHA-256 digest."""
    buf = io.BytesIO()
    Image.new("RGB", (32, 32), color=(75, 85, 95)).save(buf, format="JPEG")
    raw_bytes = buf.getvalue()

    expected_hex = hashlib.sha256(raw_bytes).hexdigest()
    expected_id = f"TL-{expected_hex[:10].upper()}"

    resp = detector_service.analyze_image(raw_bytes, "check_hash.jpg")
    assert resp.sha256_hash == f"sha256:{expected_hex}"
    assert resp.id == expected_id
