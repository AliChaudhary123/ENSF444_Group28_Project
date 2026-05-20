from pydantic import BaseModel
from typing import Optional


class RegressionRequest(BaseModel):
    community: str
    sector: str
    category: str
    year: int
    month: int
    resident_count: int
    model_name: str = "random_forest_regressor"


class ClassificationRequest(BaseModel):
    community: str
    sector: str
    year: int
    month: int
    resident_count: int
    model_name: str = "gradient_boosting_classifier"


class CompareRequest(BaseModel):
    community: str
    sector: str
    category: str
    year: int
    month: int
    resident_count: int
    task: str = "regression"
