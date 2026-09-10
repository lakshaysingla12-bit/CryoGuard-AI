import {
  Activity,
  MapPin,
  BrainCircuit,
  Thermometer,
  CheckCircle2,
  Truck,
  ArrowRight,
  CircleCheck,
  Radar,
  BellRing,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: <BrainCircuit size={22} />,
    title: "AI Risk Prediction",
    description:
      "Predict potential temperature breaches before they happen using real-time sensor data and historical patterns.",
  },
  {
    icon: <Radar size={22} />,
    title: "Live Fleet Monitoring",
    description:
      "Monitor every vehicle, shipment and temperature reading from one centralized dashboard.",
  },
  {
    icon: <BellRing size={22} />,
    title: "Smart Alerts",
    description:
      "Automatically notify the right team member when temperature, route or equipment risks appear.",
  },
  {
    icon: <Thermometer size={22} />,
    title: "Temperature Intelligence",
    description:
      "Track temperature trends and identify abnormal behavior before it becomes a serious problem.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Real-Time Location",
    description:
      "Know exactly where every shipment is and connect location data with operational risk.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Analytics & Reports",
    description:
      "Turn fleet data into actionable reports, performance metrics and operational insights.",
  },
];

export default function HeroFeatures({ onOpenSignup }) {
  return (
    <>
      {/* =========================================
          HERO SECTION
      ========================================= */}

      <section className="lp-hero">
        {/* Hero Content */}

        <div className="lp-hero-copy">
          <div className="lp-status-pill">
            <span className="lp-status-dot"></span>
            AI-powered cold-chain intelligence
          </div>

          <p className="lp-kicker">COLD-CHAIN MONITORING REIMAGINED</p>

          <h1>
            Protect every shipment
            <span> before it's too late.</span>
          </h1>

          <p className="lp-hero-sub">
            CryoGuard AI continuously monitors your fleet, predicts temperature
            breaches and gives your team time to act before valuable cargo is
            compromised.
          </p>

          {/* Buttons */}

          <div className="lp-hero-actions">
            <button
              type="button"
              className="lp-btn lp-btn-primary"
              onClick={() => onOpenSignup && onOpenSignup()}
            >
              Start Monitoring
              <ArrowRight size={17} />
            </button>

            <a href="#how-it-works" className="lp-btn lp-btn-glass">
              See How It Works
            </a>
          </div>

          {/* Trust Line */}

          <div className="lp-trust-line">
            <CircleCheck size={17} />
            No Hardware Lock-in
            <span>•</span>
            Real-Time Monitoring
            <span>•</span>
            AI Predictions
          </div>
        </div>

        {/* =========================================
            HERO DASHBOARD
        ========================================= */}

        <div className="lp-hero-visual">
          {/* Orbit Background */}

          <div className="lp-orbit lp-orbit-one"></div>

          <div className="lp-orbit lp-orbit-two"></div>

          {/* Main Dashboard Card */}

          <div className="lp-dashboard-card">
            {/* Dashboard Header */}

            <div className="lp-dashboard-top">
              <div>
                <p>LIVE SHIPMENT</p>

                <h3>TRK-1042</h3>
              </div>

              <span className="lp-live-badge">
                <span></span>
                LIVE
              </span>
            </div>

            {/* Temperature */}

            <div className="lp-temperature">
              <div>
                <span>Current temperature</span>

                <strong>7.2°C</strong>
              </div>

              <div className="lp-temperature-status">
                <CheckCircle2 size={15} />
                Safe range
              </div>
            </div>

            {/* Mini Temperature Chart */}

            <div className="lp-mini-chart">
              <div className="lp-chart-line"></div>

              <div className="lp-chart-limit"></div>

              <span className="lp-chart-label">8°C limit</span>

              <span className="lp-chart-dot lp-dot-one"></span>

              <span className="lp-chart-dot lp-dot-two"></span>

              <span className="lp-chart-dot lp-dot-three"></span>
            </div>

            {/* Dashboard Footer */}

            <div className="lp-dashboard-footer">
              <div>
                <MapPin size={15} />
                Delhi → Chandigarh
              </div>

              <div>
                <Truck size={15} />
                In transit
              </div>
            </div>
          </div>

          {/* =========================================
              FLOATING AI CARD
          ========================================= */}

          <div className="lp-floating-card lp-ai-floating">
            <div className="lp-floating-icon ai">
              <BrainCircuit size={19} />
            </div>

            <div>
              <span>AI Prediction</span>

              <strong>Risk detected</strong>

              <small>Breach possible in ~45 min</small>
            </div>
          </div>

          {/* =========================================
              FLOATING TEMPERATURE CARD
          ========================================= */}

          <div className="lp-floating-card lp-temperature-floating">
            <div className="lp-floating-icon temp">
              <Thermometer size={18} />
            </div>

            <div>
              <span>Temperature</span>

              <strong>7.2°C</strong>

              <small>Within safe range</small>
            </div>
          </div>

          {/* =========================================
              FLOATING FLEET CARD
          ========================================= */}

          <div className="lp-floating-card lp-fleet-floating">
            <div className="lp-floating-icon fleet">
              <Activity size={18} />
            </div>

            <div>
              <span>Fleet status</span>

              <strong>24 Active</strong>

              <small>2 need attention</small>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          TRUST STATS
      ========================================= */}

      <section className="lp-trust-stats">
        <div className="lp-trust-stat">
          <strong>99.2%</strong>

          <span>Compliance rate</span>
        </div>

        <div className="lp-trust-stat">
          <strong>45 min</strong>

          <span>Average lead time</span>
        </div>

        <div className="lp-trust-stat">
          <strong>3.2M+</strong>

          <span>KM monitored</span>
        </div>

        <div className="lp-trust-stat">
          <strong>24/7</strong>

          <span>AI monitoring</span>
        </div>
      </section>

      {/* =========================================
          FEATURES
      ========================================= */}

      <section className="lp-features" id="features">
        {/* Features Heading */}

        <div className="lp-features-heading">
          <span>POWERFUL FEATURES</span>

          <h2>Everything your cold-chain operation needs.</h2>

          <p>
            One intelligent platform for monitoring, prediction, alerts and
            operational decisions.
          </p>
        </div>

        {/* Feature Cards */}

        <div className="lp-features-grid">
          {features.map((feature, index) => (
            <article className="lp-feature-card" key={index}>
              {/* Icon */}

              <div className="lp-feature-icon">{feature.icon}</div>

              {/* Title */}

              <h3>{feature.title}</h3>

              {/* Description */}

              <p>{feature.description}</p>

              {/* Arrow */}

              <ArrowRight size={18} className="lp-feature-arrow" />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
