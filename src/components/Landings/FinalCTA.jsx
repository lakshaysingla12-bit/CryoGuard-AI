import { Snowflake } from "lucide-react";

export default function FinalCTA({ onOpenLogin }) {
  return (
    <section className="lp-final-cta lp-cta-animated">
      <div className="lp-cta-glow"></div>

      <div className="lp-cta-content">
        <div className="lp-cta-icon lp-cta-float">
          <Snowflake size={27} />
        </div>

        <span className="lp-section-label lp-cta-label">
          START MONITORING
        </span>

        <h2 className="lp-cta-title">
          Keep your cold chain
          <span> one step ahead.</span>
        </h2>

        <p className="lp-cta-description">
          See how CryoGuard AI can help your team detect risks before they
          become losses.
        </p>

        <button
          type="button"
          className="lp-btn lp-btn-primary lp-cta-button lp-cta-button-animated"
          onClick={() => onOpenLogin && onOpenLogin()}
        >
          Explore the Dashboard
        </button>
      </div>
    </section>
  );
}

