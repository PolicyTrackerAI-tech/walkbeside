import { describe, it, expect } from "vitest";
import { CITIES, citySlugsForMetro } from "@/lib/city-pages";
import { regionForZip } from "@/lib/zip-regions";

describe("citySlugsForMetro", () => {
  it("maps a zip-regions metro label to its city page slugs", () => {
    // 84111 → "Salt Lake City" — the weekend promotion target.
    expect(citySlugsForMetro("Salt Lake City")).toEqual(["salt-lake-city"]);
  });

  it("returns [] for a metro with no city page (promotion still succeeds, only the index purges)", () => {
    expect(citySlugsForMetro("Kalispell/Flathead")).toEqual([]);
    expect(citySlugsForMetro("not a metro label")).toEqual([]);
  });

  it("round-trips every city page through its own metro label", () => {
    // Pins the CITIES comment's invariant: each zipExample maps to a real
    // ZIP_REGIONS entry — so no city page is unreachable by a promotion of
    // its own metro.
    for (const c of CITIES) {
      const region = regionForZip(c.zipExample);
      expect(region, `${c.slug} zipExample has no ZIP_REGIONS entry`).not.toBeNull();
      expect(citySlugsForMetro(region!.metro)).toContain(c.slug);
    }
  });
});
