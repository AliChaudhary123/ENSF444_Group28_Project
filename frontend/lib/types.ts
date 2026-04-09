export interface RegressionRequest {
  community: string;
  sector: string;
  category: string;
  year: number;
  month: number;
  resident_count: number;
  model_name: string;
}

export interface ClassificationRequest {
  community: string;
  sector: string;
  year: number;
  month: number;
  resident_count: number;
  model_name: string;
}

export interface PredictionResponse {
  prediction: number | string;
  prediction_raw?: number;
  model_used: string;
  task: string;
  inputs: Record<string, unknown>;
}

export interface CompareResponse {
  results: PredictionResponse[];
  inputs: Record<string, unknown>;
  task: string;
}

export interface ModelMetrics {
  name: string;
  type: string;
  // regression
  mse?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  // classification
  accuracy?: number;
  f1_weighted?: number;
  precision_weighted?: number;
  recall_weighted?: number;
  confusion_matrix?: number[][];
  per_class?: Record<string, { precision: number; recall: number; f1: number }>;
  best_params?: Record<string, unknown>;
  train_time_s?: number;
}

export interface ModelsResponse {
  regression: ModelMetrics[];
  classification: ModelMetrics[];
}

export interface Metadata {
  communities: string[];
  categories: string[];
  sectors: string[];
  years: number[];
  months: number[];
  resident_count_range: { min: number; max: number; median: number };
}
