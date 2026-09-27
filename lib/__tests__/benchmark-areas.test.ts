import { describe, it, expect } from "vitest";
import {
  BENCHMARK_AREA_POOLS,
  PROPOSED_DMV_POOLS,
  benchmarkAreaForMetro,
  benchmarkAreaForZip,
  benchmarkAreaLabels,
  poolProblems,
} from "@/lib/benchmark-areas";
import { aggregateBenchmarks, type AnalysisRecord } from "@/lib/benchmark-pipeline";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";
import { ZIP_REGIONS, regionForZip } from "@/lib/zip-regions";

/**
 * Pooling decides what label a published local range carries (guardrail
 * #4), so these pin that a pool is sound, that no pool means no change, and
 * that a pooled range is grouped, and so published, only under the pool's
 * own name.
 */

describe("pool definitions", () => {
  it("the active pools are sound", () => {
    expect(poolProblems(BENCHMARK_AREA_POOLS)).toEqual([]);
  });

  it("the proposed DC-metro pools are sound", () => {
    expect(poolProblems(PROPOSED_DMV_POOLS)).toEqual([]);
  });

  it("rejects an unknown label, a name that is already a label, a cross-state pool, a label in two pools, and a pool of one", () => {
    const problems = poolProblems({
      "Washington DC": ["Arlington", "Alexandria"],
      "Capital Region": ["Washington DC", "Arlington"],
      Typo: ["Arlingtn", "Alexandria"],
      Solo: ["Fairfax County"],
    }).join("\n");
    expect(problems).toMatch(/"Washington DC" is already a zip-regions label/);
    expect(problems).toMatch(/"Capital Region" crosses states \(DC, VA\)/);
    expect(problems).toMatch(/"Arlingtn" is not a zip-regions label/);
    expect(problems).toMatch(/"Arlington" is in both/);
    expect(problems).toMatch(/"Solo" pools fewer than two labels/);
  });
});

describe("with no pools, an area is its metro label", () => {
  it("for every zip-regions prefix", () => {
    for (const [zip3, r] of Object.entries(ZIP_REGIONS)) {
      expect(benchmarkAreaForZip(`${zip3}01`, {})).toBe(r.metro);
    }
  });

  it("offers exactly the metro labels to promote", () => {
    expect(benchmarkAreaLabels({})).toEqual(
      Array.from(new Set(Object.values(ZIP_REGIONS).map((r) => r.metro))).sort((a, b) =>
        a.localeCompare(b),
      ),
    );
  });

  it("returns undefined for a zip zip-regions doesn't know", () => {
    expect(benchmarkAreaForZip("00000", {})).toBeUndefined();
  });
});

describe("with the proposed DC-metro pools", () => {
  const P = PROPOSED_DMV_POOLS;

  it("maps each member zip to its pool and leaves everything else alone", () => {
    expect(benchmarkAreaForZip("22201", P)).toBe("Northern Virginia"); // Arlington
    expect(benchmarkAreaForZip("22314", P)).toBe("Northern Virginia"); // Alexandria
    expect(benchmarkAreaForZip("20176", P)).toBe("Northern Virginia"); // Leesburg
    expect(benchmarkAreaForZip("20850", P)).toBe("Montgomery County, MD"); // Rockville
    expect(benchmarkAreaForZip("20910", P)).toBe("Montgomery County, MD"); // Silver Spring
    expect(benchmarkAreaForZip("20001", P)).toBe("Washington DC");
    expect(benchmarkAreaForZip("20774", P)).toBe("Prince George's County");
    expect(benchmarkAreaForZip("84111", P)).toBe("Salt Lake City");
    expect(benchmarkAreaForMetro("Arlington", P)).toBe("Northern Virginia");
  });

  it("offers the pool names to promote, and never a pooled member's own label", () => {
    const labels = benchmarkAreaLabels(P);
    expect(labels).toContain("Northern Virginia");
    expect(labels).toContain("Montgomery County, MD");
    for (const members of Object.values(P)) {
      for (const m of members) expect(labels).not.toContain(m);
    }
  });

  it("covers every DC-metro zip3 outside DC, Prince George's and Southern Maryland", () => {
    // 201, 208, 209, 220-223: the Virginia and Montgomery prefixes the memo
    // pools. A missed prefix would leave a sliver of the market unpooled.
    for (const zip3 of ["201", "208", "209", "220", "221", "222", "223"]) {
      const metro = regionForZip(`${zip3}01`)!.metro;
      expect(benchmarkAreaForMetro(metro, P), zip3).not.toBe(metro);
    }
  });
});

describe("the pipeline groups by area", () => {
  // Five homes, none of whose metro labels reaches five on its own.
  const zips = ["22201", "22202", "22314", "22030", "22101"];
  const records: AnalysisRecord[] = zips.map((zip, i) => ({
    userId: `home-${i}`,
    zip,
    items: [{ matchedItemId: "basic-services", cents: 250000 + i * 10000 }],
  }));
  const local = (pools: Parameters<typeof aggregateBenchmarks>[1]) =>
    aggregateBenchmarks(records, pools).filter((g) => g.region !== "national");

  it("without pools: one group per metro label, none publishable", () => {
    const groups = local({});
    expect(groups.map((g) => g.region).sort()).toEqual(
      ["Alexandria", "Arlington", "Fairfax County", "McLean/Vienna/Woodbridge"].sort(),
    );
    expect(groups.every((g) => g.n < SMALL_SAMPLE_THRESHOLD)).toBe(true);
  });

  it("with the proposed pools: one Northern Virginia group that reaches the publish gate", () => {
    const groups = local(PROPOSED_DMV_POOLS);
    expect(groups).toHaveLength(1);
    expect(groups[0].region).toBe("Northern Virginia");
    expect(groups[0].n).toBe(5);
    expect(groups[0].sufficient).toBe(true);
  });

  it("pooling never changes the national group", () => {
    const nat = (pools: Parameters<typeof aggregateBenchmarks>[1]) =>
      aggregateBenchmarks(records, pools).find((g) => g.region === "national");
    expect(nat(PROPOSED_DMV_POOLS)).toEqual(nat({}));
  });
});
