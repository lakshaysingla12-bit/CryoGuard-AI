import {
  Snowflake,
  ShieldCheck,
  Activity,
  MapPin,
  BrainCircuit,
  Thermometer,
  CheckCircle2,
  Truck,
  ArrowRight,
  CircleCheck
} from "lucide-react";

export default function HeroFeatures() {
  return (
    <section className="lp-hero">

     <div className="lp-hero-copy">

    <div className="lp-status-pill">
      <span className="lp-status-dot"></span>
       AI-powered cold-chain intelligence
    </div>

  <p className="lp-kicker">
    COLD-CHAIN MONITORING REIMAGINED
  </p>

  <h1>
    Protect every shipment
    <span> before it's too late.</span>
  </h1>

  <p className="lp-hero-sub">
    CryoGuard AI continuously monitors your fleet, predicts
    temperature breaches and gives your team time to act
    before valuable cargo is compromised.
  </p>

  <div className="lp-hero-actions">

    <a href="#features" className="lp-btn lp-btn-primary">
      Start monitoring
      <ArrowRight size={17} />
    </a>

    <a href="#how-it-works" className="lp-btn lp-btn-glass">
      See how it works
    </a>

  </div>

  <div className="lp-trust-line">
    <CircleCheck size={17} />
    No hardware lock-in
    <span>•</span>
    Real-time monitoring
    <span>•</span>
    AI predictions
  </div>

</div>

      <div className="lp-hero-visual">
        <div className="lp-orbit lp-orbit-one"></div>
<div className="lp-orbit lp-orbit-two"></div>
        <div className="lp-dashboard-card">

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


  <div className="lp-mini-chart">

    <div className="lp-chart-line"></div>

    <div className="lp-chart-limit"></div>

    <span className="lp-chart-label">
      8°C limit
    </span>

    <span className="lp-chart-dot lp-dot-one"></span>
    <span className="lp-chart-dot lp-dot-two"></span>
    <span className="lp-chart-dot lp-dot-three"></span>

  </div>


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
      

    </div>

    </section>
  );
}