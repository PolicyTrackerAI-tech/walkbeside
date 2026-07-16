import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextResponse } from "next/server";

// Admin gate scripted per test; the aggregation itself runs for real on the
// scripted feeds so the n-gate is tested end-to-end.
vi.mock("@/lib/admin-auth", () => ({ requireAdminApi: vi.fn() }));
vi.mock("@/lib/benchmark-sources", () => ({ fetchBenchmarkRecords: vi.fn() }));
// The route builds its own service client; feed it a scripted fake.
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/env", () => ({
  PUBLIC: { supabaseUrl: "http://test.local" },
  requireServer: () => "service-key",
}));
// revalidatePath needs a Next request scope that doesn't exist under vitest.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/admin-auth";
import { fetchBenchmarkRecords } from "@/lib/benchmark-sources";
import { LINE_ITEMS } from "@/lib/pricing-data";
import { regionForZip } from "@/lib/zip-regions";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";
import type { AnalysisRecord } from "@/lib/benchmark-pipeline";
import { POST } from "../route";

const requireAdminApiMock = vi.mocked(requireAdminApi);
const fetchMock = vi.mocked(fetchBenchmarkRecords);
const createClientMock = vi.mocked(createClient);
const revalidatePathMock = vi.mocked(revalidatePath);

const basic = LINE_ITEMS.find((l) => l.id === "basic-services")!;
const ZIP = "84101";
const METRO = regionForZip(ZIP)!.metro;

/**
 * Queue-based fake (same idiom as lib/partner/__tests__/auth.test.ts): each
 * awaited query consumes the next result; table/op/values/filters are
 * recorded so tests can assert exactly what would hit the DB.
 */
type Recorded = {
  table: string;
  op: "update" | "insert";
  filters: Record<string, unknown>;
  neqFilters: Record<string, unknown>;
  values?: Record<string, unknown>;
};
function scriptSvc(
  results: { data?: unknown; error?: { code?: string; message: string } | null }[],
) {
  const calls: Recorded[] = [];
  const client = {
    from(table: string) {
      const call: Recorded = { table, op: "update", filters: {}, neqFilters: {} };
      calls.push(call);
      const q = {
        update: (v: Record<string, unknown>) => {
          call.op = "update";
          call.values = v;
          return q;
        },
        insert: (v: Record<string, unknown>) => {
          call.op = "insert";
          call.values = v;
          return q;
        },
        eq: (k: string, v: unknown) => {
          call.filters[k] = v;
          return q;
        },
        neq: (k: string, v: unknown) => {
          call.neqFilters[k] = v;
          return q;
        },
        select: () => q,
        single: () => q,
        then: (resolve: (r: unknown) => void) =>
          resolve(results.shift() ?? { data: null, error: null }),
      };
      return q;
    },
  };
  createClientMock.mockReturnValue(client as never);
  return calls;
}

/** n distinct-user analyses at ZIP → one metro group with exactly n points. */
function feeds(n: number) {
  const analyses: AnalysisRecord[] = Array.from({ length: n }, (_, i) => ({
    userId: `u${i}`,
    zip: ZIP,
    items: [{ matchedItemId: basic.id, cents: 1000_00 + i * 1_00 }],
  }));
  return { analyses, outreach: [] };
}

function validBody(extra: Record<string, unknown> = {}) {
  return {
    scope: "metro",
    scopeValue: METRO,
    lineItemId: basic.id,
    fairLowDollars: 900,
    fairHighDollars: 1400,
    tier: "verified",
    sourcesNote: "6 GPLs collected 2026-07, Salt Lake City published price lists",
    version: "2026-07-v1",
    ...extra,
  };
}

