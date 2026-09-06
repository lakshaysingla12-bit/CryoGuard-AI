import "./Worker.css";
import WorkerHeader from "./WorkerHeader";

function Worker() {
  return (
    <div className="worker-dashboard">
      <WorkerHeader />

      <main className="worker-main">

        {/* Welcome + Worker Score */}
        <section className="welcome-section">

          <div className="welcome-card">
            <div className="welcome-content">
              <h1>Welcome back, Rohit! 👋</h1>
              <p>Stay safe and keep the cold chain unbroken.</p>
            </div>

            <div className="welcome-image">
              <span>❄️</span>
              <div className="worker-illustration">👷</div>
            </div>
          </div>

          <div className="score-card">
            <h3>Worker Score</h3>

            <div className="score-circle">
              <div className="score">92%</div>
            </div>

            <p className="score-message">Great Job!</p>
            <span className="score-subtext">Keep it up 🚀</span>
          </div>

        </section>

        {/* Summary Cards */}
        <section className="summary-section">

          <div className="summary-card">
            <div className="summary-icon">☑️</div>
            <div>
              <h3>My Tasks</h3>
              <strong>5</strong>
              <p>Pending</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🚚</div>
            <div>
              <h3>Active Shipments</h3>
              <strong>3</strong>
              <p>In Progress</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">⚠️</div>
            <div>
              <h3>Alerts</h3>
              <strong>1</strong>
              <p>Requires Attention</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✓</div>
            <div>
              <h3>Completed Today</h3>
              <strong>12</strong>
              <p>Tasks Done</p>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Worker;