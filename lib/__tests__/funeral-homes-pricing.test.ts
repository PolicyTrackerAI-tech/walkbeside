import { describe, it, expect } from "vitest";
import {
  totalsForService,
  FEATURED_SERVICES,
  TYPICAL_OPTIONAL_BY_SERVICE,
} from "@/lib/funeral-homes-pricing";
import {
  LINE_ITEMS,
  adjustedRange,
  type ServiceType,
} from "@/lib/pricing-data";

/**
 * Pins the /funeral-homes/[zip] pricing bands to the audited LINE_ITEMS
 * catalog.
 *
 * REGRESSION NOTE: these totals moved slightly (2026-07) when the unsourced
 * hard-coded constants (CREMATION_COST, CASKET_BASIC, VAULT_BASIC,
 * RENTAL_CASKET, URN_FAIR) were folded into LINE_ITEMS — the cremation
 * process fee and container were being double-counted on top of the
 * required:"cremation" catalog entries, and the casket/vault/rental/urn
 * figures shadowed the audited ones. Small movements vs. the old constants
 * are EXPECTED and correct: every number now traces to a sourced catalog
 * entry (guardrail #4). Do not "fix" a diff here by reintroducing constants.
 */

const ZIP = "84101";

/** Mirrors totalsForService's required-item filter, independently. */
function requiredIdsFor(serviceType: ServiceType): string[] {
  const cremation =
    serviceType === "direct-cremation" ||
    serviceType === "cremation-with-service" ||
    serviceType === "aquamation";
  const burial =
    serviceType === "traditional-burial" ||
    serviceType === "graveside-burial" ||
    serviceType === "green-burial";
  return LINE_ITEMS.filter(
    (it) =>
      it.categories.includes(serviceType) &&
      (it.required === "yes" ||
        (it.required === "burial" && burial) ||
        (it.required === "cremation" && cremation)),
  ).map((it) => it.id);
}

function catalogSums(ids: string[], zip: string) {
  let low = 0;
  let high = 0;
  let predatory = 0;
  for (const id of ids) {
    const item = LINE_ITEMS.find((it) => it.id === id);
    if (!item) throw new Error(`unknown line item: ${id}`);
    const [lo, hi] = adjustedRange(item.fairLow, item.fairHigh, zip);
    low += lo * 100;
    high += hi * 100;
    predatory += item.predatoryAt * 100;
  }
  return { low, high, predatory };
}

describe("TYPICAL_OPTIONAL_BY_SERVICE — no phantom ids", () => {
  it("every optional id resolves to a LINE_ITEMS entry", () => {
    const catalogIds = new Set(LINE_ITEMS.map((it) => it.id));
    for (const [service, ids] of Object.entries(TYPICAL_OPTIONAL_BY_SERVICE)) {
      for (const id of ids) {
        expect(catalogIds.has(id), `${service} → ${id}`).toBe(true);
      }
    }
  });

  it("the old phantom ids are gone", () => {
    const allIds = Object.values(TYPICAL_OPTIONAL_BY_SERVICE).flat();
    expect(allIds).not.toContain("casket-basic");
    expect(allIds).not.toContain("vault-basic");
  });
});

describe(`totalsForService — featured services at zip ${ZIP}`, () => {
  it("every band is positive and ordered low < high < predatory", () => {
    for (const service of FEATURED_SERVICES) {
      const t = totalsForService(service, ZIP);
      expect(t.stripped.low, service).toBeGreaterThan(0);
      expect(t.stripped.low, service).toBeLessThan(t.stripped.high);
      expect(t.typical.low, service).toBeLessThan(t.typical.high);
      expect(t.typical.high, service).toBeLessThan(t.predatory);
      expect(t.typical.low, service).toBeGreaterThanOrEqual(t.stripped.low);
      expect(t.typical.high, service).toBeGreaterThanOrEqual(t.stripped.high);
    }
  });

  it("every band derives from LINE_ITEMS catalog entries (honesty pin)", () => {
    for (const service of FEATURED_SERVICES) {
      const t = totalsForService(service, ZIP);
      const required = catalogSums(requiredIdsFor(service), ZIP);
      const optional = catalogSums(TYPICAL_OPTIONAL_BY_SERVICE[service], ZIP);
      expect(t.stripped.low, service).toBe(required.low);
      expect(t.stripped.high, service).toBe(required.high);
      expect(t.typical.low, service).toBe(required.low + optional.low);
      expect(t.typical.high, service).toBe(required.high + optional.high);
      expect(t.predatory, service).toBe(required.predatory + optional.predatory);
    }
  });

  it("cremation required items come from the catalog exactly once (no CREMATION_COST double-count)", () => {
    const ids = requiredIdsFor("direct-cremation");
    expect(ids).toContain("cremation-process-fee");
    expect(ids).toContain("cremation-container");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("pins the exact rendered totals (cents)", () => {
    expect(totalsForService("direct-cremation", ZIP)).toEqual({
      stripped: { low: 195_800, high: 339_700 },
      typical: { low: 195_800, high: 339_700 },
      predatory: 645_000,
    });
    expect(totalsForService("cremation-with-service", ZIP)).toEqual({
      stripped: { low: 195_800, high: 339_700 },
      typical: { low: 328_900, high: 548_800 },
      predatory: 1_065_000,
    });
    expect(totalsForService("traditional-burial", ZIP)).toEqual({
      stripped: { low: 433_300, high: 805_200 },
      typical: { low: 694_600, high: 1_223_300 },
      predatory: 2_605_000,
    });
  });
});
