import { describe, it, expect } from "vitest";
import {
  VERIFIED_MERP,
  FEDERAL_BASELINE,
  merpForState,
} from "@/lib/merp-by-state";

/**
 * Guardrails for the MERP table — every row is legal guidance shown to a
 * family that may be at risk of losing a house. Same invariants as the
 * state-body-care table: real citation on every row, no duplicates, no
 * invented deadlines, and a federal baseline that stays calm and true.
 */

describe("VERIFIED_MERP integrity", () => {
  it("every row carries a citation, agency, and both summaries", () => {
    for (const r of VERIFIED_MERP) {
      expect(r.code).toMatch(/^[A-Z]{2}$/);
      expect(r.scopeSummary.trim().length).toBeGreaterThan(20);
      expect(r.hardshipSummary.trim().length).toBeGreaterThan(20);
      expect(r.agencyName.trim().length).toBeGreaterThan(3);
      expect(r.statuteCite.trim().length).toBeGreaterThan(5);
      expect(r.statuteCite).toMatch(/\d/);
    }
  });

  it("no state appears twice", () => {
    const codes = VERIFIED_MERP.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("notice summaries never ship as a bare guess — they carry a number or say none exists", () => {
    for (const r of VERIFIED_MERP) {
      if (r.noticeSummary) {
        expect(r.noticeSummary).toMatch(/\d|no codified|not codified|no set|varies/i);
      }
    }
  });

  it("no row tells a family they personally owe the debt", () => {
    for (const r of VERIFIED_MERP) {
      const all = `${r.scopeSummary} ${r.hardshipSummary} ${r.noticeSummary ?? ""}`;
      expect(all).not.toMatch(/family (must|is required to) pay|heirs? (are|is) personally liable/i);
    }
  });
});

describe("VERIFIED_MERP register-contamination guard (audit A7)", () => {
  // Audit A7 found the adversarial-verification pass's FEEDBACK notes pasted
  // into this register as if they were the family-facing content — a grieving
  // family picking their state saw editor instructions ("Same as drafted,
  // with two refinements…") instead of the state's rules. Every field here
  // renders verbatim through StateMerp.tsx, so verifier/editor voice must
  // never appear in any of them. If a future verification pass leaks its
  // notes into the data again, this trips.
  const VERIFIER_VOICE =
    /as drafted|Optional (enrichment|precision|tightening)|Accurate as written|Accurate as far as|Minor precision|Do NOT|do not cite|confirmed (verbatim|as claimed|unchanged)|Consider adding|Suggest '/;

  it("no field carries verifier voice instead of family-facing prose", () => {
    const hits: string[] = [];
    for (const r of VERIFIED_MERP) {
      for (const [field, value] of Object.entries(r)) {
        if (typeof value !== "string") continue;
        const m = value.match(VERIFIER_VOICE);
        if (m) hits.push(`${r.code}.${field} contains "${m[0]}"`);
      }
    }
    expect(hits).toEqual([]);
  });
});

describe("FEDERAL_BASELINE", () => {
  it("leads with the fact that stops the panic", () => {
    expect(FEDERAL_BASELINE.headline).toContain("never a bill your family personally owes");
    expect(FEDERAL_BASELINE.cite).toContain("1396p");
  });

  it("names all three federal deferral categories", () => {
    const text = FEDERAL_BASELINE.points.join(" ");
    expect(text).toMatch(/surviving spouse/i);
    expect(text).toMatch(/under 21/);
    expect(text).toMatch(/blind or disabled/i);
    expect(text).toMatch(/hardship/i);
  });
});

describe("merpForState", () => {
  it("is case-insensitive and returns undefined for unknown codes", () => {
    expect(merpForState("zz")).toBeUndefined();
    if (VERIFIED_MERP.length > 0) {
      const first = VERIFIED_MERP[0];
      expect(merpForState(` ${first.code.toLowerCase()} `)).toBe(first);
    }
  });
});
