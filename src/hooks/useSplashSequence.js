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

  const skipIntro = useCallback(() => {
    clearTimers();
    setPhase((prev) => (prev === "done" ? prev : "exiting"));
    const holdFor = prefersReducedMotion ? 150 : exitDuration;
    const t = setTimeout(() => {
      setPhase("done");
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        /* sessionStorage unavailable */
      }
    }, holdFor);
    timers.current.push(t);
  }, [clearTimers, exitDuration, prefersReducedMotion]);

  useEffect(() => {
    if (phase !== "loading") return undefined;

    if (prefersReducedMotion) {
      skipIntro();
      return undefined;
    }

    if (stepIndex >= steps.length - 1) {
      const t = setTimeout(skipIntro, stepDuration + 250);
      timers.current.push(t);
      return clearTimers;
    }

    const t = setTimeout(() => setStepIndex((i) => i + 1), stepDuration);
    timers.current.push(t);
    return clearTimers;
  }, [phase, stepIndex]);

  useEffect(() => clearTimers, [clearTimers]);
}
