# A3 Claims Register — numbers defensibility (guardrail #4)

**Audit day A3, run 2026-08-18** off `origin/main` @ `34a5cb0`. Method: four
parallel claim-extraction sweeps over every externally visible surface
(marketing/institutional, price tools, content long tail, hospice directory +
misc), then source verification of the load-bearing citation set, then one
canonical value per fact enforced in code and copy. Live-prod probes confirmed
the empty verified tier (Fair-Price Index data endpoint: 30 national items,
**0 overrides**; tier API returns `modeled`) — every badge on every surface
correctly degrades to "Modeled estimate" with the GPL dataset at zero.

Verdict key: ✅ verified at source · 🔧 reworded/attributed this session ·
🗑 removed this session · ⏳ queued (needs work beyond this session).

---

## 1. The citation set (A3-05) — verified at the source

| Claim | Where it rendered | Source checked | Verdict |
|---|---|---|---|
| "~13 months of support Medicare requires per death (42 CFR 418.64)" | homepage, /partners ×2, ProofSheet | **42 CFR 418.64(d)(1)(ii): "up to 1 year following the death of the patient."** The regulation does NOT say 13 months — that is customary program length. | 🔧 **Was a misattribution.** All CFR-cited instances now say "1 year / up to a year (42 CFR 418.64(d))"; 13 months retained only as "most programs run ~13 months in practice." Practice-framing instances (grief, SelfCheck, final-days, after-hospice) now distinguish the mandate from the practice. |
| "1.7M die in hospice care each year — nearly half of all deaths in the US" | /after-hospice | NHPCO Facts & Figures 2024: **1.72M Medicare beneficiaries elected hospice (CY2022); 49.1% of Medicare decedents** (not of all US deaths; enrollment ≠ deaths-in-care) | 🔧 Now "1.7M receive hospice care each year, and about half of Medicare patients who die were enrolled in hospice (NHPCO)". /final-days "receive" framing was already correct; its "almost all die at home" softened to setting-accurate wording. |
| Fed SHED "roughly 40% can't cover a $400 expense" | /how-to-pay | **SHED 2024 (pub. May 2025): 63% would cover $400 with cash or equivalent → 37% would not** | 🔧 Now "37% … couldn't cover … with cash on hand (Federal Reserve's latest household survey)" |
| SECURE Act "50% penalty" on inherited-IRA RMD misses | /estate | **SECURE 2.0 §302: excise tax now 25%, 10% if corrected timely** (effective 2023) | 🔧 Was stale law. Now 25%/10%. |
| Gift-tax "$18,000 (2026 limit)" | /how-to-pay | **IRS 2026 annual exclusion: $19,000 per recipient** | 🔧 Was the 2024 figure. Now $19,000. |
| "Over 100,000 overdose deaths each year — more than guns and cars combined" | /overdose-loss | **CDC provisional: ~80.4k (2024), ~70k (2025)** — the comparison also fails at current levels | 🔧 Now "roughly 70,000 in 2025 by CDC provisional counts, after years above 100,000 at the peak"; comparison removed. |
| "135 people affected per suicide (CDC estimates)" | /suicide-loss | **Cerel et al. 2019, *Suicide & Life-Threatening Behavior* — not CDC** | 🔧 Attribution corrected to "(Cerel et al., 2019)". |
| Cremation "about 60% of dispositions" | glossary | **NFDA 2025 Cremation & Burial Report: 63.4% projected for 2025** | 🔧 Now "over 60% and rising (NFDA projects about 63% for 2025)". |
| CFA "up to 50% — what comparison shopping can cut" | /planning | **Confirmed — CFA states comparison shopping can lower costs by as much as 50%** | ✅ Kept as-is (already attributed to CFA on-page). |
| Same-market price dispersion (was published five ways: "2–3×", "3×", "3–10×", "200% to 400%", "vary by thousands") | /planning, /prices, /funeral-homes, /after-hospice, glossary, /average-funeral-cost | **FCA/CFA joint surveys: full-service funeral $2,580–$13,800 within the same markets; documented differences "up to 400–500%"; FCA metro surveys: direct cremation ~$850–$3,300+ in one metro** | 🔧 Canonical claim now "consumer surveys (FCA/CFA) have documented prices varying 200–400% in the same market," attributed wherever stated. The unsupported "3–10×" and the mis-scoped "more than 3× between zips" (our own multiplier table spans only 0.75–1.50 ≈ 2×) are gone. FAQ's $850–$3,300 example now attributed to FCA metro surveys. |
| "~10% of bereaved adults develop complicated grief" | /grief | **Lundorff et al. 2017 meta-analysis: pooled PGD prevalence 9.8%** | 🔧 Now "about one in ten (a 2017 meta-analysis put it at 9.8%)". |
| "60% of US adults die without a will" | /plan-ahead, glossary | Survey-dependent: Gallup 2021 = 54% have no will; Caring.com 2025 = only 24% have one. Any single point number is fragile. | 🔧 Now "most US adults — surveys consistently find more than half" (glossary cites Gallup 2021 as the floor). |
| NFDA medians ($6,280 cremation w/ viewing, $8,300 burial w/ viewing, 2023) | (new) /methodology §6, glossary | **NFDA 2023 Member GPL Study** | ✅ Added as anchors for the flagship figure; glossary "median" misuse fixed (a range was being called a median). |
| Headstone "save 30–60%" vs "50–200% markup" | /headstone-vendors, dashboard, guides | Internally consistent (a 50–200% markup ≈ 33–67% savings; 30–60% under-claims it). No external source found this session. | ⏳ Kept as an internally-reconcilable under-claim; queue a proper source (A7 content read). |
| Casket markup "300–500%" | /rights, glossary, cheatsheet, analyzer fallback, pricing-data notes | FCA/CFA surveys document differences to 400–500%; this is the widely-cited FCA figure. Retail example now arithmetically consistent ($1,000–$1,400 casket → $4,000 showroom). | 🔧 Canonicalized: markup = 300–500% everywhere (tactics page's "200–500%" left as the more conservative variant on that page's own sourced footer); savings = **40–70%** everywhere (was 50–80% on 3 surfaces vs 40–70% on 87 city pages — under-claim wins). |
| "18% of funeral homes post prices online" | **not rendered anywhere** (docs only) | CFA 2022 press release (1,046 homes, 35 cities) exists if ever needed | ✅ No live exposure; keep attributed if ever published. |
| CMS hospice directory counts + "as of July 2026" | /hospices/* (7 render sites) | Counts computed live from the imported CMS `yc9t-dgbk` table; `DIRECTORY_AS_OF` hardcoded, honest, and the only defense on retained rows | ⏳ Dated + sourced = defensible today. Two queued hardenings below (§4). |

## 2. The flagship claim (A3-01)

"Typical overcharge $2,000–$5,000" appeared on **10 surfaces** (homepage ×3,
/partners, /employers, FAQ ×2 incl. FAQPage JSON-LD, nurture email ×2) — uncited
on eight, and the /partners + /employers "see methodology" links pointed at a
page that did not contain the figure. The nurture email converted it into
"typical **savings** run $2,000 to $5,000" — a specific price advantage with
zero instrumented cases (Utah Code §13-11-4(2)(h) exposure).

**Resolution — projection framing, derived and published:**
- New `/methodology#overcharge-figure` section derives the band from three
  anchors: our own published fair-vs-predatory gaps ($1,800–$6,000 on the
  common service types), CFA's up-to-50% on NFDA 2023 medians
  ($3,100–$4,200), and FCA/CFA same-market spreads ($2,580–$13,800). It
  states plainly: a projection from price-dispersion data, **not a measured
  outcome of our cases**, with a commitment to publish real outcomes with
  sample sizes when they exist.
- Every instance reworded from "families often overpay by / typical
  overcharge" (an empirical frequency claim we cannot support) to "the
  documented gap between fair and inflated pricing" / "overpayment risk,"
  linked to the methodology anchor. The nurture-email savings phrasing is
  gone. The FAQ's "savings often cover a year of living expenses" (implying
  $15k–$30k, contradicting the $2–5k claim in the same file) is deleted, as
  is "families tell us this is worth waiting for" and "most homes respond
  within 24–72 hours / typically 3–5 days" (fabricated feedback and
  operational statistics with zero real cases).
- The partner ProofSheet's fabricated first-person testimonials (a
  "de-identified" daughter quoting a "$2,000 overcharge") are now explicitly
  labeled illustrative scenarios with no dollar-figure quote attributed to a
  person.

## 3. One canonical value per fact (A3-03/A3-04) — enforced

| Fact | Was | Canonical now | Enforcement |
|---|---|---|---|
| Per-item display thresholds by zip | /prices, /prep, cheatsheet, /funeral-homes COLA-adjusted per-unit fees AND showed national predatory beside adjusted fair; analyzer + city pages did the opposite (correctly) | **`displayThresholds()` in lib/pricing-data.ts** — per-unit stays national; everything else adjusts fair AND predatory by the same multiplier (the analyzer's tested rule) | `lib/__tests__/pricing-display.test.ts`: equivalence with the analyzer formula for every item × 4 zips; catalog ordering (fairLow<fairHigh<predatoryAt for all 30 items + all 8 service totals); rateQuote boundary = displayed predatory floor |
| /prices whole-service rating | good/warn/bad mixed adjusted fair with national predatoryHigh; "predatory begins around" cited the band's TOP | `rateQuote()` (lib/price-rating.ts): bad begins at the **adjusted predatoryLow** — the same dollar the page displays | same test file |
| Basic-services fee | glossary said "$1,500–$4,500 typical, $3,800 chain = normal" vs catalog fair $1,500–$2,500 / predatory $3,500; scenarios hardcoded the numbers | Catalog values; FIVE_QUESTIONS now **derives** them from LINE_ITEMS | template literal from catalog |
| Direct cremation whole-service | decide-engine hardcoded "$1,000–$2,500" (pre-tightening); plan-ahead "$1,500–$3,000" | $1,000–$2,200 — decide-engine now **derives all four price strings** from SERVICE_TOTALS | template literals from catalog |
| Death-certificate count | 10–15 (scenarios, after-hospice, Certificates) vs 5–10 (death-certs page, catalog note) vs "order three" | **"5–10 to start"** everywhere; calculator keeps computing per-institution | copy |
| Death-certificate price | $10–$30 / $15–$50 / $5–$30 / $10–$20 across 4 surfaces | Through home: **$10–$25** (catalog fair range); direct-from-state: base fee $10–$30 varies by state | copy |
| Third-party casket savings | 40–70% (87 city pages) vs 50–80% (avg-cost, analyzer ×2) | **40–70%** (under-claim) | copy |
| Embalming legality | "any state" absolute / "about 15 states" / "most US states" (printed cheatsheet) | "No state requires it for every death; some states require embalming OR refrigeration after a set time — refrigeration is the legal alternative" | copy (incl. catalog note + cheatsheet) |
| Probate coverage | "10 most populous states" (rendered above a chip list of 24 siblings) vs 25 | 25 | copy |
| Home-funeral legality | body renders 42 (computed) vs "41" hardcoded in metadata, JSON-LD, /guides, /how-to-pay | "most states" in static strings; computed count stays in body | copy |
| Homes contacted | "as many as nine" (how-it-works) vs 3–5 (FAQ, calculator, zip pages, analyzer) | 3–5 | copy |
| Witness cremation note | note said "$100–$300 typical" vs its own band $100–$250 | $100–$250 | copy |
| Regional spread | "more than 3× between zips" | "roughly twice as much" (our multiplier table: 0.75–1.50) | copy |

Framing honesty (A3-04): /average-funeral-cost retitled from "2026 averages"
to "2026 fair-price ranges" (the numbers are benchmark bands, not measured
averages) and its hardcoded metadata now matches the catalog; the printed
cheatsheet footer now says "fair-price benchmark ranges," carries the
benchmark review date and methodology URL, and stops calling them averages;
"This is what most families pay" (calculator + homepage quick check) → "A fair
price … falls in this range"; "Most families who do this save more than a year
of groceries" → removed; "Required minimum / what a home must charge" →
"Required items only / fair range for just the items you can't decline";
"Fair total (midpoint)" (which was not a midpoint) → "At fair prices";
sample-bill "a real … quote" → "a realistic … example"; /fair-price-index
metadata no longer claims regional adjustment for a national table;
/corrections no longer claims per-item source citations that don't exist, and
now logs both the June direct-cremation tightening and this session's
threshold-rule unification (honoring /methodology's every-change-is-logged
promise — A3-06).

## 4. Queued (LEDGER rows) — not fixable same-session

1. **Hospice directory count drift (P2, → A6/A11):** the CMS mirror never
   deletes rows by design, so "All N Medicare-certified hospices" counts will
   drift above CMS truth on every future re-import, and de-certified
   facilities keep rendering "Listed as … Medicare-certified … as of
   {DIRECTORY_AS_OF}". The as-of date is currently the only defense.
   Queue: track certification status on import (or an `last_seen_in_cms`
   column) + a test pinning `DIRECTORY_AS_OF` to the import runbook.
2. **Per-item source mapping (P2, → GPL sprint):** only 8 of 30 catalog items
   carry a concrete source annotation (Wave-1 comment); one renders publicly
   (NFDA 2023 median $550 on service-facility). A public per-item source table
   is the right end state once SLC GPLs land.
3. **Perishable-stat register (P3, → A11 refresh clocks):** aquamation
   state count, green-burial ~350 cemeteries, Open Path pricing, SCI
   1,500-homes count, MAID state list, digital-legacy platform steps —
   dated-or-hedged today; need owners and refresh cadence.
4. **`maxSavings` in SERVICE_TOTALS renders nowhere** — dead numeric field;
   remove or use (A9 dead-code sweep).
5. **Behavioral-outcome claims** ("homes respond differently…", how-it-works
   step 6 wording, prep "changes the meeting") — softened where they carried
   numbers; the full outreach-promise posture is A2's decision memo.

## 5. Out-of-scope findings handed to parallel days

- **A2:** negotiate-flow numeric fictions (sample-homes 9/14/20 counts —
  A2-02 confirmed still present), /how-it-works advocate@ vs arrangements@,
  outreach response-time posture. FAQ response-time stats were removed here
  because they were flat numeric claims; the posture decision remains A2's.
- **A8:** /privacy + /terms "Last updated: April 2026" datestamps (predate
  the B2B2C model — reinforces A8-01); left untouched per session split.
