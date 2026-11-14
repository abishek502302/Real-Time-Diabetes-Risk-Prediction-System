
# ============================================================
# DIABETES RISK PREDICTION USING SMOTENC + XGBOOST
# Optimized Training Version
# ============================================================

import os
import time
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score
)

from imblearn.over_sampling import SMOTENC
from xgboost import XGBClassifier


# ============================================================
# 1. CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    BASE_DIR, "Diabetes_Dataset_4.csv"
)

MODEL_PATH = os.path.join(BASE_DIR, "xgb_model.pkl")
JSON_MODEL_PATH = os.path.join(BASE_DIR, "xgb_model.json")

NUMERIC_IMPUTER_PATH = os.path.join(
    BASE_DIR, "numeric_imputer.pkl"
)
CATEGORICAL_IMPUTER_PATH = os.path.join(
    BASE_DIR, "categorical_imputer.pkl"
)
FEATURE_ORDER_PATH = os.path.join(
    BASE_DIR, "feature_order.pkl"
)
CATEGORICAL_COLUMNS_PATH = os.path.join(
    BASE_DIR, "categorical_columns.pkl"
)
COLUMNS_PATH = os.path.join(BASE_DIR, "columns.pkl")

RANDOM_STATE = 42
TEST_SIZE = 0.20

# 0.5 = minority class becomes half the majority class
SAMPLING_STRATEGY = 0.5


# ============================================================
# 2. LOAD DATASET
# ============================================================

if not os.path.exists(DATASET_PATH):
    raise FileNotFoundError(
        f"Dataset not found: {DATASET_PATH}"
    )

df = pd.read_csv(DATASET_PATH)
df.columns = df.columns.str.strip()

print("=" * 60)
print("DIABETES RISK PREDICTION - MODEL TRAINING")
print("=" * 60)

print("\nDataset loaded successfully!")
print("Dataset shape:", df.shape)
print(df.head())


# ============================================================
# 3. DEFINE FEATURES AND TARGET
# ============================================================

numeric_columns = [
    "age",
    "hypertension",
    "heart_disease",
    "bmi",
    "HbA1c_level",
    "blood_glucose_level"
]

categorical_columns = [
    "gender",
    "smoking_history"
]

target_column = "diabetes"

feature_order = numeric_columns + categorical_columns

required_columns = feature_order + [target_column]

missing_columns = [
    col for col in required_columns
    if col not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing required columns: {missing_columns}"
    )

df = df[required_columns].copy()

# Convert target to numeric
df[target_column] = pd.to_numeric(
    df[target_column], errors="coerce"
)

# Remove rows with missing targets
df = df.dropna(subset=[target_column])

# Validate target labels
if not df[target_column].isin([0, 1]).all():
    raise ValueError(
        "Target column 'diabetes' must contain only 0 and 1."
    )

df[target_column] = df[target_column].astype(int)

X = df[feature_order].copy()
y = df[target_column].copy()

# Convert numeric features
for col in numeric_columns:
    X[col] = pd.to_numeric(
        X[col], errors="coerce"
    )

# Convert categorical features to strings
for col in categorical_columns:
    X[col] = X[col].replace(
        r"^\s*$", np.nan, regex=True
    )


# ============================================================
# 4. SPLIT DATA BEFORE RESAMPLING
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE,
    stratify=y
)

print("\nTraining classes BEFORE SMOTENC:")
print(y_train.value_counts().sort_index())

print("\nTesting classes:")
print(y_test.value_counts().sort_index())


# ============================================================
# 5. HANDLE MISSING VALUES
# ============================================================

numeric_imputer = SimpleImputer(
    strategy="median"
)

categorical_imputer = SimpleImputer(
    strategy="most_frequent"
)

X_train_num = pd.DataFrame(
    numeric_imputer.fit_transform(
        X_train[numeric_columns]
    ),
    columns=numeric_columns,
    index=X_train.index
)

