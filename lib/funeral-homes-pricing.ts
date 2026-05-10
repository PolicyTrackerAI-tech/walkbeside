/**
 * Helper: compute typical fair-range totals per service type for a given zip.
 *
 * Used by the public /funeral-homes/[zip] directory page. Sums LINE_ITEMS
 * by service-type category and applies the regional cost-of-living multiplier
 * via adjustedRange().
 *
 * "Typical bundle" = the items most families end up paying for — required
 * items plus the common optional pieces (e.g. casket for traditional burial).
 * "Stripped bundle" = required-only minimum.
 */

import {
  LINE_ITEMS,
  adjustedRange,
  type ServiceType,
} from "./pricing-data";

export interface ServiceTotals {
  /** Required-only minimum the funeral home cannot legally avoid charging. */
  stripped: { low: number; high: number };
  /** Typical full bundle (required + commonly chosen optional items). */
  typical: { low: number; high: number };
  /** Predatory ceiling — what families see when a home is bundling aggressively. */
  predatory: number;
}

/**
 * For each service type, the optional line-item IDs that are typically
 * included in a "real" funeral total. The remaining optional items are
 * up-sells that families decline with the toolkit.
 */
const TYPICAL_OPTIONAL_BY_SERVICE: Record<ServiceType, string[]> = {
  "direct-cremation": [],
  "cremation-with-service": [
    "body-prep",
    "service-facility",
    "rental-casket",
    "urn",
  ],
  "traditional-burial": [
    "body-prep",
    "viewing",
    "service-facility",
    "graveside",
    "casket-basic",
    "vault-basic",
  ],
  "graveside-burial": ["graveside", "casket-basic", "vault-basic"],
  "green-burial": ["graveside", "casket-basic"],
  "aquamation": ["urn"],
  "body-donation": [],
  "memorial-no-body": ["service-facility"],
};

/**
 * Estimate cremation cost (the cremation itself, not the service around it).
 * Hard-coded fair range per Sarah's national benchmarks — not in LINE_ITEMS
 * because cremation is its own line item handled by some homes via a
 * "cremation fee" while others bundle it into "basic services."
 */
const CREMATION_COST = { low: 70_000, high: 100_000 }; // cents
const PREDATORY_CREMATION_CEILING = 200_000; // $2,000+

const CASKET_BASIC = { low: 80_000, high: 200_000, predatory: 800_000 };
const VAULT_BASIC = { low: 90_000, high: 180_000, predatory: 350_000 };
const RENTAL_CASKET = { low: 60_000, high: 120_000, predatory: 250_000 };
const URN_FAIR = { low: 5_000, high: 30_000, predatory: 100_000 };

/**
 * Computes the three pricing bands for a given service type at a given zip.
 * All numbers in cents.
 */
export function totalsForService(
  serviceType: ServiceType,
  zip: string,
): ServiceTotals {
  // Sum all required items for this service type
  const requiredItems = LINE_ITEMS.filter(
    (it) =>
      it.categories.includes(serviceType) &&
      (it.required === "yes" ||
        (it.required === "burial" &&
          (serviceType === "traditional-burial" ||
            serviceType === "graveside-burial" ||
            serviceType === "green-burial")) ||
        (it.required === "cremation" &&
          (serviceType === "direct-cremation" ||
            serviceType === "cremation-with-service" ||
            serviceType === "aquamation"))),
  );

  let strippedLow = 0;
  let strippedHigh = 0;
  let predatoryTotal = 0;

  for (const it of requiredItems) {
    const [lo, hi] = adjustedRange(it.fairLow, it.fairHigh, zip);
    strippedLow += lo * 100; // dollars to cents
    strippedHigh += hi * 100;
    predatoryTotal += it.predatoryAt * 100;
  }

  // Add cremation cost for cremation services
  if (
    serviceType === "direct-cremation" ||
    serviceType === "cremation-with-service" ||
    serviceType === "aquamation"
  ) {
    strippedLow += CREMATION_COST.low;
    strippedHigh += CREMATION_COST.high;
    predatoryTotal += PREDATORY_CREMATION_CEILING;
  }

  // Typical optional items
  const optionalIds = TYPICAL_OPTIONAL_BY_SERVICE[serviceType];
  let optionalLow = 0;
  let optionalHigh = 0;
  let optionalPredatory = 0;

  for (const id of optionalIds) {
    if (id === "casket-basic") {
      optionalLow += CASKET_BASIC.low;
      optionalHigh += CASKET_BASIC.high;
      optionalPredatory += CASKET_BASIC.predatory;
    } else if (id === "vault-basic") {
      optionalLow += VAULT_BASIC.low;
      optionalHigh += VAULT_BASIC.high;
      optionalPredatory += VAULT_BASIC.predatory;
    } else if (id === "rental-casket") {
      optionalLow += RENTAL_CASKET.low;
      optionalHigh += RENTAL_CASKET.high;
      optionalPredatory += RENTAL_CASKET.predatory;
    } else if (id === "urn") {
      optionalLow += URN_FAIR.low;
      optionalHigh += URN_FAIR.high;
      optionalPredatory += URN_FAIR.predatory;
    } else {
      const item = LINE_ITEMS.find((it) => it.id === id);
      if (item) {
        const [lo, hi] = adjustedRange(item.fairLow, item.fairHigh, zip);
        optionalLow += lo * 100;
        optionalHigh += hi * 100;
        optionalPredatory += item.predatoryAt * 100;
      }
    }
  }

  return {
    stripped: { low: strippedLow, high: strippedHigh },
    typical: {
      low: strippedLow + optionalLow,
      high: strippedHigh + optionalHigh,
    },
    predatory: predatoryTotal + optionalPredatory,
  };
}

/**
 * Service types we feature on the public directory page — the three most
 * common scenarios. We omit the niche options (body donation, aquamation,
 * memorial-no-body) from the public summary; they're still accessible via
 * the full toolkit.
 */
export const FEATURED_SERVICES: ServiceType[] = [
  "direct-cremation",
  "cremation-with-service",
  "traditional-burial",
];
