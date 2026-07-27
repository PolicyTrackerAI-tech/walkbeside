import { LINE_ITEMS } from "@/lib/pricing-data";
import type { ActiveBenchmarkRow } from "@/lib/benchmarks-store";

/**
 * Pure grouping for the Fair-Price Index "Verified metros" section: metro-
 * scoped active rows → one summary per metro. The published counts must be
 * arithmetically defensible (guardrail #4), so per metro:
 *
 * - one winner per line_item_id (latest effective_at — a failed retire can
 *   leave duplicate active rows; they must not double-count),
 * - only ids present in the LINE_ITEMS catalog count (mirrors
 *   verifiedLocalRows' skip — an unknown id has no rendered counterpart),
 * - minN and the tier split are computed over the deduped winner set.
 *
 * latestVersion is the version of the newest winner (by effective_at, then
 * version string as tiebreak). Metros sort alphabetically for a
 * deterministic render.
 */

export interface VerifiedMetroSummary {
  metro: string;
  /** Distinct catalog items covered (deduped winners). */
  itemCount: number;
  verifiedCount: number;
  communityCount: number;
  /** Minimum n across the deduped winners — the number we can defend. */
  minN: number;
  latestVersion: string;
}

const CATALOG_IDS = new Set(LINE_ITEMS.map((it) => it.id));

export function groupVerifiedMetros(
  rows: ActiveBenchmarkRow[],
): VerifiedMetroSummary[] {
  const byMetro = new Map<string, Map<string, ActiveBenchmarkRow>>();
  for (const row of rows) {
    if (row.scope !== "metro") continue;
    if (!CATALOG_IDS.has(row.lineItemId)) continue;
    let items = byMetro.get(row.scopeValue);
    if (!items) {
      items = new Map();
      byMetro.set(row.scopeValue, items);
    }
    const prev = items.get(row.lineItemId);
    if (
      prev &&
      (prev.effectiveAt > row.effectiveAt ||
        (prev.effectiveAt === row.effectiveAt && prev.version >= row.version))
    ) {
      continue;
    }
    items.set(row.lineItemId, row);
  }

  const summaries: VerifiedMetroSummary[] = [];
  for (const [metro, items] of byMetro) {
    const winners = [...items.values()];
    if (!winners.length) continue;
    const newest = winners.reduce((a, b) =>
      b.effectiveAt > a.effectiveAt ||
      (b.effectiveAt === a.effectiveAt && b.version > a.version)
        ? b
        : a,
    );
    summaries.push({
      metro,
      itemCount: winners.length,
      verifiedCount: winners.filter((w) => w.tier === "verified").length,
      communityCount: winners.filter((w) => w.tier === "community").length,
      minN: Math.min(...winners.map((w) => w.n)),
      latestVersion: newest.version,
    });
  }
  return summaries.sort((a, b) => a.metro.localeCompare(b.metro));
}

/**
 * The per-metro summary line (everything after the metro name). Tier-aware
 * by law: "real price lists" may only describe verified items, "prices
 * reported by families" only community items — never conflated. {version}
 * renders the store value bare (it already reads like "2026-07-v1").
 */
export function metroSummaryLine(
  m: VerifiedMetroSummary,
  totalItems: number,
): string {
  const coverage =
    m.verifiedCount > 0 && m.communityCount > 0
      ? `${m.verifiedCount} of ${totalItems} items from real price lists, ${m.communityCount} from prices reported by families`
      : m.verifiedCount > 0
        ? `${m.itemCount} of ${totalItems} items from real price lists`
        : `${m.itemCount} of ${totalItems} items from prices reported by families in the area`;
  return `${coverage} · at least ${m.minN} data points per item · ${m.latestVersion}`;
}
