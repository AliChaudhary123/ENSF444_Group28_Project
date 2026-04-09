from fastapi import APIRouter
from app.services.model_loader import get_metrics, get_regression_models, get_classification_models

router = APIRouter()


@router.get("/models")
def list_models():
    metrics = get_metrics()
    return {
        "regression": [
            {"name": n, **metrics.get(n, {})} for n in get_regression_models()
        ],
        "classification": [
            {"name": n, **metrics.get(n, {})} for n in get_classification_models()
        ],
    }
