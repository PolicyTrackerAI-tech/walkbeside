import { afterEach, describe, expect, it } from "vitest";
import { outreachFromAddress } from "../email-body";

/**
 * Pins the outreach from-address so public copy can't silently drift from the
 * code. /how-it-works renders the address by calling outreachFromAddress()
 * itself (single source of truth); this test pins the default that renders
 * when OUTREACH_FROM is unset — the 2026-08 A2 audit found the page claiming
 * "advocate@honestfuneral.co" while the code default was arrangements@.
 */
describe("outreachFromAddress", () => {
  const saved = process.env.OUTREACH_FROM;
  afterEach(() => {
    if (saved === undefined) delete process.env.OUTREACH_FROM;
    else process.env.OUTREACH_FROM = saved;
  });

  it("defaults to the arrangements@ advocate address", () => {
    delete process.env.OUTREACH_FROM;
    expect(outreachFromAddress()).toBe(
      "Honest Funeral Co. <arrangements@honestfuneral.co>",
    );
  });

  it("honors the OUTREACH_FROM override", () => {
    process.env.OUTREACH_FROM = "Honest Funeral <advocate@honestfuneral.co>";
    expect(outreachFromAddress()).toBe(
      "Honest Funeral <advocate@honestfuneral.co>",
    );
  });
});
