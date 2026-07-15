import { describe, it, expect } from "vitest";
import {
  aggregateBenchmarks,
  aggregateAllBenchmarks,
  proposalSpec,
  DRIFT_TOLERANCE,
  type AnalysisRecord,
  type OutreachQuoteRecord,
} from "@/lib/benchmark-pipeline";
import { LINE_ITEMS, regionMultiplier } from "@/lib/pricing-data";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";

/**
 * The moat is defensible only if the provenance rigor never slips. These
 * tests pin the non-negotiables: min-N gating, dedupe, per-unit and range
 * exclusions, national normalization, and that the pipeline only ever
 * PROPOSES for CODE benchmarks (no apply path for those — that's the point;
 * the DB-tier promote gate lives in /api/admin/benchmarks/promote and is
 * pinned by its own route test).
 */

const basic = LINE_ITEMS.find((l) => l.id === "basic-services")!;
const perUnitItem = LINE_ITEMS.find((l) => l.perUnit)!;

function rec(
  userId: string,
  cents: number,
  overrides: Partial<AnalysisRecord["items"][number]> = {},
  zip?: string,
): AnalysisRecord {
  return {
    userId,
    zip,
    items: [{ matchedItemId: basic.id, cents, ...overrides }],
  };
}

describe("aggregateBenchmarks", () => {
  it("groups by item nationally and reports quartiles", () => {
    const records = [1000_00, 1200_00, 1400_00].map((c, i) => rec(`u${i}`, c));
    const g = aggregateBenchmarks(records).find(
      (x) => x.itemId === basic.id && x.region === "national",
    )!;
    expect(g.n).toBe(3);
    expect(g.medianCents).toBe(1200_00);
    expect(g.sufficient).toBe(false); // 3 < SMALL_SAMPLE_THRESHOLD
    expect(g.proposal).toBeUndefined();
  });

  it("never proposes below the minimum sample size, no matter the drift", () => {
    const records = Array.from({ length: SMALL_SAMPLE_THRESHOLD - 1 }, (_, i) =>
      rec(`u${i}`, basic.predatoryAt * 100 * 2),
    );
    const g = aggregateBenchmarks(records).find((x) => x.region === "national")!;
    expect(g.medianVsRange).toBe("above");
    expect(g.proposal).toBeUndefined();
  });

  it("proposes only past the drift tolerance once the sample is sufficient", () => {
    const mid = ((basic.fairLow + basic.fairHigh) / 2) * 100;
    const drifted = Math.round(mid * (1 + DRIFT_TOLERANCE + 0.1));
    const records = Array.from({ length: SMALL_SAMPLE_THRESHOLD }, (_, i) =>
      rec(`u${i}`, drifted),
    );
    const g = aggregateBenchmarks(records).find((x) => x.region === "national")!;
    expect(g.sufficient).toBe(true);
    expect(g.proposal).toBeDefined();
    expect(g.proposal!.driftPct).toBeGreaterThan(DRIFT_TOLERANCE);
    // Undrifted sample at the same n: no proposal.
    const calm = Array.from({ length: SMALL_SAMPLE_THRESHOLD }, (_, i) =>
      rec(`u${i}`, Math.round(mid)),
    );
    const g2 = aggregateBenchmarks(calm).find((x) => x.region === "national")!;
    expect(g2.proposal).toBeUndefined();
  });

  it("dedupes the same user re-checking the same item at the same price", () => {
    const records = [rec("u1", 1200_00), rec("u1", 1200_00), rec("u1", 1200_00)];
    const g = aggregateBenchmarks(records).find((x) => x.region === "national")!;
    expect(g.n).toBe(1);
  });

  it("excludes selection-range items and unmatched items entirely", () => {
    const records: AnalysisRecord[] = [
      { userId: "u1", items: [{ matchedItemId: basic.id, cents: 1000_00, isRange: true }] },
      { userId: "u2", items: [{ cents: 1000_00 }] },
    ];
    expect(aggregateBenchmarks(records)).toHaveLength(0);
  });

  it("normalizes non-per-unit prices into national terms by the zip multiplier", () => {
    const zip = "10001"; // Manhattan-tier multiplier > 1
    const m = regionMultiplier(zip);
    expect(m).toBeGreaterThan(1);
    const quoted = Math.round(basic.fairHigh * 100 * m);
    const g = aggregateBenchmarks([rec("u1", quoted, {}, zip)]).find(
      (x) => x.region === "national",
    )!;
    // De-COLA'd back to ~fairHigh, so a fair NYC price never reads as national drift.
    expect(Math.abs(g.medianCents - basic.fairHigh * 100)).toBeLessThanOrEqual(100);
  });

  it("per-unit items compare per-each and are never COLA-normalized", () => {
    const g = aggregateBenchmarks([
      {
        userId: "u1",
        zip: "10001",
        items: [{ matchedItemId: perUnitItem.id, cents: 25_00 * 10, qty: 10 }],
      },
    ]).find((x) => x.itemId === perUnitItem.id && x.region === "national")!;
    expect(g.medianCents).toBe(25_00);
  });

  it("builds metro groups from raw prices but never proposes on them", () => {
    const records = Array.from({ length: SMALL_SAMPLE_THRESHOLD + 2 }, (_, i) =>
      rec(`u${i}`, basic.predatoryAt * 100 * 2, {}, "10001"),
    );
    const metro = aggregateBenchmarks(records).find((x) => x.region !== "national");
    expect(metro).toBeDefined();
    expect(metro!.proposal).toBeUndefined();
  });
});

