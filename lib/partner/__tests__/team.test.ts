import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MAX_SEATS,
  listMembers,
  inviteMember,
  setMemberActive,
} from "@/lib/partner/team";

/**
 * lib/partner/team.ts takes the service client as an argument, so no module
 * mocks are needed — the same queue-based thenable fake as auth.test.ts is
 * simply passed in. Each awaited query consumes the next scripted result and
 * records its table/op/filters/values so tests can assert scoping (the
 * cross-org rules live in the filters, not the results).
 */

type Recorded = {
  table: string;
  op: "select" | "insert" | "update";
  filters: Record<string, unknown>;
  insert?: Record<string, unknown>;
  update?: Record<string, unknown>;
};
type ScriptedResult = {
  data?: unknown;
  error?: { message: string } | null;
  count?: number | null;
};
function scriptSvc(results: ScriptedResult[]) {
  const calls: Recorded[] = [];
  const client = {
    from(table: string) {
      const call: Recorded = { table, op: "select", filters: {} };
      calls.push(call);
      const q = {
        select: () => q,
        insert: (v: Record<string, unknown>) => {
          call.op = "insert";
          call.insert = v;
          return q;
        },
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
        then: (resolve: (r: ScriptedResult) => void) =>
          resolve(results.shift() ?? { data: null, error: null }),
      };
      return q;
    },
  };
  return { admin: client as unknown as SupabaseClient, calls };
}

const ROW = {
  id: "m2",
  invited_email: "new.person@hospice.org",
  role: "member" as const,
  invited_at: "2026-07-14T00:00:00Z",
  accepted_at: null,
  deactivated_at: null,
  created_at: "2026-07-14T00:00:00Z",
};

describe("listMembers", () => {
  it("scopes the read to the org's partner_id", async () => {
    const { admin, calls } = scriptSvc([{ data: [ROW] }]);
    const rows = await listMembers(admin, "p1");
    expect(rows).toEqual([ROW]);
    expect(calls[0].table).toBe("partner_members");
    expect(calls[0].filters.partner_id).toBe("p1");
  });

  it("returns [] when the table read fails", async () => {
    const { admin } = scriptSvc([{ data: null }]);
    expect(await listMembers(admin, "p1")).toEqual([]);
  });
});

describe("inviteMember", () => {
  it("normalizes the email (trim + lowercase) and inserts a member seat", async () => {
    const { admin, calls } = scriptSvc([
      { count: 3 }, // active seats, under the cap
      { data: [ROW], error: null },
    ]);
    const res = await inviteMember(admin, "p1", "  New.Person@Hospice.ORG ");
    expect(res).toEqual({ ok: true, member: ROW });
    expect(calls[1].op).toBe("insert");
    expect(calls[1].insert).toEqual({
      partner_id: "p1",
      invited_email: "new.person@hospice.org",
      role: "member",
    });
  });

  it("counts ACTIVE seats only, scoped to the org, before inserting", async () => {
    const { admin, calls } = scriptSvc([
      { count: 0 },
      { data: [ROW], error: null },
    ]);
    await inviteMember(admin, "p1", "new.person@hospice.org");
    expect(calls[0].op).toBe("select");
    expect(calls[0].filters.partner_id).toBe("p1");
    expect(calls[0].filters.deactivated_at).toBeNull();
  });

  it("treats a duplicate over an ACTIVE seat as success ({ already: true })", async () => {
    const { admin, calls } = scriptSvc([
      { count: 3 },
      {
        data: null,
        error: {
          message:
            'duplicate key value violates unique constraint "partner_members_partner_email_idx"',
        },
      },
      // the existing-seat lookup after the duplicate: active seat
      { data: [{ id: "m2", deactivated_at: null }], error: null },
    ]);
    const res = await inviteMember(admin, "p1", "new.person@hospice.org");
    expect(res).toEqual({ ok: true, already: true });
    // the lookup is scoped to the org + the normalized email
    expect(calls[2].filters).toEqual({
      partner_id: "p1",
      invited_email: "new.person@hospice.org",
    });
  });

  it("surfaces a duplicate over a DEACTIVATED seat as seat_deactivated, not already", async () => {
    const { admin } = scriptSvc([
      { count: 3 },
      {
        data: null,
        error: {
          message:
            'duplicate key value violates unique constraint "partner_members_partner_email_idx"',
        },
      },
      // the existing seat is deactivated — the person is locked out
      {
        data: [{ id: "m2", deactivated_at: "2026-07-10T00:00:00Z" }],
        error: null,
      },
    ]);
    const res = await inviteMember(admin, "p1", "new.person@hospice.org");
    expect(res).toEqual({ ok: false, error: "seat_deactivated" });
  });

  it(`refuses at the ${MAX_SEATS}-seat cap without inserting`, async () => {
    const { admin, calls } = scriptSvc([{ count: MAX_SEATS }]);
    const res = await inviteMember(admin, "p1", "one.more@hospice.org");
    expect(res).toEqual({ ok: false, error: "seat_limit" });
    expect(calls).toHaveLength(1); // never reached the insert
  });

  it("rejects a malformed email before touching the database", async () => {
    const { admin, calls } = scriptSvc([]);
    const res = await inviteMember(admin, "p1", "not-an-email");
    expect(res).toEqual({ ok: false, error: "invalid_email" });
    expect(calls).toHaveLength(0);
  });

  it("surfaces a non-duplicate insert failure as unavailable", async () => {
    const { admin } = scriptSvc([
      { count: 3 },
      { data: null, error: { message: "connection reset" } },
    ]);
    const res = await inviteMember(admin, "p1", "new.person@hospice.org");
    expect(res).toEqual({ ok: false, error: "unavailable" });
  });
});

