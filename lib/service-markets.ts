/**
 * Service markets — the areas a family's funeral-home options are drawn
 * from when the negotiate flow picks homes to request quotes from.
 *
 * A market is a set of 3-digit zip prefixes that behave as ONE funeral
 * market even across state lines: a Silver Spring (209) family routinely
 * uses a DC (200) or Prince George's (207) home, and an Arlington (222)
 * family a DC one. Outside a defined market, a family's area is just its
 * own zip3.
 *
 * The directory NEVER reaches past this boundary. Before markets existed,
 * findHomesFromDirectory() topped up short lists with any vetted home in
 * the country — a DC family could be matched to Salt Lake City homes.
 * An empty result is the honest answer ("no vetted homes in your area
 * yet"), and the negotiate route already handles it.
 *
 * Adding a market is a founder data decision (which zip3s a family would
 * realistically drive to), not a code refactor: add a row, and the
 * directory + its test pick it up.
 */

export interface ServiceMarket {
  id: string;
  name: string;
  /** 3-digit zip prefixes in the market (may span states). */
  zip3: readonly string[];
}

export const SERVICE_MARKETS: readonly ServiceMarket[] = [
  {
    id: "dmv",
    name: "Washington, DC metro",
    zip3: [
      // District of Columbia
      "200", "202", "203", "204", "205",
      // Maryland: Southern MD, Prince George's, Montgomery, Silver Spring
      "206", "207", "208", "209",
      // Virginia: Loudoun/Manassas/Reston, Fairfax, McLean–Woodbridge,
      // Arlington, Alexandria
      "201", "220", "221", "222", "223",
    ],
  },
];

const MARKET_BY_ZIP3 = new Map<string, ServiceMarket>(
  SERVICE_MARKETS.flatMap((m) => m.zip3.map((z) => [z, m] as const)),
);

/** The market a zip belongs to, or null when it isn't in a defined one. */
export function marketForZip(zip: string): ServiceMarket | null {
  if (!zip || zip.length < 3) return null;
  return MARKET_BY_ZIP3.get(zip.slice(0, 3)) ?? null;
}

/**
 * Every zip3 a family at `zip` may be matched within: its market's
 * prefixes, or just its own zip3 outside a market.
 */
export function serviceAreaZip3s(zip: string): ReadonlySet<string> {
  if (!zip || zip.length < 3) return new Set();
  const market = marketForZip(zip);
  return new Set(market ? market.zip3 : [zip.slice(0, 3)]);
}
