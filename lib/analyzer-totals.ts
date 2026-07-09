/**
 * Reconcile the analyzer's headline "total quoted" between two sources:
 * the sum of line items we actually parsed, and a document-stated total the
 * extractor may have read (or, when the extraction is model-based,
 * hallucinated — observed in production: a list with NO total line came back
 * with total_cents of $1,899 against $18,975 of parsed items, which then
 * clamped the displayed fair total to $0).
 *
 * A stated total is only trusted when it's consistent with what we parsed:
 * it may legitimately EXCEED the item sum (lines we failed to parse are still
 * money the family pays — the coverage note tells them the read is partial),
 * but it can never be BELOW it, and a total wildly above the parsed sum is a
 * number we can't defend (guardrail #4) — in both cases the deterministic
 * item sum wins, keeping the three summary stats (quoted − above-fair =
 * fair total) reconciled with the item table the family sees.
 */
export function reconcileTotalQuoted(
  statedTotalCents: number | null | undefined,
  itemSumCents: number,
): number {
  if (itemSumCents <= 0) return statedTotalCents ?? 0;
  if (statedTotalCents == null) return itemSumCents;
  if (statedTotalCents < itemSumCents) return itemSumCents;
  if (statedTotalCents > itemSumCents * 3) return itemSumCents;
  return statedTotalCents;
}
