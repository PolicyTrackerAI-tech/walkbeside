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

function fakeClient(result: { data: Row[] | null; error: unknown }) {
  const chain = {
    eq: () => chain,
    not: () => Promise.resolve(result),
  };
  return { from: () => ({ select: () => chain }) };
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
      fakeClient({ data: null, error: new Error("db down") }) as never,
    );
    const homes = await findHomesFromDirectory("90210", 4);
    expect(homes).toEqual([]);
  });

  it("zero vetted homes match → returns empty array, never a placeholder", async () => {
    supabaseMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(
      fakeClient({ data: [], error: null }) as never,
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
      }) as never,
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
      }) as never,
    );
    const homes = await findHomesFromDirectory("90210", 4);
    expect(homes).toEqual([{ name: "Has Email Home", email: "ok@h.com" }]);
  });
});
