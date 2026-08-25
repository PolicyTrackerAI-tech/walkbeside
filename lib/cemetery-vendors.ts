/**
 * Monument company / cemetery vendor directory.
 *
 * Funeral homes commonly resell headstones made by the same monument
 * companies a family can buy from directly, with a markup added.
 * Markups on funeral-home-resold monuments are widely reported, but no
 * authoritative published figure exists — so on-page copy stays
 * unquantified and the family's own two quotes show the real gap.
 *
 * Keep this list short and verified rather than long and speculative.
 * Every entry below was click-tested (live website, matching real
 * business) as of 2026-08-25. For metros we don't cover, the page
 * points families to the Monument Builders of North America member
 * directory and to the cemetery's own approved-vendor list — that is
 * the honest answer everywhere else.
 *
 * We don't take referral fees; these are starting points for the
 * family, not endorsements.
 */

export interface MonumentVendor {
  /** Unique slug. */
  id: string;
  /** Display name. */
  name: string;
  /** Primary city. */
  city: string;
  /** Two-letter state. */
  state: string;
  /** Approximate metro/region label for grouping. */
  metro: string;
  /** Website if known. */
  website?: string;
  /** Phone if known. */
  phone?: string;
  /** What they're known for / family-relevant notes. */
  notes: string;
  /** Set when an entry passes a founder click-test (last full test 2026-08-25). */
  ftcVerified?: boolean;
}

export const VENDORS: MonumentVendor[] = [
  {
    id: "rome-monument-pa",
    name: "Rome Monument",
    city: "Rochester",
    state: "PA",
    metro: "Pittsburgh",
    website: "https://www.romemonuments.com",
    phone: "+17247700100",
    notes:
      "Family-owned since 1934. Serves cemeteries across Western PA, OH, and WV. Wide casket-stone selection, custom granite.",
  },
  {
    id: "supreme-memorials-ny",
    name: "Supreme Memorials",
    city: "Brooklyn",
    state: "NY",
    metro: "New York City",
    website: "https://www.supremememorials.com",
    phone: "+17187886697",
    notes:
      "Erecting NYC-area monuments since 1951. Three Brooklyn and two Staten Island locations. Regular work at Green-Wood, St. John's, and St. Charles cemeteries.",
  },
  {
    id: "rock-of-ages-vt",
    name: "Rock of Ages",
    city: "Barre",
    state: "VT",
    metro: "Northeast / National",
    website: "https://www.rockofages.com",
    notes:
      "Vermont granite quarrier (Barre) — monuments handcrafted in their own workshop and sold through authorized local dealers nationwide. Use their dealer locator to find one that services your cemetery.",
  },
  {
    id: "memorials-com-online",
    name: "Memorials.com",
    city: "Online",
    state: "—",
    metro: "Nationwide",
    website: "https://www.memorials.com",
    notes:
      "National online retailer. Often well under funeral-home retail pricing for comparable stones. Verify your cemetery's installation rules before ordering.",
  },
];

/**
 * Major metro labels for the picker.
 */
export const METROS: string[] = [
  "Pittsburgh",
  "New York City",
  "Northeast / National",
  "Nationwide",
];

export function vendorsForMetro(metro: string): MonumentVendor[] {
  return VENDORS.filter(
    (v) =>
      v.metro === metro ||
      v.metro === "Nationwide" ||
      v.metro === "Northeast / National",
  );
}

export function vendorsByState(state: string): MonumentVendor[] {
  return VENDORS.filter(
    (v) => v.state.toLowerCase() === state.toLowerCase() || v.state === "—",
  );
}