X_test_num = pd.DataFrame(
    numeric_imputer.transform(
        X_test[numeric_columns]
    ),
    columns=numeric_columns,
    index=X_test.index
)

X_train_cat = pd.DataFrame(
    categorical_imputer.fit_transform(
        X_train[categorical_columns]
    ),
    columns=categorical_columns,
    index=X_train.index
).astype(str)

X_test_cat = pd.DataFrame(
    categorical_imputer.transform(
        X_test[categorical_columns]
    ),
    columns=categorical_columns,
    index=X_test.index
).astype(str)

X_train_clean = pd.concat(
    [X_train_num, X_train_cat], axis=1
)[feature_order].reset_index(drop=True)

X_test_clean = pd.concat(
    [X_test_num, X_test_cat], axis=1
)[feature_order].reset_index(drop=True)

y_train = y_train.reset_index(drop=True)
y_test = y_test.reset_index(drop=True)


# ============================================================
# 6. APPLY SMOTENC
# ============================================================

categorical_indices = [
    feature_order.index(col)
    for col in categorical_columns
]

print("\nApplying SMOTENC...")
print("Sampling strategy:", SAMPLING_STRATEGY)
print("Categorical indices:", categorical_indices)

# Dense categorical encoder avoids the sparse
# inverse-transform path seen in the previous traceback.
categorical_encoder = OneHotEncoder(
    handle_unknown="ignore",
    sparse_output=False,
    dtype=np.float64
)

smote = SMOTENC(
    categorical_features=categorical_indices,
    categorical_encoder=categorical_encoder,
    sampling_strategy=SAMPLING_STRATEGY,
    random_state=RANDOM_STATE,
    k_neighbors=3
)

smote_start = time.time()

X_train_balanced, y_train_balanced = smote.fit_resample(
    X_train_clean,
    y_train
)

print(
    f"\nSMOTENC completed in "
    f"{time.time() - smote_start:.2f} seconds"
)

print("\nTraining classes AFTER SMOTENC:")
print(
    pd.Series(y_train_balanced)
    .value_counts()
    .sort_index()
)

# Restore DataFrame columns if the library returns arrays
X_train_balanced = pd.DataFrame(
    X_train_balanced,
    columns=feature_order
)

y_train_balanced = pd.Series(
    y_train_balanced,
    name=target_column
).reset_index(drop=True)

# Ensure categorical features remain categorical strings
for col in categorical_columns:
    X_train_balanced[col] = (
        X_train_balanced[col].astype(str)
    )


# ============================================================
# 7. ONE-HOT ENCODING
# ============================================================

X_train_encoded = pd.get_dummies(
    X_train_balanced,
    columns=categorical_columns,
    dtype=np.uint8
)

X_test_encoded = pd.get_dummies(
    X_test_clean,
    columns=categorical_columns,
    dtype=np.uint8
)

# Align test columns with training columns
encoded_columns = X_train_encoded.columns.tolist()

X_test_encoded = X_test_encoded.reindex(
    columns=encoded_columns,
    fill_value=0
)

# Sanitize feature names for XGBoost compatibility
def sanitize_feature_name(name):
    return (
        str(name)
        .replace("[", "_")
        .replace("]", "_")
        .replace("<", "_")
    )

sanitized_columns = [
    sanitize_feature_name(col)
    for col in encoded_columns
]

if len(set(sanitized_columns)) != len(sanitized_columns):
    raise ValueError(
        "Feature-name sanitization created duplicate columns."
    )

X_train_encoded.columns = sanitized_columns
X_test_encoded.columns = sanitized_columns

# Make sure matrices contain only numeric values
X_train_encoded = X_train_encoded.astype(np.float32)
X_test_encoded = X_test_encoded.astype(np.float32)

print("\nEncoded training shape:", X_train_encoded.shape)
print("Encoded testing shape:", X_test_encoded.shape)


# ============================================================
# 8. SAVE PREPROCESSING OBJECTS
# ============================================================

