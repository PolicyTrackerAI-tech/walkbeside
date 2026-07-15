# Product Sprint — Thu Jul 16 → Sat Jul 25, 2026 (10 days)

**Mission:** make "one hospice paying" mechanically possible and commercially
credible — from the product side only. By EOD Sat Jul 25: a hospice can **pay
us in-product** (Stripe, institutional only, never families); the **verified
tier holds real Utah data** collected through a founder ingest tool instead of
hand-crafted SQL; the AI layer has the **eval harness** that was the last
missing Phase-0 foundation, and the model upgrade ships *behind* it; the
**reach engines turn on** (metro pages that actually read `regional_benchmarks`,
a hospice reference layer with claim-your-page); and the partner subscription
*feels alive* (monthly email carries the AI outcomes digest). Product work
only — no legal tasks, no sales-process tasks.

Written 2026-07-15 from a two-agent audit of `origin/main` @ `ff05d5d` (all of
Product Week Jul 13–17 merged: Days 1–5, PRs #148–#156). Every task references
real files. `CLAUDE.md` is law; the Day-5 **badge-honesty rule** (a
verified/community label may only sit next to numbers that actually consulted
the store) is now also law.

---

## 1. Verified baseline (what the Jul-15 audit found)

### Shipped and solid — build on these
- **The full two-sided product** from Product Week: portal sign-in
  (`/portal` + `partner_members`), employer variant, analyzer→negotiate
  bridge + attribution + paid-capture, AI cost wrapper + ledger **and** the
  `/admin/ai-costs` dashboard (`app/admin/ai-costs/page.tsx` — shipped Day 4,
  despite the cut-line note), inbound auto-parse with human confirm
  (`app/api/inbound/email/route.ts:144-173`, confirm UI + `/admin/outcomes`
  surface), line-item explainer, redaction, extraction provenance.
- **The tier system** (Day 5): `regional_benchmarks` (applied in prod, VERIFY
  clean), `lib/benchmarks-store.ts`, tier badges on all surfaces,
  promote-to-verified with server-recomputed n≥5, honesty fixes,
  `/methodology` rewrite. Prod-verified 2026-07-15
  (`/api/benchmarks/tier?zip=84101` → modeled).
- **Dashboard focus + status polling backoff** — shipped Day 3
  (`app/dashboard/page.tsx:396-412`, `status/page.tsx:100-116`). Not open work.
- **Utah tooling**: `scripts/import-funeral-homes.mjs` + `/admin/vetting`
  work; `supabase/seed/utah-homes.csv` is gitignored and *empty on disk* —
  the data is founder work, the tooling is ready.
- **4 crons wired** (`vercel.json`): anniversary, quote-notifications,
  nurture, partner-digest (flag OFF).

### The true gaps these 10 days close
| # | Gap | Evidence |
|---|---|---|
| G1 | **A hospice cannot pay us in-product.** `lib/stripe.ts` `stripe()` has ZERO callers; no products, no checkout, no webhook (`app/api/stripe/*` absent). Billing is the one product piece the 90-day goal literally requires. | code audit §7 |
| G2 | **The verified tier is empty and filling it is hand-crafted SQL.** `/admin/ingest-gpl` does not exist; the weekend spec depends on it. All reusable pieces exist (extract endpoint, `price-list-parse`, promote flow). | code audit §10 |
| G3 | **Eval harness missing** — the last unshipped AI_STRATEGY §3.3 foundation (95% pre-deploy bar). `scripts/eval-analyzer.mjs` absent; no golden fixtures. Blocks the model upgrade: `lib/claude.ts:9-20` documents why the sonnet-5 swap needs a fixture-verified re-baseline (adaptive thinking + ~30% tokenizer inflation), "never swap the string alone." | code audit §3, §4 |
| G4 | **Nothing programmatic reads `regional_benchmarks`.** City pages are fully static, modeled-only (`app/funeral-costs/[city]/page.tsx:159` hardcodes `tier="modeled"`, no revalidate); `/fair-price-index` reads `LINE_ITEMS` only. A weekend Utah promotion is invisible on every SEO surface. | code audit §11–12 |
| G5 | **No hospice reference layer.** No `hospices` table, no CMS import, no programmatic hospice pages, no claim-your-page → the partner pipeline has no product-side top of funnel. | code audit §9 |
| G6 | **The partner email is dumber than the portal.** The monthly digest cron sends the deterministic text only; the AI outcomes digest renders on the web report but never reaches the email (`app/api/cron/partner-digest/route.ts` never calls `buildOutcomesDigest`). | code audit §6 |
| G7 | **`followUpSystem()` still orphaned** (`lib/negotiation/prompts.ts:1-9`, zero callers) — stalled outreach has no follow-up motion, even a human-reviewed one. | code audit §5 |
| G8 | **Checker data has no contribute-consent.** FAIR_PRICE_INDEX §6: logged-in analyses persist without an explicit "use my de-identified quote to improve the ranges" checkbox. Ethics + guardrail-#4 posture. | docs audit §8 |
| G9 | **Transparency score is docs-only** (DATA_PLAN §7) — but Day 5 added `funeral_homes.gpl_url`/`last_verified_at`, so a v1 is now derivable from real fields without a migration. | code audit §14 |
| G10 | **`lib/negotiation/directory.ts` selects all rows and filters zip in memory** — fine at 193 homes, breaks at national scale (DATA_PLAN §8). | docs audit §4 |
| G11 | **Funnel analytics are coarse**: 6 events, no wizard-step events, no portal events, no admin funnel view. | code audit §15 |
| G12 | **The strategy docs lie about the present.** ROADMAP/GO_TO_MARKET/ENGINEERING_BACKLOG still list shipped work as open (methodology page, AI digest, explain, inbound parse, paywall decommission — the "remnants" are deliberate tombstone redirects). Future sessions will re-plan shipped work unless the docs get a truth pass. | both audits |

### Explicitly NOT these 10 days
Grief/crisis concierge chat (**highest-risk item in the roadmap; blocked on a
dedicated safety review** — not a backlog slot). Home-level reputation
profiles / predatory-pattern detection / negotiation coach (data-density-
blocked: zero real outcomes; guardrail #4). BAA-gated staff-assisted referral
variant (blocked on counsel). Spanish i18n (drafts staged in `docs/i18n-es/`,
gated on human review). Full `index_cells` quarterly-snapshot machinery
(FAIR_PRICE_INDEX §5 — this sprint wires the pages to `regional_benchmarks`;
the quarterly stat engine waits for real density). Benchmark-expansion Wave 1
coding happens *only if* the founder approves the redline
(`docs/BENCHMARK_EXPANSION_SPEC.md` — decision #2 below). No consumer charge
of any kind, ever.

---

## 2. The end-state demo (what "done Jul 25" means)

Runs clean on production:

1. **Founder ingests a GPL in 90 seconds:** `/admin/ingest-gpl` → paste text
   (or photo) + zip + home name + source URL → parsed items reviewed →
   Save → row lands tagged `founder_ingest`, home's `gpl_url` stamped →
   `/admin/benchmarks` group count ticks up.
2. When a Salt Lake City item crosses n≥5 → **Promote** (metro picked from a
   dropdown of real `zip-regions` labels, no typo risk) → within the hour
   `/funeral-costs/salt-lake-city` shows the **verified range with its badge
   and n** on that line item — programmatically, no deploy.
3. `/prices` + the analyzer at an SLC zip show verified-backed results (the
   analyzer already does; the availability line on the calculators now points
   at real data).
4. **A hospice owner opens `/portal/settings` → Billing → subscribes** (Stripe
   Checkout, test mode) → webhook lands → the portal shows "Pilot — active"
   and `/admin/partners` shows the billing state. Zero family surface knows
   Stripe exists.
5. **The monthly partner email** (test-fired via the cron with the flag on in
   preview) reads like the web report: deterministic numbers + the AI
   outcomes digest paragraph, suppression respected.
6. `/hospices/utah` renders the CMS-derived hospice list; a facility page
   shows neutral facts + **"Is this your organization?"** → claim form →
   `partner_leads` row + founder email.
7. `npm run eval:analyzer` prints a scored report against the golden GPL
   fixtures; the model config in prod is whatever the eval said was safe.
8. The analyzer asks consent before a checked quote contributes to the
   dataset; the directory shows a transparency signal derived from real
   fields.

---

## 3. Architecture decisions (locked now)

**D1 — Billing = Stripe Checkout + customer portal, partners only, flag-gated.**
New `app/api/stripe/` routes (checkout session, webhook, customer-portal
link) + a Billing card on `/portal/settings` (owner-only). `partners` gains
`stripe_customer_id`, `billing_status`, `billing_plan` (Migration B). Price
IDs come from env (`STRIPE_PRICE_PILOT` etc.), created by the founder in the
Stripe dashboard — code never hardcodes amounts. `BILLING_LIVE` env gates the
whole surface (default off → the Billing card renders "invoicing by
arrangement" copy). Guardrails in code: only `partner_type in
('hospice','employer')` may start billing (insurers structurally excluded);
no billing import outside `/portal/settings`, `/api/stripe/*`, admin; invoice
line copy = "bereavement support program" (channel-survival framing). The
webhook route verifies Stripe signatures and only ever touches `partners`
billing columns — it cannot write family data.

**D2 — Ingest tool = admin page over the existing pipeline, no new parser.**
`/admin/ingest-gpl` (admin-gated, mirrors `/admin/vetting` posture) calls the
same extract chain the analyzer uses (`priceListAnalysisSystem` via
`callClaude({feature:"founder-ingest"})`, `naiveExtract` fallback, photo via
the existing `extract-price-list-image` endpoint) → founder eyeballs/edits
parsed items → Save writes a `price_list_analyses` row
(`extraction_method:'founder_ingest'`, founder's user id, zip, redacted
raw_text) and, when a source URL is given, stamps
`funeral_homes.gpl_url`/`last_verified_at` on the matched home (match by
name+zip; unmatched = save analysis only, warn). No migration needed — every
column already exists.

**D3 — Eval harness gates the model; the harness is deterministic-scored.**
`scripts/eval-analyzer.mjs` + `test/evals/gpl/*.txt` fixtures with
`*.expected.json` golden files (fictional-but-realistic GPLs: bundles,
selection ranges, per-unit qty lines, disclosure phrasings, OCR noise). Score
= item recall/precision (matched-id level), stated-total accuracy, per-unit
qty detection, range-item detection; report per-fixture + aggregate; calls
the live API through the cost wrapper (`feature:"eval"`), so runs are tagged
and cheap. `npm run eval:analyzer -- --model=X` compares models. **Rule: the
`MODEL` string (or any thinking/max_tokens config) changes only in a PR that
includes before/after eval output**; sonnet-5 re-baseline + Haiku-4.5 for
subscription-finder classification happen behind it (`lib/claude.ts:9-20`
documents the trap: adaptive thinking + ~30% tokenizer inflation).

**D4 — Metro pages read the store server-side with ISR; the badge stays earned.**
`app/funeral-costs/[city]/page.tsx` consumes `benchmarksForZip(city.zipExample)`:
line items with active overrides render the override range + per-tier badge;
everything else stays modeled and says so (Day-5 badge-honesty rule). Add
`export const revalidate = 3600` so founder promotions surface within the
hour, no deploy. `/fair-price-index` gains a "verified metros" section
(driven by distinct active `regional_benchmarks` metros, n shown) + a
downloadable aggregate CSV/JSON + "cite this" block (Dataset JSON-LD already
exists). No new route this sprint — `CITIES` stays the metro list; promoting
a metro not in `CITIES` is a 2-line addition there.

**D5 — Hospice layer = reference table + state pages indexed, facility pages
noindexed until enriched.** Migration A: `hospices` reference table (CMS
Provider Data Catalog CSV, ~5–6k rows: ccn, name, city, state, ownership,
zip) — deny-all RLS, service-role reads, public pages render via server
components. `scripts/import-hospices.mjs` (idempotent, like import-funeral-
homes). Pages: `/hospices/[state]` (50 pages, real aggregate content —
count, ownership mix, "what to ask a hospice about after-death support" —
family-facing education, never solicitation) indexed + sitemapped;
`/hospices/[state]/[ccn]` facility pages **noindexed** at launch (thin-content
discipline) with neutral CMS facts + "Is this your organization? Offer
Honest Funeral to your families free — claim this page" → prefilled
`/partners/apply` + `partner_leads` row. Apply-form autocomplete reads the
table. Channel-survival: nothing on these pages targets families of current
patients; it's public reference data + a B2B claim CTA.

**D6 — Digest email upgrade rides the existing flag.** The cron builds the
email with `buildOutcomesDigest` (AI + deterministic fallback, exactly like
the web report) appended to the deterministic stats.
`PARTNER_DIGEST_ENABLED` stays **off**; the founder flips it when a real
partner should start receiving mail. A `?test=1` admin-only dry-run renders
the email HTML for one partner without sending.

**D7 — Follow-ups are drafted, never sent, until a human clicks — and sends
still ride the kill switch.** Wire `followUpSystem()` into `/admin/outcomes`:
for outreach rows `status='sent'` with no reply after N days, a "Draft
follow-up" button generates the draft (grounded in the original outreach +
case facts); founder edits/approves; the send goes through
`sendOutreachForNegotiation`'s machinery so `OUTREACH_LIVE=false` records
`dry_run` rows exactly like initial outreach. No cron, no auto-send.

**D8 — Consent + transparency ship as code, not schema.** The analyzer gains
a pre-checked-off (explicit opt-in) "Use my de-identified quote to improve
the fair-price data" checkbox; unconsented analyses persist with
`contribute:false` in the items payload? No — cleanest: unconsented
logged-in analyses simply skip the benchmark feed (a `contributed` boolean
rides the existing insert; `lib/benchmark-sources.ts` filters on it;
column added in Migration A alongside the hospices table to keep the
one-migration-per-day discipline). Transparency v1 = a pure function
(`lib/transparency.ts`) over existing columns (publishes GPL online =
`gpl_url` present, `vetted`, contactable = `email` present, record
completeness) → small badge on `/funeral-homes/[zip]` home cards and the
compare page; `/methodology` gets three sentences on how it's derived. No
0–100 theater — a 3–4 signal checklist display (defensible, guardrail #4).

**D9 — One migration per build day, founder-applied, bhadjv SQL editor.**
Migration A (Mon Jul 20): `hospices` table + `price_list_analyses.contributed
boolean`. Migration B (Thu Jul 23): `partners` billing columns. Both
idempotent, BOOTSTRAP regenerated, VERIFY extended (hospices +
`regional_benchmarks` stay in the deny-all list).

**D10 — Docs truth pass is in-scope work.** ROADMAP.md, GO_TO_MARKET.md
Phase 0, ENGINEERING_BACKLOG.md get status annotations for everything that
shipped (methodology, AI digest, explain, inbound parse, decommission
tombstones, ai-costs, dashboard focus) so no future session re-plans shipped
work. Pre-flight Thursday: remove the stale day-2 worktree still holding the
`main` ref (unblocks local `gh pr merge`).

---

## 4. Day-by-day

| Day | Build | Gate before stopping |
|---|---|---|
| **Thu Jul 16** | Pre-flight: worktree cleanup (D10). **`/admin/ingest-gpl`** (D2): paste/photo → parse → review table (editable names/cents/matched-id) → Save; `gpl_url`/`last_verified_at` stamping; promote-form metro **dropdown** from `zip-regions` labels (kills the typo'd-label silent miss); `revalidatePath` on promote for `/funeral-costs/*`. | Founder ingests a sample GPL end-to-end in dev; saved row appears in `/admin/benchmarks`; promote → city page updates after revalidate. Suite green. |
| **Fri Jul 17** | **Eval harness** (D3): fixtures + golden files + `scripts/eval-analyzer.mjs` + `npm run eval:analyzer`; baseline run on sonnet-4-6 committed as `test/evals/BASELINE.md`. Then, behind it: sonnet-5 re-baseline branch (explicit thinking config, max_tokens re-baseline) + Haiku-4.5 on subscription-finder — **ships only if eval ≥ baseline; otherwise we stay put and the harness was the deliverable.** | Eval report reproducible; model PR carries before/after output; suite green. |
| **Sat 18–Sun 19** | **Founder data days** (product on-call only): fill `utah-homes.csv` → `npm run import:homes` → vet in `/admin/vetting`; ingest every collectable Utah GPL via the new tool; promote SLC/Provo groups that cross n≥5; start CA (SB 658 = homes must post GPLs online). | ≥2 verified metro×item groups live with visible n; every verified row carries sources. |
| **Mon Jul 20** | **Migration A** (hospices + `contributed`). `scripts/import-hospices.mjs` (CMS CSV); apply-form autocomplete; **analyzer consent checkbox** + `benchmark-sources` filter (D8). | Founder applies Migration A; import runs against prod (~5–6k rows); consented/unconsented analyses provably split in the benchmark feed. |
| **Tue Jul 21** | **Programmatic reach** (D4): city pages read the store + ISR; fair-price-index verified-metros section + CSV/JSON + cite-this; sitemap. | SLC city page shows the weekend's verified ranges with badges + n, no deploy needed after a promotion (ISR proof); badge-honesty grep clean. |
| **Wed Jul 22** | **Hospice pages** (D5): `/hospices/[state]` (indexed) + `/hospices/[state]/[ccn]` (noindexed) + claim-your-page → `partner_leads` + email; `/admin/partners` leads strip shows source. | 50 state pages render with real aggregates; claim flow writes a lead; facility pages noindexed (verify robots meta); word-ban grep clean on all new pages. |
| **Thu Jul 23** | **Migration B + billing** (D1): Stripe checkout/webhook/portal-link routes; `/portal/settings` Billing card; `/admin/partners` billing state; `BILLING_LIVE` gate; insurer exclusion test. | Test-mode subscription completes end-to-end in dev; webhook updates `billing_status`; zero family surface imports Stripe; founder applies Migration B. |
| **Fri Jul 24** | **Retention + ops**: digest email + AI paragraph + test-render (D6); `followUpSystem` behind `/admin/outcomes` review (D7, dry-run proof); transparency v1 on directory + `/methodology` note (D8); funnel events (wizard steps, portal actions, bridge-click) (G11). | Test digest renders with AI paragraph + suppression; follow-up draft→approve→`dry_run` row; transparency badge renders from real fields; events visible in Vercel Analytics debug. |
| **Sat Jul 25** | **QA + ship + truth**: full §5 QA below; docs truth pass (D10); DEMO_SCRIPT.md additions (ingest beat, billing beat); run the §2 demo on prod; buffer for anything slipped. | The §2 demo, clean, on production. |

Mechanics unchanged from last week: fresh worktree per day off current
`origin/main`, PR per day, founder merge; every day ends with
`npm run typecheck && npm run lint && npm run build && npx vitest run` + the
guardrail grep; migrations only on their scheduled day.

---

## 5. QA pass (Sat Jul 25 — run every line)

1. **Mechanical:** typecheck, lint, build, full vitest, `VERIFY.sql` on prod
   after each migration day.
2. **Money guardrails:** zero Stripe imports outside `/portal`, `/api/stripe`,
   admin (grep-enforced + a vitest pin); insurer billing blocked (route
   test); no family-facing route renders any billing UI; `BILLING_LIVE`
   default-off verified.
3. **Anti-steering + word bans:** attribution columns still unread by
   `directory.ts`/choose (grep); `featured|recommended|sponsor` = 0 on
   partner/directory/hospice surfaces; employer pages stay
   Medicare/CAHPS/CMS-free; hospice state/facility pages contain no
   family-of-current-patient targeting and no pre-admission benefit pitch.
4. **Data honesty:** badge-honesty grep (verified/community labels only where
   the store fed the numbers); transparency signals trace to real columns;
   eval baseline committed; consent filter provably excludes unconsented rows
   (test at the `benchmark-sources` seam).
5. **Kill switches:** `OUTREACH_LIVE` off — follow-up approval writes
   `dry_run`; `PARTNER_DIGEST_ENABLED` off — cron returns `{disabled:true}`;
   `BILLING_LIVE` off — Billing card shows arrangement copy.
6. **Privacy/RLS:** `hospices` deny-all verified; webhook writes only partner
   billing columns; no new family-PII path; portal payloads still
   aggregate-only.
7. **SEO/perf smoke:** sitemap gains `/hospices/[state]` + index CSV; facility
   pages noindexed; Lighthouse on `/`, `/funeral-costs/salt-lake-city`,
   `/hospices/utah`, `/portal` (noindex).
8. **The §2 demo on prod, recorded.**

---

## 6. Cut lines (drop in this order if Jul 25 is at risk)

1. Funnel-event deepening (G11) → next sprint.
2. Transparency v1 display → keep the lib, defer the UI.
3. `followUpSystem` wiring → next sprint (prompt keeps waiting fine).
4. Fair-price-index CSV/JSON + cite-this → keep the verified-metros section.
5. Facility-level hospice pages → state pages only (keep import + claim CTA
   on state pages).
6. Digest email AI paragraph → deterministic email keeps shipping.
7. Sonnet-5/Haiku re-baseline → the eval harness alone is the Friday
   deliverable (explicitly acceptable).

**Never cut:** `/admin/ingest-gpl` (the weekend depends on it) · the eval
harness · Migration A+B discipline · billing end-to-end in test mode · metro
pages reading the store with ISR · badge honesty · the §2 demo.

---

## 7. Founder decisions needed (answer before the day that needs them)

1. **Pricing to encode in Stripe** (needed Thu Jul 23): pilot price point(s)
   and interval — the code reads price IDs from env, you create them in the
   Stripe dashboard (test mode first). ROADMAP's validation sprint suggested
   testing $25/$50/$75 per family served; a flat monthly pilot fee is also
   fine. Say the number(s).
2. **Benchmark expansion Wave 1** (any day): approve/redline
   `docs/BENCHMARK_EXPANSION_SPEC.md` (8 clean items + 2 reconciles). On
   "go" it's a half-day add with tests; it also raises analyzer coverage.
3. **Calendly vs cal.com** (any day): 30-minute embed on `/partners` +
   `/employers` once you pick and create the account.
4. **Community-tier stance** (confirm): today a community promotion publishes
   immediately (founder promotion IS the gate). If you want a second switch
   between "promoted" and "publicly visible," say so — one column + one
   filter.
5. **Weekend pace**: Utah CSV + GPL collection is yours; the ingest tool will
   be ready Thursday evening.
6. **`PARTNER_DIGEST_ENABLED`**: flip only when a real partner should get
   monthly mail (after Fri Jul 24 you can preview the email safely).

---

## 8. What this sets up (deliberately after Jul 25)

Real billing going live with the first pilot (flip `BILLING_LIVE`, real price
IDs) · community-tier density → public community ranges · the quarterly
Fair-Price-Index stat engine (`index_cells`) once verified metros exist ·
`directory.ts` indexed zip/geo query + national homes ingestion (DATA_PLAN
§4/§8) as the directory grows past Utah · facility-page indexing once
enriched · reputation profiles / negotiation coach / grounding-audit when
real outcome density exists · the BAA staff-assisted variant and grief
concierge stay parked behind counsel/safety reviews.
