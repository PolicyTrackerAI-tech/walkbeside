/**
 * Shared 0-1 confidence heuristic for Claude-extracted price data — used by
 * the analyzer's provenance column (price_list_analyses.confidence) and the
 * inbound reply parser (negotiation_messages.ai_parse_confidence). Two
 * signals only, both deterministic: how many items were found, and whether
 * the stated total agrees with the item sum. This is a triage score for the
 * benchmark pipeline and the confirm UI, not a probability.
 */
export function extractionConfidence(opts: {
  itemCount: number;
  statedTotalCents: number | null | undefined;
  itemSumCents: number;
}): number {
  const { itemCount, statedTotalCents, itemSumCents } = opts;

  if (itemCount <= 0) {
    // No itemization. A bare stated total is still a usable (weak) signal —
    // "our all-in price is $3,995" replies land here.
    return statedTotalCents != null && statedTotalCents > 0 ? 0.35 : 0;
  }

  // Base + a small bonus per item found (capped: 5+ items reads like a real
  // itemized document).
  let score = 0.5 + Math.min(itemCount, 5) * 0.04;

  if (statedTotalCents == null || itemSumCents <= 0) {
    // Nothing to cross-check — mildly positive (nothing contradicts either).
    score += 0.1;
  } else {
    const ratio = statedTotalCents / itemSumCents;
    if (ratio >= 0.98 && ratio <= 1.02) {
      score += 0.3; // stated total confirms the parse
    } else if (ratio >= 0.9 && ratio <= 1.5) {
      score += 0.15; // moderately above: unparsed lines are plausible
    } else {
      score -= 0.15; // stated total contradicts what we parsed
    }
  }

  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}

/** Fixed score for the deterministic regex fallback parser (naiveExtract). */
export const NAIVE_EXTRACTION_CONFIDENCE = 0.3;
