# Benchmark line-item expansion — spec for founder approval

**Status: NOT shipped. Awaiting Ryan's approve/redline.** None of these numbers touch
the live checker until signed off — per the rule that price benchmarks are the
founder's call and liability.

Produced 2026-06-26 by a research workflow: 5 item-groups researched against public
sources, then **every figure independently re-searched by a separate skeptic agent**
(AI fabricates plausible citations, so each number required a second-source check).
Items qualify as "ready" only with ≥2 genuinely independent credible sources.

## Methodology (matches the existing house rule)

Ranges target **fair/efficient pricing, not market medians.**
- `fairLow` — a low-cost or direct provider (Premier SLC GPL, FCA floors, retail anchors).
- `fairHigh` — at or **modestly below** the published national median (usually NFDA), because the median bakes in markup.
- `predatoryAt` — the clear-gouge line, above the observed top of the fair market (~1.5–2× median), anchored on a real high-end GPL or the NFDA max.
- `perUnit: true` for per-day (refrigeration) and per-set (cards) items, so a quoted total is divided by quantity/days before comparison.

**Recurring hazard the verifier caught:** several proposed "NFDA $X" medians for direct
cremation, immediate burial, and memorial-service facilities **do not exist** in the NFDA
study (NFDA itemizes far fewer lines than assumed). Those citations were dropped. The
surviving numbers are the ones that reproduced.

---

## WAVE 1 — ready to ship now (8 items, high confidence, no overlap)

| id | name | fairLow | fairHigh | predatoryAt | perUnit | key sources |
|---|---|---|---|---|---|---|
| `forwarding-remains` | Forwarding of remains to another funeral home | 1300 | 2400 | 4500 | — | NFDA 2021 median **$2,585** (n=786, min $40/max $7,600) + Premier SLC $1,295, Springer $1,695, Krause $1,995, Cutler $5,000 |
| `receiving-remains` | Receiving of remains from another funeral home | 1000 | 2000 | 3800 | — | NFDA 2021 median **$2,195** (n=783) + Premier $995, Springer $1,695, Krause $1,895, Cutler $3,650 |
| `refrigeration-shelter` | Refrigeration / sheltering of remains (per day) | 35 | 85 | 200 | **yes** | NFDA 2021 refrigeration median **$85** (n=479) + FCA-ish $35–$100/day, Premier $100/day, Krause $50/day, Morrell $200/day (outlier) |
| `cremation-process-fee` | Crematory / cremation process fee | 250 | 400 | 800 | — | FCA "Cremation Explained" $250–$400 third-party crematory + Funeral.com |
| `rental-casket` | Rental casket (ceremonial, for cremation viewing) | 750 | 1100 | 1800 | — | After.com $725–$1,250 + DFS Memorials $750–$1,500 |
| `witness-cremation-fee` | Witness cremation fee (add-on) | 100 | 250 | 450 | — | LegalClarity & Funeralocity $100–$300 + Ohio Cremation Society GPL $275 |
| `acknowledgement-cards` | Acknowledgement / thank-you cards (per ~25) | 15 | 25 | 50 | **yes** | Lowery $17.50/25, Legacy Options $25/25, Cutler $35, Phaneuf $75/25 (predatory anchor) |
| `register-book` | Register / guest book | 25 | 50 | 120 | — | Lowery $35, Cutler $40, Lynch & Sons $50, Phaneuf $50–$495, Michaels retail $24 |

**Caveats to encode (important — keep the checker from crying wolf):**
- **forwarding-remains** benchmarks the *service fee only*, NOT the third-party **airline shipping** cash-advance, which can legitimately add thousands. Don't flag a high total that's mostly airline freight.
- **refrigeration-shelter** is *per day*: most homes give a free **24–72 hr grace period** before the clock starts; the NFDA max $1,295 is a flat/total, not one day. Don't flag a legitimate multi-day total as predatory.

---

## WAVE 1B — solid data, but needs a reconcile decision first (2 items)

These have high-confidence data but **overlap an existing benchmark** — shipping them as-is
would risk double-counting or showing two different "fair" numbers for the same thing.

1. **`direct-cremation-fee`** $700–$1,800 (predatory $3,500), 3 sources (FCA $700–$1,400; Funeralocity national avg ~$2,183; DFS $600–$2,500).
   - Overlaps existing `SERVICE_TOTALS['direct-cremation']` (1000 / 2500 / 4000). The line-item fee is tighter and better-anchored than the package total.
   - **Recommend:** reconcile — e.g. lower the existing package `fairHigh` toward $2,000 so the package total and the line-item fee don't contradict.

