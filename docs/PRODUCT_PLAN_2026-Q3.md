# The Product Plan — Jul 16 → Oct 16, 2026 (13 weeks)

**The one goal (from the bible):** one hospice paying — in-product, on real
data, with proof it works. Everything here is product development only; sales
motions and legal work appear only as *gates* the product must be ready for.
Written 2026-07-15, the night Product Week (Days 1–5, PRs #148–#156) shipped
and the **Open Farewell rename was decided** (domains + handles secured;
Rename Day Mon Jul 27, gated on counsel's TESS knockout).

How to read this: **Phase 1 is day-level** (it's next week — see
`PRODUCT_SPRINT_2026-07-16.md` for the full build sheets). **Phases 2–3 are
week-level.** **Phase 4 is milestone-level** — pretending to know day-level
detail eight weeks out would be fiction; each phase ends by re-planning the
next one against what actually happened. Standing law throughout: CLAUDE.md's
six guardrails, the channel-survival rules, the Day-5 badge-honesty rule, one
founder-applied migration per build day, `OUTREACH_LIVE` off until explicit
founder go, and **no new code ever hardcodes the brand name** (`lib/brand.ts`
from Day 1).

---

## The four product theses (why each phase exists)

1. **Payable:** a hospice must be able to buy in-product (Stripe,
   institutional only, never families) — Phase 1 builds it, Phase 4 turns it
   on with the pilot.
2. **Credible:** every number defensible (tiers, n≥5, methodology, evals) and
   the verified tier visibly real in at least one metro — Phases 1–2.
3. **Discoverable + spreadable:** the dual-audience site, the four organic
   loops, programmatic reach pages, the public dataset — Phases 1–3.
4. **Repeatable:** what the pilot proves must be instrumented, reportable,
   and reproducible for hospice #2 without founder heroics — Phases 2–4.

---

## PHASE 1 — Ship week + Rename (Thu Jul 16 → Mon Jul 27) · day-level, already specced

The 10-day sprint (`PRODUCT_SPRINT_2026-07-16.md`) + Rename Day (§4.1 there).
Summary of what exists after it:

- `/admin/ingest-gpl` (90-second GPL ingestion) · eval harness gating the
  sonnet-5/Haiku re-baseline · Migration A (`hospices` + consent) · metro
  pages + fair-price-index reading `regional_benchmarks` with ISR · the
  dual-audience homepage + nominate-your-hospice + share loops ·
  Migration B + Stripe institutional billing behind `BILLING_LIVE` ·
  `/hospices/[state]` + claim-your-page · AI digest in the partner email ·
  full QA + prod demo — then **Rename Day: Open Farewell everywhere**, old
  domain 301s forever, old-domain inbound email stays live.
- Founder highlights: apply Migrations A (Jul 20) + B (Jul 23) · pricing
  decision for Stripe by Jul 23 · TESS knockout commissioned NOW · weekend
  Utah GPL collection → first verified promotions.

**Phase-1 exit gate:** the sprint §2 demo clean on prod under the new name;
≥2 verified Utah metro×item groups live; billing completes in test mode;
suite green; rename verified (old deep links land on new twins, inbound
reply threads unbroken).

---

## PHASE 2 — Pilot-ready + data density (Tue Jul 28 → Fri Aug 8) · two weeks, week-level

**Objective:** when the first hospice says yes, the product onboards them,
instruments them, and proves value without hand-holding — and the verified
tier stops being a Utah novelty.

### Week of Jul 28 — the pilot cockpit + post-rename hardening
1. **Post-rename audit (Day 1, non-negotiable):** crawl old-domain URLs →
   301 map complete; Search Console change-of-address confirmed; OG/social
   cards render under the new name; collateral (`docs/sales/*`, materials
   PDFs, QR posters) regenerated; a `brand-grep` script lands in CI so a
   stray "Honest Funeral" string fails the build.
2. **The pilot cockpit** (`/admin/pilot/[partnerId]`): the five validation
   metrics from ROADMAP's 90-day sprint, live per partner — activation rate
   per referral link (scans/claims → families started), checker usage,
   median documented savings, satisfaction, coordinator engagement (links
   created, checks run). All aggregate, n≥5-suppressed where family-derived.
   This is the founder's daily pilot screen and the source of the
   week-2-of-pilot conversation.
3. **Onboarding-in-a-day polish:** approve → invite → sign-in → first link →
   materials, timed end-to-end; every rough edge found gets a same-week fix.
   Target: a new partner is live in under one founder-hour, self-serve past
   the approval click.
4. **Benchmark expansion Wave 1** (gated on founder redline of
   `docs/BENCHMARK_EXPANSION_SPEC.md`): the 8 clean items + 2 reconciles into
   `LINE_ITEMS` with tests + `/corrections` entries; analyzer coverage rises.

### Week of Aug 4 — density machinery + deferred product debt
5. **Bulk ingest v2:** queue multiple GPLs per sitting in `/admin/ingest-gpl`
   (paste-many, review sequentially); CA collection support (SB 658 —
   homes' own published GPLs; `gpl_url` + capture date; FCA surveys as
   cross-checks in `sources`); eval-harness findings from Phase 1 feed one
   extraction-prompt improvement round (eval-gated).
6. **Community tier goes real:** consented analyzer contributions
   (Migration A's `contributed` flag) flow into promotable community groups;
   first community promotions where n≥5 (founder-clicked, badge-honest).
7. **Deferred from the sprint:** `followUpSystem()` wired behind
   `/admin/outcomes` review (drafts only; sends ride `sendOutreachForNegotiation`
   → `dry_run` while `OUTREACH_LIVE` is off) · transparency v1 UI on the
   directory (pure derivation from `gpl_url`/`vetted`/`email` — no scoring
   theater) · funnel analytics deepening (wizard-step events, portal events,
   an `/admin/funnel` view reading Vercel Analytics exports or first-party
   counts).
8. **`directory.ts` scale fix** (DATA_PLAN §8): indexed zip-prefix +
   geo-radius query replacing the select-all-filter-in-memory pattern —
   must land before any national homes ingestion.

**Phase-2 exit gate:** a brand-new partner onboards to first-link in <1
founder-hour; the pilot cockpit renders real numbers for the demo orgs;
UT verified + first CA/community groups visible with n; brand-grep in CI;
suite green; zero regressions on checker invariants.

**Founder work this phase:** Wave-1 redline · CA GPL collection sessions ·
promotions · (sales-side, not product: the pilot conversations the cockpit
exists to serve).

---

## PHASE 3 — Reach + moat engines (Mon Aug 10 → Fri Aug 28) · three weeks, week-level

**Objective:** the machine that makes us findable (programmatic reach, the
public dataset) and unstealable (national directory pipeline, grounded AI
everywhere) — while staying honest at every n.

### Week of Aug 10 — national directory pipeline
1. **DATA_PLAN §4 raw→clean pipeline, v1:** land-raw table + migration;
   standardize (name/phone/zip), geocode, dedupe/entity-resolve
   (deterministic first, AI-assist behind human merge review), promote to
   live `funeral_homes`; per-state **email-coverage tracking** (email is the
   outreach bottleneck and the launch-state criterion).
2. First non-Utah state ingested end-to-end as the pipeline proof (pick by
   email-coverage yield + counsel's launch-state guidance when it exists —
   the pipeline ships regardless; *contacting* anyone stays behind vetting +
   `OUTREACH_LIVE`).

### Week of Aug 17 — programmatic surfaces + the public dataset
3. **Metro-page generation from data:** `CITIES` grows programmatically from
   `regional_benchmarks` active metros + top ingested-home metros; city
   pages gain verified line-item sections automatically (badge-honest);
   sitemap scales accordingly.
4. **Fair-Price-Index v2:** the quarterly stat engine (`index_cells`
   snapshot job — median/IQR per metro×item, publication-gated n≥5 +
   founder review) once ≥2 verified metros exist; public aggregate
   CSV/JSON download + "cite this" + Dataset JSON-LD enrichment; the first
   **defensible original stat** drafted from real data (founder + counsel
   review before anything is press-facing — product builds the artifact,
   not the pitch).
5. **Hospice facility pages enrich → lift noindex** where content is real
   (CMS facts + state aggregates + claim status); claim-your-page conversion
   polish from Phase-1/2 lead data.

### Week of Aug 24 — grounded-AI wave 2 (every item eval- or fallback-gated)
6. **Grounding/citation audit layer:** a shared post-generation check that
   every user-facing AI sentence traces to supplied ground truth (the
   pattern the analyzer already follows, factored into `lib/claude.ts` as a
   reusable verify step + logged violations) — prerequisite for everything
   below.
7. **Document explainer** ("this paper the funeral home handed me — what is
   it?"): display-only, grounded in the uploaded text + the FTC rule
   citations, redaction-first, rate-limited, deterministic fallback.
8. **Quote-comparison narrator** on `/negotiate/[id]/compare` (grounded in
   the quote_items already rendered; no ranking, anti-steering-safe
   language).
9. **Model tiering round 2:** Haiku 4.5 across classification-shaped calls
   (subscription-finder already done in Phase 1; sweep the ledger for the
   next candidates by cost) — each swap behind the eval harness + fixture
   diff; `/admin/ai-costs` gains per-feature $ trend.

**Phase-3 exit gate:** national pipeline has processed ≥1 full non-Utah
state with email-coverage numbers; metro pages + index update themselves
from data; the dataset is downloadable and citable; one draft original stat
awaiting founder/counsel sign-off; AI wave-2 features grounded-or-silent
with eval evidence; suite green.

**Founder work this phase:** launch-state input (with counsel) · stat
defensibility review · continued GPL/promotion cadence.

---

## PHASE 4 — Prove and repeat (Mon Aug 31 → Fri Oct 16) · seven weeks, milestone-level

**Objective:** the pilot runs on the product, the product proves it, billing
turns on, and hospice #2 costs a fraction of hospice #1. Day-level planning
here happens at Phase-3 exit, shaped by pilot reality — that re-planning
session is itself on the calendar.

**M1 — Pilot live on product rails (target: first two weeks of Sep).**
Real families through referral links; cockpit metrics moving; weekly product
triage of every friction point coordinators or families actually hit (this
is deliberately unspecified — real usage sets this backlog, and it takes
priority over everything else in the phase).

**M2 — Billing on (with the pilot's yes).** `BILLING_LIVE` flipped for the
pilot partner; real price IDs; invoice/receipt copy in bereavement-support
framing; `/admin/partners` shows revenue state. **The 90-day goal is met the
day this webhook fires with a real subscription.**

**M3 — The proof artifact.** Quarter-in-review report per partner
(ProofSheet v2 + the AI digest + cockpit metrics) — printable, forwardable,
the thing the pilot champion takes to their board and the thing we hand
hospice #2. Repeatability test: seed → approve → onboard → first-family →
first-report for a *second* (real or realistic) org without founder heroics.

**M4 — Outcomes-density unlocks (strictly data-gated, in this order):**
structured outcome labels on closed cases → home responsiveness scoring
(internal only) → anomaly dashboard. Reputation profiles and the negotiation
coach stay parked unless n>5 + significance per home (guardrail #4 — the
gate is in writing here so nobody talks themselves into it early).

**M5 — Employer channel product-complete:** employer billing live-able,
enrollment polish, an employer demo motion equal to the hospice one; the
`/employers` funnel instrumented. (Employer *sales* is not product work;
the product just stops being the excuse.)

**M6 — Platform hardening (the boring week that saves us later):** RLS
audit refresh against every table added since June · backup/restore drill
on the prod project · incident runbook · dependency/security pass ·
Lighthouse budget enforcement · load sanity on the analyzer + tier API.

**M7 — Spanish i18n** — only if human/clergy review capacity materializes
(drafts exist in `docs/i18n-es/`; the gate is review, not build).

**Phase-4 exit = the scoreboard below.**

---

## Standing tracks (every phase, no exceptions)

- **Weekly eval run** (`npm run eval:analyzer`) — model/prompt config changes
  only with before/after fixture evidence committed.
- **Weekly data cadence:** founder ingests → promotes; the session verifies
  badges/pages picked it up (ISR + revalidate proof).
- **Guardrail grep in CI** (Phase 2 makes it a script): steering words,
  employer word-ban, brand-grep, attribution-read check, Stripe-import
  scope, payment-UI-in-family-flow = 0.
- **Docs truth:** every shipped item gets its status flipped in
  ROADMAP/backlog docs the week it ships — the Jul-15 audit found a week of
  stale-doc drift; never again.
- **Migration discipline:** one per build day, founder-applied in the
  bhadjv SQL editor, BOOTSTRAP regenerated, VERIFY extended, code degrades
  gracefully until applied.
- **Kill switches:** `OUTREACH_LIVE`, `PARTNER_DIGEST_ENABLED`,
  `BILLING_LIVE` — each flips only on explicit founder action, never as a
  side effect of a deploy.

## Decision calendar (founder inputs the plan needs)

| When | Decision |
|---|---|
| Now | TESS knockout commissioned (gates Rename Day, Jul 27) |
| By Jul 23 | Stripe pilot pricing (price IDs in env) |
| Any time | Benchmark Wave-1 redline · Calendly vs cal.com |
| Phase 2 | Community-tier public stance confirmed (promotion = publication, or add a second switch) |
| Phase 3 | Launch-state list (with counsel) · original-stat sign-off |
| Phase 4 | `BILLING_LIVE` + `PARTNER_DIGEST_ENABLED` with the pilot · outcomes-unlock go/no-go at each data gate |

## Parked — and what unparks each

Grief/crisis concierge (a dedicated safety review, clinical input, and its
own build slot — highest-risk item in the roadmap) · BAA staff-assisted
variant (counsel clears a BAA) · home-level public claims/reputation
profiles (n>5 + p<0.05 per home) · insurer anything (never — guardrail #1) ·
family charges (never — guardrail #2) · full pricing-model A/B
infrastructure (real traffic volumes) · press/marketing site work beyond
the dataset artifact (that's the marketing lane, not this plan).

## The 90-day scoreboard (what "done" means on Oct 16)

1. **One hospice paying in-product** — a real Stripe subscription on a real
   partner (M2).
2. **The verified tier is real:** ≥2 states with verified metros, visible n,
   sources on every row; community tier live from consented contributions.
3. **The proof loop closes:** referral → family → outcome → cockpit →
   quarter report → renewal conversation, all on product rails, n≥5
   suppression intact end-to-end.
4. **Reach compounds:** programmatic metros + hospice pages indexed, the
   dataset citable, the four organic loops instrumented and producing leads.
5. **The AI layer is governed:** 100% of calls cost-tagged (done), every
   model/prompt change eval-gated, every public endpoint rate-limited
   (done), every user-facing sentence grounded-or-silent.
6. **Open Farewell everywhere,** old domain redirecting forever, inbound
   mail unbroken, SEO recovered to pre-rename impressions (check at +2 and
   +6 weeks).
7. **Zero guardrail breaches** — the grep suite says so in CI, and a human
   said so at each phase gate.

## Risk register (named so they're managed, not discovered)

- **Founder bandwidth is the critical path** for data (GPL collection,
  promotions, migrations, decisions). Mitigation: every founder task in
  this plan is a checklist item with a tool built for it; nothing assumes
  founder engineering.
- **The pilot may not sign on our schedule.** Phases 2–3 are deliberately
  pilot-independent (density, reach, hardening compound regardless); Phase 4
  re-plans around reality.
- **Post-rename SEO dip.** Managed, monitored at +2/+6 weeks; the
  programmatic surfaces in Phase 3 rebuild breadth on the new domain.
- **Counsel latency** (TESS, launch states, stat sign-off). Every
  counsel-gated item has a no-regrets fallback: Rename Day slips a week
  before anything else does; the pipeline ships states without contacting
  anyone; the stat waits.
- **Data-density temptation** — the standing risk of shipping impressive
  features on thin data. The gates in M4 and guardrail #4 are the answer;
  they're written down precisely so future sessions can't rationalize past
  them.
