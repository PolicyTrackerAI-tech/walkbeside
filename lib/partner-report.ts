/**
 * Cohort aggregation for the hospice / employer partner report — the "proof
 * sheet" a partner sees on its own families. Pure and unit-tested.
 *
 * In production these records come from `price_list_analyses` rows scoped to the
 * partner's referral code (Wave 4: add `institution_id` + satisfaction +
 * resolution columns). For the demo they're seeded by `sampleCohort()`. Output
 * is AGGREGATE only — never per-home or per-family identifiable data.
 */

export interface CohortRecord {
  /** Overcharge caught vs fair (cents) — maps to potential_savings_cents. */
  overchargeCaughtCents: number;
  /** Count of likely-FTC-violation findings on this case. */
  ftcIssues: number;
  /** Post-case family satisfaction, 1–5 (optional). */
  satisfaction?: number;
  /** Days from intake to resolution (optional). */
  resolutionDays?: number;
}

export interface CohortStats {
  familiesHelped: number;
  familiesWhoSaved: number;
  totalOverchargeCaughtCents: number;
  avgOverchargeCaughtCents: number;
  ftcIssuesFlagged: number;
  avgSatisfaction: number | null;
  medianResolutionDays: number | null;
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
    smallSample: n < SMALL_SAMPLE_THRESHOLD,
  };
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
  return rec;
}

/**
 * Deterministic seeded cohort for the demo proof sheet. Believable, not
 * cherry-picked — one family's quote came back fair (no saving), because honest
 * data has that. These are ILLUSTRATIVE; the UI must label them as a sample.
 */
export function sampleCohort(): CohortRecord[] {
  return [
    { overchargeCaughtCents: 2345_00, ftcIssues: 2, satisfaction: 5, resolutionDays: 3 },
    { overchargeCaughtCents: 1820_00, ftcIssues: 1, satisfaction: 5, resolutionDays: 4 },
    { overchargeCaughtCents: 980_00, ftcIssues: 0, satisfaction: 4, resolutionDays: 6 },
    { overchargeCaughtCents: 3120_00, ftcIssues: 3, satisfaction: 5, resolutionDays: 2 },
    { overchargeCaughtCents: 1450_00, ftcIssues: 1, satisfaction: 4, resolutionDays: 5 },
    { overchargeCaughtCents: 2675_00, ftcIssues: 2, satisfaction: 5, resolutionDays: 3 },
    { overchargeCaughtCents: 740_00, ftcIssues: 0, satisfaction: 5, resolutionDays: 7 },
    { overchargeCaughtCents: 1990_00, ftcIssues: 1, satisfaction: 4, resolutionDays: 4 },
    { overchargeCaughtCents: 0, ftcIssues: 0, satisfaction: 5, resolutionDays: 2 },
    { overchargeCaughtCents: 2210_00, ftcIssues: 2, satisfaction: 5, resolutionDays: 4 },
    { overchargeCaughtCents: 1675_00, ftcIssues: 1, satisfaction: 4, resolutionDays: 6 },
    { overchargeCaughtCents: 880_00, ftcIssues: 0, satisfaction: 5, resolutionDays: 8 },
    { overchargeCaughtCents: 3050_00, ftcIssues: 3, satisfaction: 5, resolutionDays: 3 },
    { overchargeCaughtCents: 1240_00, ftcIssues: 1, satisfaction: 5, resolutionDays: 5 },
  ];
}
