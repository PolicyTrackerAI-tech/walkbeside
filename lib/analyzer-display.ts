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
