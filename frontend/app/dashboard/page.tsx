import PredictionForm from "@/components/PredictionForm";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prediction Dashboard</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Select parameters and run predictions using our trained ML models.
        </p>
      </div>
      <PredictionForm />
    </div>
  );
}
