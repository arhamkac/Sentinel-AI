"""
Isolation Forest Anomaly Scoring Service (Task A5)
Scores incoming security events from 0.0 (nominal) to 1.0 (highly anomalous).
"""
import logging
import os
import pickle
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Feature encoding maps ────────────────────────────────────────────────────
PROCESS_INDICES: dict[str, int] = {
    "chrome.exe": 0, "firefox.exe": 1, "outlook.exe": 2, "excel.exe": 3,
    "word.exe": 4, "teams.exe": 5, "explorer.exe": 6, "svchost.exe": 7,
    "powershell.exe": 10, "cmd.exe": 11, "wscript.exe": 12, "cscript.exe": 13,
    "mshta.exe": 14, "regsvr32.exe": 15, "rundll32.exe": 16,
    "vssadmin.exe": 20, "net.exe": 21, "net1.exe": 22, "bcdedit.exe": 23,
    "wmic.exe": 24, "mstsc.exe": 25, "mimikatz.exe": 30, "crypt.exe": 31,
    "procdump.exe": 32, "scada_console.exe": 40,
}

EVENT_TYPE_INDICES: dict[str, int] = {
    "endpoint": 0, "network": 1, "auth": 2, "scada": 3, "dns": 4,
}

SEVERITY_INDICES: dict[str, float] = {
    "low": 0.1, "medium": 0.4, "high": 0.75, "critical": 1.0,
}

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

_model = None
_is_fitted = False


def _feature_vector(
    event_type: str,
    severity: str,
    process: Optional[str],
    user: Optional[str],
    source_port: Optional[int],
    destination_port: Optional[int],
    anomaly_score_hint: Optional[float],
) -> np.ndarray:
    """Convert event fields to a numeric feature vector."""
    proc_idx = PROCESS_INDICES.get((process or "").lower(), 5)
    ev_idx = EVENT_TYPE_INDICES.get(event_type, 0)
    sev_val = SEVERITY_INDICES.get(severity, 0.1)
    is_system = 1.0 if (user or "").upper() in ("SYSTEM", "ADMINISTRATOR", "ROOT") else 0.0
    src_p = min((source_port or 0) / 65535.0, 1.0)
    dst_p = min((destination_port or 0) / 65535.0, 1.0)
    hint = anomaly_score_hint or 0.0
    return np.array([proc_idx / 40.0, ev_idx / 4.0, sev_val, is_system, src_p, dst_p, hint])


def _build_baseline() -> np.ndarray:
    """Generate a synthetic baseline dataset of normal events."""
    np.random.seed(42)
    rows = []
    for _ in range(500):
        proc = np.random.choice([0, 1, 2, 3, 4, 5, 6, 7]) / 40.0
        ev = np.random.choice([0, 1]) / 4.0
        sev = np.random.choice([0.1, 0.1, 0.1, 0.4]) 
        sys = 0.0
        src_p = np.random.uniform(0, 0.8)
        dst_p = np.random.choice([0.01, 0.01, 0.3, 0.6])  # 80, 443, 3389
        hint = np.random.uniform(0.0, 0.3)
        rows.append([proc, ev, sev, sys, src_p, dst_p, hint])
    return np.array(rows)


def _load_or_train() -> None:
    global _model, _is_fitted
    try:
        from sklearn.ensemble import IsolationForest  # type: ignore
    except ImportError:
        logger.warning("scikit-learn not installed — anomaly scoring disabled.")
        return

    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                _model = pickle.load(f)
            _is_fitted = True
            logger.info("Isolation Forest model loaded from disk.")
            return
        except Exception as e:
            logger.warning(f"Failed to load model from disk: {e}. Re-training.")

    logger.info("Training Isolation Forest on synthetic baseline...")
    X = _build_baseline()
    _model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        max_features=1.0,
        random_state=42,
    )
    _model.fit(X)
    _is_fitted = True
    try:
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(_model, f)
        logger.info("Model saved to disk.")
    except Exception as e:
        logger.warning(f"Could not save model: {e}")


def score_event(
    event_type: str = "endpoint",
    severity: str = "low",
    process: Optional[str] = None,
    user: Optional[str] = None,
    source_port: Optional[int] = None,
    destination_port: Optional[int] = None,
    anomaly_score_hint: Optional[float] = None,
) -> float:
    """
    Return an anomaly score in [0.0, 1.0].
    Falls back to a rule-based heuristic if ML model unavailable.
    """
    if not _is_fitted:
        _load_or_train()

    # Rule-based fallback
    if not _is_fitted or _model is None:
        base = SEVERITY_INDICES.get(severity, 0.1)
        if process and process.lower() in ("vssadmin.exe", "mimikatz.exe", "crypt.exe"):
            base = min(base + 0.5, 1.0)
        return round(base, 4)

    vec = _feature_vector(event_type, severity, process, user, source_port, destination_port, anomaly_score_hint)
    try:
        # IsolationForest: -1 is outlier, +1 is inlier
        raw_score = _model.decision_function([vec])[0]
        # Map from roughly [-0.5, 0.5] to [0, 1] inverted (lower raw = more anomalous = higher score)
        normalized = float(np.clip(0.5 - raw_score, 0.0, 1.0))
        return round(normalized, 4)
    except Exception as e:
        logger.warning(f"Model scoring error: {e}")
        return round(SEVERITY_INDICES.get(severity, 0.1), 4)


# Pre-load model at import time
try:
    _load_or_train()
except Exception as e:
    logger.warning(f"ML model initialization deferred: {e}")
