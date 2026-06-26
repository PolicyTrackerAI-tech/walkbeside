import { describe, it, expect } from "vitest";
import {
  aggregateCohort,
  sampleCohort,
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
