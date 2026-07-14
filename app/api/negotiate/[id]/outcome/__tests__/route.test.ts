import { describe, it, expect } from "vitest";
import { buildOutcomePatch, mergeSurpriseFees } from "../route";

const NOW = "2026-07-14T00:00:00.000Z";

describe("buildOutcomePatch", () => {
  it("writes only the score when the family sends satisfaction alone", () => {
    expect(buildOutcomePatch({ satisfactionScore: 4 }, NOW)).toEqual({
      updated_at: NOW,
      outcome_recorded_at: NOW,
      satisfaction_score: 4,
    });
  });

  it("writes only the amount when the family sends what they paid alone", () => {
    expect(buildOutcomePatch({ amountPaidCents: 425000 }, NOW)).toEqual({
      updated_at: NOW,
      outcome_recorded_at: NOW,
      amount_paid_cents: 425000,
    });
  });

  it("writes both when both are provided", () => {
    expect(
      buildOutcomePatch({ satisfactionScore: 5, amountPaidCents: 300000 }, NOW),
    ).toEqual({
      updated_at: NOW,
      outcome_recorded_at: NOW,
      satisfaction_score: 5,
      amount_paid_cents: 300000,
    });
  });

  it("does NOT stamp outcome_recorded_at without a real outcome field (a fees-only note must not join the partner-report cohort)", () => {
    expect(buildOutcomePatch({}, NOW)).toEqual({ updated_at: NOW });
  });

  it("never includes savings_vs_listed_cents (GENERATED column — a write is a DB error)", () => {
    const patches = [
      buildOutcomePatch({}, NOW),
      buildOutcomePatch({ satisfactionScore: 1 }, NOW),
      buildOutcomePatch({ amountPaidCents: 0 }, NOW),
      buildOutcomePatch({ satisfactionScore: 3, amountPaidCents: 199999 }, NOW),
    ];
    for (const patch of patches) {
      expect(patch).not.toHaveProperty("savings_vs_listed_cents");
    }
  });
});

describe("mergeSurpriseFees", () => {
  const MARKER = "Fees that surprised the family (recorded after close): ";

  it("appends to existing notes with a blank line", () => {
    expect(mergeSurpriseFees("Quoted over the phone.", "obituary fee")).toBe(
      `Quoted over the phone.\n\n${MARKER}obituary fee`,
    );
  });

  it("starts clean when there are no notes", () => {
    expect(mergeSurpriseFees(null, "casket handling")).toBe(
      `${MARKER}casket handling`,
    );
  });

  it("replaces an earlier answer instead of appending a duplicate", () => {
    const once = mergeSurpriseFees("Original note.", "first answer");
    const twice = mergeSurpriseFees(once, "second answer");
    expect(twice).toBe(`Original note.\n\n${MARKER}second answer`);
    expect(twice.match(/Fees that surprised/g)).toHaveLength(1);
  });

  it("caps combined output at 2000 chars (the quote route's notes limit)", () => {
    const merged = mergeSurpriseFees("x".repeat(1900), "y".repeat(500));
    expect(merged.length).toBe(2000);
  });
});
