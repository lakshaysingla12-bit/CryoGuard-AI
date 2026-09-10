import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const SESSION_KEY = "cg_intro_played";

const DEFAULT_STEPS = [
  "Connecting to fleet sensors",
  "Syncing live temperature data",
  "Calibrating risk model",
  "Ready",
];

export default function useSplashSequence({
  steps = DEFAULT_STEPS,
  stepDuration = 550,
  exitDuration = 900,
  skipIfPlayed = true,
} = {}) {
  const alreadyPlayed = useMemo(() => {
    if (!skipIfPlayed) return false;
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  }, [skipIfPlayed]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [phase, setPhase] = useState(alreadyPlayed ? "done" : "loading");
  const [stepIndex, setStepIndex] = useState(0);
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
}
