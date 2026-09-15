
import { useEffect, useState } from "react";
import {
  Database,
  BrainCircuit,
  BellRing,
  CheckCircle2,
  X,
} from "lucide-react";

import SectionHeading from "../UI/SectionHeading";
import IconBox from "../UI/IconBox";

export default function HowItWorks() {
  const [selectedStep, setSelectedStep] = useState(null);

  const steps = [
    {
      icon: Database,
      title: "Connect your sensors",
      body:
        "Connect your temperature and shipment sensors to start collecting real-time operational data.",
      details:
        "CryoGuard connects with temperature and shipment sensors to collect important information such as temperature, location, and shipment conditions in real time.",
    },
    {
      icon: BrainCircuit,
      title: "AI analyzes every reading",
      body:
        "CryoGuard continuously analyzes sensor readings and shipment conditions to identify potential risks.",
      details:
        "The AI continuously studies incoming sensor data and identifies unusual patterns or conditions that may indicate a potential cold-chain risk.",
    },
    {
      icon: BellRing,
      title: "Receive an early warning",
      body:
        "Get timely alerts when the system detects conditions that could threaten your shipment.",
      details:
        "When CryoGuard detects a potentially dangerous condition, the system provides an early warning so the operations team has time to investigate and respond.",
    },
    {
      icon: CheckCircle2,
      title: "Take action",
      body:
        "Use the available response time to intervene and protect the cargo before a serious breach occurs.",
      details:
        "Teams can use the early warning to take corrective action, investigate the shipment, and help prevent temperature-related losses.",
    },
  ];

  // Close popup when Escape key is pressed
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedStep(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <section id="how-it-works" className="lp-section lp-how">
      <SectionHeading
        label="HOW IT WORKS"
        title="From sensor data to smarter decisions."
        description="A simple workflow designed around real-world cold-chain operations."
      />

      {/* HOW IT WORKS CARDS */}
      <div className="lp-steps-grid">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              className="lp-step"
              key={step.title}
              onClick={() => setSelectedStep(step)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedStep(step);
                }
              }}
            >
              <div className="lp-step-number">0{index + 1}</div>

              <IconBox
                icon={Icon}
                size={22}
                className="lp-step-icon"
              />

              <h3>{step.title}</h3>

              <p>{step.body}</p>
            </div>
          );
        })}
      </div>

      {/* POPUP */}
      {selectedStep &&
        (() => {
          const SelectedIcon = selectedStep.icon;

          return (
            <div
              className="lp-step-modal-overlay"
              onClick={() => setSelectedStep(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="step-modal-title"
            >
              <div
                className="lp-step-modal"
                onClick={(event) => event.stopPropagation()}
              >
                {/* CLOSE BUTTON */}
                <button
                  type="button"
                  className="lp-step-modal-close"
                  onClick={() => setSelectedStep(null)}
                  aria-label="Close popup"
                >
                  <X size={18} />
                </button>

                {/* ICON */}
                <div className="lp-step-modal-icon">
                  <SelectedIcon size={26} />
                </div>

                

                {/* TITLE */}
                <h3 id="step-modal-title">{selectedStep.title}</h3>

                {/* DETAILS */}
                <p>{selectedStep.details}</p>

                {/* CLOSE BUTTON */}
                <button
                  type="button"
                  className="lp-step-modal-button"
                  onClick={() => setSelectedStep(null)}
                >
                  Got it
                </button>
              </div>
            </div>
          );
        })()}
    </section>
  );
}

