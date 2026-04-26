/**
 * Re-export shim for the spec's `lib/faith-profiles.ts` import path.
 * The canonical module is `lib/faith-traditions.ts` — this file exists so
 * specs and future callers can import from either path without breaking
 * the existing 6 callers of faith-traditions.
 */
export * from "./faith-traditions";
