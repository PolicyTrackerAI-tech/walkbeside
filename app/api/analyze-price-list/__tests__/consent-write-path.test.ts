import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * THE consent write-path tripwire (audit A10-02; the Day-3 load-bearing rule).
 *
 * The READ edge is pinned by benchmark-sources.test.ts (contributed=false
 * rows never aggregate). This file pins the WRITE edge, which until now was
 * enforced only by review:
 *   - absent consent is a DECLINE (`contributed ?? false`) — no checkbox
 *     shown means no consent given;
 *   - a DECLINED analysis must never persist through the legacy pre-migration
 *     fallback (it can't record `contributed`, so a declined row would land
 *     NULL and be aggregated as grandfathered legacy — laundering the flag);
 *   - the fallback fires ONLY for consented rows on a missing-column error;
 *   - demo-sample runs never persist at all (A4-08);
 *   - anonymous checks never persist (nothing to consent to).
 *
 * Claude is scripted unavailable so the deterministic naive parser runs —
 * the persistence semantics under test are identical on either parser.
 */

vi.mock("@/lib/claude", () => ({
  callClaude: vi.fn(),
  claudeAvailable: () => false,
}));
vi.mock("@/lib/benchmarks-store", () => ({
  benchmarksForZip: async () => new Map(),
}));
vi.mock("@/lib/env", () => ({
  FEATURES: { supabase: () => true },
  PUBLIC: { supabaseUrl: "http://test.local", appUrl: "http://test.local" },
  requireServer: () => "service-key",
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient as createServerClient } from "@/lib/supabase/server";
import { POST } from "../route";

const createServerClientMock = vi.mocked(createServerClient);

type InsertRecord = { table: string; values: Record<string, unknown> };

/** Scripted RLS client: records inserts; each consumes the next result. */
function scriptClient(opts: {
  user: { id: string } | null;
  insertResults: { data?: unknown; error?: { code?: string; message: string } | null }[];
}) {
  const inserts: InsertRecord[] = [];
  let i = 0;
  const client = {
    auth: {
      getUser: async () => ({ data: { user: opts.user } }),
    },
    from(table: string) {
      return {
        insert(values: Record<string, unknown>) {
          inserts.push({ table, values });
          const result = opts.insertResults[i++] ?? {
            data: { id: "row-x" },
            error: null,
          };
          return {
            select: () => ({
              single: async () => ({
                data: result.error ? null : (result.data ?? { id: "row-x" }),
                error: result.error ?? null,
              }),
            }),
          };
        },
      };
    },
  };
  // The route awaits createClient() once per request.
  createServerClientMock.mockResolvedValue(
    client as unknown as Awaited<ReturnType<typeof createServerClient>>,
  );
  return { inserts };
}

function analyzeRequest(body: Record<string, unknown>) {
  return new Request("http://test.local/api/analyze-price-list", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: "Basic services fee $2,495\nEmbalming $1,150\nTotal $3,645",
      ...body,
    }),
  });
}

const USER = { id: "family-1" };
const MISSING_COLUMN = { code: "PGRST204", message: "column not found" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("consent write path (declined analyses never persist)", () => {
  it("treats ABSENT consent as a decline: the persisted row carries contributed=false", async () => {
    const { inserts } = scriptClient({ user: USER, insertResults: [{}] });
    const res = await POST(analyzeRequest({}));
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(1);
    expect(inserts[0].table).toBe("price_list_analyses");
    expect(inserts[0].values.contributed).toBe(false);
  });

  it("persists an explicit opt-in as contributed=true", async () => {
    const { inserts } = scriptClient({ user: USER, insertResults: [{}] });
    await POST(analyzeRequest({ contributed: true }));
    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.contributed).toBe(true);
  });

  it("NEVER retries a declined row through the legacy fallback on a missing-column error (the load-bearing pin)", async () => {
    const { inserts } = scriptClient({
      user: USER,
      insertResults: [{ error: MISSING_COLUMN }],
    });
    const res = await POST(analyzeRequest({ contributed: false }));
    // Persistence is best-effort: the family still gets their analysis…
    expect(res.status).toBe(200);
    const json = (await res.json()) as { saved?: boolean };
    expect(json.saved).toBe(false);
    // …but exactly ONE insert was attempted. A second (legacy-shape) insert
    // could not record `contributed`, so the declined row would land NULL and
    // aggregate as a grandfathered legacy row.
    expect(inserts).toHaveLength(1);
  });

  it("the legacy fallback is GONE (audit A9): even a consented row never retries — one insert, saved:false", async () => {
    const { inserts } = scriptClient({
      user: USER,
      insertResults: [{ error: MISSING_COLUMN }],
    });
    const res = await POST(analyzeRequest({ contributed: true }));
    const json = (await res.json()) as { saved?: boolean };
    expect(json.saved).toBe(false);
    expect(inserts).toHaveLength(1);
    expect(inserts[0].values).toHaveProperty("contributed", true);
  });

  it("does NOT launder consent on a transient (non-schema) insert error — no retry even when consented", async () => {
    const { inserts } = scriptClient({
      user: USER,
      insertResults: [{ error: { code: "57014", message: "timeout" } }],
    });
    const res = await POST(analyzeRequest({ contributed: true }));
    expect(((await res.json()) as { saved?: boolean }).saved).toBe(false);
    expect(inserts).toHaveLength(1);
  });

  it("demo-sample runs persist NOTHING, whatever the consent flag says (A4-08)", async () => {
    const { inserts } = scriptClient({ user: USER, insertResults: [] });
    const res = await POST(analyzeRequest({ sample: true, contributed: true }));
    expect(res.status).toBe(200);
    expect(((await res.json()) as { saved?: boolean }).saved).toBe(false);
    expect(inserts).toHaveLength(0);
  });

  it("anonymous checks persist nothing (there is no row to attach consent to)", async () => {
    const { inserts } = scriptClient({ user: null, insertResults: [] });
    const res = await POST(analyzeRequest({ contributed: true }));
    expect(res.status).toBe(200);
    expect(((await res.json()) as { saved?: boolean }).saved).toBe(false);
    expect(inserts).toHaveLength(0);
  });
});
