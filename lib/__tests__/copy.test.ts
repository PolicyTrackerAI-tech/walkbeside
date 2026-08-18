import { describe, it, expect } from "vitest";
import {
  FREE_FOR_EVERY_FAMILY,
  FREE_WITH_OR_WITHOUT_LINK,
  NOT_A_FUNERAL_HOME,
} from "@/lib/copy";

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

  /**
   * The role sentence (audit A8, per docs/legal/UTAH_CLEARANCE_DRAFT.md §4,
   * PR #184). Wording may be tightened only if all three substance elements
   * survive — the element assertions below are the law, the exact-string
   * assertion is the tripwire that makes any edit a deliberate decision.
   */
  it("renders the role sentence exactly", () => {
    expect(NOT_A_FUNERAL_HOME).toBe(
      "Honest Funeral is not a funeral home or funeral director. We do not arrange funerals or handle remains. Your family contracts directly with the funeral home you choose.",
    );
  });

  it("keeps all three substance elements of the role sentence", () => {
    expect(NOT_A_FUNERAL_HOME).toMatch(/not a funeral home or funeral director/i);
    expect(NOT_A_FUNERAL_HOME).toMatch(/do not arrange funerals or handle remains/i);
    expect(NOT_A_FUNERAL_HOME).toMatch(/contracts directly with the funeral home/i);
  });
});
