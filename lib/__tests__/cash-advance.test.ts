import { describe, it, expect } from "vitest";
import {
  markupSummary,
  markupLetter,
  rowComplete,
  type MarkupRow,
} from "@/lib/cash-advance";

/**
 * The whole value of this tool is that its number is PROVEN — billed minus
 * the vendor's own receipt — so the math must be exact, refunds must never
 * offset markups, and the letter must never claim illegality (the FTC Rule
 * regulates disclosure of cash-advance charges, not the markup itself).
 */

const flowers: MarkupRow = { name: "Flowers — casket spray", chargedCents: 26000, vendorCents: 18000 };
const obituary: MarkupRow = { name: "Newspaper obituary", chargedCents: 45000, vendorCents: 45000 };
const clergy: MarkupRow = { name: "Clergy honorarium", chargedCents: 20000, vendorCents: 25000 };

describe("markupSummary", () => {
  it("computes the exact per-row markup and percentage", () => {
    const s = markupSummary([flowers]);
    expect(s.rows[0].markupCents).toBe(8000);
    expect(s.rows[0].markupPct).toBe(44);
    expect(s.rows[0].atCost).toBe(false);
  });

  it("an at-cost row is a good sign, not a $0 flag", () => {
    const s = markupSummary([obituary]);
    expect(s.rows[0].atCost).toBe(true);
    expect(s.markedUp).toHaveLength(0);
  });

  it("a row billed BELOW the receipt never offsets other markups", () => {
    const s = markupSummary([flowers, clergy]);
    // clergy billed $50 under receipt; total markup must stay $80, not $30.
    expect(s.totalMarkupCents).toBe(8000);
    expect(s.markedUp.map((r) => r.name)).toEqual(["Flowers — casket spray"]);
  });

  it("incomplete rows are ignored entirely", () => {
    const s = markupSummary([
      { name: "", chargedCents: 1000, vendorCents: 500 },
      { name: "Flowers", chargedCents: 0, vendorCents: 500 },
      flowers,
    ]);
    expect(s.rows).toHaveLength(1);
    expect(rowComplete(flowers)).toBe(true);
  });

  it("sorts marked-up rows largest first", () => {
    const s = markupSummary([
      { name: "Small", chargedCents: 3000, vendorCents: 2500 },
      flowers,
    ]);
    expect(s.markedUp[0].name).toBe("Flowers — casket spray");
  });
});

describe("markupLetter", () => {
  it("grounds every number in the rows and never claims illegality", () => {
    const letter = markupLetter(markupSummary([flowers, obituary]), "Sunset Funeral Home");
    expect(letter).toContain("Sunset Funeral Home");
    expect(letter).toContain("$260");
    expect(letter).toContain("$180");
    expect(letter).toContain("Total documented difference: $80");
    // The Rule regulates disclosure, not the markup — the letter asks, never accuses.
    expect(letter.toLowerCase()).not.toMatch(/illegal|violation|fraud|unlawful/);
    // At-cost rows never appear as grievances.
    expect(letter).not.toContain("Newspaper obituary");
  });
});
