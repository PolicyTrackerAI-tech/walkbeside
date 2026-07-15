/**
 * Crowdsourced benchmark refinement pipeline (roadmap Phase 1 — the moat).
 *
 * Aggregates de-identified line items from stored price-list analyses — and,
 * via aggregateAllBenchmarks, itemized quotes from negotiation outreach —
 * into per-item (and, where the sample allows, per-region) observed price
 * distributions, and compares them against the current survey-baseline
 * benchmarks in lib/pricing-data.ts.
 *
 * NON-NEGOTIABLES (the moat is defensible only if these never slip):
 * - This module PROPOSES; it never auto-applies a CODE benchmark change.
 *   LINE_ITEMS ranges live in lib/pricing-data.ts and only change through a
 *   founder-reviewed PR that also adds a /corrections entry (old range → new
 *   range, sample size, date). The separate promote path
 *   (/api/admin/benchmarks/promote) writes tier rows to the
 *   regional_benchmarks DATA table — behind a server-recomputed n≥5 gate
 *   with no override, only when the founder clicks publish. That is a gated
 *   human publish, not an auto-apply.
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

/**
 * The slice of a negotiation_outreach row this pipeline needs — a real
 * itemized quote from a home. quote_items carry no qty/isRange: each entry
 * is already a single transacted per-each price.
 */
export interface OutreachQuoteRecord {
  /** Outreach row id — scopes dedupe (outreach rows carry no userId). */
  outreachId: string;
  /** The parent negotiation's zip. */
  zip: string;
  items: Array<{ lineItemId: string; name: string; cents: number }>;
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
  /** Post-dedupe observations per feed — set by aggregateAllBenchmarks only. */
  sources?: { analyses: number; outreach: number };
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

/** One group's observations plus how many survived dedupe from each feed. */
interface Bucket {
  values: number[];
  analyses: number;
  outreach: number;
}

function collectObservations(
  analyses: AnalysisRecord[],
  outreach: OutreachQuoteRecord[],
): Map<string, Bucket> {
  // observation buckets: `${itemId}|${region}` -> normalized cents[]
  const buckets = new Map<string, Bucket>();
  const seen = new Set<string>();

  const push = (key: string, cents: number, source: "analyses" | "outreach") => {
    const bucket = buckets.get(key) ?? { values: [], analyses: 0, outreach: 0 };
    bucket.values.push(cents);
    bucket[source] += 1;
    buckets.set(key, bucket);
  };

  for (const rec of analyses) {
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

      push(`${item.matchedItemId}|national`, normalized, "analyses");
      // Region groups get the RAW observed price (families compare locally),
      // except per-unit items, which are national by definition.
      if (metro && !def.perUnit) {
        push(`${item.matchedItemId}|${metro}`, perEach, "analyses");
      }
    }
  }

  for (const rec of outreach) {
    const zip = (rec.zip ?? "").trim();
    const metro = zip ? regionForZip(zip)?.metro : undefined;
    for (const item of rec.items ?? []) {
      if (!item.lineItemId || !item.cents || item.cents <= 0) continue;
      const def = LINE_ITEMS.find((l) => l.id === item.lineItemId);
      if (!def) continue;

      const dedupeKey = `${rec.outreachId}|${item.lineItemId}|${item.cents}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      // quote_items carry no qty — cents are already per-each; per-unit is
      // never COLA-normalized (same carve-out as the analyses path above).
      const normalized = def.perUnit
        ? item.cents
        : Math.round(item.cents / regionMultiplier(zip));

      push(`${item.lineItemId}|national`, normalized, "outreach");
      if (metro && !def.perUnit) {
        push(`${item.lineItemId}|${metro}`, item.cents, "outreach");
      }
    }
  }

  return buckets;
}

function summarize(
  buckets: Map<string, Bucket>,
  withSources: boolean,
): GroupStats[] {
  const out: GroupStats[] = [];
  for (const [key, bucket] of buckets) {
    const values = bucket.values;
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
    if (withSources) {
      stats.sources = { analyses: bucket.analyses, outreach: bucket.outreach };
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

export function aggregateBenchmarks(records: AnalysisRecord[]): GroupStats[] {
  return summarize(collectObservations(records, []), false);
}

/**
 * Both feeds — checker analyses AND real outreach quotes — through the same
 * bucket logic. Groups carry a per-source observation count so surfaces can
 * label the mix.
 */
export function aggregateAllBenchmarks(
  analyses: AnalysisRecord[],
  outreach: OutreachQuoteRecord[],
): GroupStats[] {
  return summarize(collectObservations(analyses, outreach), true);
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
