/**
 * CSV serialization of a partner's aggregate outcomes — the "drop it in your
 * own spreadsheet" export on the /portal overview. Pure and unit-tested.
 *
 * Same discipline as ProofSheet: this renders ONLY what CohortStats already
 * carries, and the small-sample suppression travels with the type — on a
 * suppressed cohort every field except familiesHelped is null, so every row
 * except "families helped" renders the literal string "collecting data", and
 * "families helped" itself is banded via displayCount (an exact 1–4 on a
 * partner-visible export could point at one family). There is no path
 * through this file that could turn a suppressed value back into a number.
 */

import { displayCount, type CohortStats } from "@/lib/partner-report";

const PERIOD = "pilot to date";
const COLLECTING = "collecting data";

/** RFC-4180 field escaping: quote when a comma/quote/newline is present. */
function esc(field: string): string {
  return /[",\n\r]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
}

function row(metric: string, value: string | number): string {
  return [esc(metric), esc(String(value)), esc(PERIOD)].join(",");
}

export function statsToCsv(
  orgName: string,
  stats: CohortStats,
  partnerType: "hospice" | "employer" = "hospice",
): string {
  // On a suppressed cohort these are null and every accessor below degrades
  // to "collecting data" — never a number.
  const tools = stats.smallSample ? null : stats.toolEngagement;
  const pilot = stats.smallSample ? null : stats.pilotMetrics;

  const num = (v: number | null | undefined): string | number =>
    v == null ? COLLECTING : v;
  // Family-count cells band below the threshold (sub-cells included: at n≥5,
  // "families who saved: 2" is still a 2-family cell).
  const bandedNum = (v: number | null | undefined): string =>
    v == null ? COLLECTING : displayCount(v);
  const pct = (v: number | null | undefined): string =>
    v == null ? COLLECTING : `${v}%`;
  const dollars = (cents: number | null | undefined): string | number =>
    cents == null ? COLLECTING : Math.round(cents / 100);

  const lines = [
    "metric,value,period",
    row("organization", orgName),
    // Banded below the suppression threshold (displayCount) — same rule as
    // every partner-visible surface; exact counts return at n≥5.
    row("families helped", displayCount(stats.familiesHelped)),
    row("families who saved", bandedNum(stats.familiesWhoSaved)),
    row("total overcharge caught (dollars)", dollars(stats.totalOverchargeCaughtCents)),
    row("avg caught per family (dollars)", dollars(stats.avgOverchargeCaughtCents)),
    row("ftc issues flagged", num(stats.ftcIssuesFlagged)),
    row("avg satisfaction", num(stats.avgSatisfaction)),
    row("median resolution days", num(stats.medianResolutionDays)),
    row("checked a price list", pct(tools?.checkerPct)),
    row("tracked certificates", pct(tools?.certTrackerPct)),
    row("wrote the obituary", pct(tools?.obituaryPct)),
    row("median saved vs metro (dollars)", dollars(pilot?.medianSavedVsMetroCents)),
    row("avg quotes per family", num(pilot?.avgQuotesPerFamily)),
    row("benefit dollars recovered", dollars(pilot?.totalBenefitDollarsCents)),
    row("satisfaction promoter share", pct(pilot?.satisfactionPromoterPct)),
    // Bereavement check-ins are a hospice-program metric; the employer
    // surfaces (ProofSheet, digest) suppress it, so the export matches.
    ...(partnerType === "employer"
      ? []
      : [row("bereavement check-in reminders", pct(pilot?.bereavementRemindedPct))]),
  ];
  return lines.join("\n") + "\n";
}
