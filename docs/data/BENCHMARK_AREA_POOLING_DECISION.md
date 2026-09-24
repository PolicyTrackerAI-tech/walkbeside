# Decision: pool thin DC-metro benchmark areas?

_Founder decision memo, 2026-09-24. Decide by **~11/1**, before the first
Maryland or Virginia promotion on `/admin/benchmarks`
([`EXECUTION_PLAN_DMV_2026-09.md`](../EXECUTION_PLAN_DMV_2026-09.md)). The
code is built and **off**: nothing changes until you turn it on._

## The problem

Local price ranges publish per **benchmark area**, and only once an area has
at least five price-list observations for an item (guardrail #4). Today an
area is a zip-regions label, which follows the first three digits of the
zip. Several DC-metro labels are too small to ever get there:

| Area (zip3) | Homes on the roster | At half of them sharing a list |
|---|---|---|
| Washington DC (200–205) | 33 | 16 |
| Prince George's County (207) | 25 | 12 |
| Bethesda/Rockville (208) | 12 | 6 |
| Northern VA (Loudoun/Manassas/Reston) (201) | 11 | 5 |
| Southern Maryland (206) | 8 | 4 |
| Alexandria (223) | 6 | 3 |
| Fairfax County (220) | 5 | 2 |
| McLean/Vienna/Woodbridge (221) | 5 | 2 |
| Silver Spring/Takoma Park (209) | 4 | 2 |
| **Arlington (222)** | **3** | **1** |

Counts come from [`supabase/seed/dmv-tracker.csv`](../../supabase/seed/dmv-tracker.csv).
"Half" is a planning scenario, not a forecast. The FTC Funeral Rule
requires a price list to show the price of each core item a home offers
(basic services, embalming, transfer, direct cremation, immediate burial),
so a home that shares its list usually counts toward all of them at once.

Arlington can't reach five even if every home shares. Silver Spring can't
either. Alexandria, Fairfax and McLean need nearly every home.

## The options

**A. No pooling (today's default).** Every zip3 label stands alone. DC,
Prince George's and probably Bethesda/Rockville and Loudoun/Manassas
publish. Arlington, Silver Spring, Alexandria, Fairfax and McLean likely
never do, so a family in Arlington sees modeled prices only.

**B. Two pools (recommended).**

| Pool | Combines | Homes |
|---|---|---|
| **Montgomery County, MD** | Bethesda/Rockville + Silver Spring/Takoma Park | 16 |
| **Northern Virginia** | Arlington + Alexandria + Fairfax County + McLean/Vienna/Woodbridge + Northern VA (Loudoun/Manassas/Reston) | 30 |

DC, Prince George's and Southern Maryland stay as they are.

**C. Three pools.** Montgomery as in B, but Virginia splits into an inner
pool (Arlington, Alexandria, Fairfax, McLean: 19 homes) and
Loudoun/Manassas on its own (11). This is closer to real price levels if
the outer suburbs run cheaper, but the inner pool is marginal again at half
yield (9), and Loudoun/Manassas sits right at 5.

## Recommendation: B, with a check that can move it to C

- Both pools are names families already use. "Montgomery County" is one
  county split across two zip3s. "Northern Virginia" is how the region
  describes itself.
- Both pools publish at realistic yield (8 and 15), so the Virginia and
  Montgomery launch pages get real local ranges by the 11/13 and 12/15
  checkpoints instead of staying modeled.
- **The check.** Once Northern Virginia has five or more lists, compare
  the Loudoun/Manassas median for basic services and direct cremation with
  the rest of the pool. If either differs by more than 15% (the pipeline's
  own drift tolerance, `DRIFT_TOLERANCE`), switch to C before promoting.

**Leave Southern Maryland alone for now.** Pooling it with Prince George's
would blend rural Charles and St. Mary's prices into a suburban range.
Revisit at the 11/13 Maryland checkpoint if it's still under five.

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
