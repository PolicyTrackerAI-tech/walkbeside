import { describe, it, expect } from "vitest";
import {
  dataSourceForZip,
  DATA_SOURCE_LABEL,
  type PriceDataSource,
} from "@/lib/pricing-data";

// Every union member, including the deprecated aliases — the Record type
// enforces coverage at compile time; this pins it at runtime too.
const MEMBERS: PriceDataSource[] = [
  "verified",
  "community",
  "modeled",
  "validated",
  "metro-average",
  "national-adjusted",
];

describe("dataSourceForZip (static fallback)", () => {
  it("returns modeled for every zip", () => {
    expect(dataSourceForZip("84101")).toBe("modeled");
    expect(dataSourceForZip("10001")).toBe("modeled");
    expect(dataSourceForZip("")).toBe("modeled");
  });
});

describe("DATA_SOURCE_LABEL", () => {
  it("has a non-empty label for every PriceDataSource member", () => {
    for (const m of MEMBERS) {
      expect(DATA_SOURCE_LABEL[m]).toBeTruthy();
    }
  });

  it("keeps national-adjusted as an exact alias of modeled", () => {
    expect(DATA_SOURCE_LABEL["national-adjusted"]).toBe(
      DATA_SOURCE_LABEL.modeled,
    );
  });
});
