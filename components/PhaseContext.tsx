"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  detectPhase,
  readPhaseSignalsFromStorage,
  type Phase,
} from "@/lib/phase-detector";

const PhaseContext = createContext<Phase>("crisis");

/**
 * Wraps the app and exposes the user's current phase via usePhase().
 *
 * On first render (server + initial client) returns "crisis" — the
 * safest default that biases toward showing crisis UI rather than
 * accidentally hiding it.
 *
 * On mount, reads sessionStorage / localStorage signals and updates
 * the phase. Gated UI re-renders accordingly.
 */
export function PhaseProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("crisis");

  useEffect(() => {
    const signals = readPhaseSignalsFromStorage();
    setPhase(detectPhase(signals));

    // Re-detect on storage change (covers same-tab updates from other
    // components writing to sessionStorage).
    function handleStorage() {
      setPhase(detectPhase(readPhaseSignalsFromStorage()));
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <PhaseContext.Provider value={phase}>{children}</PhaseContext.Provider>
  );
}

export function usePhase(): Phase {
  return useContext(PhaseContext);
}