joblib.dump(numeric_imputer, NUMERIC_IMPUTER_PATH)
joblib.dump(categorical_imputer, CATEGORICAL_IMPUTER_PATH)
joblib.dump(feature_order, FEATURE_ORDER_PATH)
joblib.dump(categorical_columns, CATEGORICAL_COLUMNS_PATH)
joblib.dump(sanitized_columns, COLUMNS_PATH)

print("\nPreprocessing objects saved successfully!")


# ============================================================
# 9. BUILD XGBOOST MODEL
# ============================================================

model = XGBClassifier(
    n_estimators=150,
    max_depth=4,
    learning_rate=0.08,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="binary:logistic",
    eval_metric="logloss",
    tree_method="hist",
    n_jobs=4,
    random_state=RANDOM_STATE
)


# ============================================================
# 10. TRAIN MODEL
# ============================================================

print("\nTraining XGBoost model...")

training_start = time.time()

model.fit(
    X_train_encoded,
    y_train_balanced,
    verbose=False
)

training_time = time.time() - training_start

print("Model training completed!")
print(f"Training time: {training_time:.2f} seconds")


# ============================================================
# 11. EVALUATE MODEL
# ============================================================

y_pred = model.predict(X_test_encoded)
y_prob = model.predict_proba(X_test_encoded)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(
    y_test, y_pred, zero_division=0
)
recall = recall_score(
    y_test, y_pred, zero_division=0
)
f1 = f1_score(
    y_test, y_pred, zero_division=0
)

cm = confusion_matrix(
    y_test, y_pred, labels=[0, 1]
)

tn, fp, fn, tp = cm.ravel()

specificity = (
    tn / (tn + fp)
    if (tn + fp) > 0 else 0.0
)

false_negative_rate = (
    fn / (fn + tp)
    if (fn + tp) > 0 else 0.0
)

roc_auc = (
    roc_auc_score(y_test, y_prob)
    if y_test.nunique() == 2 else float("nan")
)

print("\n" + "=" * 60)
print("MODEL EVALUATION")
print("=" * 60)

print(f"Accuracy            : {accuracy:.4f}")
print(f"Precision           : {precision:.4f}")
print(f"Recall / Sensitivity: {recall:.4f}")
print(f"Specificity         : {specificity:.4f}")
print(f"F1-score            : {f1:.4f}")
print(f"False Negative Rate : {false_negative_rate:.4f}")
print(f"ROC-AUC             : {roc_auc:.4f}")
print(f"Training time       : {training_time:.2f} seconds")

print("\nConfusion Matrix:")
print(cm)

print("\nConfusion Matrix Interpretation:")
print(f"True Negatives  : {tn}")
print(f"False Positives : {fp}")
print(f"False Negatives : {fn}")
print(f"True Positives  : {tp}")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        labels=[0, 1],
        target_names=["No Diabetes", "Diabetes"],
        zero_division=0
    )
)


# ============================================================
# 12. SAVE TRAINED MODEL
# ============================================================

joblib.dump(model, MODEL_PATH)
model.save_model(JSON_MODEL_PATH)

print("\nModel saved successfully!")
print("Saved files:")
print(MODEL_PATH)
print(JSON_MODEL_PATH)
print(NUMERIC_IMPUTER_PATH)
print(CATEGORICAL_IMPUTER_PATH)
print(FEATURE_ORDER_PATH)
print(CATEGORICAL_COLUMNS_PATH)
print(COLUMNS_PATH)


# ============================================================
# 13. SAMPLE PREDICTION
# ============================================================

sample = X_test_encoded.iloc[[0]]

probability = float(
    model.predict_proba(sample)[0][1]
)

predicted_class = int(probability >= 0.5)

print("\n" + "=" * 60)
print("SAMPLE PREDICTION")
print("=" * 60)

print(f"Estimated model probability: {probability * 100:.2f}%")
print("Predicted class:", predicted_class)
print("0 = No Diabetes, 1 = Diabetes")

print("\nTraining pipeline finished successfully!")
