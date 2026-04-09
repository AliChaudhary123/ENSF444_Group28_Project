from fastapi import FastAPI
from app.core.cors import setup_cors
from app.services.model_loader import load_all_models
from app.routes import health, predict, models, data

app = FastAPI(
    title="Calgary Crime Forecast API",
    description="ML-powered crime prediction for Calgary communities",
    version="1.0.0",
)

setup_cors(app)

app.include_router(health.router, tags=["health"])
app.include_router(predict.router, tags=["predict"])
app.include_router(models.router, tags=["models"])
app.include_router(data.router, tags=["data"])


@app.on_event("startup")
def startup():
    print("Loading models...")
    load_all_models()
    print("Ready!")
