"""Prediction service - runs input through loaded models."""

import pandas as pd
from app.services.model_loader import get_model

RISK_LABELS = {0: "Low", 1: "Medium", 2: "High"}


def predict_regression(model_name: str, community: str, sector: str, category: str,
                       year: int, month: int, resident_count: int) -> dict:
    model = get_model(model_name)
    if model is None:
        raise ValueError(f"Model '{model_name}' not found")

    input_df = pd.DataFrame([{
        "sector": sector,
        "community_name": community,
        "category": category,
        "year": year,
        "month": month,
        "resident_count": resident_count,
    }])

    prediction = float(model.predict(input_df)[0])
    return {
        "prediction": round(max(prediction, 0), 2),
        "model_used": model_name,
        "task": "regression",
        "inputs": input_df.iloc[0].to_dict(),
    }


def predict_classification(model_name: str, community: str, sector: str,
                           year: int, month: int, resident_count: int) -> dict:
    model = get_model(model_name)
    if model is None:
        raise ValueError(f"Model '{model_name}' not found")

    input_df = pd.DataFrame([{
        "sector": sector,
        "community_name": community,
        "year": year,
        "month": month,
        "resident_count": resident_count,
    }])

    pred_class = int(model.predict(input_df)[0])
    return {
        "prediction": RISK_LABELS[pred_class],
        "prediction_raw": pred_class,
        "model_used": model_name,
        "task": "classification",
        "inputs": input_df.iloc[0].to_dict(),
    }
