import useSplashSequence from "../../hooks/useSplashSequence";
import SplashScreen from "./SplashScreen";

export default function IntroGate({ children }) {
  const intro = useSplashSequence();

  const isRevealing = intro.phase === "exiting";
}