function post(body: unknown) {
  return POST(
    new Request("http://test.local/api/admin/benchmarks/promote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  requireAdminApiMock.mockReset();
  requireAdminApiMock.mockResolvedValue(null);
  fetchMock.mockReset();
  createClientMock.mockReset();
  revalidatePathMock.mockReset();
});

describe("POST /api/admin/benchmarks/promote", () => {
  it("short-circuits when the admin gate denies", async () => {
    requireAdminApiMock.mockResolvedValue(
      NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    );
    const res = await post(validBody());
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects n=4 with 422 and never touches the table", async () => {
    fetchMock.mockResolvedValue(feeds(4));
    const calls = scriptSvc([]);
    const res = await post(validBody());
    expect(res.status).toBe(422);
    const j = await res.json();
    expect(j.error).toBe(`n=4 below the n≥${SMALL_SAMPLE_THRESHOLD} publish gate`);
    expect(calls).toHaveLength(0);
  });

  it("rejects an unknown group (n=0) with 422", async () => {
    fetchMock.mockResolvedValue({ analyses: [], outreach: [] });
    scriptSvc([]);
    const res = await post(validBody());
    expect(res.status).toBe(422);
    expect((await res.json()).error).toContain("n=0 below");
  });

  it("promotes n=6 with the SERVER-recomputed n, inserting BEFORE retiring", async () => {
    fetchMock.mockResolvedValue(feeds(6));
    const calls = scriptSvc([
      { data: { id: "row-1" }, error: null }, // insert
      { error: null }, // retire prior active rows
    ]);
    const res = await post(validBody());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: "row-1", n: 6 });

    // Insert-first: a failed insert must never leave the key with zero
    // active rows, so the new row lands before siblings flip inactive.
    expect(calls[0].op).toBe("insert");
    expect(calls[0].table).toBe("regional_benchmarks");
    expect(calls[0].values).toMatchObject({
      scope: "metro",
      scope_value: METRO,
      line_item_id: basic.id,
      fair_low_cents: 900_00,
      fair_high_cents: 1400_00,
      predatory_at_cents: null,
      tier: "verified",
      n_data_points: 6, // server-recomputed, never client-supplied
      version: "2026-07-v1",
      active: true,
    });
    const sources = calls[0].values!.sources as Array<Record<string, unknown>>;
    expect(sources[0].kind).toBe("founder-note");
    expect(sources[0].name).toContain("6 GPLs");

    // One active row per key: prior siblings flip inactive, sparing the new
    // row by id.
    expect(calls[1].op).toBe("update");
    expect(calls[1].table).toBe("regional_benchmarks");
    expect(calls[1].values).toEqual({ active: false });
    expect(calls[1].filters).toEqual({
      scope: "metro",
      scope_value: METRO,
      line_item_id: basic.id,
      active: true,
    });
    expect(calls[1].neqFilters).toEqual({ id: "row-1" });

    // A promotion must surface on public pages without a deploy: the metro's
    // city page(s) and the index get purged (ZIP=84101 → Salt Lake City →
    // the salt-lake-city city page).
    const revalidated = revalidatePathMock.mock.calls.map((c) => c[0]);
    expect(revalidated).toContain("/funeral-costs/salt-lake-city");
    expect(revalidated).toContain("/fair-price-index");
  });

  it("never revalidates when the n-gate rejects", async () => {
    fetchMock.mockResolvedValue(feeds(4));
    scriptSvc([]);
    await post(validBody());
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("rejects a body smuggling an n (strict schema — no override exists)", async () => {
    fetchMock.mockResolvedValue(feeds(6));
    const calls = scriptSvc([]);
    const res = await post(validBody({ n: 9999 }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(calls).toHaveLength(0);
  });

  it("rejects a body smuggling an override switch", async () => {
    fetchMock.mockResolvedValue(feeds(6));
    const res = await post(validBody({ override: true }));
    expect(res.status).toBe(400);
  });

  it("rejects non-metro scopes with 422 (no honest n exists for them yet)", async () => {
    fetchMock.mockResolvedValue(feeds(6));
    const res = await post(validBody({ scope: "state", scopeValue: "UT" }));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toContain("metro-scoped this week");
  });

  it("maps a same-version re-promotion to 409 without touching the active row", async () => {
    fetchMock.mockResolvedValue(feeds(6));
    const calls = scriptSvc([
      { data: null, error: { code: "23505", message: "duplicate key" } },
    ]);
    const res = await post(validBody());
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain("bump the version");
    // The published row must survive a version collision: only the failed
    // insert ran — no retire update before or after it.
    expect(calls).toHaveLength(1);
    expect(calls[0].op).toBe("insert");
  });

  it("rejects an inverted fair range", async () => {
    const res = await post(
      validBody({ fairLowDollars: 1400, fairHighDollars: 900 }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects dollar values past the int4-safe $1M bound with 400", async () => {
    const calls = scriptSvc([]);
    const res = await post(
      validBody({ fairLowDollars: 900, fairHighDollars: 25_000_000 }),
    );
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(calls).toHaveLength(0);
  });

  it("returns a generic 500 body on an unexpected insert error", async () => {
    fetchMock.mockResolvedValue(feeds(6));
    scriptSvc([
      {
        data: null,
        error: { code: "22003", message: "integer out of range" },
      },
    ]);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validBody());
    expect(res.status).toBe(500);
    const j = await res.json();
    // Raw Postgres messages stay out of the response body.
    expect(j.error).not.toContain("integer out of range");
    expect(j.error).toContain("check server logs");
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
