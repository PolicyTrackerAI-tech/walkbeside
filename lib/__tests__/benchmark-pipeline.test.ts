import { describe, it, expect } from "vitest";
import {
  aggregateBenchmarks,
  proposalSpec,
  DRIFT_TOLERANCE,
  type AnalysisRecord,
} from "@/lib/benchmark-pipeline";
import { LINE_ITEMS, regionMultiplier } from "@/lib/pricing-data";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";

/**
 * The moat is defensible only if the provenance rigor never slips. These
 * tests pin the non-negotiables: min-N gating, dedupe, per-unit and range
 * exclusions, national normalization, and that the pipeline only ever
 * PROPOSES (there is no apply path to test — that's the point).
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
