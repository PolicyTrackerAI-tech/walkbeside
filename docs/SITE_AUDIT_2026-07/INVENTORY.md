# Site Audit 2026-07 — Surface Inventory (generated)

> **What this is:** the raw per-surface inventory produced by the 12-agent mapping pass on
> 2026-07-27 (main @ c47a6a0). Each audit session reads ONLY its day's section (see
> [PLAN.md](PLAN.md) for the day→section mapping). Every entry lists the surface, its layer,
> its assessed state, risks spotted while reading, and the concrete checks the audit day
> should run. **This is audit input, not law** — every claim below is a LEAD until the audit
> day verifies it against live prod. Archive or delete this file when the audit closes (A11).
>
> Sections: `l1tools` `l1content` `l2family` `l3partner` `adminMap` `apiData` `emailAi`
> `seoTrust` `docsDrift` `quality` `legacy`


## l1tools
NOTES: Grounding facts for the audit plan. (1) LIVE DATA STATE: probed https://honestfuneral.co/api/fair-price-index/data on 2026-07-27 — 29 national catalog items, overrides array EMPTY, lastUpdated 2026-06-26. Every tier badge on every live surface is therefore 'Modeled estimate'; all verified/community code paths (partial-coverage labels, verified-metros section, city-page local tables, tier upsell notes) are live-but-never-exercised — the first founder promotion is a de facto production test and should be treated as an audit event. (2) OUTREACH POSTURE: OUTREACH_LIVE is off by founder choice; every 'we contact homes for you — free' CTA (homepage x3, analyzer bridge card, /prices x3, /funeral-homes/[zip], /funeral-costs pages, /how-it-works) funnels into a flow that records dry_run rows and sends nothing — the audit's USE criterion must judge what a real family experiences after submitting. (3) THE NUMBER SYSTEM IS TWO-LAYER: dollars in the static catalog (lib/pricing-data.ts LINE_ITEMS + SERVICE_TOTALS, last reviewed 2026-06-26, sourced per docs/BENCHMARK_EXPANSION_SPEC.md) and cents in regional_benchmarks overrides (lib/benchmarks-store.ts, n>=5 re-enforced at every public read edge). Analyzer math discipline is strong and unit-tested: headline savings = sum of visible per-item badges (savingsBreakdown), stated totals reconciled (lib/analyzer-totals.ts), per-unit state fees never COLA-adjusted or overridden, coverage honesty notes, midpoint-based overcharge — and /methodology accurately describes all of it. The weakest guardrail-#4 spots are NOT the analyzer but the static marketing surfaces: the uncited $2,000–$5,000 homepage claim, /prices' unadjusted predatory thresholds beside adjusted fair ranges, the 'averages' framing on /average-funeral-cost, and the small set of cross-page savings-percentage contradictions listed in orphans. (4) DATA-MOAT GAP: anonymous analyzer checks (the overwhelming default — no sign-in prompt anywhere in the tool) persist nothing; the wedge's data job currently depends on the small signed-in fraction, worth an explicit VALUE-criterion finding. (5) City count is 87 (lib/city-pages.ts, zipExample entries minus interface line). RULES count renders dynamically on /methodology. All paths cited are relative to repo root the repo root.
ORPHANS: ["app/api/analyze-price-list legacy-shape insert fallback (route.ts lines 341\u2013361) \u2014 becomes dead code the moment the 2026-07-20 hospices-consent migration is confirmed applied in prod; flag for removal in a truth pass so the consent seam has one path.", "Deprecated PriceDataSource aliases 'validated' / 'metro-average' / 'national-adjusted' in lib/pricing-data.ts \u2014 kept for legacy persisted values; verify anything still persists them, else retire.", "Cross-surface contradiction: third-party casket savings published as '40\u201370% less' (app/funeral-costs/[city]/page.tsx) vs '50\u201380% less' (app/average-funeral-cost/page.tsx, Analyzer breakdown row, fallbackAdvocacySummary '300\u2013500% markup') \u2014 pick one defensible figure.", "Cross-surface contradiction: price-variation claim '3\u201310\u00d7 in the same town' (app/funeral-homes/page.tsx) vs 'more than 3\u00d7 between zips' (app/prices/page.tsx) \u2014 neither cited.", "Cross-surface contradiction: /prices displays UNadjusted predatory thresholds beside zip-ADJUSTED fair ranges (PriceCalculator lines 232\u2013235, 341; computeOverall mixes both), while the analyzer route adjusts predatoryAt by the regional multiplier \u2014 the same dollar total can be rated differently by the two tools.", "app/how-it-works/page.tsx step 3 'Sent from advocate@honestfuneral.co' contradicts the code default arrangements@honestfuneral.co (lib/negotiation/email-body.ts:116) unless OUTREACH_FROM overrides it in prod.", "Hardcoded 'Honest Funeral'/'honestfuneral.co' literals in print letterheads/footers (app/analyzer/Analyzer.tsx, app/bill-check/BillCheck.tsx) and the fair-price-index JSON-LD \u2014 known Rename-Day sweep targets; ensure they're on the sweep list."]

### Homepage (crisis entry + dual-lane)  [L1]  state=built-live
paths: app/page.tsx, components/HomeQuickCheck.tsx, components/HospiceFinder.tsx, lib/copy.ts
purpose: Route a just-bereaved visitor into either the guided flow (/where) or the analyzer wedge, while stating the neutrality/free-to-families model and pitching institutions below the fold.
risks:
  - 'Typical overcharge $2,000–$5,000' appears 3x (hero, steps section, institutional card) with no on-page citation or methodology link — the single most repeated number on the site and the most exposed to guardrail #4 ('never publish a number we can't defend').
  - '~13 months of support Medicare requires per death (42 CFR 418.64)' — regulatory citation on the public homepage; must be verified against the CFR text.
  - Multiple 'we contact homes on your behalf at no charge' promises funnel to /negotiate/start while OUTREACH_LIVE is off — the flow records dry_run rows and no email actually goes out; the family-facing experience after submission is the thing to audit.
  - HospiceFinder section depends on the hospices table; if Migration A remains unapplied in prod the finder renders empty on the front page.
  - HomeQuickCheck badge is hardcoded 'modeled' (correct today, live probe confirms zero overrides) — but the tier-note upsell copy ('Real price lists from this area now back our quote checker') can only be exercised after a first promotion.
