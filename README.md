# LogiCast
### Predictive Supply Chain Intelligence

LogiCast is a machine-learning application that estimates the risk of late delivery using historical order, shipping, product, and customer data. It combines a trained classification model with a FastAPI backend and a React dashboard to make delivery-risk predictions accessible through a web interface.

## 1. Problem Statement

Late deliveries can disrupt inventory planning, customer satisfaction, and logistics operations. LogiCast explores how historical supply-chain data can be used to identify orders associated with a higher likelihood of late delivery.

The goal is to build an end-to-end ML application, from data preprocessing and model evaluation to API-based inference and an interactive dashboard.

## 2. Dataset

The project uses the **DataCo Smart Supply Chain dataset**, sourced from Kaggle.

- **Records:** 180,519
- **Target:** `Late_delivery_risk`
- **Task:** Binary classification
- **Target classes:** On-time/low-risk label (0) and late-delivery-risk label (1)

The model uses 17 selected input features covering shipping mode, scheduled shipping duration, order date attributes, product category, price, quantity, discounts, customer segment, market, and geographic information.

## 3. Data Processing and Feature Engineering

The preprocessing pipeline was developed to prepare the raw data for model training.

- Extracted month, day of week, and day of month from the order date.
- Removed identifiers and personally identifying fields that were not required for prediction.
- Excluded potential target leakage variables, including actual shipping duration and delivery status.
- Split the chronologically sorted dataset into 80% training data and 20% testing data.
- Applied categorical encoding and numerical scaling using a preprocessing pipeline fitted on the training data.
- Saved the preprocessing artifacts and transformed feature names for reuse during inference.

The resulting pipeline transforms the 17 selected raw features into 1,327 model input features.

## 4. Model Development and Evaluation

Several baseline approaches were implemented for comparison:

1. Dummy Classifier as a reference baseline.
2. Logistic Regression with class balancing.
3. Random Forest with class balancing and tree-depth constraints.
4. XGBoost with gradient-boosted trees.

Models were evaluated using accuracy, precision, recall, F1 score, ROC-AUC, and PR-AUC. PR-AUC is particularly useful for evaluating performance across classification thresholds when both classes matter.

The selected baseline was the Random Forest classifier.

| Metric | Recorded result |
|---|---:|
| Accuracy | 69.18% |
| Precision | 82.98% |
| Recall | 54.87% |
| F1 score | 66.06% |
| ROC-AUC | 0.7437 |
| PR-AUC | 0.8140 |

These results represent the recorded baseline evaluation. Further experimentation and validation are needed before claiming improved generalization or production-level performance.

## 5. Application Architecture

LogiCast connects the trained model to a web application through a REST API.

- **Data and ML:** Python, pandas, scikit-learn, XGBoost
- **Model persistence:** Joblib
- **Backend:** FastAPI and Uvicorn
- **Frontend:** React, TypeScript, Vite, CSS
- **Visualization and interface:** Responsive dashboard with order-entry and risk-assessment views

### Prediction workflow

1. A user enters order attributes in the React dashboard.
2. The frontend sends the order to the FastAPI `/predict` endpoint.
3. The saved preprocessing pipeline transforms the input.
4. The trained classifier predicts the late-delivery-risk label and probability.
5. The dashboard displays the prediction and estimated probability.

The probability is a model estimate, not a guarantee of actual delivery performance.

## 6. Run Locally

### Prerequisites

- Python 3.12 or a compatible Python version
- Node.js and npm
- Project dataset and saved model artifacts

### Backend

From the project root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

- Health check: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm install lucide-react
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Configure the frontend API URL in `frontend/.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

The backend must allow requests from the frontend development origin through its CORS configuration.

## 7. API Usage

The `POST /predict` endpoint accepts an `order` object containing all 17 required raw model features.

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

The values above illustrate the request structure only; categorical values must match the dataset's valid categories. Use the included `data/processed/sample_order.json` for a dataset-derived example.

## 8. Current Status and Future Work

**Completed**
- Data cleaning and feature engineering
- Chronological train/test split
- Baseline model comparison and evaluation
- Saved preprocessing and model artifacts
- FastAPI inference endpoint
- React dashboard with structured order inputs and prediction results

**Next steps**
- Improve and validate model performance on appropriate holdout data.
- Add prediction history and richer operational analytics.
- Deploy the frontend and API.
- Add production monitoring, input validation, and deployment configuration.

## Project Goal

LogiCast demonstrates an end-to-end machine-learning workflow for supply-chain risk estimation, combining data engineering, predictive modeling, backend development, and frontend integration in a single application.
