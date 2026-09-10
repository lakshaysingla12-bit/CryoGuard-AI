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
} = {}) {}
