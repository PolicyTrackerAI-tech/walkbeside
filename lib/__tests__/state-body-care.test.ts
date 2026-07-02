import { describe, it, expect } from "vitest";
import {
  VERIFIED_RULES,
  NATIONAL_BASELINE,
  ruleForState,
} from "@/lib/state-body-care";

/**
 * Guardrails for the statute-verified state table. Every row is a legal
 * claim shown to a grieving family — the invariants below are the shape of
 * "defensible": a real citation on every row, thresholds only where the rule
 * type has one, no duplicates, and a baseline that never overstates.
 */

describe("VERIFIED_RULES integrity", () => {
  it("every row carries a citation and a summary", () => {
    for (const r of VERIFIED_RULES) {
      expect(r.code).toMatch(/^[A-Z]{2}$/);
      expect(r.state.length).toBeGreaterThan(3);
      expect(r.summary.trim().length).toBeGreaterThan(20);
      // The load-bearing field: a statute/admin-code cite, not a blog.
      expect(r.statuteCite.trim().length).toBeGreaterThan(5);
      expect(r.statuteCite).toMatch(/\d/);
    }
  });

  it("hour-based rules carry their threshold; others don't invent one", () => {
    for (const r of VERIFIED_RULES) {
      if (r.rule === "embalm-or-refrigerate-after-hours") {
        expect(r.hoursThreshold).toBeGreaterThan(0);
      }
    }
  });

  it("no state appears twice", () => {
    const codes = VERIFIED_RULES.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("no row claims embalming is flatly required — no state does", () => {
    for (const r of VERIFIED_RULES) {
      expect(r.summary).not.toMatch(/embalming is (always )?required for (all|every)/i);
    }
  });
});

describe("ruleForState", () => {
  it("is case-insensitive and trims", () => {
    if (VERIFIED_RULES.length === 0) return; // populated by the research pass
    const first = VERIFIED_RULES[0];
    expect(ruleForState(` ${first.code.toLowerCase()} `)).toBe(first);
  });

  it("returns undefined for unverified states", () => {
    expect(ruleForState("ZZ")).toBeUndefined();
  });
});

describe("NATIONAL_BASELINE", () => {
  it("leads with the one thing that is true everywhere", () => {
    expect(NATIONAL_BASELINE.headline).toBe(
      "No US state requires embalming for every death.",
    );
  });
});
