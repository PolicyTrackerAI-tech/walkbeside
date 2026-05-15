/**
 * City-specific landing pages — `/funeral-costs/[city]`.
 *
 * Each entry maps a metro to a representative 3-digit zip prefix
 * (used to look up the regional multiplier from ZIP_REGIONS in
 * `zip-regions.ts`) and a full 5-digit zip (for cross-linking to
 * the funeral-homes directory).
 *
 * 25 major US metros for the first batch. Add cities as the
 * funeral-home directory expands.
 */

export interface CityEntry {
  /** URL slug, e.g. "atlanta" (no state suffix unless disambiguation needed). */
  slug: string;
  /** Display name. */
  name: string;
  /** Two-letter state abbreviation. */
  state: string;
  /** Lowercased state slug for cross-linking to /estate/[state] (if guide exists). */
  stateSlug?: string;
  /** Representative 3-digit zip prefix (for regional multiplier lookup). */
  zipPrefix: string;
  /** Representative full 5-digit zip (for /funeral-homes/[zip] linking). */
  zipExample: string;
  /** Optional 1-sentence local context. */
  blurb?: string;
}

export const CITIES: CityEntry[] = [
  // Northeast
  {
    slug: "new-york",
    name: "New York",
    state: "NY",
    stateSlug: "new-york",
    zipPrefix: "100",
    zipExample: "10001",
    blurb:
      "Funeral costs in New York City run among the highest in the country, driven by real-estate costs at funeral homes and high regional labor rates.",
  },
  {
    slug: "boston",
    name: "Boston",
    state: "MA",
    stateSlug: "massachusetts",
    zipPrefix: "021",
    zipExample: "02108",
    blurb:
      "Boston-area funeral pricing reflects high regional cost-of-living. Several historic neighborhood funeral homes coexist with national chains.",
  },
  {
    slug: "philadelphia",
    name: "Philadelphia",
    state: "PA",
    stateSlug: "pennsylvania",
    zipPrefix: "190",
    zipExample: "19103",
    blurb:
      "Philadelphia funeral pricing tends toward the regional average, with significant variation between neighborhoods.",
  },
  {
    slug: "washington-dc",
    name: "Washington, DC",
    state: "DC",
    zipPrefix: "200",
    zipExample: "20001",
    blurb:
      "Washington-area funeral costs reflect the regional cost of living. Veterans benefits are particularly relevant here given the federal-employee population.",
  },
  // Southeast
  {
    slug: "atlanta",
    name: "Atlanta",
    state: "GA",
    stateSlug: "georgia",
    zipPrefix: "303",
    zipExample: "30303",
    blurb:
      "Atlanta funeral pricing runs below the national average. The metro has a particularly strong community of independent, family-run funeral homes.",
  },
  {
    slug: "miami",
    name: "Miami",
    state: "FL",
    stateSlug: "florida",
    zipPrefix: "331",
    zipExample: "33101",
    blurb:
      "Miami funeral pricing reflects high regional cost-of-living. Spanish-language services are widely available; ask if you need them.",
  },
  {
    slug: "jacksonville",
    name: "Jacksonville",
    state: "FL",
    stateSlug: "florida",
    zipPrefix: "322",
    zipExample: "32202",
  },
  {
    slug: "tampa",
    name: "Tampa",
    state: "FL",
    stateSlug: "florida",
    zipPrefix: "336",
    zipExample: "33602",
  },
  {
    slug: "charlotte",
    name: "Charlotte",
    state: "NC",
    stateSlug: "north-carolina",
    zipPrefix: "282",
    zipExample: "28202",
  },
  {
    slug: "nashville",
    name: "Nashville",
    state: "TN",
    stateSlug: "tennessee",
    zipPrefix: "372",
    zipExample: "37203",
  },
  // Midwest
  {
    slug: "chicago",
    name: "Chicago",
    state: "IL",
    stateSlug: "illinois",
    zipPrefix: "606",
    zipExample: "60601",
    blurb:
      "Chicago funeral pricing tends slightly above the national average. Strong tradition of ethnic-specific funeral homes (Polish, Irish, Mexican, Korean).",
  },
  {
    slug: "detroit",
    name: "Detroit",
    state: "MI",
    stateSlug: "michigan",
    zipPrefix: "482",
    zipExample: "48201",
  },
  {
    slug: "columbus",
    name: "Columbus",
    state: "OH",
    stateSlug: "ohio",
    zipPrefix: "432",
    zipExample: "43215",
  },
  {
    slug: "indianapolis",
    name: "Indianapolis",
    state: "IN",
    stateSlug: "indiana",
    zipPrefix: "462",
    zipExample: "46204",
  },
  {
    slug: "minneapolis",
    name: "Minneapolis",
    state: "MN",
    stateSlug: "minnesota",
    zipPrefix: "554",
    zipExample: "55401",
  },
  {
    slug: "st-louis",
    name: "St. Louis",
    state: "MO",
    stateSlug: "missouri",
    zipPrefix: "631",
    zipExample: "63101",
  },
  // Texas
  {
    slug: "houston",
    name: "Houston",
    state: "TX",
    stateSlug: "texas",
    zipPrefix: "770",
    zipExample: "77002",
  },
  {
    slug: "dallas",
    name: "Dallas",
    state: "TX",
    stateSlug: "texas",
    zipPrefix: "752",
    zipExample: "75201",
  },
  {
    slug: "san-antonio",
    name: "San Antonio",
    state: "TX",
    stateSlug: "texas",
    zipPrefix: "782",
    zipExample: "78205",
  },
  {
    slug: "austin",
    name: "Austin",
    state: "TX",
    stateSlug: "texas",
    zipPrefix: "787",
    zipExample: "78701",
    blurb:
      "Austin funeral pricing has been pulled upward by the metro's recent growth. Pricing varies more between homes here than in many other Texas cities.",
  },
  // West
  {
    slug: "phoenix",
    name: "Phoenix",
    state: "AZ",
    stateSlug: "arizona",
    zipPrefix: "850",
    zipExample: "85001",
    blurb:
      "Phoenix is a winter-home market — many residents have legal residence elsewhere. Confirm the deceased's state of residence for probate purposes.",
  },
  {
    slug: "denver",
    name: "Denver",
    state: "CO",
    stateSlug: "colorado",
    zipPrefix: "802",
    zipExample: "80202",
  },
  {
    slug: "las-vegas",
    name: "Las Vegas",
    state: "NV",
    zipPrefix: "891",
    zipExample: "89101",
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    state: "CA",
    stateSlug: "california",
    zipPrefix: "900",
    zipExample: "90001",
    blurb:
      "Los Angeles funeral pricing reflects high regional cost-of-living. The metro has one of the most diverse markets in the country across religious and cultural traditions.",
  },
  {
    slug: "san-francisco",
    name: "San Francisco",
    state: "CA",
    stateSlug: "california",
    zipPrefix: "941",
    zipExample: "94102",
    blurb:
      "San Francisco funeral pricing is among the highest in the country, driven by Bay Area cost-of-living. Green-burial options are particularly well-developed here.",
  },
  {
    slug: "san-diego",
    name: "San Diego",
    state: "CA",
    stateSlug: "california",
    zipPrefix: "921",
    zipExample: "92101",
  },
  {
    slug: "seattle",
    name: "Seattle",
    state: "WA",
    stateSlug: "washington",
    zipPrefix: "981",
    zipExample: "98101",
    blurb:
      "Seattle is a national leader in alternative dispositions — aquamation (water cremation) and human composting (Recompose) are both legal and available here.",
  },
  {
    slug: "portland",
    name: "Portland",
    state: "OR",
    stateSlug: "oregon",
    zipPrefix: "972",
    zipExample: "97201",
    blurb:
      "Oregon has a particularly active green-burial and home-funeral community. Several certified green cemeteries operate within the Portland metro.",
  },
];

export function getCity(slug: string): CityEntry | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function listCitySlugs(): string[] {
  return CITIES.map((c) => c.slug);
}
