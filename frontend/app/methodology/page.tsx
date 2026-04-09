"use client";
import { useEffect, useState } from "react";
import type { ModelsResponse } from "@/lib/types";
import { getModels } from "@/lib/api";
import MetricsChart from "@/components/charts/MetricsChart";

export default function MethodologyPage() {
  const [models, setModels] = useState<ModelsResponse | null>(null);

  useEffect(() => {
    getModels().then(setModels).catch(() => {});
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Methodology</h1>
        <p className="text-neutral-400 text-sm mt-1">
          How the models were trained, evaluated, and compared.
        </p>
      </div>

      {/* Data */}
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Dataset</h2>
        <p className="text-sm text-neutral-300 leading-relaxed">
          Calgary Police Service Community Crime Statistics (2018-2023). Contains
          66,349 records across 293 communities, 8 sectors, and 9 crime
          categories with monthly granularity.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          {[
            { label: "Records", value: "66,349" },
            { label: "Time Range", value: "2018 - 2023" },
            { label: "Features", value: "6 (regression) / 5 (classification)" },
          ].map((s) => (
            <div key={s.label} className="text-center px-4 py-3 rounded-lg" style={{ background: "var(--bg)" }}>
              <div className="font-bold">{s.value}</div>
              <div className="text-xs text-neutral-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Preprocessing */}
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Preprocessing</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">Categorical Features</h3>
            <p className="text-neutral-400">
              OneHotEncoder with handle_unknown=&quot;ignore&quot; applied to sector,
              community name, crime category, and month.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Numerical Features</h3>
            <p className="text-neutral-400">
              StandardScaler applied to year and resident count. Tree-based
              models use passthrough for numerical features.
            </p>
          </div>
        </div>
      </section>

      {/* Regression */}
      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Regression Models</h2>
        <p className="text-sm text-neutral-400">
          Predict the exact crime count for a given community, month, year, and
          crime category. Evaluated using R², RMSE, and MAE.
        </p>
        {models && <MetricsChart models={models.regression} task="regression" />}
        {models?.regression.map((m) => (
          <div key={m.name} className="border-t pt-4 space-y-2" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-mono text-sm font-medium">{m.name.replace(/_/g, " ")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <Metric label="R²" value={m.r2?.toFixed(4)} />
              <Metric label="RMSE" value={m.rmse?.toFixed(4)} />
              <Metric label="MAE" value={m.mae?.toFixed(4)} />
              <Metric label="Train Time" value={`${m.train_time_s}s`} />
            </div>
          </div>
        ))}
      </section>

      {/* Classification */}
      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Classification Models</h2>
        <p className="text-sm text-neutral-400">
          Classify community-months into Low, Medium, or High risk. Risk levels
          are defined by the 33rd and 66th percentiles of aggregated crime
          totals. Evaluated using accuracy, weighted F1, and per-class metrics.
        </p>
        {models && <MetricsChart models={models.classification} task="classification" />}
        {models?.classification.map((m) => (
          <div key={m.name} className="border-t pt-4 space-y-2" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-mono text-sm font-medium">{m.name.replace(/_/g, " ")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <Metric label="Accuracy" value={`${((m.accuracy ?? 0) * 100).toFixed(1)}%`} />
              <Metric label="F1 (weighted)" value={m.f1_weighted?.toFixed(4)} />
              <Metric label="Precision" value={m.precision_weighted?.toFixed(4)} />
              <Metric label="Recall" value={m.recall_weighted?.toFixed(4)} />
            </div>
            {m.per_class && (
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                {Object.entries(m.per_class).map(([cls, v]) => (
                  <div key={cls} className="px-3 py-2 rounded-lg" style={{ background: "var(--bg)" }}>
                    <div className={`font-medium ${cls === "low" ? "risk-low" : cls === "medium" ? "risk-medium" : "risk-high"}`}>
                      {cls.charAt(0).toUpperCase() + cls.slice(1)} Risk
                    </div>
                    <div className="text-neutral-400 mt-1">
                      P={v.precision.toFixed(2)} R={v.recall.toFixed(2)} F1={v.f1.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Limitations */}
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Limitations & Ethics</h2>
        <ul className="text-sm text-neutral-400 space-y-2 list-disc list-inside">
          <li>Models are trained on historical data and may not reflect future patterns.</li>
          <li>Missing external factors: weather, major events, economic conditions, policing changes.</li>
          <li>Predictions should not be used for profiling or targeting specific communities.</li>
          <li>Medium-risk class is hard to predict due to overlap with low and high classes.</li>
          <li>Data covers 2018-2023; predictions outside this range are extrapolation.</li>
          <li>Crime reporting bias: not all crimes are reported, and reporting rates vary by community.</li>
        </ul>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="px-3 py-2 rounded-lg" style={{ background: "var(--bg)" }}>
      <div className="text-xs text-neutral-400">{label}</div>
      <div className="font-mono font-medium">{value ?? "N/A"}</div>
    </div>
  );
}