checks:
  - Trace the $2,000–$5,000 overcharge claim to a defensible source (Honest_Funeral_Market_Research.pdf / NFDA / internal data) and decide whether it needs a methodology footnote or softening.
  - Verify 42 CFR 418.64 actually mandates ~13 months bereavement support per death.
  - Live: enter a 5-digit zip in HomeQuickCheck, confirm a range renders, the badge says 'Modeled estimate', and /api/benchmarks/tier returns {tier:'modeled'} (probe with cache-busting query).
  - Live: confirm the HospiceFinder section renders search results (or degrades gracefully) on honestfuneral.co — depends on prod hospices import.
  - Walk /negotiate/start end-to-end as a test family and document exactly what happens with OUTREACH_LIVE off — does the UI over-promise contact that never happens?
  - Check the two /faq anchor links (#why-did-my-hospice-or-employer-recommend-honest-funeral, #is-this-endorsed-by-my-care-team) resolve to real headings.

### Quote checker / price-list analyzer (THE WEDGE)  [L1]  state=built-live (eval-gated; heavily unit-tested; all verdicts modeled-tier in prod — live probe confirms zero benchmark overrides)
paths: app/analyzer/page.tsx, app/analyzer/Analyzer.tsx, app/analyzer/layout.tsx, app/api/analyze-price-list/route.ts, app/api/extract-price-list-image/route.ts, app/api/analyze-price-list/draft-letter/route.ts
purpose: Snap/paste a GPL → per-line fair-range verdicts, FTC Funeral Rule flags, an 'X above fair' headline, an AI advocacy summary, a pushback letter, and a printable artifact — the core product and the front door of the outcomes data moat.
risks:
  - Silent quality degradation: when Claude extraction fails, naiveExtract regex takes over and the family is never told (extractionMethod is only exposed on dev eval runs); only the coverage note hints at a partial read.
  - Data-moat leak: persistence happens only for signed-in users (route lines 305–412) — every anonymous check produces zero rows, and the tool never asks for sign-in, so the wedge's data job depends on an auth funnel the page doesn't push.
  - Legacy-shape insert fallback (PGRST204/42703) exists for the pre-consent schema; if the 2026-07-20 hospices-consent migration is still unapplied in prod, declined/consent-less logged-in analyses intentionally do not persist — a silent data loss that is correct by design but must be re-checked after Migration B lands.
  - Sample-bill hygiene is good (never attributes, never contributes, never bridges) but rests on three separate guards in Analyzer.tsx — a regression in any one leaks demo data into real pipelines.
  - Print letterhead/footer hardcode 'Honest Funeral' and 'honestfuneral.co/methodology' rather than lib/brand BRAND constants (Rename Day sweep exposure).
  - Zip is optional; with no zip the multiplier is 1.0 national — verdicts are correct but the family isn't warned that adding a zip could change High↔Fair calls near the boundary.
checks:
  - Live: run the sample bill — expect the casket-on-direct-cremation FTC finding, per-unit death-certs at $25/ea reading Fair, a savings headline that exactly equals the sum of the per-item '+$X above fair' badges, and the 'This is a sample bill' banner.
  - Live: paste a real GPL with a stated total both below the item sum and >3x the sum; confirm reconcileTotalQuoted makes the item sum win and the three summary stats reconcile (Quoted − Above-fair = Fair total).
  - Live: same list with zip 10001 vs 39201 — verify fair ranges shift by multiplier while death-certificate range does not (per-unit carve-out), and the predatory cutoff shifts too.
  - Live: upload one clear + one deliberately blurry page; confirm the 'We read N of M pages' warning persists after clicking Analyze (pageWarning is not cleared by the analyze error path).
  - Live: verify the DataTierBadge on a result says 'Modeled estimate' and the print footer states the modeled sourceNote + methodology URL.
  - Signed-in: run a check with the contribute box UNchecked and confirm the persisted row has contributed=false (or, pre-migration, that no row persists) — the consent seam is load-bearing.
  - POST /api/analyze-price-list with an evalModel/evalRun body against prod — confirm both are ignored (no extractionMethod in response).
  - POST /api/analyze-price-list/explain with a fabricated ruleId — expect 400 unknown_rule (allowlist holds).
  - Kill the ANTHROPIC key in a staging run: confirm naive extraction + fallbackAdvocacySummary + fallbackPushbackLetter all render (never a blank 'what to do').

### Final-bill drift check  [L1]  state=built-live
paths: app/bill-check/page.tsx, app/bill-check/BillCheck.tsx, app/api/compare-bill/route.ts, lib/bill-drift.ts, components/checker/DocInput.tsx
purpose: Diff the family's original quote against the final bill line-by-line — pure arithmetic on their own documents, no benchmarks, so every finding is provable.
risks:
  - Positioning is honest ('arithmetic, not an estimate') but pairing quality depends on the same Claude/naive extraction as the analyzer — a mis-paired line shows as 'added', and the conservative-pairing disclaimer is the only guard.
  - Two Claude parse calls per request from an unauthenticated endpoint — cost exposure bounded only by the proxy POST rate-limiter.
  - Print letterhead hardcodes 'Honest Funeral' / honestfuneral.co (Rename Day sweep).
checks:
  - Live: paste a quote and a bill where one line was renamed slightly (e.g. 'Basic services' → 'Basic services of director') — confirm it lands as added+removed rather than a silent merge, matching the disclaimer.
  - Live: bill with a selection range on the quote ($95–$1,800 urns) resolved to a price — confirm the 'Selection made' kind with the quoted range shown.
  - Confirm the 422 couldnt_read_quote / couldnt_read_bill errors surface as the side-specific messages.
  - Verify lib/bill-drift.ts test coverage for decreased/removed/unchanged math (savedCents line).

### Compare quotes side-by-side  [L1]  state=built-live
paths: app/compare-quotes/page.tsx, app/compare-quotes/CompareQuotes.tsx
purpose: A family that gathered 2–3 quotes on their own runs each through the identical analyzer and sees parallel facts — structural neutrality (no rank, no winner, entry order preserved) per guardrail #3.
risks:
  - Silent slot drop: if one of three quotes fails to analyze (non-OK response returns null) and two succeed, the comparison renders with no notice that the third was dropped — the family may not realize a quote is missing.
  - Each filled slot fires a full /api/analyze-price-list POST; signed-in users persist one row per quote per click — repeated comparisons could multiply near-duplicate rows in the benchmark feed (dedupe scope worth confirming).
  - Single consent checkbox covers all quotes (defensible — same family's data) but the persisted rows carry no marker that they arrived as a batch.
checks:
  - Live: submit three quotes where one is garbage — verify whether the UI says anything about the dropped third (expected gap; document it).
  - Confirm the neutrality invariants render: entry order preserved, identical metric set per card, zero ranking/recommendation language.
  - Confirm the coverage 'Partial read — treat its numbers as a floor' note appears for a partially-benchmarked quote.
  - Signed-in: run the same comparison twice and inspect how many price_list_analyses rows result — check the benchmark aggregation's dedupe treatment (AnalysisRecord.dedupeScope).

### Cash-advance markup check  [L1]  state=built-live
paths: app/cash-advance-check/page.tsx, app/cash-advance-check/CashAdvanceCheck.tsx, lib/cash-advance.ts
purpose: Put the funeral home's billed amount next to the vendor's own receipt for pass-through items — the difference becomes a documented fact plus a ready-to-send message. Fully client-side; nothing leaves the device.
risks:
  - Lowest-risk tool in the set: no network, no benchmarks, no estimates. Residual risk is only the legal framing copy ('a markup isn't automatically illegal… the FTC Funeral Rule requires disclosure') — verify against 16 CFR 453.3(f).
  - parseDollars rejects malformed input to 0 silently — a typo like '1,2.50' shows as $0 with no field error.
checks:
  - Verify the FTC cash-advance disclosure claim wording against 16 CFR 453 (disclosure requirement vs at-cost requirement — the copy correctly does NOT claim at-cost is required; keep it that way).
  - Live: confirm no network requests fire while typing (the 'nothing leaves this device' claim is testable in devtools).
  - Edge: charged < vendor (negative markup) — confirm it renders 'at cost — good sign' or excludes from letter rather than a negative markup.
  - Confirm markupLetter output includes only user-entered numbers (lib/cash-advance.ts unit tests).

### Fair-price calculator (/prices)  [L1]  state=built-live
paths: app/prices/page.tsx, app/prices/PriceCalculator.tsx, app/prices/layout.tsx
purpose: No-account zip lookup of whole-service fair ranges + a paste-one-total quote rating; the line-item table and five-questions prep content; funnels to /negotiate/start and /prep.
risks:
  - MIXED ADJUSTED/UNADJUSTED THRESHOLDS (guardrail #4): the fair range is zip-adjusted but the predatory numbers shown beside it are raw national — 'A quote of $18,000–$28,000 is what predatory pricing looks like' (predatoryLow/High unadjusted) and the line-item column 'over $X = overpriced' (predatoryAt unadjusted). In a 1.4–1.5x metro the adjusted fair high (~$18k traditional burial) touches the displayed national predatory floor; the analyzer, by contrast, adjusts predatoryAt by the multiplier — the two surfaces can contradict each other on the same price.
  - computeOverall rates the quote against adjusted fair bounds but an unadjusted predatoryHigh midpoint — the warn/bad boundary is regionally inconsistent.
  - 'Most families who do this save more than a year of groceries' — colorful, uncited, and effectively a savings promise; weakest claim on the page.
  - 'Nothing is saved… no tracking on the results page' — currently true (no trackTool calls, tier fetch only), but it is a testable promise that a future analytics addition would silently break.
  - Copy says 'This is what most families pay' about a modeled fair range — 'most families pay' is a distribution claim the modeled tier can't support; the badge right below it says Modeled, softening but not eliminating the tension.
checks:
  - Reproduce the threshold contradiction: zip 10001, traditional burial, quote $18,500 — compare the /prices rating vs the analyzer's classification of the same total, and decide whether /prices should adjust predatory numbers by the multiplier (as the analyzer does).
  - Live: confirm the tier note under the range only appears for verified/community zips (currently never — overrides empty) and the badge always reads Modeled.
  - Live devtools: confirm zero storage/analytics writes on submit (validates the 'never saved / no tracking' claims).
  - Rewrite-or-source check on the 'year of groceries' line.
  - Confirm has-quote mode's /negotiate/start handoff carries zip/svc/home/q params correctly.

### Average-funeral-cost pillar guide  [L1]  state=built-live
paths: app/average-funeral-cost/page.tsx
purpose: SEO pillar for 'how much does a funeral cost' — national fair ranges by service type from the catalog, highest-markup items, five savings moves; funnels to /funeral-costs, /analyzer, /decide, /where.
risks:
  - Headline framed as '2026 averages' but the numbers are fair-price BANDS from SERVICE_TOTALS, not measured averages — the closing disclaimer says 'benchmarks', the title says 'averages'; a citation-minded reader (or competitor) can call that out.
  - Hardcoded prose numbers can drift from the catalog: 'basic services fee typically $1,500–$2,500' (currently matches), 'saves roughly $800' for embalming, 'protective premium $1,000–$3,000', casket savings '50–80% less' — none are derived from LINE_ITEMS.
  - Cross-page inconsistency: third-party casket savings is '50–80% less' here and in the analyzer breakdown, but '40–70% less' on city pages — two different published numbers for the same claim.
  - 'The sealing claims aren't supported by science' — a factual claim about vendor products; fine, but should trace to a source in the audit.
checks:
  - Diff every hardcoded dollar figure in the prose against LINE_ITEMS/SERVICE_TOTALS and either derive or annotate them.
  - Unify the third-party casket savings percentage across average-funeral-cost, funeral-costs/[city], analyzer breakdown, and fallbackAdvocacySummary (currently 40–70 vs 50–80 vs '300–500% markup').
  - Decide 'averages' vs 'fair ranges' framing in title/metadata (defensibility).
  - Live: confirm the page renders the full SERVICE_TOTALS table and OVERPAY (highMarkup) table.

### Funeral-costs city cluster (index + 87 ISR city pages)  [L1]  state=built-live (Day 7, #172); verified sections currently absent everywhere — prod regional_benchmarks is empty (live probe: overrides=0)
paths: app/funeral-costs/page.tsx, app/funeral-costs/[city]/page.tsx, lib/city-pages.ts, lib/verified-local-prices.ts, lib/zip-regions.ts
purpose: Programmatic 'funeral costs in {city}' SEO pages: modeled whole-service bands x metro multiplier, plus a Verified-local-prices section that appears only when n>=5 promoted benchmark rows exist for the metro; heavy internal linking.
risks:
  - Multipliers are 'best-fit estimates… NOT validated against actual GPLs' (lib/zip-regions.ts header) — every city page publishes ranges derived from an admittedly unvalidated index; the modeled badge + source line carries the defense, so any layout regression that separates numbers from the badge is a guardrail #4 exposure.
  - city.blurb free-text per city (87 entries) — hand-written claims that need spot-verification.
  - fmtRange rounds to the nearest $100 after multiplying — display-level distortion is bounded but the predatory '$X+' column rounds the same way.
  - '40–70% less' casket claim here conflicts with 50–80% elsewhere (see pillar guide).
  - ISR + promote-purge wiring: a stale page after a future promotion would show modeled ranges while the analyzer shows verified — cross-surface contradiction window is capped at 1h by revalidate, but only if the purge hook works.
checks:
  - Live: fetch 3 city pages across multiplier extremes (e.g. manhattan, a ~1.0 metro, a 0.8 south metro) and hand-verify the table = SERVICE_TOTALS x multiplier rounded to $100.
  - Confirm the Verified-local-prices card is absent on every city page today (byte-identical modeled render) — matches the empty prod store.
  - Spot-check 10 city blurbs for factual claims.
  - After the first real promotion: verify the promoted row appears on the city page within the hour (revalidate) and that localCountLine wording matches the pinned verbatim ('X of the 29 benchmarked items…').
  - Check sitemap includes all 87 /funeral-costs/{slug} URLs and slugs match listCitySlugs().

### Funeral-homes zip lookup (index + [zip])  [L1]  state=built-live
paths: app/funeral-homes/page.tsx, app/funeral-homes/[zip]/page.tsx, lib/funeral-homes-pricing.ts, components/funeral-homes/ZipSearchForm.tsx
purpose: Zip-level fair-pricing page: three service-scenario cards (stripped/typical/predatory bundle math), the full line-item table with any local overrides applied, five questions, and the /negotiate/start CTA.
risks:
  - Searcher-intent mismatch: titles claim 'Funeral home prices in {metro}' but the page lists zero funeral homes (deliberately — 'not a directory') — a thin-content/bounce risk on exactly the query the page targets.
  - Unbounded URL space: any of ~100k valid 5-digit zips renders a near-duplicate page; only /funeral-homes (index) is in the sitemap, but nothing noindexes the [zip] pages — duplicate-content exposure if crawlers find them.
  - 'Required minimum — what a home must charge' phrasing is a legal-ish claim built from required-item sums; worth a wording pass.
  - 'Prices vary by 3–10× for the same goods and services in the same town' (index) vs 'vary more than 3× between zips' (/prices) — two different variation claims, neither cited.
  - Line-item table applies cent-based overrides when present but the scenario cards stay modeled — correct and labeled, but the page mixes tier badges (tierForZip badge for the table, hardcoded modeled for the cards): a confusing double-badge once real data exists.
  - Imports fmtCents from lib/stripe — cosmetic layering smell.
checks:
  - Live: /funeral-homes/10001 and /funeral-homes/39201 — verify all three scenario cards shift with the multiplier and the predatory ceiling label reads as a ceiling ('up to $X').
  - Live: /funeral-homes/00000 and /funeral-homes/abcde — expect notFound() for non-numeric; 00000 passes the regex, so confirm what renders for a zip with no region (fallback multiplier path).
  - SEO: decide indexation policy for [zip] pages (canonical to a metro page? noindex? sitemap a curated subset?) and verify current robots/sitemap behavior.
  - Reconcile the 3–10x vs 3x variation claims and cite one.
  - Confirm the required-minimum sums trace exactly to required-item LINE_ITEMS (lib tests exist — run them).

### Fair-Price Index (page + public dataset endpoint)  [L1]  state=built-live (Day 7); live probe: 29 national items, 0 overrides, lastUpdated 2026-06-26
paths: app/fair-price-index/page.tsx, app/api/fair-price-index/data/route.ts, lib/fair-price-dataset.ts, lib/verified-metros.ts
purpose: The citable reference asset: every catalog item's national fair range grouped by category, Dataset JSON-LD, a cite-this block, and a machine-readable JSON/CSV endpoint — built to earn citations/backlinks and make the index a public good.
risks:
  - Staleness clock: PRICING_LAST_UPDATED = 2026-06-26 — the cite-as line and JSON-LD dateModified already read a month old and only move when the catalog is re-reviewed or a benchmark row is promoted; a visibly aging 'updated' date undercuts citability.
  - JSON-LD hardcodes 'Honest Funeral'/honestfuneral.co (documented as deliberate until Rename Day) while the cite-block reads BRAND — a rename would briefly split identities if the sweep misses it.
  - Privacy contract of the endpoint is structural and strong (n>=5 re-filter, catalog-only, sanitized sources, price-like-text drop) — the main risk is future drift: any new field added to toOverride/CSV must go through the same review.
  - CSV omits the perUnit flag (documented in notes) — a naive CSV consumer could compare a per-day refrigeration range to a total.
checks:
  - Live: GET /api/fair-price-index/data and ?format=csv — verify 29 national rows, empty overrides, units USD, Content-Disposition on CSV, and CSV-injection quoting on a value starting with '=' (once sources exist).
  - Validate the Dataset JSON-LD in Google's structured-data tester.
  - Confirm the degrade path: national-only payload is served no-store on store failure (can be tested by staging env with a bad key).
  - Verify the page's group coverage guard: every LINE_ITEMS id appears in a group or 'Other' (add a test if none pins it).
  - Decide a cadence for bumping PRICING_LAST_UPDATED (quarterly re-review) so the citable date doesn't fossilize.

### Methodology page  [docs]  state=built-live and code-accurate (verified against analyzer math: midpoint-based overcharge, qty scaling, per-unit carve-out, under-claiming severity all match)
paths: app/methodology/page.tsx
purpose: The defensibility spine every price surface links to: where ranges come from, the three data tiers, regional adjustment, classification semantics, FTC checks, and the honest-limits disclaimer.
risks:
  - It promises process that must actually be honored: 'every change is logged on our corrections page with the old range, the new range, and the sample size' — /corrections exists, but the audit must confirm past catalog changes (e.g. the 2026-06-26 Wave-1 expansion, direct-cremation fairHigh 2500→2200) are actually logged there.
  - Describes the human-review promote gate for Verified/Community tiers that has never been exercised in prod (zero promotions) — accurate as policy, unproven as practice.
  - RULE_COUNT/ITEM_COUNT are computed from code (good) but the FTC bullet list is prose — verify each listed check maps to a real rule in lib/bundling-detection/rules.ts.
checks:
  - Cross-check every mechanical claim against the code one more time after any analyzer change (the page is a de facto spec; it currently matches).
  - Open /corrections and verify it lists the known range changes; if empty, that contradicts this page's promise.
  - Verify the 6 FTC bullet examples each correspond to an id in RULES.
  - Confirm NFDA/FCA sourcing claims in the Modeled tier paragraph match docs/BENCHMARK_EXPANSION_SPEC.md citations.

### How-it-works (outreach explainer)  [L1]  state=built-live, but describes a service whose send path is switched off (OUTREACH_LIVE unset by founder choice)
paths: app/how-it-works/page.tsx
purpose: Explain the six-step free outreach service (the L2 funnel's front door) and the funding model.
risks:
  - FACTUAL MISMATCH: step 3 says 'Sent from advocate@honestfuneral.co' but the code default is 'Honest Funeral <arrangements@honestfuneral.co>' (lib/negotiation/email-body.ts outreachFromAddress; advocate+id@reply.honestfuneral.co is only the reply-to). Unless prod sets OUTREACH_FROM=advocate@…, the page misstates the send address.
  - The whole page promises outreach that currently dry-runs — families completing the flow wait for quotes that will never arrive until the founder flips the switch; the page has no 'response times vary' hedge tied to that reality.
  - 'As many as nine homes' — verify against the directory selection cap in the negotiate flow.
  - 'Homes that refuse self-select out' framing is fine; step 6 anti-steering language is strong and correct.
checks:
  - Check Vercel env for OUTREACH_FROM; either set it to advocate@ or fix the page copy — one of the two must move.
  - Verify the nine-home cap against lib/negotiation/directory.ts selection logic.
  - Decide the honest UX for the OUTREACH_LIVE-off period: what does the page (and the dashboard) tell a family who starts outreach today?
  - Confirm the signed-in/out dashboard link variants render correctly (getSignedIn degrades when supabase env is absent).

### Benchmarks tier API + store (the data-tier plumbing)  [infra]  state=built-live; degrading correctly by design (prod table empty — everything modeled)
paths: app/api/benchmarks/tier/route.ts, lib/benchmarks-store.ts, lib/pricing-data.ts, lib/zip-regions.ts
purpose: Single source of tier truth: regional_benchmarks reads (scope-ranked zip3>metro>state, n>=5 re-filtered, degrade-to-modeled everywhere) powering the badge system across analyzer, calculators, city pages, and the Index.
risks:
  - The entire tier system is live-but-dormant: every 'verified'/'community' code path (override classification, partial-coverage labels, verified-metros section, tier upsell notes) has zero production data exercising it — first promotion is the real test.
  - Deprecated PriceDataSource aliases (validated/metro-average/national-adjusted) kept for legacy persisted values — harmless but a place for label drift.
  - regionMultiplier's 1-digit fallback buckets (0.85–1.10) silently cover any zip3 missing from the ~250-entry table — a family in an unlisted prefix gets a coarse multiplier with no visible difference in labeling.
  - SMALL_SAMPLE_THRESHOLD is imported from lib/partner-report — the n>=5 public gate's constant lives in partner-reporting code; moving/renaming it would silently change the public floor.
checks:
  - Live: GET /api/benchmarks/tier?zip=84101 → modeled JSON with Cache-Control 3600; ?zip=1234 → 400; hammer 31 requests/min → 429 with Retry-After.
  - After first promotion: verify narrowest-scope-wins and min-n reporting by seeding zip3+metro rows for the same item in staging.
  - Grep-audit that no public surface reads regional_benchmarks except through benchmarks-store (the sanitization/n-floor chokepoint).
  - Confirm SMALL_SAMPLE_THRESHOLD = 5 and add a test pinning it if none exists.

### Subscription finder API (off-wedge tool backend)  [L1]  state=built-live
paths: app/api/subscription-finder/route.ts, app/subscriptions/Subscriptions.tsx, lib/redact.ts
purpose: Extract recurring charges from a pasted bank statement for the after-death accounts-to-close job; consumed only by /subscriptions.
risks:
  - Highest-sensitivity input on this surface list (bank statements); mitigated by redactContact before the Claude call and no persistence — but the redaction regex is the only guard and deserves adversarial test cases (account-number formats it might miss).
  - Prompt says 'be generous about including' — over-flagging is a deliberate, low-stakes choice; fine.
  - VALUE question: this is grief-logistics tooling, not the pricing wedge — it earns family goodwill but neither reach, institutional progress, nor pricing data; audit should classify it as retained-but-frozen rather than an investment area.
checks:
  - Unit-test redactContact against realistic statement lines (card numbers with spaces/dashes, ACH trace numbers, emails) and confirm merchants/amounts survive.
  - Confirm the endpoint never persists input (no supabase import) and returns 200-with-warning on every failure path.
  - Confirm /subscriptions is the sole consumer and is reachable from the after-death checklist (funnel role).


## l1content
NOTES: Scope: the ~37 routes of L1 educational long tail (roughly 17k lines) plus lib/glossary.ts (64 entries), lib/faith-traditions.ts (12+6 profiles), lib/scenarios.ts, lib/content.ts, cross-checked against app/sitemap.ts and inbound-link greps. Overall verdict: this long tail is unusually high quality for its size — consistent component system (SiteHeader/Card/ArticleSchema/HelpFooter), disclaimers nearly everywhere, safe-messaging awareness on sensitive pages, defamation-aware advocacy pages, and a current FAQ that accurately carries the B2B2C trust story. It clearly serves reach (SEO) and hospice-channel credibility (grief + end-of-life clusters are exactly what a bereavement coordinator would diligence). The systemic weaknesses are (1) uncited perishable numbers scattered across ~200 claims with no verified-date convention — the audit should prioritize the money-cluster and glossary 'money' entries where guardrail #4 exposure is real; (2) wiring drift — sitemap/guides-index/inbound-links disagree about which pages exist (four tools SEO-dark, /rights and /next-30-days missing from sitemap, /after redirect still listed); (3) three specific factual contradictions to fix cheaply: certificate counts (10–15 vs 5–10 vs calculator), probate state count (10 vs 25), hospice deaths stat (1.7M receive vs 1.7M die/half of deaths); (4) two never-executed human-review gates shipped as live content: clergy sign-off on faith profiles and the 'Sister redline' on the three most sensitive grief pages — the audit plan should either schedule those reviews or formally accept the AI-verification + disclaimer posture. Nothing in the cluster crosses the 'arranging' line — tools document family decisions and every CTA routes to /decide or /prices, never to a named home. No page charges or hints at charging families. Layer call: I kept the dashboard tool suite in L1 (free utilities) but flagged that obituary/eulogy AI outputs deserve eval coverage like the analyzer. Full per-cluster audit checks are in the surfaces array; the cheapest high-value fixes are the sitemap diff, the three contradictions, and softening 'vetted' on /headstone-vendors.
ORPHANS: ["app/after/page.tsx \u2014 deliberate redirect stub to /next-30-days, but sitemap.ts still lists /after (line 47) and omits /next-30-days entirely; MERP page still links to /after", "/memorial, /livestream, /timeline, /eulogy \u2014 public routes with dashboard-only inbound links, absent from sitemap and /guides; SEO-dark by accident rather than decision (contrast /obituary, which IS sitemapped)", "/rights \u2014 core public consumer-rights page, linked sitewide and from /guides, but missing from sitemap.ts", "lib/content.ts PROGRESS_PHRASES, progressLine, PROMISE \u2014 zero consumers anywhere in app/components/lib; dead code from the old flow", "app/estate/[state]/page.tsx 'Other states' copy says '10 most populous states' \u2014 contradicts /estate index ('25 states') and lib/probate-by-state.ts (exactly 25 guides); stale from an earlier expansion", "lib/scenarios.ts gateUntilPaid + 'pre-pay flow' comments and lib/auth-paid isPaidUser naming \u2014 legacy paywall semantics repurposed to picked-a-home gating; contradicts the decommissioned-paywall state in name only", "lib/cemetery-vendors.ts + lib/faith-traditions.ts TODO-FD/'sister' comments \u2014 reference the retired sister-as-vetter operating model and admit the on-page 'vetted' claim is unverified", "Grief cluster code comments 'Sister to redline before final MVP approval' (suicide-loss, overdose-loss, death-of-a-child) \u2014 the review gate they reference was never executed and no longer has an owner"]

### Glossary (reference spine)  [L1]  state=built-live; adversarially verified 2026-05-21 (docs/GLOSSARY_REVIEW_FINDINGS.md); every term auto-flows into sitemap via listSlugs()
paths: app/glossary/page.tsx, app/glossary/[slug]/page.tsx, lib/glossary.ts
purpose: Plain-English translator for funeral-industry vocabulary; 64 statically generated per-term SEO pages plus an index, each cross-linked and carrying watch-out/upsell warnings.
risks:
  - Dozens of embedded '2026' price ranges (direct cremation $800–$3,000, embalming $500–$1,200, green burial $1,500–$4,000) and moving-target legal claims ('aquamation legal in about half of US states', 'cremation ~60% of dispositions', '~350 certified green cemeteries') will silently go stale — no per-entry verified-date field exists
  - Index page invites 'call us' for missing words (lib line: 'the FAQ may cover it, or call us') — verify a phone path actually exists or soften the copy
checks:
  - Live-probe /glossary and 3 term URLs incl. one from each category (e.g. /glossary/gpl, /glossary/aquamation, /glossary/small-estate-affidavit); confirm 404 behavior on a bad slug
  - Full content read of the ~10 'money' category entries (gpl, ftc-funeral-rule, basic-services-fee, cash-advance, casket-handling-fee, funeral-insurance, final-expense-insurance) — these carry the legally-loadbearing FTC claims; spot-check the other 50
  - Verify the 3 most perishable stats against 2026 sources: aquamation state count, cremation rate, FTC Funeral Rule citations (16 CFR 453) still current post the FTC's Funeral Rule review
  - Confirm the disclaimer footer renders on both index and term pages (it does in code — verify live)

### Faith tradition pages  [L1]  state=built-live but human-review pending — AI-adversarially verified 2026-05-21 (docs/FAITH_REVIEW_FINDINGS.md) with live 'not religious authority' disclaimer; clergy sign-off never happened; lib still carries TODO-FD 'verify' comments on multiple profiles
paths: app/faith/[tradition]/page.tsx, lib/faith-traditions.ts, components/FaithCheatsheet.tsx
purpose: Per-tradition funeral-planning guide (12 top-level traditions + 6 denominational sub-profiles) with disposition/timeline/embalming norms, a recommended service type wired to live pricing (SERVICE_TOTALS), and a printable arrangement-meeting cheat sheet.
risks:
  - lib/faith-traditions.ts retains 'sister to confirm' / TODO-FD comments — the banned brother-sister-FD narrative lives on in code comments even though it never renders
  - Faith pages inject a 'Fair total range nationally' dollar figure per tradition from pricing-data — a citable number claim on an indexable page; must stay consistent with /methodology (guardrail #4)
  - No faith index page exists — reachable only via /decide flow, TimeCriticalBanner, cross-links, and sitemap; not listed in /guides
  - Recommending a 'default service type' per faith is judgment content; it steers toward a service type (allowed) but wording must never drift toward naming homes
checks:
  - Live-probe /faith/jewish, /faith/muslim, /faith/secular and one sub-profile (/faith/jewish-orthodox) — confirm sub-profiles resolve or 404 as intended (generateStaticParams only covers the 12 top-level FAITH_TRADITIONS keys; sub-keys may 404 despite being in FAITH_SUB_PROFILES — verify)
  - Full content read of jewish, muslim, hindu profiles (strictest ritual requirements = highest harm if wrong); spot-check the rest against FAITH_REVIEW_FINDINGS
  - Verify the per-tradition fair-price range matches /prices and /methodology for the same service type
  - Decide whether the clergy-review gate is still open; if so the audit plan should schedule it, not just re-flag it

### Grief cluster (specific-loss long tail)  [L1]  state=built-live, high editorial quality, safe-messaging-aware (suicide page follows no-methods guidelines; overdose page is disease-framed; self-check explicitly 'not a screening instrument'); all in sitemap at 0.8; BUT several pages carry the code comment 'Sensitive content. Sister to redline before final MVP approval' — that human redline never occurred
paths: app/grief/page.tsx, app/grief/SelfCheck.tsx, lib/grief-selfcheck.ts, app/sudden-loss/page.tsx, app/suicide-loss/page.tsx, app/overdose-loss/page.tsx
purpose: Nine indexable evergreen grief guides (month-by-month arc, suicide/overdose/child/pet/disenfranchised loss, kids, attendee etiquette) — the trust-building, hospice-credible reach surface with 988 surfaced prominently and a deliberately non-diagnostic self-check.
risks:
  - Unreviewed sensitive content shipped: suicide-loss, overdose-loss, death-of-a-child explicitly await a human redline per their own comments — highest-stakes content on the site to have skipped review
  - Clinical/statistical claims need verification: '~10% of bereaved adults develop complicated grief', '135 people affected per suicide (CDC)', 'PGD in DSM-5-TR', 'measurable month-6 spike in care-seeking' — all plausible, none cited inline
  - SelfCheck references 'Your hospice's bereavement line — about 13 months' — correct for Medicare hospice benefit but assumes a hospice death; fine for the target funnel, mildly off for non-hospice visitors
  - EmailCapture embedded on grief pages — confirm capture copy is grief-appropriate and consent-clean
checks:
  - Full content read (human, ideally clinician-informed) of suicide-loss, overdose-loss, death-of-a-child — retire the 'Sister to redline' TODO or execute it; this is a do-once gate, not a recurring check
  - Verify 988 works as described (call AND text), AFSP/Alliance of Hope/GRASP/Compassionate Friends/Dougy Center org names + any URLs still live
  - Exercise the SelfCheck live: all 9 statements + duration → both result tones render; confirm nothing is persisted (no network calls)
  - Spot-check grief book list and 'three myths' section for tone drift; confirm no page implies HF provides counseling
  - Live-probe all 9 URLs; confirm each is in the sitemap and has ArticleSchema

### After-death admin cluster  [L1]  state=built-live; /after index deliberately redirects to /next-30-days (superseded by the better checklist); veterans lib verified 2026-04-26 and smartly avoids perishable VA dollar rates; survivor-benefits sourced to SSA Pub 05-10084 (2025)
paths: app/after/page.tsx, app/after/death-certificates/page.tsx, app/after/accounts-to-close/page.tsx, app/after/estate-basics/page.tsx, app/certificates/Certificates.tsx, app/digital-legacy/page.tsx
purpose: The 30-day paperwork long tail: death certificates (guide + calculator), account closure, SSA survivor benefits, VA burial benefits (interactive checker), digital accounts, and a subscriptions-cancellation tracker.
risks:
  - Contradictory certificate-quantity guidance across surfaces: lib/scenarios.ts says 'most families need 10–15 originals', /after/death-certificates says 'order 5–10', the /certificates calculator baseline is 3 + per-asset — a family hitting two surfaces gets two answers
  - /after is a redirect yet still in sitemap.ts (line 47) while its successor /next-30-days is NOT in the sitemap at all — SEO wiring inverted
  - SSA claim 'most benefits are paid only from the month the application is filed' is a simplification (retroactivity rules vary) — fine as consumer guidance, but it's a strong claim driving urgency
  - Digital-legacy platform processes (Facebook memorialization, Apple Legacy Contact, Google IAM) change frequently — page comment admits 'current process URLs' need currency
checks:
  - Live-probe /after (confirm 308→/next-30-days), the 3 subpages, /survivor-benefits, /veterans, /certificates, /digital-legacy, /subscriptions
  - Fix-or-flag the sitemap inversion (/after in, /next-30-days out) and reconcile the 3-way certificate-count guidance to one canonical range
  - Exercise the VeteransChecker end-to-end (honorable/unknown discharge branches; 'death in VA care' branch) and the certificate calculator math (CERT_BASELINE + per-bucket)
  - Verify SSA figures ($255 fixed, 2-year deadline, 71.5%–100% scaling, 1-800-772-1213) against current SSA pub; verify VA form numbers (21P-530EZ, 40-1330, 27-2008, 40-0247) still current
  - Spot-check digital-legacy platform instructions against live Facebook/Google/Apple flows (highest-churn content in the cluster)

### Estate & financial-protection cluster  [L1]  state=built-live; MERP and reverse-mortgage are roadmap-Phase-2 pages explicitly designed for the hospice-decedent population (Medicaid/dual-eligible skew) — strong strategic fit; disclaimers present throughout
paths: app/estate/page.tsx, app/estate/[state]/page.tsx, app/estate/EstateStatePicker.tsx, lib/probate-by-state.ts, app/medicaid-estate-recovery/page.tsx, app/medicaid-estate-recovery/StateMerp.tsx
purpose: State-aware legal-adjacent guidance for the months after the funeral: probate by state (25 detailed state guides with thresholds, forms, authoritative-source links), Medicaid estate recovery defense (federal baseline + per-state), and the HECM reverse-mortgage heir timeline (95% payoff + non-recourse).
risks:
  - Stale copy contradiction: app/estate/[state]/page.tsx line ~167 says 'probate guides for the 10 most populous states' while /estate index correctly says 25 (lib has exactly 25 slugs) — the state page undersells its own coverage
  - Small-estate thresholds, informal-probate availability, and attorney-required flags are statute-derived and drift with legislation; no per-state verified-date
  - MERP 'Related' block links to /after (a redirect) instead of /next-30-days
  - MERP/HECM claims are precise legal assertions (deferral triggers, hardship waiver, 95%-of-appraised, non-recourse) — high family value, high liability if a state exception is missed; the LAWYER_BRIEF counsel review should explicitly cover these two pages
checks:
  - Fix the '10 most populous states' string; verify the 25-state count claim on /estate matches listStateSlugs() output live
  - Live-probe /estate, /estate/california, /estate/louisiana (civil-law outlier — full read), one no-informal-probate state, /medicaid-estate-recovery, /reverse-mortgage
  - Click-test every authoritativeSources URL for 3 sample states (court/bar links rot fastest)
  - Verify lib/merp-by-state.ts federal cite (42 U.S.C. 1396p) and the every-state deferral claims (spouse, child under 21, blind/disabled child) — full read of FEDERAL_BASELINE + 3 state rows
  - Confirm StateMerp and EstateStatePicker function client-side with JS (select state → content swaps) and degrade sanely without a selection

### Money & consumer-rights cluster  [L1]  state=built-live and current — FAQ accurately reflects the B2B2C model (funded by hospices/employers, never funeral homes/insurers, family never pays) with the hospice-partner framing ('care team never sees your choices'); tactics page is defamation-aware (industry-level, no named homes); FEMA COVID-program closure handled correctly
paths: app/how-to-pay/page.tsx, app/rights/page.tsx, app/rights/StateRules.tsx, lib/state-body-care.ts, app/funeral-home-tactics/page.tsx, app/faq/page.tsx
purpose: The advocacy spine: how to pay when you can't (county indigent, FEMA, Medicaid, charity), nine declinable line items with CFR citations and say-this scripts, the sales-floor tactics exposé, and the FAQ that carries the business-model trust story.
risks:
  - Number claims that must stay defensible and mutually consistent: 'basic services fee fair range $1,500–$2,500 / red flag over $3,500' (lib/content.ts FIVE_QUESTIONS, rendered on /prep, /prices, /funeral-homes/[zip], cheatsheets), 'casket markups 300–500%', 'typical funeral $9,000–$15,000', 'roughly 40% of families can't cover a $400 expense' (Fed SHED figure drifts yearly, uncited)
  - /rights is NOT in sitemap.ts despite being a core public page linked from /about, /average-funeral-cost, city pages, and /guides
  - rights page 'protective casket seal' FTC claim ('prohibits preservation claims the casket cannot deliver') is a paraphrase of 453.3(e) — precise enough, but it's the kind of sentence a funeral-home lawyer would test
  - tactics page cites 'Reuters multi-year investigation' and FCA reports generally — no links; fine for defamation posture, thin for citability
checks:
  - Add-or-justify /rights sitemap absence; live-probe all four pages
  - Full content read of /rights (all nine items + StateRules state-embalming table against lib/state-body-care.ts statute citations) — this is the page most likely to be challenged by the industry
  - Cross-check every dollar range on these pages against lib/pricing-data.ts and /methodology so no two surfaces disagree (guardrail #4)
  - Verify FAQ's JSON-LD/plain answers still match the operating plan verbatim on the never-take-money claims; confirm no leftover consumer-fee language
  - how-to-pay: verify FEMA status language is still true in late 2026, county-indigent framing, and that 'cheapest legal option' ordering doesn't read as steering toward any provider type

### Service-planning tool suite (dashboard long tail)  [L1]  state=mixed — the three guides are built-live and indexable; the six tools are built but SEO-dark (only /obituary is in sitemap; memorial/livestream/timeline/eulogy/subscriptions/certificates are dashboard-linked only); headstone directory is an admitted 18-vendor seed list
paths: app/obituary/Obituary.tsx, app/api/obituary/route.ts, app/eulogy/Eulogy.tsx, app/memorial/Memorial.tsx, app/livestream/Livestream.tsx, app/timeline/Timeline.tsx
purpose: Family-utility long tail: AI obituary + AI eulogy drafting (both call Claude via /api routes, localStorage drafts, print output), memorial-program and livestream and day-of-timeline planners, a monument-vendor directory, and three alternative-path guides (body donation, home funeral, out-of-state death).
risks:
  - Headstone page claims 'vetted monument companies' while lib/cemetery-vendors.ts says the opposite in comments ('TODO-FD: every entry below should be re-verified', ftcVerified flag never set) — an on-page trust claim the data file does not support; also 18 vendors ≠ national coverage while the page promises 'serving your area'
  - 'Save 30–60%' / 'markup 50–200%' headstone claims are uncited number claims on a public page
  - lib/cemetery-vendors.ts and lib/faith-traditions.ts comments still narrate the retired 'sister' operating model
  - Livestream planner stores the meeting password in plaintext localStorage (low severity, worth a conscious decision)
  - Tools carry no visible 'we don't arrange anything' framing — they document family decisions (good side of the navigation-not-arranging line), but the day-of timeline and memorial program are the closest surfaces on the site to 'arranging'; keep copy in the documenting register
  - AI obituary/eulogy outputs are family-facing generated text — eval coverage exists for the analyzer but verify these two prompts have any regression harness
checks:
  - Decide deliberately which tools should be public+sitemapped vs dashboard-only — right now the split is accidental (obituary in sitemap, eulogy not, both equally public routes)
  - Exercise /obituary and /eulogy end-to-end live including the claudeAvailable()=false degradation path (template fallback vs error) and print output
  - Click-test all 18 vendor websites/phones in lib/cemetery-vendors.ts or soften 'vetted' to 'starting points we don't take fees from'; verify the no-referral-fee disclosure renders on-page
  - Verify body-donation program list (DONATION_PROGRAMS) entries are live orgs and the body-broker warning is present; check home-funeral '41 states' legality claim and its state-rule source
  - out-of-state-death: verify two-funeral-home-model cost figures and any airline/consulate process claims (high churn)
  - Confirm memorial/livestream/timeline/subscriptions persist and restore from localStorage and never POST family data anywhere

### End-of-life / pre-death cluster  [L1]  state=built-live, in sitemap at 0.8, ArticleSchema present; strategically the highest-value cluster in the long tail for the hospice channel
paths: app/end-of-life/page.tsx, app/final-days/page.tsx, app/after-hospice/page.tsx
purpose: The pre-death and hour-of-death guides — the content that makes HF credible to hospices (patient-facing end-of-life page incl. MAID where legal; caregiver final-days guide; the don't-call-911 hospice-death page) and feeds the admission-week wedge.
risks:
  - Stat inconsistency between siblings: /final-days says '1.7 million Americans receive hospice care each year' (defensible, CMS/NHPCO) while /after-hospice says '1.7 million die in hospice care each year — nearly half of all deaths in the US' (conflates enrollment with deaths; both halves of that sentence need a source or a rewrite)
  - MAID content on /end-of-life is a legal/ethical minefield the page comment handles carefully (terminal-eligibility vs suicidal-ideation distinction) — but the where-legal state list drifts as states legislate
  - These pages are what a hospice partner will read first when diligencing HF — any clinical sloppiness here costs institutional deals, not just SEO
checks:
  - Full content read of all three pages (they are short enough and strategically load-bearing enough to warrant it) with the hospice-partner lens: would a hospice bereavement coordinator endorse every sentence?
  - Fix or source the 1.7M discrepancy; verify 'nearly half of all deaths' against current CMS Medicare-decedent hospice-utilization data
  - Verify the MAID state list and eligibility framing against 2026 statute status
  - Confirm /after-hospice's don't-call-911 guidance matches lib/scenarios.ts home-expected steps (same claim, two surfaces) and that both link into /decide not to any specific home

### Guides index + scenario/content libs (wiring layer)  [L1]  state=built-live; guides index is well-curated but incomplete — omits /faith/*, /medicaid-estate-recovery, /reverse-mortgage, /certificates, /obituary and all dashboard tools, /timeline, /after subpages
paths: app/guides/page.tsx, lib/scenarios.ts, lib/content.ts, app/sitemap.ts
purpose: The hub that organizes the long tail into nine categories (33 entries) and the shared copy libs feeding the crisis-guidance flow, prep kit, and cheatsheets.
risks:
  - lib/scenarios.ts still models the dead paywall: gateUntilPaid flags + 'pre-pay flow' comments, consumed by components/guidance/StepList.tsx via isPaid (actually fed pickedHome from lib/auth-paid in app/guidance/[scenario]/page.tsx) — behavior is repurposed but the naming invites a future regression against guardrail #2
  - Dead exports in lib/content.ts: PROGRESS_PHRASES, progressLine, PROMISE have zero consumers
  - Guides-index descriptions are themselves claims ('Legal in 41 states', '$255 lump-sum', '30–60% less') that must track the pages they describe
  - Scenario copy '10–15 originals' for death certificates contradicts the death-certificates page (5–10)
checks:
  - Reconcile guides index against the actual route inventory — add MERP + reverse-mortgage (both high-value, currently reachable only via estate cross-links/tasks) or record why they're excluded
  - Rename/annotate gateUntilPaid→post-decision semantics (or document it) and delete the dead lib/content.ts exports
  - Click-crawl every guides-index href live (33 links) for 200s
  - Sitemap diff: /after (redirect) in, /next-30-days out, /rights out, /eulogy out while /obituary in — produce one deliberate include/exclude decision list


## l2family
NOTES: L2 map complete; all cited paths read directly. THE headline audit finding: the entire negotiate flow is live and funnel-promoted (homepage, dashboard task #2, decide CTA, analyzer handoff) while OUTREACH_LIVE is off — a real family today completes double consent, is told 'We're contacting funeral homes for you / most reply within 24 hours', and sees raw 'dry_run' status strings, while no email leaves. Either gate the entry with honest coverage messaging or accept and instrument this deliberately; it is simultaneously a CONTENT (dishonest-by-accident), USE (dead-end funnel), and VALUE (zero data yield) failure mode. Second theme: the outcomes layer — L2's stated reason to exist — has exactly one capture point (the closed page), reachable only through the one path (choose-a-home) that has never run live; every other exit (abandon, no_homes_available, quotes-then-independent-arrangement, on-device tools) yields zero moat data. Third theme: kill-switch integrity is real but conventional — three separate OUTREACH_LIVE gates (send.ts, messages route, notify-chosen-home) rather than one structural chokepoint; the audit should add a lint/test asserting every funeral-home-recipient sendEmail site is gated. Consent handling is genuinely strong (server-enforced double consent, aggregate-only referral attribution, family-initiated-only emails, no cold-contact path found anywhere). Safety shape of household/share links is good except /api/share/create (no rate limit, no key allowlist on resume hydration). Test coverage is thin exactly where L2 logic lives: decide-engine, deriveTasks, phase-detector, quote-recompute, and the wizard have no tests, while send/directory/outcome/digest/household-view do.
ORPHANS: ["lib/negotiation/sample-homes.ts \u2014 findHomes() fake-directory function is dead code (only homesForRadius is imported anywhere); worse, homesForRadius's counts (9/14/20) are template fiction that the Wizard surfaces to families as 'Reach out to N homes'", "components/PhaseGating.tsx \u2014 no consumers found anywhere; the phase-detector\u2192PhaseContext\u2192PhaseGating chain is mounted but unread", "lib/phase-detector.ts \u2014 contradicts the live decide flow: reads honestfuneral.faith.v1 / honestfuneral.decide.v1 but /decide writes hf-decide:* keys (lib/faith-storage.ts), so the decide signal can never fire; untested", "app/negotiate/error.tsx \u2014 payment-era copy ('the money flow' comment; 'your requests still go out \u2014 nothing is lost' is false while OUTREACH_LIVE is off)", "app/dashboard/page.tsx line 54 \u2014 selects legacy stripe_payment_intent_id / unlocked_at columns; lib/auth-paid.ts isPaidUser is a decommission-era name repurposed as founder/test flag (works, but contradicts 'paywall fully dead' on grep-level audits)", "app/negotiate/[id]/preview/page.tsx \u2014 deliberate legacy redirect (keep; document as intentional)", "app/resume/[id]/page.tsx metadata \u2014 'Pick up where she left off' stale gendered title", "lib/negotiation/send.ts lines 103-106 \u2014 alert text 'Outreach failed to send for a paid negotiation' references the dead payment model in an operational page/alert"]

### Triage router (/where, /where/just-happened)  [L2]  state=built-live
paths: app/where/page.tsx, app/where/just-happened/page.tsx, lib/scenarios.ts
purpose: Routes a family in crisis to the right entry: guidance scenarios, /decide, /analyzer, /next-30-days, or /planning.
risks:
  - Pure links, no state — low risk; but it is the funnel mouth for all of L2, so a broken downstream target silently strands the highest-distress users
  - Pronouncement side-box routes 'not sure' users to /guidance/home-unexpected — correct but verify that page's 911 copy is current
checks:
  - Click every one of the 5 path cards + 4 scenario cards live and confirm no 404/redirect loops
  - Confirm /where is linked from homepage, dashboard (anonymous), and not-found page (grep shows app/page.tsx, app/not-found.tsx link it)
  - CONTENT: 'We check whether the quote is fair... about a minute' — walk /analyzer and time it

### Crisis guidance (/guidance/[scenario])  [L2]  state=built-live
paths: app/guidance/[scenario]/page.tsx, app/guidance/[scenario]/CrisisUnexpected.tsx, components/guidance/StepList.tsx, lib/scenarios.ts
purpose: Location-specific first-72-hours step lists (hospital / home-expected / home-unexpected / elsewhere) with progress stored in sessionStorage.
risks:
  - Progressive disclosure keyed on a CLOSED negotiation (page.tsx:61-91) — post-decision steps invisible to nearly everyone since zero real cases have closed; the variable is still called isPaid/pickedHome (legacy naming)
  - Article schema datePublished hardcoded 2026-01-01
  - home-expected is the hospice-admission scenario — the single most channel-sensitive page; copy must stay navigation-not-arranging
checks:
  - Load all 4 scenarios signed out — confirm calm degradation (no auth wall) and that step progress persists per-tab
  - Sign in with a founder/test email (isPaidUser allowlist) and verify the extra post-decision steps render — that path has likely never been seen live
  - CONTENT: verify each scenario's legal/procedural claims (pronouncement, 911, medical examiner) against current state guidance
  - Confirm scenario storage keys honestfuneral.guidance.*.v1 match what phase-detector and /family SHARE_KEYS expect (they do today)

### Decide flow (/decide + engine)  [L2]  state=built-live
paths: app/decide/page.tsx, app/decide/DecideFlow.tsx, lib/decide-engine.ts, lib/faith-storage.ts, lib/faith-traditions.ts
purpose: Five-question rule-based recommender that maps faith/body-present/disposition/cost to a ServiceType and hands off to /negotiate/start or /prices.
risks:
  - Copy says 'Nothing is saved. No account, nothing saved.' while every answer persists to sessionStorage and recommendedServiceType is read by /next-30-days and /negotiate — defensible (on-device) but the flat claim is imprecise
  - Savings claim 'avoid overpaying by up to $X' derives from fair-vs-predatory gap in SERVICE_TOTALS — must trace to a citable methodology (guardrail #4)
  - decide-engine has NO unit tests despite faith-locked logic (burial-required/cremation-required) that would be reputationally costly to get wrong
  - Line 63-64 of decide-engine: bodyAtService ternary is a no-op (both branches graveside-burial) — harmless but signals unreviewed logic
checks:
  - Run the matrix: Jewish/Muslim (burial-required) + cremation preference must show the conflict card, never a cremation recommendation
  - Verify SERVICE_TOTALS fair/predatory ranges against the methodology page and current pricing-data
  - Confirm the not-ahead CTA goes to /negotiate/start?svc=... and preserves svc through the login redirect
  - USE: check analytics for decide_recommended events to see if the tool is actually used

### Negotiate intake wizard (/negotiate/start + POST /api/negotiate/start)  [L2]  state=built-live (but downstream send is dry_run — OUTREACH_LIVE off by founder choice)
paths: app/negotiate/start/page.tsx, app/negotiate/start/Wizard.tsx, lib/negotiate-wizard-state.ts, app/api/negotiate/start/route.ts, lib/referral-codes.ts
purpose: The instrumented at-need intake: 8-step wizard collecting zip/service/quote-baseline/point-person, double consent (authorization + point-person), then creates the negotiation and triggers the kill-switch-gated outreach.
risks:
  - HONESTY GAP WHILE KILL SWITCH IS OFF: a real family can complete the full flow today; the wizard says 'the outreach is already triggered' and routes to a status page saying 'We're contacting funeral homes... most reply within 24 hours' — while rows are only dry_run and no email ever leaves. The flow is reachable from the homepage/dashboard with no interstitial admitting the pause.
  - OVERCLAIM: submit button reads 'Reach out to N homes' where N = homesForRadius() (9 at 25mi, 14 at 50mi) — a fiction from placeholder TEMPLATES, contradicting the intro's '3–5 homes' and the actual vetted-directory count (possibly 0)
  - Consent is properly double-gated server-side (authorizationAccepted + pointPersonConsent both 400 if false) — good; but the legal-next-of-kin attestation is a checkbox with no verification (accepted risk, document it)
  - Referral attribution correctly aggregate-only and best-effort (never read by ranking/choose) — anti-steering structural claim holds in code
  - dateOfDeath is validated non-future and only updates the family's own profile (bereavement cadence anchor) — consented, opt-in wording on the field
checks:
  - FULL-FUNNEL WALK: analyzer → handoff → login redirect → prefill ('from your quote check ✓') → all 8 steps → submit → status page; verify with OUTREACH_LIVE unset that negotiation_outreach rows land as dry_run and negotiations.status = contacting
  - Submit with a ZIP that has no vetted homes and confirm the no_homes_available honest dead-end renders (never a fabricated home)
  - Signed-out: /negotiate/start?zip=..&svc=.. must round-trip params through /login and return prefilled
  - Replay POST without pointPersonConsent / authorizationAccepted via curl — expect 400s
  - Verify ?ref=HF-XXXXXX from a partner link lands partner_id on the negotiation and NOTHING else changes in the family's experience
  - DECIDE: either fix the 'Reach out to N homes' count to reflect real directory coverage or cap the claim at '3–5'

### Outreach send path + vetted gate (kill switch)  [infra]  state=built-live, tested, switch off
paths: lib/negotiation/send.ts, lib/negotiation/directory.ts, lib/negotiation/denylist.ts, lib/negotiation/email-body.ts, lib/negotiation/__tests__/send.test.ts, lib/negotiation/__tests__/directory.test.ts
purpose: The single sanctioned funeral-home send path: OUTREACH_LIVE gate, dry_run recording, idempotent pending-only sends, active+vetted+email directory filter, send-time denylist re-check.
risks:
  - The CLAUDE.md invariant 'route everything through sendOutreachForNegotiation' is not literally true: app/api/negotiate/[id]/messages/route.ts and lib/negotiation/notify-chosen-home.ts each call sendEmail directly to a funeral home with their OWN OUTREACH_LIVE + denylist checks. The kill switch does apply at all three sites today, but the guarantee is now convention, not structure — a fourth site could forget
  - directory.ts fetches ALL vetted homes then filters in JS by zip prefix — fine at current scale, silently returns far-flung homes when a ZIP3 has no coverage ('rest' bucket means a family in Maine could get a vetted Utah home). Distance honesty risk once directory grows
  - send.ts comment/alert copy still says 'paid negotiation' (line 103-106) — decommission-era stale text in an alert that pages the founder
checks:
  - grep every sendEmail( call site; for each whose recipient can be a funeral home, verify an OUTREACH_LIVE gate + isEmailDenylisted check precedes it (today: send.ts, messages route, notify-chosen-home — all gated)
  - Confirm OUTREACH_LIVE and OUTREACH_NOTIFICATIONS_ENABLED are unset in Vercel prod env
  - Insert an unvetted funeral_homes row in staging and confirm findHomesFromDirectory never returns it
  - Verify the 'rest' bucket behavior: request a ZIP with zero same-ZIP3 homes and decide whether cross-state homes should ever be offered

### Case status + quote recording (/negotiate/[id]/status, GET /api/negotiate/[id], quote + messages APIs)  [L2]  state=built-unproven (zero real cases; AI-parse columns null-guarded pending migration)
paths: app/negotiate/[id]/status/page.tsx, app/api/negotiate/[id]/route.ts, app/api/negotiate/[id]/quote/route.ts, app/api/negotiate/[id]/messages/route.ts, app/negotiate/[id]/layout.tsx
purpose: Live case view: per-home outreach rows, family-typed or AI-proposed quote confirmation ('Use this'), and the relay messaging panel that keeps family contact info private.
risks:
  - Raw status leak: OutreachRow prints outreach.status verbatim when not sent/quoted — a family whose case ran with the switch off sees literal 'dry_run' in the UI (status/page.tsx:521-527). Combined with 'Most homes reply within 24 hours' copy this is the single worst content-vs-reality seam in L2
  - Legend advertises a 'Read' state — verify anything ever sets status='read' (open tracking) or the legend promises telemetry that doesn't exist
  - Quote route recomputes best/savings and flips negotiation status to 'received' — no test coverage for the recompute; outcome route IS tested
  - Messages relay inserts the message row even when send is paused ('stored but not sent', family sees it in-thread with no visual 'not delivered' distinction) — honest-UX gap: the family believes the home received it
  - AI proposal matching falls back to from_address == home_email match — two homes sharing an email (chains) could cross-attach a proposal; display-only until confirmed, so bounded
checks:
  - With switch off, send a pre-meeting message and confirm what the family sees vs. what actually happened (sent:false, reason outreach_paused is swallowed by the UI — verify)
  - Record a manual quote, then a second lower one on another row; confirm best_quote_cents/savings_cents recompute and the results CTA appears
  - Auth: fetch GET /api/negotiate/[other-user-id-case] — expect 404 (RLS + explicit user_id filter)
  - Verify polling backs off (6s→30s) and stops on terminal states — watch the network tab for 5+ minutes
  - If the 2026-07-16 inbound-AI-parse migration is applied in prod: send a fixture inbound email through Postmark and confirm the 'We read their reply' card, then 'Use this' stamps ai_confirmed_at

### Results / compare / choose / closed + outcomes capture  [L2]  state=built-unproven (outcome route unit-tested; zero real outcomes captured)
paths: app/negotiate/[id]/results/page.tsx, app/negotiate/[id]/compare/page.tsx, lib/negotiation/compare.ts, app/api/negotiate/choose/route.ts, lib/negotiation/notify-chosen-home.ts, app/negotiate/[id]/closed/page.tsx
purpose: Family sees quotes ranked by price only, optionally line-by-line against fair ranges, picks a home (no-JS form POST), home is notified, case closes, and the closed page captures satisfaction + amount-paid + surprise-fees — the outcomes-dataset moment.
risks:
  - OUTCOMES CAPTURE GAP (L2's real job): the only outcome prompt lives on /negotiate/[id]/closed — families who abandon mid-case, get quotes but arrange independently, or hit no_homes_available are never asked anything; there is no email/cron nudge for outcome completion (quote-notifications cron is reply-notification only and gated off). The moat's data funnel has exactly one narrow mouth
  - Anti-steering holds structurally: ranked by quoted price only, explicit 'we take no money' copy, choose route never reads partner attribution — good; keep it that way
  - Compare-matrix cell ratings color against fair ranges — every rating traces to knownItem fair bands; verify those bands are the defensible published ones (guardrail #4)
  - notifyChosenHome requires quote_cents present — a family choosing a home whose quote was never recorded silently results in reason no_quote and NO notification; the closed page still says 'We've let the home you chose know'. False claim in that path
  - closed page 'we'll loop you in once a slot is set' promises scheduling follow-through that has no automated mechanism visible — manual founder work; verify it's honest
checks:
  - Choose a home whose quote_cents is null and diff what the closed page claims vs. notify result (expect the false 'we've let them know')
  - Double-submit the choose form; confirm single notification (conditional neq closed update)
  - POST outcome with only surpriseFees and verify outcome_recorded_at is NOT stamped (partner-report cohort purity — tested, but verify live)
  - Submit satisfaction + amount paid on a test case and confirm rows land and /admin/outcomes sees them
  - FUNNEL: enumerate every exit path from a live case (abandon, no_homes, independent arrangement) and note which produce zero outcome data — feed into the audit's data-moat scoring

### Admin outreach previews + legacy preview redirect  [admin]  state=built-live
paths: app/api/negotiate/preview/route.ts, app/api/negotiate/preview-selection/route.ts, app/negotiate/[id]/preview/page.tsx
purpose: Admin-gated dry renders of the outreach and selection emails (explicit labeled placeholder home when directory is empty); the page route is a legacy redirect keeping pre-decommission links alive.
risks:
  - Placeholder home uses .example domains and requireAdminApi — safe; only risk is drift between preview output and what send.ts actually sends
checks:
  - Call both preview APIs unauthenticated — expect the admin denial
  - Diff preview email body against a real dry_run negotiation_outreach.initial_email_body for the same inputs

### Dashboard (/dashboard + deriveTasks)  [L2]  state=built-live
paths: app/dashboard/page.tsx, lib/dashboard.ts, components/dashboard/FuneralHomeOutreachCard.tsx, components/dashboard/DashboardActions.tsx
purpose: Signed-in hub: three-task queue derived from case/tool state, active-outreach card, and the full free-tool grid; graceful anonymous and unconfigured variants.
risks:
  - Still selects stripe_payment_intent_id and unlocked_at from negotiations and calls isPaidUser (lib/auth-paid.ts) — decommission-era remnants repurposed as a founder/test flag; confusing naming that an audit of guardrail #2 will trip over
  - deriveTasks has no unit tests; the 'Never more than three' rule and phase derivation are enforced only by slice(0,3)
  - Dashboard task #2 always pushes /negotiate/start until a case CLOSES — nudging families into a flow whose sends are currently dry_run (same honesty seam as above)
checks:
  - View signed-out (AnonymousDashboard), signed-in-empty, signed-in-with-active-case, and Supabase-unconfigured — all four variants render without error
  - Confirm every ToolTile href resolves (15 tools listed — walk them all; this is the de-facto sitemap of family tools)
  - Verify greeting uses profiles.display_name and no PII leaks into any print view

### Phase detector chain (phase-detector → PhaseContext → PhaseGating)  [L2]  state=legacy-suspect / partially broken
paths: lib/phase-detector.ts, components/PhaseContext.tsx, components/PhaseGating.tsx
purpose: Client-side phase inference from storage keys intended to gate content by journey stage.
risks:
  - STALE KEYS: hasDecideAnswers reads honestfuneral.faith.v1 and DECIDE_KEY honestfuneral.decide.v1 — but the decide flow writes hf-decide:* keys (lib/faith-storage.ts). The decide signal can never fire; 'decisions' phase only reachable via guidance progress
  - PhaseGating has no consumers found outside its own file — the whole chain may be dead weight rendered in app/layout.tsx for nothing
checks:
  - grep for usePhase()/PhaseGating consumers; if truly zero, delete the chain or fix the keys — currently it is untested, unread, and wrong
  - If kept: unit-test detectPhase against the REAL storage keys each tool writes

### On-device tools (worksheet, briefing, next-30-days, vault, notifications)  [L2]  state=built-live
paths: app/worksheet/Worksheet.tsx, app/briefing/Briefing.tsx, app/next-30-days/NextThirtyDays.tsx, app/next-30-days/tasks.ts, app/vault/Vault.tsx, app/notifications/Notifications.tsx
purpose: Account-free localStorage/sessionStorage tools: arrangement-meeting worksheet, printable family briefing, 30-day paperwork checklist (context-filtered by decide answers), document tracker, who-to-tell tracker.
risks:
  - All data on-device by design (honest architecture) — but that means ZERO outcomes/usage data flows to the moat from these heavily-used surfaces; only analytics events, if any, reach the server
  - next-30-days/tasks.ts carries many factual claims (SSA, banks, probate, VA) — a content-accuracy audit target with 399 lines of assertions
  - Save paths call maybePublishHousehold() — verify every tool that appears in the /household family view actually triggers the debounced republish (vault, notifications, next-30-days do; worksheet does not and is also absent from HOUSEHOLD_KEYS — intentional?)
checks:
  - CONTENT: verify the top factual claims in tasks.ts (death-certificate counts, SSA notification, MERP/probate references) against 2026 reality
  - Check off a next-30-days task on a device with a live household link and confirm /household/[id] updates within ~2s debounce
  - Print-preview the briefing and worksheet — letterhead/print CSS should be clean
  - Confirm decide answers (veteran=yes, bodyAtService) actually filter/annotate the 30-day tasks

### Session hand-off (/family share link + /resume/[id] + share APIs)  [L2]  state=built-live
paths: app/family/Family.tsx, app/api/share/create/route.ts, app/api/share/[id]/route.ts, app/resume/[id]/page.tsx, app/resume/[id]/ResumeClient.tsx
purpose: Point person snapshots on-device progress to an anonymous 7-day share link; recipient's device hydrates sessionStorage and continues at /dashboard.
risks:
  - /api/share/create is anonymous with NO rate limit (household/create and family/digest both have one) and accepts 100KB opaque payloads — spam/storage abuse vector
  - ResumeClient writes EVERY payload key into sessionStorage with no allowlist — a crafted share link can inject arbitrary keys (e.g. hf-analyzer:handoff, negotiate-wizard state) into a victim's session; contrast with the client-side SHARE_KEYS allowlist that only governs what the legit creator sends
  - Expiry claim '7 days' appears in copy; the API filters via RLS on non-expired rows — verify the DB actually enforces it
  - resume metadata title 'Pick up where she left off' — stale gendered copy vs neutral phrasing elsewhere
checks:
  - POST a payload with a non-allowlisted key and open the resume link — confirm whether it hydrates (it will); decide on a server- or client-side key allowlist
  - Confirm an 8-day-old share link 404s (RLS expiry) and the calm dead-end renders
  - Rate-limit probe /api/share/create (20 rapid posts) — currently expect no 429; flag
  - Verify negotiate-wizard state carried in a share link doesn't carry consent flags (pointPersonConsent should re-default false on the recipient — DEFAULT_STATE merge in readState covers absent fields, but a snapshot with consent:true transfers it; check)

### Live household view (/household/[id] + household APIs)  [L2]  state=built-live
paths: lib/household-link.ts, lib/household-view.ts, app/api/household/service.ts, app/api/household/create/route.ts, app/api/household/update/route.ts, app/api/household/rotate/route.ts
purpose: Owner-published read-only family status page: the point person's device pushes debounced snapshots to a stable slug; relatives view without accounts; owner_secret gates all mutations, rotatable/revocable, 30-day rolling expiry.
risks:
  - Clean security shape (RLS-deny-all + service-role + secret-never-in-read-paths + no-oracle 404s) — main residual risk is the payload being unencrypted family data readable by anyone holding the slug URL (accepted, disclosed in copy)
  - Rate limits keyed on x-forwarded-for first hop — spoofable header if Vercel isn't stripping client-supplied values; same pattern across digest/sms/household routes
checks:
  - Create → view → rotate → confirm old slug dies with the calm 'expired or replaced' page → revoke → confirm
  - Wrong ownerSecret on update must 404 (not 403) — no slug oracle
  - Verify parseHouseholdView never throws on corrupted payloads (tested; also probe live with junk)
  - Confirm x-forwarded-for on Vercel is platform-set, not client-passthrough, for all rateLimit call sites

### Per-person digest email (/api/family/digest + DigestCard)  [L2]  state=built-live, tested
paths: app/api/family/digest/route.ts, lib/family-digest.ts, app/family/DigestCard.tsx, lib/__tests__/family-digest.test.ts
purpose: One-time family-initiated email sending ONE relative only their assigned tasks/contacts/documents — client filters before anything leaves the device.
risks:
  - Anonymous endpoint that emails arbitrary addresses with HF branding — content is constrained to item titles and the footer says 'sent at your family's request', but 5/hr/IP still permits low-grade spam/harassment via crafted titles (160 chars free text per item, 40 items)
  - This is family-initiated, not platform-initiated — channel-survival rule holds; keep it that way (no follow-up, no list)
checks:
  - Send a real digest to a test inbox; verify tone (quiet friend), no tagline, no unsubscribe needed, and that ONLY the named person's items appear
  - Probe the 6th send in an hour — expect 429
  - Try hostile item titles (URLs, spoofy text) and review how they render in the email — consider stripping links

### Comms preferences (/preferences/[id], /api/preferences/sms, /unsubscribe)  [L2]  state=built-live (SMS reads degrade pre-migration by design)
paths: app/preferences/[id]/page.tsx, app/preferences/[id]/SmsOptIn.tsx, app/api/preferences/sms/route.ts, app/unsubscribe/page.tsx, lib/nurture-email.ts, lib/anniversary-emails.ts
purpose: Bereavement check-in email opt-out/in (UUID-as-credential), SMS opt-in for check-ins, and HMAC-tokened unsubscribe for the planning nurture list.
risks:
  - GET-with-side-effect: /preferences/[id]?action=unsubscribe applies on a GET via service role — email-security link scanners that prefetch URLs will silently unsubscribe families from the check-ins they opted into; resubscribe same problem in reverse
  - UUID-as-credential is accepted for unsubscribe, but the SAME trust level lets anyone with a leaked link set bereavement_sms_phone to an attacker-chosen number (SMS to a stranger's phone) — one notch more consequential than unsubscribe
  - No rate limit on the preferences page's GET action (the SMS API has one)
checks:
  - Fetch the unsubscribe URL with a HEAD/GET from a non-browser client — confirm the flip happens (it will); consider converting to a confirm-button POST
  - Set SMS opt-in, then verify whatever cron sends SMS honors bereavement_sms_opt_in AND validates the phone
  - /unsubscribe with a tampered token must show 'link looks off', not flip anything
  - CONTENT: 'five light check-ins across thirteen months' — verify against the actual anniversary-emails schedule

### Account + erasure (/account, /api/account/delete)  [L2]  state=built-live
paths: app/account/page.tsx, app/account/DeleteAccount.tsx, app/api/account/delete/route.ts
purpose: Right-to-erasure: origin-checked no-JS form POST that cascades auth-user deletion across all owned tables and clears the email-keyed marketing row.
risks:
  - Cascade correctness depends on ON DELETE CASCADE existing on every user-owned table — new tables (hospice consent, analyses variants) must keep inheriting it; the route comment lists tables that may be stale vs. current schema
checks:
  - Delete a test account with a negotiation + outreach + messages + analyses, then query all tables via service role for orphans
  - Confirm planning_signups row (ilike email) is gone; confirm bad-origin POST 403s
  - Verify the negotiation copy on the page ('outreach already emailed can't be recalled') matches reality

### Auth spine (/login, /auth/callback, /auth/signout, require-signed-in)  [L2]  state=built-live
paths: app/login/page.tsx, app/login/layout.tsx, app/auth/callback/route.ts, app/auth/signout/route.ts, lib/require-signed-in.ts
purpose: Email/password + Google OAuth with next-param preservation, open-redirect-hardened callback, sign-in-first signup UX, no-op gate in unconfigured dev mode.
risks:
  - Callback correctly rejects absolute/protocol-relative next values and distinguishes dead-link vs cancelled-consent errors — solid; main audit interest is the requireSignedIn no-op when Supabase env is missing (never true in prod, but a misconfigured env would silently open every gated page)
checks:
  - Probe /auth/callback?next=https://evil.com and ?next=//evil.com — must land on /dashboard
  - Re-click a used magic link while holding a session — should forward to destination, not error
  - Confirm prod env always has Supabase vars so requireSignedIn can't no-op


## l3partner
NOTES: L3 verdict: coherently built, structurally safe, commercially unproven. Every route in scope was read. The layer's defining property is that its guardrails are STRUCTURAL, not copy: pending-by-construction applications (active=false until /admin/partners), typed n>=5 suppression (CohortStatsSuppressed nulls every dollar field at the type level — no bypass path, and CSV/digest/ProofSheet all inherit it), zero-visibility (partners see counts, never cases; user_id keys lookups but never reaches output), consent-gated email retention on nominate/claim (server drops email without the checkbox), and the public sample report physically cannot reach Claude (import ban, grep-pinned). Channel-survival rules hold everywhere I looked: no code path emails a hospice or family cold (the only sends are founder-internal notifications, the invite email to an owner-added seat, and the kill-switched digest to the institution's own contact); the family sends the tell-your-hospice note from her own mail client; hospice materials copy encodes post-admission-only display while the employer arm deliberately permits standing benefits-page placement. Test coverage is real: 12 dedicated test files across partner-report/digest/codes/team/auth/claim/nominate/directory/display. The three pilot-readiness gaps an auditor should drive at: (1) REVENUE PATH MISSING — no Stripe billing exists (Day 8 pending), so 'one hospice paying' is blocked on build+founder actions, not on this layer's quality; (2) PROD MIGRATION STATE UNVERIFIABLE FROM THE REPO — everything degrades safely to empty/404 when partners/partner_codes/portal-identity/outcomes tables are missing, which means a broken prod looks calm, not broken; the audit must probe live (create test partner, walk token+portal end-to-end) rather than trust rendering; (3) the sales-copy layer has three defensibility soft spots (CAHPS card, $2k-$5k benchmark, present-tense funding claim) that a hospice compliance officer — the actual buyer's gatekeeper — would find in one read. Cross-reference for the audit plan: /admin/partners (founder activation desk) and the analyzer/negotiate attribution stamps live in other mappers' territories but are the other half of this layer's loop.
ORPHANS: ["app/partners/page.tsx lines 184-203 \u2014 the CAHPS/'Medicare Annual Payment Update' pitch card contradicts the retired CAHPS-hook decision (BUSINESS_PLAN v2 canonical = referral-reputation framing) and the 'family-survey acronym banned everywhere, always' rule stamped on the hospice-directory surfaces; the only live sales page still carrying it", "lib/partner-report.ts header comment (lines 5-8) \u2014 stale: says production records come from price_list_analyses scoped by referral code ('Wave 4: add institution_id'); the shipped path reads negotiations.partner_id (lib/partner/report-data.ts). Comment-only, but it misdescribes the data contract to the next reader", "Token-vs-session pause split: lib/partner-auth.ts (token) gates on active only; lib/partner/auth.ts (session) also gates status paused/archived \u2014 either /admin/partners pause must always flip active, or the token gate is a hole", "Token surface has no /partner/r/[token]/materials twin \u2014 coordinators on the quick link can't reach the print kit without a sign-in seat; likely the first friction a real pilot hits", "app/funeral-home-opt-out \u2014 state-changing DB write on GET; a link-prefetching mail scanner can opt homes out silently; must be fixed before OUTREACH_LIVE", "Present-tense 'funded by the institutions we partner with' on /for-funeral-homes and in tell-your-hospice's INTRO_BODY while zero institutions pay \u2014 guardrail-#4-adjacent honesty question for the founder", "app/api/cron/partner-digest legacy-column fallback branch (pre-migration partners schema) \u2014 dead weight once prod migration state is confirmed; prune then", "/tell-your-hospice absent from app/sitemap.ts (footer-reachable only) \u2014 confirm deliberate"]

### /partners — hospice+employer sales landing  [L3]  state=built-live (indexed, in sitemap at priority 0.8); zero customers, so every proof element is the labeled sample cohort
paths: app/partners/page.tsx, app/partners/DemoRequestForm.tsx, app/api/partner/demo-request/route.ts
purpose: Convert a hospice or employer visitor into a demo call or pilot application — the top of the institutional revenue funnel.
risks:
  - The 'problem this solves' card (lines 184-203) pitches the CMS family-survey acronym + 'risks your Medicare Annual Payment Update' — this is the retired CAHPS-hook framing (business-plan v2 made referral-reputation canonical; market research says never pitch survey repair, scores are already ~91%), and the Day-6 word-ban comments elsewhere call that acronym 'banned everywhere, always'
  - 'Typical overcharge $2,000–$5,000' is a public number — must be defensible via /methodology (guardrail #4); basis footnote exists but the range itself needs a citable derivation
  - '~13 months of support Medicare requires per death (42 CFR 418.64) — unfunded' — the CFR requires bereavement services for up to one year post-death; verify the 13-month figure and the 'unfunded' characterization are defensible
  - No pricing anywhere (Stripe/§7.3 decision still open) — page only promises a free 60-day pilot; fine for now but the funnel dead-ends at 'apply' with no commercial terms
checks:
  - Probe live https://honestfuneral.co/partners — confirm sample metrics render, 'Illustrative sample cohort — no customer has generated this data yet' disclaimer present, /partner/sample-hospice link works
  - Decide the CAHPS card's fate against the canonical 3-touch referral-reputation framing; if kept, verify every claim (composite→star-rating→APU chain) against current CMS rules
  - Trace $2,000–$5,000 and ~13-month claims to /methodology and 42 CFR 418.64(d) — can each survive a hostile hospice compliance officer reading it?
  - Submit a live demo request; verify partner_leads row lands AND founder email arrives (dual best-effort path), then delete the test row
  - Verify /api/partner/demo-request returns 429 on the 6th POST from one IP within the hour

### /partners/apply — self-serve application (pending-by-construction)  [L3]  state=built-unproven — no real application has ever been approved into a live partner
paths: app/partners/apply/page.tsx, app/partners/apply/ApplyForm.tsx, app/api/partner/apply/route.ts
purpose: Two-minute institutional application that inserts a partners row with active=false — nothing goes live until the founder approves on /admin/partners.
risks:
  - The 'two commitments' card promises 'small cohorts are suppressed entirely' — accurate (typed n≥5 suppression in lib/partner-report.ts), but the promise is contractual-sounding copy a lawyer should bless
  - Hospice-name datalist autocomplete depends on /api/hospices/search — degrades silently to free text (safe)
  - Email ping goes to PARTNER_APPLICATIONS_TO env or ryan@honestfuneral.co fallback — if the env var is stale, applications sit unseen except as DB rows
checks:
  - Submit a live application; verify the partners row lands with active=false + status='pilot', founder email arrives, and NOTHING becomes publicly resolvable (no code, no token page) until admin approval; delete the test row
  - Verify ?type=employer preselects employer and ?org= prefill from a facility page carries through (claim path /hospices/[state]/[ccn] → apply)
  - Confirm PARTNER_APPLICATIONS_TO is set correctly in Vercel prod env
  - Walk the full approve path on /admin/partners: pending → active, report token issued, portal seat invited — this is the exact sequence a real pilot hospice would trigger tomorrow

### /partner/[code] — public SAMPLE proof report  [L3]  state=built-live; noindexed; deliberately imports only fallbackOutcomesDigest so the public catch-all can never trigger a Claude call
paths: app/partner/[code]/page.tsx, components/partner/ProofSheet.tsx, lib/partner-report.ts
purpose: Sales-deck demo: any slug renders the real ProofSheet component over the deterministic sample cohort so a prospect sees the exact report format (live=false; /partner/sample-hospice is the demo-script URL, slugs containing 'employer' render the employer variant).
risks:
  - Catch-all titleizes ANY slug into the report header — /partner/real-hospice-name mints a screenshot-able page bearing a real org's name; the 'Sample report' banner is print:hidden-adjacent screen chrome, verify it also survives print
  - Sample cohort numbers ($2,345 caught etc.) are invented-but-labeled; the ProofSheet correctly gates present-tense adoption claims on `live` (guardrail #4)
checks:
  - Probe /partner/sample-hospice and /partner/sample-employer live — both render, employer variant carries no Medicare/CMS/hospice vocabulary (grep rendered HTML)
  - Probe an arbitrary slug (/partner/test-anything) — sample banner visible on screen AND in print CSS; confirm noindex meta on every branch
  - Confirm no network path from this route to lib/claude (grep imports — only fallbackOutcomesDigest permitted; sprint Day-5 gate greps this)
  - Print the sample to PDF — the buyer-path footer line must read as capability ('can offer'), never adoption fact

### /partner/r/[token] — real token-gated partner report + links + quote check  [L3]  state=built-unproven — zero real cases have ever flowed through it; report data assembly shared verbatim with /portal so the two views cannot drift
paths: app/partner/r/[token]/page.tsx, app/partner/r/[token]/links/page.tsx, app/partner/r/[token]/check/page.tsx, lib/partner-auth.ts, lib/partner/report-data.ts
purpose: The founder-issued bearer-token portal: aggregate-only outcomes report, coordinator referral-link management, and a stateless quote checker — the thing a pilot hospice actually uses.
risks:
  - PAUSE INCONSISTENCY: token pages check only partner.active===false, while the session portal also parks status==='paused'/'archived' on /portal/paused — a partner paused by status alone keeps full token access (report, links create/revoke, check). Verify /admin/partners pause always flips active, or fix the token gate
  - Bearer token travels in URLs, emails (digest), and browser history — rotation exists (/api/portal/settings/rotate-token) but only signed-in owners can rotate; a token-only org has no self-serve rotation
  - Token surface has NO materials page — a coordinator holding only the quick link cannot print the one-pager/QR posters without creating a sign-in seat (feature asymmetry that would surface day one of a pilot)
  - Depends on partners/partner_codes/negotiations-outcomes/portal-identity migrations being applied in prod; every miss degrades to notFound or empty (safe but silently dead)
checks:
  - With a founder-created test partner: probe /partner/r/<token> live — empty-state 'Your report is building' renders; a garbage token 404s with no oracle
  - Create + revoke a referral link via the token path; confirm the revoked code stops resolving on /api/partner/resolve
  - Run the quote check as a token holder — confirm NOTHING persists (the 'nothing here is saved' claim is only true because the coordinator is anonymous; verify no price_list_analyses row appears)
  - Set a test partner status='paused' WITHOUT flipping active — check whether token pages still serve (documents the inconsistency above)
  - Confirm every token page ships robots noindex in rendered HTML

### /portal/* — signed-in partner portal (login, overview, links, materials, check, settings, team, paused)  [L3]  state=built-unproven — seat binding, invite emails, materials printing, and token rotation have never carried a real org; login flow was hardened after 'the first pilot walkthrough' burned on a silent session loop (comment in login page)
paths: app/portal/login/page.tsx, app/portal/page.tsx, app/portal/links/page.tsx, app/portal/materials/page.tsx, app/portal/check/page.tsx, app/portal/settings/page.tsx
purpose: The email-OTP portal a hospice team signs into: first-run checklist, live aggregate report + CSV export, referral links, print-ready co-branded family materials (one-pager, QR posters, hand-off scripts), owner-only settings/team.
risks:
  - Known single-org limitation (documented in lib/partner/team.ts): an email already bound to another org resolves to THAT org on sign-in — a coordinator serving two hospices is silently unreachable for the second seat
  - signInWithOtp will mint a Supabase auth user for ANY email (membership gate then 404s) — harmless but means portal login is an open account-creation endpoint
  - Materials page is family-facing print collateral: the neutrality pledge + FREE_WITH_OR_WITHOUT_LINK constants are verbatim-law (grep-pinned); the hospice team-email snippet correctly encodes post-admission-only display, the employer one correctly does not — any copy edit here is channel-survival-sensitive
  - handoffScript/emailParagraph in materials still hardcode 'Honest Funeral' literals (flagged in-code for Rename Day sweep)
  - Portal overview 'dollar figures appear once at least five families have outcomes' promise must stay true to SMALL_SAMPLE_THRESHOLD=5
checks:
  - Full pilot walk with a test org: invite a seat → receive invite email → OTP sign-in → seat binds (accepted_at stamped) → first-run checklist shows → create link → materials page renders one-pager + QR + all three snippets → print to PDF cleanly
  - Verify the wrong-account path: sign in with a family account that has no seat — expect 404, and the login page's 'signed in as X / use different email' choice prevents the dead-end loop
  - Owner-only enforcement: a plain member hitting /portal/settings and /portal/team must 404; API twins must 403
  - Rotate the report token from settings; confirm the old /partner/r/<token> URL dies instantly and the new one works
  - Deactivate-last-owner must refuse (last_owner error); seat cap at 20; deactivated-seat re-invite returns seat_deactivated not 'already'
  - Confirm /portal/check DOES persist an analysis under the member's own account and says so (saveNote) — the honest twin of the token page's claim

### Referral attribution loop — codes, resolve API, links API  [L3]  state=built-unproven end-to-end — code create → family visit → co-brand banner → case claim → report count has been exercised in tests but never by a real family
paths: lib/referral-codes.ts, lib/partner/codes.ts, app/api/partner/resolve/route.ts, app/api/partner/links/route.ts, app/plan-now/page.tsx
purpose: The data-moat wiring: HF-XXXXXX codes hand-carried by families (localStorage, 30-day TTL) stamp partner_id onto negotiations and price_list_analyses for aggregate reporting only — attribution never changes what a family sees (anti-steering structural).
risks:
  - /api/partner/resolve is public by design (code → org display name only); 31^6 space + 60/hr IP limit makes enumeration impractical — keep it that way
  - Dual ?ref= semantics (HF- codes vs cosmetic partner-name slugs) coexist deliberately — a regression here could render a raw code as a partner name (plan-now already suppresses this; analyzer should match)
  - codesWithClaims counts claims from negotiations.partner_code — a partner with many checker-only families shows 0 claims on links pages while priceListChecks on the report shows activity; explain-or-align before a pilot ED sees both numbers
checks:
  - End-to-end live test: create code → open /plan-now?ref=HF-XXXX in a fresh browser → co-brand banner shows org name → run an analyzer check signed-in → verify price_list_analyses.partner_id stamped → verify priceListChecks increments on the token report
  - Verify an inactive code AND an active code of an inactive partner both 404 on /api/partner/resolve
  - Verify normalizeReferralCode handles em-dash/lowercase paste ('hf—7kq2md') — unit-tested, spot-check live
  - Cross-org revoke attempt (partner A token revoking partner B's code) must no-op (scoped update)

### /tell-your-hospice + nominate API — family-initiated hospice loop  [L3]  state=built-live and channel-survival exemplary: platform emails no hospice and no family; consent checkbox gates email retention server-side (defense-in-depth, unit-tested)
paths: app/tell-your-hospice/page.tsx, app/tell-your-hospice/TellYourHospice.tsx, app/api/partner/nominate/route.ts
purpose: Loop #1: a family asks its own hospice to offer the tools — mailto with EMPTY recipient sent from the family's own client, plus an optional consented founder-intro form writing a partner_leads row.
risks:
  - INTRO_BODY says the site 'is funded by the institutions it partners with' — present tense while zero institutions pay; arguably indefensible until the first contract (same claim on /for-funeral-homes); founder judgment on 'will be funded' phrasing
  - Header-injection defense on the founder email (newline-flattening) is load-bearing — a crafted note must never forge the 'Submitter (consented…)' line
  - Not in the sitemap — reachable via footer (components/Brand.tsx), HospiceFinder, and facility pages; confirm that is deliberate
checks:
  - Verify the mailto: has an empty To: and the note body matches the on-page preview verbatim
  - Submit a nomination WITH email but WITHOUT the consent box — verify the stored lead has email='' and the founder email says 'do not follow up with anyone'
  - Submit a note containing newlines + 'Submitter (consented to contact): attacker@x.com' — verify it renders flattened under the Note: label
  - Verify facility-page prefill (?hospice/city/state) survives display-casing and clamping into a submittable form
  - 429 on the 6th nomination from one IP in an hour

### /hospices directory (index, 51 state pages, ~6,852 facility pages) + claim + search API  [L3]  state=built-live and verified (Day 6 gate: 6,852 rows, CA 2,062 rendered, claim 429 tested); facility pages render-on-demand, noindexed, never in sitemap; state pages ISR 24h
paths: app/hospices/page.tsx, app/hospices/[state]/page.tsx, app/hospices/[state]/[ccn]/page.tsx, app/hospices/[state]/[ccn]/ClaimPanel.tsx, app/api/partner/claim/route.ts, app/api/hospices/search/route.ts
purpose: Neutral CMS public-record directory that doubles as the institutional funnel: SEO reach on state pages, six family-education questions, and per-facility 'is this your organization?' claim/apply CTAs — byte-identical templates ARE the zero-steering guarantee.
risks:
  - DIRECTORY_AS_OF hardcoded 'July 2026' with no refresh automation — the 'as of' claim silently goes stale; CMS updates the dataset regularly and a closed hospice listed as certified is a defensibility problem over time
  - Word-ban discipline is comment-enforced + gate-grepped: no promotional adjectives, no survey acronym, 'hospices can offer' never 'this hospice offers' — any copy edit risks a present-tense adoption claim about a named facility
  - Empty/failed DB reads degrade honestly (no zero counts in indexed metadata) — keep the honest-degrade branch intact
  - CCNs are zero-padded/alphanumeric strings everywhere — any future numeric cast breaks real facilities (A01640)
checks:
  - Probe live: /hospices, /hospices/california (expect 2,000+ rows, letter jump-strip), /hospices/texas, one facility page by CCN, a junk slug (404), a wrong-state CCN (404)
  - Grep rendered facility HTML for noindex on hit AND miss branches; confirm no facility URL in /sitemap.xml
  - Diff live row counts against the current CMS yc9t-dgbk download — quantify drift since the July 2026 import; decide a re-import cadence and update DIRECTORY_AS_OF policy
  - Submit a claim with consent → partner_leads row + founder email; unknown CCN → 404 with no email; 6th claim from one IP → 429
  - Search API: 2-char minimum, ilike-escape check (query containing % or *), 30/min rate limit, failure returns empty with no-store (never a cached-empty pin)

### /employers — employer sales variant  [L3]  state=built-live, indexed; word-ban compliant (no Medicare/CMS/survey vocabulary present — verified by grep)
paths: app/employers/page.tsx
purpose: The benefits-team pitch: standing benefits-page/EAP placement (deliberately allowed — post-admission-only is a hospice rule with no employer analogue), 'your systems transmit nothing', sample employer report.
risks:
  - Same $2,000–$5,000 overcharge claim as /partners — one methodology defense must cover both
  - 'We run every case by hand' — accurate today, will silently become false at scale; date-stamp or soften eventually
checks:
  - Probe live /employers; confirm /partner/sample-employer link renders the employer ProofSheet variant (no bereavement-reminded metric, no CMS/CAHPS vocabulary in rendered HTML)
  - Confirm /partners/apply?type=employer preselects employer
  - Verify the 'Nothing' transmitted card's basis claim stays true (no integration/upload endpoint exists anywhere in the repo)

### Monthly partner digest cron + AI outcomes paragraph  [L3]  state=built, dry-run live-tested on 3 cohorts (Day 5 gate) — never sent a real digest; kill-switched behind PARTNER_DIGEST_ENABLED
paths: app/api/cron/partner-digest/route.ts, lib/partner-digest.ts, lib/partner-report-digest.ts
purpose: 1st-of-month aggregate email to each active partner (suppression-gated counts + optional Claude paragraph + live report link); admin ?test= dry-run renders without sending.
risks:
  - Digest email embeds the bearer report_token URL — acceptable (it is the partner's own credential) but forward-a-friend leaks the whole report; the pledge text in the email partially mitigates
  - Claude paragraph is grounded-numbers-only with deterministic fallback and 15s timeout — the 'may state figures the bullets don't itemize' behavior is documented but could still read as invented to a skeptical recipient
  - Legacy-column fallback branch (pre-migration partners schema) silently coerces partner_type to hospice — dead code once migrations are confirmed applied; worth pruning then
checks:
  - Confirm PARTNER_DIGEST_ENABLED is unset/false in Vercel prod until the pilot starts (cron returns disabled:true)
  - Cron auth: GET without bearer → 401; with wrong bearer → 401
  - Admin dry-run ?test=<id> as a non-admin session → denied; as admin → renders wouldSend honestly (active + recipient + activity all required)
  - Verify shouldSendDigest skips zero-activity partners (no noise emails) and the small-sample email never contains a dollar figure
  - Confirm vercel.json cron entry (0 15 1 * *) matches the code's period math (anchor-to-1st guard)

### /for-funeral-homes + /funeral-home-opt-out — supply-side transparency  [L3]  state=built-live; opt-out is functional (HMAC token via lib/negotiation/email-body.ts) but essentially unexercised — OUTREACH_LIVE has never been on
paths: app/for-funeral-homes/page.tsx, app/funeral-home-opt-out/page.tsx
purpose: The page a funeral home lands on after receiving outreach (what we are, no commissions, family signs directly) and the tokenized one-click opt-out that deactivates the home in the directory.
risks:
  - OPT-OUT IS A GET WITH A DB WRITE: mail-scanner link prefetch (Outlook SafeLinks etc.) can silently opt a home out the moment the outreach email is delivered — before a human reads it. When OUTREACH_LIVE turns on this could zero the vetted directory; needs a confirm-button POST step
  - 'We're funded by the institutions we partner with' — present-tense funding claim with zero paying institutions (same issue as tell-your-hospice); a hostile FD or journalist can check
  - Page promises 'every email includes a one-click opt-out link in the footer' and 'removed within one business day' — both must be verified against the actual outreach template before any live send
  - Describes reply routing via advocate+…@reply.honestfuneral.co — Postmark inbound must actually work before this page's flow description is true
checks:
  - Generate a real opt-out URL from lib/negotiation/email-body.ts for a test home and load it — verify idempotent deactivation + success copy; tampered token → invalid
  - PRIORITY: decide the GET-side-effect fix (interstitial confirm) before OUTREACH_LIVE ever flips
  - Grep the outreach email template for the opt-out footer link and confirm subject-line WB- reference format matches this page's description
  - Send a test reply through Postmark inbound to advocate+<id>@reply.honestfuneral.co and confirm ingestion
  - Review the 'funded by the institutions we partner with' present-tense claim with the founder

### lib/stripe.ts — institutional billing scaffolding  [L3]  state=dormant-awaiting-Day-8 — no checkout, webhook, or billing route exists anywhere; only fmtCents is imported (by family display surfaces and the quote-notifications cron)
paths: lib/stripe.ts
purpose: Dormant Stripe client + fmtCents formatter; explicitly reserved for future institutional billing (per-facility annual), never a family charge.
risks:
  - The revenue layer literally does not exist yet: a hospice saying yes tomorrow has no way to pay — Day 8 (Migration B + Stripe institutional product, prices from BUSINESS_PLAN §7.3) is the named gate
  - fmtCents living in stripe.ts couples display formatting to the Stripe module — cosmetic, but means 'stripe' greps hit six family files
checks:
  - Confirm no route imports stripe() (only fmtCents) — i.e., no charge path exists in prod today
  - Confirm STRIPE_SECRET_KEY in prod is scoped/live-mode as intended and unused pending Day 8
  - When Day 8 lands: verify pricing matches the founder's §7.3 decision and that nothing bills a family (guardrail #2 regression grep)

### /api/planning/signup — email capture + welcome email  [L3]  state=built-live (predates the L3 sprint; the nurture cron consumes it)
paths: app/api/planning/signup/route.ts
purpose: Stores planning_signups (email + source + zip + hashed IP) from EmailCaptureForm/CheatSheetForm and sends the source-keyed welcome email — the nurture-list entry point feeding admission-week reach.
risks:
  - No rate limit on this POST (unlike every partner endpoint) — an abuser can pump the welcome-email sender at Resend's cost and spam arbitrary addresses; proxy-level limits may cover it, verify
  - Duplicate-insert errors are treated as success (deliberate) but any other DB error 500s with the email already possibly sent — minor ordering nit (email only sends after insert, so fine)
checks:
  - Verify a rate limit exists somewhere on this path (proxy.ts RATE_LIMITS or in-route) — if not, add one before any traffic push
  - Submit a duplicate email — expect ok:true, no second row, and confirm whether a second welcome email goes out (it does — decide if that's acceptable)
  - Confirm welcome email content for each live `source` value matches current free-to-family positioning


## adminMap
NOTES: AUTH GATE CONSISTENCY — VERIFIED CLEAN: all 9 /admin pages call requireAdminPage and all 5 /api/admin routes call requireAdminApi before any DB access; the two admin APIs outside the namespace (/api/negotiate/preview, /api/negotiate/preview-selection) and the cron fallback (/api/cron/partner-digest) are also gated. No ungated admin surface found. SERVICE-ROLE KEY: instantiated only in server components and route handlers via requireServer(\"SUPABASE_SERVICE_ROLE_KEY\"); client components receive plain data props — no key exposure path found. THE ONE SYSTEMIC RISK is upstream of every tool: lib/admin.ts is permissive-by-default (ADMIN_EMAILS unset → any logged-in user is admin) and lib/env.ts only enforces it when OUTREACH_LIVE=true, which is deliberately off — so the site-wide audit's first live probe should be confirming ADMIN_EMAILS is set in Vercel prod and that a non-admin session 404s on /admin/outcomes (family data) and 403s on /api/admin/benchmarks/promote (public-number publication) and /api/admin/partners (sends a real email on approve). FOUNDER WEEKLY vs FORGOTTEN: weekly-relevant now = partners (leads/approvals — the 90-day goal), ingest-gpl + benchmarks (the data-moat feeder + publish gate), ai-costs (glance); built-and-waiting = outcomes, messages, vetting (dormant until real cases / outreach resume); built-and-forgotten candidates = outreach-preview (stale paywall-era copy proves it) and faith-qa (parked since 2026-05-21 with a reviewer-access model conflict). TEST COVERAGE: route tests exist for promote, ingest-gpl, outcomes; NONE for funeral-homes (which also leaks raw Postgres error messages) or partners (which sends live email on approve) — the two least-tested admin writes are the two with real-world side effects. Minor hygiene: PartnersClient hardcodes https://honestfuneral.co (rename hazard, brand-constant rule); vetting localStorage key uses the legacy 'wb_' prefix; robots.ts doesn't disallow /admin (per-page noindex only). All reads grounded in the files cited per surface; no edits made.
ORPHANS: ["lib/suppression.ts \u2014 exported helpers imported by zero files; the cookie it manages is set by proxy.ts but read by nothing", "components/CommercialSuppressionNotice.tsx \u2014 defined, never rendered anywhere; the only reference to /api/suppression/clear", "app/api/suppression/clear/route.ts \u2014 serves a form that no page renders (functional but unreachable through the UI)", "app/admin/outreach-preview/PreviewForm.tsx \u2014 contradictory copy: describes the family 'selects them and pays' though the consumer payment was decommissioned 2026-06-26 (guardrail #2)", "No /admin index page exists (app/admin/page.tsx missing) \u2014 nine tools with almost no cross-links (only ingest-gpl\u2192benchmarks); the founder must remember nine URLs, a real weekly-workflow gap", "partner_leads.handled_at \u2014 selected by /admin/partners but never displayed and has no write path; vestigial column in the desk workflow", "lib/assignees.ts \u2014 listed in the admin brief but is NOT an admin lib: imported only by family-facing app/vault/Vault.tsx, app/notifications/Notifications.tsx, and components/AssigneeFilter.tsx (belongs to the family-flow surface map)"]

### Admin auth gate (requireAdminPage/requireAdminApi + ADMIN_EMAILS allowlist)  [admin]  state=built-live
paths: lib/admin-auth.ts, lib/admin.ts, lib/__tests__/admin-auth.test.ts, lib/__tests__/admin.test.ts
purpose: Single session-based gate for every internal tool: logged-in Supabase session whose email is on the ADMIN_EMAILS allowlist; pages redirect-anon/404-non-admin, APIs 401/403.
risks:
  - PERMISSIVE-BY-DEFAULT: isAdminEmail() returns true for ANY logged-in user when ADMIN_EMAILS is unset (lib/admin.ts line 34). lib/env.ts only requires it when OUTREACH_LIVE=true (line 75), and OUTREACH_LIVE is deliberately off — so prod may be running with every registered family able to open /admin/outcomes (family case data), approve partners, and publish benchmarks.
  - Only /admin/faith-qa renders the 'open to any logged-in user' warning banner (it alone receives adminAllowlistConfigured()); the other 8 admin pages give no visual signal when the allowlist is unconfigured.
  - robots.ts does not disallow /admin/ — protection rests entirely on per-page noindex metadata plus the auth gate (all 9 pages do set robots noindex; acceptable but worth knowing).
checks:
  - CRITICAL: verify ADMIN_EMAILS is actually set in the Vercel prod env (walkbeside project). Then live-probe: log into honestfuneral.co with a non-admin test account and GET /admin/vetting (expect 404), POST /api/admin/benchmarks/promote (expect 403), GET /admin/outcomes (expect 404).
  - Probe /admin/vetting anonymously — expect redirect to /login?next=/admin/vetting, not a render.
  - Grep-gate check for future drift: every file under app/admin/*/page.tsx must call requireAdminPage and every app/api/admin/*/route.ts must call requireAdminApi before any DB read (verified true today — including the two out-of-namespace admin APIs /api/negotiate/preview and /api/negotiate/preview-selection).

### Benchmark pipeline + promote gate (guardrail #4 enforcement)  [admin]  state=built-live (prod regional_benchmarks probed empty at Day-7 merge — pipeline live but nothing promoted yet)
paths: app/admin/benchmarks/page.tsx, app/admin/benchmarks/PromoteForm.tsx, app/api/admin/benchmarks/promote/route.ts, lib/benchmark-pipeline.ts, lib/benchmark-sources.ts, lib/benchmarks-store.ts
purpose: The founder's publish gate for the data moat: aggregates de-identified checker analyses + real outreach quotes into observed price distributions, proposes CODE benchmark changes as PR specs only, and promotes metro groups to the public verified/community DATA tier behind a server-recomputed n≥5 gate with no override parameter.
risks:
  - This is the direct write path into publicly citable numbers (Fair-Price Index, ISR city pages) — combined with the ADMIN_EMAILS permissive default it is the single worst guardrail-#4 exposure on the site.
  - PromoteForm defaults tier to 'verified' — a founder rushing could publish a community-quality sample as 'verified'; the n-gate doesn't distinguish source quality (page copy tells the founder to eyeball the checker-vs-quotes mix, but nothing enforces it).
  - Scope selector offers state/zip3 but the route 422s anything non-metro ('metro-scoped this week') — dead options in the UI that will confuse a future promote session.
  - Version field is free-text with a regex; re-promotion requires a manual v1→v2 bump — a same-version 409 is handled, but the default '2026-07-v1' will go stale next month.
  - benchmarks-store re-enforces publishability at the read edge (n≥5, catalog ids, one winner per key, price-text-stripped sources) precisely because the table has no CHECK constraint and hand-SQL inserts are an acknowledged workflow — any new read path must go through listActiveBenchmarks*, never raw table reads (memory: the Day-7 gate greps for zero raw-table literals).
checks:
  - Live: open /admin/benchmarks in prod — confirm it renders the current observation counts and that the founder-ingest rows from Day-2 GPL work appear with dedupeScope-per-document counting (n>1 for identical state death-cert fees across homes).
  - Functional: attempt a promote on an insufficient group via curl with a fabricated n in the body — expect the .strict() schema to 400 on the unexpected key; attempt an under-gate real group — expect 422 with the n message verbatim.
  - Content: verify the sanitizeSources price-regex behavior end-to-end — promote with a sources note containing '$1,395' and confirm the note is dropped from the public dataset payload.
  - Cross-check: any promoted row must surface on /fair-price-index and the matching /funeral-costs/[slug] within the ISR window (the route revalidates citySlugsForMetro + /fair-price-index best-effort).
  - Founder-workflow: this is a WEEKLY tool once GPL ingestion runs — check whether the promote flow has ever been exercised in prod (regional_benchmarks row count) and whether the pipeline's staff-exclusion (partner_members filter in benchmark-sources.ts) correctly excludes the demo-org accounts.

### Founder GPL ingest  [admin]  state=built-live (merged Day 2, PR #162; adversarial review fixed the dedupe-collapse bug)
paths: app/admin/ingest-gpl/page.tsx, app/admin/ingest-gpl/IngestClient.tsx, app/api/admin/ingest-gpl/route.ts, app/api/admin/ingest-gpl/__tests__/route.test.ts
purpose: Paste or photograph a home's published General Price List, review the parsed items (human gate), save as a founder_ingest price_list_analyses row feeding the benchmark groups; a source URL also stamps gpl_url/last_verified_at on an unambiguously matched home.
risks:
  - Deliberate code DUPLICATE of the analyzer's extraction mapping (documented in the route header) — the two can drift; a prompt-contract change to priceListAnalysisSystem() must be checked against BOTH consumers and the eval harness.
  - Photo path rides the PUBLIC /api/extract-price-list-image endpoint (not admin-gated, by design — it serves the family analyzer too); admin usage shares its rate-limit budget.
  - Ingesting while signed in as an active partner member silently excludes the rows from the benchmark pipeline (staff exclusion) — the page warns in prose, but nothing blocks it; a founder using the wrong account wastes a session's data.
  - ilike matching for the gpl_url stamp is metacharacter-escaped (incl. the PostgREST * rewrite) — good — but name+zip ambiguity just warns; homes never stamped accumulate silently.
checks:
  - Functional: run one real GPL through parse→review→save in prod; confirm the row lands with extraction_method='founder_ingest', appears in /admin/benchmarks with per-document dedupe, and the home's gpl_url/last_verified_at stamped on exact match.
  - Edge: save with a home name matching two directory rows — expect the analysis saved plus the 'more than one home' warning, no stamp.
  - Data hygiene: count founder_ingest rows in prod vs the sprint's GPL-collection goals — this tool IS the data-moat feeder; zero rows since Day 2 means the moat isn't accumulating (that's a use finding, not a bug).
  - Verify redactContact() actually strips phone/email from raw_text on a saved row (family-data posture applies even to founder ingests).

### Partner desk (approvals + leads + unclaimed-referral safety net)  [admin]  state=built-unproven (zero real partners; degrades to an empty desk pre-migration)
paths: app/admin/partners/page.tsx, app/admin/partners/PartnersClient.tsx, app/api/admin/partners/route.ts
purpose: The human gate on every institutional money relationship (L3): approve/pause partner applications (activation seats the owner in partner_members and emails the portal + report-token links), triage demo requests and family hospice nominations, and spot coordinators whose referral codes sit unclaimed.
risks:
  - Approving a partner SENDS A LIVE EMAIL to the applicant (sendEmail in the route) — this is outside the OUTREACH_LIVE kill switch, which is correct (it's not a funeral home) but means an accidental approve-click emails a real institution; the window.confirm is the only brake.
  - PartnersClient.copyReportUrl hardcodes https://honestfuneral.co (line 61) instead of a brand/appUrl constant — breaks on rename and in preview environments (memory: lib/brand.ts BRAND-constant rule is law).
  - partner_leads.handled_at is selected but never displayed and has no write path — the leads strip has no 'mark handled' workflow, so the founder re-triages the same leads every visit as the list grows (100-row cap).
  - Approve emails the contact and seats them as owner using contact_email verbatim — a typo'd application email hands the portal to the wrong address; no confirmation of the address in the confirm dialog.
  - Channel-survival: the leads copy correctly says 'Never contact a nominated hospice's families' — verify that stays (it is the anti-Grace rule rendered as UI copy).
checks:
  - Functional: approve a throwaway test partner in prod — verify the approval email arrives, partner_members owner row is seated idempotently, /partner/r/[token] goes live, and pause reverses access without deleting approved_at.
  - Live: confirm the one known test partner_leads row situation (Day-6 memory says the test row was deleted) — desk should currently show real leads only.
  - Use: this is THE weekly tool for the 90-day goal (one hospice paying); check the founder can name what each pipeline stage (pilot/active/paused/archived) means operationally — the status Select writes but nothing downstream reads status except reporting.
  - Fix-check: replace the hardcoded honestfuneral.co with the app-URL constant before Rename Day.

### Outcomes instrumentation desk  [admin]  state=built-unproven (zero real cases have run through L2/L3)
paths: app/admin/outcomes/page.tsx, app/admin/outcomes/OutcomesClient.tsx, app/api/admin/outcomes/route.ts, app/api/admin/outcomes/__tests__/route.test.ts
purpose: Manual entry of what the family flow can't self-capture — chosen home, negotiated/paid figures, hidden fees, satisfaction, benefit dollars recovered — plus partner tagging that feeds the L3 proof report; the raw material of the outcomes moat.
risks:
  - Reads full family case data (negotiations, negotiation_outreach, AI-parsed quote proposals) via service role — the surface most exposed by the ADMIN_EMAILS permissive default.
  - The hasRealOutcomeField guard (partner-tag alone must not stamp outcome_recorded_at) is a documented 2026-07-01 audit fix and load-bearing for honest partner reports — a regression here silently pollutes the pilot's proof numbers.
  - 'Total savings vs listed' pill sums a DB-generated column across all 500 fetched cases — once test cases exist alongside real ones there is no exclusion mechanism (no is_test flag), so the founder's headline number can be inflated by their own tests.
  - 500-case / joined-outreach fetch is unpaginated — fine for years at current volume, but the untagged-recorded warning silently misses cases beyond the window.
checks:
  - Functional: on a test negotiation, tag a partner ONLY — verify outcome_recorded_at stays null and the case does NOT count as completed on the partner report; then add amount paid — verify the stamp appears and savings_vs_listed_cents computes in the DB, not the client.
  - Functional: mark home B chosen after home A — verify A's chosen flips false (one-chosen-per-case invariant via the sibling-clear update).
  - Verify AI quote proposals render read-only (no confirm button here — family's /status click is the only confirmation path, per the anti-steering posture).
  - Use: currently a built-and-waiting tool — it becomes weekly the day the first pilot case runs; the audit question is whether the founder knows the entry workflow cold (it is the pilot's data-capture SLA).

### Funeral-home vetting desk  [admin]  state=built-live, dormant (outreach is off; last heavy use was the Utah 193-home import era)
paths: app/admin/vetting/page.tsx, app/admin/vetting/VettingClient.tsx, app/api/admin/funeral-homes/route.ts
purpose: Human review gate on the outreach directory: approve (vetted+active), reject, reset, or fix email/notes on imported homes — enforcing 'only vetted homes are ever contacted' (lib/negotiation/directory.ts requires active AND vetted).
risks:
  - No route test exists for /api/admin/funeral-homes (unlike promote/ingest/outcomes) — the approve/reject patch matrix is untested at the route level.
  - Raw Postgres error.message is returned to the client on update failure (route line 79) — inconsistent with the sanitized-error posture of the promote/ingest routes (leaks schema detail to any admin-session caller; low severity given the gate).
  - Reviewer attribution is free-text from localStorage (wb_vetting_reviewer — stale 'wb'/walkbeside prefix), defaulting to 'admin' — vetted_by is not tied to the session email requireAdminPage already returns.
  - 5,000-row page load with no pagination — fine at current directory size, will degrade on a national import.
checks:
  - Functional: approve→reject→reset a test home and confirm vetted/active/vetted_at/vetted_by transitions match the route's documented matrix; confirm a 'save' action changes email/notes without touching vetting status.
  - Invariant: after any admin action, confirm lib/negotiation/directory.ts still only surfaces active=true AND vetted=true homes (the kill-switch-adjacent invariant this desk exists to feed).
  - Content: page copy claims 'unreviewed imports are never contacted, even with the live switch on' — verify that matches directory.ts behavior verbatim (it does today; keep it true).
  - Use: dormant-by-design while OUTREACH_LIVE is off — flag as weekly-relevant only when outreach or a metro directory import resumes.

### AI cost ledger  [admin]  state=built-live
paths: app/admin/ai-costs/page.tsx, lib/ai-costs.ts, lib/__tests__/ai-costs.test.ts
purpose: Feature-by-day triage view over api_cost_events (every lib/claude.ts call logs one row) with per-event, per-model estimated USD — exists to spot a runaway feature, explicitly not invoice reconciliation.
risks:
  - Rate table is hand-maintained (sonnet-5 intro pricing hardcoded through 2026-08-31; unknown models fall back to the most expensive tier so estimates only over-read — deliberate and correct, but the table needs a touch when models rotate after Sept 1).
  - Cache-WRITE premium is not itemized in the ledger (documented) — estimates skew low if prompt caching ever becomes active (currently a no-op per the business-plan memory, prompts under the 2048-token minimum).
  - 10k-event fetch window: at high volume the '14 most recent active days' silently shrinks — acceptable for triage, worth knowing during a traffic spike.
checks:
  - Live: open /admin/ai-costs in prod and sanity-check the estimate against the Anthropic console for the same window (should over-read or match, never under-read).
  - Confirm every Claude-calling feature string appears (analyzer-extract, founder-ingest, digest, inbound parse…) — a feature missing from the ledger means a call path bypassing lib/claude.ts recordUsage.
  - Calendar check: after 2026-08-31 verify SONNET_5_INTRO_END rollover prices old rows at intro and new rows at sticker (the day-of-call pricing rule).
  - Use: genuinely weekly-glance material; cheap to keep.

### Inbound FD messages viewer  [admin]  state=built-unproven (no real outreach has run; will show only test traffic)
paths: app/admin/messages/page.tsx
purpose: Read-only last-100 view of funeral-home replies arriving via Postmark Inbound, joined to their negotiation and outreach rows, with unmatched-sender triage warnings.
risks:
  - Renders raw inbound body_text from external senders inside a <pre> — React escapes it so no XSS, but full un-redacted external email content (incl. any contact info or hostile text) is displayed to whoever passes the admin gate; same ADMIN_EMAILS exposure as outcomes.
  - Copy says the family /status page 'auto-refreshes every 6 seconds' — a live-behavior claim that should be re-verified against the current status page before trusting this page's guidance.
  - Read-only with no triage state (no read/handled flag) — at real volume the founder re-reads the same 100 messages.
checks:
  - Functional: send a test email to the Postmark inbound address from a known outreach sender and from an unknown address — verify matched rendering vs the 'Unmatched sender / triage manually' warning.
  - Verify the 6-second /status auto-refresh claim still matches the family status page implementation.
  - Use: dormant until OUTREACH_LIVE; classify as built-and-waiting, not forgotten.

### Outreach email preview  [admin]  state=legacy-suspect (works, but copy has drifted from the current model)
paths: app/admin/outreach-preview/page.tsx, app/admin/outreach-preview/PreviewForm.tsx, app/api/negotiate/preview/route.ts, app/api/negotiate/preview-selection/route.ts
purpose: Render-only preview of the exact outreach and selection emails a funeral home would receive (no DB write, no send) for refining outbound copy before the live switch ever flips.
risks:
  - STALE COPY: the selection-mode help text says the email goes out 'after the family selects them and pays' (PreviewForm.tsx lines 225-228) — the consumer payment was fully decommissioned 2026-06-26 (guardrail #2); an internal tool describing a dead payment step is drift evidence and would confuse any future collaborator.
  - Its two APIs live OUTSIDE /api/admin (app/api/negotiate/preview*) — they ARE requireAdminApi-gated (verified), but the namespace split means a future 'gate every /api/admin route' sweep would miss them; note them in any gate checklist.
  - The outreach mode can pull a real home's name+email from the directory into the preview — display only, no send path, kill switch untouched.
checks:
  - Content: fix or flag the 'and pays' sentence; re-read both rendered email bodies against the canonical 3-touch referral-reputation sequence (business-plan v2 resolved outreach-copy drift — confirm these templates match lib/negotiation/email-body.ts current output).
  - Functional: render both modes in prod; confirm zero rows appear in negotiation_outreach afterward (preview must be write-free).
  - Auth: curl POST /api/negotiate/preview anonymously — expect 401.
  - Use: built-and-forgotten candidate — last meaningfully used in the outreach-copy era; keep only if outreach copy work resumes, and update its copy when it does.

### Faith content QA review  [admin]  state=built, waiting on a human reviewer since 2026-05-21 (AI-adversarial pass done; clergy sign-off still outstanding)
paths: app/admin/faith-qa/page.tsx, app/admin/faith-qa/FaithQAReview.tsx
purpose: One-pass review surface over every faith claim in lib/faith-traditions.ts so a domain expert (clergy/FD advisor) can mark each profile ok/needs-change with notes; the pending human sign-off gate on faith content.
risks:
  - Review state lives ONLY in the reviewer's browser localStorage (hf-faithqa-v1) — a clergy advisor's completed pass is one cleared cache away from gone; the only export is a clipboard copyReport.
  - It is the only admin page that surfaces the ADMIN_EMAILS-unconfigured warning — good, but that banner should arguably exist on the pages holding family data instead.
  - The user job (external domain expert) conflicts with the gate (ADMIN_EMAILS allowlist): giving a clergy reviewer access means adding them to the admin allowlist, which also opens /admin/outcomes family data to them. Workflow gap worth resolving before recruiting the reviewer.
checks:
  - Confirm the live faith pages still carry the not-yet-clergy-verified disclaimers as long as this review is incomplete (memory: disclaimers live meanwhile).
  - Decide the reviewer-access model before inviting anyone: either a scoped share (export the content) or accept allowlist access — do not silently add an outsider to ADMIN_EMAILS.
  - Use: parked-by-design, not forgotten — but it has been parked 14 months in product-time terms (May→July); either schedule the clergy pass or record the decision to defer.

### Commercial-suppression clear endpoint (orphaned half-system)  [L2]  state=dead on the read side — the cookie is SET by proxy.ts but NOTHING reads it: lib/suppression.ts is imported by zero files and CommercialSuppressionNotice is rendered by zero pages, so /api/suppression/clear serves a form that never appears; actual crisis suppression happens only within the crisis page itself (StepList showCommercialCta=false)
paths: app/api/suppression/clear/route.ts, lib/suppression.ts, components/CommercialSuppressionNotice.tsx, proxy.ts
purpose: Intended: after a family hits the unexpected-death-at-home crisis flow, hide commercial/pricing paths for 4 hours (cookie set by proxy.ts on /guidance/home-unexpected), with a notice + clear button to opt back in.
risks:
  - The intended site-wide suppression (a compassionate-UX and optics feature: no upsell to someone who just found a body) silently doesn't exist beyond the crisis page itself — either wire the readers (isCommercialSuppressed on /prices, /analyzer, homepage lanes) or delete the cookie write, the lib, the component, and the endpoint.
  - The clear endpoint itself is unauthenticated but harmless (deletes the requester's own cookie; redirect target sanitized by SAFE_PATH regex — no open redirect).
checks:
  - Live: visit /guidance/home-unexpected in prod, confirm the cookie is set, then visit /prices — confirm (currently) NO suppression occurs; that mismatch is the finding.
  - Decision check for the audit plan: revive or remove — half-shipped safety features are worse than either state.
  - If removed: delete proxy.ts lines 31-38, lib/suppression.ts, components/CommercialSuppressionNotice.tsx, app/api/suppression/clear/.


## apiData
NOTES: MIGRATION LEDGER (repo has schema.sql + 24 migrations, newest 2026-07-20): per docs/SPRINT_DAYS_5-9_BUILDSHEETS.md:591 and session memory, EVERYTHING through 2026-07-17-regional-benchmarks plus Migration A (2026-07-20-hospices-consent.sql) is applied to prod project bhadjv — Migration A applied at the Day-4 morning gate with hospice search verified live (this supersedes the older Day-3 memory note saying it was unapplied). Migration B (partner-billing, Day 8) is NOT YET WRITTEN — no migration file post-2026-07-20 exists; it will add billing columns to partners and must be filename-dated to its real apply day. VERIFY.sql is the authoritative applied-state probe (19 tables, 7 deny-all with policies=0). regional_benchmarks: table APPLIED but ROW-EMPTY in prod (Day-7 gate probe) — every price surface currently runs the modeled tier; hospices: POPULATED (~6,852 rows, CA=2,062). DEGRADATION MATRIX (table empty/missing → behavior): hospices → state pages render honest 'directory unavailable'/un-counted metadata, search returns [] (empty-success and failure deliberately degrade identically in indexed titles); regional_benchmarks → modeled tier everywhere via try/catch-to-empty in lib/benchmarks-store.ts, EXCEPT /api/fair-price-index/data which uses the OrThrow variant so failure ≠ empty; funeral_homes unvetted/empty → outreach eligibility (active AND vetted AND email) yields nothing contactable; price_list_analyses pre-consent-column → analyzer legacy re-insert ONLY when contributed===true (declined analyses never persist — load-bearing); partner tables missing → best-effort attribution never fails the family flow; household_links missing → /family card reports link unavailable; api_cost_events write failure → never blocks a user call (cost ledger is a floor). RLS MATRIX: owner-scoped auth.uid() = profiles, tasks, negotiations, negotiation_outreach, negotiation_messages (read + outbound_to_fd insert only, no update/delete), price_list_analyses, cert_trackers, obituaries; public-with-column-grants = funeral_homes (active rows; notes/vetted_by/vetted_at/website/gpl_url/last_verified_at NOT granted), share_links (non-expired read, update grant = opened_at only); anon insert-only = planning_signups; deny-all service-role-only = partners, partner_codes, partner_members, partner_leads, api_cost_events, regional_benchmarks, hospices, household_links. CROSS-CUTTING AUDIT PRIORITIES: (1) anon-key probe suite across all 19 tables is cheap and decisive; (2) the two guardrail-#4 chokepoints are lib/benchmarks-store.ts read-edge filters (n>=5, catalog ids, price-text scrub) and the honest-empty rendering of hospice/city/index pages while data is sparse; (3) demo-seed data lives in prod tables with only a marker separating it from real partner metrics — verify exclusion everywhere aggregates are shown; (4) anti-steering is enforced by comments+greps, not schema — re-grep choose/outreach/ranking for partner_* reads each audit. Static-content libs are the CONTENT-criterion hotspot: merp/body-care have adversarial audit trails; probate thresholds and cemetery vendor listings are the least-defended public claims in the data layer.
ORPHANS: ["supabase/seed/README.md \u2014 'demo intentionally stops before the Stripe charge' describes the decommissioned $49 consumer payment (guardrail #2); stale since 2026-06-25.", "Legacy paywall columns still defined in schema/migrations and re-created by BOOTSTRAP.sql: profiles.paid_at, profiles.stripe_customer_id (2026-05-08-margaret-paywall.sql), negotiations.fee_cents / stripe_setup_intent_id / stripe_payment_intent_id / unlocked_at, status 'pending_payment' (supabase/schema.sql) \u2014 nothing writes them; documented as legacy reads only.", "supabase/schema.sql:1 header 'Walk Beside' \u2014 pre-rename project name relic.", "profiles_anniversary_idx (paid_at-based partial index) \u2014 superseded by profiles_bereavement_idx (2026-07-01-bereavement-cadence.sql keeps it deliberately, but it indexes a dead column).", "docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md \u00a7DAY 6 (old Migration B spec) \u2014 explicitly superseded by docs/SPRINT_DAYS_5-9_BUILDSHEETS.md ('never execute from it'), still present in-tree.", "lib/partner-auth.ts vs lib/partner/auth.ts \u2014 two partner-auth modules both reading partners; confirm the top-level one (token-based, pre-portal) isn't dead after the 2026-07-13 portal-identity seat model.", "cemetery-vendors.ts ftcVerified flag \u2014 defined but apparently never set on any entry; TODO-FD re-verification never happened.", "probate-by-state.ts TODO-FD review note (line 8) \u2014 top-10-state thresholds ($184,500 CA etc.) have no findings-doc audit trail unlike MERP/body-care siblings."]

### Migration chain + bootstrap (schema.sql, 24 migrations, BOOTSTRAP/VERIFY)  [infra]  state=built-live — per docs/SPRINT_DAYS_5-9_BUILDSHEETS.md:591 + memory: ALL migrations through 2026-07-20-hospices-consent.sql (Migration A) are applied to prod (bhadjv); Migration A applied at the Day-4 morning gate. Migration B (partner-billing, Day 8) does NOT exist as a file yet — the newest migration in the repo is 2026-07-20.
paths: supabase/schema.sql, supabase/migrations/, supabase/BOOTSTRAP.sql, supabase/VERIFY.sql, scripts/build-bootstrap-sql.mjs
purpose: Single idempotent DB definition: schema.sql + 24 date-ordered migrations concatenated into BOOTSTRAP.sql, with VERIFY.sql as the authoritative applied-state check (19 tables, all RLS-enabled; 7 deny-all tables expect policies=0).
risks:
  - Legacy paywall artifacts persist in the schema: profiles.paid_at/stripe_customer_id (2026-05-08-margaret-paywall.sql), negotiations.fee_cents/stripe_setup_intent_id/stripe_payment_intent_id/unlocked_at, status enum 'pending_payment' (schema.sql:75-80). Nothing writes them since decommission — harmless but they contradict the free-to-families model on paper and will confuse auditors of BOOTSTRAP.sql.
  - schema.sql:1 header still says 'Walk Beside' (pre-rename project name) — cosmetic drift.
  - BOOTSTRAP.sql must be regenerated after any new migration (bootstrap-regen requirement in memory); a stale BOOTSTRAP silently omits the newest migration for a fresh project.
  - regional_benchmarks has no CHECK constraint on n_data_points — the n>=5 guardrail is enforced only in app code at read edges (deliberate, but a raw SQL insert can create an unpublishable row that only code filters keep private).
checks:
  - Run supabase/VERIFY.sql in the bhadjv SQL editor: expect 19 tables all rls_enabled=true; partners/partner_codes/partner_members/partner_leads/api_cost_events/regional_benchmarks/hospices at policies=0; hospices-consent block returns 7 rows; portal-identity block returns 8 rows.
  - diff BOOTSTRAP.sql against `node scripts/build-bootstrap-sql.mjs` output to confirm it embeds all 24 migrations (last section = 2026-07-20-hospices-consent.sql).
  - Confirm no migration file dated after 2026-07-20 exists before Day 8 lands, then confirm Migration B is filename-dated to its real apply day (docs/SPRINT_DAYS_5-9_BUILDSHEETS.md:446).
  - Probe prod information_schema for price_list_analyses.contributed and hospices.ccn to independently confirm Migration A applied (memory Day-3 said NOT applied; later docs say applied — verify, don't trust either).

### Supabase client layer (anon/SSR/service-role split)  [infra]  state=built-live
paths: lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/middleware.ts
purpose: Three clients: browser anon, SSR cookie-session (RLS enforced as the signed-in family), and middleware session refresh; service-role clients are created ad hoc in server-only libs (benchmarks-store, hospice-directory, partner/*, admin routes).
risks:
  - middleware.ts silently no-ops when PUBLIC env vars are missing — a misconfigured deploy degrades to no session refresh rather than erroring (safe but invisible).
  - Service-role client creation is scattered (at least 8 call sites) rather than one factory — each new site must independently remember `import "server-only"`; lib/hospice-directory.ts and lib/benchmarks-store.ts do it correctly.
checks:
  - grep for createServiceClient/SUPABASE_SERVICE_ROLE_KEY across app/ and confirm every file importing it is server-only (no 'use client' file touches the service key).
  - With only the anon key, attempt REST selects against negotiations, price_list_analyses, partners, hospices, regional_benchmarks, household_links — all must return empty/denied.

### hospices table + CMS directory reads (finder, /hospices/[state], partner-apply autocomplete)  [L1]  state=built-live — imported 2026-07-20 (DIRECTORY_AS_OF='July 2026' hardcoded at lib/hospice-directory.ts:34); CA renders 2,062 rows live per Day-6 memory.
paths: supabase/migrations/2026-07-20-hospices-consent.sql, lib/hospice-directory.ts, app/api/hospices/search/route.ts, app/hospices/[state]/page.tsx, scripts/import-hospices.mjs
purpose: Public CMS reference data (dataset yc9t-dgbk, ~6,852 rows) powering the top of the partner funnel — homepage hospice finder, /partners apply autocomplete, 51 /hospices/[state] SEO pages. Never a contact list; no family data near it.
risks:
  - DIRECTORY_AS_OF is a hardcoded snapshot with no automated refresh — CMS refreshes ~quarterly, so by ~Oct 2026 the pages cite stale data; the import deliberately KEEPS rows CMS drops (closures persist in the directory).
  - Degradation is honest by design: null read AND empty-but-successful read both suppress counts from indexed metadata (app/hospices/[state]/page.tsx:55-57) — but only if the empty-state branch keeps working; a regression here re-creates the Day-6 'all 0' indexed-title bug.
  - CCN is a zero-padded, possibly alphanumeric string ('011500', 'A01640') — any future code that Number()s it corrupts the key.
  - /api/hospices/search is public + service-role-backed; its only guard is the in-route 30/min IP rate limit (proxy limiter covers POSTs only).
checks:
  - Prod probe: `select count(*) from hospices` — expect ~6,852; `select count(*) from hospices where state='CA'` — expect 2,062.
  - Live: GET /api/hospices/search?q=trinity returns results; 31 rapid requests from one IP → 429 with Retry-After; q of 1 char → 400.
  - Live: /hospices/california title contains the row count; a state with rows=0 (or simulated read failure) must render the un-counted title variant — never 'all 0'.
  - Anon-key REST select on hospices → denied (RLS deny-all, service-role only).
  - Verify hospice CCN links from /hospices/[state] to the facility claim flow resolve (Day-6 claim POST rate-limits at 6th attempt).

### regional_benchmarks + benchmark store (Fair-Price Index data spine)  [L1]  state=degraded-awaiting-data — migration applied but table probed EMPTY in prod at Day-7 gate (Branch B); every zip currently resolves to the modeled tier. Guardrail #4 machinery (n>=5 re-check, catalog-id filter, price-like-text scrub of sources, dedupe of duplicate active rows) is all live and pinned by tests.
paths: supabase/migrations/2026-07-17-regional-benchmarks.sql, lib/benchmarks-store.ts, lib/verified-metros.ts, lib/verified-local-prices.ts, lib/fair-price-dataset.ts, app/fair-price-index/page.tsx
purpose: Founder-promoted per-region overrides (verified/community tiers) of the modeled catalog — the citable data-moat asset behind the Fair-Price Index, city pages, analyzer tier labeling, and /funeral-homes/[zip].
risks:
  - Empty table means the Index's 'verified metros' section and city-page verified tables render their empty/modeled states everywhere — audit must confirm those states read as honest, not broken.
  - n>=5 (SMALL_SAMPLE_THRESHOLD) is enforced at read edges because the table has no CHECK — any NEW read path that queries regional_benchmarks directly instead of via benchmarks-store bypasses the guardrail (gate grep: zero raw-table literals outside the store, per Day-7 memory).
  - listActiveBenchmarksOrThrow vs listActiveBenchmarks: the data endpoint deliberately throws so a store failure is distinguishable from an empty dataset — swapping them would publish a false-empty citable dataset.
  - metro scope_value must EXACTLY equal lib/zip-regions.ts metro labels — a label rename orphans promoted rows silently.
checks:
  - Prod probe: `select count(*) from regional_benchmarks` — currently expect 0; if >0, verify every row has n_data_points>=5 and line_item_id in the LINE_ITEMS catalog.
  - Live: GET /api/fair-price-index/data — with the empty table it must return the modeled-catalog dataset (not 500, not fabricated verified rows); confirm response distinguishes empty from failure per the OrThrow contract.
  - Live: GET /api/benchmarks/tier?zip=84101 → tier 'modeled', n null.
  - Live: /fair-price-index and /funeral-costs/salt-lake-city render no 'verified' or 'real price lists' claims while the table is empty (guardrail #4 — no indefensible number).
  - grep app/ for `from("regional_benchmarks")` — only lib/benchmarks-store.ts and the admin promote route may hit the table directly.

### Benchmark raw feeds + contribute-consent (analyses/outreach → promotion pipeline)  [L2]  state=built-live — but starved: zero promotions have happened, so the pipeline is proven only in tests/dev.
paths: lib/benchmark-sources.ts, app/api/analyze-price-list/route.ts, app/api/admin/benchmarks/promote/route.ts, app/api/admin/ingest-gpl/route.ts
purpose: The data-moat intake: family checker analyses (consent-filtered `contributed !== false`) + itemized outreach quotes feed the n-gate that lets the founder promote defensible regional benchmarks.
risks:
  - LOAD-BEARING consent fallback (app/api/analyze-price-list/route.ts:341-361): on a pre-migration schema the legacy-shape re-insert runs ONLY when contributed===true — reverting this would silently persist declined analyses. Now that Migration A is applied the fallback should be dead code in prod, but it remains the safety floor.
  - founder_ingest rows dedupe per-document via dedupeScope (lib/benchmark-sources.ts:42-44) — reverting collapses n to 1 across homes (the Day-2 MAJOR bug).
  - Staff-exclusion degrades OPEN on partner_members fetch failure (lib/benchmark-sources.ts:73-77) — staff test uploads could inflate n on a transient error; founder review is the only backstop at promote time.
  - Feeds cap at limit(2000) newest-first — at scale, older consented contributions silently fall out of the aggregation window.
checks:
  - Prod probe: counts of price_list_analyses by contributed (null/true/false) and by extraction_method — confirms consent capture is really writing and how much is founder_ingest vs family.
  - Functional: run an analysis with the opt-in box unchecked while signed in → row persists with contributed=false AND is absent from /admin/benchmarks feed counts.
  - Verify /api/admin/benchmarks/promote refuses a promotion where recomputed n<5 (the server recomputes from the same feeds the page showed).
  - Confirm active partner_members' user_ids are excluded from the displayed n on /admin/benchmarks.

### Family case data (negotiations, negotiation_outreach, negotiation_messages, price_list_analyses, profiles, tasks, obituaries, cert_trackers)  [L2]  state=built-live, near-zero real volume (zero real cases through the full loop; demo/founder data only).
paths: supabase/schema.sql, supabase/migrations/2026-06-22-negotiation-outcomes.sql, supabase/migrations/2026-05-21-coordinator-messages.sql, supabase/migrations/2026-07-16-inbound-ai-parse.sql, app/dashboard/page.tsx, app/api/negotiate/start/route.ts
purpose: The instrumented family service — every case, quote, message, outcome, and satisfaction score. This is the outcomes dataset the whole company is built to accumulate.
risks:
  - RLS is the entire privacy story: owner-scoped `auth.uid()` policies on all eight tables; negotiation_messages has owner SELECT + owner INSERT restricted to direction='outbound_to_fd' only, no UPDATE/DELETE by design (audit log). Any new column inherits this; any new PUBLIC read of these tables is a violation.
  - negotiations.partner_id / partner_code are reporting labels structurally excluded from choose/outreach/ranking (anti-steering) — comments pin this contract but only greps enforce it.
  - AI-parse columns on negotiation_messages are proposal-only; ground truth requires the human-confirmed /api/negotiate/[id]/quote path (ai_confirmed_at). Conflating proposal with confirmed quote would publish unverified numbers.
  - savings_vs_listed_cents is a GENERATED column — any claim surfaced from it is arithmetically tied to inputs, good; but target_home_estimate_cents is family-reported and unverified.
checks:
  - Anon-key + a second test user's session: attempt to read another user's negotiations/analyses/messages → must return empty.
  - Verify negotiation_messages denies family UPDATE (attempt to edit a message as owner → denied).
  - Prod probes: negotiations count by status; negotiation_outreach count by status (expect dry_run rows only — OUTREACH_LIVE off); price_list_analyses total.
  - Confirm the one-chosen-home partial unique index holds (insert second chosen=true row for a negotiation via SQL → error).
  - grep app/api/negotiate/choose + lib/negotiation for partner_id/partner_code reads — must be zero (anti-steering structural check).

### funeral_homes directory + vetting gate  [L2]  state=built-live — public read of active rows with COLUMN-scoped grants (notes/vetted_by/vetted_at and the three 2026-07-17 provenance columns deliberately NOT granted to anon/authenticated); import always lands vetted=false.
paths: supabase/migrations/2026-04-25-v2-unlock-and-directory.sql, supabase/migrations/2026-06-03-funeral-home-vetting.sql, supabase/migrations/2026-06-09-rls-hardening.sql, lib/negotiation/directory.ts, scripts/import-funeral-homes.mjs, app/admin/vetting/page.tsx
purpose: The supply-side directory: which homes exist, which a human has vetted for contact, plus GPL provenance columns (website/gpl_url/last_verified_at) for the ingest track.
risks:
  - Column grants are the only thing hiding internal notes from the public anon key — a future `grant select` or a table recreate without re-running 2026-06-09-rls-hardening.sql re-exposes sister's vetting commentary.
  - Outreach eligibility = active AND vetted AND email present (lib/negotiation/directory.ts) — the single choke point CLAUDE.md marks as law; loosening it is the top operational risk.
  - Bounce/complaint webhook (app/api/inbound/resend-webhook) flips active=false — verify it can't be spoofed to mass-deactivate the directory.
checks:
  - Anon-key REST: select notes,vetted_by,vetted_at from funeral_homes → must error (column not granted); select name,city from funeral_homes → only active=true rows.
  - Prod probes: funeral_homes total, count(vetted=true), count(email is not null) — quantifies how contactable the directory actually is (Utah launch imported ~193).
  - Confirm scripts/import-funeral-homes.mjs --dry-run against prod reports update-in-place (no duplicate growth) on a re-run of the same CSV.
  - Verify the opt-out page path writes only through service role and flips active, never deletes.

### Partner/institutional tables (partners, partner_codes, partner_members, partner_leads)  [L3]  state=built-unproven — zero real cases have flowed through; all four tables RLS deny-all (service-role only) behind lib/partner/auth.ts and lib/admin-auth.ts gates. Migration B will add billing columns to partners.
paths: supabase/migrations/2026-06-27-partners.sql, supabase/migrations/2026-07-03-partner-codes.sql, supabase/migrations/2026-07-13-portal-identity.sql, lib/partner/auth.ts, lib/partner/report-data.ts, app/api/partner/apply/route.ts
purpose: The sellable product's data model: tenant orgs (report_token capability links), coordinator referral codes (aggregate counts only), portal sign-in seats, and inbound demo/claim leads.
risks:
  - partners.report_token is a bearer capability — rotation is the only revocation; verify the rotate route exists and works (app/api/portal/settings/rotate-token).
  - Self-serve apply writes active=false pending rows — the founder flip on /admin/partners is the human gate on every money relationship; confirm nothing else can activate a partner.
  - Coordinator surfaces must show COUNTS only (zero-visibility rule) — any leak of case detail/home names/prices onto /partner/r/[token] surfaces would breach both privacy and channel-survival rules.
  - partner_leads had one known test row (deleted, verified Day 6) — table should currently be near-empty; unexpected rows = real inbound leads going unhandled.
checks:
  - Anon-key REST select on all four tables → denied.
  - Prod probes: partners count by status/active (expect only demo orgs from seed-demo, if any); partner_leads count + handled_at nulls (unhandled real leads?); partner_members count.
  - Live: POST /api/partner/apply creates active=false row that is inert on report/links/resolve surfaces until founder activation.
  - Live: /partner/r/<invalid-token> → 404/denied; a valid token's links page shows per-code counts and nothing case-level.
  - After Day 8: verify BILLING_LIVE absent from prod env and no family-surface route imports the Stripe factory (lib/__tests__/billing-guardrails.test.ts is the pin).

### Anonymous sharing stores (share_links, household_links)  [L2]  state=built-live
paths: supabase/migrations/2026-05-05-margaret-share-links.sql, supabase/migrations/2026-06-09b-share-links-column-grant.sql, supabase/migrations/2026-07-03-household-links.sql, app/api/share/[id]/route.ts, app/api/household/service.ts, app/household/[id]/page.tsx
purpose: Two generations of family hand-off: share_links (7-day anonymous snapshot, UUID-is-the-auth, anon RLS read/insert with UPDATE grant limited to opened_at) and household_links (30-day rolling, deny-all + owner_secret through service-role API routes only).
risks:
  - share_links payload is a client-written JSONB blob readable by anyone with the UUID — acceptable by design (no PII in URL, unguessable id) but it means whatever a family puts in sessionStorage travels; audit what the snapshot actually contains.
  - household_links deliberately rejected the share_links pattern to protect owner_secret — a future 'convenience' anon policy on it would leak the mutation secret; policies must stay at zero.
  - Neither table has automated purge of expired rows — expired payloads persist in the DB (unreadable via API, still stored).
checks:
  - Anon-key REST: select on household_links → denied; select on share_links where expires_at past → empty; update share_links.payload as anon → denied (column grant), update opened_at on live row → allowed.
  - Live: /household/<rotated-old-slug> → dead after rotation; owner update without owner_secret → rejected.
  - Prod probe: counts + expired-row counts on both tables (storage hygiene, not a leak).

### Marketing/ops small tables (planning_signups, api_cost_events)  [infra]  state=built-live
paths: supabase/schema.sql, supabase/migrations/2026-05-16-nurture-emails.sql, supabase/migrations/2026-07-13-portal-identity.sql, app/api/cron/nurture-emails/route.ts, lib/claude.ts, app/admin/ai-costs/page.tsx
purpose: planning_signups: pre-need lead list (anon insert-only, nurture cron + unsubscribe); api_cost_events: per-Claude-call cost ledger written best-effort by lib/claude.ts, read on /admin/ai-costs.
risks:
  - planning_signups has NO select/update/delete policy for clients — unsubscribe and nurture writes go through service role; verify /unsubscribe and /api/account/delete really scrub the row.
  - api_cost_events failures never block user calls (by design) — meaning cost visibility can silently gap; treat /admin/ai-costs totals as a floor, not truth.
checks:
  - Anon-key REST: insert into planning_signups → allowed; select → denied.
  - Prod probe: planning_signups count + unsubscribed_at distribution (is nurture actually running? last_nurture_sent_at recency).
  - Prod probe: api_cost_events rows per feature over last 7 days vs known eval/product usage — detect a silent logging gap.

### Static verified-content data libs (state law, benefits, vendors)  [L1]  state=built-live, mixed verification maturity: merp-by-state and state-body-care follow a strict verified-cite-only rule (fallback to federal/national baseline; audit trails in docs/MERP_FINDINGS.md, docs/STATE_BODY_CARE_FINDINGS.md); veterans-benefits deliberately links out for dollar amounts (verified 2026-04-26); probate-by-state covers only top-10 states and carries an UNRESOLVED 'TODO-FD: review thresholds before sister sends to a real family' (lib/probate-by-state.ts:8); cemetery-vendors carries 'TODO-FD: every entry should be re-verified' with an ftcVerified flag that appears unset; body-donation-programs is explicitly 'representative, NOT exhaustive'.
paths: lib/merp-by-state.ts, lib/probate-by-state.ts, lib/state-body-care.ts, lib/veterans-benefits.ts, lib/body-donation-programs.ts, lib/cemetery-vendors.ts
purpose: Compiled-in content-as-data behind /medicaid-estate-recovery, /estate/[slug], /rights, /veterans, /body-donation, /headstone-vendors — the trust spine's factual claims, each file with its own provenance discipline.
risks:
  - probate-by-state hardcodes drift-prone numbers (CA $184,500 small-estate threshold, statutory fee tiers) with no verification audit trail file — weakest guardrail-#4 posture of the set.
  - cemetery-vendors lists real named businesses with phone/URL that change; a dead or wrong listing on /headstone-vendors damages trust directly.
  - veterans-benefits rule structure dated 'verified 2026-04-26' — 3 months old; VA rules move slowly but the file predates the whole B2B2C pivot's review cycles.
  - Both TODO-FD notes reference 'sister' — a positioning relic (locked decision: sister is not a cofounder; no FD-credential story), fine in code comments but shows the review debt is real.
checks:
  - Spot-verify 5 random VERIFIED_MERP and VERIFIED_RULES rows against current statute text (the provenance rule claims independent verification — test it).
  - Verify CA small-estate threshold ($184,500) and 2-3 other probate thresholds against current state code; check every authoritativeSources URL returns 200.
  - Call/HTTP-check 5 cemetery-vendors entries (site live, phone format valid); check body-donation program URLs.
  - Confirm every rendering surface carries the not-legal/medical-advice disclaimer these files' headers assume.
  - Confirm no page renders a VA dollar amount from code (the link-out-for-amounts rule).

### Data ops scripts (imports, demo seed)  [infra]  state=built-live (hospice import ran 2026-07-20; funeral-home import ran for Utah launch; demo seed used for walkthroughs)
paths: scripts/import-hospices.mjs, scripts/import-funeral-homes.mjs, scripts/seed-demo.mjs, supabase/seed/README.md, supabase/seed/demo-account.sql
purpose: Founder-run data machinery: CMS hospice import (CCN-string-safe, upsert-idempotent, dry-run/parse-only modes), funeral-home CSV import (never sets vetted), and the Johnson-family + Demo Hospice/Employer seed (idempotent, demo-marker-guarded against clobbering real partners).
risks:
  - seed-demo.mjs listUsers reads page 1 / perPage 200 only — silently mis-finds the demo user past 200 auth users (self-documented at scripts/seed-demo.mjs:67-69).
  - Demo partner orgs exist in the SAME prod tables as real partners — the DEMO_ORG_MARKER guard is the only separator; demo cohort rows (n>5 closed cases) could pollute real aggregate metrics if any reporting query forgets to exclude them.
  - supabase/seed/README.md is stale: 'the demo intentionally stops before the Stripe charge' (line ~24) describes the decommissioned consumer payment — contradicts guardrail #2 messaging and the current product.
checks:
  - Prod probe: do Demo Hospice / Demo Employer partners rows exist, and are their attributed negotiations excluded from any founder-facing or public aggregate?
  - Run import-hospices.mjs --dry-run against prod with the last CSV: expect 0 inserts (idempotency proof).
  - Confirm demo@honestfuneral.co cases are excluded from benchmark feeds (they're regular price_list_analyses/negotiations rows — check whether anything filters them; partner_members staff-exclusion does NOT cover the demo family user).
  - Fix-or-flag the stale Stripe sentence in supabase/seed/README.md.


## emailAi
NOTES: EXACT KILL-SWITCH GATES (quote-verified): (1) lib/negotiation/send.ts:31 `const live = process.env.OUTREACH_LIVE === "true";` — when false, rows update to status:"dry_run" and nothing is emailed; (2) lib/negotiation/notify-chosen-home.ts:93 `if (process.env.OUTREACH_LIVE !== "true") { return { sent: false, reason: "outreach_paused" }; }`; (3) app/api/negotiate/[id]/messages/route.ts:117 `if (process.env.OUTREACH_LIVE !== "true") {` → stored-but-not-sent. All four crons check `auth !== \`Bearer ${requireServer("CRON_SECRET")}\`` → 401, then a per-cron enable flag (ANNIVERSARY_EMAILS_ENABLED / NURTURE_ENABLED / OUTREACH_NOTIFICATIONS_ENABLED / PARTNER_DIGEST_ENABLED), all default-off; vercel.json schedules: anniversary 0 14 * * *, quote-notifications 15 * * * *, nurture 30 14 * * *, partner-digest 0 15 1 * *. AI FEATURE INVENTORY (13 ledger tags): analyzer-extract, advocacy-summary, eval, line-item-explain, draft-letter, compare-bill, founder-ingest, subscription-finder, obituary, eulogy, extract-price-list-image (vision, recordUsage), inbound-quote-parse, partner-digest. Eval coverage = analyzer pipeline ONLY; the vision extractor and inbound quote parser are the highest-stakes uncovered features. PII-to-prompt map: redacted = subscription-finder, stored raw_text (analyzer + founder-ingest); deliberately unredacted = obituary/eulogy; undocumented-unredacted = inbound-quote-parse (raw FD reply body, 6000 chars). Cost-per-case is measurable from api_cost_events (negotiation_id attribution exists on the negotiate-flow calls); anonymous L1 checker spend is bounded only by per-instance rate limits + max_tokens caps. Email sends to non-home recipients (family/partner/founder) intentionally bypass the outreach gate — the audit should verify recipient class, not just gate presence.
ORPHANS: ["lib/negotiation/send.ts:103-111 \u2014 'PAID family' comment and 'Outreach failed to send for a paid negotiation' alert text: paywall-era copy contradicting the decommissioned family charge (functional code fine; wording stale).", "lib/negotiation/notify-chosen-home.ts:6-8 \u2014 docstring names 'Stripe webhook + checkout route' as callers; the only real caller is app/api/negotiate/choose/route.ts:76. Stale since the 2026-06-25 paywall removal.", "CLAUDE.md 'the single send path is lib/negotiation/send.ts' \u2014 contradicted by two additional OUTREACH_LIVE-gated home-send sites (notify-chosen-home.ts, app/api/negotiate/[id]/messages/route.ts); the kill switch holds everywhere, but the 'single path' framing invites a false sense that a grep of one function audits the channel.", "app/api/cron/quote-notifications/route.ts:5 \u2014 imports fmtCents from lib/stripe: harmless but keeps the payments module coupled into a free-family email path.", "lib/nurture-email.ts:125 \u2014 'fallback-please-set' HMAC secret fallback: not orphaned code, but a landmine if NURTURE_ENABLED is ever flipped before UNSUBSCRIBE_SECRET is set (env validator only enforces it under OUTREACH_LIVE=true)."]

### Funeral-home outreach send path + OUTREACH_LIVE kill switch  [L2]  state=built-live (deployed, kill switch OFF by founder choice — every send records dry_run/paused rows)
paths: lib/negotiation/send.ts, lib/negotiation/notify-chosen-home.ts, app/api/negotiate/[id]/messages/route.ts, lib/negotiation/__tests__/send.test.ts
purpose: The only paths that email a funeral home: initial GPL outreach, the 'family selected you' notice, and family-message relay — all gated on OUTREACH_LIVE so the whole channel can be exercised dry pre-launch.
risks:
  - CLAUDE.md's 'single send path' claim is imprecise: there are THREE home-directed sendEmail sites. sendOutreachForNegotiation (lib/negotiation/send.ts:31 `const live = process.env.OUTREACH_LIVE === "true";` → live branch sends, else status='dry_run'), notify-chosen-home.ts:93 `if (process.env.OUTREACH_LIVE !== "true") { return { sent: false, reason: "outreach_paused" }; }`, and messages/route.ts:117 `if (process.env.OUTREACH_LIVE !== "true")`. All three gate on the same env var and re-check the denylist, but two live outside the named function — a future fourth site could forget the gate.
  - Stale paywall-era copy inside send.ts: line 103 comment 'A PAID family whose outreach didn't go out' and the alert text 'Outreach failed to send for a paid negotiation' (line 106) — the family charge was decommissioned 2026-06-25; a misleading alert during a real incident.
  - notify-chosen-home.ts docstring (lines 6-8) claims callers are 'Stripe webhook + checkout route' — the actual sole caller is app/api/negotiate/choose/route.ts:76. Doc drift on a guardrail-adjacent file.
  - Denylist + vetting live in lib/negotiation/denylist.ts / directory.ts (active=true AND vetted=true) — messages route checks denylist (line 64) but relies on the outreach row having been created through the vetted directory; no re-check of vetted at relay time.
checks:
  - Kill-switch grep: `grep -rn "OUTREACH_LIVE" app lib --include='*.ts' | grep -v __tests__` must show exactly three gate sites (send.ts:31, notify-chosen-home.ts:93, negotiate/[id]/messages/route.ts:117) and zero home-directed sendEmail calls outside them.
  - Bypass grep: `grep -rn "sendEmail(" app lib --include='*.ts' | grep -v __tests__` — for each hit, verify recipient is family/partner/founder, never a home_email, unless inside one of the three gated sites.
  - Prod env probe: confirm OUTREACH_LIVE is unset/false in Vercel; POST a test negotiation and verify negotiation_outreach rows land as status='dry_run', never 'sent'.
  - Verify denylist re-check fires: seed a denylisted address, run the send, confirm status flips to 'declined' with skipped++.
  - Fix-copy check: confirm the 'paid negotiation' alert wording and notify-chosen-home caller docstring are corrected or flagged.

### Email + SMS transport (Resend / Twilio, dry-run by default)  [infra]  state=built-live
paths: lib/email.ts, lib/sms.ts
purpose: Single outbound transport seam: sendEmail (Resend; console dry-run when RESEND_API_KEY unset) and sendSms (Twilio via raw fetch; dry-run without creds), so every flow is exercisable without live services.
risks:
  - FEATURES.email() gating means a missing key silently dry-runs in prod too — a mis-provisioned env would look like success (returns fake id) while sending nothing; only the console log distinguishes it.
  - FROM_DEFAULT hardcodes hello@honestfuneral.co — a rename (currently on hold) touches this and lib/brand.ts.
checks:
  - Confirm RESEND_API_KEY present in prod env and Resend dashboard shows recent deliveries matching logEvent volume.
  - Grep for any direct `new Resend(` or `api.twilio.com` outside lib/email.ts / lib/sms.ts (should be zero).
  - Verify Resend error surfaces: result.error throws (email.ts:56) — trace one deliberate bad-address send in staging.

### Welcome + nurture sequence (planning signups)  [L1]  state=built, cron gated OFF (NURTURE_ENABLED default off; welcome sends on signup when Resend key present)
paths: lib/welcome-email.ts, lib/nurture-email.ts, app/api/cron/nurture-emails/route.ts, app/api/planning/signup/route.ts, app/unsubscribe/page.tsx
purpose: Email-capture welcome (source-mapped guide link) plus a 2-step nurture follow-up (day 7 check-in, day 21 'if you ever need us') that funnels toward /where; HMAC one-click unsubscribe.
risks:
  - nurture-email.ts:125 falls back to UNSUBSCRIBE_SECRET ?? "fallback-please-set" — if the env var is unset in prod, unsubscribe tokens are forgeable/guessable; lib/env.ts only hard-requires UNSUBSCRIBE_SECRET when OUTREACH_LIVE=true, so nurture could go live without it.
  - Step-2 copy claims 'typical savings on the arrangement run $2,000 to $5,000' and 'we contact homes on your behalf' — a guardrail-4 defensibility claim to verify against methodology, and functionally wrong while OUTREACH_LIVE is off (we would NOT contact homes).
  - Welcome-email SOURCE_CONTENT map (15 sources) can drift from actual signup pages — unknown sources silently fall back to /guides.
checks:
  - Cron auth: `curl -s https://<host>/api/cron/nurture-emails` without Authorization must 401; with `Authorization: Bearer $CRON_SECRET` and NURTURE_ENABLED unset must return {disabled:true}.
  - Verify UNSUBSCRIBE_SECRET is set in prod (grep env) and /unsubscribe rejects a token minted with the fallback secret.
  - Content check: source the '$2,000 to $5,000' savings claim or soften it; reconcile 'we contact homes' with the paused outreach state.
  - Diff SOURCE_CONTENT keys in welcome-email.ts and nurture-email.ts against the live pages that mount EmailCapture.

### Bereavement anniversary cadence (email + opt-in SMS)  [L2]  state=built, cron gated OFF (ANNIVERSARY_EMAILS_ENABLED default off; BEREAVEMENT_SMS_ENABLED separate)
paths: lib/anniversary-emails.ts, app/api/cron/anniversary/route.ts
purpose: Five check-ins (1mo/3mo/6mo/1yr/13mo) anchored strictly on family-entered date_of_death, mirroring the Medicare 13-month bereavement window — the 'walk the whole arc' promise plus hospice-benefit awareness (drives the hospice narrative).
risks:
  - Content claims worth verifying while gated: '42 CFR 418.64' bereavement citation, 'fewer than half of families ever use it', inherited-IRA 10-year rule, VA 2-year burial-benefit window — all in emailFor() bodies; guardrail 4 applies once live.
  - dueMilestone/markSent latest-only logic is load-bearing (mis-anchored condolence = worst failure mode) — covered by anniversary-emails.test.ts, good.
  - Per-user sequential auth.admin.getUserById inside the loop under maxDuration=60 — a large candidate set could time out mid-batch (safe: sent-markers prevent double-send on rerun).
checks:
  - Cron auth: unauthenticated GET /api/cron/anniversary must 401; authed with switch off must return disabled:true.
  - Confirm the 2026-07-01-bereavement-cadence migration (date_of_death column) is applied in prod before ever flipping the switch — the route 500s cleanly otherwise (lines 84-89).
  - Fact-check every regulatory/benefit claim in emailFor() and smsFor() against current sources before enabling.
  - SMS: verify TWILIO_* unset in prod (dry-run) and that smsFor bodies carry 'Text STOP to opt out.'

### Quote-notification cron (family alert when a home replies with a quote)  [L2]  state=built, gated OFF (OUTREACH_NOTIFICATIONS_ENABLED default off per CLAUDE.md law)
paths: app/api/cron/quote-notifications/route.ts
purpose: Hourly: emails the family (grouped per negotiation) when negotiation_outreach rows gain quote_cents, linking to /compare and /results — the loop-closer of the negotiate flow.
risks:
  - notified_at is stamped per-row AFTER a grouped send; a crash mid-loop could re-email already-notified quotes in the same group next run (bounded, low-severity).
  - Imports fmtCents from lib/stripe — cosmetic coupling to the payments module in a free-to-family email path.
checks:
  - Cron auth: unauthenticated GET must 401; authed + switch off returns disabled:true (verify in prod).
  - Confirm vercel.json schedule '15 * * * *' matches the deployed project's cron config.
  - Copy check: email says 'we contacted on your behalf' — consistent only once OUTREACH_LIVE is on; keep both switches in lockstep.

### Partner monthly digest (L3 revenue-facing email + AI paragraph)  [L3]  state=built-unproven (gated OFF via PARTNER_DIGEST_ENABLED; zero real partner cases have flowed)
paths: lib/partner-digest.ts, lib/partner-report-digest.ts, app/api/cron/partner-digest/route.ts
purpose: Monthly aggregate-only activity email to each active partner (suppression-gated CohortStats, n>=5 before dollars/satisfaction) with an optional Claude-written outcomes paragraph — the recurring proof-of-value artifact for hospice renewal conversations.
risks:
  - The `?test=` dry-run branch sits ABOVE the cron bearer check, gated only by requireAdminApi (deliberate, documented at lines 126-133) — the admin allowlist is the entire defense; verify ADMIN_EMAILS non-empty in prod.
  - AI paragraph (partner-digest feature) is grounded in all-numeric JSON only (no PII by construction) with deterministic fallback and 15s timeout — good — but has NO model-quality eval; a hallucinated-sounding sentence to a paying hospice is a trust risk.
  - Legacy-column retry path (lines 206-228) silently degrades partner_type to 'hospice' pre-migration — fine now, wrong once a real employer partner exists on a stale DB.
  - shouldSendDigest suppresses zero-activity partners — correct, but means a silent month is indistinguishable from a broken cron without checking the JSON response.
checks:
  - Auth matrix: (a) bare GET → 401; (b) GET ?test=<id> without admin session → denied by requireAdminApi; (c) admin session + ?test → dryRun:true JSON, wouldSend honest against active/recipient/activity.
  - Grep-pin (per Day-5 gate): app/partner/[code]/page.tsx must import only fallbackOutcomesDigest, never buildOutcomesDigest or lib/claude.
  - Suppression: seed a 4-case cohort, confirm digest bullet says figures unlock at 5 and the AI branch returns smallSampleDigest() with no Claude call.
  - Confirm PARTNER_DIGEST_ENABLED off until a real partner exists; schedule '0 15 1 * *' present in deployed cron config.

### Family task-digest hand-off (anonymous one-time email)  [L1]  state=built-live
paths: lib/family-digest.ts, app/api/family/digest/route.ts
purpose: Point person emails one relative ONLY their assigned tasks/contacts/documents; client filters device-local data before send, server stores nothing.
risks:
  - Anonymous endpoint that emails attacker-supplied text (item titles <=160 chars, notes <=200) to an arbitrary address from our domain — a spam/abuse vector bounded only by the per-instance 5/hour/IP rate limit (in-process Map; multiplies by serverless instance count). No CAPTCHA, no validateOrigin call.
  - Deliverability risk: abuse could damage the hello@ domain reputation the outreach channel depends on.
checks:
  - Probe: 6 rapid POSTs from one IP must yield a 429 on the 6th (single instance); note the multi-instance caveat in findings.
  - Verify item-count/length caps reject oversized payloads (MAX_DIGEST_ITEMS=40, 60KB body limit).
  - Consider/verify validateOrigin on this POST — currently absent (route reads only rateLimit + readLimitedJson).

### Inbound email capture (Postmark webhook) + AI quote parse  [L2]  state=built-live (deployed; unexercised at real volume — zero live outreach yet)
paths: app/api/inbound/email/route.ts, lib/negotiation/parse-reply.ts, lib/negotiation/notify-family-of-reply.ts
purpose: Receives funeral-home replies via plus-addressed reply.honestfuneral.co, stores them on the negotiation thread, best-effort AI-parses a PROPOSED quote (human-confirm required), and notifies the family — the core data-capture moment of the outcomes layer.
risks:
  - Webhook auth is Basic-Auth exact string compare (route.ts:46 `authHeader !== expected`) — not timing-safe, though practical exploitability is negligible; secret strength is what matters.
  - PII to Claude: parse-reply.ts sends the RAW reply body (first 6000 chars) to Claude with no redactContact pass — an FD reply quoting our outreach may include the family label/name. redact.ts's own doc scopes redaction to raw_text storage + subscription-finder, so this is an undocumented exception rather than a decided one.
  - raw_payload (full Postmark JSON incl. HtmlBody, sender identity) is stored on negotiation_messages — verify RLS owner-scoping covers it.
  - AI proposal writes ai_* columns pre-migration-safe (warn + continue) — good degrade; the family-confirm gate (D6) keeps AI output from becoming ground truth.
  - notifyFamilyOfReply emails the account owner (family-initiated case, so channel-rule compliant) with a hardcoded honestfuneral.co status URL — rename-sensitive.
checks:
  - Auth: POST without/with wrong Basic creds must 401; with correct creds and no MailboxHash returns accepted:false no_negotiation_id (200 so Postmark stops retrying).
  - Dedup: replay the same MessageID; second insert must return {accepted:true, deduped:true} via 23505 and must NOT re-run the AI parse.
  - Cost bound: verify inbound-quote-parse rows in api_cost_events carry the negotiation_id and the 15s timeout held (no SDK retries).
  - Decide + document the redaction stance for inbound-quote-parse prompts (apply redactContact or record the exception in lib/redact.ts's header).
  - Verify POSTMARK_INBOUND_USER/SECRET set in prod and MX for reply.honestfuneral.co still points at Postmark (rename-on-hold note: old-domain inbound must persist through any future rename).

### Resend bounce/complaint webhook (directory hygiene)  [infra]  state=built-live
paths: app/api/inbound/resend-webhook/route.ts
purpose: Svix-signature-verified handler that flips funeral_homes.active=false on hard bounce or spam complaint so we stop emailing dead/hostile addresses — protects the outreach channel's deliverability.
risks:
  - Deactivation matches by `ilike("email", email)` — a shared inbox across multiple home rows deactivates all matches (arguably correct); no reactivation path in code (manual SQL only).
  - Signature verification correctly HMACs over id.timestamp.payload but does not check timestamp freshness — replay of a captured valid event is possible (impact: re-deactivating an already-inactive home; negligible).
checks:
  - POST with bad/absent svix headers must 401 and log resend.webhook.bad_signature.
  - Confirm RESEND_WEBHOOK_SECRET set in prod and the Resend dashboard endpoint subscribes to email.bounced + email.complained only.
  - Verify transient bounces are ignored (bounce.type != 'Permanent' → action:'ignored').

### AI core: model law, cost ledger, pricing triage  [infra]  state=built-live (eval-gated model swap discipline in force since D3 2026-07-16)
paths: lib/claude.ts, lib/ai-costs.ts
purpose: Single cost-tagged Claude entry point (callClaude: sonnet-5 default, haiku-4-5 classifier, thinking pinned disabled, throws on max_tokens truncation, usage → api_cost_events) plus per-model list-price triage math for /admin/ai-costs.
risks:
  - Cost-per-case attribution only where callers pass negotiationId (inbound-quote-parse does; most L1 checker features are anonymous by design) — the ~$0.10–0.25/case figure in BUSINESS_PLAN §unit-costs depends on this ledger staying complete.
  - SONNET_5_INTRO_END = '2026-08-31': after that date the intro→sticker flip is automatic per-row, but the RATE_TABLE itself goes stale the moment Anthropic changes list prices — the overestimate-on-unknown fallback only protects against NEW model ids, not repriced known ones.
  - persistUsage is best-effort (logWarn on failure) — a broken ledger silently undercounts spend; the ai.call log line is the backstop.
  - extract-price-list-image builds its own messages.create (vision) — the ONE call site outside callClaude; it must keep recordUsage + explicit thinking config manually in sync (route.ts:78,107).
checks:
  - Cost measurement: SELECT feature, count(*), sum(input_tokens), sum(output_tokens) FROM api_cost_events GROUP BY feature over the last 30 days; join negotiation_id coverage to compute measured cost-per-case and compare to the business-plan claim.
  - Grep: `grep -rn "messages.create" app lib --include='*.ts'` — every hit outside lib/claude.ts must pair with recordUsage and thinking:{type:'disabled'} (today: only extract-price-list-image).
  - Confirm api_cost_events RLS is deny-all (service-role only) in prod.
  - After 2026-08-31: verify a sonnet-5 row from September prices at sticker and an August row still prices at intro (ratesFor day logic).

### AI eval harness + golden GPL fixtures  [infra]  state=built-live (BASELINE committed 2026-07-16; not part of vitest/CI — manual, costs real cents)
paths: scripts/eval-analyzer.mjs, test/evals/BASELINE.md, test/evals/gpl, test/evals/fixtures.test.ts
purpose: End-to-end scoring of the production /api/analyze-price-list pipeline against 14 golden GPL fixtures; the committed BASELINE.md is the legal gate for any model/prompt change (all aggregates 100% except end-to-end totalQuoted 92.9%).
risks:
  - EVAL COVERAGE GAP — the harness covers ONLY analyzer-extract (+rules/totals). Features with NO model-quality eval: extract-price-list-image (vision — the photo-snap wedge itself!), inbound-quote-parse, compare-bill, advocacy-summary, line-item-explain, draft-letter, obituary, eulogy, subscription-finder, partner-digest, founder-ingest. Deterministic interpretation layers have unit tests (parse-reply.test.ts, partner-report-digest.test.ts) but nothing scores model output quality.
  - The vision path is arguably the highest-stakes uncovered feature: the wedge product's first impression runs through it with zero fixtures.
  - --model override honored only on dev servers (NODE_ENV check) — good prod hygiene; eval runs never persist rows (unauthenticated POSTs) or send zips — good isolation.
checks:
  - Confirm test/evals/gpl has 14 fixture pairs and fixtures.test.ts still pins the duplicated reconcileTotalQuoted against lib/analyzer-totals.ts.
  - Run `npm run eval:analyzer` against a dev server and diff aggregates vs BASELINE.md — any regression without a PR trail violates the D3 law.
  - Flag for the plan: no eval fixtures exist for vision extraction or inbound-quote-parse — the two paths where a wrong number reaches a family or a case record.
  - Verify eval runs appear under feature='eval' in api_cost_events (never polluting analyzer-extract stats).

### PII redaction, observability, rate limiting, HTTP guards  [infra]  state=built-live
paths: lib/redact.ts, lib/observability.ts, lib/rate-limit.ts, lib/http-guards.ts
purpose: Cross-cutting safety: contact-detail redaction for stored/prompted text (price-preserving by design), structured logs + webhook alerts with maskEmail/maskPhone/hashId, per-path token-bucket rate limits on all AI/public POSTs, bounded body reads + origin CSRF check.
risks:
  - rate-limit.ts is an in-process Map — PER-INSTANCE on serverless, so AI cost exposure from a distributed burst scales with instance count (documented honestly in the file; docs/SECURITY.md notes the Upstash upgrade path). All AI endpoints (8–12/min) are anonymous, so this is the ONLY spend brake besides max_tokens caps.
  - redact.ts is applied to subscription-finder prompts + stored analyzer/ingest raw_text, deliberately NOT to obituary/eulogy (names are the point) — but inbound-quote-parse prompts fall in neither documented bucket (see inbound surface).
  - validateOrigin allows requests missing BOTH Origin and Referer — documented defense-in-depth stance, fine, but means header-less bots pass; rate limits are the real gate.
  - ALERT_WEBHOOK_URL no-op when unset — verify it IS set in prod or 'alerts' are silently logs-only.
checks:
  - Live 429 probe on the hottest AI route: 13 rapid POSTs to /api/analyze-price-list must 429 with retryAfterMs.
  - Grep for raw PII in logs: `grep -rn "logEvent\|logWarn\|captureError" app lib --include='*.ts' | grep -iE "email|phone|name"` — every hit must route through maskEmail/maskPhone/hashId.
  - redact unit check: run redactContact over a fixture GPL and assert zero price mutations (redact.test.ts covers this — confirm it still passes).
  - Confirm ALERT_WEBHOOK_URL configured in prod; fire sendAlert from a staging path and verify Slack/Discord delivery.


## seoTrust
NOTES: Read every file requested plus the adjacent surfaces they wire into. Overall shape: the SEO layer is unusually disciplined for its age — per-page noindex on all gated surfaces (verified on all 9 admin pages, portal/dashboard/negotiate layouts, partner routes, and every branch of the 6,852 hospice facility pages), an honest-degrade rule keeping zero-counts out of indexed titles, a privacy-sanitized cookieless analytics beacon that matches the /privacy promise, and guardrail-#4 wiring (n>=5 gates, modeled-vs-verified badging, append-only corrections log) baked into the indexable pages themselves. The three findings that matter most for the audit plan: (1) MEASUREMENT IS UNPROVEN — GSC verification and Vercel Analytics are both env/dashboard toggles invisible to the repo; until the founder confirms both are live, 'did I grow reach?' has no instrument, and that check should be step one of any audit session. (2) The flagship /analyzer is the least-SEO-dressed page on the site and is missing from the sitemap — inverted priorities vs ~140 long-tail glossary pages. (3) The trust spine has two content-currency holes a hospice compliance reviewer would hit in minutes: the April-2026 privacy policy silent on partner-facing aggregate reporting, and /our-role's present-tense operational claims (messaging thread, meeting scheduling) that have never run a real case. Canonical coverage is inconsistent: ~24 pages set alternates.canonical (incl. hospice state pages) but the 87-city ISR cluster, /privacy, /terms, and most guides do not — Next.js emits no canonical without it. i18n-es remains docs-only behind human review, correctly. /paywall is properly dead (redirect, no Stripe). Domain literals: sitemap/robots/article-schema/homepage ORG_SCHEMA all hardcode honestfuneral.co while the Dataset distribution reads BRAND.url — a rename-day sweep item already anticipated in code comments, harmless while the rename is on hold.
ORPHANS: ["/analyzer \u2014 the flagship wedge tool is absent from app/sitemap.ts AND has near-empty metadata (title 'Price-list analyzer' only: no description, no OG image, no canonical) while every commodity guide page got full treatment; the single highest-leverage SEO fix found in this pass (app/analyzer/page.tsx)", "app/robots.ts disallows /signup \u2014 no such route exists anywhere in app/", "/our-role, /rights, /eulogy, /tell-your-hospice, /next-30-days, /where/just-happened, /for-funeral-homes \u2014 indexable public pages missing from the sitemap (some may be deliberate; /our-role and /tell-your-hospice look like oversights given their funnel roles)", "Dataset JSON-LD DataDownload URLs on /fair-price-index point into robots-disallowed /api/ space \u2014 the two files contradict each other (app/fair-price-index/page.tsx vs app/robots.ts)", "lib/article-schema.ts hardcoded datePublished default '2026-05-14' applied to ~23 pages regardless of actual publish/update dates", "app/privacy/page.tsx \u2014 'Last updated: April 2026' predates and never mentions the institutional/partner data model it now needs to disclose (also no canonical); app/terms/page.tsx carries an unresolved counsel TODO on the arbitration clause"]

### Sitemap (route inventory)  [infra]  state=built-live
paths: app/sitemap.ts
purpose: Declares ~200 canonical URLs to crawlers: 55 static routes, 4 guidance scenarios, 3 after-topics, faith/estate/glossary sets, 87 city pages, and hospices index + 51 state pages (facility pages deliberately excluded).
risks:
  - Flagship /analyzer is NOT in the sitemap at all — the wedge product is the single most important reach page and it is invisible to the sitemap (it is indexable, just undeclared).
  - Other indexable pages missing from sitemap: /our-role (the regulator/press trust page), /rights, /eulogy, /tell-your-hospice (Loop #1 page), /for-funeral-homes, /next-30-days, /where/just-happened.
  - Every URL gets lastModified: new Date() on every build — the freshness signal is meaningless noise to Google; real change dates are never communicated.
  - Sitemap hardcodes https://honestfuneral.co (rename-on-hold makes this fine today, but it bypasses lib/brand.ts BRAND constants).
checks:
  - Fetch live https://honestfuneral.co/sitemap.xml and diff its URL set against the deployed route list (find app -name page.tsx) — confirm the /analyzer, /our-role, /rights, /tell-your-hospice omissions are real in prod and decide which are intentional.
  - Count entries: expect 87 /funeral-costs/* rows (repo has 87 cities, not 89 — memory-confirmed) and exactly 52 /hospices* rows; any /hospices/[state]/[ccn] URL appearing is a regression.
  - Founder GSC question: is the sitemap submitted in Search Console, what's its 'discovered vs indexed' ratio, and which of the ~140 glossary/estate/faith long-tail pages are actually indexed?

### Robots policy  [infra]  state=built-live
paths: app/robots.ts
purpose: Crawl policy: allow all, disallow /dashboard, /login, /api/, /signup; points to sitemap.xml.
risks:
  - Disallow /api/ contradicts the citable Fair-Price Index: the Dataset JSON-LD on /fair-price-index advertises DataDownload contentUrls at /api/fair-price-index/data (JSON + CSV) which robots.txt forbids crawlers from fetching — undermines Google Dataset Search ingestion of the Day-7 citability feature.
  - Disallows /signup, a route that does not exist (harmless fossil, signals drift).
  - /admin, /portal, /partner, /account are NOT disallowed and rely entirely on per-page noindex metadata (verified present on all 9 admin pages, portal layout, partner routes, dashboard layout) — correct mechanism, but a single new gated page without noindex leaks into the index.
checks:
  - Fetch live /robots.txt and confirm it matches the file; test /api/fair-price-index/data in GSC's robots tester against the Dataset schema claim.
  - Grep every new page under app/admin, app/portal, app/partner for robots noindex metadata (the safety net robots.txt doesn't provide).
  - Decide deliberately: either carve /api/fair-price-index/ out of the disallow or drop the DataDownload distribution entries from the JSON-LD — currently they contradict each other.

### OG image pipeline  [infra]  state=built-live
paths: app/og/route.tsx, lib/og.ts, app/opengraph-image.tsx
purpose: Edge-rendered 1200x630 brand-templated social cards: /og?title=&eyebrow= per page via lib/og.ts helper, plus a static root default in opengraph-image.tsx; makes shared links look credible (reach loop support).
risks:
  - Open unauthenticated endpoint renders ARBITRARY query text under the Honest Funeral brand mark — anyone can mint an official-looking card saying anything (e.g. a fake claim about a named funeral home) and share the image URL; no signing, no allowlist, only a 110-char trim.
  - OG tagline baked into the image is 'quiet help after a loss' — verify it still matches current positioning ('is this quote fair?') since the homepage pivoted to the checker-first message.
checks:
  - Probe live /og?title=TEST&eyebrow=X returns a PNG; then decide whether arbitrary-text minting is an acceptable brand exposure or needs param signing.
  - Run 2-3 key pages (/, /fair-price-index, a city page) through a social-card debugger (Twitter/FB/LinkedIn validators) to confirm images resolve absolute via metadataBase.
  - Check response caching headers on /og in prod — an uncached edge function on every crawler hit is silent spend.

### Structured data (Article/Org/Dataset/Breadcrumb/FAQ JSON-LD)  [L1]  state=built-live
paths: lib/article-schema.ts, components/seo/ArticleSchema.tsx, components/seo/JsonLd.tsx, app/fair-price-index/page.tsx, app/page.tsx, app/hospices/[state]/page.tsx
purpose: Rich-result eligibility and machine citability: Article schema on 23 guide/city pages, Organization on the homepage, BreadcrumbList on hospice state pages, JsonLd also on /faq, /faith/[tradition], /guidance/[scenario], and a Dataset with JSON/CSV DataDownload on /fair-price-index (the moat's public citation surface).
risks:
  - articleSchema defaults every page to datePublished 2026-05-14 and dateModified=datePublished — dozens of pages claim identical never-updated dates; weak freshness signal and mildly indefensible ('last updated' claims that aren't).
  - Dataset JSON-LD on /fair-price-index is rendered via a raw <script dangerouslySetInnerHTML> WITHOUT the '<'-escaping the JsonLd component applies — data is static today so no injection, but it's an inconsistent bypass of the safe path.
  - Dataset 'license' field points to /methodology (a methodology page, not a license) — schema validators will flag it; also distribution URLs use BRAND.url (NEXT_PUBLIC_APP_URL) while name/url use hardcoded honestfuneral.co: a prod env mismatch would emit split-domain JSON-LD.
  - Article image URLs point at the unsigned /og endpoint — fine, but ties rich results to that route's availability.
checks:
  - Run Google Rich Results Test on /grief (Article), / (Organization), /faq (FAQ), /hospices/california (Breadcrumb), /fair-price-index (Dataset) — record errors/warnings.
  - View live /fair-price-index source: confirm the Dataset's distribution contentUrls are absolute honestfuneral.co URLs (proves NEXT_PUBLIC_APP_URL is set correctly in prod).
  - Search Google Dataset Search for 'Honest Funeral Fair-Price Index' — the citability payoff is only real if it's ingested; if absent, the robots /api/ disallow is the first suspect.
  - Founder GSC question: any 'Unparsable structured data' or enhancement reports showing?

### Programmatic city pages (Fair-Price local cluster)  [L1]  state=built-live
paths: lib/city-pages.ts, app/funeral-costs/[city]/page.tsx, app/funeral-costs/page.tsx
purpose: The programmatic SEO reach engine: 87 metro pages with modeled fair-price tables (regional multiplier over national bands), verified-local overrides gated at n>=5, internal-link mesh (same-state metros, estate guides, /rights, /where funnel).
risks:
  - No canonical alternates in generateMetadata on city pages (Next.js does not auto-emit canonicals; metadataBase alone doesn't) — 87 near-identical-template pages without self-canonicals is exactly where Google picks its own canonical.
  - Batch-1 blurbs contain unverified local color ('strong community of independent family-run funeral homes' in Atlanta, ethnic-home claims in Chicago) — soft claims, but the guardrail-#4 bar is 'never publish a number we can't defend'; these are prose claims nobody sourced (batch 2 deliberately dropped blurbs for this reason, per the in-file comment).
  - 87 pages of substantially templated content: watch GSC for 'Duplicate, Google chose different canonical' or 'Crawled - not indexed' clusters.
checks:
  - View live source of 2-3 city pages: is a <link rel=canonical> present? If not, add alternates.canonical like the hospice state pages have.
  - Verify the zero-override rendering: with prod regional_benchmarks empty (per Day-7 memory), the 'Verified local prices' card must be absent and pages byte-identical to modeled-only.
  - Cache-bust probe one Batch-2 page (?v=1) to dodge the known edge-404 gotcha before declaring ISR healthy.
  - Founder GSC question: per-metro impressions/clicks — which of the 87 rank at all after Day 7? That's the reach scoreboard.

### Zip directory pages (/funeral-homes/[zip])  [L1]  state=built-live
paths: app/funeral-homes/[zip]/page.tsx, app/funeral-homes/page.tsx
purpose: Per-zip fair-price tables ('funeral home prices [zip]' intent), linked from every city page's CTA; funnels into /negotiate/start.
risks:
  - Indexable for ANY 5-digit numeric string — only /^\d{5}$/ is validated, and regionForZip null still renders a national-data page ('zip 00000' works). An unbounded ~100k-page thin-content space with no canonical, no noindex, and no sitemap presence: classic doorway-page risk if crawlers find them.
  - Comment says 'Public, indexable, SEO-targeted' — deliberate, but the indexability decision predates the 87-city cluster which now serves the same intent with better content.
checks:
  - Probe a nonsense zip live (e.g. /funeral-homes/00000) — confirm it renders and decide: validate against real zips, noindex non-existent regions, or canonicalize thin zips to the metro page.
  - Founder GSC question: how many /funeral-homes/* URLs are indexed vs the ~87 intended zipExample entry points?

### Hospice directory index/state/facility (noindex discipline)  [L1]  state=built-live
paths: app/hospices/page.tsx, app/hospices/[state]/page.tsx, app/hospices/[state]/[ccn]/page.tsx
purpose: SEO surface for the hospice channel: static index (crawl path), 51 indexed state pages with canonical + BreadcrumbList and honest-degrade metadata (never a zero/wrong count in an indexed title), ~6,852 on-demand facility pages that are noindex-follow on every branch and never in the sitemap; each carries the partner-apply and claim CTAs (institutional funnel).
risks:
  - The noindex rule is enforced per-branch in one file with no lint/test guard visible from these files alone — a future edit dropping NOINDEX on one branch would index 6,852 thin CMS-record pages overnight (the Day-6 gate grep covered this; the audit should re-run it against prod, not just the repo).
  - State pages' indexed titles embed live DB counts ('all N Medicare-certified providers') — count drift vs CMS refreshes makes indexed titles stale between DIRECTORY_AS_OF updates ('July 2026' hardcoded in lib/hospice-directory.ts).
checks:
  - Fetch a live facility page's HTML and grep for <meta name="robots" content="noindex"> — on a real CCN, a wrong-state CCN, and a junk CCN (all branches).
  - site:honestfuneral.co/hospices search — only the index + 51 state pages should ever appear.
  - Confirm live state-page title count (e.g. California) matches the rendered list length, and that a DB outage degrades to the count-free title.
  - Verify the claim POST rate-limit still 429s on the 6th attempt (Day-6 gate check) — it's the only write on this surface.

### Root layout metadata + Search Console hook  [infra]  state=built-live
paths: app/layout.tsx
purpose: Site-wide metadata: metadataBase honestfuneral.co, title template, checker-first description, robots index/follow, GSC verification meta gated on GOOGLE_SITE_VERIFICATION env; mounts AnalyticsBeacon and RememberReferral (30-day on-device referral memory, nothing transmitted).
risks:
  - GSC verification is env-dependent and unverifiable from the repo — if GOOGLE_SITE_VERIFICATION was never set in Vercel, the entire search-reach measurement loop (impressions, queries, indexing reports) doesn't exist; that would be the single biggest reach blind spot.
  - Site-wide meta description leads with the quote checker while the homepage H1 is crisis-first ('Someone important just died') — coherent dual-lane, but confirm the description matches what the founder wants ranking pages to say.
checks:
  - View live homepage source for <meta name="google-site-verification"> — presence proves the env var is set.
  - Founder question: is the property verified in Search Console, and who has access? If no, this is a 15-minute fix that unblocks every other GSC audit question in this plan.
  - Confirm title template renders on a child page (view-source a guide page for '— Honest Funeral' suffix).

### Analytics (reach measurement)  [infra]  state=built-unproven
paths: lib/analytics.ts, components/analytics/AnalyticsBeacon.tsx, docs/ANALYTICS.md
purpose: Cookieless Vercel Web Analytics with a tested privacy sanitizer (queries stripped, UUIDs->[id], 24+ hex->[token], unparsable=dropped) plus 13 named aggregate events covering the tool funnel and all four growth loops (analyzer_completed, nominate_submitted, materials_printed, hospice_claim_submitted, ...).
risks:
  - The whole layer no-ops unless the founder clicked Analytics->Enable in the Vercel project — the repo cannot prove reach is being measured AT ALL; if disabled, the weekly 'did I grow reach?' question has no data behind it.
  - Deliberate blindness worth stating in the audit: events carry zero identifying properties and all query strings are stripped, so per-partner funnel attribution (which hospice's links convert) is structurally unmeasurable in analytics — attribution lives only in the negotiations DB via RememberReferral. Correct per privacy law, but the audit should confirm the L3 reporting reads attribution from the DB, not from analytics.
  - No server-side event path: API-only actions (e.g. digest sends, inbound parses) are invisible; observability for those lives elsewhere (lib/observability.ts, unreviewed here).
checks:
  - Founder question: open Vercel -> walkbeside project -> Analytics. Enabled? Since when? Screenshot the pages view — do /funeral-costs/* rows exist (the key SEO signal per docs/ANALYTICS.md)?
  - Verify live: load a page with ?ref=HF-TEST and confirm the recorded pageview URL in Vercel has no query string (sanitizer proof).
  - Check event volume for analyzer_completed vs page views of /analyzer — the wedge conversion rate is the one funnel number that matters.
  - Confirm no other analytics mounts exist: grep for '@vercel/analytics' imports outside AnalyticsBeacon (the 'never mount bare <Analytics/>' rule).

### Trust spine: /about, /our-role, /corrections, /accessibility, /methodology  [L1]  state=built-live
paths: app/about/page.tsx, app/our-role/page.tsx, app/corrections/page.tsx, app/accessibility/page.tsx, app/methodology/page.tsx
purpose: The conflict-free-trust moat made legible: founder-builder story + funding model (/about), the not-a-funeral-home legal positioning with regulator/press section (/our-role), append-only correction + benchmark-change logs with under-claim commitments (/corrections), honest WCAG-target statement with live phone/email help (/accessibility).
risks:
  - /our-role claims operational features as present-tense fact: 'Relay pre-meeting questions through an in-app messaging thread', 'Help schedule the arrangement meeting', 'stay on email for post-meeting disputes' — with OUTREACH_LIVE off and zero real cases run, several of these describe unexercised or aspirational capabilities on the page regulators are pointed at; each claim needs a works-today verification or a tense change.
  - /our-role is absent from the sitemap despite having a canonical and being the page for 'regulators and press'.
  - /about and /our-role/'For funeral homes' still describe the L2 outreach flow ('have us contact funeral homes for you') as available — accurate in code but dormant by founder choice; decide whether the copy should promise it.
  - /corrections BENCHMARK_CHANGES is honestly empty and says so — good; verify ITEM_COUNT/RULE_COUNT render sanely and match /methodology's counts.
  - /accessibility publishes a phone number (+1 385 553-1141) and promises a person will help — solo founder; verify it's answered/voicemailed, since a hospice may test it during diligence.
checks:
  - Line-by-line claims check of /our-role against shipped code: does the in-app messaging thread exist and work? Does meeting scheduling exist? Mark each claim proven/unproven.
  - Call the /accessibility phone number and email help@/corrections@/legal@/press@/arrangements@ — confirm every address on these pages actually routes to the founder (Google Workspace aliases).
  - Cross-check /corrections item/rule counts against /methodology's live numbers (both derive from lib/pricing-data.ts and lib/bundling-detection/rules.ts, so they should agree by construction — verify in rendered HTML).
  - Add-to-sitemap decision for /our-role.

### Legal pages: /privacy + /terms  [L1]  state=legacy-suspect
paths: app/privacy/page.tsx, app/terms/page.tsx
purpose: The legal contract surfaces a hospice compliance team will read before any pilot: data handling promises (/privacy) and service terms incl. arbitration (/terms).
risks:
  - /privacy is dated 'Last updated: April 2026' — it PREDATES the B2B2C pivot (June 2026) and contains ZERO mention of institutional partners, hospices, referral attribution, or the aggregate de-identified outcome reporting that the L3 partner portal shares with paying institutions (grep confirms: no partner/hospice/institution/employer hits). The pilot's data-flow story is undisclosed in the very document that governs it — a direct blocker-grade gap for hospice diligence.
  - /terms carries an in-code TODO: clause 8 (binding arbitration + class waiver) flagged as in tension with the consumer-advocate brand, 'do not change without legal sign-off' — still unresolved; counsel retention is already a Day-8+ gate.
  - Neither page sets a canonical (both lack alternates), both say April 2026 while the model, the analytics promise (privacy cites 'privacy-respecting analytics' which docs/ANALYTICS.md leans on), and the partner layer all changed after.
  - /terms description says 'Free to families — we never charge the grieving family' (correct), but the body must be checked for any fossil of the $49/$199 era.
checks:
  - Full-read both pages against the current data reality: does /privacy disclose (a) referral-code attribution to an institution, (b) aggregate outcomes shared with the referring partner, (c) AI processing of uploaded price lists? List every undisclosed flow for counsel.
  - Grep both for retired-model fossils ($49, checkout, refund, payment).
  - Queue the arbitration-clause-8 question into the counsel-retention agenda (it's already flagged in code).
  - Add canonicals + refresh 'Last updated' only WITH the substantive update, not cosmetically.

### /paywall (decommissioned redirect)  [L1]  state=dead
paths: app/paywall/page.tsx
purpose: Guardrail-#2 tombstone: the old consumer-checkout route now server-redirects to /how-it-works so stale external links land coherently.
risks:
  - None found in code — no Stripe import, no render, unconditional redirect; not in sitemap. Correctly dead.
checks:
  - curl -I https://honestfuneral.co/paywall — expect 307/308 to /how-it-works.
  - Founder GSC question: does /paywall still show indexed or receiving impressions? If yes, consider a permanent 308 semantic check (Next redirect() in RSC is 307) so link equity consolidates.

### Spanish i18n drafts  [docs]  state=built-unproven
paths: docs/i18n-es/where.md, docs/i18n-es/decide.md, docs/i18n-es/grief.md, docs/i18n-es/guidance-scenarios.md, docs/i18n-es/worksheet.md, docs/i18n-es/after-hospice.md
purpose: Human-review-gated Spanish drafts (usted register, 'DO NOT ship as-is' header) for 6 core surfaces; deliberately not deployed.
risks:
  - No live /es routes, no hreflang, html lang=en only — all consistent with the gate; the /accessibility page honestly says 'in progress'. The only risk is drift: drafts translate page copy as of ~May–June; the underlying English pages (esp. /where, homepage lanes) changed in the Day-4 dual-lane rework, so the drafts are likely stale when review finally happens.
  - Miami city blurb promises 'Spanish-language services widely available; ask if you need them' while the product itself is English-only — mild expectation mismatch on a page targeting a heavily Spanish-speaking metro.
checks:
  - Diff each draft's EN source lines against the current live English page before human review — re-extract rather than review stale text.
  - Confirm no /es route or hreflang shipped anywhere (grep is clean today; keep it that way until human sign-off, per memory's translation gate).


## docsDrift
NOTES: Method: full inventory of all 75 files under docs/ (61 top-level + 8 sales/ + 6 i18n-es/) plus the root LAUNCH_PLAYBOOK.md that ROADMAP's doc-status table cites; classification from headers + git last-commit dates, with deep greps where status was ambiguous (CAHPS usage, business-plan version, benchmark-spec ship-state, trust-page routes, copy constants). Headline findings for the audit day: (1) Only 10 docs carry supersession/status banners; the three unmarked superseded master plans (PLAN_OF_ATTACK, ATTACK_PLAN, EXECUTION_PLAN) plus ENGINEERING_BACKLOG are the highest agent-misdirection risk. (2) Two flat contradictions with current law: TRUST_SPINE's '$49 verified on main' fee note (paywall dead since 2026-06-26) and MARKETING_AUTHORITY's 'Not built' status for the now-shipped Fair-Price Index + trust pages. (3) A version fork on the money doc: in-tree BUSINESS_PLAN.md is the 4k-word v1; the 21.6k-word v2 with the Day-8 Stripe pricing lives on open PR #167 — merge order matters for the Day-8 session. (4) One strategy contradiction inside otherwise-current sales collateral: HOSPICE_GTM leads with the CAHPS score as the sales anchor, which the 2026-07-01 market-research law and the v2 outreach canon retired; the sales/ kit itself already complies. (5) Several shipped-work docs still read as pending (P3_PARTNER_LAYER 'awaiting migration', HOSPICE_FAMILY_ROADMAP 'live checklist', FAIR_PRICE_INDEX 'spec', BENCHMARK_EXPANSION_SPEC 'NOT shipped' while at least one spec item is in lib/pricing-data.ts). (6) The rename-on-hold banners (2026-07-27) are present and correct in PRODUCT_PLAN_2026-Q3, SPRINT_DAYS_5-9, and NAMING_SPRINT. Layer field: all entries use 'docs' per the task; states use CURRENT / REFERENCE / STALE(-marked/-unmarked) / CONTRADICTORY vocabulary with specifics in risks.
ORPHANS: ["docs/PLAN_OF_ATTACK.md \u2014 superseded master plan, NO banner, stale PR #127 still open against it", "docs/ATTACK_PLAN.md \u2014 superseded product-first plan, NO banner", "docs/EXECUTION_PLAN.md \u2014 superseded week-by-week plan, NO banner", "docs/ENGINEERING_BACKLOG.md \u2014 top 'build next' item already shipped; predates both sprints", "docs/PAYMENT_DECOMMISSION.md \u2014 plan for work completed 2026-06-26, no completion stamp", "docs/REFUND_SOP.md \u2014 its own banner's retention condition ('until the charge is gone') expired 2026-06-26", "docs/TRUST_SPINE.md \u2014 asserts '$49 fee verified on main' (contradicts guardrail #2 reality); specs a /promise route that never shipped", "docs/SCORECARD.md \u2014 'weekly' living tracker frozen at 2026-06-24 with a now-false migration-pending claim", "docs/BUSINESS_PLAN.md \u2014 in-tree v1 superseded by unmerged PR #167 v2 (the pricing source for Day 8)", "docs/HOSPICE_GTM.md \u00a70 \u2014 CAHPS-anchored pitch conflicts with the never-pitch-CAHPS-repair law and the retired CAHPS hook", "LAUNCH_PLAYBOOK.md + docs/LAUNCH_CHECKLIST.md + docs/PAYWALL_RECOMMENDATION.md \u2014 bannered history; deletion candidates for the prune", "app/planning vs app/plan-ahead \u2014 possibly still-unresolved duplicate flagged in FUNCTIONAL_AUDIT (May) \u2014 verify live"]

### Strategy core (bible + roadmap + wedge)  [docs]  state=CURRENT
paths: docs/OPERATING_PLAN.md, docs/ROADMAP.md, docs/THE_WEDGE.md
purpose: The company bible, the guardrail-aligned execution frame, and the product north star that CLAUDE.md points every session at.
risks:
  - ROADMAP.md (last touched 2026-07-01) describes L1 status pre-Days-4-7 — Fair-Price Index/hospice pages/dual-lane homepage now shipped but ROADMAP still frames P4 Index as future work
  - CLAUDE.md names ROADMAP.md 'the execution plan' while memory + PRODUCT_PLAN_2026-Q3.md claim master-plan status — two competing 'what next' pointers for agents
  - ROADMAP's doc-status table cites root LAUNCH_PLAYBOOK.md, which is fully-superseded history
checks:
  - Diff ROADMAP.md P1-P4 statuses against merged main @ 56c12e4 and stamp what shipped
  - Decide the single execution-plan pointer (ROADMAP vs PRODUCT_PLAN_2026-Q3) and update CLAUDE.md to match
  - Verify OPERATING_PLAN Part 5/8 claims still match the channel-survival rules added 2026-07-01

### Active sprint execution docs  [docs]  state=CURRENT
paths: docs/PRODUCT_PLAN_2026-Q3.md, docs/PRODUCT_SPRINT_2026-07-16.md, docs/SPRINT_DAYS_5-9_BUILDSHEETS.md, docs/NAMING_SPRINT_2026-07.md
purpose: The 13-week master plan, the 10-day sprint frame, the verified Days-5-9 buildsheets (Days 8-9 still to run), and the rename-on-hold record.
risks:
  - Rename-on-hold banners were added 2026-07-27 and are accurate, but body text below them still narrates Rename Day as scheduled — an agent skimming past the banner could re-activate rename prep
  - SPRINT_DAYS_5-9 line anchors were verified against b19983a; Days 5-7 have since merged, so Day-8/9 anchors may have drifted (the doc itself says re-verify)
checks:
  - Confirm Day 8/9 sections still match main @ 56c12e4 before execution (grep-locate, don't trust line numbers)
  - Confirm every rename-inert item (Day-8 action C, Day-9 lanes) is actually skipped in the Day-8/9 sessions

### Superseded/completed sprint buildsheets  [docs]  state=STALE (correctly banner-marked / completed)
paths: docs/PRODUCT_SPRINT_2026-07-16_BUILDSHEETS.md, docs/PRODUCT_WEEK_2026-07-13.md, docs/PRODUCT_WEEK_2026-07-13_BUILDSHEETS.md
purpose: Execution depth for the completed Jul-13 product week and the original sprint buildsheets whose Days 5-9 sections are banner-superseded by SPRINT_DAYS_5-9_BUILDSHEETS.md.
risks:
  - PRODUCT_SPRINT buildsheets carry a correct supersession banner but remain 2000+ lines of executable-looking spec — highest accidental-ingestion risk in the tree
  - Product Week docs have no completed stamp; they read as a live plan
checks:
  - Add a one-line 'EXECUTED, PRs #148-#156' header to both PRODUCT_WEEK files
  - Verify the supersession banner on PRODUCT_SPRINT_2026-07-16_BUILDSHEETS covers exactly Days 5-9 and marks Days 1-4 as shipped history

### Unmarked stale master plans (the dangerous trio)  [docs]  state=STALE-unmarked — superseded by PRODUCT_PLAN_2026-Q3.md, no banners
paths: docs/PLAN_OF_ATTACK.md, docs/ATTACK_PLAN.md, docs/EXECUTION_PLAN.md
purpose: Three successive 'single master battle plan' docs (full-synthesis, product-first waves, week-by-week launch sequence), all written 2026-06-25→07-01.
risks:
  - None of the three carries any supersession banner despite being superseded twice over — an agent told to 'read the plan' can land on any of them and execute a month-old strategy
  - PLAN_OF_ATTACK.md §16 says 'first cold email ~2-3 weeks out' from Jul 1 — dead timeline; stale PR #127 against it is still open (Day-9 truth-pass item)
  - EXECUTION_PLAN.md's week-numbered gates (first pilot ~week 8) no longer correspond to any real calendar
  - ATTACK_PLAN.md's 'what already exists' inventory predates the portal, hospice pages, and Index
checks:
  - Add FULLY SUPERSEDED banners pointing at PRODUCT_PLAN_2026-Q3.md + GO_TO_MARKET.md (Day-9 docs-truth item)
  - Close or refresh PR #127
  - Grep other docs for links into these three and repoint

### Business plan (version fork)  [docs]  state=CONTRADICTORY — in-tree copy is the old ~4.1k-word June v1; the canonical ~21.6k-word v2 (with §7.3 recommended price list) lives on OPEN PR #167
paths: docs/BUSINESS_PLAN.md
purpose: The master business document — pricing, unit economics, kill criteria — feeding the founder's Stripe institutional-pricing decision.
risks:
  - Any session reading the tree gets v1 economics while memory and Day-8 (Stripe billing) depend on v2's §7.3 tiers ($4,800/$9,600/$18,000)
  - FINANCE_FUNDRAISING.md still says '~$1-2 per advocacy case' AI cost vs v2's measured ~$0.10-0.25 — same-fork symptom
checks:
  - Merge or explicitly rebase PR #167 before/with Day 8 so the tree carries the pricing the Stripe products encode
  - After merge, grep docs for the old $1-2/case cost figure and reconcile

### GTM current path + finance  [docs]  state=CURRENT (SCORECARD degraded — living tracker never updated)
paths: docs/GO_TO_MARKET.md, docs/FINANCE_FUNDRAISING.md, docs/MARKET_READINESS.md, docs/SCORECARD.md
purpose: Phase-0 gate list to the first cold email, the money model, the company-setup checklist, and the weekly go/no-go tracker.
risks:
  - SCORECARD.md 'current reading' is frozen at 2026-06-24 and still says outcomes migration pending (applied 2026-07-09) — a weekly-review doc that has never been reviewed is silent process failure
  - MARKET_READINESS says Delaware C-corp while LAWYER_BRIEF says LLC — the entity drift memory flags for counsel
  - FINANCE_FUNDRAISING per-case AI cost exceeds even the v2 planning ceiling
checks:
  - Update SCORECARD's current reading against live data (cases, partners, hospice contacts) or demote it to REFERENCE explicitly
  - Verify GO_TO_MARKET Phase-0 gate states (migrations applied? counsel retained? pilot hospice named?) match reality
  - Resolve the LLC-vs-C-corp statement across MARKET_READINESS/LAWYER_BRIEF

### Hospice sales playbook + kit  [docs]  state=CURRENT with one CONTRADICTORY thread (CAHPS framing)
paths: docs/HOSPICE_GTM.md, docs/HOSPICE_COLLATERAL.md, docs/sales/README.md, docs/sales/OUTREACH_SEQUENCE.md, docs/sales/DISCOVERY_SCRIPT.md, docs/sales/DEMO_SCRIPT.md
purpose: Everything the founder uses to book, run, and close the first hospice pilot — the collateral for the 90-day goal.
risks:
  - HOSPICE_GTM.md §0 anchors the pitch on CAHPS scores ('we sell into the CAHPS score') — the 2026-07-01 market-research law says NEVER pitch CAHPS repair (scores already ~91%) and Business Plan v2 retired the CAHPS hook; the sales/ kit itself is compliant (referral-reputation lead, explicit 'no CAHPS-as-more-money' voice check) but its parent playbook is not
  - DEMO/DISCOVERY scripts instruct pulling the prospect's Care Compare emotional-support score to 'reference by number' — verify this reads as rapport, not score-repair pitching
  - Founder said 'not selling just yet' (Day 5) — one-pager copy question parked; PILOT_AGREEMENT has no counsel review
  - HOSPICE_COLLATERAL's 'one approved handoff line' predates lib/copy.ts canonical constants (GATE sentence, FREE_WITH_OR_WITHOUT_LINK) — memory already flags sheet drift for Day-9 verbatim reconciliation
checks:
  - Rewrite HOSPICE_GTM §0 to the referral-reputation-canonical framing and demote CAHPS to a compliance-file footnote
  - Diff HOSPICE_COLLATERAL's approved lines against lib/copy.ts constants verbatim
  - Run DEMO_SCRIPT's staged GPL through live /analyzer and /partner/r/[token]/check to confirm the promised ≈$9k flag still reproduces post-Day-7 pricing changes
  - Verify demo routes named in DEMO_SCRIPT (/portal/login, /portal/links, /partner/sample-hospice, /admin/outcomes) all resolve live

### Legal + compliance set  [docs]  state=CURRENT (counsel retention is a live L3 gate)
paths: docs/LAWYER_BRIEF.md, docs/COMPLIANCE_ADDENDUM.md, docs/ANTI_STEERING_EVIDENCE.md, docs/LAWYER_OUTREACH.md, docs/CLAIMS_VALIDATION.md
purpose: Counsel-ready briefs, the pivot's compliance delta, code-cited anti-steering exhibit, the outreach email to retain counsel, and the claims register.
risks:
  - LAWYER_OUTREACH is still headed 'QUEUED — send next week' from 2026-07-01, four weeks stale; unclear whether trademark/TESS counsel engagement (naming sprint) already opened a counsel relationship this doc doesn't know about
  - ANTI_STEERING_EVIDENCE cites directory.ts line numbers (38-56) that drift with merges
  - CLAIMS_VALIDATION faith section still 🔴 — accurate, but the pending clergy sign-off is a standing content-liability
checks:
  - Confirm the counsel state (TESS spend, retained or not) and update LAWYER_OUTREACH's status header
  - Re-verify ANTI_STEERING_EVIDENCE's file:line cites against current main
  - Check CLAIMS_VALIDATION rows against surfaces shipped since 2026-07-01 (hospice pages, Fair-Price Index claims)

### Ops + infra runbooks  [docs]  state=CURRENT (SECURITY + PRIVACY_RETENTION aging)
paths: docs/PROD_SETUP.md, docs/SMOKE_TEST.md, docs/TRUST_OPS_RUNBOOK.md, docs/FAMILY_SUPPORT_SOP.md, docs/ANALYTICS.md, docs/SECURITY.md
purpose: How to stand up prod, prove outreach safely, protect trust/data, support a family by hand, and measure without PII.
risks:
  - PRIVACY_RETENTION.md (2026-06-09) table omits every post-pivot data class — hospices, partner_leads, price_list_analyses consent shape, GPL ingest, regional_benchmarks; TRUST_OPS_RUNBOOK papers over this by extension rather than the base doc being fixed
  - SECURITY.md's CSP report-only 'watch 1-2 weeks then enforce' launch follow-up appears never executed
  - SMOKE_TEST notes the leftover pending_payment status name — fine, but only if never 'cleaned up' naively
checks:
  - Regenerate PRIVACY_RETENTION's storage table from supabase/BOOTSTRAP.sql tables list
  - Check whether CSP is still report-only in next.config.ts and either enforce or re-date the follow-up
  - Run npm run smoke:check headless half to confirm it still passes on current main

### Marketing/SEO authority playbook  [docs]  state=STALE — playbook valid, status claims contradict shipped code
paths: docs/MARKETING_AUTHORITY.md, docs/FAIR_PRICE_INDEX.md, docs/TRUST_SPINE.md
purpose: The authority/citation strategy and the specs for the Fair-Price Index and trust-spine pages.
risks:
  - MARKETING_AUTHORITY's lever table says Fair-Price Index and trust spine 'Not built' — app/fair-price-index, app/methodology, app/corrections all exist and shipped (Index merged Day 7, 2026-07-27)
  - TRUST_SPINE opens with 'the live family charge is $49, verified on main' — flatly contradicts the dead paywall (guardrail #2, decommissioned 2026-06-26)
  - TRUST_SPINE specs a /promise page; no app/promise route exists (nearest live surface is /our-role) — spec vs ship divergence
  - FAIR_PRICE_INDEX still headed 'spec / build-priority #4' with no shipped stamp — the live index's methodology should now be reconciled against this spec (guardrail #4 depends on the methodology page matching the shipped math)
checks:
  - Diff FAIR_PRICE_INDEX spec's n>5/significance gates against the shipped Day-7 implementation and the live /methodology copy
  - Delete or correct TRUST_SPINE's $49 fee note; mark the three shipped pages and resolve /promise vs /our-role
  - Update MARKETING_AUTHORITY's status column and repoint P1 priorities at what's actually next (citations, press)

### Partner-layer specs (shipped, status headers stale)  [docs]  state=REFERENCE (PARTNER_PORTAL_SPEC correctly bannered; others carry stale status headers)
paths: docs/P3_PARTNER_LAYER.md, docs/PARTNER_PORTAL_SPEC.md, docs/SITE_REFORM_ROADMAP.md, docs/B2B2C_UX_RESEARCH_SYNTHESIS.md, docs/HOSPICE_FAMILY_ROADMAP.md
purpose: Design/spec lineage for the L3 portal, the two-zone site reform, the UX research base, and the completed hospice-family feature checklist.
risks:
  - P3_PARTNER_LAYER still says 'migration-deferred; awaiting founder go' — all 9 prod migrations applied 2026-07-09
  - HOSPICE_FAMILY_ROADMAP header still says 'the live build checklist' with 35/36 boxes checked — done, not live
  - SITE_REFORM_ROADMAP's Stage 2 buyer-side reform substantially overlaps the shipped Day-4 dual-lane homepage; no reconciliation note — an agent could re-execute Stage 2
  - B2B2C_UX_RESEARCH_SYNTHESIS is fine as a permanent reference but its file-level recommendations predate Days 4-7 surfaces
checks:
  - Stamp P3_PARTNER_LAYER and HOSPICE_FAMILY_ROADMAP as completed with dates
  - Annotate SITE_REFORM_ROADMAP stages with what Day 4 delivered vs what remains
  - Confirm the one unchecked HOSPICE_FAMILY_ROADMAP item is the intentionally-gated Spanish translation

### Engineering backlog (superseded by sprint cadence)  [docs]  state=STALE-unmarked
paths: docs/ENGINEERING_BACKLOG.md
purpose: Sized code tickets against main — but frozen at 2026-07-04, before Product Week and the 10-day sprint replaced backlog-driven work.
risks:
  - Its #1 'build next' ticket (AI partner digest) shipped weeks ago (the digest cron is in CLAUDE.md's L3 inventory) — the doc actively misdirects
  - PROD_SETUP and LAUNCH_CHECKLIST still point readers here as a current source
  - Its 'explicitly not next' guardrail section may still be valid law worth preserving
checks:
  - Mark superseded by the sprint/master-plan cadence or regenerate against main @ 56c12e4
  - Salvage the 'explicitly not next / don't build without founder call' list into whichever doc survives

### Bannered dead docs (paywall era)  [docs]  state=STALE — all superseded; all except PAYMENT_DECOMMISSION carry correct banners
paths: docs/LAUNCH_CHECKLIST.md, docs/PAYWALL_RECOMMENDATION.md, docs/REFUND_SOP.md, docs/PAYMENT_DECOMMISSION.md, LAUNCH_PLAYBOOK.md
purpose: The consumer-$49-era launch/refund/paywall docs and the decommission plan that killed that model.
risks:
  - PAYMENT_DECOMMISSION has NO completion banner — it reads as an active plan ('is being removed') for work finished 2026-06-26
  - REFUND_SOP's banner says 'kept for history until the charge is gone' — the charge is gone; its own retention condition expired
  - LAUNCH_CHECKLIST's 211 items remain a huge, plausible-looking target for a lost agent despite the banner
checks:
  - Add a 'EXECUTED 2026-06-26 (PRs #49/#50)' banner to PAYMENT_DECOMMISSION
  - Decide archive-vs-delete policy for the whole group (git history preserves them) — prime candidates for the prune this audit feeds

### Research evidence / audit trails  [docs]  state=REFERENCE (accurate, dormant, pending human/counsel sign-off)
paths: docs/MERP_FINDINGS.md, docs/STATE_BODY_CARE_FINDINGS.md, docs/FAITH_REVIEW_FINDINGS.md, docs/GLOSSARY_REVIEW_FINDINGS.md, docs/BENCHMARK_EXPANSION_SPEC.md
purpose: Source-of-truth audit trails behind shipped content (MERP navigator, /rights state law, faith profiles, glossary) and the benchmark line-item expansion spec.
risks:
  - BENCHMARK_EXPANSION_SPEC header says 'NOT shipped. Awaiting Ryan's approve/redline' but lib/pricing-data.ts already contains at least the refrigeration-shelter perUnit item from the spec — partial ship with a wrong status header; unclear which numbers got founder sign-off
  - All four findings docs share the standing 'pending expert review' liability — fine, but the audit should confirm live-page disclaimers still render
checks:
  - Reconcile BENCHMARK_EXPANSION_SPEC item-by-item against lib/pricing-data.ts and record which shipped with whose approval
  - Spot-check that /medicaid-estate-recovery and /rights still carry their attorney/board disclaimers on every state row

### Spanish i18n draft queue  [docs]  state=REFERENCE — intentionally dormant, gate is by design
paths: docs/SPANISH_REVIEW_QUEUE.md, docs/i18n-es/after-hospice.md, docs/i18n-es/decide.md, docs/i18n-es/grief.md, docs/i18n-es/guidance-scenarios.md, docs/i18n-es/where.md
purpose: Machine-draft Spanish translations, deliberately hard-gated on human bilingual review before anything ships.
risks:
  - Source pages have kept evolving since the 2026-07-03 draft date (e.g. homepage/decide changes in Days 4-7) — the EN side of the EN/ES pairs is silently drifting from the live JSX, raising re-translation cost the longer review waits
checks:
  - Sample 3 EN source lines per file against current page.tsx text to size the drift
  - Confirm no i18n-es content leaked into any live route

### Historical snapshots (May-June era)  [docs]  state=STALE / REFERENCE — historical, mostly harmless
paths: docs/INTEGRATION_STATUS.md, docs/FUNCTIONAL_AUDIT.md, docs/DATA_PLAN.md, docs/UTAH_HOMES_SOURCING.md, docs/IDEA_LICENSED_FD_MARKETPLACE.md
purpose: Point-in-time branch/link-rot snapshots, the pre-launch national data plan, the Utah homes sourcing guide, and a parked marketplace idea.
risks:
  - FUNCTIONAL_AUDIT's open IA question (/planning vs /plan-ahead duplicate pages) was 'left for whoever owns the IA' in May and may STILL be unresolved — a live SEO/UX defect hiding in a stale doc
  - DATA_PLAN's 'current state' (193 raw Utah homes, in-memory ZIP filter) is two months old; unclear if the indexed-query scaling fix ever happened
  - IDEA_LICENSED_FD_MARKETPLACE gates its revisit on the retired LAUNCH_CHECKLIST
  - UTAH_HOMES_SOURCING's 30-60 vetted-homes target — actual vetted count unverified
checks:
  - Check whether app/planning still exists and still duplicates /plan-ahead; redirect if so
  - Probe prod funeral_homes for vetted count vs the sourcing target
  - Verify directory lookup is still select-all-filter-in-memory or fixed

### Positioning collateral (verify-before-use)  [docs]  state=REFERENCE — accurate framing, figures need verification before external use
paths: docs/INVESTOR_TEASER.md, docs/BATTLECARD.md, docs/AI_STRATEGY.md
purpose: Investor one-pager, competitive battlecard, and the (partially-superseded-bannered) AI/data moat strategy.
risks:
  - Both teaser and battlecard self-flag that competitor figures (Empathy raise, ~18% posting prices, EAP PEPM anchors) are mid-2026 approximations — fine internally, guardrail-#4 risk if pasted externally unverified
  - AI_STRATEGY's banner is honest but its $49-anchored unit-economics sections remain in the body
checks:
  - Before any investor/hospice send: re-source the Empathy, 18%-GPL, and EAP-PEPM figures
  - Confirm teaser's ~5,800 hospice count against the imported 6,852-row CMS dataset (internal number now beats the public approximation)


## quality
NOTES: SUITE STATS (measured, this worktree): 63 test files, 638 tests, all passing, ~1.0s wall (vitest v4.1.8; transform 2.4s, import 4.2s, tests 500ms). Runner: `npm run test` = `vitest run`; config vitest.config.ts (node env, includes **/*.test.ts, stubs `server-only` via test/stubs so server modules unit-test under plain Node). Test locations: lib/__tests__ (44 files), lib/negotiation|partner|bundling-detection/__tests__ (11), app/api/**/__tests__ (9 route-adjacent), scripts/__tests__ (1, BOOTSTRAP.sql regen pin), test/evals (1). No component/E2E/browser tests anywhere — all coverage is pure-function and route-handler level with scripted Supabase fakes; page wiring (app/**/page.tsx) is verified only by `next build` and manual live checks. COVERAGE VERDICTS on the ten named surfaces: analyzer totals COVERED (unit) / route untested; send kill-switch COVERED but second switch OUTREACH_NOTIFICATIONS_ENABLED UNCOVERED and no single-send-path architecture test; vetted-directory gate PARTIAL (fake ignores eq args — the vetted filter itself is unasserted); partner seat auth COVERED but resolvePartnerToken (L3 report-token gate) UNCOVERED; consent PARTIAL (read-side pinned, write-side incl. the load-bearing declined-never-persists fallback untested); benchmarks tier COVERED; pricing catalog PARTIAL (no per-item LINE_ITEMS invariant test); glossary/faith UNCOVERED; rate limiting COVERED (hand-maintained route list); admin auth COVERED (no route-conformance test). QUALITY CULTURE SIGNAL: tests are unusually intentional — many encode business law verbatim (copy.test.ts pins two family-facing sentences character-exact; readability gate enforces grade-level ceiling on family copy; nominate/claim tests are titled 'channel-survival invariants' and pin consent-gated email capture; partner-report tests pin the n<5 suppression gate = guardrail #4). Several tests exist because a specific production bug shipped (hallucinated stated total, draft-letter rate-limit sub-path gap, founder-ingest dedupe collapse, phantom pricing ids) — regressions there are re-shipping known incidents. For the audit plan: the biggest systemic gaps are (1) no CI, (2) zero page-level/E2E coverage meaning live-URL probes are the ONLY check on page wiring, (3) the three uncovered kill-switch/token/consent-write paths above, which are exactly the guardrail-carrying code.
ORPHANS: ["No CI pipeline exists at all \u2014 there is no .github directory, so the 638-test suite, typecheck, lint, and build run ONLY when a human/agent runs them locally per CLAUDE.md release discipline; nothing machine-enforces green-before-merge", "lib/__tests__/stripe.test.ts tests only fmtCents \u2014 near-empty coverage of lib/stripe while Stripe is being repurposed to institutional billing (Day 8); not wrong, but it will look like coverage where there is none once billing code lands"]

### Analyzer totals math (quote-checker arithmetic)  [L1]  state=covered (unit) / partial (route-level)
paths: lib/__tests__/analyzer-totals.test.ts, lib/__tests__/analyzer-display.test.ts, lib/__tests__/checker-pipeline.test.ts, test/evals/fixtures.test.ts, lib/negotiation/__tests__/price-list-parse.test.ts, app/api/analyze-price-list/route.ts
purpose: The core is-this-quote-fair math a family sees: reconciled totals, per-item overcharge, savings headline, coverage signal.
risks:
  - checker-pipeline.test.ts is an in-test MIRROR of /api/analyze-price-list (deterministic path, no Claude, no benchmark overrides) — the real route in app/api/analyze-price-list/route.ts has NO route test, so route-only logic (zod schema, benchmark-override consult, persistence branch) can drift silently from the pinned mirror
  - analyzer-totals.test.ts guards a real production failure (hallucinated stated total clamping fair total to $0) — regression here silently shows families wrong overcharge dollars, guardrail #4 territory
checks:
  - Write a route-level test for app/api/analyze-price-list POST (mock callClaude): asserts totals/violations shape matches the checker-pipeline mirror on the same fixture text
  - Add a diff test that the mirror in checker-pipeline.test.ts and the route produce identical results for the deterministic (naiveExtract) path
  - Live probe: POST a known fixture to prod /api/analyze-price-list and compare totalQuoted against the golden expected.json

### Negotiation send kill-switch (OUTREACH_LIVE)  [L2]  state=covered (send fn) / uncovered (second switch)
paths: lib/negotiation/__tests__/send.test.ts, lib/negotiation/send.ts, app/api/cron/quote-notifications/route.ts
purpose: Guarantees no real email ever reaches a funeral home unless OUTREACH_LIVE=true; dry_run rows otherwise.
risks:
  - send.test.ts proves sendOutreachForNegotiation honors the switch (off→dry_run+zero sendEmail calls, denylist declined even live, failed send stays pending/retryable, idempotent re-run) — but no test proves it is the ONLY send path; a new raw sendEmail-to-a-home elsewhere would bypass the kill switch invisibly
  - OUTREACH_NOTIFICATIONS_ENABLED (family quote notifications, app/api/cron/quote-notifications/route.ts) has ZERO test coverage — grep confirmed no test references it; a regression could email families without the switch
checks:
  - Add an architecture test: grep/AST assert that lib/email sendEmail with a funeral_home address is only imported into lib/negotiation/send.ts (single-send-path invariant as a test, like the RATE_LIMITS coverage meta-test)
  - Write a unit test for the quote-notifications cron gating on OUTREACH_NOTIFICATIONS_ENABLED
  - Live probe: confirm prod env has OUTREACH_LIVE unset and smoke:check reports the safe state

### Vetted-directory gate (only vetted homes contactable)  [L2]  state=partial
paths: lib/negotiation/__tests__/directory.test.ts, lib/negotiation/directory.ts, scripts/smoke-check.mjs
purpose: Ensures outreach can only ever target active+vetted+emailed homes and degrades to empty (never a fake placeholder) for families.
risks:
  - The test's fake query chain (directory.test.ts fakeClient) IGNORES eq() arguments — deleting .eq("vetted", true) at lib/negotiation/directory.ts:41 would pass every unit test; the vetted gate itself is asserted nowhere, only behavior around empty/error/no-email results
  - smoke-check.mjs re-implements the filter (active=true, vetted=true, email not null) as a live DB probe rather than verifying the code applies it — the two can drift
checks:
  - Upgrade directory.test.ts's fake to record eq() args (pattern already exists in lib/partner/__tests__/auth.test.ts scriptSvc) and assert filters include active:true AND vetted:true AND the not-null email clause
  - Live probe: run npm run smoke:check against prod and confirm contactable count matches expectation; spot-check that an unvetted row is excluded

### Partner auth (portal seats) + report-token flow  [L3]  state=covered (seat auth) / uncovered (resolvePartnerToken)
paths: lib/partner/__tests__/auth.test.ts, lib/partner/__tests__/team.test.ts, lib/partner-auth.ts, app/partner/r/[token]/page.tsx, app/partner/r/[token]/links/page.tsx, app/partner/r/[token]/check/page.tsx
purpose: Gates the sellable institutional surface: portal seat auth (requirePartnerMember/Api) and the tokenized hospice report pages.
risks:
  - Seat auth is strongly tested (anon redirect, non-member 404-not-403, user_id + deactivated_at scoping, guarded invite binding, paused-org park, owner gate, inactive-org 403) — but lib/partner-auth.ts resolvePartnerToken, the ONLY gate on /partner/r/[token] (+/links +/check), has NO test: the <16-char rejection, unknown-token null, and the caller-must-check-active contract are all unpinned
  - A regression that returns an inactive partner's report (callers must check active themselves per the doc comment) would leak cohort data on the exact surface a pilot hospice sees
checks:
  - Write lib/__tests__/partner-auth.test.ts: short token → null without querying, unknown token → null, table-missing degrade → null, and a caller-side test that each /partner/r/[token] page notFound()s an inactive partner
  - Live probe: fetch /partner/r/<random-48-chars> and confirm 404; confirm a real token renders only aggregate (suppressed n<5) data

### Consent persistence (contributed three-state)  [L2]  state=partial
paths: lib/__tests__/benchmark-sources.test.ts, app/api/analyze-price-list/route.ts, lib/benchmark-sources.ts
purpose: Families' explicit decline (contributed=false) must never feed the benchmark moat; legacy NULL/absent rows stay grandfathered.
risks:
  - READ side is well pinned (benchmark-sources.test.ts: false excluded, true/NULL/pre-migration included; staff/partner-member exclusion; degrade-to-not-excluding on member-fetch failure) — but the WRITE side (route persisting contributed, esp. the missing-column legacy-schema fallback at app/api/analyze-price-list/route.ts:324-354 where a DECLINED analysis must NOT persist as a consent-less row) has no test; this is the load-bearing Day-3 consent-fallback rule and it is enforced only by code review
  - A silent write-path regression would ingest declined families' price data into the public benchmark pipeline — a trust/legal breach, not just a bug
checks:
  - Write a route-persistence test (mock supabase insert): contributed=false + missing-column error → row is NOT inserted; contributed=true → inserted with contributed:true
  - Add a pipeline invariant test: a row with contributed=false can never appear in aggregateBenchmarks input regardless of tier
  - Live probe (prod, service role, read-only): count price_list_analyses where contributed=false and confirm none carry benchmark-eligible flags downstream

### Benchmarks tier resolution + promote pipeline  [L1]  state=covered
paths: lib/__tests__/benchmarks-store.test.ts, lib/__tests__/benchmark-pipeline.test.ts, app/api/admin/benchmarks/promote/__tests__/route.test.ts, lib/__tests__/pricing-data-tiers.test.ts
purpose: Resolves which fair-price band (verified/community/modeled) a zip sees and how founder-ingested data is promoted into public benchmarks.
risks:
  - Well covered: scope resolution (zip3/metro/state), tierForZip minimum-n honesty (badge shows the WEAKEST n), community fallback, catalog-id filtering, sources sanitization, degrade-to-empty on query throw, founder_ingest per-document dedupeScope (the n=1 collapse bug). Residual risk is data, not code: prod regional_benchmarks was probed EMPTY at Day 7 — every tier test passes while the live site serves only modeled bands
  - The n>5 public-claim guardrail is enforced in aggregate/suppression tests; regression risk is mostly in NEW scope types being added without extending the precedence tests
checks:
  - Live probe: hit tier-exposing pages/API for a seeded zip once Migration B / promotion runs and confirm the badge tier matches regional_benchmarks rows
  - Add a test pinning scope PRECEDENCE explicitly (zip3 beats metro beats state) if not already asserted beyond the winning-override case

### Pricing data integrity (LINE_ITEMS catalog)  [L1]  state=partial
paths: lib/__tests__/funeral-homes-pricing.test.ts, lib/__tests__/checker-pipeline.test.ts, lib/pricing-data.ts, lib/__tests__/merp-by-state.test.ts, lib/__tests__/state-body-care.test.ts
purpose: Every published number must trace to the audited catalog (guardrail #4): fair bands, predatory thresholds, per-service totals.
risks:
  - funeral-homes-pricing.test.ts pins service TOTALS to the catalog (no phantom ids, summed bands positive and ordered low<high<predatory) and documents the 2026-07 double-counting regression — but there is NO per-item invariant test over ALL of LINE_ITEMS (fairLow<fairHigh<predatoryAt for each entry, per-unit flags sane, citation/source presence); a single mis-keyed item could invert a band and misclassify quotes while every existing test passes
  - merp-by-state and state-body-care DO have explicit VERIFIED_* integrity suites — the pattern exists, it just was never applied to the core pricing catalog
checks:
  - Write a LINE_ITEMS integrity test iterating every catalog entry: 0 < fairLow < fairHigh < predatoryAt, unique ids, valid categories, per-unit items excluded from COLA adjustment (the checker-correctness invariant)
  - Content audit: sample 5 catalog entries against their cited sources for currency (data last verified date)

### Glossary + faith content shape  [L1]  state=uncovered
paths: lib/glossary.ts, lib/faith-traditions.ts
purpose: Trust-spine reference content (glossary terms, faith tradition guidance) that SEO pages and guides render.
risks:
  - Zero test coverage — no test file references either module (grep confirmed). A malformed entry (duplicate slug, empty definition, broken cross-reference) ships silently and only surfaces as a broken public page
  - Faith content was AI-verified once (2026-05-21, docs/FAITH_REVIEW_FINDINGS.md) but still lacks clergy sign-off; with no shape tests, an accidental edit to a verified claim has no tripwire
checks:
  - Write shape tests: unique slugs/ids, non-empty term+definition, any internal glossary cross-links resolve, faith traditions each have the required sections and live disclaimers
  - Consider a verbatim pin (copy.test.ts pattern) on the handful of faith claims that were explicitly corrected in the 2026-05-21 review

### Rate limiting  [infra]  state=covered
paths: lib/__tests__/rate-limit.test.ts, app/api/partner/nominate/__tests__/route.test.ts, app/api/partner/claim/__tests__/route.test.ts, lib/rate-limit.ts
purpose: Protects the Claude-calling public endpoints (real API cost) and abuse-prone partner lead forms.
risks:
  - Token bucket, refill, key independence, clientIp parsing all pinned; the meta-test pins that all 8 Claude-calling public POSTs have RATE_LIMITS entries (closing the draft-letter sub-path gap that shipped once) — but the meta-test enumerates a HAND-MAINTAINED list; a brand-new Claude route added without updating the list is invisible to it
  - In-memory limiter: per-instance on Vercel, resets on deploy — tests can't catch the multi-instance bypass by design
checks:
  - Replace the hand-list with route discovery: glob app/api for files importing callClaude and assert each pathname is in RATE_LIMITS
  - Live probe: 6 rapid POSTs to /api/partner/claim expecting a 429 on the 6th (this was verified live on Day 6 — re-verify post-deploys)

### Admin auth  [admin]  state=covered
paths: lib/__tests__/admin-auth.test.ts, lib/__tests__/admin.test.ts, lib/admin-auth.ts
purpose: Session + ADMIN_EMAILS allowlist gate on every /admin page and admin API (vetting, ingest, benchmarks promote, outcomes).
risks:
  - Guard functions fully tested (401 anon / 403 non-admin / pass allowlisted; page: encoded-next redirect, 404-not-403 so routes aren't confirmed) — but nothing enforces that every /admin route actually CALLS requireAdminPage/requireAdminApi; a new admin route that forgets the guard is untested territory (ingest-gpl's route test does cover its gate)
  - ADMIN_EMAILS unset in prod = every logged-in user is admin; only smoke-check warns about this, no test can
checks:
  - Add a conformance test: enumerate app/admin/**/page.tsx and app/api/admin/**/route.ts and assert each imports lib/admin-auth (string-level is fine)
  - Live probe: request 2-3 /admin pages logged out (expect login redirect) and as a non-admin account (expect 404)

### Smoke check script (launch-day headless probe)  [infra]  state=built-live (narrow scope)
paths: scripts/smoke-check.mjs, docs/SMOKE_TEST.md
purpose: Pre-flip safety probe: env-var readiness for live outreach + live count of contactable homes + a negotiation's outreach statuses.
risks:
  - It probes ONLY the outreach lane: OUTREACH_LIVE state, Resend/webhook/ADMIN_EMAILS/alert env presence, funeral_homes contactable count (duplicating the directory filter), optional --zip contact-order and --neg outreach statuses. It does NOT touch any HTTP surface, page render, partner/benchmark/hospice tables, or the analyzer — 'smoke check passed' says nothing about the site being up
  - Its directory filter is a copy of lib/negotiation/directory.ts logic, not shared code — drift between them would make the probe lie
checks:
  - Audit plan should NOT treat smoke:check as site health; add live-URL probes for the L1/L3 surfaces it skips
  - Consider extending it (or a sibling script) to probe partners/regional_benchmarks/hospices row counts — the exact tables whose emptiness has repeatedly surprised sessions

### Analyzer eval gate (model/prompt quality)  [infra]  state=built-live (manual, not CI)
paths: scripts/eval-analyzer.mjs, test/evals/gpl/, test/evals/fixtures.test.ts, test/evals/BASELINE.md
purpose: Scores the REAL extraction pipeline end-to-end (prompt→Claude→parse→match→reconcile→rules) against 14 golden GPL fixtures; the mandatory before/after gate for any model or prompt change.
risks:
  - Covers item recall/precision, cents/benchmark-id/qty/range accuracy, stated-total reconciliation, end-to-end totalQuoted, rules must-flag/must-not-flag — but it costs API cents, needs a running dev server, and is NOT in vitest/CI, so it only runs when someone remembers (the CLAUDE.md 'legally required' rule is process, not automation)
  - The .mjs carries a 5-line duplicate of reconcileTotalQuoted; drift is pinned by test/evals/fixtures.test.ts (imports the real function against the duplicate's exact cases) — keep that pin when either changes
  - Naive-regex fallback rows are flagged in the report as NOT measuring the model — an auditor must check that flag before trusting a score
checks:
  - Verify test/evals/BASELINE.md exists and reflects the current model (Day 1 recorded 100% on all 11 aggregates); re-run eval:analyzer if any prompt/model change shipped since
  - Confirm fixtures.test.ts still passes on current rules (it deterministically re-derives every mustFlag/matchedItemId golden without API cost)


## legacy
NOTES: Method: read every named file in full or in characterizing depth; inbound links mapped by grepping "/route" string literals across app/, components/, lib/ (script at scratchpad/links.sh); unimported-component scan done with a path-alias grep (initial run false-positived on everything due to a macOS-sed \\? incompatibility — corrected run yields exactly 4 candidates, of which EmailCaptureForm.tsx is a false positive via relative import in EmailCapture.tsx, leaving PhaseGating, CommercialSuppressionNotice, PriceTable as true orphans). Brand/price remnant grep is CLEAN: zero 'funerose', zero live '$49'/'$199' (comments + absence-asserting tests only, e.g. lib/__tests__/anniversary-emails.test.ts lines 94-95), one 'Open Farewell' mention in a lib/brand.ts comment correctly noting the rename hold. Key structural findings for the audit plan: (1) the paywall is genuinely dead — the surviving risk is not payment but PROMISE drift: three live pages (homepage, /planning, /for-funeral-homes) describe the funeral-home outreach service in present tense while OUTREACH_LIVE has never been on; (2) the real duplication problem is the three-way pre-need split (/plan-now strategic flow vs /planning legacy entry+email-capture vs /plan-ahead SEO pillar) compounded by inconsistent labels across footer//where//guides — a merge/reposition decision is the single highest-leverage cleanup; (3) /prep, /vault, /family, /timeline, /next-30-days, /briefing, /worksheet are complementary tools, not duplicates — their issues are sitemap inversion and share-key drift, not redundancy; (4) supply-side pages pass the guardrail tone check with two content flags (present-tense 'funded by the institutions we partner with'; never-run flow described as routine); (5) one designed safety feature (commercial suppression for crisis users) is silently dead and needs a founder keep/kill call. All paths are relative to repo root the repo root.
ORPHANS: ["app/paywall/page.tsx \u2014 deliberate redirect tombstone; zero inbound links (keep for stale external links)", "components/PhaseGating.tsx \u2014 ShowInPhase/HideInPhase never imported anywhere (PhaseProvider IS mounted in app/layout.tsx but no consumer gates on phase); dead", "components/CommercialSuppressionNotice.tsx \u2014 rendered nowhere; dead", "components/PriceTable.tsx \u2014 zero importers; superseded by /prices PriceCalculator and /prep Cheatsheet; dead", "lib/suppression.ts \u2014 zero importers; the cookie is never set or read; dead", "app/api/suppression/clear/route.ts \u2014 deletes a cookie nothing sets; dead endpoint", "lib/stripe.ts exports stripe() and stripeAvailable \u2014 zero callers (only fmtCents is used); dead pending the Day-8 institutional-billing decision", "lib/auth-paid.ts paid_at branch \u2014 nothing writes profiles.paid_at; effectively dead code inside a live helper", "CONTRADICTION: app/sitemap.ts includes /briefing (a localStorage-personal print page, no noindex) but omits /next-30-days (indexable, a top-level /where path linked from 11 files) \u2014 inverted", "CONTRADICTION: components/Brand.tsx footer labels the /plan-now link 'Plan ahead' while a distinct /plan-ahead route exists; /where routes 'I'm planning ahead' to a third page (/planning); the guides hub lists /plan-ahead + /planning but not /plan-now", "STALE COMMENT: app/guidance/[scenario]/CrisisUnexpected.tsx line 131 claims 'full commercial suppression' for a mechanism that no longer exists", "app/timeline \u2014 live but single inbound link (dashboard tile); watch analytics before further investment"]

### /paywall (retired redirect stub)  [L1]  state=dead (deliberate tombstone — 16-line redirect, zero inbound links in app/, components/, lib/; only comment-level mentions of 'paywall' remain elsewhere)
paths: app/paywall/page.tsx
purpose: Tombstone for the decommissioned consumer checkout: server-redirects any stale external link to /how-it-works.
risks:
  - None functional — it renders nothing and cannot charge anyone; the only cost is auditor confusion seeing a 'paywall' route in a company whose law is 'never charge the family'.
checks:
  - Probe live https://honestfuneral.co/paywall and confirm a redirect to /how-it-works (no paywall UI, no Stripe assets loaded).
  - Confirm /paywall is absent from app/sitemap.ts (verified absent in repo) and from robots-visible nav.
  - KEEP/KILL: recommend KEEP as-is — the redirect exists precisely for stale external links; deleting it would 404 them. Revisit only at a rename/domain move.

### Pre-need planning cluster — /plan-now (admission-week flow)  [L2]  state=built-live (sitemap priority 0.9; linked from Brand footer, /decide DecideFlow, /final-days, /briefing, PlanningAheadBanner)
paths: app/plan-now/page.tsx, app/plan-now/PlanNow.tsx, lib/plan-now.ts, components/PlanningAheadBanner.tsx, components/ReferralCoBrand.tsx
purpose: The one-sitting, 5-step hospice-admission-week plan (Phase 0 / research opportunity #1): options → local fair range → preferences → benefits sweep → who makes the first call; localStorage-only, ?ref= hospice co-brand, nothing transmitted — the strategically current pre-need surface.
risks:
  - Label collision: the Brand.tsx footer link to /plan-now reads 'Plan ahead' while a distinct /plan-ahead page exists — two different pages answer to the same name (components/Brand.tsx line ~143).
  - /plan-now is absent from the /guides hub's 'Plan ahead — no death yet' category, which lists /plan-ahead and /planning instead (app/guides/page.tsx ~267-288) — the newest, strategically-prioritized surface is the one the guides hub doesn't show.
checks:
  - Exercise the full 5-step flow live incl. print output; confirm no network write occurs (channel-survival: nothing transmitted).
  - Load /plan-now?ref=hf-CODE with a real referral code and confirm ReferralCoBrand resolves the institution name and the titleized cosmetic banner is suppressed (normalizeReferralCode guard in app/plan-now/page.tsx line 45).
  - MERGE recommendation: keep /plan-now as the canonical pre-need FLOW; fix the footer label or rename so 'Plan ahead' points to one thing; add /plan-now to the guides hub.

### Pre-need planning cluster — /planning (non-crisis entry + email capture)  [L1]  state=built-live but duplicate-suspect (sitemap 0.8; linked from /where 'I'm planning ahead', /decide, /guides, /worksheet back-link)
paths: app/planning/page.tsx, components/planning/CheatSheetForm.tsx, app/api/planning/signup/route.ts
purpose: Older non-crisis entry page: stats, cheat-sheet email capture (feeds planning_signups → welcome + nurture email loop), links out to /prices, /decide, /worksheet, and account save.
risks:
  - Content overlap: its 'On prepaid funeral plans' card is a second, divergent copy of /plan-ahead's 'pre-paid trap' card — two versions of the same warning will drift (app/planning/page.tsx ~112-150 vs app/plan-ahead/page.tsx ~395-456).
  - Claim to verify: 'up to 50% — what comparison shopping can cut... per the Consumer Federation of America' and '2–3× documented price variation' (guardrail #4 — need a citable source).
  - Copy says 'We can contact funeral homes for them' — describes the outreach service while OUTREACH_LIVE is off; the flow records dry-run rows, so the promise is currently unfulfillable end-to-end.
  - Role confusion: /where routes 'I'm planning ahead' here, the footer routes 'Plan ahead' to /plan-now, and guides routes to /plan-ahead — three entry labels, three destinations.
checks:
  - Submit the cheat-sheet form live and verify planning_signups row + welcome email arrive (the API awaits the send deliberately — app/api/planning/signup/route.ts lines 56-74).
  - Verify the CFA 50% and 2–3× stats against the cited sources or soften them.
  - MERGE recommendation: this is the weakest of the three pre-need pages — recommend folding its unique value (the email-capture form and stats) into /plan-ahead or /plan-now and 301ing, OR clearly repositioning it as the email-capture landing only. Auditor to confirm which page wins the /where 'planning ahead' slot.

### Pre-need planning cluster — /plan-ahead (SEO pillar guide)  [L1]  state=built-live (sitemap 0.8; linked from /guides, /end-of-life x2, /disenfranchised-grief, /funeral-home-tactics)
paths: app/plan-ahead/page.tsx
purpose: Public, indexable long-form pre-need playbook (four pillars, death folder, 'if I die' letter, pre-paid trap, veterans/body-donor/faith special cases) — an SEO pillar for the reach engine.
risks:
  - Duplicated prepaid-trap and 'talk to family' content vs /planning (drift risk).
  - Content claims to verify per guardrail #4: 'Roughly 60% of US adults die without a will', direct-cremation '$1,500–$3,000', basic burial '$5,000–$8,000', attorney consult '$150–$400' — none carry citations on-page.
  - Names third-party products (Quicken WillMaker, LegalZoom, AARP) — fine for neutrality (not funeral homes) but should be a conscious editorial choice.
checks:
  - Fact-check the four uncited numeric claims and add sources or ranges the methodology page can defend.
  - Confirm the /worksheet links work and that the 'preferences worksheet generates a one-page printable' claim matches what /worksheet actually does.
  - KEEP recommendation: keep as the pre-need SEO pillar; de-duplicate the prepaid-trap section into one canonical block shared with (or linked from) /planning.

### /prep — arrangement-meeting prep kit  [L1]  state=built-live and well-linked (sitemap 0.6; linked from homepage, dashboard x3+, guides, not-found, /prices calculator, /rights, /veterans, negotiate-closed, CheatSheetForm, welcome + nurture emails)
paths: app/prep/page.tsx, app/prep/layout.tsx, components/Cheatsheet.tsx
purpose: At-need (not pre-need) printable cheat sheet for the arrangement meeting: zip-adjusted line-item fair ranges, five questions, decline scripts, post-signing negotiables.
risks:
  - Belongs to the at-need lane despite sitting near the planning cluster in this audit — no real duplication; its zip-adjusted LINE_ITEMS table partially overlaps the dead components/PriceTable.tsx (see orphans) and /prices.
  - Print flow requires zip before enabling the button — verify the printed sheet is complete and the ranges match /prices for the same zip (one pricing source: lib/pricing-data.ts).
checks:
  - Print the cheat sheet live for 2-3 zips and diff ranges against /prices for consistency.
  - KEEP recommendation: keep — distinct job, heavy inbound linking, referenced from transactional emails (lib/welcome-email.ts, lib/nurture-email.ts).

### /vault — document tracker (dashboard tool)  [L2]  state=built-live, correctly noindexed; reachable only from /dashboard and /briefing
paths: app/vault/page.tsx, app/vault/Vault.tsx
purpose: After-death document checklist (death certificates, will, DD-214, policies) with status + assignee, localStorage-only; feeds the household snapshot and /briefing rollup.
risks:
  - Not a pre-need duplicate despite the audit-task grouping — it is an at-need tool; no overlap with the planning cluster.
  - Discoverability depends entirely on the dashboard tool grid; anonymous users never see it.
checks:
  - Verify robots noindex is served live and /vault is absent from the sitemap (both true in repo).
  - Add a doc, set statuses, then open /briefing and confirm the rollup reflects it (household-view parser path).
  - KEEP recommendation: keep as-is.

### /family — progress hand-off tool (not an entry point)  [L2]  state=built-live, noindexed; linked from /dashboard and /briefing
paths: app/family/page.tsx, app/family/Family.tsx, app/family/HouseholdLinkCard.tsx, app/family/DigestCard.tsx, app/api/share/create/route.ts, app/api/share/[id]/
purpose: Creates a 7-day share link snapshotting on-device progress (decide, negotiate wizard, guidance, next-30, notifications, eulogy keys) so a relative can take over without an account; plus household link + digest cards.
risks:
  - Name collision with 'family entry point' is cosmetic only — homepage and /where are the entries; /family is a tool. No duplication found.
  - SHARE_KEYS list (app/family/Family.tsx lines 12-30) is a hand-maintained mirror of every tool's storage key — new tools (e.g. plan-now's key from lib/plan-now.ts) are NOT in it, so shared progress silently omits the plan-now plan. Check whether that's intentional.
checks:
  - Create a share link live, open it in a fresh browser, confirm progress restores and the link expires after 7 days.
  - Diff SHARE_KEYS against every STORAGE_KEY constant in the repo (vault, timeline, plan-now, worksheet) and confirm omissions are deliberate.
  - KEEP recommendation: keep; consider renaming nav label if 'family' ever appears next to entry-point copy.

### Entry triage — homepage + /where + /where/just-happened  [L1]  state=built-live (homepage canonical, /where sitemap 0.9, linked from 13 files)
paths: app/page.tsx, app/where/page.tsx, app/where/just-happened/page.tsx
purpose: Funnel, not duplication: homepage = dual-lane crisis + institutional entry ('Start here' → /where; analyzer shortcut; hospice/employer section); /where = five-path triage (just-happened / arranging / analyzer / after / planning); /where/just-happened = four death-location scenarios → /guidance/[scenario].
risks:
  - Homepage claims to verify under guardrail #4: 'Families often overpay by $2,000 to $5,000' (appears twice) and '~13 months of support Medicare requires per death (42 CFR 418.64) — unfunded' — both need methodology backing.
  - Homepage 'we contact homes on your behalf at no charge' promise vs OUTREACH_LIVE off (same live-promise gap as /planning).
  - The /where 'I'm planning ahead' path routes to /planning, the weakest of the three planning pages — funnel-role decision needed (see planning cluster).
checks:
  - Click through all five /where paths and four just-happened scenarios live.
  - Verify the $2,000–$5,000 overcharge figure has a defensible source consistent with /methodology.
  - Confirm the homepage institutional lane links (/partners, /employers) work and PartnerCtaLink analytics fire.
  - KEEP recommendation: keep all three; they are one funnel. Only decision: which planning page /where points at.

### Supply-side pages — /for-funeral-homes + /funeral-home-opt-out  [docs]  state=built-live; /for-funeral-homes linked from Brand footer (indexable, canonical); /funeral-home-opt-out reachable only from outreach-email footers by design (noindex)
paths: app/for-funeral-homes/page.tsx, app/funeral-home-opt-out/page.tsx, lib/negotiation/email-body.ts
purpose: Transparency page for funeral homes that received outreach (what we are, no-commissions, family signs directly, how to opt out) and the token-verified one-click opt-out landing that sets funeral_homes.active=false.
risks:
  - Guardrail tone check PASSES: 'no money from funeral homes in any form', family contracts/signs directly (never-arranging), opt-out honored even for by-name requests — all consistent with guardrails #1/#3 and the navigation-not-arranging rule.
  - Describes a live-sounding flow (arrangements@ requests, advocate+ reply routing, WB- reference IDs — mechanics verified accurate against lib/negotiation/send.ts line 32 and email-body.ts line 132) while OUTREACH_LIVE has never been on — the page documents a flow with zero real executions.
  - 'We're funded by the institutions we partner with' — present-tense claim with zero paying institutions today; borderline under guardrail #4.
  - Opt-out page uses the service-role Supabase key outside the admin gate — acceptable because it is HMAC-token-gated and only flips active=false idempotently, but the auditor should confirm verifyFuneralHomeOptOutToken cannot be forged.
checks:
  - Probe /funeral-home-opt-out with no params (should show the 'this page is for funeral homes' card), a bad token (invalid card), and a valid generated token against a test row (active flips to false, idempotent on repeat).
  - Confirm the opt-out survives the family-asks-by-name path in lib/negotiation/directory.ts (active=true AND vetted=true filter).
  - Reword 'funded by the institutions we partner with' to future/aspirational tense or confirm founder accepts the claim.
  - KEEP recommendation: keep both; they are legally load-bearing for the outreach lane.

### After-death tool suite — /next-30-days, /briefing, /timeline, /worksheet  [L2]  state=built-live; next-30-days heavily linked (11 files incl. anniversary emails); briefing linked only from /family; timeline linked only from dashboard tile (noindex); worksheet linked from planning cluster + dashboard + after-hospice
paths: app/next-30-days/page.tsx, app/next-30-days/NextThirtyDays.tsx, app/next-30-days/tasks.ts, app/briefing/page.tsx, app/briefing/Briefing.tsx, app/timeline/page.tsx
purpose: Complementary, non-overlapping jobs: next-30-days = phased post-death checklist (the '/where: funeral already happened' path); briefing = one printed rollup of all on-device state for the fridge/relative; timeline = service-day run-sheet; worksheet = pre-meeting preferences sheet. /guidance covers the first 72h; /dashboard is the hub linking all of them — complements, not duplicates.
risks:
  - SEO inversion: /next-30-days is indexable, content-rich, and a top-level /where path yet is ABSENT from app/sitemap.ts; /briefing IS in the sitemap (0.6) yet renders from the visitor's localStorage — a crawler sees the empty state. Backwards.
  - /briefing has no robots noindex despite being a personal-data print page (data never leaves the device, so no privacy leak — but it is thin/empty content to Google).
  - /timeline is live-but-orphaned-adjacent: one inbound link (dashboard tile). Fine as a tool; flag if analytics show zero use.
checks:
  - Add /next-30-days to the sitemap and either drop /briefing from it or give briefing a crawler-worthy empty state — auditor to confirm direction.
  - Run the next-30-days checklist live: progress persists, assignees flow into /briefing and household view.
  - Check /timeline usage analytics before investing anything further.
  - KEEP recommendation: keep all four; fix the sitemap inversion.

### Payment-era scaffolding — lib/auth-paid.ts + lib/stripe.ts  [infra]  state=legacy-suspect / partially dead (stripe() and stripeAvailable have ZERO callers; fmtCents is imported by 5+ live files; isPaidUser used in exactly 2 places for cosmetic/heuristic purposes)
paths: lib/auth-paid.ts, lib/stripe.ts, lib/__tests__/stripe.test.ts, app/dashboard/page.tsx, app/guidance/[scenario]/page.tsx
purpose: Self-documented remnants kept as scaffolding: isPaidUser = free-email test-account flag + legacy profiles.paid_at (nothing writes it); lib/stripe.ts holds an uncalled Stripe client reserved for future institutional billing plus fmtCents, a pure currency formatter.
risks:
  - No guardrail violation — nothing can charge a family; verified no Stripe checkout route exists and nothing writes paid_at (only a comment in app/api/cron/anniversary/route.ts references it).
  - Misleading naming: dashboard uses isPaid to hide the outreach CTA; guidance uses it to force pickedHome=true for test accounts — a reader could mistake this for a live paywall. Rename to isTestAccount would end the confusion.
  - fmtCents living in lib/stripe.ts drags a Stripe import into negotiate/dashboard/partner components that have nothing to do with billing.
  - Day-8 sprint (Stripe institutional billing) will resurrect lib/stripe.ts — do not delete before that decision lands.
checks:
  - Confirm STRIPE_SECRET_KEY absence degrades safely (FEATURES.stripe() false paths).
  - MERGE recommendation: move fmtCents to a neutral lib (e.g. lib/format.ts); keep the stripe() client only if Day-8 institutional billing proceeds, else delete; rename isPaidUser→isTestAccount and drop the dead paid_at branch.
  - Verify HONEST_FUNERAL_FREE_EMAILS is set only to founder/test addresses in prod.

### /api/planning/signup — email-capture endpoint (NOT a payment remnant)  [L1]  state=built-live and load-bearing (called by CheatSheetForm on /planning and EmailCaptureForm across 10+ grief/content pages)
paths: app/api/planning/signup/route.ts, components/EmailCaptureForm.tsx, components/EmailCapture.tsx, components/planning/CheatSheetForm.tsx, app/api/cron/nurture-emails/route.ts, app/unsubscribe/page.tsx
purpose: Live email-capture pipeline: stores planning_signups (email, source, zip, hashed IP), awaits the welcome send (Vercel freeze workaround documented in-file), feeds the nurture cron, honored by unsubscribe and account-delete.
risks:
  - Despite the audit-task framing, nothing payment-related remains here — the name 'planning' refers to the /planning page it originally served.
  - Rate limiting exists (lib/rate-limit.ts references the route) — confirm it is actually enforced on POST.
checks:
  - Live-probe: submit, confirm row + welcome email + dedupe on duplicate + unsubscribe flow end-to-end.
  - Confirm rate limit blocks rapid repeat POSTs.
  - KEEP recommendation: keep; this is a reach-loop engine.

### Dead commercial-suppression mechanism  [infra]  state=dead (lib/suppression.ts has ZERO importers — nothing sets or reads the cookie; CommercialSuppressionNotice is rendered nowhere; /api/suppression/clear deletes a cookie nothing creates; only a comment in CrisisUnexpected.tsx line 131 still claims 'full commercial suppression')
paths: lib/suppression.ts, app/api/suppression/clear/route.ts, components/CommercialSuppressionNotice.tsx, app/guidance/[scenario]/CrisisUnexpected.tsx
purpose: As-built: after entering the unexpected-death crisis flow, a 4-hour cookie was to hide pricing/negotiation surfaces, with a soft interstitial and a 'go anyway' clear route.
risks:
  - A designed grief-safety guardrail (suppress commercial surfaces for users in acute crisis) either was intentionally replaced by CrisisUnexpected simply omitting commercial links, or silently broke in a refactor — the repo cannot tell you which. If the founder believes suppression is active, it is not.
  - The stale comment in CrisisUnexpected.tsx will mislead future contributors.
checks:
  - Ask the founder whether cookie-based suppression was consciously retired; check git log for the commit that removed the setCommercialSuppression call site.
  - KILL recommendation: if retired, delete lib/suppression.ts, the clear route, and CommercialSuppressionNotice.tsx, and fix the CrisisUnexpected comment. If not retired, re-wire it — /prices and /negotiate currently do NOT check isCommercialSuppressed at all.