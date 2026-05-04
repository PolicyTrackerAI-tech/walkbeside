/**
 * sessionStorage helpers for the /decide flow.
 *
 * The /decide flow persists answers across question screens via sessionStorage
 * (cleared when the tab closes — appropriate for a one-time crisis decision).
 *
 * Keys are namespaced under `hf-decide:` so they don't collide with other
 * features (the worksheet uses `hf-worksheet-v1`, etc).
 */

export const DECIDE_STORAGE_KEYS = {
  faith: "hf-decide:faith",
  customFaith: "hf-decide:customFaith",
  faithDenomination: "hf-decide:faithDenomination",
} as const;

export type DecideStorageKey =
  (typeof DECIDE_STORAGE_KEYS)[keyof typeof DECIDE_STORAGE_KEYS];

/** Safe getter — returns null on SSR or when storage is unavailable. */
export function readDecide(key: DecideStorageKey): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe setter — silently no-ops if storage is unavailable. Empty string clears. */
export function writeDecide(key: DecideStorageKey, value: string): void {
  if (typeof window === "undefined") return;
  try {
    if (value === "") {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // ignore — private browsing, quota, etc.
  }
}

export function clearDecide(key: DecideStorageKey): void {
  writeDecide(key, "");
}
