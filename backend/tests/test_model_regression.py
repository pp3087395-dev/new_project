"""
Model regression tests using real model weights (Phase 3 Step 3).
Marked with @pytest.mark.model so they can be run selectively or skipped during quick unit test runs.
"""

import os
from pathlib import Path
from PIL import Image
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.classifier import AIClassifierService, SigLIPBackend, SmaugBackend

EVAL_DIR = Path(__file__).resolve().parent.parent / "eval"
REAL_IMG = EVAL_DIR / "real" / "1.1.jpeg"
FAKE_IMG = EVAL_DIR / "fake" / "1990s beautiful blonde Supergirl.webp"


@pytest.mark.model
def test_smaug_known_real_and_ai_verdict():
    """Assert Smaug produces REAL verdict for known photograph and FAKE for known AI generation."""
    assert REAL_IMG.exists(), f"Missing real test image: {REAL_IMG}"
    assert FAKE_IMG.exists(), f"Missing fake test image: {FAKE_IMG}"

    backend = SmaugBackend()
    backend.initialize()

    with Image.open(REAL_IMG) as img:
        real_fake_prob, _, _ = backend.predict_fake_probability(img)
    with Image.open(FAKE_IMG) as img:
        fake_fake_prob, _, _ = backend.predict_fake_probability(img)

    threshold = 0.50
    band = 0.10

    # Real photo must have low fake probability (below threshold - band) -> REAL
    assert real_fake_prob < (threshold - band), f"Expected REAL for {REAL_IMG.name}, got p_fake={real_fake_prob:.3f}"

    # AI image must have high fake probability (above threshold + band) -> FAKE
    assert fake_fake_prob > (threshold + band), f"Expected FAKE for {FAKE_IMG.name}, got p_fake={fake_fake_prob:.3f}"


@pytest.mark.model
def test_siglip_known_real_and_ai_verdict():
    """Assert SigLIP produces REAL verdict for known photograph and FAKE for known AI generation."""
    assert REAL_IMG.exists(), f"Missing real test image: {REAL_IMG}"
    assert FAKE_IMG.exists(), f"Missing fake test image: {FAKE_IMG}"

    backend = SigLIPBackend()
    backend.initialize()

    with Image.open(REAL_IMG) as img:
        real_fake_prob, _, _ = backend.predict_fake_probability(img)
    with Image.open(FAKE_IMG) as img:
        fake_fake_prob, _, _ = backend.predict_fake_probability(img)

    threshold = 0.40
    band = 0.10

    # Real photo must have low fake probability (below threshold - band) -> REAL
    assert real_fake_prob < (threshold - band), f"Expected REAL for {REAL_IMG.name}, got p_fake={real_fake_prob:.3f}"

    # AI image must have high fake probability (above threshold + band) -> FAKE
    assert fake_fake_prob > (threshold + band), f"Expected FAKE for {FAKE_IMG.name}, got p_fake={fake_fake_prob:.3f}"


@pytest.mark.model
def test_api_verdict_equals_direct_classifier_verdict():
    """Assert API endpoint /api/analyze/image produces identical verdict and score as direct classifier."""
    assert REAL_IMG.exists(), f"Missing test image: {REAL_IMG}"

    # 1. Direct classifier prediction
    from app.services.classifier import classifier_service
    with Image.open(REAL_IMG) as img:
        direct_result = classifier_service.predict(img)

    # 2. Live API endpoint call
    client = TestClient(app)
    with open(REAL_IMG, "rb") as f:
        response = client.post(
            "/api/analyze/image",
            files={"file": (REAL_IMG.name, f, "image/jpeg")}
        )

    assert response.status_code == 200, f"API error: {response.text}"
    api_data = response.json()
    ai_classification = api_data["ai_classification"]

    # Assert verdicts, predicted_class, and probabilities match
    assert ai_classification["predicted_class"] == direct_result["predicted_class"], (
        f"API class '{ai_classification['predicted_class']}' != Direct '{direct_result['predicted_class']}'"
    )
    assert ai_classification["predicted_label_description"] == direct_result["predicted_label_description"], (
        f"API verdict '{ai_classification['predicted_label_description']}' != Direct '{direct_result['predicted_label_description']}'"
    )
    assert abs(ai_classification["scores"]["FAKE"] - direct_result["scores"]["FAKE"]) < 1e-4, (
        f"API fake score {ai_classification['scores']['FAKE']} != Direct {direct_result['scores']['FAKE']}"
    )
