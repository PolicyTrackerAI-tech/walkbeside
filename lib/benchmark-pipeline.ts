/**
 * Crowdsourced benchmark refinement pipeline (roadmap Phase 1 — the moat).
 *
 * Aggregates de-identified line items from stored price-list analyses into
 * per-item (and, where the sample allows, per-region) observed price
 * distributions, and compares them against the current survey-baseline
 * benchmarks in lib/pricing-data.ts.
 *
 * NON-NEGOTIABLES (the moat is defensible only if these never slip):
 * - This module PROPOSES; it never applies. Benchmarks live in code and only
 *   change through a founder-reviewed PR that also adds a /corrections entry
 *   (old range → new range, sample size, date). No auto-apply path exists.
 * - Minimum sample size per group: SMALL_SAMPLE_THRESHOLD (shared with the
 *   partner proof report). Below it, the group reports data but no proposal.
 * - Per-unit items (death certificates etc.) are compared per-each and are
 *   NEVER region-normalized — a state fee costs the same everywhere (checker
 *   invariant). Everything else is de-COLA'd into national terms before
 *   aggregation so a Manhattan quote doesn't read as a national overcharge.
 * - Selection-range items (caskets/urns/vaults shown as $low–$high) carry no
 *   single transacted price and are excluded entirely.
 * - Dedupe: the same user re-checking the same item at the same price counts
 *   once — re-analysis must not multiply into fake sample size.
 *
 * All observed math in integer cents; current benchmarks arrive in dollars
 * (LINE_ITEMS convention) and are converted at the edge.
 */

import { LINE_ITEMS, regionMultiplier } from "./pricing-data";
import { regionForZip } from "./zip-regions";
import { SMALL_SAMPLE_THRESHOLD } from "./partner-report";

/** The slice of a stored analysis this pipeline needs. */
export interface AnalysisRecord {
  /** Owner — used only for dedupe, never surfaced. */
  userId: string;
  /** Zip if captured (column added 2026-07-02; older rows have none). */
  zip?: string | null;
  items: Array<{
    matchedItemId?: string;
    cents: number;
    qty?: number;
    isRange?: boolean;
  }>;
}

export interface GroupStats {
  itemId: string;
  itemName: string;
  /** "national" or a metro label from zip-regions. */
  region: string;
  n: number;
  /** Observed per-item prices in NATIONAL-normalized cents (per-unit items raw per-each). */
  p25Cents: number;
  medianCents: number;
  p75Cents: number;
  /** Current benchmark range in cents (national terms). */
  currentLowCents: number;
  currentHighCents: number;
  /** True when the sample clears SMALL_SAMPLE_THRESHOLD. */
  sufficient: boolean;
  /** Median's position: below/within/above the current fair range. */
  medianVsRange: "below" | "within" | "above";
  /** Present only when sufficient AND drifted — the founder-reviewable suggestion. */
  proposal?: {
    proposedLowCents: number;
    proposedHighCents: number;
    /** Relative drift of the observed median from the range midpoint. */
    driftPct: number;
  };
}

/** Median shift (vs the current range midpoint) below which we propose nothing. */
export const DRIFT_TOLERANCE = 0.15;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

/** Round a cents value to the nearest $5 — proposals shouldn't look like noise. */
function roundTo5Dollars(cents: number): number {
  return Math.round(cents / 500) * 500;
}

