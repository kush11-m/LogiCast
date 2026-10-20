# LogiCast: Technical ML Report

## 1. Abstract

LogiCast is a machine learning application developed to estimate late-delivery risk using historical supply-chain order data. The project covers data preparation, feature engineering, leakage prevention, chronological model evaluation, model persistence, API-based inference, and a web dashboard.

The dataset contains 180,519 records. The selected model uses 17 raw input features, which are transformed into 1,327 encoded features by a reusable preprocessing pipeline. The recorded baseline selected for inference is a Random Forest classifier.

The system demonstrates an end-to-end machine learning workflow. Its evaluation results also highlight the need for further validation and improvements in identifying positive-class orders.

## 2. Problem Definition

Late deliveries can affect customer satisfaction, inventory planning, and logistics operations. The objective of LogiCast is to investigate whether information available about an order can be used to estimate its late-delivery risk.

This is formulated as a binary classification task using the `Late_delivery_risk` target.

- `0`: Negative target class
- `1`: Positive late-delivery-risk class

The model's output is an estimate based on historical patterns. It is not a guarantee of the eventual delivery outcome.

## 3. Dataset

The project uses the DataCo Smart Supply Chain dataset sourced from Kaggle.

| Dataset property | Value |
|---|---:|
| Records | 180,519 |
| Selected raw features | 17 |
| Training records | 144,415 |
| Testing records | 36,104 |
| Encoded features | 1,327 |
| Prediction task | Binary classification |

The selected features represent shipment configuration, order timing, product and transaction details, customer segment, and geographic or market context.

### 3.1 Selected features

**Shipment configuration**
- `Type`
- `Shipping Mode`
- `Days for shipment (scheduled)`

**Order timing**
- `Order_Month`
- `Order_DayOfWeek`
- `Order_Day`

**Product and transaction context**
- `Category Name`
- `Department Name`
- `Order Item Product Price`
- `Order Item Quantity`
- `Order Item Discount`
- `Order Item Discount Rate`

**Customer and market context**
- `Customer Segment`
- `Market`
- `Order Region`
- `Order Country`
- `Order State`

## 4. Data Cleaning and Feature Engineering

The preprocessing workflow prepares historical order data for model development.

The documented steps include:

1. Cleaning and preparing the dataset.
2. Removing unnecessary identifiers and personally identifying fields.
3. Extracting month, day of week, and day of month from the order date.
4. Selecting features intended to be available at prediction time.
5. Creating a chronological training and testing split.
6. Building and saving a reusable preprocessing pipeline.

### 4.1 Preventing target leakage

Target leakage occurs when a model receives information that would not legitimately be available at the time a prediction is made.

The feature-selection process excludes post-outcome fields such as:

- `Delivery Status`
- `Days for shipping (real)`
- `shipping date (DateOrders)`
- `Order Status`

This is intended to keep the model focused on order-time information rather than directly using the outcome or information generated later in the delivery process.

## 5. Chronological Train/Test Split

The dataset is split chronologically rather than randomly.

| Split | Records | Date range |
|---|---:|---|
| Training | 144,415 | 2015-01-01 to 2017-04-22 |
| Testing | 36,104 | 2017-04-22 to 2018-01-31 |

This design evaluates the model on a later period than the one used for training, better reflecting a scenario in which historical orders are used to predict future orders.

The split does not by itself guarantee generalization to new markets, changing logistics conditions, or future datasets. Those require additional validation.

## 6. Preprocessing Pipeline

A reusable scikit-learn preprocessing pipeline is fitted on the training data and then applied to the testing data and inference inputs.

### 6.1 Numerical features

The numerical preprocessing steps include:

1. Median imputation for missing values.
2. Standardization using `StandardScaler`.

### 6.2 Categorical features

The categorical preprocessing steps include:

1. Most-frequent-value imputation.
2. One-hot encoding.
3. Handling of unknown categories without requiring a change to the fitted encoding schema.

### 6.3 Feature transformation

The pipeline transforms the 17 selected raw inputs into 1,327 encoded model features.

The fitted preprocessor is persisted as `src/models/preprocessor.joblib`. This allows inference to use the same transformations established during training rather than independently rebuilding them.

## 7. Model Experiments

Four baseline approaches were evaluated:

| Model | Purpose |
|---|---|
| Dummy Classifier | Establish a simple reference baseline |
| Logistic Regression | Evaluate a linear classification approach |
| Random Forest | Evaluate an ensemble of decision trees |
| XGBoost | Evaluate gradient-boosted decision trees |

The selected model remains Random Forest, with class balancing, 200 trees, maximum depth 20, minimum leaf size five, and a fixed random seed. The threshold was tuned without changing the model.

Threshold selection used a chronological validation split within the original training period: 115,532 earlier orders for fitting (2015-01-01 to 2016-11-05) and 28,883 later orders for selection (2016-11-05 to 2017-04-22). The selection rule maximized recall subject to precision >= 0.75 and F1 >= 0.65. The final 36,104-order period (2017-04-22 to 2018-01-31) was held out for evaluation. The preprocessing pipeline for validation was fitted only on the earlier training subset.

The project stores baseline and threshold-tuned test results in `reports/baseline_model_comparison.csv`.

## 8. Evaluation Results

