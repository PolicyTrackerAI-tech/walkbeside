/**
 * Automated partner activity digest (roadmap Phase 4) — a periodic email to
 * each active partner with STRICTLY aggregate counts. No names, no
 * individual choices, no price data beyond the suppression-gated totals the
 * partner's own report already shows. Built from CohortStats, so the
 * small-sample gate travels with the numbers by construction.
 */

import type { CohortStats } from "./partner-report";

export interface DigestInput {
  partnerName: string;
  /**
   * Audience variant, threaded from partners.partner_type (unknown values
   * coerce to "hospice"). The digest body is deliberately partner-neutral
   * today — no Medicare/CAHPS/hospice vocabulary to branch on — but the
   * variant travels with the input so any future wording split can't forget
   * the employer reader.
   */
  partnerType?: "hospice" | "employer";
  /** e.g. "June 2026". */
  periodLabel: string;
  /** Families who started a case via the partner's links during the period. */
  familiesStartedInPeriod: number;
  /** Lifetime aggregate — already suppression-gated. */
  cohort: CohortStats;
  /**
   * Optional plain-English paragraph from lib/partner-report-digest.ts's
   * buildOutcomesDigest (Claude, with a deterministic fallback, and the static
   * forward-looking line under the small-sample gate). It is grounded in the
   * SAME suppression-gated cohort the bullets come from, but it draws on more
   * of it than the bullets print — fallbackOutcomesDigest alone states
   * familiesWhoSaved, average overcharge caught, FTC issues flagged and median
   * resolution days, none of which appear above it. So it may state figures
   * this email does not itemize; every one of them is visible on the partner's
   * own report, whose URL is the next thing in the email. It never invents a
   * number and never makes a new claim.
   *
   * Absent or whitespace-only → the paragraph is omitted entirely. When
   * present it prints BARE, with no lead-in label — see the insertion comment
   * in buildPartnerDigest for why.
   */
  outcomesDigest?: string;
  /** The partner's own live report URL. */
  reportUrl: string;
}

/** Skip partners with nothing to say — a zero digest is noise, not signal. */
export function shouldSendDigest(input: DigestInput): boolean {
  return input.familiesStartedInPeriod > 0 || input.cohort.familiesHelped > 0;
}

export function buildPartnerDigest(input: DigestInput): {
  subject: string;
  text: string;
} {
  const { cohort } = input;
  const outcomesDigest = input.outcomesDigest?.trim();
  const lines: string[] = [
    `Hello,`,
    ``,
    `Your ${input.periodLabel} summary from Honest Funeral — aggregate counts only, as always.`,
    ``,
    `This period:`,
    `  - ${input.familiesStartedInPeriod} famil${input.familiesStartedInPeriod === 1 ? "y" : "ies"} started a case through your links`,
  ];

  if (cohort.familiesHelped > 0) {
    lines.push(``, `Since your pilot began:`);
    lines.push(`  - ${cohort.familiesHelped} referred famil${cohort.familiesHelped === 1 ? "y" : "ies"} with completed cases`);
    if (cohort.smallSample) {
      lines.push(
        `  - Dollar and satisfaction figures unlock at 5 completed cases — a small cohort stays suppressed so no single family is identifiable`,
      );
    } else {
      lines.push(
        `  - $${Math.round(cohort.totalOverchargeCaughtCents / 100).toLocaleString("en-US")} in overcharges caught across the cohort`,
      );
      if (cohort.avgSatisfaction != null) {
        lines.push(`  - ${cohort.avgSatisfaction}/5 average family satisfaction`);
      }
    }
  }

  // Plain-English colour on the same suppression-gated cohort the bullets are
  // built from. It may restate or extend those figures — the deterministic
  // fallback prints families-who-saved, average overcharge, FTC issues and
  // median resolution days, which no bullet above prints — but it never
  // invents a number and never makes a new claim, and the report URL that
  // corroborates every figure is the next line of the email. Deliberately
  // unlabeled: the bullets are two-space indented, so dropping to a flush-left
  // paragraph is already an unmistakable block change in plain text, and no
  // lead-in reads correctly for all three possible strings (the small-sample
  // one summarizes nothing yet — it looks forward). The blank line above comes
  // from here; the blank line below comes from the tail push that follows.
  if (outcomesDigest) {
    lines.push(``, outcomesDigest);
  }

  lines.push(
    ``,
    `The full picture, updated live: ${input.reportUrl}`,
    ``,
    `As always: your families' individual choices, funeral homes, and prices are never shared — with you or anyone. These are aggregate totals only.`,
    ``,
    `— Honest Funeral`,
    `Free to families. No money from funeral homes or insurers.`,
  );

  return {
    subject: `${input.partnerName} — your ${input.periodLabel} family outcomes summary`,
    text: lines.join("\n"),
  };
}
