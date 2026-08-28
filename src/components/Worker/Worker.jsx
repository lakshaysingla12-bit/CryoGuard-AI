import "./Worker.css";

function Worker() {
  return (
    <div className="worker-dashboard">

      <header className="worker-header">
        <div>
          <h2>Worker Portal</h2>
        </div>

        <div className="worker-profile">
          <span>🔔</span>
          <span>EN</span>
          <span>👤 Rohit Kumar</span>
        </div>
      </header>

      <main className="worker-main">

        <section className="welcome-section">
          <div className="welcome-card">
            <h1>Welcome back, Rohit! 👋</h1>
            <p>Stay safe and keep the cold chain unbroken.</p>
          </div>

          <div className="score-card">
            <h3>Worker Score</h3>
            <div className="score">92%</div>
            <p>Great Job!</p>
          </div>
        </section>

        <section className="summary-section">
          <div className="summary-card">
            <h3>My Tasks</h3>
            <strong>5</strong>
            <p>Pending</p>
          </div>

          <div className="summary-card">
            <h3>Active Shipments</h3>
            <strong>3</strong>
            <p>In Progress</p>
          </div>

          <div className="summary-card">
            <h3>Alerts</h3>
            <strong>1</strong>
            <p>Requires Attention</p>
          </div>

          <div className="summary-card">
            <h3>Completed Today</h3>
            <strong>12</strong>
            <p>Tasks Done</p>
          </div>
        </section>

      </main>

    </div>
  );
}

export default Worker;