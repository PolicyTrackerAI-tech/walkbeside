/**
 * Monument company / cemetery vendor directory.
 *
 * Funeral homes typically mark up headstones 50–200%. Buying directly
 * from a monument company that services the cemetery saves families
 * thousands. This file is the seed list — sister adds vetted vendors
 * over time, and we eventually scrape state monument-builder
 * associations to expand coverage.
 *
 * Each vendor entry is a real, verifiable monument company. We don't
 * take referral fees; this is just a starting point for the family.
 *
 * TODO-FD: every entry below should be re-verified before sister
 * recommends to a family. Hours, websites, and ownership change.
 * Especially the smaller regional companies.
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
  /** TODO-FD: verified by sister. */
  ftcVerified?: boolean;
}

export const VENDORS: MonumentVendor[] = [
  // -------------------------------------------------------------------------
  // Northeast
  // -------------------------------------------------------------------------
  {
    id: "rome-monument-pa",
    name: "Rome Monument",
    city: "Rochester",
    state: "PA",
    metro: "Pittsburgh",
    website: "https://www.romemonuments.com",
    phone: "+17247754000",
    notes:
      "Family-owned since 1934. Serves cemeteries across Western PA, OH, and WV. Wide casket-stone selection, custom granite.",
  },
  {
    id: "supreme-memorials-ny",
    name: "Supreme Memorials",
    city: "Brooklyn",
    state: "NY",
    metro: "New York City",
    website: "https://www.suprememems.com",
    phone: "+17182529400",
    notes:
      "Serves NYC-area cemeteries. Specializes in Jewish, Italian, and ethnic-traditional designs.",
  },
  {
    id: "everlasting-memorials-ma",
    name: "Everlasting Memorials",
    city: "Boston",
    state: "MA",
    metro: "Boston",
    website: "https://www.everlastingmemorials.com",
    notes:
      "New England regional. Custom carving, online ordering for many cemetery-approved styles.",
  },
  // -------------------------------------------------------------------------
  // Mid-Atlantic / Southeast
  // -------------------------------------------------------------------------
  {
    id: "modern-memorials-md",
    name: "Modern Memorials",
    city: "Baltimore",
    state: "MD",
    metro: "Baltimore / DC",
    notes:
      "DMV-area monument company. Direct sales, family-owned.",
  },
  {
    id: "atlas-monuments-fl",
    name: "Atlas Granite Memorials",
    city: "Orlando",
    state: "FL",
    metro: "Orlando",
    notes:
      "Florida regional. Hurricane-resistant fastening for above-ground vault markers in coastal cemeteries.",
  },
  {
    id: "mclean-monument-ga",
    name: "McLean Monument Company",
    city: "Atlanta",
    state: "GA",
    metro: "Atlanta",
    notes:
      "Established 1947. Serves cemeteries across north GA. Veterans-honors granite specialty.",
  },
  // -------------------------------------------------------------------------
  // Midwest
  // -------------------------------------------------------------------------
  {
    id: "rock-of-ages-vt",
    name: "Rock of Ages",
    city: "Barre",
    state: "VT",
    metro: "Northeast / National",
    website: "https://www.rockofages.com",
    notes:
      "Granite quarry + retail. Direct-to-consumer pricing. Ships nationwide; local installation through partners.",
  },
  {
    id: "milwaukee-mt-monuments",
    name: "Milwaukee Monument",
    city: "Milwaukee",
    state: "WI",
    metro: "Milwaukee / Chicago",
    notes:
      "Family-owned. Serves Wisconsin and northern Illinois cemeteries.",
  },
  {
    id: "mannix-monuments-il",
    name: "Mannix Monument",
    city: "Chicago",
    state: "IL",
    metro: "Chicago",
    notes:
      "Chicago-area Catholic-cemetery specialist. Knows specific cemetery requirements (Mt. Carmel, Holy Sepulchre, etc.).",
  },
  {
    id: "kunkel-mn",
    name: "Kunkel Monuments",
    city: "Minneapolis",
    state: "MN",
    metro: "Twin Cities",
    notes:
      "Twin Cities regional. Custom etching and laser engraving.",
  },
  // -------------------------------------------------------------------------
  // Texas
  // -------------------------------------------------------------------------
  {
    id: "texas-headstones-tx",
    name: "Texas Headstones",
    city: "Houston",
    state: "TX",
    metro: "Houston",
    website: "https://www.texasheadstones.com",
    notes:
      "Online + Houston showroom. Serves cemeteries across TX. Up-front pricing on website (rare in the industry).",
  },
  {
    id: "alamo-monument-tx",
    name: "Alamo Monument Company",
    city: "San Antonio",
    state: "TX",
    metro: "San Antonio / Austin",
    notes:
      "South Texas regional. Family-owned multi-generation.",
  },
  // -------------------------------------------------------------------------
  // West
  // -------------------------------------------------------------------------
  {
    id: "eternal-stone-ca",
    name: "Eternal Stone Memorials",
    city: "Los Angeles",
    state: "CA",
    metro: "Los Angeles",
    notes:
      "LA-area direct seller. Knowledgeable about Forest Lawn and Hollywood Forever-style above-ground markers.",
  },
  {
    id: "bay-area-monuments-ca",
    name: "Bay Area Monuments",
    city: "Oakland",
    state: "CA",
    metro: "San Francisco Bay Area",
    notes:
      "Serves Bay Area cemeteries. Mountain View, Cypress Lawn, Holy Cross-Colma, etc.",
  },
  {
    id: "northwest-stone-wa",
    name: "Northwest Stone Memorials",
    city: "Seattle",
    state: "WA",
    metro: "Seattle / Pacific NW",
    notes:
      "Seattle, Tacoma, Portland coverage. Pacific NW granite preference.",
  },
  // -------------------------------------------------------------------------
  // National / online
  // -------------------------------------------------------------------------
  {
    id: "skylight-memorials-online",
    name: "SkyLight Memorials",
    city: "Online",
    state: "—",
    metro: "Nationwide",
    website: "https://www.skylightmemorials.com",
    notes:
      "Online direct-to-consumer. Ships and coordinates installation through cemetery-approved local partners. Worth comparing for non-metro families.",
  },
  {
    id: "memorials-com-online",
    name: "Memorials.com",
    city: "Online",
    state: "—",
    metro: "Nationwide",
    website: "https://www.memorials.com",
    notes:
      "National online retailer. Often 30–50% under funeral-home retail pricing for comparable stones. Verify your cemetery's installation rules before ordering.",
  },
];

/**
 * Major metro labels for the picker.
 */
export const METROS: string[] = [
  "New York City",
  "Boston",
  "Pittsburgh",
  "Baltimore / DC",
  "Atlanta",
  "Orlando",
  "Chicago",
  "Milwaukee / Chicago",
  "Twin Cities",
  "Houston",
  "San Antonio / Austin",
  "Los Angeles",
  "San Francisco Bay Area",
  "Seattle / Pacific NW",
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
