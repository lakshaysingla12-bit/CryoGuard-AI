function TrainingProgress() {
  return (
    <section className="dashboard-card training-card">

      <div className="section-header">
        <h2>Training Progress</h2>
      </div>

      <div className="training-content">
        <div className="training-info">
          <p>Cold Chain Handling</p>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>

        <strong>75%</strong>

        <button>Continue</button>
      </div>

    </section>
  );
}

export default TrainingProgress;