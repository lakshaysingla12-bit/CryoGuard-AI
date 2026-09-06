import { BrainCircuit, AlertTriangle } from "lucide-react";

export default function AiPredictioncards() {
  const prediction = {
    truckId: "TRK-1042",
    severity: "Critical Temperature Risk",
    message: "Temperature is expected to exceed the safe limit",
    window: "within 45 minutes",
    probability: 87,
    recommendation: "Inspect the cooling system and move the truck to a service area."
  };

  return (
    <div className="panel prediction-card">

      <div className="prediction-header">
        <span className="prediction-icon">
          <BrainCircuit size={16} />
        </span>

        <h3 className="prediction-title">
          AI Prediction · {prediction.truckId}
        </h3>
      </div>

      <div className="prediction-alert">
        <AlertTriangle size={15} className="prediction-alert-icon" />

        <p className="prediction-severity">
          {prediction.severity}
        </p>
      </div>

      <p className="prediction-message">
        {prediction.message}{" "}
        <span className="prediction-window">
          {prediction.window}
        </span>
      </p>

      <div className="prediction-probability">

        <div className="prob-row">
          <span>Probability</span>
          <span className="prob-value">
            {prediction.probability}%
          </span>
        </div>

        <div className="prob-track">
          <div
            className="prob-fill"
            style={{ width: `${prediction.probability}%` }}
          ></div>
        </div>

      </div>

      <div className="prediction-recommendation">
        <p className="recommendation-label">
          Recommendation
        </p>

        <p className="recommendation-text">
          {prediction.recommendation}
        </p>
      </div>

      <button className="focus-ring prediction-cta">
        View Full Analysis →
      </button>

    </div>
  );
}
