/**
 * Pre-send guard for advocate-outreach emails.
 *
 * Honest Funeral's single most important public representation (see
 * docs/LAWYER_BRIEF.md §4.1 and the /faq) is that outreach emails are sent
 * transparently BY Honest Funeral as the family's NAMED advocate, and that we
 * NEVER impersonate the family or speak as a grieving individual.
 *
 * Outreach bodies are LLM-generated, so that representation is only an
 * *intention* until something checks it. This module makes it a *guarantee*:
 * any email that fails the guard is rejected by the caller, which falls back to
 * the deterministic safe template. Cheap, deterministic, no model call.
 */

export interface GuardResult {
  ok: boolean;
  /** Hard failures — caller must NOT send this body. */
  violations: string[];
  /** Soft issues — safe to send, but worth logging. */
  warnings: string[];
}

/**
 * First-person bereaved phrasing. If the email contains any of these it is
 * speaking AS the family, which violates the transparency representation.
 */
const FAMILY_VOICE_PATTERNS: { re: RegExp; label: string }[] = [
  {
    re: /\bmy (husband|wife|spouse|mother|father|mom|dad|son|daughter|child|brother|sister|grand\w+|loved one|late\b)/i,
    label: "first-person family relation (\"my husband/mother/...\")",
  },
  {
    re: /\b(we|i) (just |recently )?lost\b/i,
    label: "\"we/I lost\" bereavement phrasing",
  },
  { re: /\bmy loss\b/i, label: "\"my loss\"" },
  {
    re: /\b(after|since|following) (my|our) (loss|loved one|passing|bereavement)/i,
    label: "\"after my/our loss\"",
  },
  {
    re: /\bi am writing (to you )?(after|because) (my|our)\b/i,
    label: "writing-as-bereaved opening",
  },
  { re: /\bour (recent )?(loss|bereavement)\b/i, label: "\"our loss\"" },
];

/** Phrasing that should be present for a compliant advocate email. */
const SENDER_ID = /honest funeral/i;
const GPL_REQUEST = /general price list|\bGPL\b/i;

export function validateOutreachEmail(body: string): GuardResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  if (!body || body.trim().length < 40) {
    violations.push("email body is empty or too short");
    return { ok: false, violations, warnings };
  }

  // Must identify Honest Funeral as the sender/advocate.
  if (!SENDER_ID.test(body)) {
    violations.push("missing Honest Funeral sender identification");
  }

  // Must NOT speak as the family.
  for (const p of FAMILY_VOICE_PATTERNS) {
    if (p.re.test(body)) {
      violations.push(`speaks as the family: ${p.label}`);
    }
  }

  // Soft checks — don't block, but flag.
  if (!GPL_REQUEST.test(body)) {
    warnings.push("no explicit General Price List request");
  }

  return { ok: violations.length === 0, violations, warnings };
}
