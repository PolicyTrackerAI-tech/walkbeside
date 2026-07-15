import { describe, it, expect } from "vitest";
import {
  aggregateCohort,
  sampleCohort,
  rowToCohortRecord,
  metroMedianCents,
  SMALL_SAMPLE_THRESHOLD,
  type CohortRecord,
} from "@/lib/partner-report";

describe("aggregateCohort", () => {
  it("returns a fully-suppressed stat block for no records — nulled at the source, not just zeroed", () => {
    expect(aggregateCohort([])).toEqual({
      familiesHelped: 0,
      smallSample: true,
      familiesWhoSaved: null,
      totalOverchargeCaughtCents: null,
      avgOverchargeCaughtCents: null,
      ftcIssuesFlagged: null,
      avgSatisfaction: null,
      medianResolutionDays: null,
      toolEngagement: null,
      pilotMetrics: null,
    });
  });

  it("sums and averages overcharge, counts savers, and totals FTC issues", () => {
    // n=5 (at the threshold) so this exercises the full/unsuppressed shape —
    // the suppression gate itself has its own dedicated tests below.
    const recs: CohortRecord[] = [
      { overchargeCaughtCents: 100_00, ftcIssues: 2 },
      { overchargeCaughtCents: 300_00, ftcIssues: 1 },
      { overchargeCaughtCents: 0, ftcIssues: 0 },
      { overchargeCaughtCents: 0, ftcIssues: 0 },
      { overchargeCaughtCents: 0, ftcIssues: 0 },
    ];
    const s = aggregateCohort(recs);
    expect(s.familiesHelped).toBe(5);
    expect(s.familiesWhoSaved).toBe(2);
    expect(s.totalOverchargeCaughtCents).toBe(400_00);
    expect(s.avgOverchargeCaughtCents).toBe(Math.round(40000 / 5));
    expect(s.ftcIssuesFlagged).toBe(3);
  });

  it("computes mean satisfaction and median resolution days, ignoring missing", () => {
    const s = aggregateCohort([
      { overchargeCaughtCents: 1, ftcIssues: 0, satisfaction: 4, resolutionDays: 2 },
      { overchargeCaughtCents: 1, ftcIssues: 0, satisfaction: 5, resolutionDays: 8 },
      { overchargeCaughtCents: 1, ftcIssues: 0 }, // no satisfaction/days
      { overchargeCaughtCents: 1, ftcIssues: 0 }, // no satisfaction/days
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

  // QA pin: "n≥5 suppression verified at n=4 and n=6" — literal counts on
  // purpose, so a threshold change breaks these two tests by name.
  it("suppresses at exactly n=4: smallSample true, every dollar/satisfaction stat null", () => {
    const four: CohortRecord[] = Array.from({ length: 4 }, () => ({
      overchargeCaughtCents: 250_00,
      ftcIssues: 1,
      satisfaction: 5,
      resolutionDays: 3,
    }));
    const s = aggregateCohort(four);
    expect(s.familiesHelped).toBe(4);
    expect(s.smallSample).toBe(true);
    expect(s.familiesWhoSaved).toBeNull();
    expect(s.totalOverchargeCaughtCents).toBeNull();
    expect(s.avgOverchargeCaughtCents).toBeNull();
    expect(s.ftcIssuesFlagged).toBeNull();
    expect(s.avgSatisfaction).toBeNull();
    expect(s.medianResolutionDays).toBeNull();
    expect(s.toolEngagement).toBeNull();
    expect(s.pilotMetrics).toBeNull();
  });

  it("publishes at exactly n=6: smallSample false, stats match hand math", () => {
    const six: CohortRecord[] = [
      { overchargeCaughtCents: 120_00, ftcIssues: 2, satisfaction: 5, resolutionDays: 2 },
      { overchargeCaughtCents: 240_00, ftcIssues: 1, satisfaction: 4, resolutionDays: 6 },
      { overchargeCaughtCents: 0, ftcIssues: 0, satisfaction: 5 },
      { overchargeCaughtCents: 60_00, ftcIssues: 0, satisfaction: 4 },
      { overchargeCaughtCents: 0, ftcIssues: 0 },
      { overchargeCaughtCents: 180_00, ftcIssues: 1 },
    ];
    const s = aggregateCohort(six);
    expect(s.familiesHelped).toBe(6);
    expect(s.smallSample).toBe(false);
    expect(s.familiesWhoSaved).toBe(4);
    expect(s.totalOverchargeCaughtCents).toBe(600_00); // 120+240+60+180 dollars
    expect(s.avgOverchargeCaughtCents).toBe(100_00); // 60000 / 6
    expect(s.ftcIssuesFlagged).toBe(4);
    expect(s.avgSatisfaction).toBe(4.5); // (5+4+5+4)/4
    expect(s.medianResolutionDays).toBe(4); // (2+6)/2
  });

  it("never lets a negative overcharge drag the total below the real sum", () => {
    const s = aggregateCohort([
      { overchargeCaughtCents: 500_00, ftcIssues: 0 },
      { overchargeCaughtCents: -100_00, ftcIssues: 0 }, // defensive: clamp to 0
      { overchargeCaughtCents: 0, ftcIssues: 0 },
      { overchargeCaughtCents: 0, ftcIssues: 0 },
      { overchargeCaughtCents: 0, ftcIssues: 0 },
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

describe("toolEngagement (aggregate-only, same suppression gate)", () => {
  const rec = (used: boolean) => ({
    overchargeCaughtCents: 0,
    ftcIssues: 0,
    usedChecker: used,
    usedCertTracker: used,
    usedObituary: false,
  });

  it("is null under the small-sample threshold — no bypass path exists", () => {
    const few = Array.from({ length: SMALL_SAMPLE_THRESHOLD - 1 }, () => rec(true));
    expect(aggregateCohort(few).toolEngagement).toBeNull();
  });

  it("reports rounded percentages once the sample is sufficient", () => {
    const many = [
      ...Array.from({ length: 3 }, () => rec(true)),
      ...Array.from({ length: 2 }, () => rec(false)),
    ];
    const stats = aggregateCohort(many);
    expect(stats.toolEngagement).toEqual({
      checkerPct: 60,
      certTrackerPct: 60,
      obituaryPct: 0,
    });
  });
});

describe("pilotMetrics (five-metrics instrumentation, same suppression gate)", () => {
  const rec = (over: {
    vsMetro?: number;
    quotes?: number;
    benefit?: number;
    sat?: number;
  }) => ({
    overchargeCaughtCents: 0,
    ftcIssues: 0,
    ...(over.sat !== undefined ? { satisfaction: over.sat } : {}),
    ...(over.vsMetro !== undefined ? { savedVsMetroCents: over.vsMetro } : {}),
    ...(over.quotes !== undefined ? { quotesReceived: over.quotes } : {}),
    ...(over.benefit !== undefined ? { benefitDollarsCents: over.benefit } : {}),
  });

  it("is null under the small-sample threshold", () => {
    const few = Array.from({ length: SMALL_SAMPLE_THRESHOLD - 1 }, () =>
      rec({ vsMetro: 50_000, quotes: 4, benefit: 25_500, sat: 5 }),
    );
    expect(aggregateCohort(few).pilotMetrics).toBeNull();
  });

  it("computes median-vs-metro (negatives included honestly), avg quotes, benefit total, promoter share", () => {
    const stats = aggregateCohort([
      rec({ vsMetro: 100_000, quotes: 3, benefit: 25_500, sat: 5 }),
      rec({ vsMetro: 50_000, quotes: 4, sat: 4 }),
      rec({ vsMetro: -20_000, quotes: 2, sat: 2 }),
      rec({ vsMetro: 60_000, quotes: 5, benefit: 130_000, sat: 5 }),
      rec({ quotes: 4, sat: 4 }),
    ]);
    expect(stats.pilotMetrics).toEqual({
      medianSavedVsMetroCents: 55_000, // median of [-200, 500, 600, 1000] dollars → (500+600)/2
      avgQuotesPerFamily: 3.6,
      totalBenefitDollarsCents: 155_500,
      satisfactionPromoterPct: 80, // 4 of 5 rated ≥4
      bereavementRemindedPct: 0,
    });
  });

  it("individual fields are null when no case carries the data yet", () => {
    const stats = aggregateCohort(
      Array.from({ length: SMALL_SAMPLE_THRESHOLD }, () => rec({})),
    );
    expect(stats.pilotMetrics).toEqual({
      medianSavedVsMetroCents: null,
      avgQuotesPerFamily: null,
      totalBenefitDollarsCents: null,
      satisfactionPromoterPct: null,
      bereavementRemindedPct: 0,
    });
  });
});

describe("metroMedianCents", () => {
  it("returns the zip-adjusted mid of the service fair band, in cents", () => {
    const national = metroMedianCents("direct-cremation", "");
    expect(national).toBeGreaterThan(50_000);
    const manhattan = metroMedianCents("direct-cremation", "10001");
    expect(manhattan!).toBeGreaterThan(national!);
  });

  it("returns null for unknown service types — never a guessed baseline", () => {
    expect(metroMedianCents("not-a-service", "84101")).toBeNull();
  });
});

describe("rowToCohortRecord pilot fields", () => {
  it("computes savedVsMetro only when both sides exist", () => {
    const base = {
      savings_vs_listed_cents: 0,
      satisfaction_score: null,
      created_at: "2026-06-01T00:00:00Z",
      outcome_recorded_at: null,
    };
    expect(
      rowToCohortRecord({ ...base, amount_paid_cents: 150_000, metro_median_cents: 200_000 })
        .savedVsMetroCents,
    ).toBe(50_000);
    expect(
      rowToCohortRecord({ ...base, amount_paid_cents: 150_000 }).savedVsMetroCents,
    ).toBeUndefined();
  });
});


describe("bereavementRemindedPct (drives the HOSPICE's own benefit — we never counsel)", () => {
  it("counts families with at least one bereavement check-in, same gate", () => {
    const rec = (reminded: boolean) => ({
      overchargeCaughtCents: 0,
      ftcIssues: 0,
      bereavementReminded: reminded,
    });
    const stats = aggregateCohort([
      rec(true), rec(true), rec(true), rec(false), rec(false),
    ]);
    expect(stats.pilotMetrics?.bereavementRemindedPct).toBe(60);
    expect(
      aggregateCohort([rec(true), rec(true)]).pilotMetrics,
    ).toBeNull();
  });
});
