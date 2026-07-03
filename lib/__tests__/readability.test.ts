import { describe, it, expect } from "vitest";
import { fleschKincaidGrade, countSyllables, stripNonProse } from "@/lib/readability";
import { emailFor, smsFor, MILESTONE_ORDER } from "@/lib/anniversary-emails";
import { benefitSweep } from "@/lib/plan-now";
import { STATEMENTS, selfCheckResult } from "@/lib/grief-selfcheck";
import { buildDigestEmail } from "@/lib/family-digest";
import { NATIONAL_BASELINE } from "@/lib/state-body-care";
import { FEDERAL_BASELINE } from "@/lib/merp-by-state";

/**
 * The readability gate (roadmap Phase 5). Acute grief measurably impairs
 * reading comprehension, so family-facing copy targets Flesch-Kincaid grade
 * 6–8. The CEILING here is 8.5 (heuristic noise buffer). Two rules for
 * whoever trips this gate later:
 *   1. Fix it by SHORTENING SENTENCES, never by stripping the hedges that
 *      make a claim defensible ("usually", "in most states", "confirm
 *      with...") — hedges are short words and barely move the score.
 *   2. Citations, URLs, and statute references are already excluded from
 *      scoring (stripNonProse) — don't exclude more to pass.
 */

const CEILING = 8.5;

const SOURCES: Record<string, string> = {
  "anniversary emails": MILESTONE_ORDER.map((m) => emailFor(m, "https://x").text).join("\n"),
  "anniversary sms": MILESTONE_ORDER.map((m) => smsFor(m, "https://x")).join("\n"),
  "benefit sweep": benefitSweep({
    veteran: "yes", onSocialSecurity: "yes", lifeInsurance: "unsure", onMedicaid: "yes", wasEmployed: "yes",
  }).map((b) => `${b.title}. ${b.detail}`).join("\n"),
  "grief self-check": [
    ...STATEMENTS,
    ...(["under-6mo", "6-12mo", "over-12mo"] as const).flatMap((d) =>
      (["rarely", "most-days"] as const).map((f) => {
        const r = selfCheckResult(STATEMENTS.map(() => f), d);
        return `${r.heading} ${r.body}`;
      }),
    ),
  ].join("\n"),
  "family digest": buildDigestEmail({
    assigneeName: "Mike", senderName: "Sarah",
    items: [{ kind: "task", title: "Forward their mail" }],
  }).text,
  "state body-care baseline": `${NATIONAL_BASELINE.headline} ${NATIONAL_BASELINE.detail}`,
  "merp federal baseline": `${FEDERAL_BASELINE.headline} ${FEDERAL_BASELINE.points.join(" ")}`,
};

describe("readability gate — family-facing copy stays middle-school readable", () => {
  for (const [name, text] of Object.entries(SOURCES)) {
    it(`${name} ≤ grade ${CEILING}`, () => {
      const grade = fleschKincaidGrade(text);
      expect(grade, `${name} scored grade ${grade}; shorten sentences (never strip hedges)`).toBeLessThanOrEqual(CEILING);
    });
  }
});

describe("the scorer itself", () => {
  it("counts syllables plausibly", () => {
    expect(countSyllables("cat")).toBe(1);
    expect(countSyllables("water")).toBe(2);
    expect(countSyllables("refrigeration")).toBeGreaterThanOrEqual(4);
  });

  it("excludes citations and URLs from scoring, not prose", () => {
    const stripped = stripNonProse("See 42 CFR 418.64 for details. Call +1 (385) 553-1141 or visit honestfuneral.co/grief today.");
    expect(stripped).not.toContain("CFR");
    expect(stripped).not.toContain("553");
    expect(stripped).toContain("Call");
  });

  it("simple text scores lower than dense text", () => {
    const simple = "We help. You rest. The plan is short. It works.";
    const dense = "Notwithstanding aforementioned considerations, comprehensive institutional documentation methodologies necessitate extraordinarily deliberate organizational infrastructure.";
    expect(fleschKincaidGrade(simple)).toBeLessThan(fleschKincaidGrade(dense));
  });
});
