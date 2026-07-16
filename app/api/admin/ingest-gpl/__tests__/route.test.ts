import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextResponse } from "next/server";

// Admin gate + session scripted per test; the extraction mapping and the
// naive fallback run for REAL so the founder tool is pinned to the same
// chain the analyzer uses.
vi.mock("@/lib/admin-auth", () => ({ requireAdminApi: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ getUser: vi.fn() }));
vi.mock("@/lib/claude", () => ({
  callClaude: vi.fn(),
  claudeAvailable: vi.fn(),
}));
// The route builds its own service client; feed it a scripted fake.
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/env", () => ({
  PUBLIC: { supabaseUrl: "http://test.local", appUrl: "http://test.local" },
  requireServer: () => "service-key",
}));

import { createClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/admin-auth";
import { getUser } from "@/lib/supabase/server";
import { callClaude, claudeAvailable } from "@/lib/claude";
import { LINE_ITEMS } from "@/lib/pricing-data";
import { matchLineItem } from "@/lib/negotiation/price-list-parse";
import { priceListAnalysisSystem } from "@/lib/negotiation/prompts";
import { extractionConfidence } from "@/lib/extraction-confidence";
import { POST } from "../route";

const requireAdminApiMock = vi.mocked(requireAdminApi);
const getUserMock = vi.mocked(getUser);
const callClaudeMock = vi.mocked(callClaude);
const claudeAvailableMock = vi.mocked(claudeAvailable);
const createClientMock = vi.mocked(createClient);

const basic = LINE_ITEMS.find((l) => l.id === "basic-services")!;
// Whatever benchmark "Death certificates" really maps to — must be per-unit
// for the qty semantics the pipeline relies on.
const certs = matchLineItem("Death certificates")!;
if (!certs.perUnit) throw new Error("fixture assumption broke: certs not perUnit");

/**
 * Queue-based fake (same idiom as the promote route test): each awaited
 * query consumes the next result; table/op/values/filters are recorded so
 * tests can assert exactly what would hit the DB.
 */
type Recorded = {
  table: string;
  op: "insert" | "update" | "select";
  filters: Record<string, unknown>;
  ilikeFilters: Record<string, unknown>;
  values?: Record<string, unknown>;
};
function scriptSvc(
  results: { data?: unknown; error?: { message: string } | null }[],
) {
  const calls: Recorded[] = [];
  const client = {
    from(table: string) {
      const call: Recorded = {
        table,
        op: "select",
        filters: {},
        ilikeFilters: {},
      };
      calls.push(call);
      const q = {
        insert: (v: Record<string, unknown>) => {
          call.op = "insert";
          call.values = v;
          return q;
        },
        update: (v: Record<string, unknown>) => {
          call.op = "update";
          call.values = v;
          return q;
        },
        select: () => q,
        eq: (k: string, v: unknown) => {
          call.filters[k] = v;
          return q;
        },
        ilike: (k: string, v: unknown) => {
          call.ilikeFilters[k] = v;
          return q;
        },
        limit: () => q,
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

function post(body: unknown) {
  return POST(
    new Request("http://test.local/api/admin/ingest-gpl", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const GPL_TEXT = [
  "PROFESSIONAL SERVICES",
  "Basic services fee ......... $2,195",
  "Embalming ......... $895",
  "Caskets $995 - $4,500",
  "Death certificates (10)  $250",
  "Call us at (801) 555-0142 or office@example-home.com",
].join("\n");

function validSave(extra: Record<string, unknown> = {}) {
  return {
    action: "save",
    text: GPL_TEXT,
    zip: "84101",
    homeName: "Example Fictional Home",
    items: [
      { name: "Basic services fee", cents: 219500, matchedItemId: basic.id },
      { name: "Embalming", cents: 89500, matchedItemId: "embalming" },
      {
        name: "Caskets",
        cents: 99500,
        isRange: true,
        centsLow: 99500,
        centsHigh: 450000,
      },
    ],
    ...extra,
  };
}

beforeEach(() => {
  requireAdminApiMock.mockReset();
  requireAdminApiMock.mockResolvedValue(null);
  getUserMock.mockReset();
  getUserMock.mockResolvedValue({
    id: "founder-1",
    email: "founder@test.local",
  } as never);
  callClaudeMock.mockReset();
  claudeAvailableMock.mockReset();
  claudeAvailableMock.mockReturnValue(true);
  createClientMock.mockReset();
});

describe("POST /api/admin/ingest-gpl — gate + validation", () => {
  it("short-circuits when the admin gate denies", async () => {
    requireAdminApiMock.mockResolvedValue(
      NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    );
    const res = await post({ action: "parse", text: GPL_TEXT });
    expect(res.status).toBe(401);
    expect(callClaudeMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown action with 400", async () => {
    const res = await post({ action: "publish", text: GPL_TEXT });
    expect(res.status).toBe(400);
  });

  it("rejects a save with a malformed zip with 400", async () => {
    const calls = scriptSvc([]);
    const res = await post(validSave({ zip: "841" }));
    expect(res.status).toBe(400);
    expect(calls).toHaveLength(0);
  });
});

describe("POST /api/admin/ingest-gpl — parse", () => {
  it("maps Claude output through the analyzer's own mapping (clean, match, range, qty)", async () => {
    callClaudeMock.mockResolvedValue(
      JSON.stringify({
        items: [
          // Header fold the cosmetic cleanup strips (same-benchmark rule).
          { name: "Direct cremation arrangement — Basic services fee", cents: 219500 },
          { name: "Caskets", cents_low: 99500, cents_high: 450000 },
          { name: "Death certificates", cents: 25000, qty: 10 },
          { name: "Some unbenchmarked thing", cents: 5000 },
          { cents: 1200 }, // malformed (no name) — dropped, not a 500
        ],
      }),
    );
    const res = await post({ action: "parse", text: GPL_TEXT });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.extractionMethod).toBe("claude");
    // No total line printed → statedTotalCents stays null (the model never
    // sums items itself — prompt contract 2026-07-16).
    expect(j.statedTotalCents).toBeNull();
    expect(j.items).toEqual([
      { name: "Basic services fee", cents: 219500, matchedItemId: basic.id },
      {
        name: "Caskets",
        cents: 99500,
        isRange: true,
        centsLow: 99500,
        centsHigh: 450000,
      },
      {
        name: "Death certificates",
        cents: 25000,
        matchedItemId: certs.id,
        qty: 10,
      },
      { name: "Some unbenchmarked thing", cents: 5000 },
    ]);
  });

  it("passes a document-printed total through as statedTotalCents", async () => {
    callClaudeMock.mockResolvedValue(
      JSON.stringify({
        items: [{ name: "Basic services fee", cents: 219500 }],
        total_cents: 219500,
      }),
    );
    const res = await post({ action: "parse", text: GPL_TEXT });
    expect((await res.json()).statedTotalCents).toBe(219500);
  });

  it("falls back to naiveExtract when callClaude throws (API failure or max_tokens truncation)", async () => {
    callClaudeMock.mockRejectedValue(
      new Error("Claude response truncated at max_tokens (feature: founder-ingest)"),
    );
    const res = await post({ action: "parse", text: GPL_TEXT });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.extractionMethod).toBe("naive");
    const names = (j.items as { name: string }[]).map((i) => i.name);
    expect(names).toContain("Basic services fee");
    expect(names).toContain("Embalming");
    // The regex parser handles the range + per-unit forms too.
    const caskets = (j.items as Record<string, unknown>[]).find(
      (i) => i.name === "Caskets",
    );
    expect(caskets).toMatchObject({ isRange: true, centsLow: 99500, centsHigh: 450000 });
  });

  it("falls back when Claude returns valid JSON of the wrong shape", async () => {
    callClaudeMock.mockResolvedValue(JSON.stringify({ error: "nope" }));
    const res = await post({ action: "parse", text: GPL_TEXT });
    expect((await res.json()).extractionMethod).toBe("naive");
  });

  it("uses naiveExtract without calling Claude when unavailable", async () => {
    claudeAvailableMock.mockReturnValue(false);
    const res = await post({ action: "parse", text: GPL_TEXT });
    expect((await res.json()).extractionMethod).toBe("naive");
    expect(callClaudeMock).not.toHaveBeenCalled();
  });

  it("runs the analyzer's exact chain: founder-ingest tag, re-baselined cap, eval-gated prompt, cached system", async () => {
    callClaudeMock.mockResolvedValue(JSON.stringify({ items: [] }));
    await post({ action: "parse", text: GPL_TEXT });
    // Any drift here silently diverges founder-ingested benchmark data from
    // the eval-gated analyzer prompt (or drops prompt caching on weekend
    // volume) — pin the whole call shape.
    expect(callClaudeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: "founder-ingest",
        maxTokens: 2000,
        system: priceListAnalysisSystem(),
        cacheSystem: true,
        user: GPL_TEXT,
      }),
    );
  });

  it("drops a non-positive document total instead of stranding the save", async () => {
    // naiveExtract can route "Total ... $0.00" into total_cents; the save
    // schema requires a positive int, so passing 0 through would make the
    // review unsaveable.
    callClaudeMock.mockResolvedValue(
      JSON.stringify({
        items: [{ name: "Basic services fee", cents: 219500 }],
        total_cents: 0,
      }),
    );
    const res = await post({ action: "parse", text: GPL_TEXT });
    expect((await res.json()).statedTotalCents).toBeNull();
  });
});

describe("POST /api/admin/ingest-gpl — save", () => {
  it("inserts a founder_ingest row with the founder's id and a row-computed total", async () => {
    const calls = scriptSvc([{ data: { id: "analysis-1" }, error: null }]);
    const res = await post(validSave());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      id: "analysis-1",
      homeMatched: false,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].table).toBe("price_list_analyses");
    expect(calls[0].op).toBe("insert");
    expect(calls[0].values).toMatchObject({
      user_id: "founder-1",
      zip: "84101",
      extraction_method: "founder_ingest",
      // Ranges are excluded from the quoted subtotal (no single transacted
      // price) — the total comes from the item rows, never a model total.
      total_quoted_cents: 219500 + 89500,
      total_fair_cents: 0,
      potential_savings_cents: 0,
    });
    // Stored text is contact-redacted, same as the analyzer.
    const rawText = calls[0].values!.raw_text as string;
    expect(rawText).not.toContain("office@example-home.com");
    expect(rawText).not.toContain("(801) 555-0142");
    expect(rawText).toContain("[redacted]");
    expect(rawText).toContain("Basic services fee");
    // Confidence is the buildsheet-specced extractionConfidence over the
    // reviewed rows (3 items, no stated total, range excluded from the sum).
    expect(calls[0].values!.confidence).toBe(
      extractionConfidence({
        itemCount: 3,
        statedTotalCents: null,
        itemSumCents: 219500 + 89500,
      }),
    );
  });

  it("caps stored raw_text at 5000 chars", async () => {
    const calls = scriptSvc([{ data: { id: "analysis-1" }, error: null }]);
    const longText = `Basic services fee $2,195\n${"filler line for the raw-text cap test\n".repeat(300)}`;
    expect(longText.length).toBeGreaterThan(5000);
    await post(validSave({ text: longText }));
    expect((calls[0].values!.raw_text as string).length).toBeLessThanOrEqual(5000);
  });

  it("drops a matchedItemId that isn't a real LINE_ITEMS id", async () => {
    const calls = scriptSvc([{ data: { id: "analysis-1" }, error: null }]);
    await post(
      validSave({
        items: [
          { name: "Basic services fee", cents: 219500, matchedItemId: "not-a-real-id" },
        ],
      }),
    );
    const items = calls[0].values!.items as Record<string, unknown>[];
    expect(items[0]).toEqual({ name: "Basic services fee", cents: 219500 });
  });

  it("stamps gpl_url + last_verified_at on an unambiguous name+zip match", async () => {
    const calls = scriptSvc([
      { data: { id: "analysis-1" }, error: null }, // analysis insert
      { data: [{ id: "home-1", name: "Example Fictional Home" }], error: null }, // lookup
      { error: null }, // stamp
    ]);
    const res = await post(
      validSave({ sourceUrl: "https://example-home.test/gpl.pdf" }),
    );
    const j = await res.json();
    expect(j.homeMatched).toBe(true);
    expect(j.warning).toBeUndefined();

    expect(calls[1].table).toBe("funeral_homes");
    expect(calls[1].op).toBe("select");
    expect(calls[1].filters).toEqual({ zip: "84101" });
    expect(calls[1].ilikeFilters).toEqual({ name: "%Example Fictional Home%" });

    expect(calls[2].table).toBe("funeral_homes");
    expect(calls[2].op).toBe("update");
    expect(calls[2].filters).toEqual({ id: "home-1" });
    expect(calls[2].values).toMatchObject({
      gpl_url: "https://example-home.test/gpl.pdf",
    });
    expect(typeof calls[2].values!.last_verified_at).toBe("string");
  });

  it("saves with a warning — and no stamp — when no home matches", async () => {
    const calls = scriptSvc([
      { data: { id: "analysis-1" }, error: null },
      { data: [], error: null }, // no homes
    ]);
    const res = await post(validSave({ sourceUrl: "https://example.test/gpl" }));
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.homeMatched).toBe(false);
    expect(j.warning).toContain("no funeral_homes row matches");
    expect(calls).toHaveLength(2); // no update ran
  });

  it("saves with a warning — and no stamp — when the match is ambiguous", async () => {
    const calls = scriptSvc([
      { data: { id: "analysis-1" }, error: null },
      {
        data: [
          { id: "home-1", name: "Example Home" },
          { id: "home-2", name: "Example Home Downtown" },
        ],
        error: null,
      },
    ]);
    const res = await post(validSave({ sourceUrl: "https://example.test/gpl" }));
    const j = await res.json();
    expect(j.homeMatched).toBe(false);
    expect(j.warning).toContain("more than one home");
    expect(calls).toHaveLength(2);
  });

  it("never touches funeral_homes without a source URL", async () => {
    const calls = scriptSvc([{ data: { id: "analysis-1" }, error: null }]);
    await post(validSave());
    expect(calls.map((c) => c.table)).toEqual(["price_list_analyses"]);
  });

  it("escapes ilike metacharacters — including PostgREST's * wildcard alias — in the home name", async () => {
    const calls = scriptSvc([
      { data: { id: "analysis-1" }, error: null },
      { data: [], error: null },
    ]);
    await post(
      validSave({
        homeName: "100% Local_Home *Star*",
        sourceUrl: "https://example.test/gpl",
      }),
    );
    // % and _ are LIKE metacharacters; * is rewritten to % by PostgREST
    // before it reaches SQL — unescaped, a real name containing * would
    // silently widen the match and could stamp the wrong home's gpl_url.
    expect(calls[1].ilikeFilters).toEqual({
      name: "%100\\% Local\\_Home \\*Star\\*%",
    });
  });

  it("returns a generic 500 on an insert error", async () => {
    scriptSvc([{ data: null, error: { message: "column does not exist" } }]);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(validSave());
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.error).not.toContain("column does not exist");
    expect(j.error).toContain("check server logs");
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
