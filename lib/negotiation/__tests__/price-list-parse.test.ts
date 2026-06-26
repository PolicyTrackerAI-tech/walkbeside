import { describe, it, expect } from "vitest";
import {
  naiveExtract,
  matchLineItem,
  cleanItemName,
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

describe("cleanItemName (strip folded section headers)", () => {
  it("strips a header folded onto a benchmarked item (the repro)", () => {
    // GPL has "Direct cremation arrangement" header above "Basic services fee
    // $4,200"; Claude folds them into one name. We want just the item.
    const cleaned = cleanItemName(
      "Direct cremation arrangement — Basic services fee",
    );
    expect(cleaned).toBe("Basic services fee");
    // The cleaned name still matches the same benchmark.
    expect(matchLineItem(cleaned)?.id).toBe("basic-services");
  });

  it("strips ALL-CAPS GPL section headers", () => {
    expect(cleanItemName("PROFESSIONAL SERVICES — Basic services fee")).toBe(
      "Basic services fee",
    );
    expect(
      cleanItemName("CASH ADVANCE ITEMS — Death certificates (each)"),
    ).toBe("Death certificates (each)");
    expect(cleanItemName("MERCHANDISE — Embalming")).toBe("Embalming");
  });

  it("handles a colon-style header separator", () => {
    expect(cleanItemName("Professional services: Basic services fee")).toBe(
      "Basic services fee",
    );
  });

  it("leaves a meaningful fold intact (trailing part isn't benchmarked)", () => {
    // "Type A (per 25)" is meaningless without its header — keep the fold.
    const name = "Acknowledgement cards — Type A (per 25)";
    expect(cleanItemName(name)).toBe(name);
  });

  it("leaves a benchmarked item whose own name has an em-dash untouched", () => {
    // "Casket — 18-gauge metal" is itself the line-item name; "18-gauge metal"
    // isn't a benchmark on its own, so nothing is stripped.
    expect(cleanItemName("Casket — 18-gauge metal")).toBe(
      "Casket — 18-gauge metal",
    );
  });

  it("does not strip when prefix and trailing map to different benchmarks", () => {
    // Stripping here could change the classification, so leave it alone.
    const name = "Hearse — Family car / limousine";
    expect(cleanItemName(name)).toBe(name);
  });

  it("leaves a plain self-describing name alone", () => {
    expect(cleanItemName("Basic services fee")).toBe("Basic services fee");
  });

  it("does not treat an intra-word hyphen as a header separator", () => {
    expect(cleanItemName("18-gauge metal casket")).toBe("18-gauge metal casket");
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

// OCR-robustness pass: real GPL formats that used to be hard misses (the price
// regex required the dollar amount at the literal end of line) now parse, and a
// matching set of precision guards proves the broadened matching never
// fabricates an item from structural noise (years, addresses, totals, phones).
describe("naiveExtract — OCR robustness (recovered misses)", () => {
  const only = (text: string) => naiveExtract(text).items;

  it("strips a trailing footnote / marker after a price", () => {
    expect(only("Embalming $895*")).toEqual([{ name: "Embalming", cents: 89500 }]);
    expect(only("Embalming $895 (1)")).toEqual([{ name: "Embalming", cents: 89500 }]);
    expect(only("Embalming $895 †")).toEqual([{ name: "Embalming", cents: 89500 }]);
  });

  it("treats 'and up' / '+' as a single floor value", () => {
    expect(only("Cremation $895 and up")).toEqual([{ name: "Cremation", cents: 89500 }]);
    expect(only("Direct cremation $1,295+")).toEqual([
      { name: "Direct cremation", cents: 129500 },
    ]);
  });

  it("handles dot/colon/dash leaders and glued separators, cleaning the name", () => {
    expect(only("Basic services fee .......... $2,195")).toEqual([
      { name: "Basic services fee", cents: 219500 },
    ]);
    expect(only("Embalming:$895")).toEqual([{ name: "Embalming", cents: 89500 }]);
    expect(only("Embalming — $895")).toEqual([{ name: "Embalming", cents: 89500 }]);
    // word-internal hyphen preserved
    expect(only("Set-up fee $300")).toEqual([{ name: "Set-up fee", cents: 30000 }]);
  });

  it("reads a per-unit price carried by a trailing unit word", () => {
    expect(only("Death certificates $25 each")).toEqual([
      { name: "Death certificates", cents: 2500 },
    ]);
    expect(only("Certified copies $25/copy")).toEqual([
      { name: "Certified copies", cents: 2500 },
    ]);
    expect(only("Additional staff $150 per hour")).toEqual([
      { name: "Additional staff", cents: 15000 },
    ]);
  });

  it("reads a floor ('from'/'starting at') as a single price, not a phantom $0", () => {
    expect(only("Direct cremation from $1,295")).toEqual([
      { name: "Direct cremation", cents: 129500 },
    ]);
    expect(only("Caskets starting at $895")).toEqual([
      { name: "Caskets", cents: 89500 },
    ]);
  });

  it("reads a closed range stated in words", () => {
    expect(only("Caskets between $800 and $10,000")).toEqual([
      { name: "Caskets", cents_low: 80000, cents_high: 1000000 },
    ]);
    expect(only("Urns $95 to $1,200")).toEqual([
      { name: "Urns", cents_low: 9500, cents_high: 120000 },
    ]);
  });

  it("keeps a dash-range intact even with a trailing marker", () => {
    expect(only("Caskets $800-$10,000*")).toEqual([
      { name: "Caskets", cents_low: 80000, cents_high: 1000000 },
    ]);
  });
});

describe("naiveExtract — precision guards (structural noise stays skipped)", () => {
  const run = (text: string) => naiveExtract(text);
  const only = (text: string) => run(text).items;

  it("never fabricates an item from a bare year, address, or hours", () => {
    expect(only("Established 1962")).toEqual([]);
    expect(only("Suite 200")).toEqual([]);
    expect(only("123 Main St, Suite 200")).toEqual([]);
    expect(only("Open 9-5")).toEqual([]); // not a $9–$5 range
    expect(only("Phone: 801-555-1234")).toEqual([]);
  });

  it("skips accounting / payment lines but keeps a real charge with a similar word", () => {
    expect(only("Sales tax $42.50")).toEqual([]);
    expect(only("Balance due $9,500")).toEqual([]);
    expect(only("Tax preparation $200")).toEqual([
      { name: "Tax preparation", cents: 20000 },
    ]);
  });

  it("routes totals, preferring a grand total over a subtotal", () => {
    const r = run("Embalming $900\nSubtotal $8,000\nGrand Total $9,500");
    expect(r.items).toEqual([{ name: "Embalming", cents: 90000 }]);
    expect(r.total_cents).toBe(950000);
  });

  it("does not invent a range from a bare-number 'to'/'and' pair", () => {
    expect(only("Lots 100 to 200")).toEqual([]);
    expect(only("Sections 1 and 2")).toEqual([]);
  });

  it("still parses an ordinary $-priced item", () => {
    expect(only("Honorarium $250")).toEqual([{ name: "Honorarium", cents: 25000 }]);
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
