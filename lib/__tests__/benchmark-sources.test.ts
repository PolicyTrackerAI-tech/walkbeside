import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchBenchmarkRecords } from "../benchmark-sources";

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

describe("fetchBenchmarkRecords dedupe scope", () => {
  it("gives founder_ingest rows a per-document dedupe scope; checker rows stay owner-scoped", async () => {
    // Founder-ingested rows all carry the founder's one user id while each
    // row is a different home's GPL — without a per-row scope, identical
    // prices across homes (fixed state death-cert fees) would dedupe to n=1
    // in the pipeline.
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
});
