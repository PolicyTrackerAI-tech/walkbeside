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

  it("real vetted homes exist → returns them, ordered zip-exact first", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({
        data: [
          { name: "Far Home", email: "far@h.com", zip: "10001" },
          { name: "Exact Home", email: "exact@h.com", zip: "90210" },
          { name: "Prefix Home", email: "prefix@h.com", zip: "90211" },
        ],
        error: null,
      }).client as never,
    );
    const homes = await findHomesFromDirectory("90210", 4);
    expect(homes.map((h) => h.name)).toEqual([
      "Exact Home",
      "Prefix Home",
      "Far Home",
    ]);
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
