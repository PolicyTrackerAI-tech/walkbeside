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
 */
export const SHARE_KEYS = [
  // /decide flow answers (hf-decide:* namespace)
  "hf-decide:faith",
  "hf-decide:customFaith",
  "hf-decide:faithDenomination",
  "hf-decide:bodyAtService",
  "hf-decide:dispositionPreference",
  "hf-decide:costPriority",
  "hf-decide:isVeteran",
  "hf-decide:recommendedServiceType",
  // /negotiate/start wizard state
  "honestfuneral.negotiate-wizard.v1",
  // /guidance/[scenario] step progress, per scenario
  "honestfuneral.guidance.hospital.v1",
  "honestfuneral.guidance.home-expected.v1",
  "honestfuneral.guidance.home-unexpected.v1",
  "honestfuneral.guidance.elsewhere.v1",
  // /next-30-days state
  "honestfuneral.next30.v1",
  "honestfuneral.next30.expanded.v1",
  // /notifications + /eulogy draft
  "honestfuneral.notifications.v1",
  "honestfuneral.eulogy.draft.v1",
] as const;

export const SHARE_KEYS_SET: ReadonlySet<string> = new Set(SHARE_KEYS);