export function aggregateBenchmarks(records: AnalysisRecord[]): GroupStats[] {
  // observation buckets: `${itemId}|${region}` -> normalized cents[]
  const buckets = new Map<string, number[]>();
  const seen = new Set<string>();

  for (const rec of records) {
    const zip = (rec.zip ?? "").trim();
    const metro = zip ? regionForZip(zip)?.metro : undefined;
    for (const item of rec.items ?? []) {
      if (!item.matchedItemId || item.isRange || !item.cents || item.cents <= 0)
        continue;
      const def = LINE_ITEMS.find((l) => l.id === item.matchedItemId);
      if (!def) continue;

      const dedupeKey = `${rec.userId}|${item.matchedItemId}|${item.cents}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      // Per-each price for per-unit items; per-unit is never COLA-normalized.
      const perEach =
        def.perUnit && item.qty && item.qty > 1
          ? Math.round(item.cents / item.qty)
          : item.cents;
      const normalized = def.perUnit
        ? perEach
        : Math.round(perEach / regionMultiplier(zip));

      const push = (region: string) => {
        const key = `${item.matchedItemId}|${region}`;
        const arr = buckets.get(key);
        if (arr) arr.push(normalized);
        else buckets.set(key, [normalized]);
      };
      push("national");
      // Region groups get the RAW observed price (families compare locally),
      // except per-unit items, which are national by definition.
      if (metro && !def.perUnit) {
        const key = `${item.matchedItemId}|${metro}`;
        const arr = buckets.get(key);
        if (arr) arr.push(perEach);
        else buckets.set(key, [perEach]);
      }
    }
  }

  const out: GroupStats[] = [];
  for (const [key, values] of buckets) {
    const [itemId, region] = key.split("|");
    const def = LINE_ITEMS.find((l) => l.id === itemId);
    if (!def) continue;
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const median = percentile(sorted, 0.5);
    // Current range in the group's own terms: national groups (and all
    // per-unit items) compare against the national range; a metro group's
    // raw prices compare against nothing here (multipliers vary within a
    // metro bucket), so metro groups also use the national range — they are
    // informational until a metro-specific benchmark process exists.
    const currentLow = def.fairLow * 100;
    const currentHigh = def.fairHigh * 100;
    const mid = (currentLow + currentHigh) / 2;
    const driftPct = mid > 0 ? (median - mid) / mid : 0;
    const sufficient = n >= SMALL_SAMPLE_THRESHOLD;
    const medianVsRange =
      median < currentLow ? "below" : median > currentHigh ? "above" : "within";

    const stats: GroupStats = {
      itemId,
      itemName: def.name,
      region,
      n,
      p25Cents: percentile(sorted, 0.25),
      medianCents: median,
      p75Cents: percentile(sorted, 0.75),
      currentLowCents: currentLow,
      currentHighCents: currentHigh,
      sufficient,
      medianVsRange,
    };
    // Proposals: national groups only (the shipped benchmarks are national),
    // sample sufficient, and drift beyond tolerance.
    if (region === "national" && sufficient && Math.abs(driftPct) > DRIFT_TOLERANCE) {
      stats.proposal = {
        proposedLowCents: roundTo5Dollars(stats.p25Cents),
        proposedHighCents: roundTo5Dollars(stats.p75Cents),
        driftPct: Math.round(driftPct * 100) / 100,
      };
    }
    out.push(stats);
  }

  // Largest samples first; national before metros within an item.
  return out.sort(
    (a, b) =>
      b.n - a.n ||
      a.itemId.localeCompare(b.itemId) ||
      (a.region === "national" ? -1 : 1),
  );
}

/**
 * The founder-facing change spec for one proposal — the text that goes into
 * the PR that edits lib/pricing-data.ts and the /corrections entry. Having
 * the pipeline write the spec (not the change) keeps the sign-off human.
 */
export function proposalSpec(g: GroupStats): string {
  if (!g.proposal) return "";
  const d = (c: number) => `$${Math.round(c / 100)}`;
  return [
    `Item: ${g.itemName} (${g.itemId})`,
    `Current fair range: ${d(g.currentLowCents)}–${d(g.currentHighCents)} (survey baseline)`,
    `Observed (n=${g.n}, de-identified, national-normalized): p25 ${d(g.p25Cents)} · median ${d(g.medianCents)} · p75 ${d(g.p75Cents)}`,
    `Proposed range: ${d(g.proposal.proposedLowCents)}–${d(g.proposal.proposedHighCents)} (median drift ${Math.round(g.proposal.driftPct * 100)}%)`,
    `To apply: edit LINE_ITEMS["${g.itemId}"] fairLow/fairHigh in lib/pricing-data.ts, bump PRICING_LAST_UPDATED, and add the /corrections entry (old → new, n=${g.n}, date).`,
  ].join("\n");
}
