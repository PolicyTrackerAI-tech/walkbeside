/**
 * Pure display helpers for the price-list checker result. Kept out of the
 * React component so the numbers we show a grieving family are unit-tested.
 */

export interface DisplayItem {
  name: string;
  cents: number;
  classification?: "good" | "fair" | "high" | "predatory";
  fairCentsLow?: number;
  fairCentsHigh?: number;
}

export interface DisplayFlag {
  severity: "violation" | "suspicious" | "info";
  evidence?: string;
}

/**
 * How many cents this line is over the fair midpoint — but ONLY for items
 * actually above the fair range (classified "high"/"predatory"). An item within
 * range returns 0, so we never show "$X above fair" on a price that isn't.
 * Midpoint basis matches the summary's potential-savings figure.
 */
export function overchargeCents(it: DisplayItem): number {
  if (it.classification !== "high" && it.classification !== "predatory") {
    return 0;
  }
  if (it.fairCentsLow == null || it.fairCentsHigh == null) return 0;
  const fairMid = Math.round((it.fairCentsLow + it.fairCentsHigh) / 2);
  return Math.max(0, it.cents - fairMid);
}

/**
 * The FTC/upsell finding that points at this exact line item, if any. Rules set
 * `evidence` to the name of the item they fired on, so we join on that. Info
 * tips (e.g. "you can buy third-party") are opportunities, not problems, so they
 * never flag a row red.
 */
export function ftcFlagFor<T extends DisplayFlag>(
  it: DisplayItem,
  flags: T[] | undefined,
): T | undefined {
  return flags?.find(
    (f) =>
      (f.severity === "violation" || f.severity === "suspicious") &&
      f.evidence === it.name,
  );
}

export interface RangeAwareItem extends DisplayItem {
  /** Selection-range merchandise (caskets/urns/vaults shown as a $low–$high). */
  isRange?: boolean;
}

export interface SavingsBreakdown {
  /** Dollars over fair on negotiable, fixed-price, overpriced services. */
  negotiateCents: number;
  negotiateCount: number;
  /** Selection merchandise (casket/urn/vault) you can buy third-party. */
  thirdPartyCount: number;
  /** Fixed items carrying a likely-FTC-violation flag — candidates to remove. */
  declineCount: number;
}

/**
 * Split the total opportunity into the three honest levers a family can pull:
 * negotiate overpriced services down to fair (a hard, benchmark-based dollar
 * figure), buy selection merchandise third-party, and decline/question items
 * that carry a likely FTC violation. An item can count toward more than one
 * lever (e.g. overpriced AND flagged). No fabricated third-party totals — only
 * the negotiate figure is a dollar amount, because it's the only one we can
 * defend from our benchmarks.
 */
export function savingsBreakdown(
  items: RangeAwareItem[],
  flags: DisplayFlag[] | undefined,
): SavingsBreakdown {
  let negotiateCents = 0;
  let negotiateCount = 0;
  let thirdPartyCount = 0;
  let declineCount = 0;
  for (const it of items) {
    if (it.isRange) {
      thirdPartyCount++;
      continue;
    }
    if (ftcFlagFor(it, flags)?.severity === "violation") declineCount++;
    const over = overchargeCents(it);
    if (over > 0) {
      negotiateCents += over;
      negotiateCount++;
    }
  }
  return { negotiateCents, negotiateCount, thirdPartyCount, declineCount };
}
