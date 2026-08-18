import { describe, it, expect } from "vitest";
import {
  LINE_ITEMS,
  SERVICE_TOTALS,
  adjustedRange,
  classifyAgainst,
  displayThresholds,
  regionMultiplier,
} from "@/lib/pricing-data";
import { rateQuote } from "@/lib/price-rating";

/**
 * Guardrail #4 tripwires added in audit A3 (2026-08-18).
 *
 * 1. Catalog ordering: every published threshold triple must be ordered, or
 *    a price could be simultaneously "fair" and "predatory".
 * 2. displayThresholds is THE display rule and must equal the analyzer's
 *    modeled-path math exactly (app/api/analyze-price-list/route.ts):
 *    per-unit items never COLA-adjust; everything else adjusts fair range
 *    AND predatory cutoff by the same multiplier. Two surfaces publishing
 *    two numbers for one fact was audit finding A3-02.
 * 3. rateQuote's "bad" boundary must be the same adjusted predatory-band
 *    floor the /prices page displays — the verdict can never contradict
 *    the band printed beside it.
 */

// Zips spanning the multiplier range: high-cost metro, ~1.0, low-cost.
const ZIPS = ["10001", "44106", "39201", ""];

describe("catalog threshold ordering (every published number)", () => {
  it("every LINE_ITEMS entry is ordered fairLow < fairHigh < predatoryAt", () => {
    for (const item of LINE_ITEMS) {
      expect(item.fairLow, item.id).toBeGreaterThanOrEqual(0);
      expect(item.fairLow, item.id).toBeLessThan(item.fairHigh);
      expect(item.fairHigh, item.id).toBeLessThan(item.predatoryAt);
    }
  });

  it("every SERVICE_TOTALS entry is ordered fairLow ≤ fairHigh < predatoryLow < predatoryHigh", () => {
    for (const s of SERVICE_TOTALS) {
      expect(s.fairLow, s.type).toBeGreaterThanOrEqual(0);
      expect(s.fairLow, s.type).toBeLessThanOrEqual(s.fairHigh);
      expect(s.fairHigh, s.type).toBeLessThan(s.predatoryLow);
      expect(s.predatoryLow, s.type).toBeLessThan(s.predatoryHigh);
    }
  });

  it("ordering survives regional adjustment at both extremes", () => {
    for (const zip of ZIPS) {
      for (const item of LINE_ITEMS) {
        const t = displayThresholds(item, zip);
        expect(t.fairLow, `${item.id} @ ${zip}`).toBeLessThan(t.fairHigh);
        expect(t.fairHigh, `${item.id} @ ${zip}`).toBeLessThan(t.predatoryAt);
      }
    }
  });
});

describe("displayThresholds — the one display rule (mirrors the analyzer)", () => {
  it("per-unit items keep the NATIONAL range and cutoff at every zip", () => {
    const perUnit = LINE_ITEMS.filter((i) => i.perUnit);
    expect(perUnit.length).toBeGreaterThan(0); // death-cert + refrigeration
    for (const item of perUnit) {
      for (const zip of ZIPS) {
        expect(displayThresholds(item, zip), `${item.id} @ ${zip}`).toEqual({
          fairLow: item.fairLow,
          fairHigh: item.fairHigh,
          predatoryAt: item.predatoryAt,
        });
      }
    }
  });

  it("non-per-unit items match the analyzer's modeled-path formula exactly", () => {
    for (const item of LINE_ITEMS.filter((i) => !i.perUnit)) {
      for (const zip of ZIPS) {
        // The analyzer's modeled path, verbatim
        // (app/api/analyze-price-list/route.ts):
        const m = regionMultiplier(zip);
        const [lo, hi] = adjustedRange(item.fairLow, item.fairHigh, zip);
        const predatory = Math.round(item.predatoryAt * m);
        expect(displayThresholds(item, zip), `${item.id} @ ${zip}`).toEqual({
          fairLow: lo,
          fairHigh: hi,
          predatoryAt: predatory,
        });
      }
    }
  });

  it("classification against display thresholds can never contradict the displayed range", () => {
    // A dollar inside the displayed fair range must never classify high or
    // predatory; a dollar at the displayed cutoff must classify predatory.
    for (const item of LINE_ITEMS) {
      for (const zip of ZIPS) {
        const t = displayThresholds(item, zip);
        const mid = Math.round((t.fairLow + t.fairHigh) / 2);
        const verdictInside = classifyAgainst(
          mid,
          t.fairLow,
          t.fairHigh,
          t.predatoryAt,
        );
        expect(["good", "fair"], `${item.id} @ ${zip}`).toContain(
          verdictInside,
        );
        expect(
          classifyAgainst(t.predatoryAt, t.fairLow, t.fairHigh, t.predatoryAt),
          `${item.id} @ ${zip}`,
        ).toBe("predatory");
      }
    }
  });
});

describe("rateQuote — /prices whole-service rating", () => {
  const svc = SERVICE_TOTALS.find((s) => s.type === "traditional-burial")!;

  function bandsAt(zip: string) {
    const [fairLow, fairHigh] = adjustedRange(svc.fairLow, svc.fairHigh, zip);
    const [predLow] = adjustedRange(svc.predatoryLow, svc.predatoryHigh, zip);
    return { fairLow, fairHigh, predLow };
  }

  it("prompts for input on a zero quote", () => {
    expect(rateQuote(0, 8000, 12000, 18000).tone).toBe("warn");
  });

  it("good ≤ fairHigh; warn strictly between; bad at/above the adjusted predatory floor", () => {
    for (const zip of ZIPS) {
      const { fairLow, fairHigh, predLow } = bandsAt(zip);
      expect(rateQuote(fairHigh, fairLow, fairHigh, predLow).tone).toBe("good");
      expect(rateQuote(fairHigh + 1, fairLow, fairHigh, predLow).tone).toBe(
        "warn",
      );
      expect(rateQuote(predLow - 1, fairLow, fairHigh, predLow).tone).toBe(
        "warn",
      );
      expect(rateQuote(predLow, fairLow, fairHigh, predLow).tone).toBe("bad");
    }
  });

  it("the bad verdict names the SAME predatory floor the page displays (A3-02)", () => {
    const { fairLow, fairHigh, predLow } = bandsAt("10001");
    const rating = rateQuote(predLow + 500, fairLow, fairHigh, predLow);
    expect(rating.message).toContain(
      predLow.toLocaleString("en-US"),
    );
  });
});
