import { LINE_ITEMS } from "@/lib/pricing-data";
import type { RegionalBenchmark } from "@/lib/benchmarks-store";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";

/**
 * Pure row-building for the city pages' "Verified local prices" section:
 * turns the benchmarksForZip() Map into renderable rows plus per-tier counts
 * for the count line. Cents→dollars happens HERE and only here — store
 * amounts are cents, pages format dollars (guardrail #4 discipline: the
 * badge-carrying numbers come straight from the store, converted once).
 *
 * Overrides whose line_item_id isn't in the LINE_ITEMS catalog are skipped:
 * they have no display name, and counting them would break the honest
 * "{X} of the {LINE_ITEMS.length} benchmarked items" arithmetic. Rows below
 * SMALL_SAMPLE_THRESHOLD are skipped too — the promote route gates n≥5, but
 * the table has no CHECK constraint and hand-SQL inserts exist in the real
 * workflow, so the floor is re-applied at every public read edge
 * (guardrail #4).
 */

export interface VerifiedLocalRow {
  lineItemId: string;
  /** Display name — the "/"-alias list stripped, em-dash qualifier kept. */
  name: string;
  /** Dollars (converted from the store's cents). */
  fairLowUsd: number;
  fairHighUsd: number;
  tier: "verified" | "community";
  n: number;
  /** YYYY-MM-DD */
  lastUpdated: string;
}

const CATALOG_ORDER = new Map(LINE_ITEMS.map((it, i) => [it.id, i]));
const BY_ID = new Map(LINE_ITEMS.map((it) => [it.id, it]));

/**
 * Strip the "/"-separated synonym list (an internal matching aid) but KEEP
 * the em-dash qualifier: "Casket — 18-gauge metal" and "Casket — wood" must
 * stay distinct — collapsing both to "Casket" would put two identical
 * labels with conflicting ranges in the city table and the public dataset.
 */
export function displayItemName(fullName: string): string {
  return fullName.split("/")[0].trim();
}

/**
 * The count line under the city page's verified table — VERBATIM LAW
 * (guardrail #4): "price lists" only ever describes verified rows, "prices
 * reported by families in the area" only community rows; mixed metros count
 * the tiers separately. Every character here is pinned by test.
 */
export function localCountLine(
  verifiedCount: number,
  communityCount: number,
  totalItems: number,
): string {
  if (verifiedCount > 0 && communityCount > 0) {
    return `${verifiedCount} of the ${totalItems} benchmarked items in this metro come from real price lists; ${communityCount} come from prices reported by families in the area; the rest are modeled.`;
  }
  if (verifiedCount > 0) {
    return `${verifiedCount} of the ${totalItems} benchmarked items in this metro come from real price lists; the rest are modeled.`;
  }
  return `${communityCount} of the ${totalItems} benchmarked items in this metro come from prices reported by families in the area; the rest are modeled.`;
}

export function verifiedLocalRows(map: Map<string, RegionalBenchmark>): {
  rows: VerifiedLocalRow[];
  verifiedCount: number;
  communityCount: number;
} {
  const rows: VerifiedLocalRow[] = [];
  for (const override of map.values()) {
    const item = BY_ID.get(override.lineItemId);
    if (!item) continue;
    if (override.n < SMALL_SAMPLE_THRESHOLD) continue;
    rows.push({
      lineItemId: override.lineItemId,
      name: displayItemName(item.name),
      fairLowUsd: override.fairLowCents / 100,
      fairHighUsd: override.fairHighCents / 100,
      tier: override.tier,
      n: override.n,
      lastUpdated: override.effectiveAt.slice(0, 10),
    });
  }
  rows.sort(
    (a, b) =>
      (CATALOG_ORDER.get(a.lineItemId) ?? 0) -
      (CATALOG_ORDER.get(b.lineItemId) ?? 0),
  );
  return {
    rows,
    verifiedCount: rows.filter((r) => r.tier === "verified").length,
    communityCount: rows.filter((r) => r.tier === "community").length,
  };
}
