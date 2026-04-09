"use client";
import type { PredictionResponse } from "@/lib/types";

function riskColor(prediction: string | number) {
  if (typeof prediction === "string") {
    if (prediction === "Low") return "risk-low";
    if (prediction === "Medium") return "risk-medium";
    return "risk-high";
  }
  return "";
}

export default function PredictionCard({ result }: { result: PredictionResponse }) {
  const isClassification = result.task === "classification";

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold">Prediction Result</h3>

      <div className="flex items-baseline gap-3">
        <span className={`text-4xl font-bold ${riskColor(result.prediction)}`}>
          {isClassification ? result.prediction : result.prediction}
        </span>
        <span className="text-neutral-400 text-sm">
          {isClassification ? "risk level" : "predicted crime count"}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="px-3 py-2 rounded-lg" style={{ background: "var(--bg)" }}>
          <span className="text-neutral-400">Model: </span>
          <span className="font-mono">{result.model_used.replace(/_/g, " ")}</span>
        </div>
        {Object.entries(result.inputs).map(([key, val]) => (
          <div key={key} className="px-3 py-2 rounded-lg" style={{ background: "var(--bg)" }}>
            <span className="text-neutral-400">{key.replace(/_/g, " ")}: </span>
            <span>{String(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
