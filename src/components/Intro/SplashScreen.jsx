import { Snowflake } from "lucide-react";

/**
 * Purely presentational — every value it draws comes in as a prop from
 * IntroGate. That keeps it reusable (e.g. you could reuse it for an
 * in-app "reconnecting" overlay later) and easy to test.
 */
export default function SplashScreen({
  phase,
  steps,
  stepIndex,
  progress,
  onSkip,
}) {
  return (
    <div
      className={`cg-splash cg-splash-${phase}`}
      role="status"
      aria-live="polite"
    >
      <div className="cg-splash-grid" aria-hidden="true" />
      <div className="cg-splash-glow" aria-hidden="true" />

      <div className="cg-splash-content">
        <div className="cg-splash-mark">
          <Snowflake size={32} />
        </div>

        <p className="cg-splash-word">
          CryoGuard <b>AI</b>
        </p>

        {/* Bootstrap's progress component, restyled with our own theme */}
        <div
          className="progress cg-splash-progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-bar cg-splash-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ul className="cg-splash-steps">
          {steps.map((step, index) => (
            <li
              key={step}
              className={
                index < stepIndex ? "done" : index === stepIndex ? "active" : ""
              }
            >
              {step}
            </li>
          ))}
        </ul>
      </div>

      <button type="button" className="cg-splash-skip" onClick={onSkip}>
        Skip
      </button>
    </div>
  );
}
