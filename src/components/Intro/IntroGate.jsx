import useSplashSequence from "../../hooks/useSplashSequence";
import SplashScreen from "./SplashScreen";

export default function IntroGate({ children }) {
  const intro = useSplashSequence();

  const isRevealing = intro.phase === "exiting";

  return (
    <>
      {intro.phase !== "done" && (
        <SplashScreen
          phase={intro.phase}
          steps={intro.steps}
          stepIndex={intro.stepIndex}
          progress={intro.progress}
          onSkip={intro.skipIntro}
        />
      )}

      <div
        className={`cg-reveal-content${
          isRevealing ? " cg-reveal-content--animate" : ""
        }`}
      >
        {children}
      </div>
    </>
  );
}
