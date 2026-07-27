import { describe, it, expect } from "vitest";
import {
  fetchAllPages,
  summarizeOwnership,
  groupByCity,
  type HospiceRow,
} from "@/lib/hospice-directory";

const row = (over: Partial<HospiceRow>): HospiceRow => ({
  ccn: "011500",
  name: "SOME HOSPICE",
  city: "PROVO",
  state: "UT",
  zip: "84601",
  ownership: "Non-Profit",
  ...over,
});

describe("fetchAllPages (the CA/TX >1,000-row pagination trap)", () => {
  it("drains full pages until a short page arrives", async () => {
    // 2,350 items in pages of 1,000 → exactly 3 fetches (1000/1000/350).
    const items = Array.from({ length: 2350 }, (_, i) => i);
    const calls: number[] = [];
    const result = await fetchAllPages(async (offset) => {
      calls.push(offset);
      return items.slice(offset, offset + 1000);
    }, 1000);
    expect(result).toHaveLength(2350);
    expect(calls).toEqual([0, 1000, 2000]);
    expect(result![2349]).toBe(2349);
  });

  it("stops after one call when the first page is short", async () => {
    const calls: number[] = [];
    const result = await fetchAllPages(async (offset) => {
      calls.push(offset);
      return ["a", "b", "c"];
    }, 1000);
    expect(result).toEqual(["a", "b", "c"]);
    expect(calls).toEqual([0]);
  });

  it("handles a total that is an exact page multiple (one trailing empty page)", async () => {
    const items = Array.from({ length: 2000 }, (_, i) => i);
    const calls: number[] = [];
    const result = await fetchAllPages(async (offset) => {
      calls.push(offset);
      return items.slice(offset, offset + 1000);
    }, 1000);
    expect(result).toHaveLength(2000);
    expect(calls).toEqual([0, 1000, 2000]);
  });

  it("fails the WHOLE read when any page fails — no partial state lists", async () => {
    const result = await fetchAllPages(
      async (offset) =>
        offset === 0 ? Array.from({ length: 1000 }, (_, i) => i) : null,
      1000,
    );
    expect(result).toBeNull();
  });
});

describe("summarizeOwnership", () => {
  it("counts verbatim labels and sorts by count desc", () => {
    const rows = [
      row({ ownership: "For-Profit" }),
      row({ ownership: "For-Profit" }),
      row({ ownership: "For-Profit" }),
      row({ ownership: "Non-Profit" }),
      row({ ownership: "Non-Profit" }),
      row({ ownership: "Government" }),
    ];
    expect(summarizeOwnership(rows)).toEqual([
      { label: "For-Profit", count: 3 },
      { label: "Non-Profit", count: 2 },
      { label: "Government", count: 1 },
    ]);
  });

  it("buckets null/empty ownership as 'not reported' and breaks ties alphabetically", () => {
    const rows = [
      row({ ownership: null }),
      row({ ownership: "  " }),
      row({ ownership: "Government" }),
      row({ ownership: "For-Profit" }),
      row({ ownership: "For-Profit" }),
    ];
    expect(summarizeOwnership(rows)).toEqual([
      { label: "For-Profit", count: 2 },
      { label: "Government", count: 1 },
      { label: "not reported", count: 2 },
    ].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)));
  });

  it("returns empty for empty input", () => {
    expect(summarizeOwnership([])).toEqual([]);
  });
});

describe("groupByCity", () => {
  it("groups by VERBATIM city, cities A→Z, preserving row order within a group", () => {
    const rows = [
      row({ ccn: "1", city: "OGDEN" }),
      row({ ccn: "2", city: "LOGAN" }),
      row({ ccn: "3", city: "OGDEN" }),
    ];
    const groups = groupByCity(rows);
    expect(groups.map((g) => g.city)).toEqual(["LOGAN", "OGDEN"]);
    expect(groups[1].rows.map((r) => r.ccn)).toEqual(["1", "3"]);
  });

  it("keeps the raw uppercase city as the group key (display casing is render-time)", () => {
    const groups = groupByCity([row({ city: "SALT LAKE CITY" })]);
    expect(groups[0].city).toBe("SALT LAKE CITY");
  });

  it("puts null and empty-string cities in a final no-city group", () => {
    const rows = [
      row({ ccn: "1", city: null }),
      row({ ccn: "2", city: "ZION" }),
      row({ ccn: "3", city: "  " }),
    ];
    const groups = groupByCity(rows);
    expect(groups.map((g) => g.city)).toEqual(["ZION", null]);
    expect(groups[1].rows.map((r) => r.ccn)).toEqual(["1", "3"]);
  });

  it("omits the no-city group when every row has a city", () => {
    const groups = groupByCity([row({ city: "MOAB" })]);
    expect(groups).toHaveLength(1);
    expect(groups[0].city).toBe("MOAB");
  });
});
