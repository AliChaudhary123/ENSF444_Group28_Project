"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ModelsResponse } from "@/lib/types";
import { getModels } from "@/lib/api";

export default function Home() {
  const [models, setModels] = useState<ModelsResponse | null>(null);

  useEffect(() => {
    getModels().then(setModels).catch(() => {});
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Calgary Crime Forecast
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
          Machine learning models trained on 6 years of Calgary Police crime
          statistics to predict crime counts and risk levels across 293 communities.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/dashboard" className="btn">
            Try Predictions
          </Link>
          <Link
            href="/methodology"
            className="btn"
            style={{ background: "var(--border)" }}
          >
            View Methodology
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Records", value: "66,349" },
          { label: "Communities", value: "293" },
          { label: "Crime Categories", value: "9" },
          { label: "Models Trained", value: "6" },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-neutral-400 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Model overview */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold">Regression Models</h2>
          <p className="text-sm text-neutral-400">
            Predict the expected crime count for a given community, time period,
            and crime category.
          </p>
          {models?.regression.map((m) => (
            <div key={m.name} className="flex justify-between text-sm border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <span className="font-mono">{m.name.replace(/_/g, " ")}</span>
              <span className="text-blue-400">R² = {m.r2?.toFixed(3)}</span>
            </div>
          ))}
        </div>
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold">Classification Models</h2>
          <p className="text-sm text-neutral-400">
            Classify a community-month as Low, Medium, or High risk based on
            aggregated crime totals.
          </p>
          {models?.classification.map((m) => (
            <div key={m.name} className="flex justify-between text-sm border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <span className="font-mono">{m.name.replace(/_/g, " ")}</span>
              <span className="text-green-400">Acc = {(m.accuracy! * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Crime categories */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Crime Categories</h2>
        <div className="grid sm:grid-cols-3 gap-2">
          {[
            "Assault (Non-domestic)",
            "Break & Enter - Commercial",
            "Break & Enter - Dwelling",
            "Break & Enter - Other Premises",
            "Commercial Robbery",
            "Street Robbery",
            "Theft FROM Vehicle",
            "Theft OF Vehicle",
            "Violence Other (Non-domestic)",
          ].map((c) => (
            <div key={c} className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bg)" }}>
              {c}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
