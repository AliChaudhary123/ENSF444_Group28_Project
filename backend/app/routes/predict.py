from fastapi import APIRouter, HTTPException
from app.schemas.prediction import RegressionRequest, ClassificationRequest, CompareRequest
from app.services.predictor import predict_regression, predict_classification
from app.services.model_loader import get_regression_models, get_classification_models

router = APIRouter()


@router.post("/predict/regression")
def regression(req: RegressionRequest):
    try:
        return predict_regression(
            req.model_name, req.community, req.sector,
            req.category, req.year, req.month, req.resident_count,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/classification")
def classification(req: ClassificationRequest):
    try:
        return predict_classification(
            req.model_name, req.community, req.sector,
            req.year, req.month, req.resident_count,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare")
def compare(req: CompareRequest):
    results = []
    if req.task == "regression":
        for model_name in get_regression_models():
            try:
                res = predict_regression(
                    model_name, req.community, req.sector,
                    req.category, req.year, req.month, req.resident_count,
                )
                results.append(res)
            except Exception as e:
                results.append({"model_used": model_name, "error": str(e)})
    else:
        for model_name in get_classification_models():
            try:
                res = predict_classification(
                    model_name, req.community, req.sector,
                    req.year, req.month, req.resident_count,
                )
                results.append(res)
            except Exception as e:
                results.append({"model_used": model_name, "error": str(e)})

    return {"results": results, "inputs": req.model_dump(), "task": req.task}
