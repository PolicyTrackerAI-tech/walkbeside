/**
 * Cohort aggregation for the hospice / employer partner report — the "proof
 * sheet" a partner sees on its own families. Pure and unit-tested.
 *
 * In production these records come from `price_list_analyses` rows scoped to the
 * partner's referral code (Wave 4: add `institution_id` + satisfaction +
 * resolution columns). For the demo they're seeded by `sampleCohort()`. Output
 * is AGGREGATE only — never per-home or per-family identifiable data.
 */

import { SERVICE_TOTALS, adjustedRange } from "./pricing-data";

export interface CohortRecord {
  /** Overcharge caught vs fair (cents) — maps to potential_savings_cents. */
  overchargeCaughtCents: number;
  /** Count of likely-FTC-violation findings on this case. */
  ftcIssues: number;
  /** Post-case family satisfaction, 1–5 (optional). */
  satisfaction?: number;
  /** Days from intake to resolution (optional). */
  resolutionDays?: number;
  /**
   * Tool engagement — server-knowable only (existence joins on the family's
   * own saved artifacts: checker analyses, cert tracker, obituary). Most
   * tools are deliberately on-device, so these read as an honest floor
   * ("at least X% also used the checker"), never full usage.
   */
  usedChecker?: boolean;
  usedCertTracker?: boolean;
  usedObituary?: boolean;
  /**
   * Pilot metrics (the research's day-one measurement set):
   * savedVsMetroCents = the metro's median fair price for the case's service
   * minus what the family actually paid — CAN be negative (paid above the
   * metro median); the cohort median absorbs that honestly.
   */
  savedVsMetroCents?: number;
  /** Quotes actually received on this case (outreach rows with a price). */
  quotesReceived?: number;
  /** Benefit dollars the family recovered (admin-entered in the pilot). */
  benefitDollarsCents?: number;
  /** At least one bereavement check-in email has gone to this family. */
  bereavementReminded?: boolean;
}

/**
 * Aggregate engagement percentages. Computed INSIDE aggregateCohort and null
 * when the sample is small — there is deliberately no separate path to these
 * numbers that could bypass the suppression gate.
 */
export interface ToolEngagement {
  checkerPct: number;
  certTrackerPct: number;
  obituaryPct: number;
}

export interface CohortStats {
  familiesHelped: number;
  familiesWhoSaved: number;
  totalOverchargeCaughtCents: number;
  avgOverchargeCaughtCents: number;
  ftcIssuesFlagged: number;
  avgSatisfaction: number | null;
  medianResolutionDays: number | null;
  /** Aggregate tool engagement — null when smallSample (same gate as dollars). */
  toolEngagement: ToolEngagement | null;
  /**
   * The five pilot metrics (minus staff-minutes, which is an ops-side
   * coordinator survey, not app data). null when smallSample — same gate,
   * no bypass path. Individual fields are null when no case carries the
   * underlying data yet.
   */
  pilotMetrics: {
    medianSavedVsMetroCents: number | null;
    avgQuotesPerFamily: number | null;
    totalBenefitDollarsCents: number | null;
    /** Share of rated families at 4–5 of 5 — the promoter share; deliberately NOT labeled NPS. */
    satisfactionPromoterPct: number | null;
    /** Share of families who received at least one bereavement check-in (we drive utilization of the HOSPICE's own required benefit — we never counsel). */
    bereavementRemindedPct: number;
  } | null;
  /** True when the sample is too small to present as a stable benchmark. */
  smallSample: boolean;
}

