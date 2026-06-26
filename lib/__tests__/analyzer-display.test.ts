import { describe, it, expect } from "vitest";
import {
  overchargeCents,
  ftcFlagFor,
  savingsBreakdown,
  fallbackAdvocacySummary,
  buildShareText,
  type DisplayItem,
  type DisplayFlag,
  type RangeAwareItem,
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

  it("judges per-unit items by their per-each price (qty-aware)", () => {
    // Death certs: fair $10–$25 each (mid $17.50). $250 total for 10 = $25 each,
    // which is at the top of fair → not high → $0 over, never a $225 overcharge.
    const cert = { name: "Death certificates", fairCentsLow: 1000, fairCentsHigh: 2500 };
    expect(
      overchargeCents({ ...cert, cents: 25000, qty: 10, classification: "fair" }),
    ).toBe(0);
    // $400 total for 10 = $40 each (above the $25 top, below $50 predatory) → high.
    // Overcharge = ($40 − $17.50 mid) × 10 = $225.
    expect(
      overchargeCents({ ...cert, cents: 40000, qty: 10, classification: "high" }),
    ).toBe(22500);
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

describe("savingsBreakdown", () => {
  const items: RangeAwareItem[] = [
    // Overpriced AND flagged as a violation → counts to negotiate + decline.
    {
      name: "Embalming",
      cents: 120000,
      classification: "high",
      fairCentsLow: 50000,
      fairCentsHigh: 90000, // mid 70000 → over 50000
    },
    // Overpriced, no flag → negotiate only.
    {
      name: "Basic services fee",
      cents: 400000,
      classification: "predatory",
      fairCentsLow: 150000,
      fairCentsHigh: 250000, // mid 200000 → over 200000
    },
    // Within range → no lever.
    {
      name: "Hearse",
      cents: 30000,
      classification: "fair",
      fairCentsLow: 25000,
      fairCentsHigh: 40000,
    },
    // Selection merchandise → third-party.
    { name: "Caskets", cents: 120000, isRange: true },
  ];
  const flags: DisplayFlag[] = [{ severity: "violation", evidence: "Embalming" }];

  it("sums negotiate dollars from overpriced fixed items only", () => {
    const b = savingsBreakdown(items, flags);
    expect(b.negotiateCents).toBe(250000); // 50000 + 200000
    expect(b.negotiateCount).toBe(2);
  });

  it("counts third-party merchandise and declinable (violation-flagged) items", () => {
    const b = savingsBreakdown(items, flags);
    expect(b.thirdPartyCount).toBe(1);
    expect(b.declineCount).toBe(1);
  });

  it("is all-zero for a clean, in-range quote", () => {
    expect(savingsBreakdown([items[2]], undefined)).toEqual({
      negotiateCents: 0,
      negotiateCount: 0,
      thirdPartyCount: 0,
      declineCount: 0,
    });
  });
});

describe("fallbackAdvocacySummary", () => {
  const overpriced: RangeAwareItem = {
    name: "Embalming",
    cents: 120000,
    classification: "high",
    fairCentsLow: 50000,
    fairCentsHigh: 90000,
  };

  it("never returns a blank summary, even with no findings", () => {
    const s = fallbackAdvocacySummary({
      items: [],
      violations: [],
      potentialSavings: 0,
    });
    expect(s.bottomLine).toContain("in line with fair pricing");
    expect(s.reassurance.length).toBeGreaterThan(0);
    expect(Array.isArray(s.moves)).toBe(true);
  });

  it("leads with the overcharge dollars and the violation count", () => {
    const s = fallbackAdvocacySummary({
      items: [overpriced],
      violations: [
        {
          severity: "violation",
          title: "Embalming claimed required",
          whatToSay: "Ask for the statute.",
        },
      ],
      potentialSavings: 50000,
    });
    expect(s.bottomLine).toContain("$500");
    expect(s.bottomLine).toContain("1 item");
    // A violation move (with its script) and a push-back move are present.
    expect(s.moves[0].detail).toBe("Ask for the statute.");
    expect(s.moves.some((m) => m.title.includes("Push back on Embalming"))).toBe(
      true,
    );
  });

  it("adds a third-party move when there's selection merchandise", () => {
    const s = fallbackAdvocacySummary({
      items: [{ name: "Caskets", cents: 100000, isRange: true }],
      violations: [],
      potentialSavings: 0,
    });
    expect(s.moves.some((m) => m.title.includes("third party"))).toBe(true);
  });

  it("caps moves at 5", () => {
    const many: FallbackInputViolation[] = Array.from({ length: 8 }, (_, i) => ({
      severity: "suspicious" as const,
      title: `Upsell ${i}`,
    }));
    const s = fallbackAdvocacySummary({
      items: [],
      violations: many,
      potentialSavings: 0,
    });
    expect(s.moves.length).toBeLessThanOrEqual(5);
  });
});

type FallbackInputViolation = {
  title: string;
  severity: "violation" | "suspicious" | "info";
  whatToSay?: string;
};

describe("buildShareText", () => {
  const txt = buildShareText({
    items: [
      {
        name: "Metal casket",
        cents: 380000,
        classification: "high",
        fairCentsLow: 150000,
        fairCentsHigh: 200000,
      },
      { name: "Urns", cents: 20000, isRange: true, centsLow: 20000, centsHigh: 200000 },
    ],
    totalQuoted: 380000,
    totalFairMid: 175000,
    potentialSavings: 205000,
    violations: [
      {
        title: "Casket on a direct-cremation quote",
        severity: "violation",
        whatToSay: "Please remove the casket.",
      },
    ],
    summary: {
      bottomLine: "This quote runs about $2,050 above fair.",
      moves: [{ title: "Push back on the casket", detail: "Ask them to match fair." }],
    },
    sourceNote: "Based on national benchmarks adjusted for your region — an estimate.",
  });

  it("leads with the headline overcharge and the quoted/fair totals", () => {
    expect(txt).toContain("ESTIMATED $2,050 ABOVE FAIR");
    expect(txt).toContain("Quoted $3,800");
  });

  it("includes line items, the third-party tip, findings and the script", () => {
    expect(txt).toContain("Metal casket: $3,800");
    expect(txt).toContain("+$2,050 above fair");
    expect(txt).toContain("buy third-party");
    expect(txt).toContain("[Possible FTC issue] Casket on a direct-cremation quote");
    expect(txt).toContain('What to say: "Please remove the casket."');
  });

  it("carries the what-we'd-do summary and the neutrality footer", () => {
    expect(txt).toContain("WHAT WE'D DO");
    expect(txt).toContain("1. Push back on the casket");
    expect(txt).toContain("takes no money from funeral homes or insurers");
  });
});
