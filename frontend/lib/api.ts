const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function getHealth() {
  return request<{ status: string; models_loaded: number }>("/health");
}

export async function getModels() {
  return request<import("./types").ModelsResponse>("/models");
}

export async function getMetadata() {
  return request<import("./types").Metadata>("/data/metadata");
}

export async function predictRegression(data: import("./types").RegressionRequest) {
  return request<import("./types").PredictionResponse>("/predict/regression", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function predictClassification(data: import("./types").ClassificationRequest) {
  return request<import("./types").PredictionResponse>("/predict/classification", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function compareModels(data: {
  community: string; sector: string; category: string;
  year: number; month: number; resident_count: number; task: string;
}) {
  return request<import("./types").CompareResponse>("/compare", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