The final test results compare the existing Random Forest at its original 0.50 threshold with the same model at the selected 0.395 threshold. Threshold selection used validation data only; the test period was evaluated afterward.

| Test metric | Baseline (0.50) | Selected (0.395) |
|---|---:|---:|
| Accuracy | 69.18% | 69.07% |
| Precision | 82.98% | 77.63% |
| Recall | 54.87% | 60.99% |
| F1-score | 66.06% | 68.31% |
| ROC-AUC | 0.7437 | 0.7437 |
| PR-AUC | 0.8140 | 0.8140 |

On the untouched test period, recall increased by 6.12 percentage points and F1 increased by 2.25 points; precision decreased by 5.35 points. ROC-AUC and PR-AUC are unchanged because the model probabilities did not change. On the chronological validation period, recall moved from 55.78% at 0.50 to 61.30% at 0.395, while precision was 75.84% and F1 was 67.80% at the selected threshold.

### 8.1 Metric interpretation

**Accuracy** measures the fraction of predictions classified correctly at the evaluated threshold.

**Precision** measures the fraction of predicted positive cases that are actually positive. At the selected threshold, test precision was 77.63%, compared with 82.98% at the baseline threshold.

**Recall** measures the fraction of actual positive cases detected. At the selected threshold, test recall was 60.99%, compared with 54.87% at the baseline threshold.

**F1-score** combines precision and recall into a single measure using their harmonic mean.

**ROC-AUC** measures the model's ability to rank positive cases above negative cases across classification thresholds.

**PR-AUC** summarizes the precision-recall trade-off. It is useful when assessing how well the model identifies positive cases at different thresholds.

These metrics describe different aspects of performance. Accuracy alone is not sufficient to assess a late-delivery-risk system, because failing to identify risky orders may have operational consequences.

## 9. Error Analysis

The selected-threshold test confusion matrix (threshold 0.395) is:

| Actual / Predicted | Negative | Positive |
|---|---:|---:|
| Negative | 12,902 | 3,469 |
| Positive | 7,698 | 12,035 |

At threshold 0.395, the model correctly identified 12,035 positive cases and missed 7,698. At the original 0.50 threshold, it identified 10,827 positive cases and missed 8,906.

These false negatives are an important limitation. A logistics team using the system would not want to assume that an order is safe merely because the model predicts the negative class.

Possible areas for further investigation include:

- Comparing the selected threshold across operational segments and newer data.
- Reviewing false-negative examples for systematic patterns.
- Examining performance across shipping modes, markets, and other relevant segments.
- Validating calibration if predicted probabilities will be interpreted as actual likelihoods.

These are proposed analyses, not completed findings.

## 10. Application Architecture

The application connects the saved model artifacts to a web interface through a REST API.

```text
Historical Dataset
       |
       v
Cleaning and Feature Engineering
       |
       v
Preprocessing Pipeline
       |
       v
Baseline Model Experiments
       |
       v
Saved Model and Preprocessor
       |
       v
FastAPI /predict Endpoint
       |
       v
React + TypeScript Dashboard
```

### Technology stack

| Component | Technology |
|---|---|
| Data processing | Python, pandas, NumPy |
| Machine learning | scikit-learn, XGBoost |
| Model persistence | Joblib |
| Backend | FastAPI, Uvicorn |
| Frontend | React, TypeScript, Vite, CSS |
| Hosting | Render and Vercel |

### Prediction workflow

1. The user enters order attributes in the dashboard.
2. The frontend sends the order data to the prediction API.
3. The saved preprocessor transforms the raw inputs.
4. The classifier estimates the target class and probability.
5. The API returns the prediction response for display.

The probability is a model output and should not be treated as a guarantee of delivery performance.

## 11. Reproducibility

### Backend

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload
```

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The local frontend requires `VITE_API_URL` to point to the backend API. The backend must allow the frontend origin through its CORS configuration.

The model and preprocessor artifacts must be present at the paths expected by the inference code.

## 12. Limitations

The current project has several limitations:

- The selected threshold improves measured recall, with a corresponding precision trade-off.
- The recorded metrics are not sufficient to establish production readiness.
- The full numerical comparison of all baseline models should be reproduced from the saved experiment report.
- Segment-level evaluation and error analysis remain to be done.
- Performance may change as logistics processes, markets, and customer behavior change.
- The application requires end-to-end testing against the deployed API before operational use.

## 13. Future Work

Potential improvements include:

1. Validate the selected threshold on newer data and across operational segments.
2. Perform more detailed false-negative and segment-level error analysis.
3. Evaluate probability calibration.
4. Add feature-importance and explainability analysis.
5. Add prediction history and richer dashboard analytics.
6. Introduce monitoring for input distributions and model performance.
7. Re-evaluate the model on newer data when available.

## 14. Conclusion

LogiCast demonstrates an end-to-end machine learning workflow for supply-chain late-delivery-risk estimation. The project connects data preparation, feature engineering, baseline model evaluation, reusable preprocessing, API-based inference, and an interactive dashboard.

The Random Forest with threshold 0.395 improves recall on the untouched chronological test period from 54.87% to 60.99%, while precision moves from 82.98% to 77.63% and F1 from 66.06% to 68.31%. These measured results support the threshold change for this dataset; evaluation on newer and operationally relevant segments remains necessary before relying on predictions for decisions.
