import { describe, it, expect } from "vitest";
import {
  overchargeCents,
  ftcFlagFor,
  type DisplayItem,
  type DisplayFlag,
} from "@/lib/analyzer-display";

const base: DisplayItem = {
  name: "Embalming",
  cents: 0,
  fairCentsLow: 50000,
  fairCentsHigh: 90000, // midpoint = 70000
};

describe("overchargeCents", () => {
  it("returns the gap above the fair midpoint for a high item", () => {
    expect(overchargeCents({ ...base, cents: 120000, classification: "high" }))
      .toBe(50000); // 120000 - 70000
  });

  it("returns the gap for a predatory item", () => {
    expect(
      overchargeCents({ ...base, cents: 200000, classification: "predatory" }),
    ).toBe(130000);
  });

  it("returns 0 for an item within the fair range (never 'above fair')", () => {
    // 80000 is inside [50000, 90000] and classified fair — must not show a gap.
    expect(overchargeCents({ ...base, cents: 80000, classification: "fair" }))
      .toBe(0);
    expect(overchargeCents({ ...base, cents: 40000, classification: "good" }))
      .toBe(0);
  });

  it("returns 0 when there is no benchmark range", () => {
    expect(
      overchargeCents({
        name: "Mystery fee",
        cents: 99999,
        classification: "high",
      }),
    ).toBe(0);
  });

  it("never returns a negative number", () => {
    // Defensive: a high classification with cents below midpoint clamps to 0.
    expect(overchargeCents({ ...base, cents: 60000, classification: "high" }))
      .toBe(0);
  });
});

describe("ftcFlagFor", () => {
  const flags: DisplayFlag[] = [
    { severity: "violation", evidence: "Embalming" },
    { severity: "suspicious", evidence: "Basic services fee" },
    { severity: "info", evidence: "Metal casket" },
    { severity: "violation" }, // global rule, no evidence
  ];

  it("matches a violation by exact item name", () => {
    expect(ftcFlagFor({ name: "Embalming", cents: 1 }, flags)?.severity).toBe(
      "violation",
    );
  });

  it("matches a suspicious upsell by name", () => {
    expect(
      ftcFlagFor({ name: "Basic services fee", cents: 1 }, flags)?.severity,
    ).toBe("suspicious");
  });

  it("ignores info-level tips (they aren't problems)", () => {
    expect(ftcFlagFor({ name: "Metal casket", cents: 1 }, flags)).toBeUndefined();
  });

  it("ignores global findings with no evidence", () => {
    expect(ftcFlagFor({ name: "Anything", cents: 1 }, flags)).toBeUndefined();
  });

  it("returns undefined when there are no flags", () => {
    expect(ftcFlagFor({ name: "Embalming", cents: 1 }, undefined)).toBeUndefined();
  });
});
