"""
Evaluation set regression test against real and synthetic image benchmarks (Step 10 Part A).

Asserts performance limits configurable at the top of this file:
- No more than MAX_ALLOWED_FALSE_POSITIVES real photos called FAKE (FP <= 1)
- At least MIN_REQUIRED_AI_DETECTION_RATE of AI images not called REAL (Recall >= 90%)
"""

import os
from pathlib import Path
import pytest
from PIL import Image

# ==============================================================================
# EDITABLE EVALUATION THRESHOLDS
# ==============================================================================
MAX_ALLOWED_FALSE_POSITIVES = 1        # No more than 1 real photo called FAKE
MIN_REQUIRED_AI_DETECTION_RATE = 0.90  # At least 90% of AI images not called REAL
# ==============================================================================

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
BACKEND_DIR = Path(__file__).resolve().parent.parent
EVAL_DIR = BACKEND_DIR / "eval"
REAL_DIR = EVAL_DIR / "real"
FAKE_DIR = EVAL_DIR / "fake"


def collect_images(folder: Path):
    if not folder.exists():
        return []
    return [p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS]


@pytest.mark.model
def test_evaluation_dataset_accuracy_thresholds():
    """Run active model on evaluation dataset and verify accuracy against thresholds."""
    from app.services.classifier import classifier_service

    real_images = collect_images(REAL_DIR)
    fake_images = collect_images(FAKE_DIR)

    if len(real_images) == 0 and len(fake_images) == 0:
        pytest.skip(f"Evaluation folders are empty ({REAL_DIR}, {FAKE_DIR}). Populate with images to run eval set test.")

    if not classifier_service.is_available:
        classifier_service.initialize()

    # 1. Evaluate authentic REAL images
    false_positives = 0
    for p in real_images:
        with Image.open(p) as img:
            res = classifier_service.predict(img)
            if res["predicted_class"] == "FAKE":
                false_positives += 1

    assert false_positives <= MAX_ALLOWED_FALSE_POSITIVES, (
        f"False positive limit exceeded: {false_positives} real photos called FAKE (max allowed: {MAX_ALLOWED_FALSE_POSITIVES})."
    )

    # 2. Evaluate synthetic FAKE images
    false_negatives = 0
    total_fake = len(fake_images)
    for p in fake_images:
        with Image.open(p) as img:
            res = classifier_service.predict(img)
            if res["predicted_class"] == "REAL":
                false_negatives += 1

    if total_fake > 0:
        ai_detected_rate = (total_fake - false_negatives) / total_fake
        assert ai_detected_rate >= MIN_REQUIRED_AI_DETECTION_RATE, (
            f"AI detection rate too low: {ai_detected_rate*100:.1f}% not called REAL "
            f"(required at least {MIN_REQUIRED_AI_DETECTION_RATE*100:.1f}%). "
            f"Missed {false_negatives}/{total_fake} AI images as REAL."
        )
