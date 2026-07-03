"use client";

import { useEffect, useState } from "react";

export const COMFORT_KEY = "honestfuneral.display.v1";

/**
 * The persistent "larger text" control (roadmap Phase 5). A fixed pill on
 * every page — our primary users are frequently 65–85+ and today have no
 * control at all. Toggles `comfort-mode` on <html> (bigger type, harder
 * contrast, single-column; see globals.css); the root layout's inline script
 * applies the saved choice pre-hydration so there's no flash.
 */
export function ComfortModeToggle() {
  const [on, setOn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOn(document.documentElement.classList.contains("comfort-mode"));
    setHydrated(true);
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    document.documentElement.classList.toggle("comfort-mode", next);
    try {
      if (next) localStorage.setItem(COMFORT_KEY, "comfort");
      else localStorage.removeItem(COMFORT_KEY);
    } catch {
      // best-effort persistence
    }
  }

  if (!hydrated) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="print:hidden fixed bottom-4 left-4 z-40 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink shadow-md hover:border-primary focus-visible:outline focus-visible:outline-2"
    >
      <span aria-hidden className="font-serif mr-1.5">Aa</span>
      {on ? "Standard text" : "Larger text"}
    </button>
  );
}
