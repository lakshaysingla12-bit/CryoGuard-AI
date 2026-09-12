
import {
  ShieldCheck,
  Zap,
  LockKeyhole,
  CheckCircle2,
  Eye,
  Clock3,
} from "lucide-react";

import IconBox from "../UI/IconBox";

export default function WhyUs() {
  const healthItems = ["Temperature", "Route", "Sensor"];

  const reasons = [
    {
      icon: Zap,
      title: "Prevent problems, don't just report them",
      body:
        "Traditional monitoring tells you what already happened. CryoGuard focuses on what is likely to happen next.",
    },
    {
      icon: Eye,
      title: "Complete operational visibility",
      body:
        "Temperature, location, shipment status and alerts come together in one simple interface.",
    },
    {
      icon: ShieldCheck,
      title: "Protect high-value cargo",
      body:
        "Reduce the risk of spoiled pharmaceutical, food and temperature-sensitive shipments.",
    },
    {
      icon: Clock3,
      title: "Act while there is still time",
      body:
        "Early warnings give operations teams valuable time to intervene before cargo is compromised.",
    },
  ];

  return (
    <section id="why-us" className="lp-section lp-why">
      {/* WHY US VISUAL */}
      <div className="lp-why-visual">
        <div className="lp-why-card">
          <div className="lp-why-header">
            <div>
              <span>SHIPMENT HEALTH</span>
              <h3>TRK-1042</h3>
            </div>

            <ShieldCheck size={25} />
          </div>

          <div className="lp-health-score">
            <strong>94</strong>
            <span>/100</span>
          </div>

          <div className="lp-progress">
            <span></span>
          </div>

          {/* Shipment Health Items */}
          <div className="lp-health-items">
            {healthItems.map((item) => (
              <div key={item}>
                <CheckCircle2 size={16} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Info Cards */}
        <div className="lp-small-glass lp-small-one">
          <Zap size={16} />
          Early intervention
        </div>

        <div className="lp-small-glass lp-small-two">
          <LockKeyhole size={16} />
          Secure data
        </div>
      </div>

      {/* WHY US CONTENT */}
      <div className="lp-why-copy">
        <span className="lp-section-label">WHY CRYOGUARD</span>

        <h2>Don't wait for a temperature breach.</h2>

        <p className="lp-why-intro">
          Most monitoring systems tell you what went wrong. CryoGuard is
          designed to tell you what is likely to go wrong next.
        </p>

        {/* Reasons */}
        <div className="lp-reasons">
          {reasons.map(({ icon: Icon, title, body }, index) => (
            <div
              className="lp-reason"
              key={title}
              data-index={index}
            >
              <IconBox
                icon={Icon}
                size={19}
                className="lp-reason-icon"
              />

              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

