import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminApi } from "@/lib/admin-auth";
import { getUser } from "@/lib/supabase/server";
import { callClaude, claudeAvailable } from "@/lib/claude";
import { priceListAnalysisSystem } from "@/lib/negotiation/prompts";
import {
  matchLineItem,
  cleanItemName,
  naiveExtract,
  stripCodeFence,
  type RawItem,
} from "@/lib/negotiation/price-list-parse";
import { LINE_ITEMS } from "@/lib/pricing-data";
import { extractionConfidence } from "@/lib/extraction-confidence";
import { redactContact } from "@/lib/redact";
import { readLimitedJson } from "@/lib/http-guards";

/**
 * Founder GPL ingest — the write path behind /admin/ingest-gpl (D2).
 *
 * Two actions on one admin-gated endpoint:
 * - `parse`: run the pasted GPL text through the analyzer's own extraction
 *   chain (same prompt, same fallback) and return review-ready items. This is
 *   deliberately a minimal founder-tool DUPLICATE of the analyzer route's
 *   mapping, not a refactor of it — the checker's mapping is
 *   correctness-law and mid-sprint refactors of it are how regressions
 *   happen. No classification/fair-range math here: the benchmark pipeline
 *   consumes only matchedItemId/cents/qty/isRange (lib/benchmark-pipeline.ts
 *   AnalysisRecord).
 * - `save`: after the founder eyeballed/edited the items (the human gate),
 *   service-role insert a price_list_analyses row tagged
 *   extraction_method 'founder_ingest', and — when a source URL was given —
 *   stamp gpl_url/last_verified_at on the unambiguously matched
 *   funeral_homes row (no match / ambiguous match = save the analysis
 *   anyway and return a warning).
 *
 * No RATE_LIMITS entry: the proxy's per-path limits guard public POSTs;
 * this route is session-gated admin tooling (requireAdminApi first).
 */

const ParseBody = z.object({
  action: z.literal("parse"),
  text: z.string().min(20).max(20000),
});

// The reviewed rows the founder saves. cents bounds match the promote
// route's int4-safe posture ($1M in cents).
const ReviewedItem = z.object({
  name: z.string().trim().min(1).max(200),
  cents: z.number().int().min(0).max(100_000_000),
  matchedItemId: z.string().max(120).optional(),
  qty: z.number().int().min(2).max(999).optional(),
  isRange: z.boolean().optional(),
  centsLow: z.number().int().min(0).max(100_000_000).optional(),
  centsHigh: z.number().int().min(0).max(100_000_000).optional(),
});

const SaveBody = z.object({
  action: z.literal("save"),
  text: z.string().min(20).max(20000),
  zip: z.string().regex(/^\d{5}$/),
  homeName: z.string().trim().min(2).max(160),
  sourceUrl: z.string().url().max(500).optional(),
  // The parse step's document-stated total, passed back so confidence can
  // cross-check it against the reviewed item sum. The model emits one ONLY
  // when the document prints a total line (prompt contract, 2026-07-16) —
  // it is never a computed sum.
  statedTotalCents: z.number().int().positive().max(1_000_000_000).nullish(),
  items: z.array(ReviewedItem).min(1).max(200),
});

const Body = z.discriminatedUnion("action", [ParseBody, SaveBody]);

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const limited = await readLimitedJson(req, 200);
  if (!limited.ok)
    return NextResponse.json({ error: limited.error }, { status: limited.status });
  const parsed = Body.safeParse(limited.data);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  if (parsed.data.action === "parse") return handleParse(parsed.data.text);
  return handleSave(parsed.data);
}

/**
 * The analyzer's extraction chain, founder-tool variant
 * (app/api/analyze-price-list/route.ts:90-147 is the reference).
 */
async function handleParse(text: string) {
  let extracted: { items: RawItem[]; total_cents?: number } = { items: [] };
  let extractionMethod: "claude" | "naive" = "naive";

  if (claudeAvailable()) {
    try {
      const out = await callClaude({
        feature: "founder-ingest",
        system: priceListAnalysisSystem(),
        user: text,
        maxTokens: 2000, // same prompt as analyzer-extract → same sonnet-5 re-baselined cap
        cacheSystem: true,
      });
      const parsedOut = JSON.parse(stripCodeFence(out)) as {
        items?: unknown;
        total_cents?: number;
      };
      if (!Array.isArray(parsedOut.items)) throw new Error("unexpected shape");
      extracted = parsedOut as { items: RawItem[]; total_cents?: number };
      extractionMethod = "claude";
    } catch {
      // callClaude throws on API failure AND on max_tokens truncation — both
      // degrade to the deterministic regex parser, exactly like the analyzer.
      extracted = naiveExtract(text);
    }
  } else {
    extracted = naiveExtract(text);
  }

  const items = extracted.items
    // A malformed model item (missing/non-string name) is dropped rather than
    // 500ing the founder mid-ingest — the review table is the safety net.
    .filter((raw) => raw && typeof raw.name === "string" && raw.name.trim())
    .map((raw) => {
      const name = cleanItemName(raw.name);
      // Selection-range item (caskets/vaults/urns): keep the range; the
      // benchmark pipeline excludes it, the review table shows it.
      if (raw.cents_low != null && raw.cents_high != null) {
        return {
          name,
          cents: raw.cents_low,
          isRange: true,
          centsLow: raw.cents_low,
          centsHigh: raw.cents_high,
        };
      }
      const cents = raw.cents ?? 0;
      const matched = matchLineItem(name);
      // qty is meaningful only on per-unit items (death certs) — same rule
      // as the analyzer, so the pipeline's per-each math holds.
      const qty =
        matched?.perUnit && raw.qty && raw.qty > 1 ? raw.qty : undefined;
      return {
        name,
        cents,
        ...(matched ? { matchedItemId: matched.id } : {}),
        ...(qty ? { qty } : {}),
      };
    });

  return NextResponse.json({
    items,
    // Present ONLY when the document printed a total line (prompt contract) —
    // the review UI computes its displayed total from the item rows.
    statedTotalCents: extracted.total_cents ?? null,
    extractionMethod,
  });
}

