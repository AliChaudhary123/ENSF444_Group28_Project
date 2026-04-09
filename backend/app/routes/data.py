from fastapi import APIRouter
from app.services.model_loader import get_metadata

router = APIRouter(prefix="/data")


@router.get("/communities")
def communities():
    return get_metadata().get("communities", [])


@router.get("/categories")
def categories():
    return get_metadata().get("categories", [])


@router.get("/sectors")
def sectors():
    return get_metadata().get("sectors", [])


@router.get("/metadata")
def metadata():
    return get_metadata()
