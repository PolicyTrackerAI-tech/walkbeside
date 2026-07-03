import { describe, it, expect } from "vitest";
import {
  dueMilestone,
  emailFor,
  markSent,
  MILESTONE_DAYS,
  MILESTONE_ORDER,
  type Milestone,
} from "@/lib/anniversary-emails";

const DAY = 24 * 3600 * 1000;
const T0 = Date.parse("2026-01-01T00:00:00Z"); // anchor: the date of death
const at = (days: number) => T0 + days * DAY;

describe("dueMilestone (bereavement cadence selection)", () => {
  it("sends nothing before the first milestone", () => {
    expect(dueMilestone(T0, [], at(0))).toBeNull();
    expect(dueMilestone(T0, [], at(29))).toBeNull();
  });

  it("walks the normal arc: 1mo → 3mo → 6mo → 1yr → 13mo, once each", () => {
    let sent: string[] = [];
    const arc: [number, Milestone][] = [
      [30, "1mo"],
      [90, "3mo"],
      [180, "6mo"],
      [365, "1yr"],
      [395, "13mo"],
    ];
    for (const [day, expected] of arc) {
      // The day before the milestone: nothing new is due.
      expect(dueMilestone(T0, sent, at(day - 1))).toBeNull();
      const due = dueMilestone(T0, sent, at(day));
      expect(due).toBe(expected);
      sent = markSent(sent, due!);
      // The very next day: nothing due (no double-send).
      expect(dueMilestone(T0, sent, at(day + 1))).toBeNull();
    }
    // The arc is closed forever.
    expect(dueMilestone(T0, sent, at(3000))).toBeNull();
  });

  it("regression: a late joiner gets ONLY the latest due milestone — never a stale earlier one on a later day", () => {
    // The old loop's real bug: at day 200 it sent "6mo", then on day 201 sent
    // the "it's been about a month" email, because 1mo was unsent and past due.
    const due = dueMilestone(T0, [], at(200));
    expect(due).toBe("6mo");
    const sent = markSent([], due!);
    expect(dueMilestone(T0, sent, at(201))).toBeNull();
    expect(dueMilestone(T0, sent, at(300))).toBeNull();
    // The arc resumes at the NEXT milestone, not a stale earlier one.
    expect(dueMilestone(T0, sent, at(365))).toBe("1yr");
  });

  it("returns null once the latest milestone is already recorded", () => {
    expect(dueMilestone(T0, ["13mo"], at(500))).toBeNull();
  });
});

describe("markSent", () => {
  it("records the milestone plus every earlier one (so none can fire late)", () => {
    expect(markSent([], "6mo")).toEqual(["1mo", "3mo", "6mo"]);
    expect(markSent([], "1mo")).toEqual(["1mo"]);
    expect(markSent([], "13mo")).toEqual(MILESTONE_ORDER);
  });

  it("dedupes and preserves existing entries", () => {
    expect(markSent(["1mo"], "3mo")).toEqual(["1mo", "3mo"]);
    expect(markSent(["1mo", "3mo", "6mo"], "1yr")).toEqual([
      "1mo",
      "3mo",
      "6mo",
      "1yr",
    ]);
  });
});

describe("emailFor (content guards)", () => {
  const UNSUB = "https://honestfuneral.co/preferences/abc";

  it("every milestone has a subject, body, and the unsubscribe link", () => {
    for (const m of MILESTONE_ORDER) {
      const { subject, text } = emailFor(m, UNSUB);
      expect(subject.length).toBeGreaterThan(0);
      expect(text.length).toBeGreaterThan(100);
      expect(text).toContain(UNSUB);
    }
  });

  it("never references the decommissioned fee model", () => {
    for (const m of MILESTONE_ORDER) {
      const { text } = emailFor(m, UNSUB);
      expect(text).not.toContain("$49");
      expect(text).not.toContain("$199");
      expect(text.toLowerCase()).not.toContain("refund situation");
    }
    // The 1mo bill-mismatch help is reframed to the free model.
    expect(emailFor("1mo", UNSUB).text).toContain("we'll help you push back");
  });

  it("3mo carries the hospice bereavement-benefit entitlement (42 CFR 418.64 window)", () => {
    const { text } = emailFor("3mo", UNSUB);
    expect(text.toLowerCase()).toContain("hospice");
    expect(text).toContain("thirteen months");
    expect(text).toContain("/grief");
    expect(text.toLowerCase()).toContain("at no cost");
  });

  it("13mo closes the arc and points to real human help", () => {
    const { text } = emailFor("13mo", UNSUB);
    expect(text).toContain("last automated note");
    expect(text.toLowerCase()).toContain("grief counselor");
    expect(text).toContain("/grief");
  });

  it("milestone windows span the ~13-month Medicare bereavement window", () => {
    expect(MILESTONE_DAYS["1mo"]).toBe(30);
    expect(MILESTONE_DAYS["13mo"]).toBe(395);
    // Strictly increasing — the ordering assumption dueMilestone relies on.
    for (let i = 1; i < MILESTONE_ORDER.length; i++) {
      expect(MILESTONE_DAYS[MILESTONE_ORDER[i]]).toBeGreaterThan(
        MILESTONE_DAYS[MILESTONE_ORDER[i - 1]],
      );
    }
  });
});


describe("recurring bereavement-benefit nudge", () => {
  it("the entitlement reminder appears at 3mo, 6mo, and 13mo — recurring, not one-shot", () => {
    for (const m of ["3mo", "6mo", "13mo"] as const) {
      const { text } = emailFor(m, "https://x/unsub");
      expect(text.toLowerCase()).toContain("bereavement");
      expect(text.toLowerCase()).toMatch(/hospice/);
    }
    // And it never promises counseling FROM US — we point at the hospice's own benefit.
    for (const m of ["3mo", "6mo", "13mo"] as const) {
      const { text } = emailFor(m, "https://x/unsub");
      expect(text).not.toMatch(/our counselors|we offer counseling|counseling from us/i);
    }
  });
});
