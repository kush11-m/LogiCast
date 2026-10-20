# LogiCast
### Predictive Supply Chain Intelligence

**LogiCast** is an end-to-end machine learning application that estimates late-delivery risk for supply-chain orders. It combines a preprocessing pipeline, a trained classification model, a FastAPI backend, and a React dashboard.

<p align="center">
  <a href="https://logi-cast-azure.vercel.app/">Live Demo</a> ·
  <a href="https://logicast-api.onrender.com/docs">API Documentation</a> ·
  <a href="https://github.com/kush11-m/LogiCast">Source Code</a>
</p>

## Overview

Late deliveries can affect customer satisfaction, inventory planning, and logistics operations. LogiCast explores how historical supply-chain data can help identify orders associated with a higher risk of late delivery.

The application accepts order attributes, processes them using the saved preprocessing pipeline, and returns a predicted risk label and probability through a REST API.

## Key Features

- Binary classification of late-delivery risk
- Leakage-aware feature selection
- Chronological train/test split
- Reusable preprocessing and model artifacts
- REST API built with FastAPI
- Interactive React and TypeScript dashboard
- Cloud deployment using Render and Vercel

## Dataset

The project uses the **DataCo Smart Supply Chain** dataset sourced from Kaggle.

| Property | Value |
|---|---:|
| Dataset records | 180,519 |
| Selected raw input features | 17 |
| Encoded model features | 1,327 |
| Training records | 144,415 |
| Testing records | 36,104 |
| Target | `Late_delivery_risk` |

The target is a binary classification label: `0` represents the negative class and `1` represents the late-delivery-risk class.

## Methodology

### 1. Data preprocessing

The preprocessing workflow includes:

- Cleaning and preparing the dataset
- Removing unnecessary identifiers and personal information
- Extracting month, day of week, and day of month from order dates
- Excluding potential target-leakage fields, such as actual shipping duration and delivery status
- Splitting chronologically into training and testing sets
- Imputing missing values, scaling numerical features, and encoding categorical features

The preprocessing pipeline is fitted on the training data and reused during inference. The 17 raw inputs are transformed into 1,327 encoded features.

### 2. Model experimentation

The following baseline approaches were evaluated:

- Dummy Classifier
- Logistic Regression
- Random Forest
- XGBoost

The recorded baseline evaluation selected **Random Forest** as the model used by the application.

### 3. Recorded evaluation results

| Metric | Random Forest |
|---|---:|
| Accuracy | 69.18% |
| Precision | 82.98% |
| Recall | 54.87% |
| F1-score | 66.06% |
| ROC-AUC | 0.7437 |
| PR-AUC | 0.8140 |

These are the recorded evaluation results, not a guarantee of production performance. The precision is relatively high, while recall indicates that a substantial proportion of positive-class orders were missed at the evaluated classification threshold. Further validation and threshold analysis are needed before operational use.

## Application Architecture

```text
Historical Supply-Chain Data
            |
            v
Cleaning and Feature Engineering
            |
            v
Preprocessing Pipeline
            |
            v
Model Training and Evaluation
            |
            v
Saved Model + Preprocessor
            |
            v
FastAPI Prediction Endpoint
            |
            v
React + TypeScript Dashboard
```

### Technology stack

| Layer | Technologies |
|---|---|
| Data processing | Python, pandas, NumPy |
| Machine learning | scikit-learn, XGBoost |
| Model persistence | Joblib |
| Backend | FastAPI, Uvicorn |
| Frontend | React, TypeScript, Vite, CSS |
| Deployment | Render, Vercel |

## Live Application

- **Frontend:** https://logi-cast-azure.vercel.app/
- **Backend API:** https://logicast-api.onrender.com/
- **Interactive API documentation:** https://logicast-api.onrender.com/docs

The hosting dashboards report the frontend deployment as Ready and the backend service as Live. End-to-end prediction behavior should be verified against the deployed application before relying on it for operational decisions.

## Run Locally

### Prerequisites

- Python 3.12 or a compatible version
- Node.js and npm
- The saved model and preprocessing artifacts

### Backend

From the project root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload
```

The API should be available at `http://127.0.0.1:8000`.

- Health endpoint: `http://127.0.0.1:8000/health`
- Interactive documentation: `http://127.0.0.1:8000/docs`

### Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

Configure `VITE_API_URL` in `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The backend CORS configuration must allow the frontend's origin.

## API Usage

The `POST /predict` endpoint accepts an `order` object containing the 17 raw model features.

For a dataset-derived example request, refer to `data/processed/sample_order.json`. Use the exact feature names and valid categorical values expected by the model.

Example request structure:

```json
{
  "order": {
    "Type": "DEBIT",
    "Shipping Mode": "Standard Class",
    "Days for shipment (scheduled)": 4,
    "Order_Month": 6,
    "Order_DayOfWeek": 2,
    "Order_Day": 15,
    "Category Name": "Example category",
    "Department Name": "Example department",
    "Order Item Product Price": 100,
    "Order Item Quantity": 1,
    "Order Item Discount": 0,
    "Order Item Discount Rate": 0,
    "Customer Segment": "Consumer",
    "Market": "USCA",
    "Order Region": "Example region",
    "Order Country": "Example country",
    "Order State": "Example state"
  }
}
```

The example values illustrate the payload structure only. Replace illustrative categorical values with valid dataset values. The API response contains the predicted risk label, estimated late-delivery probability, and model identifier.

## Limitations and Future Work

- Improve recall and evaluate alternative classification thresholds.
- Conduct additional validation and error analysis.
- Add model explainability and risk-driver analysis.
- Add prediction history and richer operational analytics.
- Introduce production monitoring and input validation.
- Test end-to-end prediction behavior on the deployed services.

## Project Goal

LogiCast demonstrates an end-to-end machine learning workflow for supply-chain risk estimation, connecting data preparation, model evaluation, API development, and frontend deployment in one application.

**Note:** The predicted probability is a model estimate, not a guarantee that an order will be delivered late or on time.
