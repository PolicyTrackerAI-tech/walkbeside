import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase config so we control whether FEATURES.supabase() is true.
vi.mock("@/lib/env", () => ({ FEATURES: { supabase: vi.fn() } }));
// Mock the server client the function queries through.
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { FEATURES } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { findHomesFromDirectory } from "@/lib/negotiation/directory";

const supabaseMock = vi.mocked(FEATURES.supabase);
const createClientMock = vi.mocked(createClient);

interface Row {
  name: string;
  email: string | null;
  zip: string;
}

/**
 * Recording fake (audit A10-02): the original fake ignored eq()/not() args,
 * so deleting `.eq("vetted", true)` from directory.ts passed the whole
 * suite — the operational law CLAUDE.md marks as never-loosen had no
 * tripwire. Every filter is now captured for assertion.
 */
function fakeClient(result: { data: Row[] | null; error: unknown }) {
  const filters: { op: string; args: unknown[] }[] = [];
  const chain = {
    eq: (...args: unknown[]) => {
      filters.push({ op: "eq", args });
      return chain;
    },
    not: (...args: unknown[]) => {
      filters.push({ op: "not", args });
      return Promise.resolve(result);
    },
  };
  return { client: { from: () => ({ select: () => chain }) }, filters };
}

beforeEach(() => {
  supabaseMock.mockReset();
  createClientMock.mockReset();
});

describe("findHomesFromDirectory", () => {
  it("Supabase not configured → returns empty array, never a placeholder", async () => {
    supabaseMock.mockReturnValue(false);
    const homes = await findHomesFromDirectory("90210", 4);
    expect(homes).toEqual([]);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("query errors → returns empty array, never a placeholder", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({ data: null, error: new Error("db down") }).client as never,
    );
    const homes = await findHomesFromDirectory("90210", 4);
    expect(homes).toEqual([]);
  });

  it("zero vetted homes match → returns empty array, never a placeholder", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({ data: [], error: null }).client as never,
    );
    const homes = await findHomesFromDirectory("90210", 4);
    expect(homes).toEqual([]);
  });

  it("real vetted homes exist → returns them, ordered zip-exact, then zip3", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({
        data: [
          { name: "Prefix Home", email: "prefix@h.com", zip: "90211" },
          { name: "Exact Home", email: "exact@h.com", zip: "90210" },
        ],
        error: null,
      }).client as never,
    );
    const homes = await findHomesFromDirectory("90210", 4);
    expect(homes.map((h) => h.name)).toEqual(["Exact Home", "Prefix Home"]);
  });

  it("NEVER returns a home outside the family's service area (a DC family is never matched to Salt Lake or LA)", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({
        data: [
          { name: "SLC Home", email: "slc@h.com", zip: "84111" },
          { name: "LA Home", email: "la@h.com", zip: "90210" },
          { name: "Baltimore Home", email: "balt@h.com", zip: "21201" },
        ],
        error: null,
      }).client as never,
    );
    expect(await findHomesFromDirectory("20001", 9)).toEqual([]);
    // Outside a defined market the area is the family's own zip3 only.
    expect(await findHomesFromDirectory("10001", 9)).toEqual([]);
  });

  it("DMV market: crosses DC/MD/VA lines, nearest tier first", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({
        data: [
          { name: "Arlington Home", email: "arl@h.com", zip: "22201" },
          { name: "Richmond Home", email: "ric@h.com", zip: "23219" },
          { name: "Silver Spring Home", email: "ss@h.com", zip: "20910" },
          { name: "DC Home", email: "dc@h.com", zip: "20011" },
          { name: "Baltimore Home", email: "balt@h.com", zip: "21201" },
        ],
        error: null,
      }).client as never,
    );
    const homes = (await findHomesFromDirectory("20910", 9)).map((h) => h.name);
    expect(homes[0]).toBe("Silver Spring Home");
    expect(new Set(homes.slice(1))).toEqual(new Set(["DC Home", "Arlington Home"]));
    // Richmond and Baltimore are outside the DC-metro market.
    expect(homes).not.toContain("Richmond Home");
    expect(homes).not.toContain("Baltimore Home");
  });

  it("drops denylisted addresses BEFORE the cap, and an all-denylisted area returns []", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({
        data: [
          { name: "Broker", email: "leads@dfsmemorials.com", zip: "20011" },
          { name: "Directory", email: "info@parting.com", zip: "20011" },
          { name: "Real Home", email: "office@realhome.com", zip: "20012" },
        ],
        error: null,
      }).client as never,
    );
    // Cap of 1: the blocked same-zip rows must not eat the only slot.
    expect((await findHomesFromDirectory("20011", 1)).map((h) => h.name)).toEqual(["Real Home"]);

    createClientMock.mockResolvedValue(
      fakeClient({
        data: [{ name: "Broker", email: "leads@dfsmemorials.com", zip: "20011" }],
        error: null,
      }).client as never,
    );
    expect(await findHomesFromDirectory("20011", 4)).toEqual([]);
  });

  it("the cap draws fairly within a tier — not the same import-order homes every time (guardrail #3)", async () => {
    supabaseMock.mockReturnValue(true);
    const rows = ["A", "B", "C", "D", "E", "F"].map((l) => ({
      name: `${l} Home`,
      email: `${l.toLowerCase()}@h.com`,
      zip: "20011",
    }));
    createClientMock.mockResolvedValue(fakeClient({ data: rows, error: null }).client as never);
    // random() → 0 rotates the tier; a constant-first RNG would always pick
    // "A Home" first if the tier were not shuffled.
    const first = await findHomesFromDirectory("20011", 3, () => 0);
    const second = await findHomesFromDirectory("20011", 3, () => 0.999);
    expect(first).toHaveLength(3);
    expect(second).toHaveLength(3);
    expect(first.map((h) => h.name)).not.toEqual(second.map((h) => h.name));
    for (const h of [...first, ...second]) expect(rows.map((r) => r.name)).toContain(h.name);
  });

  it("filters out rows with no email even if returned by the query", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({
        data: [
          { name: "No Email Home", email: null, zip: "90210" },
          { name: "Has Email Home", email: "ok@h.com", zip: "90210" },
        ],
        error: null,
      }).client as never,
    );
    const homes = await findHomesFromDirectory("90210", 4);
    expect(homes).toEqual([{ name: "Has Email Home", email: "ok@h.com" }]);
  });

  it("THE vetted gate: the query filters active=true AND vetted=true AND email not null (CLAUDE.md law — never loosen)", async () => {
    supabaseMock.mockReturnValue(true);
    const fake = fakeClient({ data: [], error: null });
    createClientMock.mockResolvedValue(fake.client as never);
    await findHomesFromDirectory("90210", 4);
    expect(fake.filters).toContainEqual({ op: "eq", args: ["active", true] });
    expect(fake.filters).toContainEqual({ op: "eq", args: ["vetted", true] });
    expect(fake.filters).toContainEqual({ op: "not", args: ["email", "is", null] });
  });
});
