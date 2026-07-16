import { describe, it, expect } from "vitest";
import { ratesFor, estUsdForEvent, SONNET_5_INTRO_END } from "@/lib/ai-costs";

/**
 * Pins the /admin/ai-costs per-model pricing table: prefix matching over
 * dated ledger ids, the sonnet-5 intro-pricing window (priced by the day the
 * CALL ran, not the render date), and the unknown-model fallback to the most
 * expensive tier (a surprise model must only ever OVERestimate).
 */

describe("ratesFor", () => {
  it("prices haiku rows by prefix, including dated snapshot ids", () => {
    for (const id of ["claude-haiku-4-5", "claude-haiku-4-5-20251001"]) {
      expect(ratesFor(id, "2026-07-16")).toEqual({
        usdPerMInput: 1,
        usdPerMOutput: 5,
        usdPerMCacheRead: 0.1,
      });
    }
  });

  it("prices sonnet-5 at intro rates through the window, sticker after", () => {
    expect(ratesFor("claude-sonnet-5", "2026-07-16").usdPerMInput).toBe(2);
    expect(ratesFor("claude-sonnet-5", SONNET_5_INTRO_END).usdPerMInput).toBe(2);
    expect(ratesFor("claude-sonnet-5", "2026-09-01")).toEqual({
      usdPerMInput: 3,
      usdPerMOutput: 15,
      usdPerMCacheRead: 0.3,
    });
  });

  it("prices sonnet-4-6 at sticker", () => {
    expect(ratesFor("claude-sonnet-4-6", "2026-07-16")).toEqual({
      usdPerMInput: 3,
      usdPerMOutput: 15,
      usdPerMCacheRead: 0.3,
    });
  });

  it("unknown or missing models fall back to the most expensive tier", () => {
    const sticker = ratesFor("claude-sonnet-4-6", "2026-07-16");
    expect(ratesFor("claude-fable-9", "2026-07-16")).toEqual(sticker);
    expect(ratesFor(null, "2026-07-16")).toEqual(sticker);
    expect(ratesFor(undefined, "2026-07-16")).toEqual(sticker);
    expect(ratesFor("", "2026-07-16")).toEqual(sticker);
  });
});

describe("estUsdForEvent", () => {
  it("prices one row by its own model and day", () => {
    // 1M input + 1M output + 1M cache-read on intro-priced sonnet-5.
    expect(
      estUsdForEvent({
        model: "claude-sonnet-5",
        input_tokens: 1_000_000,
        output_tokens: 1_000_000,
        cache_read_tokens: 1_000_000,
        created_at: "2026-07-16T22:00:00.000Z",
      }),
    ).toBeCloseTo(2 + 10 + 0.2, 10);
  });

  it("a haiku row costs a third of what the old flat sonnet rate claimed", () => {
    const haiku = estUsdForEvent({
      model: "claude-haiku-4-5-20251001",
      input_tokens: 300_000,
      output_tokens: 100_000,
      cache_read_tokens: 0,
      created_at: "2026-07-16T22:00:00.000Z",
    });
    // Old page behavior: every row at $3/$15.
    const oldFlat = (300_000 / 1e6) * 3 + (100_000 / 1e6) * 15;
    expect(haiku).toBeCloseTo(oldFlat / 3, 10);
  });

  it("treats missing token fields as zero", () => {
    expect(
      estUsdForEvent({ model: "claude-sonnet-5", created_at: "2026-07-16T00:00:00Z" }),
    ).toBe(0);
  });
});
