import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextResponse } from "next/server";

// Mock the Supabase server helper so we control who's "logged in".
vi.mock("@/lib/supabase/server", () => ({ getUser: vi.fn() }));
// Mock next/navigation so redirect()/notFound() halt (as they do in Next).
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("REDIRECT");
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));
// The module builds its own service client; feed it a scripted fake.
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/env", () => ({
  PUBLIC: { supabaseUrl: "http://test.local" },
  requireServer: () => "service-key",
}));

import { getUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { requirePartnerMember, requirePartnerApi } from "@/lib/partner/auth";

const getUserMock = vi.mocked(getUser);
const redirectMock = vi.mocked(redirect);
const notFoundMock = vi.mocked(notFound);
const createClientMock = vi.mocked(createClient);

/**
 * Queue-based fake: each awaited query consumes the next {data} result, and
 * every call's table/op/filters are recorded so tests can assert scoping.
 */
type Recorded = {
  table: string;
  op: "select" | "update";
  filters: Record<string, unknown>;
  update?: Record<string, unknown>;
};
function scriptSvc(results: { data: unknown }[]) {
  const calls: Recorded[] = [];
  const client = {
    from(table: string) {
      const call: Recorded = { table, op: "select", filters: {} };
      calls.push(call);
      const q = {
        select: () => q,
        update: (v: Record<string, unknown>) => {
          call.op = "update";
          call.update = v;
          return q;
        },
        eq: (k: string, v: unknown) => {
          call.filters[k] = v;
          return q;
        },
        is: (k: string, v: unknown) => {
          call.filters[k] = v;
          return q;
        },
        order: () => q,
        limit: () => q,
        single: () => q,
        then: (resolve: (r: { data: unknown }) => void) =>
          resolve(results.shift() ?? { data: null }),
      };
      return q;
    },
  };
  createClientMock.mockReturnValue(client as never);
  return calls;
}

const SEAT = {
  id: "m1",
  partner_id: "p1",
  role: "member" as const,
  invited_email: "sw@hospice.org",
  accepted_at: "2026-07-01T00:00:00Z",
};
const OWNER_SEAT = { ...SEAT, id: "m0", role: "owner" as const };
const PARTNER = {
  id: "p1",
  name: "Demo Hospice",
  partner_type: "hospice",
  status: "pilot",
  active: true,
  report_token: "t".repeat(48),
  brand_accent: null,
  notification_email: null,
  contact_email: "sw@hospice.org",
};

beforeEach(() => {
  getUserMock.mockReset();
  redirectMock.mockClear();
  notFoundMock.mockClear();
  createClientMock.mockReset();
});

describe("requirePartnerMember", () => {
  it("redirects an anonymous caller to the portal login with next", async () => {
    getUserMock.mockResolvedValue(null as never);
    await expect(requirePartnerMember("/portal")).rejects.toThrow("REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/portal/login?next=%2Fportal");
  });

  it("404s a logged-in non-member (never confirms the route)", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "x@y.com" } as never);
    scriptSvc([{ data: [] }, { data: [] }]); // no bound seat, no invite
    await expect(requirePartnerMember("/portal")).rejects.toThrow("NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("scopes the seat lookup to the caller's user_id and active seats only", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "sw@hospice.org" } as never);
    const calls = scriptSvc([{ data: [SEAT] }, { data: PARTNER }]);
    await requirePartnerMember("/portal");
    expect(calls[0].table).toBe("partner_members");
    expect(calls[0].filters.user_id).toBe("u1"); // org isolation: my seats only
    expect(calls[0].filters.deactivated_at).toBeNull(); // deactivated blocked
  });

  it("returns the context for a bound member of an active org", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "sw@hospice.org" } as never);
    scriptSvc([{ data: [SEAT] }, { data: PARTNER }]);
    const ctx = await requirePartnerMember("/portal");
    expect(ctx.partner.id).toBe("p1");
    expect(ctx.member.role).toBe("member");
    expect(redirectMock).not.toHaveBeenCalled();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("binds an invited email on first login (guarded update)", async () => {
    getUserMock.mockResolvedValue({ id: "u9", email: "SW@Hospice.org" } as never);
    const unbound = { ...SEAT, accepted_at: null };
    const calls = scriptSvc([
      { data: [] }, // no bound seat yet
      { data: [unbound] }, // invite matches
      { data: [{ ...unbound, accepted_at: "now" }] }, // guarded claim succeeds
      { data: PARTNER },
    ]);
    const ctx = await requirePartnerMember("/portal");
    expect(ctx.member.id).toBe("m1");
    // invite lookup is lowercased; claim is guarded against a bound seat
    expect(calls[1].filters.invited_email).toBe("sw@hospice.org");
    expect(calls[2].op).toBe("update");
    expect(calls[2].update?.user_id).toBe("u9");
    expect(calls[2].filters.user_id).toBeNull();
  });

  it("parks members of a paused org on /portal/paused", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "sw@hospice.org" } as never);
    scriptSvc([{ data: [SEAT] }, { data: { ...PARTNER, status: "paused" } }]);
    await expect(requirePartnerMember("/portal")).rejects.toThrow("REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/portal/paused");
  });

  it("404s a plain member behind an owner gate", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "sw@hospice.org" } as never);
    scriptSvc([{ data: [SEAT] }, { data: PARTNER }]);
    await expect(requirePartnerMember("/portal/team", "owner")).rejects.toThrow(
      "NOT_FOUND",
    );
  });

  it("passes an owner through an owner gate", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "sw@hospice.org" } as never);
    scriptSvc([{ data: [OWNER_SEAT] }, { data: PARTNER }]);
    const ctx = await requirePartnerMember("/portal/team", "owner");
    expect(ctx.member.role).toBe("owner");
  });
});

describe("requirePartnerApi", () => {
  it("401s an anonymous caller", async () => {
    getUserMock.mockResolvedValue(null as never);
    const res = await requirePartnerApi();
    expect(res).toBeInstanceOf(NextResponse);
    expect((res as NextResponse).status).toBe(401);
  });

  it("403s a non-member", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "x@y.com" } as never);
    scriptSvc([{ data: [] }, { data: [] }]);
    const res = await requirePartnerApi();
    expect((res as NextResponse).status).toBe(403);
  });

  it("403s a member of an inactive org", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "sw@hospice.org" } as never);
    scriptSvc([{ data: [SEAT] }, { data: { ...PARTNER, active: false } }]);
    const res = await requirePartnerApi();
    expect((res as NextResponse).status).toBe(403);
  });

  it("returns the context for a member in good standing", async () => {
    getUserMock.mockResolvedValue({ id: "u1", email: "sw@hospice.org" } as never);
    scriptSvc([{ data: [SEAT] }, { data: PARTNER }]);
    const res = await requirePartnerApi();
    expect(res).not.toBeInstanceOf(NextResponse);
    expect((res as { partner: { id: string } }).partner.id).toBe("p1");
  });
});
