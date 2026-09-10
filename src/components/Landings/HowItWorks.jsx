import {
  Database,
  BrainCircuit,
  BellRing,
  CheckCircle2,
} from "lucide-react";

import SectionHeading from "../UI/SectionHeading";
import IconBox from "../UI/IconBox";

export default function HowItWorks() {
  const steps = [
    {
      icon: Database,
      title: "Connect your sensors",
      body:
        "Connect your temperature and shipment sensors to start collecting real-time operational data.",
    },
    {
      icon: BrainCircuit,
      title: "AI analyzes every reading",
      body:
        "CryoGuard continuously analyzes sensor readings and shipment conditions to identify potential risks.",
    },
    {
      icon: BellRing,
      title: "Receive an early warning",
      body:
        "Get timely alerts when the system detects conditions that could threaten your shipment.",
    },
    {
      icon: CheckCircle2,
      title: "Take action",
      body:
        "Use the available response time to intervene and protect the cargo before a serious breach occurs.",
    },
  ];

  return (
    <section id="how-it-works" className="lp-section lp-how">
      <SectionHeading
        label="HOW IT WORKS"
        title="From sensor data to smarter decisions."
        description="A simple workflow designed around real-world cold-chain operations."
      />

      <div className="lp-steps-grid">
        {steps.map(({ icon: Icon, title, body }, index) => (
          <div className="lp-step" key={title}>
            <div className="lp-step-number">
              0{index + 1}
            </div>

            <IconBox
              icon={Icon}
              size={22}
              className="lp-step-icon"
            />

            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}