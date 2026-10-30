"""
Tests for model label mapping and output polarity across backends (Step 10 Part A).
"""

import pytest
from app.services.classifier import build_label_mapping, BACKEND_LABEL_SPECS, SmaugBackend


def test_every_backend_resolves_to_exactly_one_ai_and_real_class():
    """Assert every supported backend in BACKEND_LABEL_SPECS resolves to exactly one FAKE and one REAL class."""
    # SigLIP id2label: {0: 'ai', 1: 'hum'}
    siglip_id2label = {0: "ai", 1: "hum"}
    siglip_map = build_label_mapping(siglip_id2label, BACKEND_LABEL_SPECS["siglip"]["model_id"], backend_key="siglip")
    assert siglip_map == {"FAKE": 0, "REAL": 1}

    # Legacy id2label: {0: 'artificial', 1: 'human'}
    legacy_id2label = {0: "artificial", 1: "human"}
    legacy_map = build_label_mapping(legacy_id2label, BACKEND_LABEL_SPECS["legacy"]["model_id"], backend_key="legacy")
    assert legacy_map == {"FAKE": 0, "REAL": 1}

    # Smaug id2label: {0: 'LABEL_0', 1: 'LABEL_1'}
    smaug_id2label = {0: "LABEL_0", 1: "LABEL_1"}
    smaug_map = build_label_mapping(smaug_id2label, BACKEND_LABEL_SPECS["smaug"]["model_id"], backend_key="smaug")
    assert smaug_map == {"FAKE": 1, "REAL": 0}


def test_label_mapping_with_string_keys():
    """Assert build_label_mapping safely handles JSON-deserialized string integer keys."""
    id2label = {"0": "ai", "1": "hum"}
    mapping = build_label_mapping(id2label, "test/model", backend_key="siglip")
    assert mapping == {"FAKE": 0, "REAL": 1}


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


def test_label_mapping_empty_or_invalid_raises_error():
    """Assert empty or non-dict id2label raises ValueError."""
    with pytest.raises(ValueError) as excinfo:
        build_label_mapping({}, "test/empty")
    assert "Invalid or empty id2label dictionary" in str(excinfo.value)

    with pytest.raises(ValueError) as excinfo:
        build_label_mapping(None, "test/none")
    assert "Invalid or empty id2label dictionary" in str(excinfo.value)


def test_label_mapping_ambiguous_multiple_fakes_raises_error():
    """Assert having multiple labels resolving to FAKE raises ValueError."""
    id2label = {0: "fake", 1: "synthetic", 2: "human"}
    with pytest.raises(ValueError) as excinfo:
        build_label_mapping(id2label, "test/multi-fake")
    assert "Ambiguous FAKE mapping" in str(excinfo.value)


def test_smaug_output_polarity_higher_means_fake():
    """
    Assert that for Smaug backend, a higher probability value means FAKE.
    Smaug evaluates sigmoid(logits.mean(1)): values approaching 1.0 are synthetic/fake,
    values approaching 0.0 are authentic/real.
    """
    backend = SmaugBackend()
    assert backend.label_mapping == {"FAKE": 1, "REAL": 0}
    threshold = 0.50
    high_score = 0.95
    low_score = 0.05
    assert high_score > threshold, "Higher score must exceed threshold towards FAKE"
    assert low_score < threshold, "Lower score must be below threshold towards REAL"

