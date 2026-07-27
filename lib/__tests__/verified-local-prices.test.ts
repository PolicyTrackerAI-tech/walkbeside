import { describe, it, expect } from "vitest";
import { LINE_ITEMS } from "@/lib/pricing-data";
import type { RegionalBenchmark } from "@/lib/benchmarks-store";
import {
  verifiedLocalRows,
  displayItemName,
  localCountLine,
} from "@/lib/verified-local-prices";

const bench = (
  lineItemId: string,
  over: Partial<RegionalBenchmark> = {},
): RegionalBenchmark => ({
  lineItemId,
  fairLowCents: 150000,
  fairHighCents: 250000,
  predatoryAtCents: 350000,
  tier: "verified",
  n: 8,
  version: "2026-07-v1",
  effectiveAt: "2026-07-10T00:00:00+00:00",
  scope: "metro",
  ...over,
});

const asMap = (rows: RegionalBenchmark[]) =>
  new Map(rows.map((r) => [r.lineItemId, r]));

describe("verifiedLocalRows", () => {
  // The zero-override identity contract at helper level: an empty store read
  // must produce nothing to render.
  it("empty Map ⇒ no rows and zero counts", () => {
    expect(verifiedLocalRows(new Map())).toEqual({
      rows: [],
      verifiedCount: 0,
      communityCount: 0,
    });
  });

  it("converts cents to dollars exactly once", () => {
    const { rows } = verifiedLocalRows(
      asMap([
        bench("basic-services", { fairLowCents: 149950, fairHighCents: 250000 }),
      ]),
    );
    expect(rows[0].fairLowUsd).toBe(1499.5);
    expect(rows[0].fairHighUsd).toBe(2500);
  });

  it("counts tiers separately and carries n + sliced date", () => {
    const { rows, verifiedCount, communityCount } = verifiedLocalRows(
      asMap([
        bench("basic-services"),
        bench("embalming", { tier: "community", n: 6 }),
        bench("transfer", { tier: "verified", n: 11 }),
      ]),
    );
    expect(verifiedCount).toBe(2);
    expect(communityCount).toBe(1);
    const embalming = rows.find((r) => r.lineItemId === "embalming");
    expect(embalming?.tier).toBe("community");
    expect(embalming?.n).toBe(6);
    expect(embalming?.lastUpdated).toBe("2026-07-10");
  });

  it("sorts rows in LINE_ITEMS catalog order regardless of Map order", () => {
    const ids = ["direct-cremation-fee", "basic-services", "embalming"];
    const { rows } = verifiedLocalRows(asMap(ids.map((id) => bench(id))));
    const catalogOrder = LINE_ITEMS.filter((it) => ids.includes(it.id)).map(
      (it) => it.id,
    );
    expect(rows.map((r) => r.lineItemId)).toEqual(catalogOrder);
  });

  it("skips rows below the n≥5 floor (hand-SQL defense, guardrail #4)", () => {
    const { rows, verifiedCount } = verifiedLocalRows(
      asMap([bench("basic-services", { n: 2 }), bench("embalming", { n: 5 })]),
    );
    expect(rows.map((r) => r.lineItemId)).toEqual(["embalming"]);
    expect(verifiedCount).toBe(1);
  });

  it("skips overrides whose item id is not in the catalog", () => {
    const { rows, verifiedCount } = verifiedLocalRows(
      asMap([bench("not-a-real-item"), bench("basic-services")]),
    );
    expect(rows.map((r) => r.lineItemId)).toEqual(["basic-services"]);
    expect(verifiedCount).toBe(1);
  });

  it("uses the trimmed display name", () => {
    const { rows } = verifiedLocalRows(asMap([bench("basic-services")]));
    const item = LINE_ITEMS.find((it) => it.id === "basic-services")!;
    expect(rows[0].name).toBe(displayItemName(item.name));
    expect(rows[0].name).not.toContain("/");
  });

  it("keeps the em-dash qualifier so the two caskets stay distinct", () => {
    const { rows } = verifiedLocalRows(
      asMap([bench("casket-metal"), bench("casket-wood")]),
    );
    const names = rows.map((r) => r.name);
    expect(new Set(names).size).toBe(2);
    expect(names).toContain("Casket — 18-gauge metal");
    expect(names).toContain("Casket — wood");
  });
});

describe("localCountLine (verbatim law — every character pinned)", () => {
  it("verified-only", () => {
    expect(localCountLine(4, 0, 30)).toBe(
      "4 of the 30 benchmarked items in this metro come from real price lists; the rest are modeled.",
    );
  });

  it('community-only — never says "price lists"', () => {
    const line = localCountLine(0, 3, 30);
    expect(line).toBe(
      "3 of the 30 benchmarked items in this metro come from prices reported by families in the area; the rest are modeled.",
    );
    expect(line).not.toContain("price lists");
  });

  it("mixed — tiers counted separately, semicolon-chained", () => {
    expect(localCountLine(4, 3, 30)).toBe(
      "4 of the 30 benchmarked items in this metro come from real price lists; 3 come from prices reported by families in the area; the rest are modeled.",
    );
  });
});
