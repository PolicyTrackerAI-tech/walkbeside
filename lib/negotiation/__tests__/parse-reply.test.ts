import { describe, it, expect } from "vitest";
import { interpretQuotePayload } from "@/lib/negotiation/parse-reply";

// interpretQuotePayload is the pure half of the inbound parse (the Claude
// call is a thin wrapper around it) — everything questionable must come back
// null: the family just types the quote in as before. Silence over wrong.

describe("interpretQuotePayload", () => {
  it("accepts a consistent itemized quote", () => {
    const p = interpretQuotePayload({
      items: [
        { name: "Basic services fee", cents: 249500 },
        { name: "Direct cremation", cents: 150000 },
      ],
      total_cents: 399500,
      currency: "USD",
    });
    expect(p).not.toBeNull();
    expect(p!.cents).toBe(399500);
    expect(p!.items).toHaveLength(2);
    expect(p!.confidence).toBeGreaterThan(0.5);
  });

  it("accepts a bare all-in total with no items", () => {
    const p = interpretQuotePayload({ items: [], total_cents: 399500 });
    expect(p).not.toBeNull();
    expect(p!.cents).toBe(399500);
    expect(p!.items).toHaveLength(0);
  });

  it("declines a stated total far below the item sum (ambiguous)", () => {
    // Could be a misparse, could be a discount we can't verify — either way
    // we can't tell which number is the quote. Silence over wrong.
    expect(
      interpretQuotePayload({
        items: [
          { name: "Services", cents: 300000 },
          { name: "Casket", cents: 200000 },
        ],
        total_cents: 189900,
      }),
    ).toBeNull();
  });

  it("trusts a small stated discount below the item sum", () => {
    const p = interpretQuotePayload({
      items: [
        { name: "Services", cents: 100000 },
        { name: "Casket", cents: 200000 },
      ],
      total_cents: 285000, // ~5% below the sum — a plausible package price
    });
    expect(p).not.toBeNull();
    expect(p!.cents).toBe(285000);
  });

  it("trusts the stated all-in total over a partial itemization", () => {
    // The routine email shape: one example line plus the real all-in figure.
    // Proposing the item sum here ($1,000) would be materially wrong.
    const p = interpretQuotePayload({
      items: [{ name: "Casket", cents: 100000 }],
      total_cents: 399500,
    });
    expect(p).not.toBeNull();
    expect(p!.cents).toBe(399500);
  });

  it("declines when a fuller itemization is wildly contradicted by the total", () => {
    expect(
      interpretQuotePayload({
        items: [
          { name: "Basic services", cents: 40000 },
          { name: "Transfer", cents: 30000 },
          { name: "Refrigeration", cents: 30000 },
        ],
        total_cents: 500000, // 5x the sum of a complete-looking itemization
      }),
    ).toBeNull();
  });

  it("declines non-USD quotes", () => {
    expect(
      interpretQuotePayload({
        items: [{ name: "Service", cents: 300000 }],
        total_cents: 300000,
        currency: "CAD",
      }),
    ).toBeNull();
  });

  it("accepts an explicit USD currency", () => {
    expect(
      interpretQuotePayload({
        items: [{ name: "Service", cents: 300000 }],
        total_cents: 300000,
        currency: "usd",
      }),
    ).not.toBeNull();
  });

  it("declines implausibly small and large totals", () => {
    expect(interpretQuotePayload({ items: [], total_cents: 2500 })).toBeNull(); // $25
    expect(
      interpretQuotePayload({ items: [], total_cents: 25_000_000 }),
    ).toBeNull(); // $250k
  });

  it("declines junk payloads", () => {
    expect(interpretQuotePayload(null)).toBeNull();
    expect(interpretQuotePayload("not an object")).toBeNull();
    expect(interpretQuotePayload({})).toBeNull();
    expect(interpretQuotePayload({ items: [], total_cents: null })).toBeNull();
  });

  it("filters malformed items and keeps the valid ones", () => {
    const p = interpretQuotePayload({
      items: [
        { name: "Embalming", cents: 89500 },
        { name: "", cents: 100 }, // no name
        { name: "Negative", cents: -5 },
        { name: "NaN", cents: "895" }, // wrong type
        { cents: 89500 }, // missing name
      ],
      total_cents: 89500,
    });
    expect(p).not.toBeNull();
    expect(p!.items).toEqual([{ name: "Embalming", cents: 89500 }]);
  });

  it("caps stored items and truncates absurd names", () => {
    const items = Array.from({ length: 60 }, (_, i) => ({
      name: `Item ${i} ${"x".repeat(300)}`,
      cents: 10000,
    }));
    const p = interpretQuotePayload({ items, total_cents: 600000 });
    expect(p).not.toBeNull();
    expect(p!.items.length).toBeLessThanOrEqual(40);
    expect(p!.items[0].name.length).toBeLessThanOrEqual(200);
  });

  it("rounds fractional cents from the model", () => {
    const p = interpretQuotePayload({
      items: [{ name: "Service", cents: 300000.4 }],
      total_cents: 300000.4,
    });
    expect(p).not.toBeNull();
    expect(Number.isInteger(p!.cents)).toBe(true);
    expect(p!.items[0].cents).toBe(300000);
  });
});
