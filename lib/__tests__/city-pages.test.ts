import { describe, it, expect } from "vitest";
import { CITIES, citySlugsForMetro } from "@/lib/city-pages";
import { regionForZip } from "@/lib/zip-regions";
import { benchmarkAreaForZip } from "@/lib/benchmark-areas";

describe("citySlugsForMetro", () => {
  it("maps a zip-regions metro label to its city page slugs", () => {
    // 84111 → "Salt Lake City" — the weekend promotion target.
    expect(citySlugsForMetro("Salt Lake City")).toEqual(["salt-lake-city"]);
  });

  it("returns [] for a metro with no city page (promotion still succeeds, only the index purges)", () => {
    expect(citySlugsForMetro("Kalispell/Flathead")).toEqual([]);
    expect(citySlugsForMetro("not a metro label")).toEqual([]);
  });

  it("maps a pooled area to its members' city pages, and a pooled member's own label to none", () => {
    const pools = { "Wasatch Front": ["Salt Lake City", "Ogden", "Provo"] };
    expect(citySlugsForMetro("Wasatch Front", pools)).toEqual(["salt-lake-city"]);
    expect(citySlugsForMetro("Salt Lake City", pools)).toEqual([]);
  });

  it("round-trips every city page through its own benchmark area", () => {
    // Pins the CITIES comment's invariant: each zipExample maps to a real
    // ZIP_REGIONS entry — so no city page is unreachable by a promotion of
    // its own area (its metro label, or the pool that label belongs to).
    for (const c of CITIES) {
      const region = regionForZip(c.zipExample);
      expect(region, `${c.slug} zipExample has no ZIP_REGIONS entry`).not.toBeNull();
      expect(citySlugsForMetro(benchmarkAreaForZip(c.zipExample)!)).toContain(c.slug);
    }
  });
});
