/**
 * State-by-state Medicaid Estate Recovery (MERP) rules for the navigator at
 * /medicaid-estate-recovery (roadmap Phase 2). Hospice decedents skew
 * Medicaid/dual-eligible; families get blindsided by a recovery notice
 * against the house months after the death.
 *
 * PROVENANCE RULE (same as lib/state-body-care.ts): a state appears in
 * VERIFIED_MERP only if its citation was independently verified against the
 * statute / administrative code / official Medicaid-manual text (research +
 * adversarial verification, second hostile pass on risky rows; audit trail
 * in docs/MERP_FINDINGS.md). Every other state shows FEDERAL_BASELINE only —
 * which is true everywhere by federal law. Never add a row without a
 * verified cite, and never invent a deadline number.
 *
 * None of this is legal advice; every surface that renders it carries the
 * "confirm with a local elder-law attorney" disclaimer.
 */

export type RecoveryScope = "probate-only" | "expanded-estate" | "unclear";

export interface StateMerpRow {
  /** Two-letter USPS code. */
  code: string;
  state: string;
  scope: RecoveryScope;
  /** What the state can actually claim against — exactly what the cite supports. */
  scopeSummary: string;
  /** Codified response/hardship window after the recovery notice, when one exists. */
  noticeSummary?: string;
  /** The state's hardship-waiver highlights beyond the federal floor. */
  hardshipSummary: string;
  /** Who administers recovery. */
  agencyName: string;
  /** Statute / admin code / official Medicaid manual citation. */
  statuteCite: string;
}

/**
 * True in every state — the federal floor under 42 U.S.C. § 1396p(b).
 * This is what an unverified state shows, and it leads every state view.
 */
export const FEDERAL_BASELINE = {
  headline:
    "Medicaid estate recovery is a claim against the estate — never a bill your family personally owes.",
  points: [
    "States must seek repayment of long-term-care Medicaid costs (nursing facility, home- and community-based services, and related hospital/prescription costs) for recipients who were 55 or older, from the recipient's estate — usually meaning the house.",
    "Recovery is deferred while a surviving spouse is alive, or while the recipient's child under 21 — or a blind or disabled child of any age — survives. The state cannot recover during that time.",
    "Every state must have an undue-hardship waiver process. If the recovery would leave an heir needing public assistance, or the asset is the family's livelihood, apply — waivers exist because Congress required them.",
    "Recovery comes from the estate after death. Heirs are not personally liable, and a recovery claim is not a debt collector's bill — nobody should be paying it out of pocket.",
  ],
  cite: "42 U.S.C. § 1396p(b)",
} as const;

/** Populated only with statute-verified rows — see the provenance rule above. */
export const VERIFIED_MERP: StateMerpRow[] = [];

export function merpForState(code: string): StateMerpRow | undefined {
  const c = code.trim().toUpperCase();
  return VERIFIED_MERP.find((r) => r.code === c);
}
