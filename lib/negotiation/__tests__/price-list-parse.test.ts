import { describe, it, expect } from "vitest";
import {
  naiveExtract,
  matchLineItem,
  stripCodeFence,
  extractQty,
} from "@/lib/negotiation/price-list-parse";
import {
  LINE_ITEMS,
  classifyAgainst,
  adjustedRange,
  regionMultiplier,
} from "@/lib/pricing-data";

describe("stripCodeFence", () => {
  it("strips a ```json fence", () => {
    expect(stripCodeFence('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it("strips a bare ``` fence", () => {
    expect(stripCodeFence("```\nhello\n```")).toBe("hello");
  });
  it("leaves unfenced text untouched", () => {
    expect(stripCodeFence('{"a":1}')).toBe('{"a":1}');
  });
});

describe("naiveExtract (deterministic fallback parser)", () => {
  it("parses a single price with a thousands comma", () => {
    expect(naiveExtract("Basic services fee $2,195").items).toEqual([
      { name: "Basic services fee", cents: 219500 },
    ]);
  });

  it("parses a decimal price", () => {
    expect(naiveExtract("Death certificate $24.00").items[0]).toEqual({
      name: "Death certificate",
      cents: 2400,
    });
  });

  it("parses a selection range with hyphen or en-dash", () => {
    expect(naiveExtract("Caskets $1,200-$10,000").items[0]).toEqual({
      name: "Caskets",
      cents_low: 120000,
      cents_high: 1000000,
    });
    expect(naiveExtract("Urns $200 – $2,000").items[0]).toEqual({
      name: "Urns",
      cents_low: 20000,
      cents_high: 200000,
    });
  });

  it("routes a 'total' line to total_cents, not items", () => {
    const out = naiveExtract("Embalming $900\nTotal $7,000");
    expect(out.total_cents).toBe(700000);
    expect(out.items).toEqual([{ name: "Embalming", cents: 90000 }]);
  });

  it("skips lines with no trailing price", () => {
    expect(naiveExtract("This price list is provided on request").items).toEqual(
      [],
    );
  });
});

describe("matchLineItem (name → benchmarked item)", () => {
  it("matches an exact name", () => {
    expect(matchLineItem("Embalming")?.id).toBe("embalming");
  });

  it("matches a '/'-separated synonym", () => {
    expect(matchLineItem("Limousine for the family")?.id).toBe("limo");
  });

  it("drops a parenthetical qualifier so generic words don't false-match", () => {
    // "Death certificates (each)" → synonym "death certificates"
    expect(matchLineItem("Certified death certificates")?.id).toBe("death-cert");
  });

  it("uses word boundaries: 'urn' matches but 'return' does not", () => {
    expect(matchLineItem("Cremation urn")?.id).toBe("urn");
    expect(matchLineItem("Return transport of cremated remains")?.id).not.toBe(
      "urn",
    );
  });

  it("returns undefined for an item we don't benchmark", () => {
    expect(matchLineItem("Catering and sandwiches")).toBeUndefined();
  });
});

describe("extractQty", () => {
  it("reads a parenthetical count and strips it from the name", () => {
    expect(extractQty("Death certificates (10)")).toEqual({
      name: "Death certificates",
      qty: 10,
    });
  });

  it("reads x-notation, qty:, and copy phrasing", () => {
    expect(extractQty("Death certificates x10").qty).toBe(10);
    expect(extractQty("Certified copies qty: 8").qty).toBe(8);
    expect(extractQty("12 certified copies").qty).toBe(12);
  });

  it("ignores a quantity of 1 or none", () => {
    expect(extractQty("Basic services fee")).toEqual({
      name: "Basic services fee",
    });
    expect(extractQty("Death certificates (1)").qty).toBeUndefined();
  });

  it("naiveExtract attaches qty to the parsed item", () => {
    const { items } = naiveExtract("Death certificates (10) $250");
    expect(items[0]).toEqual({
      name: "Death certificates",
      cents: 25000,
      qty: 10,
    });
  });
});

// The bug this guards against: the result could display a zip-adjusted fair
// range yet stamp the same item "high" because the verdict compared against
// NATIONAL thresholds. The fix classifies against the SAME adjusted thresholds
// the range is shown from. These tests lock that invariant across every item
// and a spread of regional multipliers.
describe("verdict never contradicts the displayed fair range (regression)", () => {
  const ZIPS = ["", "10001", "94110", "84101", "39201"];

  it("a price within the displayed fair range is never flagged high/predatory", () => {
    for (const item of LINE_ITEMS) {
      for (const zip of ZIPS) {
        const [lo, hi] = adjustedRange(item.fairLow, item.fairHigh, zip);
        const predatory = Math.round(item.predatoryAt * regionMultiplier(zip));
        for (const p of [lo, Math.round((lo + hi) / 2), hi]) {
          const c = classifyAgainst(p, lo, hi, predatory);
          expect(
            ["good", "fair"],
            `${item.id} @ ${zip || "national"}: price ${p} inside range [${lo}, ${hi}] classified "${c}"`,
          ).toContain(c);
        }
      }
    }
  });

  it("classifies the range edges and above-range prices correctly", () => {
    for (const item of LINE_ITEMS) {
      for (const zip of ZIPS) {
        const [lo, hi] = adjustedRange(item.fairLow, item.fairHigh, zip);
        const predatory = Math.round(item.predatoryAt * regionMultiplier(zip));
        expect(classifyAgainst(lo, lo, hi, predatory)).toBe("good");
        if (predatory > hi) {
          if (hi + 1 < predatory) {
            expect(classifyAgainst(hi + 1, lo, hi, predatory)).toBe("high");
          }
          expect(classifyAgainst(predatory, lo, hi, predatory)).toBe(
            "predatory",
          );
        }
      }
    }
  });

  it("reproduces the original bug scenario, now consistent", () => {
    // A price at the top of the zip-adjusted range must read "fair", not "high".
    const embalming = LINE_ITEMS.find((i) => i.id === "embalming");
    expect(embalming).toBeDefined();
    const zip = "94110"; // high cost-of-living metro
    const [lo, hi] = adjustedRange(
      embalming!.fairLow,
      embalming!.fairHigh,
      zip,
    );
    const predatory = Math.round(embalming!.predatoryAt * regionMultiplier(zip));
    expect(classifyAgainst(hi, lo, hi, predatory)).toBe("fair");
  });
});
