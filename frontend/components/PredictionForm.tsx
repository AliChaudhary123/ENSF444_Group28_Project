"use client";
import { useState, useEffect } from "react";
import type { Metadata, PredictionResponse, CompareResponse } from "@/lib/types";
import { getMetadata, predictRegression, predictClassification, compareModels } from "@/lib/api";
import PredictionCard from "./PredictionCard";
import ModelComparison from "./ModelComparison";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const REGRESSION_MODELS = [
  { value: "random_forest_regressor", label: "Random Forest" },
  { value: "lasso_regressor", label: "Lasso Regression" },
  { value: "gradient_boosting_regressor", label: "Gradient Boosting" },
];

const CLASSIFICATION_MODELS = [
  { value: "gradient_boosting_classifier", label: "Gradient Boosting" },
  { value: "random_forest_classifier", label: "Random Forest" },
  { value: "logistic_regression_classifier", label: "Logistic Regression" },
];

export default function PredictionForm() {
  const [meta, setMeta] = useState<Metadata | null>(null);
  const [task, setTask] = useState<"regression" | "classification">("regression");
  const [community, setCommunity] = useState("");
  const [sector, setSector] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState(2023);
  const [month, setMonth] = useState(1);
  const [residentCount, setResidentCount] = useState(5000);
  const [modelName, setModelName] = useState("random_forest_regressor");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMetadata().then((m) => {
      setMeta(m);
      if (m.communities.length) setCommunity(m.communities[0]);
      if (m.sectors.length) setSector(m.sectors[0]);
      if (m.categories.length) setCategory(m.categories[0]);
      setResidentCount(m.resident_count_range.median);
    }).catch(() => setError("Could not connect to API. Is the backend running?"));
  }, []);

  useEffect(() => {
    setModelName(task === "regression" ? "random_forest_regressor" : "gradient_boosting_classifier");
    setResult(null);
    setComparison(null);
  }, [task]);

  async function handlePredict() {
    setLoading(true);
    setError("");
    setResult(null);
    setComparison(null);
    try {
      if (task === "regression") {
        const res = await predictRegression({
          community, sector, category, year, month,
          resident_count: residentCount, model_name: modelName,
        });
        setResult(res);
      } else {
        const res = await predictClassification({
          community, sector, year, month,
          resident_count: residentCount, model_name: modelName,
        });
        setResult(res);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Prediction failed");
    }
    setLoading(false);
  }

  async function handleCompare() {
    setLoading(true);
    setError("");
    setResult(null);
    setComparison(null);
    try {
      const res = await compareModels({
        community, sector, category, year, month,
        resident_count: residentCount, task,
      });
      setComparison(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Comparison failed");
    }
    setLoading(false);
  }

  if (!meta) {
    return (
      <div className="card text-center py-12">
        <p className="text-neutral-400">
          {error || "Loading metadata from API..."}
        </p>
      </div>
    );
  }

  const modelOptions = task === "regression" ? REGRESSION_MODELS : CLASSIFICATION_MODELS;

  return (
    <div className="space-y-6">
      {/* Task toggle */}
      <div className="flex gap-2">
        {(["regression", "classification"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTask(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              task === t
                ? "bg-blue-600 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
            style={task !== t ? { background: "var(--border)" } : {}}
          >
            {t === "regression" ? "Crime Count Prediction" : "Risk Level Classification"}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="card">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Sector</label>
            <select className="input" value={sector} onChange={(e) => setSector(e.target.value)}>
              {meta.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Community</label>
            <select className="input" value={community} onChange={(e) => setCommunity(e.target.value)}>
              {meta.communities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {task === "regression" && (
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Crime Category</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Year</label>
            <select className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {meta.years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Month</label>
            <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {meta.months.map((m) => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Resident Count ({meta.resident_count_range.min.toLocaleString()} - {meta.resident_count_range.max.toLocaleString()})
            </label>
            <input
              type="number"
              className="input"
              value={residentCount}
              onChange={(e) => setResidentCount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Model</label>
            <select className="input" value={modelName} onChange={(e) => setModelName(e.target.value)}>
              {modelOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn" onClick={handlePredict} disabled={loading}>
            {loading ? "Predicting..." : "Predict"}
          </button>
          <button
            className="btn"
            style={{ background: "var(--border)" }}
            onClick={handleCompare}
            disabled={loading}
          >
            Compare All Models
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Results */}
      {result && <PredictionCard result={result} />}
      {comparison && <ModelComparison comparison={comparison} />}
    </div>
  );
}
