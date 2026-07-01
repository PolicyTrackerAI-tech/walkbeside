/**
 * Persistence helpers for the /negotiate/start wizard.
 *
 * State key: honestfuneral.negotiate-wizard.v1
 * State persists in sessionStorage so refreshing or navigating back
 * doesn't lose progress, but isn't carried across browser tabs.
 */

import type { ServiceType } from "./pricing-data";

export interface WizardState {
  zip: string;
  serviceType: ServiceType;
  radiusMiles: number;
  hasQuote: "yes" | "no" | "";
  targetHomeName: string;
  targetEstimate: string;
  timing: string;
  senderFirstName: string;
  senderLastName: string;
  notes: string;
  extras: string;
  /** Optional YYYY-MM-DD date of the passing — anchors the bereavement check-ins. */
  dateOfDeath: string;
}

export const STORAGE_KEY = "honestfuneral.negotiate-wizard.v1";

export const DEFAULT_STATE: WizardState = {
  zip: "",
  serviceType: "traditional-burial",
  radiusMiles: 25,
  hasQuote: "",
  targetHomeName: "",
  targetEstimate: "",
  timing: "",
  senderFirstName: "",
  senderLastName: "",
  notes: "",
  extras: "",
  dateOfDeath: "",
};

export function readState(): WizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WizardState;
  } catch {
    return null;
  }
}

export function writeState(state: WizardState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort; ignore failures.
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasMeaningfulProgress(state: WizardState): boolean {
  return (
    state.zip.length > 0 ||
    state.timing !== "" ||
    state.senderFirstName.length > 0 ||
    state.notes.length > 0 ||
    state.targetHomeName.length > 0
  );
}
