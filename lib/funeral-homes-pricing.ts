/**
 * Helper: compute typical fair-range totals per service type for a given zip.
 *
 * Used by the public /funeral-homes/[zip] directory page. Sums LINE_ITEMS
 * by service-type category and applies the regional cost-of-living multiplier
 * via adjustedRange().
 *
 * Every number here must trace to a LINE_ITEMS entry (the audited catalog
 * with sources) — no side-channel constants. Guardrail #4: never publish a
 * number we can't defend.
 *
 * "Typical bundle" = the items most families end up paying for — required
 * items plus the common optional pieces (e.g. casket for traditional burial).
 * "Stripped bundle" = required-only minimum.
 */

import {
  LINE_ITEMS,
  displayThresholds,
  type ServiceType,
} from "./pricing-data";

export interface ServiceTotals {
  /** Fair range for the required-only minimum a family can't decline. */
  stripped: { low: number; high: number };
  /** Typical full bundle (required + commonly chosen optional items). */
  typical: { low: number; high: number };
  /** Predatory ceiling — what families see when a home is bundling aggressively. */
  predatory: number;
}

/**
 * For each service type, the optional line-item IDs that are typically
 * included in a "real" funeral total. The remaining optional items are
 * up-sells that families decline with the toolkit. Every id must exist in
 * LINE_ITEMS (pinned by lib/__tests__/funeral-homes-pricing.test.ts).
 */
export const TYPICAL_OPTIONAL_BY_SERVICE: Record<ServiceType, string[]> = {
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
    "casket-metal",
    "vault",
  ],
  "graveside-burial": ["graveside", "casket-metal", "vault"],
  "green-burial": ["graveside", "casket-metal"],
  "aquamation": ["urn"],
  "body-donation": [],
  "memorial-no-body": ["service-facility"],
};

/**
 * Computes the three pricing bands for a given service type at a given zip.
 * All numbers in cents. Every threshold derives from displayThresholds —
 * the same rule the analyzer classifies with: fair ranges AND predatory
 * cutoffs adjust by the regional multiplier, per-unit state fees stay
 * national. (Previously the predatory sums stayed raw-national beside
 * adjusted fair ranges, so this page and the analyzer could rate the same
 * dollar total differently — guardrail #4.)
 */
export function totalsForService(
  serviceType: ServiceType,
  zip: string,
): ServiceTotals {
  // Sum all required items for this service type — including the
  // required:"cremation" catalog entries (cremation process fee + container),
  // so the cremation itself is never added as a separate unsourced constant.
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
    const t = displayThresholds(it, zip);
    strippedLow += t.fairLow * 100; // dollars to cents
    strippedHigh += t.fairHigh * 100;
    predatoryTotal += t.predatoryAt * 100;
  }

  // Typical optional items
  const optionalIds = TYPICAL_OPTIONAL_BY_SERVICE[serviceType];
  let optionalLow = 0;
  let optionalHigh = 0;
  let optionalPredatory = 0;

  for (const id of optionalIds) {
    const item = LINE_ITEMS.find((it) => it.id === id);
    if (item) {
      const t = displayThresholds(item, zip);
      optionalLow += t.fairLow * 100;
      optionalHigh += t.fairHigh * 100;
      optionalPredatory += t.predatoryAt * 100;
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
