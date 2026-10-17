
from pathlib import Path

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = PROJECT_ROOT / "src" / "models"

MODEL_PATH = MODEL_DIR / "best_baseline_model.joblib"
PREPROCESSOR_PATH = MODEL_DIR / "preprocessor.joblib"
FEATURES_PATH = (
    PROJECT_ROOT / "data" / "processed" / "feature_columns.txt"
)


def load_artifacts():
    """Load the trained model, preprocessor, and feature list."""
    model = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    feature_cols = FEATURES_PATH.read_text().splitlines()

    return model, preprocessor, feature_cols


def predict_late_delivery(order: dict) -> dict:
    """
    Predict late-delivery risk for one order.

    The input must contain the original model features,
    including engineered order-date features.
    """
    model, preprocessor, feature_cols = load_artifacts()

    missing = [col for col in feature_cols if col not in order]
    if missing:
        raise ValueError(f"Missing required features: {missing}")

    order_df = pd.DataFrame(
        [{col: order[col] for col in feature_cols}],
        columns=feature_cols
    )

    transformed = preprocessor.transform(order_df)

    probability = float(
        model.predict_proba(transformed)[0][
            list(model.classes_).index(1)
        ]
    )

    prediction = int(model.predict(transformed)[0])

    return {
        "predicted_late_delivery_risk": prediction,
        "late_delivery_probability": round(probability, 4),
        "model": type(model).__name__,
    }
