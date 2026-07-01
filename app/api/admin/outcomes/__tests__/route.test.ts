import { describe, it, expect } from "vitest";
import { hasRealOutcomeField } from "../route";

describe("hasRealOutcomeField (outcome_recorded_at gate)", () => {
  it("is false when only partnerId would be set (tagging alone isn't a resolved outcome)", () => {
    expect(hasRealOutcomeField({})).toBe(false);
  });

  it("is true when any real outcome field is present, including a null clear", () => {
    expect(hasRealOutcomeField({ satisfactionScore: 5 })).toBe(true);
    expect(hasRealOutcomeField({ amountPaidCents: 250000 })).toBe(true);
    expect(hasRealOutcomeField({ negotiatedPriceCents: 100000 })).toBe(true);
    // Explicitly clearing a field to null is still a real edit.
    expect(hasRealOutcomeField({ satisfactionScore: null })).toBe(true);
  });
});
