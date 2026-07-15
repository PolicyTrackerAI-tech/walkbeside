import { describe, it, expect } from "vitest";
import {
  extractionConfidence,
  NAIVE_EXTRACTION_CONFIDENCE,
} from "@/lib/extraction-confidence";

describe("extractionConfidence", () => {
  it("returns 0 when nothing was extracted", () => {
    expect(
      extractionConfidence({ itemCount: 0, statedTotalCents: null, itemSumCents: 0 }),
    ).toBe(0);
  });

  it("returns a weak-but-usable score for a bare stated total", () => {
    // "Our all-in price is $3,995" — no itemization.
    expect(
      extractionConfidence({
        itemCount: 0,
        statedTotalCents: 399500,
        itemSumCents: 0,
      }),
    ).toBe(0.35);
  });

  it("scores a consistent itemized parse highest", () => {
    // 5+ items whose sum matches the stated total exactly.
    expect(
      extractionConfidence({
        itemCount: 6,
        statedTotalCents: 500000,
        itemSumCents: 500000,
      }),
    ).toBe(1);
  });

  it("rewards a moderately-above stated total less than an exact match", () => {
    const exact = extractionConfidence({
      itemCount: 4,
      statedTotalCents: 100000,
      itemSumCents: 100000,
    });
    const above = extractionConfidence({
      itemCount: 4,
      statedTotalCents: 130000, // unparsed lines are plausible
      itemSumCents: 100000,
    });
    expect(above).toBeLessThan(exact);
    expect(above).toBeGreaterThan(0.5);
  });

  it("penalizes a stated total that contradicts the items", () => {
    const contradicted = extractionConfidence({
      itemCount: 4,
      statedTotalCents: 1_000_000, // 10x the item sum
      itemSumCents: 100000,
    });
    const unstated = extractionConfidence({
      itemCount: 4,
      statedTotalCents: null,
      itemSumCents: 100000,
    });
    expect(contradicted).toBeLessThan(unstated);
  });

  it("treats a missing stated total as mildly positive", () => {
    expect(
      extractionConfidence({
        itemCount: 3,
        statedTotalCents: null,
        itemSumCents: 250000,
      }),
    ).toBeCloseTo(0.72, 2);
  });

  it("caps the item-count bonus at five items", () => {
    const five = extractionConfidence({
      itemCount: 5,
      statedTotalCents: null,
      itemSumCents: 100,
    });
    const fifty = extractionConfidence({
      itemCount: 50,
      statedTotalCents: null,
      itemSumCents: 100,
    });
    expect(fifty).toBe(five);
  });

  it("stays within [0, 1]", () => {
    expect(
      extractionConfidence({
        itemCount: 100,
        statedTotalCents: 100,
        itemSumCents: 100,
      }),
    ).toBeLessThanOrEqual(1);
  });

  it("exports the fixed naive-parser score", () => {
    expect(NAIVE_EXTRACTION_CONFIDENCE).toBe(0.3);
  });
});
