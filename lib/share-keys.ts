/**
 * The single allowlist of sessionStorage/localStorage keys that travel in a
 * share link (dashboard "Save for my daughter" / /family hand-off → /resume/[id]).
 *
 * This list is the security boundary in BOTH directions:
 *   - creators snapshot ONLY these keys into the share payload, and
 *   - /resume/[id] hydrates ONLY these keys back out of the payload.
 *
 * Hydrating arbitrary payload keys would let a crafted share link inject any
 * sessionStorage key into a recipient's session (e.g. analyzer/negotiate state).
 * Keep this the one source of truth — do not re-declare it per component.
 *
 * Each key also records WHICH store the consuming tool actually reads
 * ("local" | "session") — hydration must write where the tool looks, or the
 * restore silently does nothing (the recipient is told "their answers are
 * saved on this device" while /next-30-days etc. come up empty; audit A4-07).
 * When adding a key, check the tool's own getItem call, not this file.
 */
const SHARE_KEY_TARGETS = {
  // /decide flow answers (hf-decide:* namespace) — lib/faith-storage.ts
  // reads sessionStorage.
  "hf-decide:faith": "session",
  "hf-decide:customFaith": "session",
  "hf-decide:faithDenomination": "session",
  "hf-decide:bodyAtService": "session",
  "hf-decide:dispositionPreference": "session",
  "hf-decide:costPriority": "session",
  "hf-decide:isVeteran": "session",
  "hf-decide:recommendedServiceType": "session",
  // /negotiate/start wizard state — lib/negotiate-wizard-state.ts reads
  // sessionStorage.
  "honestfuneral.negotiate-wizard.v1": "session",
  // /guidance/[scenario] step progress, per scenario — StepList /
  // CrisisUnexpected read localStorage.
  "honestfuneral.guidance.hospital.v1": "local",
  "honestfuneral.guidance.home-expected.v1": "local",
  "honestfuneral.guidance.home-unexpected.v1": "local",
  "honestfuneral.guidance.elsewhere.v1": "local",
  // /next-30-days state — localStorage.
  "honestfuneral.next30.v1": "local",
  "honestfuneral.next30.expanded.v1": "local",
  // /notifications + /eulogy draft — localStorage.
  "honestfuneral.notifications.v1": "local",
  "honestfuneral.eulogy.draft.v1": "local",
  // /worksheet (arrangement-meeting answers) + /plan-now (wishes plan) —
  // localStorage. Omitted until audit A4: shared progress silently dropped
  // the two most personal planning tools.
  "hf-worksheet-v1": "local",
  "honestfuneral.plan-now.v1": "local",
} as const satisfies Record<string, "local" | "session">;

export const SHARE_KEYS = Object.keys(
  SHARE_KEY_TARGETS,
) as (keyof typeof SHARE_KEY_TARGETS)[];

export const SHARE_KEYS_SET: ReadonlySet<string> = new Set(SHARE_KEYS);

/**
 * Where /resume/[id] must write a hydrated key so its tool can see it.
 * Returns null for keys outside the allowlist (caller skips them).
 */
export function shareKeyTarget(key: string): "local" | "session" | null {
  return SHARE_KEYS_SET.has(key)
    ? SHARE_KEY_TARGETS[key as keyof typeof SHARE_KEY_TARGETS]
    : null;
}
