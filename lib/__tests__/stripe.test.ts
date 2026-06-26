import { describe, it, expect } from "vitest";
import { fmtCents } from "@/lib/stripe";

// The consumer family fee is decommissioned (free to families). fmtCents stays
// for currency display on quotes/savings.
describe("fmtCents", () => {
  it("formats cents as whole-dollar USD", () => {
    expect(fmtCents(4900)).toBe("$49");
    expect(fmtCents(120000)).toBe("$1,200");
  });
});
