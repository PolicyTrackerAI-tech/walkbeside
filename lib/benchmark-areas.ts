import { ZIP_REGIONS, regionForZip } from "./zip-regions";

/**
 * Benchmark areas: the label the benchmark pipeline groups a local price
 * under, and the label a metro-scoped regional_benchmarks row is looked up
 * by (and published as).
 *
 * By default an area IS the zip-regions metro label, which is what every
 * surface did before this file existed. Some DC-metro labels can never reach
 * the n≥5 publish gate on their own (Arlington has three funeral homes,
 * Silver Spring/Takoma Park four), so several labels can be pooled into one
 * named area here. The pool's name is what gets grouped, promoted and
 * published, so a pooled range is always labeled as the wider area, never
 * as one of its parts.
 *
 * Turning a pool on is a publishing decision (guardrail #4), made in a
 * reviewed PR like a code benchmark change, and best made BEFORE any member
 * label is promoted: a row already promoted under a member label stops
 * matching once that label is pooled. The proposal and the tradeoffs:
 * docs/data/BENCHMARK_AREA_POOLING_DECISION.md.
 */

/** Pool name → the zip-regions metro labels it combines. */
export type AreaPools = Readonly<Record<string, readonly string[]>>;

/** Active pools. Empty: no pooling, every area is its own metro label. */
export const BENCHMARK_AREA_POOLS: AreaPools = {};

/**
 * The DC-metro proposal, NOT active. The decision memo recommends it;
 * turning it on means copying it into BENCHMARK_AREA_POOLS.
 */
export const PROPOSED_DMV_POOLS: AreaPools = {
  "Montgomery County, MD": ["Bethesda/Rockville", "Silver Spring/Takoma Park"],
  "Northern Virginia": [
    "Arlington",
    "Alexandria",
    "Fairfax County",
    "McLean/Vienna/Woodbridge",
    "Northern VA (Loudoun/Manassas/Reston)",
  ],
};

/** The area a zip-regions metro label belongs to (itself when unpooled). */
export function benchmarkAreaForMetro(
  metro: string,
  pools: AreaPools = BENCHMARK_AREA_POOLS,
): string {
  for (const [area, members] of Object.entries(pools)) {
    if (members.includes(metro)) return area;
  }
  return metro;
}

/** The benchmark area for a zip, or undefined when zip-regions has no entry. */
export function benchmarkAreaForZip(
  zip: string,
  pools: AreaPools = BENCHMARK_AREA_POOLS,
): string | undefined {
  const metro = regionForZip(zip)?.metro;
  return metro === undefined ? undefined : benchmarkAreaForMetro(metro, pools);
}

/** Every label a metro-scoped row can be published under, sorted. */
export function benchmarkAreaLabels(
  pools: AreaPools = BENCHMARK_AREA_POOLS,
): string[] {
  return Array.from(
    new Set(
      Object.values(ZIP_REGIONS).map((r) => benchmarkAreaForMetro(r.metro, pools)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

/**
 * What's wrong with a pool definition (empty = sound). A pool must combine
 * real labels from one state, each label may sit in only one pool, and a
 * pool's name must not be an existing label (that would silently merge it
 * with an unpooled area).
 */
export function poolProblems(pools: AreaPools): string[] {
  const problems: string[] = [];
  const statesByMetro = new Map<string, Set<string>>();
  for (const r of Object.values(ZIP_REGIONS)) {
    const s = statesByMetro.get(r.metro) ?? new Set<string>();
    s.add(r.state);
    statesByMetro.set(r.metro, s);
  }
  const owner = new Map<string, string>();
  for (const [area, members] of Object.entries(pools)) {
    if (statesByMetro.has(area)) problems.push(`"${area}" is already a zip-regions label`);
    if (members.length < 2) problems.push(`"${area}" pools fewer than two labels`);
    const states = new Set<string>();
    for (const m of members) {
      const s = statesByMetro.get(m);
      if (!s) {
        problems.push(`"${area}": "${m}" is not a zip-regions label`);
        continue;
      }
      for (const st of s) states.add(st);
      const prev = owner.get(m);
      if (prev) problems.push(`"${m}" is in both "${prev}" and "${area}"`);
      owner.set(m, area);
    }
    if (states.size > 1) problems.push(`"${area}" crosses states (${[...states].sort().join(", ")})`);
  }
  return problems;
}
