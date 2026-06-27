import { describe, it, expect } from "vitest";
import {
  aggregateCohort,
  sampleCohort,
  rowToCohortRecord,
  SMALL_SAMPLE_THRESHOLD,
  type CohortRecord,
} from "@/lib/partner-report";

describe("aggregateCohort", () => {
  it("returns an all-zero, small-sample stat block for no records", () => {
    expect(aggregateCohort([])).toEqual({
      familiesHelped: 0,
      familiesWhoSaved: 0,
      totalOverchargeCaughtCents: 0,
      avgOverchargeCaughtCents: 0,
      ftcIssuesFlagged: 0,
      avgSatisfaction: null,
      medianResolutionDays: null,
      smallSample: true,
    });
  });

  it("sums and averages overcharge, counts savers, and totals FTC issues", () => {
    const recs: CohortRecord[] = [
      { overchargeCaughtCents: 100_00, ftcIssues: 2 },
      { overchargeCaughtCents: 300_00, ftcIssues: 1 },
      { overchargeCaughtCents: 0, ftcIssues: 0 },
    ];
    const s = aggregateCohort(recs);
    expect(s.familiesHelped).toBe(3);
    expect(s.familiesWhoSaved).toBe(2);
    expect(s.totalOverchargeCaughtCents).toBe(400_00);
    expect(s.avgOverchargeCaughtCents).toBe(Math.round(40000 / 3));
    expect(s.ftcIssuesFlagged).toBe(3);
  });

  it("computes mean satisfaction and median resolution days, ignoring missing", () => {
    const s = aggregateCohort([
      { overchargeCaughtCents: 1, ftcIssues: 0, satisfaction: 4, resolutionDays: 2 },
      { overchargeCaughtCents: 1, ftcIssues: 0, satisfaction: 5, resolutionDays: 8 },
      { overchargeCaughtCents: 1, ftcIssues: 0 }, // no satisfaction/days
    ]);
    expect(s.avgSatisfaction).toBe(4.5);
    expect(s.medianResolutionDays).toBe(5); // (2+8)/2
  });

  it("flags small samples below the threshold and not above", () => {
    const one: CohortRecord[] = [{ overchargeCaughtCents: 1, ftcIssues: 0 }];
    expect(aggregateCohort(one).smallSample).toBe(true);
    const many = Array.from({ length: SMALL_SAMPLE_THRESHOLD }, () => ({
      overchargeCaughtCents: 1,
      ftcIssues: 0,
    }));
    expect(aggregateCohort(many).smallSample).toBe(false);
  });

  it("never lets a negative overcharge drag the total below the real sum", () => {
    const s = aggregateCohort([
      { overchargeCaughtCents: 500_00, ftcIssues: 0 },
      { overchargeCaughtCents: -100_00, ftcIssues: 0 }, // defensive: clamp to 0
    ]);
    expect(s.totalOverchargeCaughtCents).toBe(500_00);
    expect(s.familiesWhoSaved).toBe(1);
  });
});

describe("sampleCohort (demo seed)", () => {
  const stats = aggregateCohort(sampleCohort());

  it("renders believable, honest demo numbers", () => {
    expect(stats.familiesHelped).toBe(14);
    // Honest: not everyone saved — one quote came back fair.
    expect(stats.familiesWhoSaved).toBe(13);
    expect(stats.avgOverchargeCaughtCents).toBeGreaterThan(150000);
    expect(stats.avgSatisfaction).toBeGreaterThanOrEqual(4.5);
    expect(stats.medianResolutionDays).toBeGreaterThan(0);
    expect(stats.smallSample).toBe(false);
  });
});

describe("rowToCohortRecord (real partner report mapping)", () => {
  it("maps a completed case: overcharge from savings, resolution from dates", () => {
    const rec = rowToCohortRecord({
      savings_vs_listed_cents: 215000,
      satisfaction_score: 5,
      created_at: "2026-06-01T00:00:00Z",
      outcome_recorded_at: "2026-06-05T00:00:00Z",
      hidden_fees_count: 2,
    });
    expect(rec).toEqual({
      overchargeCaughtCents: 215000,
      ftcIssues: 2,
      satisfaction: 5,
      resolutionDays: 4,
    });
  });

  it("clamps a negative saving to 0 and omits missing satisfaction/resolution", () => {
    const rec = rowToCohortRecord({
      savings_vs_listed_cents: -500, // home quoted higher than listed → no saving
      satisfaction_score: null,
      created_at: "2026-06-01T00:00:00Z",
      outcome_recorded_at: null,
    });
    expect(rec.overchargeCaughtCents).toBe(0);
    expect(rec.ftcIssues).toBe(0);
    expect(rec.satisfaction).toBeUndefined();
    expect(rec.resolutionDays).toBeUndefined();
  });

  it("feeds the unchanged aggregator: n=0 empty, n<5 small-sample, n≥5 full", () => {
    const row = (over: number): Parameters<typeof rowToCohortRecord>[0] => ({
      savings_vs_listed_cents: over,
      satisfaction_score: 5,
      created_at: "2026-06-01T00:00:00Z",
      outcome_recorded_at: "2026-06-03T00:00:00Z",
    });
    expect(aggregateCohort([]).familiesHelped).toBe(0);

    const few = [row(100000), row(200000)].map(rowToCohortRecord);
    expect(aggregateCohort(few).smallSample).toBe(true);

    const many = Array.from({ length: SMALL_SAMPLE_THRESHOLD }, () =>
      rowToCohortRecord(row(150000)),
    );
    const stats = aggregateCohort(many);
    expect(stats.smallSample).toBe(false);
    expect(stats.totalOverchargeCaughtCents).toBe(150000 * SMALL_SAMPLE_THRESHOLD);
  });
});
