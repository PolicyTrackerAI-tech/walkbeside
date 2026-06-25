# Roadmap — realigned to the Operating Plan

The single execution plan, aligned to [`OPERATING_PLAN.md`](OPERATING_PLAN.md).
Goal: **one hospice paying (or about to) within 90 days.** Everything below
serves that.

This **supersedes the consumer-launch framing** of `LAUNCH_CHECKLIST.md` /
`LAUNCH_PLAYBOOK.md` (which assumed a family-paid product). Their technical
setup steps remain valid; their family-payment/pricing items are legacy — see
the doc-status table at the bottom.

---

## Where we are vs. the three layers

### L1 — Free source of truth — **largely built; keep extending**
Live and genuinely free: `/prices` (ZIP calculator), `/average-funeral-cost`,
`/funeral-costs` + per-metro `/funeral-costs/[city]`, `/analyzer` (photo + Claude
OCR "is this fair?"), 40+ guides across 9 categories, `/glossary` (63 terms),
`/funeral-homes` directory (vetted-gated), `/prep` (FTC rights), trust pages
(`/our-role`, `/faq`, `/how-it-works`) that state the no-funeral-home-money
model. **Guardrail #2 already honored here** — none of this is paywalled.
**Gaps:** no published **Fair-Price Index** product page; no methodology page;
no public **mistakes** page; no dataset/API surface.

### L2 — Instrumented family service — **outcomes layer ~85%, uncommitted**
The at-need `/negotiate` flow exists. **Outcomes instrumentation is built but
not yet applied** (separate branch/PR): migration
`supabase/migrations/2026-06-22-negotiation-outcomes.sql` (listed/quoted/
negotiated/paid/chosen/hidden-fees/satisfaction + computed savings), a
family satisfaction capture on the closed page, and `/admin/outcomes`.
**Gap:** apply the migration; then the outcomes dashboard for L3.

### L3 — Institutional — **does not exist (this is the revenue)**
No partner portal, no reporting dashboard, no hospice/employer auth or B2B2C
routing. Everything here is net-new and is the most important thing to build
after outcomes data exists.

### Guardrail check against the live code
All six hold today (free L1, no funeral-home money, vetted directory, no
steering, RLS-private family data) — **except** the consumer **$49 pay-to-send**
charge, which contradicts guardrail #2 and is scheduled for removal
([`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md)).

---

## Build order (re-ranked to the bible)

**P1 — Finish the outcomes layer (the moat).**
- Apply the outcomes migration to prod; verify the family + admin recording
  paths persist; confirm RLS.
- (This is the in-flight PR — review, apply, merge.)

**P2 — Make families free + trust spine.**
- Execute [`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md): remove the $49
  charge, re-route the outreach trigger off payment (kept dry-run via
  `OUTREACH_LIVE` off), scrub family-pay copy.
- Build the trust spine: methodology page, "we take no money from funeral homes"
  page (exists in spirit — formalize), public mistakes page, named reviewers.

**P3 — First hospice pilot infrastructure (L3 v1).**
- Scrappy **partner portal** (a hospice enrolls/refers a family to a neutral
  tool — anti-steering safe) + a **reporting dashboard** (families served,
  satisfaction, savings, time-to-resolution) reading the outcomes data.
- Built lean, for one pilot. Founder runs the pilot cases by hand.

**P4 — Fair-Price Index + programmatic depth.**
- Publish the Index as a free public page + methodology; lead with an original
  stat from our data; expand programmatic metro/home pages.

Anything not in P1–P4 waits unless it grows reach, advances an institutional
deal, or deepens the data.

---

## The 90-day sprint (adapted)

- **Weeks 1–4 — Foundation & first data:** apply outcomes migration; ship the
  decommission (families free, emails still off); publish methodology + trust
  pages; build the 20–30 Utah-hospice target list; first mini price-disclosure
  survey; first 10 hospice outreaches.
- **Weeks 5–8 — First pilots & proof:** 10+ discovery calls; 1–2 free pilots;
  run at-need cases by hand capturing every outcome; partner portal + reporting
  v1; first savings case studies.
- **Weeks 9–12 — Convert & publish:** one-page proof sheet; ask for the paid
  contract + peer intros; publish the first Fair-Price Index with a press push;
  decision memo vs the scorecard.

---

## Status of every existing plan doc

| Doc | Status vs the bible | Action |
|---|---|---|
| `OPERATING_PLAN.md` | **the bible** | canonical |
| `CLAUDE.md` (root) | **governance** | canonical |
| `ROADMAP.md` | **this plan** | canonical |
| `PAYMENT_DECOMMISSION.md` | **new plan** | execute (P2) |
| `DATA_PLAN.md` | aligned — payer changes, pipeline doesn't | keep |
| `FUNCTIONAL_AUDIT.md` | aligned (orthogonal to model) | keep |
| `FAITH_REVIEW_FINDINGS.md` / `GLOSSARY_REVIEW_FINDINGS.md` | aligned (L1 content) | keep |
| `AI_STRATEGY.md` | reframe — unit econ anchors to family $49 | banner + reframe payer to institutional |
| `LAUNCH_CHECKLIST.md` | reframe — tech valid, pricing items legacy | banner; rewrite the family-payment items |
| `SMOKE_TEST.md` | reframe — Phase 0–1 valid, Phase 2 assumes family checkout | banner; rewrite Phase 2 for partner onboarding |
| `LAUNCH_PLAYBOOK.md` (root) | reframe — setup valid, $49 fee section legacy | banner |
| `PAYWALL_RECOMMENDATION.md` | **legacy** — entire family-payer debate superseded | banner: superseded |
| `IDEA_LICENSED_FD_MARKETPLACE.md` | parked (already) | keep, leave parked |
| `INTEGRATION_STATUS.md` | ops-keep (branch hygiene) | keep |
| `PROD_SETUP.md` | ops-keep — clarify outreach is institutional | keep + minor note |
| `UTAH_HOMES_SOURCING.md` | ops-keep — reframe "homes as family options" → pilot density | keep + minor note |
| `LAWYER_BRIEF.md` / `LAWYER_OUTREACH.md` | keep — but the bible adds anti-steering + HIPAA/BAA + institutional MSA needs | extend the counsel asks |
| `CLAIMS_VALIDATION.md` | keep — claims substantiation is now load-bearing (FTC §5) | keep |
| `PRIVACY_RETENTION.md` / `SECURITY.md` | ops-keep — over-invest (trust brand; SOC 2 path) | keep |
| `REFUND_SOP.md` | **legacy** once the consumer charge is removed | banner: superseded by decommission |
