# LogiCast API Documentation

## Overview

LogiCast provides a FastAPI backend for predicting late-delivery risk using a trained Random Forest classifier.

**Production API:** https://logicast-api.onrender.com

**Interactive API documentation:** https://logicast-api.onrender.com/docs

## Health Check

`GET /health`

Checks whether the API service is responding.

## Predict Late-Delivery Risk

`POST /predict`

Accepts an order object containing 17 input features and returns a predicted late-delivery class, estimated late-delivery probability, and model name.

### Request format

The input fields must be nested inside the `order` object.

### Example response

```json
{
  "predicted_late_delivery_risk": 0,
  "late_delivery_probability": 0.3836,
  "model": "RandomForestClassifier"
}
```

### Response fields

- `predicted_late_delivery_risk`: Predicted class; `0` indicates the model predicts no late delivery, while `1` indicates predicted late delivery.
- `late_delivery_probability`: Estimated probability of late delivery, represented as a decimal between 0 and 1.
- `model`: Name of the model used for inference.

### Verified production test

A request to the deployed API returned a successful prediction with class `0`, a late-delivery probability of `0.3836`, and model `RandomForestClassifier`.

## Limitations

Predictions are estimates based on patterns learned from historical data. They do not guarantee delivery outcomes. Model performance depends on the input data and the limitations of the training dataset.