"""Preprocessing utilities for Calgary crime data."""

import pandas as pd
import numpy as np
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "Community_Crime_Statistics_20240102.csv"


def load_raw_data(path: Path = DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    df = df.dropna(subset=["sector", "resident_count", "community_name"])
    return df


def prepare_regression_data(df: pd.DataFrame):
    """Prepare features/target for crime count regression."""
    feature_cols = ["sector", "community_name", "category", "year", "month", "resident_count"]
    df = df.dropna(subset=feature_cols + ["crime_count"])
    X = df[feature_cols].copy()
    y = df["crime_count"].values
    return X, y


def prepare_classification_data(df: pd.DataFrame):
    """Aggregate crimes per community/month and assign risk levels."""
    agg = (
        df.groupby(["sector", "community_name", "resident_count", "year", "month"])
        .agg(total_crime=("crime_count", "sum"))
        .reset_index()
    )
    low_threshold = agg["total_crime"].quantile(0.33)
    high_threshold = agg["total_crime"].quantile(0.66)
    agg["risk_level"] = np.where(
        agg["total_crime"] <= low_threshold, 0,
        np.where(agg["total_crime"] <= high_threshold, 1, 2)
    )
    feature_cols = ["sector", "community_name", "resident_count", "year", "month"]
    X = agg[feature_cols].copy()
    y = agg["risk_level"].values
    return X, y


def get_metadata(df: pd.DataFrame) -> dict:
    """Extract metadata for the frontend (communities, categories, sectors, etc.)."""
    return {
        "communities": sorted(df["community_name"].dropna().unique().tolist()),
        "categories": sorted(df["category"].dropna().unique().tolist()),
        "sectors": sorted(df["sector"].dropna().unique().tolist()),
        "years": sorted(df["year"].dropna().unique().astype(int).tolist()),
        "months": list(range(1, 13)),
        "resident_count_range": {
            "min": int(df["resident_count"].min()),
            "max": int(df["resident_count"].max()),
            "median": int(df["resident_count"].median()),
        },
    }
