/**
 * Sister's editorial content — voice, scripts, prompts.
 * Tone rules: warm, direct, never saccharine, no jargon without explanation.
 */

import type { Scenario } from "./scenarios";

export const PROMISE =
  "When someone you love dies, you should not have to figure this out alone. We walk beside you from the first phone call to the last account closed.";

export const PROGRESS_PHRASES: Record<string, string[]> = {
  "chose-funeral-home": [
    "You just made one of the hardest decisions. That took strength.",
    "That was a real decision in a hard moment. Take a breath.",
  ],
  "uploaded-price-list": [
    "We found a few items above fair market price. Here's what you can still change.",
    "Good. Let's see what they tried to charge you.",
  ],
  "completed-arrangement-meeting": [
    "You walked in prepared. That matters. Here's what comes next.",
    "That meeting is over. The hardest financial decision is behind you.",
  ],
  "ordered-death-certificates": [
    "One of the most tedious parts done. We'll track where each one goes.",
  ],
};

export function progressLine(key: string): string {
  const opts = PROGRESS_PHRASES[key];
  if (!opts || opts.length === 0) return "Done.";
  return opts[0];
}

/** Death certificate guidance — lookup table of asset types → certificates needed. */
export const CERT_BUCKETS: {
  key: string;
  label: string;
  perItem: number;
  description: string;
}[] = [
  {
    key: "bank",
    label: "Bank or credit union accounts",
    perItem: 1,
    description: "One per institution, not per account. Most banks accept a copy after the first.",
  },
  {
    key: "investment",
    label: "Investment / retirement accounts (IRA, 401k, brokerage)",
    perItem: 1,
    description: "One per institution. Inherited IRAs in particular need certified.",
  },
  {
    key: "insurance",
    label: "Life insurance policies",
    perItem: 1,
    description: "Each insurer requires its own certified copy.",
  },
  {
    key: "property",
    label: "Real estate parcels (deeded property)",
    perItem: 1,
    description: "One per property for title transfer.",
  },
  {
    key: "vehicle",
    label: "Vehicle titles (cars, boats, RVs)",
    perItem: 1,
    description: "DMV requires a certified copy per titled vehicle.",
  },
  {
    key: "social-security",
    label: "Social Security",
    perItem: 1,
    description: "Required to stop benefits and apply for survivor benefits.",
  },
  {
    key: "veterans",
    label: "Veterans benefits / VA",
    perItem: 1,
    description: "Needed for VA burial allowance and survivor benefits.",
  },
  {
    key: "pension",
    label: "Pension plans",
    perItem: 1,
    description: "One per plan for survivor benefit claims.",
  },
];

export const CERT_BASELINE = 3; // baseline copies for misc. uses (probate, employer, etc.)

export function calcCertificates(counts: Record<string, number>): {
  total: number;
  breakdown: { key: string; count: number; certs: number }[];
} {
  let total = CERT_BASELINE;
  const breakdown: { key: string; count: number; certs: number }[] = [];
  for (const b of CERT_BUCKETS) {
    const c = counts[b.key] ?? 0;
    const certs = c * b.perItem;
    total += certs;
    breakdown.push({ key: b.key, count: c, certs });
  }
  return { total, breakdown };
}

/** Obituary helper — prompts shown one at a time. */
export const OBITUARY_PROMPTS = [
  { id: "fullName", label: "Full name", placeholder: "Margaret Anne Whitaker", required: true },
  { id: "nickname", label: "What did people call them?", placeholder: "Maggie", required: false },
  { id: "born", label: "Date and place of birth", placeholder: "March 4, 1948 in Akron, Ohio", required: true },
  { id: "died", label: "Date of death", placeholder: "April 18, 2026", required: true },
  {
    id: "family",
    label: "Surviving family members",
    placeholder: "Husband John; children Sarah and Michael; four grandchildren",
    required: false,
  },
  {
    id: "career",
    label: "Career and accomplishments",
    placeholder: "Taught third grade for 32 years at Lincoln Elementary",
    required: false,
  },
  {
    id: "passions",
    label: "Passions and what they were known for",
    placeholder: "Rose garden, Sunday pancake breakfasts, fierce Scrabble games",
    required: false,
  },
  {
    id: "service",
    label: "Service details (if known)",
    placeholder: "Memorial service Saturday, May 2 at 11am, First Methodist Church",
    required: false,
  },
] as const;

export const SCENARIO_LANDING_TONE: Record<Scenario, string> = {
  hospital:
    "The hospital is moving fast. We're going to slow this down for the next few minutes so you don't make a $10,000 decision in a hallway.",
  "home-expected":
    "You have more time than you think. Hospice will handle the immediate steps. We'll handle what comes next.",
  "home-unexpected":
    "Whatever's happening right now, you're not in trouble. Police involvement is procedural in unexpected deaths. Once they've gone, come back.",
  elsewhere: "We'll work with what you tell us. Start with the basics below.",
};
