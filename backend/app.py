from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import shap
from pathlib import Path

# ==================================================
# INITIALIZE APP
# ==================================================
app = Flask(__name__)
CORS(app)
BASE_DIR = Path(__file__).resolve().parent

# ==================================================
# LOAD XGBOOST MODEL + PREPROCESSING OBJECTS
# Files are created by train_model.py
# ==================================================
model = joblib.load(BASE_DIR / "xgb_model.pkl")
numeric_imputer = joblib.load(BASE_DIR / "numeric_imputer.pkl")
categorical_imputer = joblib.load(BASE_DIR / "categorical_imputer.pkl")
columns = joblib.load(BASE_DIR / "columns.pkl")
shap_explainer = shap.TreeExplainer(model)

NUMERIC_COLUMNS = [
    "age", "hypertension", "heart_disease", "bmi",
    "HbA1c_level", "blood_glucose_level"
]
CATEGORICAL_COLUMNS = ["gender", "smoking_history"]
FEATURES = [
    "gender", "age", "bmi", "blood_glucose_level",
    "HbA1c_level", "hypertension", "heart_disease", "smoking_history"
]

SMOKING_OPTIONS = ["No Info", "current", "former", "never", "not current"]
SMOKING_CODES = {name: i for i, name in enumerate(SMOKING_OPTIONS)}
CODE_SMOKING = {value: key for key, value in SMOKING_CODES.items()}


def normalize_smoking(value):
    value = str(value if value is not None else "No Info").strip()
    # Accept common case variants without changing the model's categories.
    for option in SMOKING_OPTIONS:
        if value.lower() == option.lower():
            return option
    return "No Info"


def normalize_gender(value):
    value = str(value if value is not None else "Female").strip()
    if value.lower() == "male":
        return "Male"
    if value.lower() == "female":
        return "Female"
    # Preserve an unseen category as text; the saved one-hot schema will align it.
    return value


def clean_input(data):
    """Convert request JSON into the exact raw feature schema used for training."""
    return {
        "gender": normalize_gender(data.get("gender", "Female")),
        "age": float(data.get("age", 0)),
        "hypertension": int(data.get("hypertension", 0)),
        "heart_disease": int(data.get("heart_disease", 0)),
        "smoking_history": normalize_smoking(data.get("smoking_history", "No Info")),
        "bmi": float(data.get("bmi", 0)),
        "HbA1c_level": float(data.get("HbA1c_level", data.get("hbA1c_level", 0))),
        "blood_glucose_level": float(data.get("blood_glucose_level", 0)),
    }


def preprocess_records(records):
    """Apply the same imputers and one-hot encoding used by train_model.py."""
    raw = pd.DataFrame(records)

    for col in NUMERIC_COLUMNS:
        raw[col] = pd.to_numeric(raw[col], errors="coerce")
    for col in CATEGORICAL_COLUMNS:
        raw[col] = raw[col].fillna("No Info").astype(str)

    numeric = pd.DataFrame(
        numeric_imputer.transform(raw[NUMERIC_COLUMNS]),
        columns=NUMERIC_COLUMNS,
        index=raw.index,
    )
    categorical = pd.DataFrame(
        categorical_imputer.transform(raw[CATEGORICAL_COLUMNS]),
        columns=CATEGORICAL_COLUMNS,
        index=raw.index,
    ).astype(str)

    combined = pd.concat([numeric, categorical], axis=1)
    encoded = pd.get_dummies(
        combined,
        columns=CATEGORICAL_COLUMNS,
        dtype=int,
    )
    encoded = encoded.reindex(columns=columns, fill_value=0)
    return encoded


@app.route("/")
def home():
    return "Diabetes Risk Prediction API is running."


def get_recommendations(level):
    if level == "Low":
        return [
            "Maintain a balanced diet and regular physical activity.",
            "Continue routine health check-ups.",
        ]
    if level == "Medium":
        return [
            "Discuss your risk factors with a qualified healthcare professional.",
            "Maintain regular physical activity and a balanced diet.",
            "Consider checking blood glucose as advised by a clinician.",
        ]
    return [
        "Arrange a medical assessment with a qualified healthcare professional.",
        "Follow professional advice about blood glucose testing and next steps.",
    ]


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not data:
            return jsonify({"error": "No input JSON provided."}), 400

        cleaned = clean_input(data)
        encoded = preprocess_records([cleaned])
        probability = float(model.predict_proba(encoded)[0, 1])
        predicted_class = int(probability >= 0.5)

        shap_result = shap_explainer.shap_values(encoded)
        if isinstance(shap_result, list):
            shap_result = shap_result[1] if len(shap_result) > 1 else shap_result[0]
        shap_values = np.asarray(shap_result, dtype=float)
        if shap_values.ndim == 2 and shap_values.shape[0] == 1:
            shap_values = shap_values[0]

        expected_value = np.asarray(shap_explainer.expected_value).reshape(-1)
        base_value = float(expected_value[1] if len(expected_value) > 1 else expected_value[0])

        feature_names = [
            "gender",
            "age",
            "bmi",
            "blood_glucose_level",
            "HbA1c_level",
            "hypertension",
            "heart_disease",
            "smoking_history",
        ]
        feature_values = {
            "gender": cleaned["gender"],
            "age": cleaned["age"],
            "bmi": cleaned["bmi"],
            "blood_glucose_level": cleaned["blood_glucose_level"],
            "HbA1c_level": cleaned["HbA1c_level"],
            "hypertension": cleaned["hypertension"],
            "heart_disease": cleaned["heart_disease"],
            "smoking_history": cleaned["smoking_history"],
        }

        def aggregate_feature_contribution(prefix):
            matching_columns = [
                column for column in encoded.columns if column.startswith(prefix)
            ]
            if not matching_columns:
                return 0.0
            return float(sum(shap_values[encoded.columns.get_loc(column)] for column in matching_columns))

        feature_labels = {
            "gender": "Gender",
            "age": "Age",
            "bmi": "BMI",
            "blood_glucose_level": "Blood glucose",
            "HbA1c_level": "HbA1c",
            "hypertension": "Hypertension",
            "heart_disease": "Heart disease",
            "smoking_history": "Smoking history",
        }

        explanation_features = []
        for name in feature_names:
            if name == "gender":
                shap_value = aggregate_feature_contribution("gender_")
            elif name == "smoking_history":
                shap_value = aggregate_feature_contribution("smoking_history_")
            else:
                idx = encoded.columns.get_loc(name)
                shap_value = float(shap_values[idx])

            explanation_features.append(
                {
                    "feature": feature_labels.get(name, name),
                    "feature_key": name,
                    "value": feature_values[name],
                    "shap_value": float(shap_value),
                    "impact": "positive" if shap_value > 0 else "negative" if shap_value < 0 else "neutral",
                }
            )

        explanation_features.sort(key=lambda item: abs(float(item["shap_value"])), reverse=True)

        explanation = {
            "method": "Tree SHAP",
            "base_value": base_value,
            "output_value": probability,
            "features": explanation_features,
        }

        # These are app display bands, not clinical diagnostic thresholds.
        if probability < 0.10:
            level = "Low"
        elif probability < 0.25:
            level = "Medium"
        else:
            level = "High"

        return jsonify({
            "prediction": predicted_class,
            "probability": probability,
            "risk_level": level,
            "recommendations": get_recommendations(level),
            "shap_explanation": explanation,
            "disclaimer": "This result is a machine-learning screening estimate, not a medical diagnosis.",
        })
    except (ValueError, TypeError, KeyError) as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        app.logger.exception("Prediction request failed")
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8000)
