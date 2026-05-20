"""Load trained models and metadata at startup."""

import json
from pathlib import Path
from typing import Optional

import joblib

from app.core.config import MODEL_DIR

_models: dict = {}
_metrics: dict = {}
_metadata: dict = {}


def load_all_models():
    global _models, _metrics, _metadata

    for pkl_file in MODEL_DIR.glob("*.pkl"):
        name = pkl_file.stem
        _models[name] = joblib.load(pkl_file)
        print(f"  Loaded model: {name}")

    metrics_path = MODEL_DIR / "metrics.json"
    if metrics_path.exists():
        with open(metrics_path) as f:
            _metrics = json.load(f)

    metadata_path = MODEL_DIR / "metadata.json"
    if metadata_path.exists():
        with open(metadata_path) as f:
            _metadata = json.load(f)

    print(f"  {len(_models)} models loaded, metadata={'yes' if _metadata else 'no'}")


def get_model(name: str) -> Optional[object]:
    return _models.get(name)


def get_all_model_names() -> list[str]:
    return list(_models.keys())


def get_metrics() -> dict:
    return _metrics


def get_metadata() -> dict:
    return _metadata


def get_regression_models() -> list[str]:
    return [n for n, m in _metrics.items() if m.get("type") == "regression"]


def get_classification_models() -> list[str]:
    return [n for n, m in _metrics.items() if m.get("type") == "classification"]