describe("setMemberActive", () => {
  it("scopes the lookup AND the write to partner_id + id (cross-org protection)", async () => {
    const { admin, calls } = scriptSvc([
      { data: [{ id: "m2", role: "member" }], error: null },
      { data: null, error: null },
    ]);
    const res = await setMemberActive(admin, "p1", "m2", false);
    expect(res).toEqual({ ok: true });
    expect(calls[0].filters).toEqual({ partner_id: "p1", id: "m2" });
    expect(calls[1].op).toBe("update");
    expect(calls[1].filters).toEqual({ partner_id: "p1", id: "m2" });
    expect(typeof calls[1].update?.deactivated_at).toBe("string"); // stamped now
  });

  it("reads a member id from another org as not_found", async () => {
    const { admin, calls } = scriptSvc([{ data: [], error: null }]);
    const res = await setMemberActive(admin, "p1", "someone-elses-id", false);
    expect(res).toEqual({ ok: false, error: "not_found" });
    expect(calls).toHaveLength(1); // no write attempted
  });

  it("refuses to deactivate the last active owner", async () => {
    const { admin, calls } = scriptSvc([
      { data: [{ id: "m0", role: "owner" }], error: null },
      { count: 1 }, // this owner is the only active one
    ]);
    const res = await setMemberActive(admin, "p1", "m0", false);
    expect(res).toEqual({ ok: false, error: "last_owner" });
    expect(calls).toHaveLength(2); // no update ran
    // the owner count is scoped to active owners of THIS org
    expect(calls[1].filters.partner_id).toBe("p1");
    expect(calls[1].filters.role).toBe("owner");
    expect(calls[1].filters.deactivated_at).toBeNull();
  });

  it("deactivates an owner when another active owner remains", async () => {
    const { admin, calls } = scriptSvc([
      { data: [{ id: "m0", role: "owner" }], error: null },
      { count: 2 },
      { data: null, error: null },
    ]);
    const res = await setMemberActive(admin, "p1", "m0", false);
    expect(res).toEqual({ ok: true });
    expect(typeof calls[2].update?.deactivated_at).toBe("string");
  });

  it("reactivates by clearing deactivated_at, after an active-seat count", async () => {
    const { admin, calls } = scriptSvc([
      { data: [{ id: "m2", role: "member" }], error: null },
      { count: 3 }, // active seats, under the cap
      { data: null, error: null },
    ]);
    const res = await setMemberActive(admin, "p1", "m2", true);
    expect(res).toEqual({ ok: true });
    expect(calls).toHaveLength(3); // lookup + seat count + update
    // the seat count is scoped to THIS org's active seats
    expect(calls[1].filters.partner_id).toBe("p1");
    expect(calls[1].filters.deactivated_at).toBeNull();
    expect(calls[2].update).toEqual({ deactivated_at: null });
  });

  it(`refuses to reactivate past the ${MAX_SEATS}-seat cap (no deactivate → invite → reactivate bypass)`, async () => {
    const { admin, calls } = scriptSvc([
      { data: [{ id: "m2", role: "member" }], error: null },
      { count: MAX_SEATS }, // org is already full of active seats
    ]);
    const res = await setMemberActive(admin, "p1", "m2", true);
    expect(res).toEqual({ ok: false, error: "seat_limit" });
    expect(calls).toHaveLength(2); // no update ran
  });
});