function oRec(
  outreachId: string,
  zip: string,
  items: OutreachQuoteRecord["items"],
): OutreachQuoteRecord {
  return { outreachId, zip, items };
}

const oItem = (cents: number, id = basic.id) => ({
  lineItemId: id,
  name: "Basic services",
  cents,
});

describe("aggregateAllBenchmarks", () => {
  it("merges outreach quotes into the same groups and sums n across sources", () => {
    const analyses = [rec("u1", 1000_00), rec("u2", 1200_00)];
    const outreach = [oRec("o1", "84101", [oItem(1400_00)])];
    const g = aggregateAllBenchmarks(analyses, outreach).find(
      (x) => x.itemId === basic.id && x.region === "national",
    )!;
    expect(g.n).toBe(3);
    expect(g.sources).toEqual({ analyses: 2, outreach: 1 });
  });

  it("dedupes outreach by outreach id + item + price, not across rows", () => {
    const outreach = [
      // same outreach row listing the same item at the same price twice: 1
      oRec("o1", "84101", [oItem(1400_00), oItem(1400_00)]),
      // a different home quoting the same price is a real observation: +1
      oRec("o2", "84101", [oItem(1400_00)]),
    ];
    const g = aggregateAllBenchmarks([], outreach).find(
      (x) => x.region === "national",
    )!;
    expect(g.n).toBe(2);
    expect(g.sources).toEqual({ analyses: 0, outreach: 2 });
  });

  it("skips outreach items whose lineItemId is not in LINE_ITEMS", () => {
    const outreach = [
      oRec("o1", "84101", [oItem(1400_00, "made-up-fee"), oItem(1200_00)]),
    ];
    const groups = aggregateAllBenchmarks([], outreach);
    expect(groups.some((g) => g.itemId === "made-up-fee")).toBe(false);
    expect(groups.find((g) => g.region === "national")!.n).toBe(1);
  });

  it("per-unit outreach items compare per-each and are never COLA-normalized", () => {
    const g = aggregateAllBenchmarks(
      [],
      [oRec("o1", "10001", [oItem(25_00, perUnitItem.id)])],
    ).find((x) => x.itemId === perUnitItem.id && x.region === "national")!;
    expect(g.medianCents).toBe(25_00);
  });

  it("de-COLAs non-per-unit outreach prices for national buckets, keeps them raw for metro", () => {
    const zip = "10001";
    const m = regionMultiplier(zip);
    expect(m).toBeGreaterThan(1);
    const quoted = Math.round(basic.fairHigh * 100 * m);
    const groups = aggregateAllBenchmarks([], [oRec("o1", zip, [oItem(quoted)])]);
    const national = groups.find((x) => x.region === "national")!;
    const metro = groups.find((x) => x.region !== "national")!;
    expect(Math.abs(national.medianCents - basic.fairHigh * 100)).toBeLessThanOrEqual(100);
    expect(metro.medianCents).toBe(quoted);
    expect(metro.sources).toEqual({ analyses: 0, outreach: 1 });
  });

  it("aggregateBenchmarks output stays source-count-free (byte-compatible)", () => {
    const g = aggregateBenchmarks([rec("u1", 1200_00)]).find(
      (x) => x.region === "national",
    )!;
    expect(g.sources).toBeUndefined();
  });
});

describe("proposalSpec", () => {
  it("writes the founder-facing spec including the manual apply path", () => {
    const mid = ((basic.fairLow + basic.fairHigh) / 2) * 100;
    const records = Array.from({ length: SMALL_SAMPLE_THRESHOLD }, (_, i) =>
      rec(`u${i}`, Math.round(mid * 1.4)),
    );
    const g = aggregateBenchmarks(records).find((x) => x.region === "national")!;
    const spec = proposalSpec(g);
    expect(spec).toContain(basic.id);
    expect(spec).toContain(`n=${SMALL_SAMPLE_THRESHOLD}`);
    expect(spec).toContain("lib/pricing-data.ts");
    expect(spec).toContain("/corrections");
  });
});
