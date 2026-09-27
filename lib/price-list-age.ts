/**
 * How old a price list may be before it stops counting as a home's current
 * prices. A list printed long before we retrieved it would pull the local
 * benchmark ranges down, so the founder-ingest paths (the batch loader,
 * scripts/ingest-gpl-batch.mjs, and /admin/ingest-gpl) hold it back until
 * someone confirms with the home that it is still their current list and
 * says how.
 *
 * scripts/lib/gpl-batch.mjs mirrors this in plain JS (a Node script can't
 * import TypeScript); scripts/__tests__/gpl-batch.test.ts pins the two
 * together.
 */

export const MAX_LIST_AGE_MONTHS = 24;

/** Whole months from the printed effective date to `asOf` (both YYYY-MM-DD). */
export function listAgeMonths(effectiveDate: string, asOf: string): number {
  const [ey, em, ed] = effectiveDate.split("-").map(Number);
  const [ry, rm, rd] = asOf.split("-").map(Number);
  return (ry - ey) * 12 + (rm - em) - (rd < ed ? 1 : 0);
}

/**
 * Why a list is too old to load, or null when it may load: it is recent
 * enough, or `stillCurrent` records how the home confirmed it.
 */
export function staleListReason(
  effectiveDate: string,
  asOf: string,
  stillCurrent?: string | null,
): string | null {
  if (stillCurrent && stillCurrent.trim()) return null;
  const age = listAgeMonths(effectiveDate, asOf);
  if (age <= MAX_LIST_AGE_MONTHS) return null;
  return `printed ${effectiveDate}, ${age} months before it was retrieved (the limit is ${MAX_LIST_AGE_MONTHS}). Confirm with the home that it is still their current list, then record how and when you confirmed it.`;
}
