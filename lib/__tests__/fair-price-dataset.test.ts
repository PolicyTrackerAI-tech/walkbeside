import { describe, it, expect } from "vitest";
import { PRICING_LAST_UPDATED } from "@/lib/pricing-data";
import { datasetLastUpdated } from "@/lib/fair-price-dataset";

describe("datasetLastUpdated", () => {
  it("falls back to the catalog date when there are no rows", () => {
    expect(datasetLastUpdated([])).toBe(PRICING_LAST_UPDATED);
  });

  it("returns the newest effective_at when it beats the catalog date", () => {
    expect(
      datasetLastUpdated([
        { effectiveAt: "2026-07-10T00:00:00+00:00" },
        { effectiveAt: "2026-07-21T12:34:56+00:00" },
      ]),
    ).toBe("2026-07-21");
  });

  it("keeps the catalog date when all rows are older", () => {
    expect(
      datasetLastUpdated([{ effectiveAt: "2026-01-01T00:00:00+00:00" }]),
    ).toBe(PRICING_LAST_UPDATED);
  });
});
