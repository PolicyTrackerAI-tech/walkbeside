import { PRICING_LAST_UPDATED } from "@/lib/pricing-data";
import type { ActiveBenchmarkRow } from "@/lib/benchmarks-store";

/**
 * The dataset's lastUpdated date (YYYY-MM-DD): the later of the static
 * catalog's review date and the newest active benchmark row. Shared by the
 * Fair-Price Index page (cite-this block + JSON-LD dateModified) and the
 * public data endpoint so the two can never disagree. An empty rows array
 * (no promotions yet, or the store read failed) falls back to the catalog
 * date alone.
 */
export function datasetLastUpdated(
  rows: Pick<ActiveBenchmarkRow, "effectiveAt">[],
): string {
  return rows
    .map((r) => r.effectiveAt.slice(0, 10))
    .reduce((a, b) => (b > a ? b : a), PRICING_LAST_UPDATED);
}
