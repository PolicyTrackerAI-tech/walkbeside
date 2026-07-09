import { describe, expect, it } from "vitest";
import { reconcileTotalQuoted } from "../analyzer-totals";

describe("reconcileTotalQuoted", () => {
  it("uses the item sum when no stated total exists", () => {
    expect(reconcileTotalQuoted(null, 1_897_500)).toBe(1_897_500);
    expect(reconcileTotalQuoted(undefined, 1_897_500)).toBe(1_897_500);
  });

  it("rejects a hallucinated stated total below the parsed item sum", () => {
    // The production failure this guards: a list with no total line came back
    // from the model with total_cents $1,899 against $18,975 of parsed items,
    // clamping the displayed fair total to $0.
    expect(reconcileTotalQuoted(189_900, 1_897_500)).toBe(1_897_500);
  });

  it("rejects a stated total wildly above the parsed item sum", () => {
    expect(reconcileTotalQuoted(10_000_000, 1_897_500)).toBe(1_897_500);
  });

  it("accepts a stated total moderately above the item sum (unparsed lines)", () => {
    // A real GPL total can exceed the parsed sum when OCR dropped lines —
    // that's still money the family pays, and coverage flags the partial read.
    expect(reconcileTotalQuoted(2_100_000, 1_897_500)).toBe(2_100_000);
  });

  it("accepts a stated total equal to the item sum", () => {
    expect(reconcileTotalQuoted(1_897_500, 1_897_500)).toBe(1_897_500);
  });

  it("falls back to the stated total when nothing was parsed", () => {
    expect(reconcileTotalQuoted(500_000, 0)).toBe(500_000);
    expect(reconcileTotalQuoted(null, 0)).toBe(0);
  });
});
