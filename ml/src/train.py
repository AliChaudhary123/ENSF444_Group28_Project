"""Train all regression and classification models and save artifacts."""

import json
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import Lasso, LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score,
)
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from preprocess import load_raw_data, prepare_regression_data, prepare_classification_data, get_metadata

MODELS_DIR = Path(__file__).resolve().parents[1] / "models"
MODELS_DIR.mkdir(exist_ok=True)


def build_regression_preprocessor():
    cat_features = ["sector", "community_name", "category", "month"]
    num_features = ["year", "resident_count"]
    return ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features),
        ("num", StandardScaler(), num_features),
    ]), cat_features, num_features


def build_classification_preprocessor():
    cat_features = ["sector", "community_name", "month"]
    num_features = ["year", "resident_count"]
    return ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features),
        ("num", StandardScaler(), num_features),
    ]), cat_features, num_features


def train_regression_models(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    preprocessor, _, _ = build_regression_preprocessor()

    models = {
        "random_forest_regressor": {
            "estimator": RandomForestRegressor(random_state=42),
            "params": {"model__n_estimators": [200], "model__max_depth": [15], "model__min_samples_leaf": [2]},
        },
        "lasso_regressor": {
            "estimator": Lasso(max_iter=10000),
            "params": {"model__alpha": [0.001, 0.01, 0.1, 1.0]},
        },
        "gradient_boosting_regressor": {
            "estimator": GradientBoostingRegressor(random_state=42),
            "params": {"model__n_estimators": [200], "model__learning_rate": [0.1], "model__max_depth": [5]},
        },
    }

    results = {}
    for name, cfg in models.items():
        print(f"  Training {name}...")
        t0 = time.time()
        pipe = Pipeline([("preprocessor", preprocessor), ("model", cfg["estimator"])])
        grid = GridSearchCV(pipe, cfg["params"], cv=3, scoring="r2", n_jobs=-1)
        grid.fit(X_train, y_train)

        y_pred = grid.predict(X_test)
        mse = float(mean_squared_error(y_test, y_pred))
        metrics = {
            "type": "regression",
            "mse": mse,
            "rmse": float(np.sqrt(mse)),
            "mae": float(mean_absolute_error(y_test, y_pred)),
            "r2": float(r2_score(y_test, y_pred)),
            "best_params": {k.replace("model__", ""): v for k, v in grid.best_params_.items()},
            "train_time_s": round(time.time() - t0, 1),
        }

        artifact_path = MODELS_DIR / f"{name}.pkl"
        joblib.dump(grid.best_estimator_, artifact_path)
        results[name] = metrics
        print(f"    R²={metrics['r2']:.4f}  RMSE={metrics['rmse']:.4f}  ({metrics['train_time_s']}s)")

    return results


def train_classification_models(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    preprocessor, _, _ = build_classification_preprocessor()

    models = {
        "logistic_regression_classifier": {
            "estimator": LogisticRegression(max_iter=5000, random_state=42, solver="saga"),
            "params": {"model__C": [0.1, 1, 10], "model__penalty": ["l1", "l2"]},
        },
        "random_forest_classifier": {
            "estimator": RandomForestClassifier(random_state=42),
            "params": {"model__n_estimators": [200], "model__max_depth": [15]},
        },
        "gradient_boosting_classifier": {
            "estimator": GradientBoostingClassifier(random_state=42),
            "params": {"model__n_estimators": [200], "model__learning_rate": [0.1], "model__max_depth": [5]},
        },
    }

    results = {}
    for name, cfg in models.items():
        print(f"  Training {name}...")
        t0 = time.time()
        pipe = Pipeline([("preprocessor", preprocessor), ("model", cfg["estimator"])])
        grid = GridSearchCV(pipe, cfg["params"], cv=3, scoring="f1_weighted", n_jobs=-1)
        grid.fit(X_train, y_train)

        y_pred = grid.predict(X_test)
        report = classification_report(y_test, y_pred, output_dict=True)
        cm = confusion_matrix(y_test, y_pred).tolist()
        metrics = {
            "type": "classification",
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "f1_weighted": float(report["weighted avg"]["f1-score"]),
            "precision_weighted": float(report["weighted avg"]["precision"]),
            "recall_weighted": float(report["weighted avg"]["recall"]),
            "confusion_matrix": cm,
            "per_class": {
                "low": {"precision": report["0"]["precision"], "recall": report["0"]["recall"], "f1": report["0"]["f1-score"]},
                "medium": {"precision": report["1"]["precision"], "recall": report["1"]["recall"], "f1": report["1"]["f1-score"]},
                "high": {"precision": report["2"]["precision"], "recall": report["2"]["recall"], "f1": report["2"]["f1-score"]},
            },
            "best_params": {k.replace("model__", ""): v for k, v in grid.best_params_.items()},
            "train_time_s": round(time.time() - t0, 1),
        }

        artifact_path = MODELS_DIR / f"{name}.pkl"
        joblib.dump(grid.best_estimator_, artifact_path)
        results[name] = metrics
        print(f"    Accuracy={metrics['accuracy']:.4f}  F1={metrics['f1_weighted']:.4f}  ({metrics['train_time_s']}s)")

    return results


def main():
    print("Loading data...")
    df = load_raw_data()
    print(f"  {len(df)} rows loaded\n")

    metadata = get_metadata(df)

    print("=== Regression Models ===")
    X_reg, y_reg = prepare_regression_data(df)
    print(f"  Regression dataset: {X_reg.shape[0]} samples")
    reg_results = train_regression_models(X_reg, y_reg)

    print("\n=== Classification Models ===")
    X_cls, y_cls = prepare_classification_data(df)
    print(f"  Classification dataset: {X_cls.shape[0]} samples")
    cls_results = train_classification_models(X_cls, y_cls)

    all_metrics = {**reg_results, **cls_results}
    metrics_path = MODELS_DIR / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"\nMetrics saved to {metrics_path}")

    metadata_path = MODELS_DIR / "metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to {metadata_path}")

    print("\nAll models saved to", MODELS_DIR)


if __name__ == "__main__":
    main()
