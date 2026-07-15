import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalysisRecord, OutreachQuoteRecord } from "./benchmark-pipeline";

/**
 * The two raw feeds behind the benchmark pipeline — stored checker analyses
 * and itemized outreach quotes. Shared by /admin/benchmarks (display) and
 * /api/admin/benchmarks/promote (the n-gate recomputation) so the server
 * recomputes n from exactly what the page showed.
 *
 * Each fetch is try/catch degrading to an empty array — a missing table or
 * pre-migration schema means fewer observations, never a crash (same posture
 * as lib/partner/report-data.ts).
 */
export async function fetchBenchmarkRecords(admin: SupabaseClient): Promise<{
  analyses: AnalysisRecord[];
  outreach: OutreachQuoteRecord[];
}> {
  let analyses: AnalysisRecord[] = [];
  const outreach: OutreachQuoteRecord[] = [];

  try {
    // select("*") tolerates the pre-migration schema (no zip column yet).
    const { data } = await admin
      .from("price_list_analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    analyses = ((data as Array<Record<string, unknown>> | null) ?? []).map(
      (r) => ({
        userId: String(r.user_id ?? ""),
        zip: (r.zip as string | null) ?? null,
        items: Array.isArray(r.items)
          ? (r.items as AnalysisRecord["items"])
          : [],
      }),
    );
  } catch {
    // no stored analyses → outreach-only aggregation
  }

  // Staged demo/staff checks must never count toward the publish gate:
  // active portal members test their own links, and those uploads would
  // otherwise inflate n. Mirrors the analyzer's isPartnerStaff exclusion
  // (app/api/analyze-price-list/route.ts).
  if (analyses.length > 0) {
    try {
      const { data: members } = await admin
        .from("partner_members")
        .select("user_id")
        .is("deactivated_at", null);
      const staffIds = new Set(
        ((members as Array<{ user_id: unknown }> | null) ?? [])
          .map((m) => m.user_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      );
      if (staffIds.size > 0) {
        analyses = analyses.filter((a) => !staffIds.has(a.userId));
      }
    } catch {
      // On a members-fetch failure, degrade to NOT excluding — better to show
      // data than to hide it on a transient error; the founder reviews the
      // source mix before promoting anyway.
    }
  }

  try {
    const { data } = await admin
      .from("negotiation_outreach")
      .select("id, quote_items, negotiations(zip)")
      .not("quote_items", "is", null)
      .limit(2000);
    for (const r of (data as Array<Record<string, unknown>> | null) ?? []) {
      const id = typeof r.id === "string" ? r.id : null;
      // The negotiations join arrives as an object or a one-row array
      // depending on how PostgREST reads the FK.
      const neg = Array.isArray(r.negotiations)
        ? (r.negotiations[0] as Record<string, unknown> | undefined)
        : (r.negotiations as Record<string, unknown> | null);
      const zip = typeof neg?.zip === "string" ? neg.zip : "";
      if (!id || zip.length < 3) continue;
      const items = parseQuoteItems(r.quote_items);
      if (items.length === 0) continue;
      outreach.push({ outreachId: id, zip, items });
    }
  } catch {
    // no outreach quotes → analyses-only aggregation
  }

  return { analyses, outreach };
}

/** Same validation rules as lib/negotiation/compare.ts parseItems. */
function parseQuoteItems(raw: unknown): OutreachQuoteRecord["items"] {
  if (!Array.isArray(raw)) return [];
  const out: OutreachQuoteRecord["items"] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const lineItemId = typeof e.lineItemId === "string" ? e.lineItemId : null;
    const name = typeof e.name === "string" ? e.name : null;
    const cents =
      typeof e.cents === "number" && Number.isFinite(e.cents) ? e.cents : null;
    if (!lineItemId || !name || cents == null || cents < 0) continue;
    out.push({ lineItemId, name, cents });
  }
  return out;
}
