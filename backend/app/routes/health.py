from fastapi import APIRouter
from app.services.model_loader import get_all_model_names

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "models_loaded": len(get_all_model_names())}
