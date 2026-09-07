import { useState } from "react";
import "./Worker.css";
import Assignments from "./Assignments";
import Temperature from "./Temperature";
import TrainingProgress from "./TrainingProgress";
import Messages from "./Messages";
import WorkerHeader from "./WorkerHeader";
import { useNavigate } from "react-router-dom";
function Worker() {
  const [activeSection, setActiveSection] = useState("dashboard");
const navigate = useNavigate();
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

          {/* My Tasks */}
          <button
            className={`summary-card ${
              activeSection === "tasks"
                ? "active-summary-card"
                : ""
            }`}
            onClick={() => setActiveSection("tasks")}
          >
            <div className="summary-icon">☑️</div>

            <div>
              <h3>My Tasks</h3>
              <strong>5</strong>
              <p>Pending</p>
            </div>
          </button>


          {/* Active Shipments */}
          <button 
  className="summary-card"
  onClick={() => navigate("/shipments")}
>
            <div className="summary-icon">🚚</div>

            <div>
              <h3>Active Shipments</h3>
              <strong>3</strong>
              <p>In Progress</p>
            </div>
          </button>


          {/* Alerts */}
          <button
            className={`summary-card ${
              activeSection === "alerts"
                ? "active-summary-card"
                : ""
            }`}
            onClick={() => setActiveSection("alerts")}
          >
            <div className="summary-icon">⚠️</div>

            <div>
              <h3>Alerts</h3>
              <strong>1</strong>
              <p>Requires Attention</p>
            </div>
          </button>


          {/* Completed Today */}
          <button
            className={`summary-card ${
              activeSection === "completed"
                ? "active-summary-card"
                : ""
            }`}
            onClick={() => setActiveSection("completed")}
          >
            <div className="summary-icon">✓</div>

            <div>
              <h3>Completed Today</h3>
              <strong>12</strong>
              <p>Tasks Done</p>
            </div>
          </button>

                </section>


        {/* Selected Summary Section */}
        {activeSection === "tasks" && (
          <div className="section-panel">
            <h2>My Tasks</h2>
            <p>You have 5 pending tasks.</p>
          </div>
        )}

        {activeSection === "shipments" && (
          <div className="section-panel">
            <h2>Active Shipments</h2>
            <p>You have 3 shipments currently in progress.</p>
          </div>
        )}

        {activeSection === "alerts" && (
          <div className="section-panel">
            <h2>Alerts</h2>
            <p>You have 1 alert requiring attention.</p>
          </div>
        )}

        {activeSection === "completed" && (
          <div className="section-panel">
            <h2>Completed Today</h2>
            <p>You have completed 12 tasks today.</p>
          </div>
        )}


        {/* Lower Dashboard */}
        <section className="dashboard-grid">

          <Assignments />

          <Temperature />

          <TrainingProgress />

          <Messages />

        </section>

      </main>

    </div>
  );
}

export default Worker;