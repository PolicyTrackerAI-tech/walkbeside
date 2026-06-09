import { describe, it, expect } from "vitest";
import { FLAT_FEE_CENTS, calcFeeCents, fmtCents } from "@/lib/stripe";

// P0: the fee must be exactly $49 = 4900 cents, everywhere.
describe("stripe fee", () => {
  it("FLAT_FEE_CENTS is 4900 ($49)", () => {
    expect(FLAT_FEE_CENTS).toBe(4900);
  });

  it("calcFeeCents() returns 4900", () => {
    expect(calcFeeCents()).toBe(4900);
  });

  it("formats 4900 cents as $49", () => {
    expect(fmtCents(4900)).toBe("$49");
  });
});
