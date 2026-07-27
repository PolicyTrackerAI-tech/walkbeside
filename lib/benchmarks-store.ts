import "server-only";
import { cache } from "react";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { regionForZip } from "@/lib/zip-regions";
import type { PriceDataSource } from "@/lib/pricing-data";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";
import { LINE_ITEMS } from "@/lib/pricing-data";
import { compareBenchmarkVersions } from "@/lib/verified-metros";

/**
 * Server-side reads of regional_benchmarks — the founder-promoted
 * verified/community overrides of the modeled catalog. All amounts are CENTS
 * (the table's unit); lib/pricing-data LINE_ITEMS stay in dollars — callers
 * convert deliberately at the edge.
 *
 * Reads via the service role (the table is RLS deny-all). Every read is
 * try/catch degrading to empty: a missing table (migration not applied yet)
 * means modeled everywhere, never a crash — same posture as
 * lib/partner/report-data.ts.
 */

export interface RegionalBenchmark {
  lineItemId: string;
  fairLowCents: number;
  fairHighCents: number;
  predatoryAtCents: number | null;
  tier: "verified" | "community";
  n: number;
  version: string;
  effectiveAt: string;
  scope: "zip3" | "metro" | "state";
}

interface BenchmarkRow {
  line_item_id: string;
  scope: "zip3" | "metro" | "state";
  scope_value: string;
  fair_low_cents: number;
  fair_high_cents: number;
  predatory_at_cents: number | null;
  tier: "verified" | "community";
  n_data_points: number;
  version: string;
  effective_at: string;
}

// Narrower scope wins per line item (lower rank = narrower).
const SCOPE_RANK: Record<RegionalBenchmark["scope"], number> = {
  zip3: 0,
  metro: 1,
  state: 2,
};

/**
 * Every active benchmark override matching a zip, keyed by line_item_id.
 * Per item the NARROWEST scope wins (zip3 > metro > state); ties within a
 * scope pick the latest effective_at. Empty Map when nothing matches, the
 * zip is too short, or the table isn't there yet.
 *
 * Wrapped in React cache() — per-request memo so a page and its components
 * share one query (first use of cache() in this repo; it's a no-op memo
 * outside a React request, e.g. in unit tests).
 */
export const benchmarksForZip = cache(
  async (zip: string): Promise<Map<string, RegionalBenchmark>> => {
    const picked = new Map<string, RegionalBenchmark>();
    if (!zip || zip.length < 3) return picked;

    const zip3 = zip.slice(0, 3);
    const region = regionForZip(zip);
    // Which scope_value belongs to which scope, paired in JS below — a
    // PostgREST .or() string can't safely carry metro labels containing
    // commas/slashes/parens.
    const scopeValues: Record<RegionalBenchmark["scope"], string | null> = {
      zip3,
      metro: region?.metro ?? null,
      state: region?.state ?? null,
    };

    try {
      const svc = createServiceClient(
        PUBLIC.supabaseUrl,
        requireServer("SUPABASE_SERVICE_ROLE_KEY"),
      );
      const { data, error } = await svc
        .from("regional_benchmarks")
        .select(
          "line_item_id, scope, scope_value, fair_low_cents, fair_high_cents, predatory_at_cents, tier, n_data_points, version, effective_at",
        )
        .eq("active", true)
        .in(
          "scope_value",
          Object.values(scopeValues).filter((v): v is string => Boolean(v)),
        );
      if (error) return picked;

      for (const row of (data ?? []) as BenchmarkRow[]) {
        // Drop cross-scope matches (e.g. a state row whose value collided
        // with a metro label) — the scope must own the value it matched on.
        if (scopeValues[row.scope] !== row.scope_value) continue;
        const prev = picked.get(row.line_item_id);
        if (
          prev &&
          (SCOPE_RANK[prev.scope] < SCOPE_RANK[row.scope] ||
            (SCOPE_RANK[prev.scope] === SCOPE_RANK[row.scope] &&
              prev.effectiveAt >= row.effective_at))
        ) {
          continue;
        }
        picked.set(row.line_item_id, {
          lineItemId: row.line_item_id,
          fairLowCents: row.fair_low_cents,
          fairHighCents: row.fair_high_cents,
          predatoryAtCents: row.predatory_at_cents,
          tier: row.tier,
          n: row.n_data_points,
          version: row.version,
          effectiveAt: row.effective_at,
          scope: row.scope,
        });
      }
    } catch {
      // table not applied yet / env missing → modeled everywhere
    }
    return picked;
  },
);

/** The winning override for one line item at a zip, or null (→ modeled). */
export async function benchmarkFor(
  zip: string,
  lineItemId: string,
): Promise<RegionalBenchmark | null> {
  const map = await benchmarksForZip(zip);
  return map.get(lineItemId) ?? null;
}

/**
 * The zip's data tier for labeling: verified if ANY verified override
 * matched, else community if any community override, else modeled. n is the
 * MINIMUM n_data_points across the winning tier's rows (conservative — the
 * number we can defend); lastUpdated is the latest effective_at (YYYY-MM-DD).
 */
export async function tierForZip(zip: string): Promise<{
  tier: "verified" | "community" | "modeled";
  n: number | null;
  itemCount: number;
  lastUpdated: string | null;
}> {
  const map = await benchmarksForZip(zip);
  const all = [...map.values()];
  const verified = all.filter((b) => b.tier === "verified");
  const winning = verified.length
    ? verified
    : all.filter((b) => b.tier === "community");
  if (!winning.length) {
    return { tier: "modeled", n: null, itemCount: 0, lastUpdated: null };
  }
  return {
    tier: winning[0].tier,
    n: Math.min(...winning.map((b) => b.n)),
    itemCount: winning.length,
    lastUpdated: winning
      .map((b) => b.effectiveAt)
      .sort()
      .at(-1)!
      .slice(0, 10),
  };
}

