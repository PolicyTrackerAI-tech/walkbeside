import { describe, it, expect, vi } from "vitest";

// The store builds its own service client; feed it a scripted fake.
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/env", () => ({
  PUBLIC: { supabaseUrl: "http://test.local" },
  requireServer: () => "service-key",
}));

/**
 * Queue-based fake (pattern: lib/partner/__tests__/auth.test.ts): each
 * awaited query consumes the next result, and every call's table/filters are
 * recorded so tests can assert scoping. The store wraps benchmarksForZip in
 * React cache(), so each test loads a FRESH module graph (vi.resetModules +
 * dynamic import) — no memo can leak between cases.
 */
type Recorded = { table: string; filters: Record<string, unknown> };

async function load(
  results: { data: unknown; error?: unknown }[],
  { throwOnQuery = false } = {},
) {
  vi.resetModules();
  const { createClient } = await import("@supabase/supabase-js");
  const calls: Recorded[] = [];
  const client = {
    from(table: string) {
      if (throwOnQuery) throw new Error("relation does not exist");
      const call: Recorded = { table, filters: {} };
      calls.push(call);
      const q = {
        select: () => q,
        eq: (k: string, v: unknown) => {
          call.filters[k] = v;
          return q;
        },
        in: (k: string, v: unknown) => {
          call.filters[k] = v;
          return q;
        },
        then: (resolve: (r: { data: unknown; error: unknown }) => void) => {
          const r = results.shift() ?? { data: null };
          resolve({ data: r.data, error: r.error ?? null });
        },
      };
      return q;
    },
  };
  vi.mocked(createClient).mockReturnValue(client as never);
  const store = await import("@/lib/benchmarks-store");
  return { store, calls };
}

// zip 84101 → zip3 "841", metro "Salt Lake City", state "UT" (lib/zip-regions).
const row = (over: Record<string, unknown> = {}) => ({
  line_item_id: "basic-services",
  scope: "state",
  scope_value: "UT",
  fair_low_cents: 150000,
  fair_high_cents: 250000,
  predatory_at_cents: 350000,
  tier: "verified",
  n_data_points: 8,
  version: "2026-07-v1",
  effective_at: "2026-07-10T00:00:00+00:00",
  ...over,
});

describe("benchmarksForZip", () => {
  it("queries active rows across the zip's three scope values", async () => {
    const { store, calls } = await load([{ data: [] }]);
    await store.benchmarksForZip("84101");
    expect(calls[0].table).toBe("regional_benchmarks");
    expect(calls[0].filters.active).toBe(true);
    expect(calls[0].filters.scope_value).toEqual([
      "841",
      "Salt Lake City",
      "UT",
    ]);
  });

  it("picks the narrowest scope per line item (zip3 > metro > state)", async () => {
    const { store } = await load([
      {
        data: [
          row(),
          row({ scope: "metro", scope_value: "Salt Lake City", fair_low_cents: 140000 }),
          row({ scope: "zip3", scope_value: "841", fair_low_cents: 130000 }),
          row({ line_item_id: "embalming", scope: "metro", scope_value: "Salt Lake City" }),
        ],
      },
    ]);
    const map = await store.benchmarksForZip("84101");
    expect(map.get("basic-services")?.scope).toBe("zip3");
    expect(map.get("basic-services")?.fairLowCents).toBe(130000);
    expect(map.get("embalming")?.scope).toBe("metro");
  });

  it("picks the latest effective_at within a scope", async () => {
    const { store } = await load([
      {
        data: [
          row({ scope: "zip3", scope_value: "841", version: "2026-07-v1", effective_at: "2026-07-01T00:00:00+00:00" }),
          row({ scope: "zip3", scope_value: "841", version: "2026-07-v2", effective_at: "2026-07-12T00:00:00+00:00", fair_low_cents: 160000 }),
        ],
      },
    ]);
    const map = await store.benchmarksForZip("84101");
    expect(map.get("basic-services")?.version).toBe("2026-07-v2");
    expect(map.get("basic-services")?.fairLowCents).toBe(160000);
  });

  it("drops rows whose scope does not own the value they matched on", async () => {
    // A metro-scoped row carrying the state code collided in the IN list;
    // the JS pairing must reject it.
    const { store } = await load([
      { data: [row({ scope: "metro", scope_value: "UT" })] },
    ]);
    const map = await store.benchmarksForZip("84101");
    expect(map.size).toBe(0);
  });

  it("returns an empty Map for a short zip without querying", async () => {
    const { store, calls } = await load([]);
    expect((await store.benchmarksForZip("84")).size).toBe(0);
    expect((await store.benchmarksForZip("")).size).toBe(0);
    expect(calls.length).toBe(0);
  });

  it("degrades to empty on a query error (missing table)", async () => {
    const { store } = await load([{ data: null, error: { message: "42P01" } }]);
    expect((await store.benchmarksForZip("84101")).size).toBe(0);
  });

  it("never throws when the client itself throws", async () => {
    const { store } = await load([], { throwOnQuery: true });
    expect((await store.benchmarksForZip("84101")).size).toBe(0);
    expect(await store.benchmarkFor("84101", "basic-services")).toBeNull();
    expect((await store.tierForZip("84101")).tier).toBe("modeled");
  });
});

describe("benchmarkFor", () => {
  it("returns the winning override or null", async () => {
    const { store } = await load([
      { data: [row({ scope: "zip3", scope_value: "841" })] },
    ]);
    const hit = await store.benchmarkFor("84101", "basic-services");
    expect(hit?.fairHighCents).toBe(250000);
    expect(hit?.tier).toBe("verified");
  });
});

describe("tierForZip", () => {
  it("is modeled for an unmatched zip", async () => {
    const { store } = await load([{ data: [] }]);
    expect(await store.tierForZip("84101")).toEqual({
      tier: "modeled",
      n: null,
      itemCount: 0,
      lastUpdated: null,
    });
  });

  it("returns verified with the MINIMUM n across verified rows", async () => {
    const { store } = await load([
      {
        data: [
          row({ scope: "zip3", scope_value: "841", n_data_points: 12 }),
          row({ line_item_id: "embalming", scope: "zip3", scope_value: "841", n_data_points: 7, effective_at: "2026-07-12T00:00:00+00:00" }),
          row({ line_item_id: "cremation-fee", scope: "zip3", scope_value: "841", tier: "community", n_data_points: 30 }),
        ],
      },
    ]);
    expect(await store.tierForZip("84101")).toEqual({
      tier: "verified",
      n: 7,
      itemCount: 2,
      lastUpdated: "2026-07-12",
    });
  });

  it("falls back to community when no verified row matched", async () => {
    const { store } = await load([
      {
        data: [
          row({ scope: "metro", scope_value: "Salt Lake City", tier: "community", n_data_points: 6 }),
        ],
      },
    ]);
    const tier = await store.tierForZip("84101");
    expect(tier.tier).toBe("community");
    expect(tier.n).toBe(6);
    expect(tier.itemCount).toBe(1);
  });
});

describe("dataSourceForZipLive", () => {
  it("mirrors the tier as a PriceDataSource member", async () => {
    const { store } = await load([
      { data: [row({ scope: "zip3", scope_value: "841" })] },
    ]);
    expect(await store.dataSourceForZipLive("84101")).toBe("verified");
  });
});
