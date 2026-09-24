# Decision: pool thin DC-metro benchmark areas?

_Founder decision memo, 2026-09-24. Decide by **~11/1**, before the first
Maryland or Virginia promotion on `/admin/benchmarks`
([`EXECUTION_PLAN_DMV_2026-09.md`](../EXECUTION_PLAN_DMV_2026-09.md)). The
code is built and **off**: nothing changes until you turn it on._

## The problem

Local price ranges publish per **benchmark area**, and only once an area has
at least five price-list observations for an item (guardrail #4). Today an
area is a zip-regions label, which follows the first three digits of the
zip. Several DC-metro labels are too small to get there reliably:

| Area (zip3) | Homes on the roster | At half of them sharing a list |
|---|---|---|
| Washington DC (200–205) | 34 | 17 |
| Prince George's County (207) | 28 | 14 |
| Northern VA (Loudoun/Manassas/Reston) (201) | 15 | 7 |
| Southern Maryland (206) | 15 | 7 |
| Bethesda/Rockville (208) | 14 | 7 |
| Alexandria (223) | 8 | 4 |
| Fairfax County (220) | 6 | 3 |
| McLean/Vienna/Woodbridge (221) | 6 | 3 |
| Silver Spring/Takoma Park (209) | 5 | 2 |
| **Arlington (222)** | **3** | **1** |

Counts come from [`supabase/seed/dmv-tracker.csv`](../../supabase/seed/dmv-tracker.csv)
as of 2026-09-24. "Half" is a planning scenario, not a forecast. The FTC
Funeral Rule requires a price list to show the price of each core item a
home offers (basic services, embalming, transfer, direct cremation,
immediate burial), so a home that shares its list usually counts toward
all of them at once.

Arlington can't reach five even if every home shares. Silver Spring needs
every one of its five. Alexandria, Fairfax and McLean need most of theirs.

## The options

**A. No pooling (today's default).** Every zip3 label stands alone. DC,
Prince George's, and probably Bethesda/Rockville, Loudoun/Manassas and
Southern Maryland publish. Arlington, Silver Spring, Alexandria, Fairfax
and McLean likely never do, so a family in Arlington sees modeled prices
only.

**B. Two pools (recommended).**

| Pool | Combines | Homes | At half |
|---|---|---|---|
| **Montgomery County, MD** | Bethesda/Rockville + Silver Spring/Takoma Park | 19 | 9 |
| **Northern Virginia** | Arlington + Alexandria + Fairfax County + McLean/Vienna/Woodbridge + Northern VA (Loudoun/Manassas/Reston) | 38 | 19 |

DC, Prince George's and Southern Maryland stay as they are.

**C. Three pools.** Montgomery as in B, but Virginia splits into an inner
pool (Arlington, Alexandria, Fairfax, McLean: 23 homes, 11 at half) and
Loudoun/Manassas on its own (15 homes, 7 at half). This is closer to real
price levels if the outer suburbs run cheaper. Both halves clear five at
half yield, but with less margin, so they publish later than one pool
would.

## Recommendation: B, with a check that can move it to C

- Both pools are names families already use. "Montgomery County" is one
  county split across two zip3s. "Northern Virginia" is how the region
  describes itself.
- Both pools clear five with room to spare (9 and 19 at half yield), so the
  Montgomery and Virginia launch pages get real local ranges by the 11/13
  and 12/15 checkpoints instead of staying modeled.
- **The check.** Once Northern Virginia has five or more lists, compare
  the Loudoun/Manassas median for basic services and direct cremation with
  the rest of the pool. If either differs by more than 15% (the pipeline's
  own drift tolerance, `DRIFT_TOLERANCE`), switch to C before promoting.
  With 15 Loudoun/Manassas homes on the roster, C is a real fallback.

**Leave Southern Maryland alone.** With 15 homes it can reach five on its
own, and pooling it with Prince George's would blend rural Charles,
St. Mary's and Calvert prices into a suburban range. Revisit at the 11/13
Maryland checkpoint only if it's still under five.

## Why this is consistent with guardrail #4

- **The bar doesn't move.** A pooled area still needs five observations
  per item, counted and deduplicated exactly as before, and the promote
  route still recomputes n on the server with no override.
- **The label tells the truth.** A pooled range is grouped, promoted,
  stored and published under the pool's name only. The zip and city pages
  add "covers the wider Northern Virginia area" (or Montgomery) when a
  pooled range is showing, and the Fair-Price Index lists the pool by
  name. A pooled range never appears under Arlington's own label.
- **No home-level claim changes.** Pooling only affects area ranges.
- **The code rejects bad pools.** A pool must combine real labels from one
  state, each label can be in only one pool, and a pool's name can't
  collide with an existing label (`poolProblems` in
  `lib/benchmark-areas.ts`, run by CI on both the active and the proposed
  pools).

## Timing: turn it on before the first Maryland or Virginia promotion

A range promoted under a member's own label (say, "Bethesda/Rockville")
stops matching once that label is pooled, and the page quietly falls back
to modeled prices. Flipping before any Maryland or Virginia promotion
avoids that. If a member label was already promoted, retire those rows and
promote the pool instead.

DC is unaffected either way.

## How to turn it on

One line in `lib/benchmark-areas.ts`, in a reviewed PR like any change to
what we publish:

```ts
export const BENCHMARK_AREA_POOLS: AreaPools = PROPOSED_DMV_POOLS;
```

For option C, edit `PROPOSED_DMV_POOLS` first. After it merges:
`/admin/benchmarks` shows pooled groups, the promote dropdown offers the
pool names (and no longer offers the member labels), and a promotion
refreshes the member city pages. In the tracker, the `benchmark_area`
column should then name the pool for the seven member labels. CI checks
this, so the PR that flips pooling on updates the tracker too.

**What I need from you:** A, B or C.
