"""Prediction service - runs input through loaded models."""

import numpy as np
import pandas as pd
from app.services.model_loader import get_model

RISK_LABELS = {0: "Low", 1: "Medium", 2: "High"}


def _build_regression_df(sector: str, community: str, category: str,
                         year: int, month: int, resident_count: int) -> pd.DataFrame:
    """Build a DataFrame with dtypes matching the training data."""
    df = pd.DataFrame({
        "sector": pd.array([sector], dtype="object"),
        "community_name": pd.array([community], dtype="object"),
        "category": pd.array([category], dtype="object"),
        "year": np.array([year], dtype="int64"),
        "month": np.array([month], dtype="int64"),
        "resident_count": np.array([resident_count], dtype="float64"),
    })
    return df


def _build_classification_df(sector: str, community: str,
                              year: int, month: int, resident_count: int) -> pd.DataFrame:
    """Build a DataFrame with dtypes matching the training data."""
    df = pd.DataFrame({
        "sector": pd.array([sector], dtype="object"),
        "community_name": pd.array([community], dtype="object"),
        "year": np.array([year], dtype="int64"),
        "month": np.array([month], dtype="int64"),
        "resident_count": np.array([resident_count], dtype="float64"),
    })
    return df


def predict_regression(model_name: str, community: str, sector: str, category: str,
                       year: int, month: int, resident_count: int) -> dict:
    model = get_model(model_name)
    if model is None:
        raise ValueError(f"Model '{model_name}' not found")

    input_df = _build_regression_df(sector, community, category, year, month, resident_count)
    prediction = float(model.predict(input_df)[0])
    return {
        "prediction": round(max(prediction, 0), 2),
        "model_used": model_name,
        "task": "regression",
        "inputs": {"sector": sector, "community": community, "category": category,
                   "year": year, "month": month, "resident_count": resident_count},
    }


def predict_classification(model_name: str, community: str, sector: str,
                           year: int, month: int, resident_count: int) -> dict:
    model = get_model(model_name)
    if model is None:
        raise ValueError(f"Model '{model_name}' not found")

    input_df = _build_classification_df(sector, community, year, month, resident_count)
    pred_class = int(model.predict(input_df)[0])
    return {
        "prediction": RISK_LABELS[pred_class],
        "prediction_raw": pred_class,
        "model_used": model_name,
        "task": "classification",
        "inputs": {"sector": sector, "community": community,
                   "year": year, "month": month, "resident_count": resident_count},
    }