/** Below this many families, label the report a small sample (guardrail #4). */
export const SMALL_SAMPLE_THRESHOLD = 5;

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export function aggregateCohort(records: CohortRecord[]): CohortStats {
  const n = records.length;
  const totalOver = records.reduce(
    (s, r) => s + Math.max(0, r.overchargeCaughtCents),
    0,
  );
  const sats = records
    .map((r) => r.satisfaction)
    .filter((x): x is number => typeof x === "number");
  const days = records
    .map((r) => r.resolutionDays)
    .filter((x): x is number => typeof x === "number");

  const smallSample = n < SMALL_SAMPLE_THRESHOLD;
  const pct = (count: number) => Math.round((count / n) * 100);

  return {
    familiesHelped: n,
    familiesWhoSaved: records.filter((r) => r.overchargeCaughtCents > 0).length,
    totalOverchargeCaughtCents: totalOver,
    avgOverchargeCaughtCents: n ? Math.round(totalOver / n) : 0,
    ftcIssuesFlagged: records.reduce((s, r) => s + Math.max(0, r.ftcIssues), 0),
    avgSatisfaction: sats.length
      ? Math.round((sats.reduce((a, b) => a + b, 0) / sats.length) * 10) / 10
      : null,
    medianResolutionDays: median(days),
    // Suppressed under the SAME gate as the dollar figures.
    toolEngagement: smallSample
      ? null
      : {
          checkerPct: pct(records.filter((r) => r.usedChecker).length),
          certTrackerPct: pct(records.filter((r) => r.usedCertTracker).length),
          obituaryPct: pct(records.filter((r) => r.usedObituary).length),
        },
    pilotMetrics: smallSample
      ? null
      : (() => {
          const vsMetro = records
            .map((r) => r.savedVsMetroCents)
            .filter((x): x is number => typeof x === "number");
          const quotes = records
            .map((r) => r.quotesReceived)
            .filter((x): x is number => typeof x === "number");
          const benefits = records
            .map((r) => r.benefitDollarsCents)
            .filter((x): x is number => typeof x === "number" && x > 0);
          const promoters = sats.filter((s) => s >= 4).length;
          return {
            medianSavedVsMetroCents: median(vsMetro),
            avgQuotesPerFamily: quotes.length
              ? Math.round((quotes.reduce((a, b) => a + b, 0) / quotes.length) * 10) / 10
              : null,
            totalBenefitDollarsCents: benefits.length
              ? benefits.reduce((a, b) => a + b, 0)
              : null,
            satisfactionPromoterPct: sats.length
              ? Math.round((promoters / sats.length) * 100)
              : null,
            bereavementRemindedPct: pct(
              records.filter((r) => r.bereavementReminded).length,
            ),
          };
        })(),
    smallSample,
  };
}

/**
 * The metro's median fair price for a service near a zip — the pilot's
 * "saved vs the metro median" baseline (research metric #1: savings vs the
 * family's own quote alone overstates when the quote itself was inflated).
 * Mid of the zip-adjusted fair band from the same benchmarks the checker
 * uses; null when the service type is unknown.
 */
export function metroMedianCents(serviceType: string, zip: string): number | null {
  const svc = SERVICE_TOTALS.find((s) => s.type === serviceType);
  if (!svc) return null;
  const [lo, hi] = adjustedRange(svc.fairLow, svc.fairHigh, zip);
  return Math.round(((lo + hi) / 2) * 100);
}

/**
 * One real outcome row, as read (service-role) for a partner's report. Only
 * numeric/timestamp outcome fields — never user_id, zip, home name, or free
 * text — so nothing identifiable can reach the aggregate.
 */
export interface OutcomeRow {
  /** Generated savings vs the family's original listed quote (cents). */
  savings_vs_listed_cents: number | null;
  satisfaction_score: number | null;
  created_at: string;
  outcome_recorded_at: string | null;
  /** Count of hidden-fee findings across this case's outreach rows (FTC proxy). */
  hidden_fees_count?: number;
  /** What the family actually paid (cents) — enables the vs-metro metric. */
  amount_paid_cents?: number | null;
  /** Metro median for the case's service+zip, precomputed via metroMedianCents. */
  metro_median_cents?: number | null;
  /** Outreach rows with a real quote on this case. */
  quote_count?: number;
  /** Admin-entered benefit dollars recovered (pilot). */
  benefit_dollars_recovered_cents?: number | null;
}

/**
 * Map a real outcome row to a CohortRecord. Overcharge caught is the case's own
 * generated savings (never negative; never the double-counting price_list path).
 * Resolution days come from intake → outcome. Pure so the report math is locked.
 */
export function rowToCohortRecord(row: OutcomeRow): CohortRecord {
  const rec: CohortRecord = {
    overchargeCaughtCents: Math.max(0, row.savings_vs_listed_cents ?? 0),
    ftcIssues: Math.max(0, row.hidden_fees_count ?? 0),
  };
  if (typeof row.satisfaction_score === "number") {
    rec.satisfaction = row.satisfaction_score;
  }
  if (row.outcome_recorded_at) {
    const days = Math.round(
      (Date.parse(row.outcome_recorded_at) - Date.parse(row.created_at)) /
        86_400_000,
    );
    if (Number.isFinite(days) && days >= 0) rec.resolutionDays = days;
  }
  if (
    typeof row.amount_paid_cents === "number" &&
    typeof row.metro_median_cents === "number"
  ) {
    rec.savedVsMetroCents = row.metro_median_cents - row.amount_paid_cents;
  }
  if (typeof row.quote_count === "number") rec.quotesReceived = row.quote_count;
  if (typeof row.benefit_dollars_recovered_cents === "number") {
    rec.benefitDollarsCents = row.benefit_dollars_recovered_cents;
  }
  return rec;
}

