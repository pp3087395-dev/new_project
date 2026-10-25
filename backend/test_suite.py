"""
TruthLens Test Suite Runner (Step 10)
Dispatches to the real pytest test suite in backend/tests/.
"""
import sys
import pytest

if __name__ == "__main__":
    args = sys.argv[1:] if len(sys.argv) > 1 else ["tests"]
    sys.exit(pytest.main(args))
