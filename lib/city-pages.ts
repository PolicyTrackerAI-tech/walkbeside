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

  // ── Batch 2 — expansion to the next tier of major US metros. ──
  // No blurb on purpose: the template writes an accurate cost-of-living
  // sentence from the regional multiplier, so there's no hallucinated local
  // fact to verify. Each zipExample's 3-digit prefix maps to a real
  // ZIP_REGIONS entry so the metro multiplier (and the price table) is precise.
  { slug: "salt-lake-city", name: "Salt Lake City", state: "UT", stateSlug: "utah", zipPrefix: "841", zipExample: "84111" },
  { slug: "fort-worth", name: "Fort Worth", state: "TX", stateSlug: "texas", zipPrefix: "761", zipExample: "76102" },
  { slug: "el-paso", name: "El Paso", state: "TX", stateSlug: "texas", zipPrefix: "799", zipExample: "79901" },
  { slug: "san-jose", name: "San Jose", state: "CA", stateSlug: "california", zipPrefix: "951", zipExample: "95113" },
  { slug: "oakland", name: "Oakland", state: "CA", stateSlug: "california", zipPrefix: "946", zipExample: "94607" },
  { slug: "long-beach", name: "Long Beach", state: "CA", stateSlug: "california", zipPrefix: "908", zipExample: "90802" },
  { slug: "anaheim", name: "Anaheim", state: "CA", stateSlug: "california", zipPrefix: "928", zipExample: "92805" },
  { slug: "riverside", name: "Riverside", state: "CA", stateSlug: "california", zipPrefix: "925", zipExample: "92501" },
  { slug: "sacramento", name: "Sacramento", state: "CA", stateSlug: "california", zipPrefix: "958", zipExample: "95814" },
  { slug: "fresno", name: "Fresno", state: "CA", stateSlug: "california", zipPrefix: "937", zipExample: "93721" },
  { slug: "bakersfield", name: "Bakersfield", state: "CA", stateSlug: "california", zipPrefix: "933", zipExample: "93301" },
  { slug: "pittsburgh", name: "Pittsburgh", state: "PA", stateSlug: "pennsylvania", zipPrefix: "152", zipExample: "15222" },
  { slug: "allentown", name: "Allentown", state: "PA", stateSlug: "pennsylvania", zipPrefix: "181", zipExample: "18101" },
  { slug: "baltimore", name: "Baltimore", state: "MD", stateSlug: "maryland", zipPrefix: "212", zipExample: "21201" },
  { slug: "newark", name: "Newark", state: "NJ", stateSlug: "new-jersey", zipPrefix: "071", zipExample: "07102" },
  { slug: "buffalo", name: "Buffalo", state: "NY", stateSlug: "new-york", zipPrefix: "142", zipExample: "14202" },
  { slug: "rochester", name: "Rochester", state: "NY", stateSlug: "new-york", zipPrefix: "146", zipExample: "14604" },
  { slug: "albany", name: "Albany", state: "NY", stateSlug: "new-york", zipPrefix: "122", zipExample: "12207" },
  { slug: "syracuse", name: "Syracuse", state: "NY", stateSlug: "new-york", zipPrefix: "132", zipExample: "13202" },
  { slug: "hartford", name: "Hartford", state: "CT", stateSlug: "connecticut", zipPrefix: "061", zipExample: "06103" },
  { slug: "new-haven", name: "New Haven", state: "CT", stateSlug: "connecticut", zipPrefix: "065", zipExample: "06511" },
  { slug: "providence", name: "Providence", state: "RI", stateSlug: "rhode-island", zipPrefix: "029", zipExample: "02903" },
  { slug: "richmond", name: "Richmond", state: "VA", stateSlug: "virginia", zipPrefix: "232", zipExample: "23219" },
  { slug: "virginia-beach", name: "Virginia Beach", state: "VA", stateSlug: "virginia", zipPrefix: "234", zipExample: "23451" },
  { slug: "raleigh", name: "Raleigh", state: "NC", stateSlug: "north-carolina", zipPrefix: "276", zipExample: "27601" },
  { slug: "greensboro", name: "Greensboro", state: "NC", stateSlug: "north-carolina", zipPrefix: "272", zipExample: "27401" },
  { slug: "charleston", name: "Charleston", state: "SC", stateSlug: "south-carolina", zipPrefix: "294", zipExample: "29401" },
  { slug: "columbia", name: "Columbia", state: "SC", stateSlug: "south-carolina", zipPrefix: "292", zipExample: "29201" },
  { slug: "greenville", name: "Greenville", state: "SC", stateSlug: "south-carolina", zipPrefix: "296", zipExample: "29601" },
  { slug: "birmingham", name: "Birmingham", state: "AL", stateSlug: "alabama", zipPrefix: "352", zipExample: "35203" },
  { slug: "memphis", name: "Memphis", state: "TN", stateSlug: "tennessee", zipPrefix: "381", zipExample: "38103" },
  { slug: "louisville", name: "Louisville", state: "KY", stateSlug: "kentucky", zipPrefix: "402", zipExample: "40202" },
  { slug: "lexington", name: "Lexington", state: "KY", stateSlug: "kentucky", zipPrefix: "405", zipExample: "40507" },
  { slug: "new-orleans", name: "New Orleans", state: "LA", stateSlug: "louisiana", zipPrefix: "701", zipExample: "70112" },
  { slug: "baton-rouge", name: "Baton Rouge", state: "LA", stateSlug: "louisiana", zipPrefix: "708", zipExample: "70801" },
  { slug: "orlando", name: "Orlando", state: "FL", stateSlug: "florida", zipPrefix: "328", zipExample: "32801" },
  { slug: "fort-lauderdale", name: "Fort Lauderdale", state: "FL", stateSlug: "florida", zipPrefix: "333", zipExample: "33301" },
  { slug: "west-palm-beach", name: "West Palm Beach", state: "FL", stateSlug: "florida", zipPrefix: "334", zipExample: "33401" },
  { slug: "fort-myers", name: "Fort Myers", state: "FL", stateSlug: "florida", zipPrefix: "339", zipExample: "33901" },
  { slug: "cleveland", name: "Cleveland", state: "OH", stateSlug: "ohio", zipPrefix: "441", zipExample: "44114" },
  { slug: "cincinnati", name: "Cincinnati", state: "OH", stateSlug: "ohio", zipPrefix: "452", zipExample: "45202" },
  { slug: "dayton", name: "Dayton", state: "OH", stateSlug: "ohio", zipPrefix: "454", zipExample: "45402" },
  { slug: "akron", name: "Akron", state: "OH", stateSlug: "ohio", zipPrefix: "443", zipExample: "44308" },
  { slug: "grand-rapids", name: "Grand Rapids", state: "MI", stateSlug: "michigan", zipPrefix: "495", zipExample: "49503" },
  { slug: "milwaukee", name: "Milwaukee", state: "WI", stateSlug: "wisconsin", zipPrefix: "532", zipExample: "53202" },
  { slug: "madison", name: "Madison", state: "WI", stateSlug: "wisconsin", zipPrefix: "535", zipExample: "53703" },
  { slug: "kansas-city", name: "Kansas City", state: "MO", stateSlug: "missouri", zipPrefix: "641", zipExample: "64106" },
  { slug: "omaha", name: "Omaha", state: "NE", stateSlug: "nebraska", zipPrefix: "681", zipExample: "68102" },
  { slug: "des-moines", name: "Des Moines", state: "IA", stateSlug: "iowa", zipPrefix: "503", zipExample: "50309" },
  { slug: "wichita", name: "Wichita", state: "KS", stateSlug: "kansas", zipPrefix: "672", zipExample: "67202" },
  { slug: "oklahoma-city", name: "Oklahoma City", state: "OK", stateSlug: "oklahoma", zipPrefix: "731", zipExample: "73102" },
  { slug: "tulsa", name: "Tulsa", state: "OK", stateSlug: "oklahoma", zipPrefix: "741", zipExample: "74103" },
  { slug: "albuquerque", name: "Albuquerque", state: "NM", stateSlug: "new-mexico", zipPrefix: "871", zipExample: "87102" },
  { slug: "tucson", name: "Tucson", state: "AZ", stateSlug: "arizona", zipPrefix: "857", zipExample: "85701" },
  { slug: "colorado-springs", name: "Colorado Springs", state: "CO", stateSlug: "colorado", zipPrefix: "808", zipExample: "80903" },
  { slug: "reno", name: "Reno", state: "NV", zipPrefix: "895", zipExample: "89501" },
  { slug: "boise", name: "Boise", state: "ID", stateSlug: "idaho", zipPrefix: "837", zipExample: "83702" },
  { slug: "spokane", name: "Spokane", state: "WA", stateSlug: "washington", zipPrefix: "992", zipExample: "99201" },
  { slug: "honolulu", name: "Honolulu", state: "HI", stateSlug: "hawaii", zipPrefix: "968", zipExample: "96813" },
];

export function getCity(slug: string): CityEntry | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function listCitySlugs(): string[] {
  return CITIES.map((c) => c.slug);
}
