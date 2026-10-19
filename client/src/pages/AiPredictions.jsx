import PageHeader from "../components/PageHeader.jsx";

function AiPredictions() {
  return (
    <>
      <PageHeader
        title="AI Predictions"
        subtitle="Predictive risk insights for temperature-sensitive shipments"
      />

      <div className="card-box">
        <div className="d-flex align-items-start gap-3">
          <span className="stat-icon text-info">
            <i className="bi bi-cpu"></i>
          </span>
          <div>
            <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle mb-2">
              In Progress
            </span>
            <h2 className="card-title-text mb-2">AI predictions are in progress</h2>
            <p className="text-secondary mb-0">
              Risk forecasts and recommended actions will appear here when this feature is ready.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AiPredictions;
