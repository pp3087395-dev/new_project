"""
Tests for verdict boundary conditions and 3-way decision thresholds (Step 10 Part A).
"""

import pytest


def classify(fake_prob: float, threshold: float = 0.50, band: float = 0.10) -> str:
    """Standard calibrated 3-way classification matching production."""
    if band > 0.0 and abs(fake_prob - threshold) <= band:
        return "INCONCLUSIVE"
    elif fake_prob > threshold + band:
        return "FAKE"
    else:
        return "REAL"


def test_verdict_exactly_at_threshold():
    """At threshold (0.50), verdict must be INCONCLUSIVE."""
    assert classify(0.50, 0.50, 0.10) == "INCONCLUSIVE"


def test_verdict_at_upper_band_boundary():
    """At threshold + band (0.60), verdict must be INCONCLUSIVE."""
    assert classify(0.60, 0.50, 0.10) == "INCONCLUSIVE"


def test_verdict_just_inside_upper_band():
    """Just inside upper band (0.599), verdict must be INCONCLUSIVE."""
    assert classify(0.599, 0.50, 0.10) == "INCONCLUSIVE"


def test_verdict_just_outside_upper_band():
    """Just outside upper band (0.6001), verdict must be FAKE."""
    assert classify(0.6001, 0.50, 0.10) == "FAKE"


def test_verdict_at_lower_band_boundary():
    """At threshold - band (0.40), verdict must be INCONCLUSIVE."""
    assert classify(0.40, 0.50, 0.10) == "INCONCLUSIVE"


def test_verdict_just_inside_lower_band():
    """Just inside lower band (0.401), verdict must be INCONCLUSIVE."""
    assert classify(0.401, 0.50, 0.10) == "INCONCLUSIVE"


def test_verdict_just_outside_lower_band():
    """Just outside lower band (0.3999), verdict must be REAL."""
    assert classify(0.3999, 0.50, 0.10) == "REAL"


def test_verdict_far_boundaries():
    """Definitive extremes must be strictly decisive."""
    assert classify(0.99, 0.50, 0.10) == "FAKE"
    assert classify(0.01, 0.50, 0.10) == "REAL"


def test_verdict_zero_uncertain_band():
    """When uncertain band is 0.0, decisions are strictly binary at threshold."""
    assert classify(0.5001, 0.50, 0.0) == "FAKE"
    assert classify(0.4999, 0.50, 0.0) == "REAL"
