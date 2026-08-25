import { describe, it, expect, vi } from "vitest";

// resolvePartnerToken creates a service client at call time; stub the SDK so
// the resolve path can be exercised without a network. The mock row is
// swappable per test via mockRow.
let mockRow: unknown = null;
let mockError: unknown = null;
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: mockRow, error: mockError }),
        }),
      }),
    }),
  }),
}));
vi.mock("@/lib/env", () => ({
  PUBLIC: { supabaseUrl: "http://stub.local" },
  requireServer: () => "stub-service-key",
}));

import { isPartnerParked, resolvePartnerToken } from "../partner-auth";

/**
 * Audit A5-02 tripwires. Before A5 the token surfaces gated only on
 * `active` while the session portal also parked on status — a status-paused
 * partner kept full bearer-link access to report/links/check. isPartnerParked
 * is now the ONE rule both surfaces share; these pins hold it to the portal's
 * semantics (lib/partner/auth.ts:146).
 */

describe("isPartnerParked", () => {
  it("parks paused and archived orgs even while active=true (the A5-02 hole)", () => {
    expect(isPartnerParked({ active: true, status: "paused" })).toBe(true);
    expect(isPartnerParked({ active: true, status: "archived" })).toBe(true);
  });

  it("parks deactivated orgs regardless of status", () => {
    expect(isPartnerParked({ active: false, status: "active" })).toBe(true);
    expect(isPartnerParked({ active: false, status: "pilot" })).toBe(true);
  });

  it("admits live orgs: active + pilot/active status", () => {
    expect(isPartnerParked({ active: true, status: "pilot" })).toBe(false);
    expect(isPartnerParked({ active: true, status: "active" })).toBe(false);
  });

  it("tolerates a missing status column (pre-migration row) — active alone admits", () => {
    expect(isPartnerParked({ active: true })).toBe(false);
    expect(isPartnerParked({ active: true, status: null })).toBe(false);
  });
});

describe("resolvePartnerToken", () => {
  it("rejects short/empty tokens before touching the database", async () => {
    expect(await resolvePartnerToken("")).toBeNull();
    expect(await resolvePartnerToken("short-token")).toBeNull();
  });

  it("returns the row (including status) for a resolved token", async () => {
    mockRow = {
      id: "p1",
      name: "Test Hospice",
      active: true,
      status: "paused",
      partner_type: "hospice",
      brand_accent: null,
    };
    const p = await resolvePartnerToken("a".repeat(24));
    expect(p?.status).toBe("paused");
    // The caller contract: a resolved-but-parked partner must be parked.
    expect(p && isPartnerParked(p)).toBe(true);
  });

  it("returns null on a lookup error (unrecognized token / missing table)", async () => {
    mockRow = null;
    mockError = { message: "no rows" };
    expect(await resolvePartnerToken("b".repeat(24))).toBeNull();
  });
});
