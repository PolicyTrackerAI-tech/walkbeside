import { describe, it, expect } from "vitest";
import { detectDocScope } from "@/lib/bundling-detection/doc-scope";
import { runRules, type AnalyzedItem } from "@/lib/bundling-detection/rules";

/**
 * Scope gate for the FTC rules engine. The Funeral Rule covers funeral
 * providers, not cemeteries or monument dealers — flagging a "violation"
 * against a cemetery list is an indefensible claim. The tests pin the
 * under-claiming direction: reclassify ONLY when cemetery concepts are
 * present and no funeral-home signal is; every tie keeps full checking.
 */

const CEMETERY_LIST = `Green Hills Memorial Park — Price List
Grave space (adult, lawn section) $2,400
Opening and closing — weekday $1,100
Grave liner (required) $700
Perpetual care fee (15%) included
Bronze memorial marker 24x12 $1,800
Marker setting / foundation fee $450
Cremation niche — columbarium wall $1,200`;

const FUNERAL_GPL = `Sunset Funeral Home — General Price List
Basic services of funeral director and staff $2,195
Embalming $795
Transfer of remains to funeral home $395
Direct cremation with container provided by family $1,295`;

describe("detectDocScope", () => {
  it("classifies a cemetery/monument list", () => {
    const r = detectDocScope(CEMETERY_LIST);
    expect(r.scope).toBe("cemetery-monument");
    expect(r.cemeteryHits.length).toBeGreaterThanOrEqual(2);
    expect(r.funeralHits).toEqual([]);
  });

  it("classifies a funeral-home GPL", () => {
    expect(detectDocScope(FUNERAL_GPL).scope).toBe("funeral-home");
  });

  it("a combined funeral-home + cemetery list stays funeral-home — the Rule covers combos", () => {
    const r = detectDocScope(`${FUNERAL_GPL}\nGrave space $2,400\nOpening and closing $1,100`);
    expect(r.scope).toBe("funeral-home");
  });

  it("one lone cemetery term is not enough — unknown keeps full checking", () => {
    expect(detectDocScope("Bronze memorial marker $1,800").scope).toBe("unknown");
  });

  it("adjectival cemetery uses of 'casket' and 'cremation' don't count as funeral signals", () => {
    const r = detectDocScope(
      "Opening and closing — casket burial $1,100\nOpening and closing — cremation interment $450\nGrave space $2,400",
    );
    expect(r.scope).toBe("cemetery-monument");
  });

  it("scans item names too, not just raw text", () => {
    const r = detectDocScope("prices below", ["Grave space (adult)", "Perpetual care fee"]);
    expect(r.scope).toBe("cemetery-monument");
  });
});

describe("runRules scope gate", () => {
  const items: AnalyzedItem[] = [{ name: "Grave liner", cents: 70000 }];

  it("suppresses FTC flags on a cemetery list and shows one info card instead", () => {
    // "Grave liner required by state law" on a cemetery list would otherwise
    // risk the worst false positive: a confident Funeral Rule violation
    // against a seller the Rule doesn't govern.
    const d = runRules({
      rawText: `${CEMETERY_LIST}\nGrave liner required by state law $700`,
      items,
      totalCents: 70000,
    });
    expect(d).toHaveLength(1);
    expect(d[0].ruleId).toBe("cemetery-scope-notice");
    expect(d[0].severity).toBe("info");
    expect(d.every((x) => x.severity !== "violation")).toBe(true);
  });

  it("does NOT gate a funeral-home GPL — the engine runs normally", () => {
    const d = runRules({
      rawText: `${FUNERAL_GPL}\nA casket is required by state law for direct cremation $995`,
      items: [],
      totalCents: 0,
    });
    expect(d.map((x) => x.ruleId)).not.toContain("cemetery-scope-notice");
    expect(d.length).toBeGreaterThan(0);
  });

  it("does NOT gate a combined home+cemetery list", () => {
    const d = runRules({
      rawText: `${FUNERAL_GPL}\nGrave space $2,400\nOpening and closing $1,100`,
      items: [],
      totalCents: 0,
    });
    expect(d.map((x) => x.ruleId)).not.toContain("cemetery-scope-notice");
  });
});
