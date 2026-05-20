"use client";
import type { ModelMetrics } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = {
  primary: "#3b82f6",
  secondary: "#22c55e",
  tertiary: "#eab308",
};

export default function MetricsChart({
  models,
  task,
}: {
  models: ModelMetrics[];
  task: "regression" | "classification";
}) {
  if (!models.length) return null;

  if (task === "regression") {
    const data = models.map((m) => ({
      name: m.name.replace(/_/g, " ").replace(/(regressor|classifier)/, "").trim(),
      "R²": Number(m.r2?.toFixed(4)),
      RMSE: Number(m.rmse?.toFixed(4)),
      MAE: Number(m.mae?.toFixed(4)),
    }));

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} />
            <YAxis stroke="#a3a3a3" fontSize={11} />
            <Tooltip
              contentStyle={{ background: "#141414", border: "1px solid #262626", borderRadius: "8px" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="R²" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="RMSE" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="MAE" fill={COLORS.tertiary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const data = models.map((m) => ({
    name: m.name.replace(/_/g, " ").replace(/(regressor|classifier)/, "").trim(),
    Accuracy: Number(((m.accuracy ?? 0) * 100).toFixed(1)),
    "F1 Score": Number(((m.f1_weighted ?? 0) * 100).toFixed(1)),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} />
          <YAxis stroke="#a3a3a3" fontSize={11} domain={[0, 100]} unit="%" />
          <Tooltip
            contentStyle={{ background: "#141414", border: "1px solid #262626", borderRadius: "8px" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Accuracy" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
          <Bar dataKey="F1 Score" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
