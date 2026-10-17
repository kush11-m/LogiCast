from fastapi.middleware.cors import CORSMiddleware
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.inference import predict_late_delivery

app = FastAPI(
    title="LogiCast API",
    description="Predict late-delivery risk for supply-chain orders.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],)


class PredictionRequest(BaseModel):
    order: dict[str, Any]


@app.get("/")
def root():
    return {
        "message": "Welcome to LogiCast API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        result = predict_late_delivery(request.order)
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Prediction failed. Check the server logs.",
        ) from exc
