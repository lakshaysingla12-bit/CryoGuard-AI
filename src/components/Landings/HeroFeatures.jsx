import {
  Snowflake,
  ShieldCheck,
  Activity,
  MapPin
} from "lucide-react";

export default function HeroFeatures() {
  return (
    <section className="lp-hero">

      <div className="lp-hero-copy">

        <span className="lp-section-label">
          AI-POWERED COLD CHAIN INTELLIGENCE
        </span>

        <h1>
          Keep your cold chain
          <span>one step ahead.</span>
        </h1>

        <p>
          CryoGuard AI helps logistics teams predict temperature
          risks, monitor shipments in real time, and protect
          temperature-sensitive cargo before losses happen.
        </p>

        <div className="lp-hero-actions">
          <a href="#reviews" className="lp-btn lp-btn-primary">
            Explore CryoGuard
          </a>

          <a href="#why-us" className="lp-btn">
            See how it works
          </a>
        </div>

      </div>


      <div className="lp-hero-visual">

        <div className="lp-dashboard-card">

          <div className="lp-dashboard-header">

            <div>
              <span>SHIPMENT HEALTH</span>
              <h3>TRK-1042</h3>
            </div>

            <ShieldCheck size={25} />

          </div>


          <div className="lp-dashboard-score">
            <strong>94</strong>
            <span>/100</span>
          </div>


          <div className="lp-dashboard-progress">
            <span></span>
          </div>


          <div className="lp-dashboard-items">

            <div>
              <Activity size={16} />
              Temperature
            </div>

            <div>
              <MapPin size={16} />
              Route
            </div>

            <div>
              <Snowflake size={16} />
              Sensor
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}