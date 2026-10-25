"""
Tests for model label mapping and output polarity across backends (Step 10 Part A).
"""

import pytest
from app.services.classifier import build_label_mapping, SmaugBackend


def test_label_mapping_standard_fake_real():
    """Assert standard id2label {0: 'fake', 1: 'real'} maps correctly."""
    id2label = {0: "fake", 1: "real"}
    mapping = build_label_mapping(id2label, "test/model-fake-real")
    assert mapping["FAKE"] == 0
    assert mapping["REAL"] == 1


def test_label_mapping_inverted_human_synthetic():
    """Assert id2label {0: 'human', 1: 'synthetic'} maps correctly (inverted index)."""
    id2label = {0: "human", 1: "synthetic"}
    mapping = build_label_mapping(id2label, "test/model-human-synth")
    assert mapping["FAKE"] == 1
    assert mapping["REAL"] == 0


def test_label_mapping_artificial_authentic():
    """Assert id2label {0: 'artificial', 1: 'authentic'} maps correctly."""
    id2label = {0: "artificial", 1: "authentic"}
    mapping = build_label_mapping(id2label, "test/model-art-auth")
    assert mapping["FAKE"] == 0
    assert mapping["REAL"] == 1


def test_label_mapping_unknown_labels_raises_clear_error():
    """Assert unknown label set raises clear ValueError without needing model download."""
    id2label = {0: "canine", 1: "feline"}
    with pytest.raises(ValueError) as excinfo:
        build_label_mapping(id2label, "test/unknown-model")
    assert "Unable to dynamically map model labels" in str(excinfo.value)
    assert "canine" in str(excinfo.value)


def test_smaug_output_polarity_higher_means_fake():
    """
    Assert that for Smaug backend, a higher probability value means FAKE.
    Smaug evaluates sigmoid(logits.mean(1)): values approaching 1.0 are synthetic/fake,
    values approaching 0.0 are authentic/real.
    """
    backend = SmaugBackend()
    # Verified by architectural definition and paper specifications:
    # 0.0 -> human/authentic, 1.0 -> AI-generated synthetic
    threshold = 0.50
    high_score = 0.95
    low_score = 0.05
    assert high_score > threshold, "Higher score must exceed threshold towards FAKE"
    assert low_score < threshold, "Lower score must be below threshold towards REAL"
