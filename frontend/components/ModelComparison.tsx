"use client";
import type { CompareResponse } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7"];

export default function ModelComparison({ comparison }: { comparison: CompareResponse }) {
  const isRegression = comparison.task === "regression";

  const chartData = comparison.results
    .filter((r) => !("error" in r))
    .map((r, i) => ({
      name: r.model_used.replace(/_/g, " ").replace(/(regressor|classifier)/, "").trim(),
      value: typeof r.prediction === "number" ? r.prediction : r.prediction_raw ?? 0,
      label: String(r.prediction),
      color: COLORS[i % COLORS.length],
    }));

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold">
        Model Comparison {isRegression ? "(Crime Count)" : "(Risk Level)"}
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis type="number" stroke="#a3a3a3" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={11} width={140} />
            <Tooltip
              contentStyle={{ background: "#141414", border: "1px solid #262626", borderRadius: "8px" }}
              labelStyle={{ color: "#e5e5e5" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400">
              <th className="py-2 pr-4">Model</th>
              <th className="py-2">{isRegression ? "Predicted Count" : "Risk Level"}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.results.map((r) => (
              <tr key={r.model_used} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="py-2 pr-4 font-mono text-xs">
                  {r.model_used.replace(/_/g, " ")}
                </td>
                <td className="py-2 font-semibold">
                  {"error" in r ? (
                    <span className="text-red-400">{String((r as Record<string, unknown>).error)}</span>
                  ) : (
                    String(r.prediction)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
