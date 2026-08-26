import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchBenchmarkRecords } from "../benchmark-sources";
import { aggregateBenchmarks } from "../benchmark-pipeline";

/**
 * Table-keyed fake: each from(table) resolves the scripted result for that
 * table (chainable, thenable — same shape the real client exposes to this
 * module). A table scripted with `throws` rejects, exercising the
 * degrade-to-empty / degrade-to-not-excluding paths.
 */
function fakeClient(
  script: Record<string, { data?: unknown; throws?: boolean }>,
): SupabaseClient {
  return {
    from(table: string) {
      const entry = script[table] ?? { data: null };
      const q = {
        select: () => q,
        order: () => q,
        limit: () => q,
        is: () => q,
        not: () => q,
        then: (
          resolve: (r: unknown) => void,
          reject: (e: unknown) => void,
        ) => {
          if (entry.throws) reject(new Error(`${table} unavailable`));
          else resolve({ data: entry.data ?? null, error: null });
        },
      };
      return q;
    },
  } as unknown as SupabaseClient;
}

const analysisRow = (userId: string) => ({
  user_id: userId,
  zip: "84101",
  items: [{ matchedItemId: "basic-services", cents: 1000_00 }],
});

describe("fetchBenchmarkRecords staff exclusion", () => {
  it("drops analyses from active partner members (staged/demo checks never count toward the gate)", async () => {
    const admin = fakeClient({
      price_list_analyses: {
        data: [analysisRow("family-1"), analysisRow("staff-1"), analysisRow("family-2")],
      },
      partner_members: { data: [{ user_id: "staff-1" }] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    expect(analyses.map((a) => a.userId)).toEqual(["family-1", "family-2"]);
  });

  it("keeps analyses from users who were deactivated out of the members result", async () => {
    const admin = fakeClient({
      price_list_analyses: { data: [analysisRow("ex-staff")] },
      // The query filters deactivated_at is null, so a deactivated member
      // simply never appears in the result set.
      partner_members: { data: [] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    expect(analyses.map((a) => a.userId)).toEqual(["ex-staff"]);
  });

  it("degrades to NOT excluding when the members fetch fails", async () => {
    const admin = fakeClient({
      price_list_analyses: {
        data: [analysisRow("family-1"), analysisRow("staff-1")],
      },
      partner_members: { throws: true },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    // Better to show data than to hide it on a transient error — the founder
    // reviews the source mix before promoting.
    expect(analyses.map((a) => a.userId)).toEqual(["family-1", "staff-1"]);
  });
});

describe("fetchBenchmarkRecords contribute consent", () => {
  it("excludes contributed=false; keeps true, NULL, and pre-migration rows", async () => {
    // Three-state pin (2026-07-20-hospices-consent.sql): false = the family
    // explicitly declined (excluded); true = consented; NULL — and absent,
    // on a pre-migration schema where select(*) returns no such key — is a
    // legacy row grandfathered under the original disclosure (included).
    const admin = fakeClient({
      price_list_analyses: {
        data: [
          { contributed: true, ...analysisRow("consented") },
          { contributed: false, ...analysisRow("declined") },
          { contributed: null, ...analysisRow("legacy-null") },
          analysisRow("pre-migration"),
        ],
      },
      partner_members: { data: [] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    expect(analyses.map((a) => a.userId)).toEqual([
      "consented",
      "legacy-null",
      "pre-migration",
    ]);
  });
});

describe("fetchBenchmarkRecords dedupe scope", () => {
  it("gives founder_ingest rows a per-document dedupe scope; checker rows stay owner-scoped", async () => {
    // Founder-ingested rows all carry the founder's one user id while each
    // row is a different home's GPL — without a per-row scope, identical
    // prices across homes (fixed state death-cert fees) would dedupe to n=1
    // in the pipeline. Hashless legacy rows (pre-2026-08-25 and explicit
    // NULL alike) keep exactly this behavior.
    const admin = fakeClient({
      price_list_analyses: {
        data: [
          {
            id: "row-1",
            extraction_method: "founder_ingest",
            ...analysisRow("founder"),
          },
          {
            id: "row-2",
            extraction_method: "founder_ingest",
            input_hash: null,
            ...analysisRow("founder"),
          },
          { id: "row-3", extraction_method: "claude", ...analysisRow("family-1") },
        ],
      },
      partner_members: { data: [] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    expect(analyses.map((a) => a.dedupeScope)).toEqual([
      "row-1",
      "row-2",
      undefined,
    ]);
  });

  it("scopes hashed rows per user+document — founder_ingest included", async () => {
    // With an input_hash (2026-08-25-analysis-input-hash.sql) the scope is
    // the source document, whoever stored it.
    const admin = fakeClient({
      price_list_analyses: {
        data: [
          {
            id: "row-1",
            extraction_method: "founder_ingest",
            input_hash: "hash-gpl-a",
            ...analysisRow("founder"),
          },
          {
            id: "row-2",
            extraction_method: "claude",
            input_hash: "hash-quote-b",
            ...analysisRow("family-1"),
          },
        ],
      },
      partner_members: { data: [] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    expect(analyses.map((a) => a.dedupeScope)).toEqual([
      "founder:hash-gpl-a",
      "family-1:hash-quote-b",
    ]);
  });
});

describe("fetchBenchmarkRecords source-document collapse (A4-04)", () => {
  it("keeps only the NEWEST row per user+input_hash — a re-Analyze whose extraction wobbled the cents adds no second observation", async () => {
    // The query orders created_at desc; the fake returns rows as scripted,
    // so array order IS newest-first here.
    const admin = fakeClient({
      price_list_analyses: {
        data: [
          {
            input_hash: "hash-doc-a",
            user_id: "family-1",
            zip: "84101",
            items: [{ matchedItemId: "basic-services", cents: 1001_00 }],
          },
          {
            // Older re-analysis of the SAME document, cents wobbled — must
            // be dropped entirely, not just value-deduped.
            input_hash: "hash-doc-a",
            user_id: "family-1",
            zip: "84101",
            items: [{ matchedItemId: "basic-services", cents: 1000_00 }],
          },
          {
            // Same document text pasted by a DIFFERENT user — their own
            // observation survives.
            input_hash: "hash-doc-a",
            ...analysisRow("family-2"),
          },
        ],
      },
      partner_members: { data: [] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    expect(analyses.map((a) => a.userId)).toEqual(["family-1", "family-2"]);
    // The survivor is the newest read of the document.
    expect(analyses[0].items[0].cents).toBe(1001_00);
  });

  it("counts two DIFFERENT documents from one user that print the same price as TWO observations (the mirror bug)", async () => {
    // Under owner-scoped dedupe these collapsed to n=1; per-document scopes
    // carry both through the pipeline.
    const admin = fakeClient({
      price_list_analyses: {
        data: [
          { input_hash: "hash-doc-a", ...analysisRow("family-1") },
          { input_hash: "hash-doc-b", ...analysisRow("family-1") },
        ],
      },
      partner_members: { data: [] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    expect(analyses.map((a) => a.dedupeScope)).toEqual([
      "family-1:hash-doc-a",
      "family-1:hash-doc-b",
    ]);
    const national = aggregateBenchmarks(analyses).find(
      (g) => g.itemId === "basic-services" && g.region === "national",
    );
    expect(national?.n).toBe(2);
  });

  it("migration straddle: a hashed re-analysis suppresses its pre-migration owner-scoped copy (n=1, not 2)", async () => {
    // The same document analyzed before the input_hash migration (hashless,
    // owner-scoped) and again after (hashed, user+hash-scoped) must not
    // count twice — the hashed row seeds the legacy owner key
    // (AnalysisRecord.seedOwnerScope). Hashed rows always sort newer, so
    // the seed lands before the legacy duplicate is examined.
    const admin = fakeClient({
      price_list_analyses: {
        data: [
          { input_hash: "hash-doc-a", ...analysisRow("family-1") },
          // Pre-migration copy of the same document: no hash, same cents.
          analysisRow("family-1"),
        ],
      },
      partner_members: { data: [] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    // Both rows reach the pipeline (the feed can't tell they're one doc)…
    expect(analyses).toHaveLength(2);
    // …but the seed collapses them there.
    const national = aggregateBenchmarks(analyses).find(
      (g) => g.itemId === "basic-services" && g.region === "national",
    );
    expect(national?.n).toBe(1);
  });

  it("a declined newest read neither aggregates nor retracts an older consented copy (consent is per-row)", async () => {
    // Deliberate semantics (matches the pre-hash pipeline): contributed=false
    // is skipped BEFORE it can seed the collapse set, so the family's older
    // consented copy of the same document still counts. Flipping the skip
    // after the seed would let a decline silently suppress consented data.
    const admin = fakeClient({
      price_list_analyses: {
        data: [
          {
            contributed: false,
            input_hash: "hash-doc-a",
            ...analysisRow("family-1"),
          },
          {
            contributed: true,
            input_hash: "hash-doc-a",
            ...analysisRow("family-1"),
          },
        ],
      },
      partner_members: { data: [] },
    });
    const { analyses } = await fetchBenchmarkRecords(admin);
    expect(analyses).toHaveLength(1);
    expect(analyses[0].userId).toBe("family-1");
  });
});