async function handleSave(body: z.infer<typeof SaveBody>) {
  // requireAdminApi already passed, so a user exists; this is a defensive
  // re-read to attribute the row to the founder's own account.
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Server-side sanitation: a matchedItemId must be a real LINE_ITEMS id
  // (the client sends them from a fixed <select>; anything else is dropped,
  // not trusted into the benchmark feed).
  const items = body.items.map((i) => ({
    name: i.name,
    cents: i.cents,
    ...(i.matchedItemId && LINE_ITEMS.some((li) => li.id === i.matchedItemId)
      ? { matchedItemId: i.matchedItemId }
      : {}),
    ...(i.qty ? { qty: i.qty } : {}),
    ...(i.isRange
      ? {
          isRange: true,
          centsLow: i.centsLow ?? i.cents,
          centsHigh: i.centsHigh ?? i.cents,
        }
      : {}),
  }));

  // Range/selection items carry no single transacted price — excluded from
  // the quoted subtotal, same as the analyzer.
  const itemSumCents = items
    .filter((i) => !i.isRange)
    .reduce((s, i) => s + (i.cents || 0), 0);

  const confidence = extractionConfidence({
    itemCount: items.length,
    statedTotalCents: body.statedTotalCents ?? null,
    itemSumCents,
  });

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data: inserted, error: insertError } = await admin
    .from("price_list_analyses")
    .insert({
      user_id: user.id,
      // Same redaction posture as the analyzer: stored text is
      // contact-redacted — the benchmark pipeline needs prices, not contacts.
      raw_text: redactContact(body.text).slice(0, 5000),
      items,
      zip: body.zip,
      total_quoted_cents: itemSumCents,
      total_fair_cents: 0,
      potential_savings_cents: 0,
      extraction_method: "founder_ingest",
      confidence,
    })
    .select("id")
    .single();
  if (insertError) {
    // Raw Postgres messages never reach the response body.
    console.error("founder ingest insert failed", insertError);
    return NextResponse.json(
      { error: "save failed — check server logs" },
      { status: 500 },
    );
  }
  const analysisId = (inserted as { id: string } | null)?.id;

  // Source-URL provenance: stamp the home's gpl_url/last_verified_at
  // (columns from 2026-07-17-regional-benchmarks.sql, applied) — but only on
  // an UNAMBIGUOUS name+zip match. The analysis row above is already saved
  // either way; stamping is best-effort provenance, never a failure.
  let homeMatched = false;
  let warning: string | undefined;
  if (body.sourceUrl) {
    // Escape ilike metacharacters so a home name containing %/_ can't widen
    // the match.
    const pattern = `%${body.homeName.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
    const { data: homes, error: homesError } = await admin
      .from("funeral_homes")
      .select("id, name")
      .eq("zip", body.zip)
      .ilike("name", pattern)
      .limit(2);
    if (homesError) {
      console.error("founder ingest home lookup failed", homesError);
      warning = "saved — but the home lookup failed, so gpl_url was not stamped";
    } else if (!homes || homes.length === 0) {
      warning = `saved — no funeral_homes row matches "${body.homeName}" at ${body.zip}, so gpl_url was not stamped (import/vet the home, then re-verify)`;
    } else if (homes.length > 1) {
      warning = `saved — "${body.homeName}" at ${body.zip} matches more than one home, so gpl_url was not stamped (use the home's exact directory name)`;
    } else {
      const { error: stampError } = await admin
        .from("funeral_homes")
        .update({
          gpl_url: body.sourceUrl,
          last_verified_at: new Date().toISOString(),
        })
        .eq("id", homes[0].id);
      if (stampError) {
        console.error("founder ingest gpl_url stamp failed", stampError);
        warning = "saved — but stamping gpl_url failed, check server logs";
      } else {
        homeMatched = true;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    id: analysisId,
    homeMatched,
    ...(warning ? { warning } : {}),
  });
}
