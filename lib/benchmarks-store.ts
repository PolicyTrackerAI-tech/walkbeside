import "server-only";
import { cache } from "react";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { regionForZip } from "@/lib/zip-regions";
import type { PriceDataSource } from "@/lib/pricing-data";

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
