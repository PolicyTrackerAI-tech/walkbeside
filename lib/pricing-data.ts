/**
 * Funeral pricing database — US national fair-price benchmarks.
 * Source: master_brief.docx Section 4 (validated by Sarah, licensed funeral director cofounder).
 *
 * V1 ships national averages. Per-city adjustments layer on later via Supabase.
 */

export type Required = "yes" | "no" | "burial" | "cemetery" | "cremation";

export interface LineItem {
  id: string;
  name: string;
  fairLow: number;
  fairHigh: number;
  predatoryAt: number;
  required: Required;
  notes: string;
  /** Categories to filter by service type */
  categories: ServiceType[];
  /** Sister's "watch out" markers — surfaced first in the prep kit */
  highMarkup?: boolean;
}

export type ServiceType =
  | "direct-cremation"
  | "cremation-with-service"
  | "traditional-burial"
  | "graveside-burial";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  "direct-cremation": "Direct cremation (no service)",
  "cremation-with-service": "Cremation with memorial",
  "traditional-burial": "Traditional burial with viewing",
  "graveside-burial": "Graveside burial (no viewing)",
};

export const LINE_ITEMS: LineItem[] = [
  {
    id: "basic-services",
    name: "Basic services fee",
    fairLow: 1500,
    fairHigh: 2500,
    predatoryAt: 3500,
    required: "yes",
    notes:
      "Non-declinable. Covers funeral director, permits, filings. Every funeral home charges this.",
    categories: [
      "direct-cremation",
      "cremation-with-service",
      "traditional-burial",
      "graveside-burial",
    ],
  },
  {
    id: "embalming",
    name: "Embalming",
    fairLow: 700,
    fairHigh: 900,
    predatoryAt: 1200,
    required: "no",
    notes:
      "NOT legally required in most US states. Only needed for an open-casket viewing with a delay between death and service. Decline unless you have a specific reason.",
    categories: ["traditional-burial"],
    highMarkup: true,
  },
  {
    id: "body-prep",
    name: "Body preparation / cosmetology",
    fairLow: 200,
    fairHigh: 350,
    predatoryAt: 600,
    required: "no",
    notes: "Dressing, hair, makeup. Optional. Decline if no viewing.",
    categories: ["traditional-burial", "cremation-with-service"],
  },
  {
    id: "viewing",
    name: "Viewing / visitation",
    fairLow: 350,
    fairHigh: 500,
    predatoryAt: 900,
    required: "no",
    notes: "Use of the funeral home for visitation. A church or community space can substitute.",
    categories: ["traditional-burial", "cremation-with-service"],
  },
  {
    id: "service-facility",
    name: "Funeral service facility",
    fairLow: 400,
    fairHigh: 600,
    predatoryAt: 1000,
    required: "no",
    notes: "Chapel use. A church, park, or home is often free.",
    categories: ["traditional-burial", "cremation-with-service"],
  },
  {
    id: "graveside",
    name: "Graveside service",
    fairLow: 200,
    fairHigh: 400,
    predatoryAt: 700,
    required: "no",
    notes: "Funeral home staff present at the cemetery. Optional.",
    categories: ["traditional-burial", "graveside-burial"],
  },
  {
    id: "hearse",
    name: "Hearse (local)",
    fairLow: 250,
    fairHigh: 400,
    predatoryAt: 700,
    required: "burial",
    notes: "Required for burial. Not required for cremation.",
    categories: ["traditional-burial", "graveside-burial"],
  },
  {
    id: "limo",
    name: "Family car / limousine",
    fairLow: 150,
    fairHigh: 300,
    predatoryAt: 600,
    required: "no",
    notes: "Pure upsell. Families can drive themselves.",
    categories: ["traditional-burial", "graveside-burial"],
  },
  {
    id: "transfer",
    name: "Transfer of remains",
    fairLow: 200,
    fairHigh: 350,
    predatoryAt: 600,
    required: "yes",
    notes: "Moving the body from the place of death to the funeral home.",
    categories: [
      "direct-cremation",
      "cremation-with-service",
      "traditional-burial",
      "graveside-burial",
    ],
  },
  {
    id: "death-cert",
    name: "Death certificates (each)",
    fairLow: 10,
    fairHigh: 25,
    predatoryAt: 50,
    required: "yes",
    notes:
      "Order 10–15 copies. Funeral home may mark up — you can order direct from your state vital records office for the base fee.",
    categories: [
      "direct-cremation",
      "cremation-with-service",
      "traditional-burial",
      "graveside-burial",
    ],
  },
  {
    id: "casket-metal",
    name: "Casket — 18-gauge metal",
    fairLow: 900,
    fairHigh: 1400,
    predatoryAt: 4000,
    required: "no",
    notes:
      "You can buy from Costco, Amazon, or any third-party vendor for $900–$1,400. The funeral home MUST legally accept it (FTC Funeral Rule). Markup at funeral homes is 300–500%.",
    categories: ["traditional-burial"],
    highMarkup: true,
  },
  {
    id: "casket-wood",
    name: "Casket — wood",
    fairLow: 1200,
    fairHigh: 2500,
    predatoryAt: 6000,
    required: "no",
    notes:
      "Same third-party purchase right applies. Buying from outside the funeral home saves $3,000–$4,000 routinely.",
    categories: ["traditional-burial"],
    highMarkup: true,
  },
  {
    id: "cremation-container",
    name: "Cremation container",
    fairLow: 100,
    fairHigh: 300,
    predatoryAt: 1500,
    required: "cremation",
    notes:
      "Must be combustible — but cardboard or unfinished plywood qualifies. You do NOT need an expensive casket for cremation.",
    categories: ["direct-cremation", "cremation-with-service"],
  },
  {
    id: "urn",
    name: "Urn (basic)",
    fairLow: 50,
    fairHigh: 200,
    predatoryAt: 800,
    required: "no",
    notes:
      "Remains are returned in a temporary container if no urn is selected. You can decide later — no rush.",
    categories: ["direct-cremation", "cremation-with-service"],
  },
  {
    id: "vault",
    name: "Grave liner / burial vault",
    fairLow: 700,
    fairHigh: 1200,
    predatoryAt: 3500,
    required: "cemetery",
    notes:
      "Required by the cemetery, NOT by law. Choose the cheapest option that meets the cemetery's standard.",
    categories: ["traditional-burial", "graveside-burial"],
    highMarkup: true,
  },
  {
    id: "plot",
    name: "Cemetery plot (urban)",
    fairLow: 2000,
    fairHigh: 4000,
    predatoryAt: 8000,
    required: "burial",
    notes:
      "Compare cemeteries independently. Funeral home referrals often involve referral fees baked into the price.",
    categories: ["traditional-burial", "graveside-burial"],
  },
  {
    id: "open-close",
    name: "Grave opening & closing",
    fairLow: 600,
    fairHigh: 1200,
    predatoryAt: 2500,
    required: "burial",
    notes: "Cemetery fee. Limited room to negotiate, but cemeteries vary.",
    categories: ["traditional-burial", "graveside-burial"],
  },
  {
    id: "headstone",
    name: "Headstone / marker",
    fairLow: 800,
    fairHigh: 2000,
    predatoryAt: 5000,
    required: "no",
    notes:
      "Buy DIRECT from a monument company. Funeral home markup on stone is massive.",
    categories: ["traditional-burial", "graveside-burial"],
    highMarkup: true,
  },
  {
    id: "obituary-newspaper",
    name: "Obituary — newspaper",
    fairLow: 150,
    fairHigh: 300,
    predatoryAt: 800,
    required: "no",
    notes:
      "Online obituaries are free. Newspapers charge per word — keep it short or skip the print version.",
    categories: [
      "direct-cremation",
      "cremation-with-service",
      "traditional-burial",
      "graveside-burial",
    ],
  },
  {
    id: "programs",
    name: "Memorial programs",
    fairLow: 75,
    fairHigh: 150,
    predatoryAt: 400,
    required: "no",
    notes: "Print locally or at home. Canva templates are free.",
    categories: ["traditional-burial", "cremation-with-service"],
  },
  {
    id: "flowers-fh",
    name: "Flowers (through funeral home)",
    fairLow: 300,
    fairHigh: 600,
    predatoryAt: 1500,
    required: "no",
    notes: "Direct from a florist is 40–60% cheaper. Never order through the funeral home.",
    categories: ["traditional-burial", "cremation-with-service", "graveside-burial"],
    highMarkup: true,
  },
];

