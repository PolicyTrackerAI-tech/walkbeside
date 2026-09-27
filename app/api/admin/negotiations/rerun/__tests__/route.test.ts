import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/admin-auth", () => ({ requireAdminApi: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/env", () => ({
  PUBLIC: { supabaseUrl: "http://test.local" },
  requireServer: () => "service-key",
}));
vi.mock("@/lib/negotiation/send", () => ({ sendOutreachForNegotiation: vi.fn() }));

import { createClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/admin-auth";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";
import { POST } from "../route";

const createClientMock = vi.mocked(createClient);
const requireAdminApiMock = vi.mocked(requireAdminApi);
const sendMock = vi.mocked(sendOutreachForNegotiation);

const NEG_ID = "11111111-2222-4333-8444-555555555555";

interface Scenario {
  neg: { zip: string; user_id: string } | null;
  dateOfDeath: string | null;
  rows: { id: string; home_email: string | null }[];
  homes: { email: string; state: string | null; zip: string | null }[];
}

/**
 * Table-keyed fake: reads answer from the scenario; the reset update
 * records its filters and answers with the dry_run rows it would touch.
 */
function fakeSvc(s: Scenario) {
  const updates: { values: unknown; filters: unknown[][] }[] = [];
  const client = {
    from(table: string) {
      const filters: unknown[][] = [];
      let values: unknown = null;
      const result = () => {
        if (table === "negotiation_outreach" && values) {
          const excluded = filters.find((f) => f[0] === "not")?.[3] as string | undefined;
          const touched = s.rows.filter((r) => !excluded || !excluded.includes(r.id));
          return { data: touched.map((r) => ({ id: r.id })), error: null };
        }
        if (table === "negotiation_outreach") return { data: s.rows, error: null };
        if (table === "funeral_homes") return { data: s.homes, error: null };
        return { data: null, error: null };
      };
      const q = {
        select: () => q,
        update: (v: unknown) => {
          values = v;
          updates.push({ values: v, filters });
          return q;
        },
        eq: (...a: unknown[]) => (filters.push(["eq", ...a]), q),
        in: (...a: unknown[]) => (filters.push(["in", ...a]), q),
        not: (...a: unknown[]) => (filters.push(["not", ...a]), q),
        maybeSingle: () =>
          Promise.resolve(
            table === "negotiations"
              ? { data: s.neg, error: null }
              : table === "profiles"
                ? { data: { date_of_death: s.dateOfDeath }, error: null }
                : { data: null, error: null },
          ),
        then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) =>
          Promise.resolve(result()).then(res, rej),
      };
      return q;
    },
  };
  return { client, updates };
}

function post() {
  return POST(
    new Request("http://test.local/api/admin/negotiations/rerun", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ negotiationId: NEG_ID }),
    }),
  );
}

beforeEach(() => {
  createClientMock.mockReset();
  requireAdminApiMock.mockReset();
  requireAdminApiMock.mockResolvedValue(null);
  sendMock.mockReset();
  sendMock.mockResolvedValue({ sent: 0, dryRun: 0, skipped: 0, failed: 0 });
});

const DC_ROW = { id: "row-dc", home_email: "dc@home.com" };
const VA_ROW = { id: "row-va", home_email: "va@home.com" };
const LOST_ROW = { id: "row-lost", home_email: "gone@home.com" };
const HOMES = [
  { email: "dc@home.com", state: "DC", zip: "20011" },
  { email: "va@home.com", state: "VA", zip: "22201" },
];

describe("admin re-run: the Virginia pre-death gate", () => {
  it("a Virginia family with no date of death: resets nothing and sends nothing", async () => {
    const fake = fakeSvc({
      neg: { zip: "22201", user_id: "u1" },
      dateOfDeath: null,
      rows: [DC_ROW],
      homes: HOMES,
    });
    createClientMock.mockReturnValue(fake.client as never);
    const body = await (await post()).json();
    expect(body).toMatchObject({ ok: true, reset: 0, note: "pre-death hold" });
    expect(fake.updates).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("a DC family with no date of death: the Virginia row and an unknown home stay dry_run", async () => {
    const fake = fakeSvc({
      neg: { zip: "20011", user_id: "u1" },
      dateOfDeath: null,
      rows: [DC_ROW, VA_ROW, LOST_ROW],
      homes: HOMES,
    });
    createClientMock.mockReturnValue(fake.client as never);
    const body = await (await post()).json();
    expect(body).toMatchObject({ ok: true, reset: 1, held: 2 });
    const not = fake.updates[0].filters.find((f) => f[0] === "not");
    expect(not).toEqual(["not", "id", "in", "(row-va,row-lost)"]);
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it("after a death: every dry_run row resets, Virginia included", async () => {
    const fake = fakeSvc({
      neg: { zip: "22201", user_id: "u1" },
      dateOfDeath: "2026-09-20",
      rows: [DC_ROW, VA_ROW],
      homes: HOMES,
    });
    createClientMock.mockReturnValue(fake.client as never);
    const body = await (await post()).json();
    expect(body).toMatchObject({ ok: true, reset: 2, held: 0 });
    expect(fake.updates[0].filters.find((f) => f[0] === "not")).toBeUndefined();
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it("an unknown case is a 404, and nothing is reset", async () => {
    const fake = fakeSvc({ neg: null, dateOfDeath: null, rows: [DC_ROW], homes: HOMES });
    createClientMock.mockReturnValue(fake.client as never);
    const res = await post();
    expect(res.status).toBe(404);
    expect(fake.updates).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
