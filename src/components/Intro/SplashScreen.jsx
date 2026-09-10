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
    ></div>
  );
}
