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
      // Deterministic tiebreak: with created_at alone, two rows of one
      // user+hash inserted in the same instant could swap collapse
      // survivors between the display fetch and the promote recompute.
      .order("id", { ascending: false })
      .limit(2000);
    // Newest row per (user, source document): every Compare/re-Analyze click
    // inserts a near-duplicate row, and a re-analysis whose extraction
    // wobbled the cents would slip past value-level dedupe as a second
    // observation (A4-04). The query orders created_at desc, so the first
    // row seen per user+input_hash is the family's newest read of that
    // document — older re-analyses are dropped entirely. Hashless legacy
    // rows all pass through (nothing to collapse on).
    //
    // Deliberate: a declined (contributed = false) newest read is skipped
    // BEFORE it can seed seenDocs, so it neither aggregates nor retracts an
    // older consented copy of the same document — consent stays per-row,
    // exactly the pre-hash semantics. (The alternative — newest-decline
    // retracts the document — is a founder call; flipping the skip after
    // the seed would silently suppress consented data, so don't.)
    const seenDocs = new Set<string>();
    for (const r of (data as Array<Record<string, unknown>> | null) ?? []) {
      // Contribute-consent (2026-07-20-hospices-consent.sql): false = the
      // family explicitly declined — excluded. true = consented. NULL (and
      // absent, pre-migration) = legacy row grandfathered under the original
      // de-identified-accumulation disclosure — still included. So the check
      // is `=== false`, not `!== true`.
      if (r.contributed === false) continue;
      const userId = String(r.user_id ?? "");
      const inputHash =
        typeof r.input_hash === "string" && r.input_hash.length > 0
          ? r.input_hash
          : null;
      if (inputHash) {
        const docKey = `${userId}|${inputHash}`;
        if (seenDocs.has(docKey)) continue;
        seenDocs.add(docKey);
      }
      analyses.push({
        userId,
        // Dedupe scope = the source DOCUMENT, not the owner. Hashed rows
        // (2026-08-25-analysis-input-hash.sql) scope per user+hash — two
        // DIFFERENT documents from one user that print the same price (two
        // homes' fixed state death-cert fees, common price points) both
        // count, for founder_ingest and family rows alike. Hashless legacy
        // rows keep the old rules: founder-ingested rows all share the
        // founder's user id but each is a DIFFERENT home's GPL, so they
        // dedupe per row id (like the outreach feed); family rows stay
        // owner-scoped (no dedupeScope → the pipeline uses userId).
        // seedOwnerScope guards the migration straddle: the same document's
        // pre-migration (hashless, owner-scoped) copy must still collapse
        // against its hashed re-analysis — see AnalysisRecord's docstring.
        ...(inputHash
          ? { dedupeScope: `${userId}:${inputHash}`, seedOwnerScope: true }
          : r.extraction_method === "founder_ingest" &&
              typeof r.id === "string"
            ? { dedupeScope: r.id }
            : {}),
        zip: (r.zip as string | null) ?? null,
        items: Array.isArray(r.items)
          ? (r.items as AnalysisRecord["items"])
          : [],
      });
    }
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
