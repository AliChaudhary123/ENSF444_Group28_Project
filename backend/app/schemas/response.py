from pydantic import BaseModel
from typing import Any


class PredictionResponse(BaseModel):
    prediction: Any
    model_used: str
    task: str
    inputs: dict


class CompareResponse(BaseModel):
    results: list[dict]
    inputs: dict
    task: str


class ModelInfo(BaseModel):
    name: str
    type: str
    metrics: dict


class HealthResponse(BaseModel):
    status: str
    models_loaded: int
