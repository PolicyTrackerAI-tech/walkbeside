import { describe, it, expect } from "vitest";
import { FREE_FOR_EVERY_FAMILY, FREE_WITH_OR_WITHOUT_LINK } from "@/lib/copy";

/**
 * Copy law. Both sentences are reviewed, verbatim strings rendered to grieving
 * families — an edit here is a copy decision, not a refactor, so it has to
 * break a test loudly. They answer DIFFERENT questions for DIFFERENT readers
 * (no referral at all vs. arrived through a hospice hand-off) and have been
 * mistaken for duplicates before; the inequality assertion is the guard
 * against a well-meaning "harmonization".
 */
describe("verbatim copy constants", () => {
  it("renders the free-for-every-family sentence exactly", () => {
    expect(FREE_FOR_EVERY_FAMILY).toBe(
      "Everything here is free for every family — no referral, no code, no link needed.",
    );
  });

  it("renders the free-with-or-without-a-link sentence exactly", () => {
    expect(FREE_WITH_OR_WITHOUT_LINK).toBe(
      "Everything here is free for you — with or without this link.",
    );
  });

  it("keeps the two sentences distinct and non-empty", () => {
    expect(FREE_FOR_EVERY_FAMILY).not.toBe(FREE_WITH_OR_WITHOUT_LINK);
    expect(FREE_FOR_EVERY_FAMILY.trim().length).toBeGreaterThan(0);
    expect(FREE_WITH_OR_WITHOUT_LINK.trim().length).toBeGreaterThan(0);
  });

  it("uses a real em-dash, never a hyphen or an HTML entity", () => {
    for (const sentence of [FREE_FOR_EVERY_FAMILY, FREE_WITH_OR_WITHOUT_LINK]) {
      expect(sentence).toContain("—");
      expect(sentence).not.toContain("&mdash;");
      expect(sentence).not.toMatch(/\s-\s/);
    }
  });
});