export interface ServiceTotal {
  type: ServiceType;
  label: string;
  fairLow: number;
  fairHigh: number;
  predatoryLow: number;
  predatoryHigh: number;
  maxSavings: number;
}

export const SERVICE_TOTALS: ServiceTotal[] = [
  {
    type: "direct-cremation",
    label: SERVICE_LABELS["direct-cremation"],
    fairLow: 1000,
    fairHigh: 2500,
    predatoryLow: 4000,
    predatoryHigh: 6000,
    maxSavings: 3500,
  },
  {
    type: "cremation-with-service",
    label: SERVICE_LABELS["cremation-with-service"],
    fairLow: 3500,
    fairHigh: 6000,
    predatoryLow: 8000,
    predatoryHigh: 12000,
    maxSavings: 5000,
  },
  {
    type: "traditional-burial",
    label: SERVICE_LABELS["traditional-burial"],
    fairLow: 8000,
    fairHigh: 12000,
    predatoryLow: 18000,
    predatoryHigh: 28000,
    maxSavings: 10000,
  },
  {
    type: "graveside-burial",
    label: SERVICE_LABELS["graveside-burial"],
    fairLow: 5000,
    fairHigh: 8000,
    predatoryLow: 12000,
    predatoryHigh: 18000,
    maxSavings: 7000,
  },
];

export function classifyPrice(
  item: LineItem,
  observed: number,
): "good" | "fair" | "high" | "predatory" {
  if (observed <= item.fairLow) return "good";
  if (observed <= item.fairHigh) return "fair";
  if (observed < item.predatoryAt) return "high";
  return "predatory";
}

export function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtRange(low: number, high: number): string {
  return `${fmtUSD(low)}–${fmtUSD(high)}`;
}

/**
 * Coarse regional cost-of-living adjustment by zip prefix.
 * V1 placeholder. Sister's per-city validation replaces this in V2.
 */
export function regionMultiplier(zip: string): number {
  if (!zip || zip.length < 1) return 1;
  const prefix = zip[0];
  // High COL coastal (NY, NJ, MA / CA): bump 25%
  if (["0", "1", "9"].includes(prefix)) return 1.25;
  // Lower COL midwest/south: trim 10%
  if (["3", "4", "5", "6", "7"].includes(prefix)) return 0.9;
  return 1;
}

export function adjustedRange(
  low: number,
  high: number,
  zip?: string,
): [number, number] {
  const m = regionMultiplier(zip ?? "");
  return [Math.round(low * m), Math.round(high * m)];
}
