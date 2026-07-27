import { describe, it, expect } from "vitest";
import type { ActiveBenchmarkRow } from "@/lib/benchmarks-store";
import {
  groupVerifiedMetros,
  metroSummaryLine,
  type VerifiedMetroSummary,
} from "@/lib/verified-metros";

const row = (over: Partial<ActiveBenchmarkRow> = {}): ActiveBenchmarkRow => ({
  lineItemId: "basic-services",
  fairLowCents: 150000,
  fairHighCents: 250000,
  predatoryAtCents: 350000,
  tier: "verified",
  n: 8,
  version: "2026-07-v1",
  effectiveAt: "2026-07-10T00:00:00+00:00",
  scope: "metro",
  scopeValue: "Salt Lake City",
  sources: [],
  ...over,
});

describe("groupVerifiedMetros", () => {
  it("empty input ⇒ no summaries (the section-absent contract)", () => {
    expect(groupVerifiedMetros([])).toEqual([]);
  });

  it("ignores non-metro scopes", () => {
    expect(
      groupVerifiedMetros([
        row({ scope: "state", scopeValue: "UT" }),
        row({ scope: "zip3", scopeValue: "841" }),
      ]),
    ).toEqual([]);
  });

  it("summarizes a metro: item count, tier split, min n, latest version", () => {
    const out = groupVerifiedMetros([
      row({ lineItemId: "basic-services", n: 12 }),
      row({
        lineItemId: "embalming",
        tier: "community",
        n: 6,
        version: "2026-07-v2",
        effectiveAt: "2026-07-15T00:00:00+00:00",
      }),
    ]);
    expect(out).toEqual([
      {
        metro: "Salt Lake City",
        itemCount: 2,
        verifiedCount: 1,
        communityCount: 1,
        minN: 6,
        latestVersion: "2026-07-v2",
      },
    ]);
  });

  it("dedupes duplicate active rows per item — latest effective_at wins", () => {
    // A failed retire can leave two active rows for the same group; the
    // count must not double and minN must come from the winner only.
    const out = groupVerifiedMetros([
      row({ n: 5, version: "2026-07-v1", effectiveAt: "2026-07-01T00:00:00+00:00" }),
      row({ n: 9, version: "2026-07-v2", effectiveAt: "2026-07-20T00:00:00+00:00" }),
    ]);
    expect(out[0].itemCount).toBe(1);
    expect(out[0].minN).toBe(9);
    expect(out[0].latestVersion).toBe("2026-07-v2");
  });

  it("skips ids missing from the LINE_ITEMS catalog", () => {
    const out = groupVerifiedMetros([
      row({ lineItemId: "not-a-real-item" }),
      row({ lineItemId: "embalming" }),
    ]);
    expect(out[0].itemCount).toBe(1);
  });

  it("sorts metros alphabetically", () => {
    const out = groupVerifiedMetros([
      row({ scopeValue: "Salt Lake City" }),
      row({ scopeValue: "Boise", lineItemId: "embalming" }),
    ]);
    expect(out.map((m) => m.metro)).toEqual(["Boise", "Salt Lake City"]);
  });
});

describe("metroSummaryLine", () => {
  const summary = (over: Partial<VerifiedMetroSummary>): VerifiedMetroSummary => ({
    metro: "Salt Lake City",
    itemCount: 4,
    verifiedCount: 4,
    communityCount: 0,
    minN: 6,
    latestVersion: "2026-07-v1",
    ...over,
  });

  it("verified-only wording", () => {
    expect(metroSummaryLine(summary({}), 30)).toBe(
      "4 of 30 items from real price lists · at least 6 data points per item · 2026-07-v1",
    );
  });

  it('community-only wording never says "price lists"', () => {
    const line = metroSummaryLine(
      summary({ verifiedCount: 0, communityCount: 4 }),
      30,
    );
    expect(line).toBe(
      "4 of 30 items from prices reported by families in the area · at least 6 data points per item · 2026-07-v1",
    );
    expect(line).not.toContain("price lists");
  });

  it("mixed wording counts the tiers separately", () => {
    expect(
      metroSummaryLine(
        summary({ itemCount: 5, verifiedCount: 3, communityCount: 2 }),
        30,
      ),
    ).toBe(
      "3 of 30 items from real price lists, 2 from prices reported by families · at least 6 data points per item · 2026-07-v1",
    );
  });

  it("renders the store version bare — never a v-prefixed double", () => {
    expect(metroSummaryLine(summary({}), 30)).not.toContain("v2026");
  });
});
