/**
 * Phase detector — figures out which phase a user is in based on
 * client-side signals (sessionStorage / localStorage state).
 *
 * Phases extend the existing dashboard Phase enum but add upstream
 * stages (crisis, decisions, comparing) so gating can happen on
 * pre-account screens too.
 *
 * Pure function. No side effects. Easy to test.
 */

import type { Phase as DashboardPhase } from "@/components/ProgressBar";

export type Phase =
  | "crisis" // just landed, no /guidance progress yet
  | "decisions" // working through /decide
  | "comparing" // /negotiate-wizard in progress, no closed deal yet
  | "service" // picked a home (closed deal), in the actual service week
  | "after" // funeral done, post-funeral paperwork
  | "estate" // 30+ days out, estate work
  | "done";

export interface PhaseSignals {
  /** Map of localStorage / sessionStorage keys to their values. */
  storage: Record<string, string | null>;
  /** Optional server-derived dashboard phase (when user is authenticated). */
  dashboardPhase?: DashboardPhase;
}

const GUIDANCE_KEYS = [
  "honestfuneral.guidance.hospital.v1",
  "honestfuneral.guidance.home-expected.v1",
  "honestfuneral.guidance.home-unexpected.v1",
  "honestfuneral.guidance.elsewhere.v1",
];

const DECIDE_KEY = "honestfuneral.decide.v1";
const NEGOTIATE_KEY = "honestfuneral.negotiate-wizard.v1";
const NEXT30_KEY = "honestfuneral.next30.v1";

function hasGuidanceProgress(storage: Record<string, string | null>): boolean {
  for (const k of GUIDANCE_KEYS) {
    const raw = storage[k];
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.some((s) => s === "done" || s === "skipped")) {
        return true;
      }
    } catch {
      // ignore malformed
    }
  }
  return false;
}

function allGuidanceComplete(storage: Record<string, string | null>): boolean {
  for (const k of GUIDANCE_KEYS) {
    const raw = storage[k];
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as string[];
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every((s) => s === "done" || s === "skipped")
      ) {
        return true;
      }
    } catch {
      // ignore
    }
  }
  return false;
}

function hasDecideAnswers(storage: Record<string, string | null>): boolean {
  // /decide writes faith/denomination/customFaith keys via faith-storage helpers.
  const faith = storage["honestfuneral.faith.v1"];
  return Boolean(faith && faith !== "" && faith !== "secular");
}

function hasNegotiateProgress(storage: Record<string, string | null>): boolean {
  const raw = storage[NEGOTIATE_KEY];
  if (!raw) return false;
  try {
    const state = JSON.parse(raw) as { zip?: string; senderFirstName?: string };
    return Boolean(state.zip || state.senderFirstName);
  } catch {
    return false;
  }
}

function hasAnyNext30Progress(storage: Record<string, string | null>): boolean {
  const raw = storage[NEXT30_KEY];
  if (!raw) return false;
  try {
    const done = JSON.parse(raw) as Record<string, boolean>;
    return Object.values(done).some(Boolean);
  } catch {
    return false;
  }
}

export function detectPhase(signals: PhaseSignals): Phase {
  const { storage, dashboardPhase } = signals;

  // Authenticated dashboard signals trump client storage when present.
  if (dashboardPhase === "done") return "done";
  if (dashboardPhase === "estate") return "estate";
  if (dashboardPhase === "documents") return "after";
  if (dashboardPhase === "service") return "service";
  // For "first-steps" or "funeral", fall through and use storage signals
  // for finer-grained client-side gating.

  if (hasAnyNext30Progress(storage)) return "after";
  if (hasNegotiateProgress(storage)) return "comparing";
  if (hasDecideAnswers(storage) || allGuidanceComplete(storage)) return "decisions";
  if (hasGuidanceProgress(storage)) return "decisions";

  return "crisis";
}

/**
 * Read PhaseSignals from the browser. Server-safe — returns empty
 * storage when window is undefined.
 */
export function readPhaseSignalsFromStorage(): PhaseSignals {
  if (typeof window === "undefined") {
    return { storage: {} };
  }
  const keys = [
    ...GUIDANCE_KEYS,
    DECIDE_KEY,
    NEGOTIATE_KEY,
    NEXT30_KEY,
    "honestfuneral.faith.v1",
    "honestfuneral.faith-denomination.v1",
    "honestfuneral.faith-custom.v1",
  ];
  const storage: Record<string, string | null> = {};
  for (const k of keys) {
    try {
      storage[k] =
        window.sessionStorage.getItem(k) ?? window.localStorage.getItem(k);
    } catch {
      storage[k] = null;
    }
  }
  return { storage };
}