2. **`facilities-staff-funeral-ceremony`** $400–$550 (predatory $1,000), NFDA 2023 median **$550**.
   - Near-duplicate of existing `service-facility` (400 / 600 / 1000).
   - **Recommend:** don't add a duplicate — instead relabel existing `service-facility` to the exact NFDA line and tighten `fairHigh` 600 → 550.

---

## NEEDS FOUNDER JUDGMENT (5 items — medium confidence or placement)

- **`service-utility-vehicle`** (service car/van) $100/$150/$400 — NFDA 2021 median **$150** (exact, robust) but only ONE priced GPL beyond it → medium. **Overlaps** hearse/transfer/limo; a family may see it double-billed. Ship as a flagged *upsell* line, or fold into transfer — your call on placement.
- **`immediate-burial-fee`** $1,200/$2,600/$5,000 — only ONE clean *service-only* anchor (Funeralocity $2,597 excl. casket); Choice Mutual/After include casket (different scope). The "NFDA immediate-burial median" doesn't exist — dropped. Ship medium-confidence, or hold for a 2nd service-only median. Must keep the "casket billed separately" double-count guard.
- **`scattering-service`** $100/$450/$950 — real but heterogeneous: a ~$150 add-on up to $950–$2,900 specialty charters (a different product). Ship only with a "don't auto-flag without context" caveat — a legit aerial/at-sea charter can exceed $950 without being predatory.
- **`columbarium-niche`** $800/$1,500/$3,500 — multi-sourced on shape (NFDA doesn't cover cemetery property) but one cited cemetery GPL couldn't be loaded. Range OK; replace the unverified Swan Point/Mount Calvary citation with a loadable cemetery GPL before attributing.
- **`memorial-folders`** $50/$100/$250 — solid data, but (1) `predatoryAt $250` sits *right at* a real market price (Phaneuf/Cutler price ~100 folders at $250) — consider nudging to ~$300 for headroom; (2) **overlaps existing `programs`** (75/150/400) — service folders often *are* the program. Reconcile labels so one charge isn't counted twice.

---

## DROPPED

- **`facilities-staff-memorial-service`** as a standalone item — **no independent median exists** (NFDA breaks out only viewing $475 and funeral ceremony $550). If a body-absent memorial needs a line, reuse the funeral-ceremony benchmark ($550) rather than minting an unsourced range.
- **Citations dropped** (items survive on other sources): NFDA "$1,945 direct-cremation median" and "$2,752 immediate-burial median" (don't exist in NFDA); `unitedtissue.org` crematory; Arizona $400 witness GPL; Swan Point/Mount Calvary niche; original stationery cites (Ruebel/Anchor Bay/CP) — replaced with verified funeral-home GPLs.

---

## EXISTING ITEMS — divergences from published data (FYI, no change without your nod)

- **`service-facility`** (fairHigh $600) sits slightly *above* NFDA 2023 median $550 → suggest tighten to $550 + relabel (see Wave 1B #2).
- **`SERVICE_TOTALS['direct-cremation']`** package (1000/2500/4000) runs higher/looser than the better-anchored line fee → reconcile (Wave 1B #1).
- **`programs`** (predatory $400) is more generous than folder data suggests, and overlaps memorial-folders → reconcile labels.
- **hearse/transfer/limo** already cover transport → adding a utility-vehicle line risks a double-bill (see judgment list).

---

## Data-quality verdict

**Mixed but genuinely usable — enough real public data to ship a solid first wave if we
stay disciplined about citations.** Strongest: the transfer/logistics cluster (forwarding,
receiving, refrigeration) — exact NFDA 2021 medians pulled from the actual survey PDF,
cross-checked against 4 independent GPLs. Also solid: cremation-specific lines and the
funeral-ceremony facility. Stationery items have abundant real GPL data. Inherently thin:
cemetery property, memorial-service facilities (correctly dropped), immediate-burial
service-only fee.

## Recommended next step

Ship **Wave 1 (the 8 clean items)** now — they're rock-solid and don't touch any existing
item. Do the **two Wave 1B reconciles** as a small, explicit edit to the existing items.
Hold the **5 judgment items** for your call. On your "go", I'll implement the approved
subset in `lib/pricing-data.ts` (with the per-unit flags and the airline-freight /
grace-period caveats wired into the rules so the checker doesn't cry wolf), add tests, and
ship — the `/methodology` page's item count updates itself.