/**
 * Deterministic seeded cohort for the demo proof sheet. Believable, not
 * cherry-picked — one family's quote came back fair (no saving), because honest
 * data has that. These are ILLUSTRATIVE; the UI must label them as a sample.
 */
export function sampleCohort(): CohortRecord[] {
  return [
    { overchargeCaughtCents: 2345_00, ftcIssues: 2, satisfaction: 5, resolutionDays: 3, usedChecker: true, usedCertTracker: true, usedObituary: true, savedVsMetroCents: 61000, quotesReceived: 3, benefitDollarsCents: 25500, bereavementReminded: true },
    { overchargeCaughtCents: 1820_00, ftcIssues: 1, satisfaction: 5, resolutionDays: 4, usedChecker: true, usedCertTracker: true, usedObituary: false, savedVsMetroCents: 48000, quotesReceived: 4, bereavementReminded: true },
    { overchargeCaughtCents: 980_00, ftcIssues: 0, satisfaction: 4, resolutionDays: 6, usedChecker: true, usedCertTracker: false, usedObituary: false, savedVsMetroCents: 152000, quotesReceived: 2, benefitDollarsCents: 130000 },
    { overchargeCaughtCents: 3120_00, ftcIssues: 3, satisfaction: 5, resolutionDays: 2, usedChecker: true, usedCertTracker: true, usedObituary: true, savedVsMetroCents: 98000, quotesReceived: 5, benefitDollarsCents: 25500, bereavementReminded: true },
    { overchargeCaughtCents: 1450_00, ftcIssues: 1, satisfaction: 4, resolutionDays: 5, usedChecker: true, usedCertTracker: false, usedObituary: true, savedVsMetroCents: 30000, quotesReceived: 3, bereavementReminded: true },
    { overchargeCaughtCents: 2675_00, ftcIssues: 2, satisfaction: 5, resolutionDays: 3, usedChecker: true, usedCertTracker: true, usedObituary: false, savedVsMetroCents: 76000, quotesReceived: 4, benefitDollarsCents: 45000, bereavementReminded: true },
    { overchargeCaughtCents: 740_00, ftcIssues: 0, satisfaction: 5, resolutionDays: 7, usedChecker: false, usedCertTracker: true, usedObituary: false, savedVsMetroCents: -12000, quotesReceived: 2, benefitDollarsCents: 25500 },
    { overchargeCaughtCents: 1990_00, ftcIssues: 1, satisfaction: 4, resolutionDays: 4, usedChecker: true, usedCertTracker: false, usedObituary: false, savedVsMetroCents: 54000, quotesReceived: 3, bereavementReminded: true },
    { overchargeCaughtCents: 0, ftcIssues: 0, satisfaction: 5, resolutionDays: 2, usedChecker: true, usedCertTracker: true, usedObituary: true, savedVsMetroCents: 8000, quotesReceived: 5, benefitDollarsCents: 210000, bereavementReminded: true },
    { overchargeCaughtCents: 2210_00, ftcIssues: 2, satisfaction: 5, resolutionDays: 4, usedChecker: true, usedCertTracker: false, usedObituary: false, savedVsMetroCents: 67000, quotesReceived: 4, bereavementReminded: true },
    { overchargeCaughtCents: 1675_00, ftcIssues: 1, satisfaction: 4, resolutionDays: 6, usedChecker: true, usedCertTracker: true, usedObituary: false, savedVsMetroCents: 41000, quotesReceived: 3, benefitDollarsCents: 25500, bereavementReminded: true },
    { overchargeCaughtCents: 880_00, ftcIssues: 0, satisfaction: 5, resolutionDays: 8, usedChecker: false, usedCertTracker: false, usedObituary: false, savedVsMetroCents: 22000, quotesReceived: 2 },
    { overchargeCaughtCents: 3050_00, ftcIssues: 3, satisfaction: 5, resolutionDays: 3, usedChecker: true, usedCertTracker: true, usedObituary: true, savedVsMetroCents: 110000, quotesReceived: 5, benefitDollarsCents: 89000, bereavementReminded: true },
    { overchargeCaughtCents: 1240_00, ftcIssues: 1, satisfaction: 5, resolutionDays: 5, usedChecker: true, usedCertTracker: false, usedObituary: false, savedVsMetroCents: 35000, quotesReceived: 3, bereavementReminded: true },
  ];
}
