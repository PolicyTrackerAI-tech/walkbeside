import { describe, it, expect } from "vitest";
import {
  selfCheckResult,
  STATEMENTS,
  type Frequency,
} from "@/lib/grief-selfcheck";

/**
 * The self-check is reflection, not diagnosis — these tests pin the safety
 * properties: early grief can never produce an alarming read, no result text
 * ever claims to diagnose, and the heaviest path routes to humans.
 */

const all = (f: Frequency) => STATEMENTS.map(() => f);

describe("selfCheckResult", () => {
  it("under 6 months, even maximal answers read as expected grief — never alarming", () => {
    const r = selfCheckResult(all("most-days"), "under-6mo");
    expect(r.tone).toBe("early");
    expect(r.body).toContain("expected");
    expect(r.body.toLowerCase()).not.toContain("disorder is");
  });

  it("a persistent heavy pattern past 12 months routes to real support", () => {
    const r = selfCheckResult(all("most-days"), "over-12mo");
    expect(r.tone).toBe("please-reach-out");
    expect(r.body).toContain("treatable");
    expect(r.body).toContain("only a person can do that");
  });

  it("several heavy items at 6–12 months suggests a conversation, gently", () => {
    const answers = [
      ...all("rarely").slice(0, 6),
      "most-days",
      "most-days",
      "most-days",
    ] as Frequency[];
    const r = selfCheckResult(answers, "6-12mo");
    expect(r.tone).toBe("worth-a-conversation");
    // The framing must reassure, not pathologize.
    expect(r.body).toContain("doesn't mean something is wrong with you");
  });

  it("a light pattern normalizes without dismissing", () => {
    const r = selfCheckResult(all("sometimes"), "over-12mo");
    expect(r.tone).toBe("steady");
  });

  it("no result text ever claims a diagnosis", () => {
    for (const duration of ["under-6mo", "6-12mo", "over-12mo"] as const) {
      for (const f of ["rarely", "sometimes", "most-days"] as const) {
        const r = selfCheckResult(all(f), duration);
        expect(r.body.toLowerCase()).not.toMatch(/you have prolonged grief|we diagnose|this diagnosis/);
      }
    }
  });
});
