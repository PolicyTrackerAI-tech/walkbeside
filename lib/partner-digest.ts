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
  /** e.g. "June 2026". */
  periodLabel: string;
  /** Families who started a case via the partner's links during the period. */
  familiesStartedInPeriod: number;
  /** Lifetime aggregate — already suppression-gated. */
  cohort: CohortStats;
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