/** DB-backed counterpart of lib/pricing-data dataSourceForZip(). */
export async function dataSourceForZipLive(
  zip: string,
): Promise<PriceDataSource> {
  return (await tierForZip(zip)).tier;
}

export interface ActiveBenchmarkRow extends RegionalBenchmark {
  scopeValue: string;
  sources: { name: string; url?: string; kind?: string; accessed?: string }[];
}

interface ActiveRowRaw extends BenchmarkRow {
  sources: unknown;
}

// Price-like text in a free-text provenance field ($1,395 / 1,395 / 1395.00)
// — deliberately over-matches (fail closed): losing a provenance note is
// safe, publishing a price inside one is not.
const PRICE_LIKE = /\$\s*\d|\b\d{1,3},\d{3}\b|\b\d+\.\d{2}\b/;

/**
 * Sources are provenance, never prices: keep only the four known string
 * fields per entry and drop everything else — and drop the whole entry when
 * any of its free-text fields contains price-like text, so neither a
 * numeric field nor a price written inside a string can reach a public
 * payload (guardrail #4; the sources note is founder free text).
 */
function sanitizeSources(raw: unknown): ActiveBenchmarkRow["sources"] {
  if (!Array.isArray(raw)) return [];
  const out: ActiveBenchmarkRow["sources"] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.name !== "string" || !e.name) continue;
    const clean: ActiveBenchmarkRow["sources"][number] = { name: e.name };
    if (typeof e.url === "string") clean.url = e.url;
    if (typeof e.kind === "string") clean.kind = e.kind;
    if (typeof e.accessed === "string") clean.accessed = e.accessed;
    if (
      [clean.name, clean.url ?? "", clean.kind ?? ""].some((v) =>
        PRICE_LIKE.test(v),
      )
    ) {
      continue;
    }
    out.push(clean);
  }
  return out;
}

const CATALOG_IDS = new Set(LINE_ITEMS.map((it) => it.id));
const ACTIVE_PAGE = 1000;

/**
 * Every publishable benchmark row, all scopes — the read behind the public
 * Fair-Price Index surfaces (verified-metros section + the data endpoint).
 * Aggregates plus sanitized provenance only. Throws on any read failure —
 * use listActiveBenchmarks() for the degrade-to-empty posture; the data
 * endpoint calls this directly so a store failure is distinguishable from
 * a genuinely empty dataset (and can be served uncached).
 *
 * Publishability is re-enforced at this read edge even though the promote
 * route already gates it (the migration has no CHECK constraint and
 * hand-SQL inserts exist in the real workflow — guardrail #4):
 * - n ≥ SMALL_SAMPLE_THRESHOLD, or the row dies here;
 * - only line_item_ids in the LINE_ITEMS catalog (rendered surfaces skip
 *   unknown ids, so the citable dataset must too);
 * - one winner per (scope, scope_value, line_item_id): latest effective_at,
 *   numeric-aware version tiebreak — a failed retire can leave duplicate
 *   active rows, and the dataset must never contradict the pages' counts.
 *
 * Paged reads (Supabase caps a single select at 1,000 rows — silent
 * truncation would corrupt published counts at scale). Ordered by
 * scope_value, then line_item_id.
 */
export async function listActiveBenchmarksOrThrow(): Promise<
  ActiveBenchmarkRow[]
> {
  const svc = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const raw: ActiveRowRaw[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await svc
      .from("regional_benchmarks")
      .select(
        "line_item_id, scope, scope_value, fair_low_cents, fair_high_cents, predatory_at_cents, tier, n_data_points, version, effective_at, sources",
      )
      .eq("active", true)
      .order("scope_value")
      .order("line_item_id")
      .order("version")
      .range(from, from + ACTIVE_PAGE - 1);
    if (error) {
      throw new Error(`regional_benchmarks read failed: ${error.message}`);
    }
    const page = (data ?? []) as ActiveRowRaw[];
    raw.push(...page);
    if (page.length < ACTIVE_PAGE) break;
    from += ACTIVE_PAGE;
  }

  const winners = new Map<string, ActiveRowRaw>();
  for (const row of raw) {
    if (row.n_data_points < SMALL_SAMPLE_THRESHOLD) continue;
    if (!CATALOG_IDS.has(row.line_item_id)) continue;
    const key = `${row.scope}|${row.scope_value}|${row.line_item_id}`;
    const prev = winners.get(key);
    if (
      prev &&
      (prev.effective_at > row.effective_at ||
        (prev.effective_at === row.effective_at &&
          compareBenchmarkVersions(prev.version, row.version) >= 0))
    ) {
      continue;
    }
    winners.set(key, row);
  }

  return [...winners.values()]
    .sort((a, b) =>
      a.scope_value === b.scope_value
        ? a.line_item_id.localeCompare(b.line_item_id)
        : a.scope_value.localeCompare(b.scope_value),
    )
    .map((row) => ({
      lineItemId: row.line_item_id,
      fairLowCents: row.fair_low_cents,
      fairHighCents: row.fair_high_cents,
      predatoryAtCents: row.predatory_at_cents,
      tier: row.tier,
      n: row.n_data_points,
      version: row.version,
      effectiveAt: row.effective_at,
      scope: row.scope,
      scopeValue: row.scope_value,
      sources: sanitizeSources(row.sources),
    }));
}

/** listActiveBenchmarksOrThrow with the pages' degrade-to-empty posture. */
export async function listActiveBenchmarks(): Promise<ActiveBenchmarkRow[]> {
  try {
    return await listActiveBenchmarksOrThrow();
  } catch {
    // table not applied yet / env missing → nothing to list
    return [];
  }
}
