# Open Farewell (today: Honest Funeral) — The Business Plan

_Confidential · v2.0 · July 17, 2026 · Ryan Currie, Founder · honestfuneral.co → openfarewell (Rename Day: Jul 27, 2026)_

> **What this document is.** The complete master narrative of the company — for the
> founder to operate from, for an insider to fully absorb where we have been, what is
> built, and where this goes, and for an investor or acquirer to diligence against.
> It supersedes the June 2026 business plan and sits directly on top of the operating
> bible (`docs/OPERATING_PLAN.md`), the 13-week product plan
> (`docs/PRODUCT_PLAN_2026-Q3.md`), the July 2026 market research, and a
> route-by-route inventory of the shipped codebase. Every section states its sources;
> every hypothesis is labeled as one. Where this document conflicts with the six
> guardrails (§2.2), the guardrails win.

> **A note on figures.** Market and competitor figures are drawn from cited public
> sources (verified July 2026); figures labeled *derived* are arithmetic on those
> inputs; pricing and the financial model are explicit, labeled hypotheses — because
> the honest core unknown is that **no institution has paid us a dollar yet**, and
> this plan is engineered to close exactly that gap on an aggressive clock.

---

## Table of contents

**Part I — The Company**
1. [Executive summary](#1-executive-summary)
2. [What this company is — and is not](#2-what-this-company-is--and-is-not)
3. [Where we have been — the build record](#3-where-we-have-been--the-build-record)

**Part II — Market & Product**
4. [The problem and the market](#4-the-problem-and-the-market)
5. [The product — as actually built](#5-the-product--as-actually-built)
6. [The data moat](#6-the-data-moat)

**Part III — Business Model**
7. [Pricing & packaging — the full analysis](#7-pricing--packaging--the-full-analysis)
8. [Go-to-market — the founder-led sales machine](#8-go-to-market--the-founder-led-sales-machine)

**Part IV — The Money**
9. [Cost study — unit economics from the code up](#9-cost-study--unit-economics-from-the-code-up)
10. [Financial plan](#10-financial-plan)

**Part V — Execution**
11. [Compliance, security & trust — the program](#11-compliance-security--trust--the-program)
12. [Team & hiring — stay lean, founder sells](#12-team--hiring--stay-lean-founder-sells)
13. [Timeline — the aggressive plan of record](#13-timeline--the-aggressive-plan-of-record)
14. [Risks & hurdles — the full register](#14-risks--hurdles--the-full-register)
15. [Endgame — the premium acquisition, from strength](#15-endgame--the-premium-acquisition-from-strength)

**Appendices**
A. [Product route inventory](#appendix-a--product-route-inventory-as-of-main--353607f-2026-07-17) ·
B. [Database inventory](#appendix-b--database-inventory) ·
C. [AI system inventory](#appendix-c--ai-system-inventory) ·
D. [Source documents index](#appendix-d--source-documents-index-the-constellation-this-plan-sits-on) ·
E. [Glossary of internal terms](#appendix-e--glossary-of-internal-terms) ·
F. [Assumptions & disclaimers](#appendix-f--assumptions--disclaimers)

---

# Part I — The Company

## 1. Executive summary

### 1.1 The business in one page

**The neutral seat in funeral pricing is empty because everyone else is paid to keep
it that way. We take it — free to every grieving family, paid by the institutions
that serve the dying — and compound a dataset and a brand no acquirer can build.**

More than half of American deaths now pass through hospice (52.9% of Medicare
decedents — over 1.3M/yr through ~6,700 hospices), into a funeral market where an
$8,000–$13,000 purchase is decided in 24–72 hours, identical services vary 2–5×
within one city, prices are legally request-only, and 54.7% of families contact
exactly one funeral home. Everyone who claims to help is conflicted: comparison
sites are funeral-home lead-gen; insurer concierges are paid to smooth the claim,
not shrink the bill. The July 2026 market research verified the white space
directly: **no company sells funeral navigation or price transparency to hospices
as the payer.**

Our model: **families pay nothing, ever.** Hospices pay first — they carry a
federal bereavement mandate (42 CFR 418.64, ~13 unfunded months per family) with
14 social-worker minutes per patient per week to deliver it, and they are legally
unable to answer the one question every family asks ("who should we call?").
Employers pay second — bereavement benefits exist, and none contains a funeral-price
advocate. Funeral homes and insurers **never** pay us; insurers distribute or
acquire, only. The moat is the **outcomes dataset** (listed → quoted → negotiated →
actually paid → satisfaction, captured case by case at <$1 marginal cost) plus the
**conflict-free brand** — assets that compound daily and cannot be backfilled by an
acquirer at any price.

**What exists today** (built solo, ~12 weeks, ~166 PRs, near-zero external spend):
116 pages and 49 API routes — the free source-of-truth layer (87 metro pages,
quote analyzer, 63-term glossary, ~40 guides, 50-state estate data), the
instrumented family advocacy flow, and the full institutional product (partner
portal, referral links, coordinator tools, aggregate proof reports, admin cockpit)
— governed by kill switches, consent gates, an eval-gated AI layer, and six written
guardrails. What does not exist yet: a real hospice cohort, and revenue. **This
plan's entire purpose is closing that gap on a 90-day clock: one hospice paying,
in-product, by October 16, 2026** — then proving it repeats.

### 1.2 The numbers that matter

| | |
|---|---|
| Channel | >1.3M Medicare hospice deaths/yr · ~6,700 hospices · avg ~200 deaths/yr each · $28.3B Medicare spend |
| Hospice wedge ceiling | ~$65–70M ARR (illustrative, $50/family full penetration) |
| Recommended pricing | $4,800 / $9,600 / $18,000 per year by census tier (pilot free, 60 days) — decision lands Jul 23 |
| Employer layer | ~$3.50 PEPM → ~$42k ACV per 1,000 employees → ~25 logos ≈ $1M ARR (4–8× fewer logos than hospice) |
| Cost to serve a family completely | ~$0.10–0.25 measured; $1.00 planning ceiling |
| Fixed cost base | ~$170–340/mo today; ~$0.8–1.7k/mo pilot-ready — covered by two small logos |
| Plan-case trajectory | 5 logos / ~$42k ARR (Dec 2026) → ~$690k ARR (EOY 2027) → ~$2M+ (2028), default-alive throughout |
| Founder capital required | <$20k worst-case 2026 spend against ~$40k committed |
| The gate that matters | Paid LOIs + median documented family savings ≥$1,500 across pilot cases |

### 1.3 The ask (and the non-ask)

This is a **prove-it-first company**: bootstrapped by default, default-alive at two
paying logos, raising only on scorecard-green proof (1–2 paid contracts + renewal
signal + traction), at which point a $250–500k angel/mission round accelerates
founder full-time, the hospice-insider hire, SOC 2, and the data engine — and a
$1–2M seed is justified only by employer-channel proof. For the insider, the ask is
simpler and harder: hold the guardrails, hit the calendar in §13, and let the
honest numbers — including the ones that say "unproven" — do the selling.
## 2. What this company is — and is not

### 2.1 The thesis in one paragraph

Honest Funeral (renaming to **Open Farewell** on July 27, 2026) is the **free, neutral
source of truth for funeral pricing** in America, and the instrumented advocate that
helps grieving families act on it. Families pay nothing — ever. Revenue comes from the
**institutions that serve the dying**: hospices first (a federal bereavement mandate,
42 CFR 418.64, that they must fund out of their own per-diem), then employers (a
bereavement benefit with no funeral-price advocate in it anywhere on the market).
Funeral homes and insurers are **never** our payer — insurers may distribute our tools
or acquire the company, but a dollar of insurer or funeral-home revenue would destroy
the one asset no competitor can copy: we are **paid by no one with a stake in the
funeral price**. The compounding assets are a **proprietary outcomes dataset** (what
families were quoted, what they negotiated, what they actually paid, and how it felt)
and a **conflict-free consumer brand**. The base-case ending is a **premium strategic
acquisition** by an insurer, platform, or incumbent who cannot build those two assets
themselves.

### 2.2 The six guardrails — non-negotiable law

Every strategic and product decision in this plan is subordinate to six rules. They are
enforced in code where code can enforce them, in CI greps where text can be scanned, and
in this document where judgment is required. A change that violates one of these is
wrong no matter how good it looks:

| # | Guardrail | Why it is load-bearing | Where it is enforced |
|---|---|---|---|
| 1 | **Never take money from funeral homes, or from an insurer as payer** | The entire moat. Neutrality is the product; this is also a license-revocation offense for homes in NY/VA (per-referral fees poison both sides) | Business model; no billing surface exists for homes; CI guardrail greps |
| 2 | **Never charge the grieving family as the growth engine** | Charging the bereaved buried Grace, Cake, Willing, Halolife, Tulip. The consumer paywall was fully decommissioned 2026-06-26 and no family charge exists anywhere in code | `PAYMENT_DECOMMISSION.md` executed; payment-UI-in-family-flow = 0 is a CI check |
| 3 | **Never steer a family to a specific home** | Legal necessity (state anti-steering law; NHPCO ethics) and the reason hospices can hand us to families | Neutral options UI; `docs/ANTI_STEERING_EVIDENCE.md` documents the design for counsel |
| 4 | **Never publish a number we can't defend** | "Honest" is the brand; one exposed exaggeration undoes it | n>5 + significance gate before any home-level public claim; `/methodology` page; badge-honesty rule on data tiers |
| 5 | **Never own the funeral or its capital risk** | We are an advice + data layer; owning fulfillment recreates the conflicts we exist to remove | No fulfillment, escrow, or pre-need product anywhere in the roadmap |
| 6 | **Never rent the whole flywheel from one platform** | SEO alone, one social channel alone, or one partner alone is a single point of failure | Four organic loops + institutional distribution + owned email list |

### 2.3 What we are

- **A source of truth.** Free price tools, the quote analyzer, ~40 guides, a glossary,
  87+ metro pages, a methodology page, and the Fair-Price Index — public, citable,
  built to be the answer Google, ChatGPT, and journalists give about funeral costs.
- **A family-side instrument.** The at-need flow invokes the family's FTC Funeral Rule
  right to itemized prices and returns neutral side-by-side options. Its second,
  strategic job is the outcomes dataset.
- **An institutional product.** A partner portal, referral-link machinery, coordinator
  tools, and a reporting dashboard that lets a hospice prove it delivered its
  bereavement obligation — the thing institutions actually buy.
- **A data company.** Every case, every ingested General Price List (GPL), every
  consented analyzer contribution deepens a dataset with three tiers (verified /
  community / modeled), each honestly labeled.

### 2.4 What we are not — the anti-model

Refusing revenue is the strategy, not a limitation of it. Each refusal below is a
revenue stream a competitor depends on, which is precisely why they cannot follow us
into the neutral seat:

| Revenue we refuse | Who lives on it | What refusing it buys us |
|---|---|---|
| Funeral-home referral fees / lead-gen | Funeralocity, Parting, every "comparison" site | The right to be believed by families and endorsed by hospices; legality in NY/VA |
| Insurer-as-payer concierge contracts | Empathy (~$162M raised, 8 of top-10 life carriers) | The one wedge Empathy structurally cannot copy: an advocate whose job is lowering the bill, not smoothing the claim |
| Charging the grieving family | The death-tech graveyard (Grace, Cake, Willing, Halolife, Tulip, Lantern…) | A growth engine that isn't morally and economically upside-down; free-to-family is why the hospice can hand it out |
| Owning/arranging the funeral | Funeral homes, pre-need sellers | No inventory risk, no state funeral-directing licensure exposure (TX/SC definitions are broad), no capital at risk |
| Selling family data | Data brokers | RLS-enforced privacy is a sales asset in hospice procurement, not a cost center |

We are also **not** a grief-therapy platform, an estate/probate service, a will writer,
a body broker, or a marketplace. Where those jobs touch ours (after-death admin,
benefits checklists), we navigate and point; we do not absorb the conflict-laden swamp.

### 2.5 The three layers (the mental model for every build decision)

- **L1 — Free source of truth** → produces reach, brand, citations, and top-of-funnel
  data. Largely built; extended weekly.
- **L2 — Instrumented family service** → produces proof of neutrality, savings case
  studies, and the proprietary outcomes data. Built and consent-gated.
- **L3 — Institutional product** → produces the revenue. Built (portal, links,
  reporting, digest, coordinator tools) but **unproven — zero real hospice cohorts have
  run through it**. The gate is no longer engineering; it is migrations-applied,
  counsel retained, and a named pilot.

Build priority when in conflict: outcomes instrumentation → free tools + trust spine →
partner portal for the pilot → Fair-Price Index + programmatic reach. Anything that
doesn't grow reach, advance an institutional deal, or deepen the data waits.

---

## 3. Where we have been — the build record

An investor reading this section should take away one thing: **execution velocity is
the founder's demonstrated edge.** The record below is reconstructed from the git
history (first commit 2026-04-23; 365 commits and ~166 merged PRs on `main` as of
2026-07-17) and the dated planning documents in `docs/`.

### 3.1 Timeline

| Period | What happened | What it proves |
|---|---|---|
| **Apr 23 – May 12** | Repo founded as "FH" — at-need family guidance platform (first-72-hours flow, arrangement-meeting prep). Funerose → Honest Funeral rename decided | Product instinct started family-side, day one |
| **May 13–17 (5 days)** | First build sprint: 25+ pages live, email infrastructure (Resend + Google Workspace), 28 city pages, $199 consumer paywall era, Utah outreach pipeline (193 homes), OG images/schema/sitemap | A full consumer product shipped solo in a week |
| **May 18 – Jun 21** | Content verification pass (faith traditions + glossary adversarially checked against authoritative sources), vetting system for homes, RLS hardening, share links, quote-items model | Trust infrastructure before growth — the brand's spine |
| **Jun 22–26 (the pivot week)** | The Operating Plan ("the bible") lands Jun 24: **B2B2C flip** — free to families, institutions pay. Consumer paywall fully decommissioned (PRs #49/#50). Outcomes layer ships (PR #71): listed/quoted/negotiated/paid/satisfaction per case | The single most important strategic decision to date, executed in days, including deleting a live revenue feature because the model demanded it |
| **Jun 25** | `docs/THE_WEDGE.md`: product-first refocus on the "is this quote fair?" checker | Focus discipline — one wedge, fast |
| **Jul 1** | Market research (Cowork deep-research PDF) validates the white space and hardens the channel rules: family-initiated activation only, post-admission delivery only, hospice-transmits-nothing, navigation-never-arranging. Falsified stats scrubbed from live copy (PR #83) | The company updates on evidence, including against its own copy |
| **Jul 4** | 31-item hospice/family roadmap completed; adversarial audit cycle (PRs #116–#118); ESLint to zero; `/partners` sales-ready redesign, AI outcomes digest, coordinator quote-check tool (PRs #122–#131) | Sales-readiness build burst |
| **Jul 9** | Pilot-readiness burst: case stepper, portal shell, pipeline admin, anti-steering evidence doc, sales-gap fixes (PRs #132–#146) | The L3 product exists end-to-end |
| **Jul 13–15 (Product Week)** | Two-sided portals (hospice + employer variants), magic-link member auth, family-flow attribution bridge, AI infrastructure (cost ledger, inbound auto-parse, deterministic fallbacks), 50-state data tiers with honesty badges (PRs #147–#156) | The product became two-sided and 50-state |
| **Jul 15 (evening)** | 13-week master plan written (`PRODUCT_PLAN_2026-Q3.md`, PR #157); **Open Farewell rename decided** — honestfuneral.com is squatted; openfarewell domain stack + socials purchased same evening; Rename Day set for Jul 27 | Decisive brand action inside 24 hours of discovering the problem |
| **Jul 16–17 (current sprint, days 1–3)** | Eval harness + eval-gated model re-baseline to sonnet-5/haiku (PR #158); AI cost ledger priced per-model-per-day (#160); eulogy truncation fix (#161); founder GPL ingest tool `/admin/ingest-gpl` (#162); Migration A — CMS hospice reference layer (6,852 facilities) + consent architecture (#163); compare-quotes contribute-consent (#166) | The data engine and its governance shipped in three days |

### 3.2 What the record establishes

1. **Velocity:** ~166 PRs in 12 weeks, solo, while also doing strategy, research, and
   data collection. The build cost of this company to date is close to zero dollars of
   external spend.
2. **Reversibility discipline:** the two biggest strategic mistakes (consumer paywall;
   an early falsified-stat in marketing copy) were both found and fully reversed within
   days, in public, with documentation. This is the trust brand practiced internally.
3. **The two pivots were convergent, not thrashy.** Consumer-paid → institution-paid
   (Jun 24) and GTM-first → product-first (Jun 25) both moved toward the same end
   state: free to families, paid by institutions, data as moat.
4. **What has never happened yet:** a real hospice cohort through the portal, and a
   dollar of revenue. This plan is built around closing exactly that gap, and every
   claim in it should be read with that honesty in mind.

### 3.3 Doc constellation (where the thinking lives)

The company writes everything down. The load-bearing set an insider must know:
`docs/OPERATING_PLAN.md` (the bible) · `docs/PRODUCT_PLAN_2026-Q3.md` (the 13-week
master plan) · `docs/ROADMAP.md` (execution realignment + validation sprint) ·
`docs/PRODUCT_SPRINT_2026-07-16.md` + `_BUILDSHEETS.md` (current sprint, day-level) ·
`docs/LAWYER_BRIEF.md` + `docs/COMPLIANCE_ADDENDUM.md` (legal spine) ·
`Honest_Funeral_Market_Research.pdf` (market evidence) · `docs/DATA_PLAN.md` +
`docs/FAIR_PRICE_INDEX.md` (data strategy) · `docs/HOSPICE_GTM.md` + `docs/BATTLECARD.md`
+ `docs/sales/` (sales system) · `docs/NAMING_SPRINT_2026-07.md` (rename runbook) ·
`CLAUDE.md` (the operating contract every human and agent works under). This document
supersedes the June 2026 `BUSINESS_PLAN.md` and is the master narrative that ties them
together.
# Part II — Market & Product

## 4. The problem and the market

> Figures in this section carry their sources inline. Where a number is our own
> derivation, it says *derived*. Where the market research found a popular claim to be
> unsupportable, we say so and don't use it (§4.8) — the plan practices guardrail #4
> on itself. Primary source: `Honest_Funeral_Market_Research.pdf` (July 2026, ~60
> sources verified against NFDA/MedPAC/FTC/CMS/Federal Register), abbreviated **MR**.

### 4.1 The problem, mechanically

A funeral is an **$8,000–$13,000 purchase decided in 24–72 hours** (MR p1) by a buyer
who is grieving, time-boxed, inexperienced (zero repeat purchases), and socially
inhibited from negotiating. The market answers with structural opacity:

- **Prices are hidden.** The FTC Funeral Rule (16 CFR Part 453, 1984) guarantees an
  itemized General Price List **in person and by phone — not online**. Only ~18% of
  homes post prices online (industry-sourced; flagged for replacement with our own
  corpus data). In a 2022 check, **0 of 102** SCI/Dignity Memorial locations posted
  prices (MR p3). 88% of consumers expect pricing online (Foresight 2024, n=5,335).
- **Dispersion is extreme.** Identical service bundles vary **2–5× within one city**
  (MR p1); CFA/FCA surveys (150 homes, 10 metros) put full-service funerals at
  **$2,580–$13,800** with same-metro spreads "almost always ≥100%, often >200%."
  Direct cremation in Indianapolis alone: **$845–$3,300+** for the identical
  disposition (MR p3, p9). Chain premium: SCI/Dignity priced up to **72% above
  independents** in the same cities; casket markups run ~5× wholesale (PIRG).
- **Nobody shops.** 54.7% of planners contacted **only one** funeral home (NFDA 2025,
  *rising* from 47.5%); only 20% visited more than one (CFA/Ipsos 2022). Knowledge of
  rights is near zero: 25% know about phone quotes, 5% know the outside-casket rule,
  17% know direct cremation exists under ~$1,200 (CFA/FCA 2020).
- **The damage is financial and lasting.** 42.6% of Americans couldn't cover a funeral
  without borrowing (Debt.com 2025; a companion CardRates 2025 survey puts
  "would need to borrow" at 58%). Of those who took funeral debt, 59% used credit
  cards and 36% skipped rent, utility, or card payments to pay it. GoFundMe hosts
  125,000+ memorial fundraisers a year (~$330M). Meanwhile benefits go unclaimed:
  **fewer than 25% of eligible veteran families use VA burial benefits** (~2/3 don't
  know they exist), and the SSA death benefit has been $255 since 1954 (MR p1, p4, p9).
- **Everyone "helping" is paid by the other side.** Comparison sites are funeral-home
  lead-gen; insurer concierges serve the insurer (paid to smooth the claim, not shrink
  the bill); the funeral home is the seller. Total per-death cost including admin:
  ~$12,600 and ~420 hours of administration over 12–18 months (Empathy Cost of Dying,
  2024 — the conflicted incumbent's own research making our case).

**The neutral seat — an advisor paid by no one with a stake in the funeral price — is
empty.** The market research's core verification (MR p8): *"extensive searching found
no company selling funeral planning or price transparency to hospices as the payer."*

### 4.2 The demand side is permanent and growing

- ~3M US deaths/yr, rising past **3.6M by 2037** (CDC/NCHS-sourced, cited in the
  operating plan). Death care does not have demand cycles.
- **Cremation 63.4% (2025) → ~82% projected by 2045** (NFDA). Direct cremation is
  becoming a commodity whose 4× same-city price spread is pure information failure —
  the easiest wedge the market has ever offered a transparency product (MR p9).
- Median costs: **$6,280** (funeral w/ cremation) / **$8,300** (w/ viewing + burial),
  and the burial median *excludes* the vault (median $1,695), plot, opening/closing,
  and marker — conventional burial runs **$12,000–$18,000 all-in** in much of the
  country (NFDA 2023 GPL study; MR p3).

### 4.3 The buyer: hospice economics in one table

The first paying customer is not the family — it is the institution legally on the
hook for their bereavement. The channel numbers (MR p5–6; MedPAC March 2026):

| Fact | Number | Why it matters to us |
|---|---|---|
| Medicare decedents using hospice (2024) | **52.9% — >1.3M deaths/yr** (all-time high) | More than half of American deaths pass through our channel |
| Medicare-certified hospices | **~6,706** (82% for-profit by count; CMS provider dataset carries 6,852 rows incl. multi-location) | The addressable logo universe; long-tail (VITAS + Gentiva together <10% of days) |
| Average hospice | **~200 deaths/yr** | The ACV anchor: 200 × $25–75/family = $5–15k/yr |
| Medicare hospice spend | **$28.3B (+10.4% YoY)**; routine home care **$230.83/day** (FY2026) | The per-diem that silently funds the unfunded mandate |
| Margins | Aggregate **8.0%**; for-profit **13.7%**; nonprofit **−1.3%** (MedPAC 2023 data) | Price must sit inside a thin margin: small, obvious-ROI contracts; sponsorship tier for nonprofits |
| Bereavement obligation | **42 CFR 418.64** — organized bereavement support **~13 months post-death**, survey-able, **not separately reimbursed** | A real, mandated, unfunded pain — the procurement hook |
| Social-worker reality | ~0.3 visits/wk ≈ **14 min/patient/week**; caseloads ~29 patients; staffing = #1 executive concern (40% in 2026) | The time-returned pitch is quantified before we say a word |
| CAHPS | Emotional/spiritual support = **highest**-scoring measure, 91% top-box; only ~32% of hospices even have a star rating | **Never** pitch score repair — pitch time, mandate coverage, and referral reputation |
| Timing | Median lifetime length of stay **19 days**; 25% enroll ≤5 days before death | The product moment is **admission week**, pre-death — a one-sitting loop, not a leisurely journey |
| Climate | June 2026 DOJ takedown included a hospice owner buying decedent data from a funeral-home employee; CMS moratorium on *new* hospice Medicare enrollment from May 13, 2026 | Vendor diligence will be conservative — compliance documentation is a sales weapon; the moratorium freezes our buyer universe (no flood of new entrants, no shrinkage of existing ones) |

### 4.4 The moment: admission week, pre-death

The market research's sharpest product finding: with median hospice enrollment 19 days
before death and a quarter of families enrolled ≤5 days, **the window to help is the
week of admission — before death, in one sitting.** Post-death is too late for price
work (decisions are made in 24–72 hours under maximum duress), and consumers'
comparison-shopping behavior is *worsening* (54.7% single-home and rising). The
implication that shapes everything: **the product must do the comparing** — a family
should be able to hand us a quote or a ZIP code and get the answer, not a homework
assignment. Grief-phase features come later; admission-week is first.

### 4.5 Why now

1. **The FTC will not build the transparency layer.** Online-price rulemaking is
   stalled (ANPR Nov 2022 → workshop Sept 2023 → nothing as of mid-2026); only
   California mandates online GPLs. But **enforcement is live** — phone sweeps, 39
   warning letters, a staff report finding ~50% of 278 surveyed providers quoting only
   ranges. The rule that exists (itemized GPL on request) is our lever; the rule that
   doesn't (online posting) is our job. If rulemaking ever completes, it supercharges
   the corpus — either way we win.
2. **PE consolidation keeps raising prices** and public frustration (72% chain
   premium, roll-ups absorbing the D2C cremation startups).
3. **Generative discovery rewards citable original data.** The first neutral,
   methodology-backed funeral-price dataset becomes the answer AI assistants give.
   That position is being contested by no one (§4.7).
4. **The hospice mandate is unfunded and staffing is the #1 concern** — a vendor that
   returns social-worker hours and documents mandate delivery arrives at the moment
   the buyer is most receptive.
5. **The channel's scar tissue is our entry ticket.** Grace's 2019 collapse (§4.7)
   taught hospices exactly what to fear; a vendor architecturally incapable of the
   Grace failure is not just acceptable — it is the compliant answer to a question
   ("who should we call?" — MR p5) that hospice staff are ethically barred from
   answering with a referral.

### 4.6 Market size — bottom-up, honestly

The ~$20B+ funeral economy is the **size of the pain, not our TAM** — we take none of
that spend. Our market is what institutions pay for bereavement/navigation tooling:

- **Hospice wedge (beachhead):** full penetration of Medicare-certified hospices at
  $50/family ≈ **$65–70M ARR ceiling** on the wedge alone (MR p11, illustrative).
  Under this plan's tiered price list (§7.3), the SAM reads: ~6,700 hospices × blended
  ~$9–10k realistic ACV ≈ **$60–65M** — same answer by a different route. *Derived,
  labeled illustrative; B2B price points in this category are undisclosed
  market-wide.* Single chain contracts (VITAS ADC ~22,000; Gentiva ~34,000) are
  **$1M+ each** at per-family pricing — slow enterprise sales, sequenced after
  published pilot metrics.
- **Employer layer (the scale engine):** priced per-employee like an EAP add-on
  (§7.5). At $3.50 PEPM, a 1,000-employee company ≈ $42k ACV → **~25 employer logos
  clear $1M ARR** (~50 at a conservative $21k) — a 4–8× lower logo count than the
  hospice motion for the same revenue, from a buyer pool that scales with headcount,
  not death counts. Analog proof institutions pay for bereavement: Empathy ($162M
  raised; 1,000+ employers; 50M+ covered lives via 8 of the top-10 life carriers) and
  Everest Funeral Concierge (25M+ lives embedded in group life). Neither contains a
  neutral funeral-price advocate — the seat is empty *inside* every bereavement
  benefit on the market.
- **Data/Index licensing (later, highest margin):** anonymized benchmark licensing to
  non-conflicted buyers only (researchers, agencies, health systems, benefits
  platforms — never insurers-as-payer, never homes). Deliberately unexercised
  optionality; the public Index stays free because free is what gets cited.
- **SOM (this year):** Utah → mountain-west independents. 20–30 named targets,
  §13's pipeline math, one paying logo by Oct 16.

### 4.7 Competition — the full field

| Player | What they are | Who pays | State of play | Why we win the seat |
|---|---|---|---|---|
| **Empathy** | Insurer/employer bereavement concierge | Insurers, employers | $162M raised (Series C May 2025); 50M+ covered lives; category leader | Structurally conflicted on driving the funeral bill down — its payers want claims smoothed, not shrunk. We are the component it cannot build without breaking its payer model |
| **Everest Funeral Concierge** | Group-life embedded concierge w/ "PriceFinder" | Insurers (group life) | 25M+ covered lives | Same conflict; proves the embed pattern works |
| **Help Texts** | Grief-support texts, 13-month cadence | **Hospices** (~$99/family/yr retail) | ~$1M raised, alive, capital-light | Proves hospices buy against the bereavement mandate; texts-only, uncontested on funerals — a future partner more than a rival |
| **Funeralocity / Parting / Ever Loved / Funerals360** | Comparison/lead-gen sites | **Funeral homes** | Tiny or stalled (Funeralocity ~3 employees; Ever Loved <$5M revenue) | Home-paid = not neutral; aggregating request-public prices never made anyone the standard |
| **D2C cremation (Tulip, Solace, After.com, Neptune)** | Direct cremation sellers | Consumers | Mostly absorbed by PE (Foundation Partners, SCI) | They own supply; we are the layer above supply — no inventory, no conflict |
| **The graveyard: Grace, Cake, Lantern, Everdays, Willing, Farewill, Halolife…** | Consumer end-of-life apps | **The grieving family** | Dead or absorbed into funeral/insurer money (Cake→Foundation Partners 2024; Everplans→Precoa; Lantern→Wellthy; Farewill £30M raised → sold $16.8M) | The family is the wrong payer (once-in-a-lifetime, grief-window, zero-repeat). Our model exists because of this graveyard, not despite it |
| **Status quo** | The funeral home; the hospice's own stretched staff | — | 14 min/patient/week | We arm the family with the home's own FTC-mandated price list and give staff the compliant hand-off they currently improvise |

**The Grace autopsy (the one competitors' ghost that governs our design).** Grace
(d. 2019) used hospices and hospitals as lead-gen for cremation sales — including a
hospital EHR "death feed" that texted the company when a patient was marked
"Expired"; its founder noted hospice enrollment "typically meant a conversion within
24 days." It is *exactly* what hospices now fear from funeral-adjacent vendors, and
it is why the channel-survival rules (§11.1) are written into product architecture
rather than policy documents: no provider payments, no lead selling, family-initiated
activation only, post-admission delivery only. Neutrality is the entry ticket; the
scar tissue keeps competitors without our structure out of the room.

**One line:** *the only player paid by no one with a stake in the funeral price.*

### 4.8 Claims we refuse to make (diligence honesty)

The research explicitly tested the category's folk statistics; these are the ones this
company will not use, in this plan or any deck:

- ~~"57% of Americans can't afford a funeral"~~ → the honest range is **42.6%
  (couldn't cover without borrowing, Debt.com 2025) to 58% (would need to borrow,
  CardRates 2025)**.
- ~~"Pre-planning saves 20–40%"~~ → traces to pre-need marketing; unverifiable. Use
  the verified **100–200%+ dispersion** and CFA's "comparison shopping can cut costs
  up to 50%."
- ~~"We'll fix your hospice bereavement scores"~~ → emotional support is CAHPS's
  **highest** measure (91% top-box). We never pitch score repair.
- ~~"The FTC is about to force prices online"~~ → rulemaking is stalled; we don't
  sell regulatory inevitability.
- ~~"Consumers will comparison-shop if given a tool"~~ → single-home shopping is
  **rising** (54.7%). The product does the comparing; the pitch never assumes
  behavior change.
- Known evidence gaps we carry openly: no national data on the % of hospice families
  who pre-arrange; no RCT tying funeral pre-arrangement to grief outcomes (nearest
  analog: the Detering advance-care-planning RCT, family stress median 5 vs 15);
  category B2B price points are undisclosed, so all sizing is labeled illustrative.
## 5. The product — as actually built

> This section is grounded in a route-by-route inventory of `main` at commit
> `353607f` (2026-07-17): **116 pages, 49 API routes, 24 database migrations across
> ~19 tables, 4 cron jobs, 54 test files, an eval harness, and 12 AI call sites** —
> built solo in twelve weeks. Appendix A carries the full route list; this section
> is the guided tour an insider or diligence team needs.

### 5.1 L1 — the free source of truth (~75 public pages)

**The cost cluster** (the SEO/citation spine): `/` (the "is this price fair?" entry),
`/average-funeral-cost`, `/funeral-costs` + **87 metro pages** (`/funeral-costs/[city]`),
`/funeral-homes/[zip]` fair-pricing by ZIP, `/fair-price-index`, `/prices`,
`/methodology` (how a verdict is computed — the guardrail-#4 artifact), and
`/funeral-home-tactics` (how the industry makes money).

**Reference layers:** `/glossary` (**63 terms**), `/faith` (**12 traditions + 6
denomination sub-profiles**, adversarially verified against authoritative sources,
disclaimered pending clergy sign-off), `/estate/[state]` (**50-state** probate +
Medicaid-estate-recovery data), `/guidance/[scenario]` situational guides.

**~40 practical guides** across nine categories — first-72-hours, how-to-pay,
veterans, survivor benefits, body donation, home funerals, out-of-state death,
Medicaid estate recovery, digital legacy, etiquette, talking to kids — plus a
grief-content cluster written for the searches families actually make (sudden loss,
overdose loss, suicide loss, child loss, pet loss, disenfranchised grief).

**The trust spine:** `/our-role`, `/corrections` (public mistakes page — the GiveWell
move), `/rights` (FTC Funeral Rule in plain language), `/about`, `/faq`,
`/how-it-works`, full legal set. Every page states the model: no funeral-home money,
free to families.

### 5.2 L2 — the instrumented family service

- **The analyzer** (`/analyzer`) — the wedge. Paste or photograph a GPL/quote →
  AI extraction (vision OCR for photos) → line-item fair-range verdicts against the
  benchmark engine → overcharge dollars, FTC-issue flags (deliberately
  under-claiming: "suspicious" when unprovable), coverage signal, printable
  advocacy summary, pushback-letter drafter, per-line "explain this" grounding.
  Consent checkbox (unchecked by default) controls whether the de-identified prices
  contribute to the public dataset.
- **`/compare-quotes`** — side-by-side multi-quote comparison, same consent
  architecture (shipped Jul 17, PR #166).
- **The negotiate flow** (`/negotiate/start` → preview → status → results → compare →
  closed) — invokes the family's FTC right to itemized quotes from **vetted-only**
  homes (fan-out 3/5/9/14 homes by radius, default 9), returns neutral side-by-side
  options, never ranks beyond disclosed neutral criteria. Inbound funeral-home
  replies are AI-parsed into structured quotes for the family. **Every send rides one
  choke point** (`sendOutreachForNegotiation`) behind the `OUTREACH_LIVE` kill switch
  — off today; the flow records `dry_run` rows.
- **Outcome instrumentation** — on close, the case records listed vs quoted vs
  negotiated vs paid, chosen-home, hidden-fee incidents, satisfaction, benefit
  dollars recovered: the moat's raw material (§6).
- **The supporting family suite:** decision engine (`/decide`), final-bill drift
  checker (`/bill-check`), cash-advance-markup checker, death-certificate
  calculator, subscription-finder (AI, on the cheap classifier model), document
  vault, next-30-days plan, household sharing, obituary/eulogy drafters with
  deterministic fallbacks, bereavement check-in cadence (email + optional SMS, both
  kill-switched).

### 5.3 L3 — the institutional product (what hospices buy)

- **Public funnel:** `/partners` (demo-first, data-backed), `/partners/apply`,
  `/employers` (employer variant), `/for-funeral-homes` + opt-out (the supply side
  gets transparency and an exit, never a bill).
- **The portal** (`/portal`, magic-link sign-in via `partner_members` seats):
  overview report, **referral-link + QR generator**, **coordinator quote-check**
  (the analyzer under the partner's brand — day-one value before any family
  activates), materials library, team-seat management, settings (brand accent,
  notification email, token rotation). A tokenized twin (`/partner/r/[token]` +
  `/links` + `/check`) gives no-login access for the pilot stage, plus
  `/partner/sample-hospice` as the pre-pilot illustrative demo.
- **The proof report** — aggregate-only cohort stats (families started, overcharge
  caught, FTC-issue counts, satisfaction, resolution days), n-gated with
  small-sample suppression, noindex, calm empty states pre-data. An AI plain-English
  digest renders on the report (grounded in the computed stats, deterministic
  fallback) and a monthly aggregate digest email rides a kill-switched cron.
- **The admin cockpit (9 tools):** vetting, partner pipeline (+ days-waiting +
  summary strip), outcomes review, inbound messages, outreach preview, GPL ingest,
  benchmark promotion, AI cost ledger, faith-content QA. All behind session +
  `ADMIN_EMAILS` allowlist.

### 5.4 The AI layer (governed, costed, eval-gated)

- **Model law** (in `lib/claude.ts`): workhorse `claude-sonnet-5`, classifier
  `claude-haiku-4-5` — swapped 2026-07-16 **behind an eval harness** (14 golden GPL
  fixtures; the swap shipped only at 100% on all its gate metrics; committed
  baseline in `test/evals/BASELINE.md`). Model/prompt changes now legally require
  before/after eval evidence in the PR.
- **Every call is cost-tagged** to an `api_cost_events` ledger and priced per
  model-per-day in `/admin/ai-costs` (12 tagged features). `callClaude` throws on
  max-token truncation rather than shipping a silently clipped answer; user-facing
  features carry deterministic fallbacks (obituary/eulogy degrade gracefully;
  analyzer refuses rather than guesses).
- **Grounding discipline:** benchmark matching is deterministic code — the model
  never invents a fair price; prompts carry instructions, not the pricing tables.
  Outreach email to funeral homes is a **deterministic template — zero AI** by
  design (the "most important single artifact" flagged for counsel review).
- **Safety posture:** PII redaction before model and storage, crisis-language
  escalation path (988), hard-coded state legal rules override generation, rate
  limits + body-size guards on every public AI endpoint.

### 5.5 Governance built into the product (not the wiki)

| Control | Mechanism |
|---|---|
| No live email to homes without founder go | `OUTREACH_LIVE` env switch; single send path; `dry_run` ledger rows otherwise |
| Only vetted homes contactable | `directory.ts` requires `active AND vetted AND email`; returns empty (never fake homes) |
| Family data privacy | RLS owner-scoping (`auth.uid()`) on every family table; partner/benchmark tables service-role-only; aggregate-only partner surfaces |
| Data honesty | Three-tier badges (§6.1); n≥5 publication gates; founder-clicked promotions; consent-gated contributions (unchecked by default) |
| Per-cron kill switches | `OUTREACH_NOTIFICATIONS_ENABLED`, `NURTURE_ENABLED`, `ANNIVERSARY_EMAILS_ENABLED`, `BEREAVEMENT_SMS_ENABLED`, `PARTNER_DIGEST_ENABLED`, `BILLING_LIVE` (upcoming) |
| Boot-time enforcement | `lib/env.ts` hard-fails deploys that turn on outreach without the required secrets + admin allowlist |
| CI guardrail greps (expanding in Phase 2) | steering words, employer word-bans, brand-grep, payment-UI-in-family-flow = 0 |

### 5.6 Built-but-dark (the honest inventory)

Everything below exists in code and is deliberately dormant — the distance between
"built" and "live" is founder switches and data, not engineering:

1. **Institutional billing: does not exist yet.** `lib/stripe.ts` is 25 lines of
   scaffolding; zero Stripe API calls anywhere; the $49-era consumer code is fully
   removed (dead columns + one orphaned page remain). Ships in the sprint (Migration
   B + Checkout behind `BILLING_LIVE`, Jul 23).
2. **Verified/community benchmark tiers ship empty.** The machinery is real
   (`regional_benchmarks`, promotion pipeline, badge honesty); rows exist only when
   the founder promotes an n≥5 group. Until then every ZIP honestly reports the
   modeled tier (30 line items × 914 ZIP3 regional cost indices).
3. **All outbound automation is off** (the four crons + live outreach, per §5.5).
4. **The hospice reference layer** (CMS dataset, 6,852 facilities) is merged;
   its migration + import run on the founder's Monday runbook. `/hospices/[state]`
   public pages are sprint work this week.
5. **AI negotiation follow-ups** are written but unwired pending `/admin/outcomes`
   review flow (drafts-only by design).
6. Insurer partner-type exists in code paths but has no surface — it exists so the
   *exclusion* can be enforced in types, not so it can be sold to.

### 5.7 Deliberately not built (parked, with unpark conditions)

Grief/crisis concierge (needs a dedicated clinical safety review — highest-risk item
in the roadmap) · BAA staff-assisted enrollment variant (unparks only if counsel
clears a BAA) · home-level public reputation claims (unparks at n>5 + p<0.05 per
home) · pre-need payments of any kind (never — the NPS $450M fraud is the cautionary
tale; guardrail #5) · insurer anything (never) · family charges (never) · Spanish
i18n (drafts exist; gate is human review capacity, not build).

---

## 6. The data moat

The dataset is the acquirable asset. The strategy: **the price layer gets us cited;
the outcomes layer makes us uncopyable.** Public prices are request-public by law —
anyone can eventually scrape a price list. What exists nowhere else is the closed
loop: *listed price → quoted price → negotiated price → what the family actually
paid → how it felt* — captured case by case, consented, timestamped, metro-coded.

### 6.1 The three-tier honesty architecture (already in code)

| Tier | Source | Gate | Badge behavior |
|---|---|---|---|
| **Verified** | Founder-ingested GPLs (`/admin/ingest-gpl`: paste → AI extraction → founder eyeball → save with `gpl_url` + capture date), mystery-shopped lists | Founder-clicked promotion at **n≥5 distinct homes** per metro×item | Shows n and sources |
| **Community** | Consented analyzer/compare-quotes contributions (`contributed=true`, unchecked by default; declined contributions **never** enter aggregation) | Same n≥5 promotion gate | Labeled community, shows n |
| **Modeled** | 30-item national catalog × 914 ZIP3 cost indices | Always available | Says "modeled" — never dressed up as measured |

The badge-honesty rule is load-bearing: a page never claims more certainty than its
tier. This is what lets the same engine serve day-one coverage (every US ZIP) and
build toward measured truth without ever publishing an indefensible number.

### 6.2 The outcomes layer (the moat proper)

Captured per case on `negotiations`/`negotiation_outreach` (RLS owner-scoped):
listed price, quoted price, negotiated price, amount actually paid, chosen home,
hidden-fee incidents, satisfaction score, benefit dollars recovered, resolution
time, and — from the instrumented flow itself — which homes respond, how fast, and
how much they flex. Per-case marginal cost to acquire this record: **under a dollar**
(§9.2). No competitor can buy this dataset; it only accrues to whoever runs the
neutral advocacy loop, and every incumbent is disqualified from running it by their
own payer.

### 6.3 The collection engines (four channels, all built or in motion)

1. **Own advocacy cases** — the gold; every instrumented case yields real quotes +
   the outcomes record.
2. **Founder GPL ingestion** — the 90-second admin flow; weekend collection
   sessions; CA's SB 658 (homes' own published GPLs) makes California the first
   at-scale collection state after Utah.
3. **Consented crowdsourcing** — every analyzer/compare-quotes run offers (never
   requires) contribution; the consent fallback rule ensures declined analyses can
   never leak into aggregates.
4. **Public postings** — the raw→clean→promote national pipeline (Phase 3) with
   per-state email-coverage tracking; target corpus **~19,000 US funeral homes**
   (193 Utah homes seeded today; transparency scoring planned: homes that respond
   fast with honest itemized GPLs rank higher — a flywheel homes themselves feed).

Plus the **hospice reference layer** (6,852 CMS facilities) — not price data, but
the demand-side graph: it powers the partner funnel, the `/hospices/[state]`
programmatic pages, and eventually per-hospice bereavement-program context.

### 6.4 The Fair-Price Index (the citation engine)

A named, versioned, quarterly benchmark — "the Case-Shiller of funeral pricing":
median + IQR per metro × item (medians, never means — the data is right-skewed),
18-month freshness window, frozen taxonomy per version. **Publication gate, in
writing:** n>5 distinct records, reported IQR, non-overlapping bootstrap 95% CIs for
any comparative claim, ≥4 distinct operators so no single home is identifiable —
else the page renders "Not enough verified data yet." The headline metric only the
outcomes layer can produce: `listed_median − paid_median` — *"families in [metro]
overpay by $X."* Each quarterly release is a press event, a backlink engine, and an
AI-citation seed; the dataset ships as public CSV/JSON with "cite this" and Dataset
JSON-LD (Phase 3). First release: SLC-verified, targeted Q4 2026 under the Open
Farewell name.

### 6.5 Why it compounds and why incumbents can't copy it

- **Structural disqualification:** a home-paid site publishing predatory-pricing
  intelligence torches its own customers; an insurer-paid concierge that starts
  driving bills down torches its payer. Copying us requires firing their revenue.
- **Each layer feeds the next:** reach (L1) attracts analyzer runs → consented
  contributions thicken the community tier → density unlocks Index cells → citations
  compound reach; advocacy cases (L2) yield outcomes → outcomes power the proof
  reports (L3) → proof reports close hospices → hospices route more families into
  L2. One flywheel, three revenue-relevant surfaces.
- **Time is the ingredient money can't buy.** The outcomes corpus is longitudinal;
  an acquirer in 2028 cannot backfill 2026–27 cases at any price. That asymmetry —
  cheap for us to accrue daily, impossible to purchase retroactively — is the
  premium in "premium acquisition."
# Part III — Business Model

## 7. Pricing & packaging — the full analysis

> **Status of this section.** Pricing has never been validated by a paying customer —
> it is the single most important open hypothesis in the company. The docs carry three
> partially-reconciled anchors (a $25/$50/$75 per-family test, a census-tiered annual,
> and a ~$5K illustrative ACV); a founder pricing decision is due **Jul 23, 2026** when
> the Stripe price IDs go into the environment. This section reconciles all of it into
> one recommended structure and records the reasoning, so the Jul 23 decision — and
> every future revision — has a written basis. Numbers here are **recommendations and
> labeled hypotheses**, to be revised against the first ten real negotiations.

### 7.1 Who pays, and why exactly them

| Payer | Their money source | Why they rationally pay us | Why the conflict test passes |
|---|---|---|---|
| **Hospices (now)** | Medicare per-diem (~$220/day routine home care); bereavement support is a **required, unreimbursed** condition of participation (42 CFR 418.64, ~13 months per family) | We convert an unfunded mandate into a documented, board-presentable program; we return social-worker hours (~14 min/patient/week measured pain); we give a compliant answer to "who should we call?" (steering-liability relief); a better family experience compounds referral reputation | A hospice has **no stake in the funeral price**. Cheaper or fairer funerals cost it nothing and help its families |
| **Employers (wave 2)** | Benefits budget (EAP/bereavement line) | Bereavement is the benefit gap employees actually hit (~3M deaths/yr each touching ~5 working adults); no incumbent benefit contains a funeral-price advocate | An employer wants its employee to spend **less** and return whole; fully aligned |
| **Insurers** | — | **Never a payer.** Distribution partner or acquirer only. Enforced in code: only `partner_type in ('hospice','employer')` can reach a billing state | An insurer paying us re-creates the Empathy conflict and destroys the moat |
| **Families** | — | **Never.** Free is the product's identity, the hospice's reason to hand it out, and guardrail #2 | — |

### 7.2 Choosing the pricing metric — the decision analysis

Four candidate metrics were considered across the docs. The evaluation criteria:
predictability for the buyer, alignment with adoption, trust/legal optics (nothing may
smell like a per-referral fee), admin overhead at our scale, and sale-friction at the
Executive-Director signature.

| Metric | For | Against | Verdict |
|---|---|---|---|
| **Flat annual, census-tiered** (small/mid/large) | Predictable budget line; below signature thresholds; zero counting disputes; reads as "program subscription," the cleanest possible optics; encourages maximum adoption (marginal family is free to them) | Mispriced for very low-activation partners (we eat that risk in year 1 — acceptable: activation is our own product metric) | **Primary model** |
| **Per-family-served fee** ($25/$50/$75 — the documented A/B/C test) | Pure value alignment; tiny first commitment; good fallback for hospices that won't sign an annual | Punishes the adoption we want; invoice varies monthly (hospice CFOs hate it); counting disputes ("did that family 'use' it?"); at scale it visually resembles a per-case bounty — wrong pattern to teach a channel that was burned by per-referral lead-gen, even though the payer (hospice, not home) makes it legally clean | **Fallback lane only** — offered when the annual stalls, priced so the annual is obviously better at their volume |
| **Per-activation / per-referral-link-use** | Measurable in-product | Closest pattern-match to the referral-fee failure mode; punishes loop #2; creates an incentive argument we never want to have in a compliance review | **Rejected** |
| **PEPM (per-employee-per-month)** | The native metric of the employer channel; benchmarkable against EAP pricing ($1–5 PEPM general; comprehensive $4–8+) | Meaningless for hospices | **Employer channel only** (§7.5) |

**Decision:** census-tiered flat annual subscription as the primary; per-family
micro-fee as the explicit fallback lane; sponsorship/grant-funded tier for
mission-aligned-but-broke nonprofits (−1.3% aggregate margins are real); PEPM for
employers. This matches where `HOSPICE_GTM.md`, `ROADMAP.md`, and the ROI template were
each independently pointing, resolves their drift, and gives the Jul 23 Stripe-price
decision a single structure.

### 7.3 The hospice price list (recommendation for the Jul 23 decision)

Tier boundaries follow `HOSPICE_GTM.md`'s census bands. Prices are set by
triangulating four constraints: (a) the validated per-family anchor band ($25–$75)
applied to a realistic annual family count; (b) below typical ED signature/discretion
thresholds (~$10k) for the tiers we sell first; (c) a defensible share of hospice
revenue (~0.1–0.2%); (d) comparability to the cost of doing it themselves (a fraction
of one bereavement-coordinator FTE, $55–75k loaded).

| Tier | Average daily census (ADC) | ~Deaths/yr (≈ ADC × 4–6) | **Price** | Effective per family served | % of hospice revenue* |
|---|---|---|---|---|---|
| **Pilot** | any | 10–15 families | **$0 for 60 days** | — | — |
| **Small** | < 50 | ~150–300 | **$4,800/yr ($400/mo)** | $16–32 | ~0.15% |
| **Mid** | 50–100 | ~300–550 | **$9,600/yr ($800/mo)** | $17–32 | ~0.16% |
| **Large** | 100+ | 550+ | **$18,000/yr ($1,500/mo)** | ≤ $33 | ~0.1–0.15% |
| **System / multi-site (2–20 sites)** | — | — | **custom, anchor $30k+/yr** (per-site mid-tier minus 15–25% volume) | — | — |
| **Nonprofit sponsorship** | any | — | Small/Mid price, invoiced to a **foundation/donor sponsor** the hospice nominates; explored case-by-case, never promised in collateral | — | — |

*Revenue basis: ADC × $220/day × 365. A 75-ADC hospice ≈ $6.0M/yr; $9,600 ≈ 0.16%.

**Why these exact numbers and not the June teaser's $5K flat:** a single $5K ACV
under-charges large hospices badly (a 120-ADC hospice at $5K is paying $8/family) and
gives no upgrade path. The tiering keeps the small-hospice first yes *under* $5K
(monthly $400 reads even smaller) while making the blended ACV across a realistic mix
(~40% small / 40% mid / 20% large+) land near **$9–10K** — which halves the logos
needed for any ARR target versus the old $5K math (§10).

**Fallback lane pricing (if the annual stalls at results-review):** $60 per family
served, invoiced quarterly, 12-family minimum/quarter (= $2,880/yr floor). Set
deliberately *above* the annual's effective per-family rate at every tier so the
annual is the rational choice at their own volume, and the fallback converts upward.

**Monthly vs annual mechanics for the Jul 23 price IDs:** create monthly recurring
prices (`$400 / $800 / $1,500`) as the default Checkout objects — the smallest
possible "yes" at pilot conversion, and the M2 milestone ("the webhook fires") doesn't
wait on an annual-invoice cycle. Offer annual prepay at **−10%** ($4,320 / $8,640 /
$16,200) via invoice for hospices whose procurement prefers a PO. Auto-renew, 60-day
out-clause in year 1 (removes signature fear; renewal risk is ours to earn down).

### 7.4 Pilot structure and the conversion mechanic

Per `docs/sales/PILOT_AGREEMENT.md` (exists, counsel-review pending), unchanged by
this plan: **free, 60 days, ~10–15 families, family self-enrollment only** (hospice
hands a card/QR/claim code; no PHI ever transmitted → no BAA by construction),
founder runs every case, success criteria agreed in writing up front (families
served, satisfaction ≥4.0/5, documented savings target, staff-hours returned,
time-to-resolution), de-identified aggregate reporting only, perpetual
de-identified-aggregate data-use grant.

**Conversion is designed into the calendar, not asked for at the end:**

1. **Week 2 of pilot:** first cockpit-metrics conversation ("here's what your families
   did in week one") — the habit of reading our numbers starts here.
2. **Week 6:** mid-pilot review against the written success criteria; surface the
   price list for the first time ("what continuing looks like"), tier pre-selected by
   their census.
3. **Week 9 (pilot end + results review):** the one-page proof sheet + ROI menu.
   The ask is the monthly tier via Stripe Checkout in the portal — the smallest
   possible yes. The fallback lane exists but is presented second.
4. **"About to pay" definition (for the 90-day scoreboard's honesty):** a signed
   order form or an ED's written email commitment with a start date. Anything softer
   is not counted.

### 7.5 Employer pricing (wave 2 — priced now so the channel opens without a scramble)

- **Metric:** PEPM, the channel's native language. **Anchor $3.50 PEPM** (from the
  teaser's benchmark work: general EAP $1–5, comprehensive platforms $4–8+; we are a
  high-salience, low-utilization component priced like a meaningful add-on, not a
  full EAP).
- **Recommended card:** **$3.50 PEPM** list, **$3.00** at 1,000+ employees, **$2.50**
  at 5,000+, floor **$6,000/yr** minimum. A 1,000-employee company ≈ **$36–42k ACV**
  — one employer ≈ four mid-tier hospices, which is the whole argument for wave 2.
- **Packaging:** "bereavement navigation benefit" — the neutral funeral-price
  advocate + after-death navigation for any employee loss (self-serve activation,
  same product), employer dashboard with de-identified utilization + documented
  savings, launch kit for HR. No PHI, no claims integration, no insurer involvement.
- **Channel:** direct to 500–5,000-employee HR/benefits leaders first (founder-led,
  same discovery discipline); benefits brokers/consultants second (they expect
  10–15% of year-1 — acceptable as a distribution cost, **not** a conflict: brokers
  have no funeral-price stake).
- **Pilot:** 90 days, one division or up to 1,000 employees, $0, same
  written-success-criteria pattern.

### 7.6 Billing mechanics (specced for sprint Day 6 — Jul 23; not yet built)

Honest state at HEAD: **no billing surface exists anywhere in the product.**
`lib/stripe.ts` is 25 lines of scaffolding (a lazy client + a currency formatter);
the consumer-fee code is fully removed and only dead columns remain. What ships
Jul 23 per the sprint spec:

- **Rails:** Stripe, institutional only. Checkout + customer portal behind
  `BILLING_LIVE` (default off → portal shows "invoicing by arrangement" copy).
  Price IDs live in env (`STRIPE_PRICE_*`), created by the founder in the Stripe
  dashboard — **code never hardcodes amounts**. Migration B adds
  `stripe_customer_id`, `billing_status`, `billing_plan` to `partners`.
- **Who can bill:** `partner_type in ('hospice','employer')` — enforced in code;
  there is structurally no way to invoice an insurer or a funeral home.
- **Invoice language:** "bereavement support program — [tier]" (procurement-safe
  framing; matches the AKS analysis in §11.6). W-9, COI, and the security packet
  (§11.10) ship with the first invoice unprompted.
- **Terms:** monthly card/ACH via Checkout (default) or annual invoice net-30 with
  PO. No usage true-ups in year 1 (tier moves at renewal if census changed). Late
  handling: dunning via Stripe; service never cut off mid-family-case (families are
  not leverage — ever).
- **Revenue recognition:** monthly ratable; trivial at this scale but written down
  now so the first bookkeeper doesn't invent it.

### 7.7 Discount & concession policy (written now so the founder can't be negotiated live)

Allowed: annual-prepay −10%; multi-site 15–25%; sponsorship tier (§7.3) where a
named third-party sponsor pays; pilot-cohort founding-partner rate (first 5 logos:
year-1 −20%, badged "founding partner," in exchange for a reference call + logo
rights + a case study). Not allowed: free-forever; per-referral anything; family
charges; success-fee-on-savings (it would make our advice look bought); insurer
subsidy of a hospice's subscription.

### 7.8 Price evolution

Prices rise with proof, on renewal anniversaries only, capped +20%/yr, founding
partners grandfathered 24 months. The triggers that justify a raise: renewal rate
>80% at current price; documented median savings ≥3× the per-family effective price;
Index citations giving the brand pricing power. The per-family fallback lane sunsets
once 20+ logos are on annual tiers (it exists to convert the hesitant, not to be the
business).

### 7.9 What we never charge (the pricing page's spine)

Families: nothing, ever, for anything. Funeral homes: nothing — no placement, no
leads, no "featured" listings, no data sales. Insurers: nothing — no license, no
concierge contract, no data feed. Media, researchers, and the public: the Index and the public
dataset stay free and citable (that's the citation engine; monetizing it would
shrink the moat it builds). These aren't concessions; they are what the paid
product's buyer is buying — a partner whose neutrality survives diligence.
## 8. Go-to-market — the founder-led sales machine

The company's survival hinges on landing paying institutions, and the founder is the
only seller until ~25 logos (§12). This section is the full documented motion — ICP,
pipeline, scripts, pilot, loops — with the channel-survival rules embedded as
constraints, not footnotes.

### 8.1 ICP and segmentation

**Beachhead (now):** independent and regional **Utah** hospices — **20–150 average
daily census**, nonprofit and small for-profit, with a named Bereavement/Grief
Coordinator. Drivable, fast-deciding, below enterprise-procurement weight.
**Explicitly deprioritized:** national chains (VITAS, Amedisys, Gentiva — procurement
too slow for pilot #1; they become targets in 2027 *off published pilot metrics*) and
hospital-system hospices with large in-house grief departments.

**Decision-maker map:** the **Bereavement/Grief Coordinator** is the champion (owns
the 42 CFR 418.64 burden day to day); the **Executive Director/Administrator** is the
economic buyer and signer; **social workers, chaplains, volunteer coordinators** are
the warm entry. List sources: Medicare Care Compare (their CAHPS
emotional/spiritual-support sub-score is the personalization data — *their* number,
used respectfully, never as a "we'll fix your score" pitch), CMS POS file, NHPCO,
Utah DOPL licensing records (to name the human), the state hospice association, and
LinkedIn. Never sourced from funeral-home or insurer datasets.

**Segmentation of the ~6,700-hospice universe (for 2027 planning):** ~82% for-profit
by count (margin 13.7% — can pay, wants ROI framing) vs nonprofit (−1.3% — mission
pull, needs the sponsorship tier); long-tail independents (the motion above) vs
regional 2–20-site operators (the 2027 ACV lever: one relationship, many sites) vs
national chains (2027+, $1M+ contract class).

### 8.2 The pitch (memorized, research-verified)

> "You're required to provide thirteen months of bereavement support and you get paid
> nothing extra to do it. Your social workers get about fourteen minutes a week per
> patient, and the moment a family asks 'which funeral home should we call?' your
> staff legally can't answer it. We give every one of your families a neutral guide
> through funeral pricing and the after-death maze — free to them, because we take no
> money from funeral homes or insurers — and we hand you the report that proves your
> bereavement program delivered. You hand them one link; we never contact anyone
> first."

Beat order (research-locked): **(1) unfunded-mandate coverage → (2) staff time
returned → (3) steering-liability relief ("a compliant answer to the question you
can't answer") → (4) family financial protection as referral-source
differentiation → (5) free-to-family + conflict-free (the trust close).**
**Banned pitches:** CAHPS/bereavement-score repair (91% top-box — insulting and
wrong); "families will comparison shop" (they won't; the product does it);
cheapness (positioning is *informed choice* — some families rationally choose the
$12,000 service; now they do it knowingly — nothing may imply the hospice steers
families to cheap providers).

**Objection map (from the battlecard, the two that matter most):**

- *"We got burned by vendors like this"* (the Grace objection): "Grace sold
  cremations and used hospices as lead-gen. We sell **you** a bereavement-support
  program and take nothing from anyone on the supply side — no referral fees, no
  lead sales, and the family initiates every contact. Our architecture makes the
  Grace failure impossible, and we'll show your compliance officer exactly how."
- *"Is this steering / a kickback problem for us?"*: "It can't be — we present all
  vetted options with disclosed neutral ordering, the family chooses, and no money
  moves on any choice. Your contract with us is bereavement-support procurement,
  delivered only after admission — which is precisely the structure the OIG
  guidance blesses. Here's the one-page compliance summary for your counsel."
  (Discovery pre-loads this by asking how they handle "who should we call?" today.)

### 8.3 The 8-stage pipeline with operating cadence

| Stage | Definition of done | Weekly operating target |
|---|---|---|
| 1. List | 20–30 named hospices w/ named humans in the CRM | — (built once, maintained) |
| 2. Warm entry / outreach | First-touch sent (3-touch: email day 0 → call+voicemail day 2–3 → email day 5–6 → LinkedIn day 7) | **10 first-touches/wk** |
| 3. Discovery | 30-min call run on the discovery script; pain + budget owner confirmed | **≥2 calls booked/wk; 1–2 run/wk** |
| 4. Pitch/demo | 10-minute live demo (below) delivered to champion + ED | — |
| 5. Pilot proposal | Free 60-day pilot agreement w/ written success criteria | 3–5 leads in Discovery while 1–2 in Pilot |
| 6. Deliver | Founder runs every family case; cockpit metrics accumulate | weekly partner check-in |
| 7. Results review | One-page proof sheet vs the agreed criteria | week 9 of each pilot |
| 8. Close + expand | Paid tier via Checkout; ask for 2 peer intros | — |

**Kill rule:** a lead dies after 4 touches with no call. **Funnel math (documented
expectation):** ~10 discovery calls → ~2–3 pilots → ~1–2 paid; converting better than
1-in-5 conversations to paid = product-market-fit signal. The canonical sequence is
the referral-reputation-led 3-touch (`docs/sales/OUTREACH_SEQUENCE.md`); the older
CAHPS-hook 4-touch variant is retired by this plan (drift resolved — CAHPS data is
personalization, never the hook).

### 8.4 The demo (10 minutes, staged, non-generic)

Runs on a staged fictional GPL ("Canyon Rim Memorial Chapel," SLC — quoted **$18,975
vs ~$10,000 fair, ~$8,970 flagged** across 10 predatory-range line items) so every
demo lands the same gut punch without naming a real home (guardrail #4 even in
private). Beat order: 60-sec frame (referrals + mandate, not features) → fair-price
lookup → **the analyzer verdict** (non-skippable) → coordinator quote-check
(*their* tool, value on day one before any family activates) → co-branded family
hand-off → the advocacy flow → the neutral compare screen (the compliance close) →
outcomes capture → **the proof report** (non-skippable — the thing they buy) →
pilot ask. Live surfaces used: the real product + `/partner/sample-hospice` demo org.

### 8.5 The pilot (the conversion machine)

Per the standing agreement (§7.4): free 60 days, 10–15 families, self-enrollment
only, founder-run cases, written success criteria, aggregate-only reporting,
perpetual de-identified data-use grant, either-party exit, counsel review before
first signature. Week-2 metrics habit → week-6 mid-review + price-list preview →
week-9 proof sheet + the Checkout ask (§7.4's calendar). The pilot's other output is
**the proof artifact for hospice #2** — every pilot manufactures the next sale's
evidence.

### 8.6 The four organic loops (built this sprint)

1. **Family → their hospice ("nominate"):** a family who found us organically sends
   a prefilled intro to their hospice (their email client, their words — or a
   consented founder intro). Lands as `partner_leads (source: family_nomination)`.
   The platform never auto-emails a hospice.
2. **Hospice → families:** referral links, QR cards, materials — plus the co-brand
   line ("Your hospice provides this free to every family it serves") that makes the
   handout feel like the hospice's own benefit.
3. **Family → family:** tasteful share affordances on analyzer results and guides
   ("Send this to someone arranging a funeral") — plain links, **no referral codes,
   no growth-hack mechanics in grief**.
4. **Report → next hospice:** every proof sheet and portal footer carries the
   buyer-path line ("Offered by [Partner] · we partner with hospices and
   employers…"). The proof artifact itself prospects.

All four are instrumented (`nominate_submitted`, `hospice_intro_copied`,
`share_clicked`, `partner_cta_clicked`) so Phase-3 reporting shows which loop
produces leads.

### 8.7 Reach (the air war above the ground game)

The L1 engine (87 metro pages → programmatic expansion from real data, 63-term
glossary, ~40 guides, 50-state estate pages) + generative-engine optimization
(answer-first pages, original statistics, schema, public dataset with "cite this")
+ the quarterly Index as a press event + an owned email list. Analytics are live
(Vercel Analytics + custom funnel events since 2026-07-05). Discipline: never rent
the whole flywheel (guardrail #6) — SEO, AI citations, institutional distribution,
press, and the owned list each carry weight.

### 8.8 The employer motion (wave 2 — opens only after hospice proof)

Sequenced deliberately: the hospice motion proves outcomes and seeds the dataset;
employers scale it (4–8× lower logo count per revenue dollar, §4.6). The product is
employer-complete this quarter (M5); *sales* effort stays ~80/20 hospice/employer
until ≥5 hospices pay. Motion: direct founder-led to 500–5,000-employee HR/benefits
leaders (the same discovery discipline; the pitch is the benefit gap + the neutral
advocate no EAP contains), then benefits brokers/consultants as a channel (10–15%
of year-1 as distribution cost — no conflict; brokers have no funeral-price stake).
First employer pilot target: Q4 2026; first paid employer: Q1 2027.

### 8.9 Channel-survival rules as GTM constraints (the law, restated where sellers live)

| Rule | GTM consequence |
|---|---|
| Family-initiated activation only | We never cold-contact a next of kin, ever (FL §497.164, TX, ME, NE at-need solicitation bans + the Grace scar). Hospice hands the link; family activates. Opt-in follow-ups to activated families are fine |
| Post-admission delivery only | The benefit never appears in hospice pre-admission marketing and is never usable to induce hospice selection (AKS one-purpose test; OIG post-selection guidance). Contracts read as bereavement/psychosocial-support procurement |
| Hospice transmits nothing | Self-serve activation by construction — no census uploads, no referral lists, no PHI → no BAA (decedent PHI is protected 50 years; approach C is designed out) |
| Navigation, never "arranging" | We inform, compare, document; the family makes every arrangement and signs everything (TX Occ. Code 651 / SC unlicensed-practice breadth) |
| No supply-side revenue | Also a license-revocation offense for homes in NY (PHL §3450) / VA — the refusal is bilateral protection |

These constraints are the sales *advantage*: every one of them is a slide in the
compliance-officer conversation that no funeral-adjacent competitor can present.
# Part IV — The Money

## 9. Cost study — unit economics from the code up

> Every AI figure below is derived from the actual call sites in the codebase (models,
> system-prompt sizes, `max_tokens` caps, fan-out counts) priced at the rates coded
> into the cost ledger (`lib/ai-costs.ts`): **sonnet-5 at the intro $2/$10 per Mtok
> (in/out) through 2026-08-31, then $3/$15; haiku-4-5 at $1/$5; cache reads at 10%.**
> Where a number is a planning assumption rather than a measurement, it is labeled.
> The one-sentence conclusion first: **serving a family costs pennies, serving a
> partner costs dollars, and the entire company's fixed base costs less per month
> than one small hospice's subscription — the binding cost is founder time, and later
> payroll.**

### 9.1 Unit definitions

The units that matter, in causal order: an **analyzer run** (one family checks one
quote) → an **instrumented case** (a family runs the full advocacy flow to outcome)
→ a **partner-month** (one hospice live for one month) → the **fixed base** (what
exists whether or not anyone shows up).

### 9.2 Cost per family unit (variable, code-derived)

| Unit | AI calls involved | Cost @ intro pricing | @ sticker (post-Aug-31) |
|---|---|---|---|
| Analyzer run (pasted text) | extract (≈1.4k sys + 0.5–6.8k user in, ≤2k out) + advocacy summary (≤1k out) | **~$0.02–0.05** | ~$0.03–0.07 |
| + photo instead of paste | + vision extraction (≈1.1k sys + image tokens, ≤2.7k out) | +$0.02–0.04 | +$0.03–0.05 |
| Pushback letter | 1 call, ≤1k out | ~$0.01 | ~$0.015 |
| "Explain this line" | 1 call/click, ≤400 out | ~$0.004 | ~$0.006 |
| Quote comparison (bill-check) | 2 analyzer-class calls | ~$0.05 | ~$0.08 |
| Funeral-home reply parsed | 1 call/reply (≤6k-char body, ≤1.3k out) | ~$0.01 | ~$0.017 |
| Eulogy draft | 1 call, ≤3.8k out | ~$0.03 | ~$0.04 |
| Obituary draft | 1 call, ≤1.1k out | ~$0.01 | ~$0.015 |
| Subscription finder | 1 **haiku** call (≤50k-char statement) | ~$0.01–0.02 | same (haiku unchanged) |
| **Full instrumented case** (analyzer w/ photo + letter + 9-home outreach + 4 replies parsed + outcome) | ~7–9 calls | **~$0.10–0.15** | **~$0.15–0.25** |
| Emails per case (~18–20: welcome, 9 deterministic outreach, reply + quote notifications, nurture ×2, anniversary ×5) | Resend transport | **<$0.01** (≈$0.0004/email on the $20/50k plan; $0 on free tier) | same |
| Storage per case | none — analyzer photos are processed in-memory and never persisted | ~$0 | ~$0 |

**Planning number: $1.00 per instrumented case, all-in** — a deliberate 4–7×
buffer over the measured estimate that absorbs retries, longer documents, heavier
photo usage, post-intro pricing, and prompt growth. (The finance doc's older $1–2
figure predates the eval-gated model swap; the code now measures well under it.)
Even at the buffer, **a family we serve completely costs about one dollar** — that
is the entire economic argument for guardrail #2: free-to-family is nearly free to
provide, and each case manufactures an outcomes record worth strictly more than a
dollar to the moat and the sales motion.

Three structural notes an insider should know:

1. **Outreach email to funeral homes is deterministic — zero AI** (a reviewed
   template; the safety choice is also the cheap choice).
2. **Prompt caching is currently a no-op** — every system prompt sits below the
   model's ~2,048-token cacheable minimum, so `cacheSystem` flags cost and save
   nothing today. This is fine (inputs are small) and becomes a lever only if
   prompts grow (§9.6).
3. **The AI partner digest renders per report page-load** (~$0.005/view), not on a
   schedule — partner AI spend scales with their engagement, which is the metric we
   want them generating anyway.

### 9.3 Cost per partner unit (variable)

| Component | Cost |
|---|---|
| Onboarding (approve → invite → first link → materials) | <1 founder-hour (timed target); ~$0 compute |
| Printed materials/QR cards (if we print rather than PDF) | ~$20–50 one-time |
| Portal + report compute | ~$1–3/mo (ISR + serverless at this scale) |
| AI digest renders | ~$0.005 × page-views ≈ $0.25–1/mo |
| Monthly digest email | ~$0.01 |
| Stripe fees on $800/mo mid-tier | ~$23 card (2.9% + 30¢) or ~$5 ACH (0.8% capped) — steer annual invoices to ACH |
| Founder support time (pre-Hire-1) | ~2–4 hrs/mo early; the real cost, and the §12.4 Hire-1 trigger when it saturates |
| **Marginal cost per partner-month** | **~$5–30 cash** → contribution margin ≥96% at the $400 small tier before labor |

### 9.4 The fixed base (what the company costs per month, by posture)

| Line | Today (build mode) | Pilot-ready (Aug–Sep 2026) | Scale posture (2027, pre-payroll) |
|---|---|---|---|
| Vercel | $0 (Hobby) | **$20 Pro** (hourly crons + analytics retention require it when live) | $20–150 (bandwidth growth) |
| Supabase | $0–25 | **$25 Pro** + backups ≥30 days confirmed (PITR add-on ~$100/mo optional, recommended at first paying partner) | $25–200 |
| Resend + Postmark inbound | $0–15 | $35 ($20 + $15) | $35–100 |
| Twilio (SMS, kill-switched) | $0 | $1–10 | $10–50 |
| Domains (openfarewell 8-domain stack + legacy .co renewals, amortized) | ~$12 | ~$12 | ~$12 |
| Google Workspace (1 seat + aliases) | ~$8 | ~$8 | ~$16 (2 seats) |
| Production AI (families + evals + digests) | $10–40 | $30–80 | $100–400 (scales with cases — see §9.8) |
| AI build tooling (Claude Code — the "engineering org") | $100–200 | $100–200 | $200–400 |
| Rate limiting (Upstash, when multi-instance) | $0 | $0–10 | $10 |
| Bookkeeping/registered agent/state fees (amortized) | ~$40 | ~$40 | ~$60 |
| Insurance (E&O + GL + cyber — §11.9; bind at first signed pilot) | $0 | **~$250–450** (~$3–5.5k/yr) | ~$400–600 |
| Counsel (post-setup run-rate; bursts at contracting) | $0 (one-time setup separate) | ~$300–800 amortized | ~$500–1,500 |
| **Total fixed** | **~$170–340/mo** | **~$800–1,700/mo** | **~$1,400–3,900/mo** |

One-time, non-monthly items on the road to revenue (planning estimates — the docs
deliberately carry no counsel figures and ask for fixed-fee scoping): counsel setup
package (TESS knockout, pilot agreement + data-use redline, Utah anti-steering
memo, entity reconciliation) **~$3,000–7,500**; SOC 2 program when triggered
(§11.3) **~$15,000–40,000 first year all-in**; trademark filing ~$350–1,000/class +
counsel time.

**The punchline:** the pilot-ready fixed base (~$1–1.7k/mo) is covered by **two
small-tier or one mid-tier hospice**. The company is default-alive on infrastructure
the day the second logo pays; everything after that funds data collection, counsel,
and eventually payroll.

### 9.5 Fixed vs variable summary (the shape of the P&L)

- **Truly variable (scale with families):** AI inference, email, Stripe fees —
  ~$1/case planning, ~$0.15 measured. At 1,000 instrumented cases/month (a scale far
  beyond the 90-day plan) the AI line is ~$150–1,000/mo. **Variable cost can never
  be what kills this company.**
- **Step-fixed (scale with partners):** support hours → Hire 1; compute pennies.
- **Fixed:** the §9.4 base + payroll when triggered (§12.4). Payroll is the only
  line that ever matters: Hire 1 (~$90–115k loaded) is ~5–10× the entire
  infrastructure base. Every hiring trigger is therefore written against revenue,
  not optimism.
- **Founder time:** unpaid until the scorecard turns green (per the finance doc);
  the true scarce resource. Every ops task has a tool; the hours go to selling.

### 9.6 Cost-reduction levers, ranked by real savings

1. **Eval-gated model tiering (done, keep using):** the Jul 16 re-baseline moved the
   workhorse to sonnet-5 (intro −33% vs sticker) and classification to haiku
   (−67–90% per call) with a 100% eval gate. Phase-3 round 2 sweeps the ledger for
   the next haiku-shaped candidates. This is the standing discipline: **no swap
   without before/after eval evidence.**
2. **Batch API (−50%)** for everything non-interactive: bulk GPL cleaning
   (~$0.02 → ~$0.01/document), Index snapshot computation, eval sweeps, backfills.
3. **Serve pages statically (already the architecture):** ISR/SSG keeps the 75+
   public pages ~free to serve at any traffic level; compute spend stays pinned to
   interactive AI features.
4. **Free tiers until forced:** each §9.4 step-up is attached to a trigger, not a
   date; nothing upgrades "to be safe."
5. **Prompt caching (currently worthless — honestly):** system prompts are below
   the cacheable minimum; the lever activates only if grounding context grows
   (e.g., embedding benchmark tables in prompts — which we deliberately don't do).
   Revisit only when a single prompt exceeds ~2k tokens.
6. **SOC 2 timing:** the security packet + pilot-agreement terms carry procurement
   until a real contract demands the report (§11.3) — the five-figure program
   starts when a buyer's paper requires it, not before.
7. **Founder-time levers (the ones that actually matter):** the ingest tool
   (90-second GPLs), promotion clicks, the pilot cockpit, onboarding-in-a-day —
   every founder workflow gets a tool so the scarce resource stays pointed at
   revenue.

### 9.7 Cost-expansion triggers (pre-authorized, so growth never stalls on a $20 decision)

| Trigger | Step-up | Approx. |
|---|---|---|
| First live pilot | Vercel Pro; Supabase Pro + ≥30-day backups; insurance binds; Postmark paid | +$330–700/mo |
| First paying partner | PITR add-on; counsel MSA work | +$100/mo + burst |
| `OUTREACH_LIVE` flips | Resend paid tier; Upstash rate limiting | +$30/mo |
| Sonnet-5 intro ends (Sep 1) | AI unit costs +50% | still <$1/case |
| ~50k visits/mo | Vercel bandwidth | +$50–150/mo |
| SOC 2 demanded by a buyer | compliance platform + auditor | ~$15–40k/yr (§11.3) |
| Hire 1 trigger (§12.4) | payroll | +$7.5–9.6k/mo |
| National data pipeline at scale | geocoding (~$0.005/record × 19k), batch cleaning | ~$300–800 one-time |

### 9.8 Gross margin and sensitivity

At the recommended price list (§7.3), a mid-tier partner pays $800/mo against
~$5–30 marginal cost: **~96–99% gross margin**, software-shaped. Sensitivity checks
that matter: AI prices doubling changes case cost from ~$0.15 to ~$0.30 — invisible.
Case volume 10×-ing changes the AI line by hundreds of dollars — absorbed by one
logo. Email/SMS at 10× — tens of dollars. **No plausible input-cost shock threatens
the model.** The two real sensitivities are (a) founder-hours per partner (attacked
with tooling; measured by the Hire-1 trigger) and (b) the price point itself —
which is a willingness-to-pay question (§7, §14 R1), not a cost question. The June
plan's honest caveat stands and is worth repeating: the unit *economics* are
excellent; the unit *sale* (low-ACV × high-touch × slow healthcare procurement) is
the hard part, and the whole GTM design (§8) exists to beat it.
## 10. Financial plan

> Everything here is built bottom-up from §7 (prices), §9 (costs), and §13
> (timeline), in three scenarios. The honest header from the June plan still
> applies and is retained deliberately: **no one has paid us a dollar yet.**
> These are labeled hypotheses arranged so that the *shape* and the
> *break-points* are visible — not forecasts to be graded to the dollar.

### 10.1 Assumptions register (plan scenario)

| # | Assumption | Value | Source / status |
|---|---|---|---|
| A1 | First pilot signed | Sep 1, 2026 | §13.3 target; kill-criteria if >Oct 1 |
| A2 | Pilot → paid conversion | ~50–66% (2–3 pilots → 1–2 paid) | documented funnel expectation, unvalidated |
| A3 | Discovery → paid | >1 in 5 = PMF signal | documented gate |
| A4 | Year-1 ACV (founding-partner −20%) | small $3,840 / mid $7,680 / large $14,400; blended **~$6–8k** | §7.3 price list |
| A5 | Steady-state blended ACV (2027) | **~$9–10k** hospice; ~$30k employer avg | §7.3/§7.5, unvalidated |
| A6 | Gross retention 2027 | 85% (the year-2 question — flagged, not known) | hypothesis; §14 R6 |
| A7 | Per-case variable cost | $1.00 planning ($0.10–0.25 measured) | §9.2 |
| A8 | Fixed base | §9.4 by posture | code/vendor-derived |
| A9 | Hire 1 | ~Mar–Apr 2027 at trigger | §12.4 |
| A10 | Founder draw | $0 until raise or sustained $25k+ MRR | finance doc doctrine |
| A11 | Cases per active partner | ~10–20/quarter reaching instrumentation | ~200 deaths/yr avg × activation share; unvalidated |

### 10.2 The next twelve months, monthly (plan scenario)

| Month | Paying logos (exit) | MRR (exit) | Cash costs | Net burn / (gain) | Commentary |
|---|---|---|---|---|---|
| Jul 2026 | 0 | $0 | ~$400 | ($400) | Sprint + rename; counsel setup one-time ~$3–7.5k lands here/Aug |
| Aug | 0 | $0 | ~$1,200 | ($1.2k) | Pilot-ready posture step-up (§9.7); 15 outreaches, 5 discoveries |
| Sep | 0 (2–3 pilots live) | $0 | ~$1,500 | ($1.5k) | Pilot cases run; insurance bound |
| Oct | **1** | ~$0.6k | ~$1,600 | ($1.0k) | **M2: the webhook fires — the 90-day goal** |
| Nov | 2–3 | ~$1.8k | ~$1,700 | +$0.1k | Pilots 2–3 convert off the proof artifact |
| Dec | **5** | ~$3.5k | ~$1,800 | +$1.7k | **EOY: ~$42k ARR run-rate; infra break-even passed** |
| Jan 2027 | 7 | ~$5k | ~$2,000 | +$3k | Post-holiday close of Q4 pipeline; SOC 2 Type I engaged |
| Feb | 9 | ~$6.5k | ~$2,200 | +$4.3k | First multi-site conversation |
| Mar | 11 (+1 employer pilot) | ~$8k | ~$2,400 | +$5.6k | Hire-1 trigger evaluated |
| Apr | 14 | ~$10.5k | ~$10.5k (Hire 1 aboard) | ~$0 | Payroll begins; ~break-even by design |
| May | 17 | ~$13k | ~$11k | +$2k | |
| Jun 2027 | **20 (+1 paid employer)** | ~**$18k** | ~$11.5k | +$6.5k | ~$215k ARR run-rate at the plan's mid-year mark |

Reading: cash burn **never exceeds ~$2k in any pre-revenue month**; cumulative
pre-revenue spend (Jul–Oct incl. counsel + insurance one-times) is roughly
**$12–18k** — inside the founder's committed capital several times over. The
company's worst-case financial outcome in 2026 is measured in a used-car's worth of
dollars, which is precisely what makes the aggressive commercial calendar (§13) a
low-regret bet.

### 10.3 Quarterly to end-2028 (plan scenario)

| Quarter | Hospices | Employers | ARR (exit) | Costs (annualized) | Notes |
|---|---|---|---|---|---|
| Q4 2026 | 5 | 0 (1 pilot) | ~$42k | ~$22k | Scoreboard met; Index #1 |
| Q1 2027 | 11 | 1 pilot | ~$95k | ~$30k | Type I attested |
| Q2 2027 | 20 | 1 | ~$215k | ~$140k (Hire 1) | Renewal data starts |
| Q3 2027 | 30 | 3 | ~$390k | ~$160k | Hire 2 evaluated |
| Q4 2027 | 42 | 7 | ~**$690k** | ~$300k (Hire 2) | Type II; chain conversation |
| 2028 exit | ~100–140 + 2–3 systems | ~20–30 | **~$1.8–2.6M** | ~$0.9–1.3M (6–8 people) | Employer channel carrying growth |

### 10.4 Three scenarios (what we underwrite vs what we build toward)

| | **Lean** (hospice slower than hoped) | **Plan** (above) | **Upside** (employer + multi-site early) |
|---|---|---|---|
| First paid | Dec 2026 | Oct 2026 | Sep 2026 |
| EOY 2026 | 2 logos / ~$14k ARR | 5 / ~$42k | 8 incl. 1 multi-site / ~$75k |
| EOY 2027 | 18 logos / ~$170k ARR | 49 / ~$690k | 60 + 15 employers / ~$1.3M |
| Hires by EOY 2027 | 0–1 | 2 | 3 |
| Cash posture | Default-alive throughout (fixed base is trivial); kill-criteria conversations happen on schedule | Default-alive from Nov 2026 | Raise becomes optional-but-attractive mid-2027 |
| What it proves | Channel is harder than modeled → pricing/lane pivot per §13.9, employer channel pulled forward | The model | The employer math (§4.6) is as good as the arithmetic says |

**We underwrite the lean case** — the company survives it comfortably — **and
operate the plan case.** The upside case is not in any budget; it simply falls out
if A2/A5 beat expectations.

### 10.5 Break-even ladder

| Threshold | Monthly bar | Reached at (plan) |
|---|---|---|
| Infrastructure break-even | ~$1.7k MRR | Nov–Dec 2026 (2–3 small logos) |
| + Hire 1 | ~$11k MRR | ~Apr–May 2027 |
| + Founder at $120k | ~$21k MRR | ~Jun–Jul 2027 |
| + Hire 2 | ~$36k MRR | ~Q4 2027 |

The ladder is the hiring governor in reverse: no rung is climbed until the revenue
bar below it is held for two consecutive months.

### 10.6 Founder capital & compensation

Committed personal capital available: **~$40k** — against a worst-case 2026 cash
need of <$20k, this is 2× coverage before a dollar of revenue. Founder salary is $0
until either (a) a raise closes, or (b) MRR sustains ≥$25k, at which point a modest
draw begins (target $120k full rate only post-raise or at clear profitability).
This ordering is doctrine from the finance doc: the raise's first use of funds is
founder full-time, not growth spend.

### 10.7 Financing strategy — bootstrap by default, raise on proof

- **Default: don't raise.** The plan case reaches profitability with hires on
  revenue alone. Runway is "years, not months" by construction.
- **Raise trigger (mechanical, from the scorecard):** 1–2 paid recurring contracts
  **plus** renewal/expansion signal **plus** free-tool traction climbing. When those
  are green (earliest realistic: Dec 2026–Q1 2027), a **prove-it-first round of
  $250–500k** (angels/mission funds — the FreeWill/Bain-Double-Impact profile;
  healthcare-adjacent angels who understand the hospice lever) buys: founder
  full-time, the hospice-insider advisor→hire, SOC 2, the data engine at 2× cadence,
  and Hire 1 pulled forward two quarters. Target investors are named in kind, not
  logo-hunted; anyone pushing funeral-home or insurer monetization is disqualified
  by definition.
- **Seed ($1–2M) only if the employer channel proves** (2–3 paid employers with
  utilization data) — that's the venture-scale curve and the only story that needs
  venture money. The $200k marketing-offensive plan that exists in the marketing
  docs is **conditional on this raise** and is otherwise inert; base-case marketing
  spend is ~$0 (the loops + Index are founder+AI work).
- **Entity note for any round:** Delaware C-corp is the documented intent; counsel
  reconciles the LLC-vs-C-corp drift (§11.5) at setup — before, not during, a raise.

### 10.8 The valuation frame (and the logos math that drives it)

The company is built to be read as a **recurring-data business (6–9× revenue
comps)**, not a content site (1–3×): recurring institutional contracts, a
proprietary outcomes dataset, a neutral consumer brand, and signed distribution.
Pre-revenue, none of that multiple applies — the honest June-plan framing stands
(pre-revenue value = team + asset, i.e., low) — which is exactly why the plan sells
first and raises second.

The logos math an investor will run (kept honest with both ACV readings):

| Path to $1M ARR | At old flat $5k ACV | At this plan's blended ~$9–10k | At employer ~$21–42k |
|---|---|---|---|
| Logos required | ~200 | **~100–110** | **~25–50** |
| Realistic solo/small-team years | many | ~2–2.5 (per §10.3) | the 2028 curve |

The tiering decision in §7.3 — not heroics — is what halves the logo count, and the
employer channel is what turns a capital-efficient few-$M business into a
venture-scale one. Both are in the same product already; only sequencing separates
them.
# Part V — Execution

## 11. Compliance, security & trust — the program

> This section answers the question a hospice compliance officer, a health-system
> vendor-risk manager, or an acquirer's diligence team will ask: *what law governs
> you, what do you hold, how is it protected, and what paper can you show me?* The
> stance throughout: **compliance is a sales weapon in this channel.** The June 2026
> DOJ takedown (which included a hospice owner buying decedent data from a
> funeral-home employee) guarantees conservative vendor diligence; we win those
> reviews by being the vendor built for them.

### 11.1 The legal architecture already enforced in the product

| Legal risk | Rule we operate under | Where it lives in the product |
|---|---|---|
| Federal Anti-Kickback (AKS/CMP) — inducing *hospice* selection | **Post-admission delivery only**; never in pre-admission marketing; contracts framed as bereavement/psychosocial-support procurement | Pilot agreement terms; partner materials; §8 pitch discipline |
| At-need solicitation bans (FL §497.164; TX; ME; NE) | **Family-initiated activation only** — the platform never cold-contacts a next of kin | Self-serve activation flows; nominate loop sends via the *family's* email; no outbound-to-family surface exists |
| Unlicensed funeral directing (TX Occ. Code ch. 651; SC aiding statutes) | **Navigation and education, never "arranging"** — the family makes every arrangement and signs everything | Product copy audit; no booking, no contracting, no payments to homes anywhere |
| State anti-steering + referral-fee bans (NY PHL §3450; VA anti-cappers) | Present ALL vetted options, neutral disclosed ordering, **no "recommended" home**, no per-referral money in either direction | Compare screens (distance→name ordering, on-screen disclosure); `docs/ANTI_STEERING_EVIDENCE.md`; guardrail #1 |
| HIPAA (decedent PHI protected 50 years) | **The hospice transmits nothing** — self-serve family activation by construction | No census-upload surface exists; partner attribution rides non-clinical codes; §11.2 |
| FTC §5 (our own claims) | n>5 + significance publication gates; methodology + corrections pages; per-state fee accuracy; "suspicious" not "violation" when unprovable | Analyzer verdict logic; Index publication gate; `/methodology`, `/corrections` |
| CAN-SPAM | Physical address + working one-click opt-out on every outreach body; HMAC opt-out links; suppression list; bounce-webhook auto-deactivation | `lib/negotiation/email-body.ts`; suppression machinery; `OUTREACH_LIVE` |
| Defamation (home-level claims) | No home-level public claim below n>5 + p<0.05; `hidden_fees` never surfaces publicly against a named home; red flags only on hard public-record signals | Outcomes-unlock gates (13-week plan M4); AI defamation guardrails |

Two design facts worth stating plainly because diligence teams ask: **outreach email
to funeral homes is a deterministic reviewed template, not AI-generated** (the single
most legally sensitive artifact, flagged for counsel line-review), and **hard-coded
state legal rules override AI generation** — the model never invents law.

### 11.2 HIPAA position paper (the BAA question, settled by architecture)

**Position: we are not a covered entity and, in the default model, not a business
associate — by construction, not by assertion.**

- The activation model is **approach A** of the compliance addendum's decision
  table: the hospice hands the family a link/QR/claim code; the **family enters
  their own information**. The hospice transmits nothing; no PHI flows covered
  entity → us; no BAA is required. (Decedent PHI remains protected for 50 years —
  which is why "the hospice just sends us their census" is designed *out*, not
  merely discouraged.)
- **Data minimization backs the position:** we collect email, deceased name, ZIP,
  scenario — **no diagnoses, no MRNs, no admission or death dates from any
  hospice**, and partner attribution rides a non-clinical code column.
- **The BAA trigger conditions are written down** so drift is impossible: any
  hospice-transmitted family/patient data, any social-worker-assisted enrollment
  acting for the covered entity (approach B — parked), any census/referral-list
  intake (approach C — designed out), or any EHR integration. If a future contract
  requires one of these, the sequence is BAA first (template ready via counsel),
  then a full HIPAA program (risk analysis, policies, training, breach procedures) —
  and the pilot agreement already commits to "BAA signed before any PHI exchange."
- **"HIPAA-ready" posture anyway:** encryption in transit (TLS) and at rest
  (Supabase/AES-256), owner-scoped RLS on every family table, PII masked in logs,
  deletion cascade, access limited to the founder via allowlist. We voluntarily
  operate near the technical-safeguards bar because hospice security reviews ask
  HIPAA-shaped questions regardless of BA status.
- **Counsel confirmation is a launch gate, not an afterthought:** "self-enrollment
  avoids BA status" is the single most load-bearing legal assumption in the model
  and is priority #2 in the counsel engagement (§11.5).

### 11.3 SOC 2 — roadmap, scope, and cost

**Philosophy:** SOC 2 is a *path*, not a pilot blocker (the compliance addendum's
words). Small and mid independents accept the security packet (§11.10) + contract
terms; the audit program starts when a real buyer's paper demands it — expected at
the first health-system-affiliated hospice or first sizable employer.

| Step | When (plan) | Cost (est.) | Notes |
|---|---|---|---|
| Security packet v1 (in lieu of report) | Aug 2026 | founder time | §11.10 |
| Compliance platform (Vanta/Drata/Secureframe class) | Nov 2026 | ~$8–15k/yr | Evidence automation; policies templated |
| Gap remediation | Nov–Dec 2026 | mostly founder time | The §11.11 hardening list is ~80% of it |
| **Type I audit** | Q1 2027 | ~$7–15k | Point-in-time design attestation |
| **Type II observation + audit** | ~6-month window → attested Q4 2027 | ~$10–20k | The report enterprise buyers actually want |
| Pen test (often requested alongside) | with Type II | ~$5–15k | Scope: the partner portal + APIs |

Total first-year program: **~$15–40k** — triggered spend (§9.7), pre-authorized the
day a qualified buyer requires it. Controls we already run that map directly onto
Trust Services Criteria: single-founder access via allowlisted admin gate, RLS
default-deny, kill-switch change control, CI gates + eval evidence on model changes,
cost/usage ledgers, deterministic outreach templates, consent-gated data flows.
Honest gaps are in §11.11 — none is architectural.

### 11.4 What hospices actually require (procurement reality, by buyer size)

| Buyer | What they ask for | Our answer |
|---|---|---|
| Independent hospice (the beachhead) | W-9; certificate of insurance; the compliance one-pager; sometimes a security questionnaire-lite; the pilot agreement itself | Ready now / at pilot-ready posture (Aug) |
| Regional multi-site | Above + formal security questionnaire (SIG-Lite class); privacy policy + data-use terms; sometimes a DPA | Security packet + counsel-reviewed data-use terms |
| Health-system-affiliated | Full vendor-risk review: SOC 2 report (or letter of engagement), pen-test summary, incident-response plan, BAA discussion (we present the no-PHI architecture first) | The §11.3 program; the no-PHI architecture usually *removes* the BAA lane entirely |
| Employer (wave 2) | Security questionnaire, SOC 2 increasingly table-stakes at 1,000+ employees, DPA, accessibility (VPAT sometimes) | Type I timed to the first employer paid conversations |
| Any buyer, informally | *"Are you going to be here next year?"* | The default-alive cost base (§9.4) + founding-partner terms — continuity is a fair worry about a solo vendor; answered with the §12 operating system and the succession note in the risk register |

### 11.5 Counsel engagement (scoped, sequenced, budgeted)

Status: outreach brief written, **queued to send now**; the TESS knockout for the
rename is the immediate commission. Target profile: one firm covering ≥2 of
consumer-protection/FTC, **healthcare regulatory (AKS/HIPAA — highest priority)**,
and death-care/occupational licensing; fixed-fee scoped opinions requested.

Priority order (from the compliance addendum, unchanged):
1. **Utah anti-steering clearance** — the #1 launch gate (no state goes live
   uncleared; geo-gating stays available).
2. **BAA-avoidance confirmation** for self-enrollment (the §11.2 keystone).
3. **Pilot agreement + data-use grant** review (the moat's paper).
4. **Index/claims substantiation** standards (guardrail #4's legal spine).
5. CAN-SPAM posture on institutional outreach; 6. ToS/privacy rewrite for B2B2C.
7. **Entity reconciliation** — docs disagree (LLC in the lawyer brief vs Delaware
   C-corp in the finance/compliance docs); resolve to DE C-corp with d/b/a filings
   as part of setup, before any contract or raise.
8. The **TESS/state/common-law clearance** on "Open Farewell" (gates Rename Day
   Jul 27; fallback name staged).

Budget: the docs deliberately carry no figures; planning estimate **$3–7.5k** for
the setup package (fixed-fee ask), **$500–1,500/mo bursts** during contracting
(§9.4), scaling with deal flow, not calendar.

### 11.6 The AKS/OIG position (one paragraph a compliance officer can file)

Funerals are not federally payable, so the funeral referral itself sits outside
AKS/CMP; the recognized danger vector is a free family benefit used to **induce
hospice selection** (the one-purpose test). OIG guidance treats benefits disclosed
only **after** provider selection as outside the inducement bar. Accordingly: the
benefit is delivered post-admission only, never appears in pre-admission marketing,
and the hospice's payment to us is procurement of bereavement/psychosocial support
(a Condition-of-Participation obligation under 42 CFR 418.64) — not payment for
referrals in either direction. On the supply side, no money moves between us and
any funeral home, which also keeps every home we present clean under NY PHL §3450 /
VA anti-cappers. Counsel memo to this effect is deliverable #1 of the engagement
and ships in the sales packet.

### 11.7 FTC and consumer law

- **The Funeral Rule is our lever, not our risk:** the product invokes the family's
  right to itemized GPLs; checker citations reference specific provisions;
  enforcement's live cadence (sweeps, warning letters) validates the premise.
- **Our exposure is §5 on our own claims** — the FTC has already sued an online
  funeral intermediary (Legacy Cremation) over misrepresentation. Defense-in-depth:
  the n>5 + significance gates, methodology + corrections pages, per-state fee
  accuracy in the analyzer, under-claiming verdict language, and counsel-reviewed
  Index releases. The known-stale industry statistics on our pages are flagged for
  replacement with our own corpus data as it reaches publishable density.
- **CAN-SPAM:** compliant-by-machinery on home outreach (address, one-click HMAC
  opt-out, suppression, bounce auto-deactivation); institutional cold email carries
  the same footer discipline.
- **TCPA (flagged honestly):** no auto-dialer or cold SMS exists; bereavement SMS is
  opt-in and kill-switched. Formal TCPA review rides the counsel ToS pass before
  any SMS expansion.

### 11.8 The privacy program

- **Data classes & residency:** family account/case data in Supabase (US region),
  RLS owner-scoped per `auth.uid()`; partner/benchmark/ledger tables
  service-role-only; marketing signups isolated. Analyzer photos are processed
  in-memory and **never stored**.
- **Consent:** dataset contribution is opt-in (unchecked by default) on every
  surface; declined contributions are structurally excluded from aggregation (the
  consent-fallback rule is load-bearing and tested).
- **Retention & deletion:** self-serve account deletion cascades across all family
  tables immediately; recommended 12-month auto-purge of closed cases is documented
  and slated for automation pre-pilot; backups to be confirmed ≥30 days at the
  Supabase Pro step-up. Soft-delete → 24-month hard-delete policy per the AI
  strategy's PII framework.
- **State privacy (CCPA/CPRA + successors):** we operate the rights (access,
  deletion) product-wide rather than gating by state; the privacy-policy rewrite for
  the B2B2C flow (partner-referred arrival, de-identified aggregate sharing, Index
  reuse) is counsel item #6.
- **De-identification standard:** partner-facing numbers are aggregate-only with
  n≥5 suppression; published data additionally requires ≥4 distinct operators per
  cell (no single-home identifiability).

### 11.9 Insurance stack (bind at first signed pilot)

| Policy | Purpose | Est. annual |
|---|---|---|
| General liability | Contract table-stakes; COI on request | ~$500–800 |
| Professional liability / E&O (media liability rider for published data) | The published-numbers business | ~$1,500–3,000 |
| Cyber liability | Family-data breach response; increasingly a contract requirement | ~$1,500–2,500 |
| **Total** | | **~$3.5–6k/yr** (§9.4's step-up) |

### 11.10 The security & trust packet (the artifact that closes procurement)

One PDF, versioned, sent unprompted with every pilot agreement: architecture
one-pager (no-PHI activation flow diagram); data-classes + retention table; the
RLS/access-control summary; subprocessor list (Vercel, Supabase, Resend, Postmark,
Stripe, Anthropic, Twilio) with roles; kill-switch and incident-response summary
(SEV ladder + family-notification script from the trust-ops runbook); the AKS/
anti-steering memo (§11.6); insurance certificates; the guardrails page. Assembled
from existing docs in Phase 2 — it is the SOC-2-shaped answer we can ship in August.

### 11.11 Honest hardening gaps (tracked to the platform-hardening milestone, M6)

1. CSP is **report-only** — enforce after the rename settles.
2. Rate limiting is in-process per-instance — move to Upstash at `OUTREACH_LIVE`.
3. Admin gate is **permissive if `ADMIN_EMAILS` is unset** (boot validation forces
   it only when outreach goes live) — make it fail-closed unconditionally.
4. Backup/restore drill + PITR on the prod project — scheduled in M6.
5. 12-month case auto-purge — automate pre-pilot.
6. RLS audit refresh across all tables added since June — scheduled in M6.
7. Accessibility: WCAG 2.1 AA is the standing bar for family-facing surfaces
   (grief-state users make this a product requirement, not just a legal one);
   VPAT produced when the first employer asks.

None of these is load-bearing for the pilot posture; all are closed before the
first health-system review.
## 12. Team & hiring — stay lean, founder sells

### 12.1 The operating doctrine

The company stays at **one full-time person — the founder — until recurring revenue
forces the first hire**, and the founder personally owns institutional sales until the
motion is documented, repeatable, and proven on at least ~25 logos. This is not a
budget constraint dressed up as strategy; it is the strategy:

1. **The sale requires the builder.** The first ten hospice conversations are product
   discovery as much as sales. A hired seller cannot change the product Tuesday night
   because of what a bereavement coordinator said Tuesday morning. The founder can, and
   the build record (§3) shows a same-week fix loop is real.
2. **AI is the staff.** The demonstrated leverage — ~166 PRs in 12 weeks solo — comes
   from running the engineering organization as one human directing AI agents under a
   written operating contract (`CLAUDE.md`), with eval gates, CI guardrail greps, and
   kill switches standing in for review hierarchy. The marginal cost of that staff is
   measured in §9 and is a rounding error against a single salary.
3. **Every founder task gets a tool.** The standing rule from the 13-week plan: nothing
   assumes founder engineering during operations. GPL ingestion is a 90-second admin
   flow; promotions are a click; migrations are paste-and-run with a written runbook;
   pilot monitoring is a cockpit page. The founder's scarce hours go to selling and to
   the judgment calls the tools surface.

### 12.2 Who does what today (the one-person org chart)

| Function | How it is staffed today | Cost |
|---|---|---|
| Product & engineering | Founder + AI agents (Claude Code, eval-gated) | AI spend, §9 (~$50–150/mo at current cadence) |
| Data collection | Founder (GPL requests, ingest tool, promotions; weekends) | Founder time |
| Sales & partnerships | Founder (list → outreach → discovery → pilot → close) | Founder time |
| Legal | Outside counsel, engaged per §11 (TESS knockout commissioned; retainer at pilot-contract time) | ~$3–7.5k initial; ~$500–1,500/mo burst during contracting |
| Design, copy, SEO | Founder + AI | — |
| Bookkeeping/admin | Founder (formation + accounting stack ~$500–1,500/yr) | Minimal |
| Content credibility review | **Gap, planned:** named licensed FD / bereavement-professional reviewers (per-review contract, not employment) | ~$100–300 per reviewed piece |

### 12.3 The named gap (and the plan to close it)

The honest weakness: **solo founder, no hospice-industry insider on the team.** B2B
healthcare sales favors sellers who have sat in the buyer's chair, and the death-tech
graveyard is full of outsider-founded companies. The plan, unchanged from the June
plan and now on a clock:

- **Advisor first (target: before the first paid contract, i.e. by Sep 2026).** Recruit
  a former hospice executive director or bereavement director as a light-touch advisor
  (advisory-shares grant in the 0.25–1% range, standard 2-year vest). Their jobs:
  pressure-test the pitch, open 3–5 doors, sanity-check the pilot agreement against how
  hospices actually buy.
- **Contract reviewers second.** Named, credentialed reviewers (licensed funeral
  director, estate attorney, grief clinician) for the YMYL content spine — per-piece
  contract work that also populates the trust pages. (Positioning rule stands: the
  founder's story is builder + consumer advocate; credibility is bought by named
  reviewers and the business model, never by borrowed credentials.)
- **Hire or cofounder only at proof.** If, at 10+ paying hospices, the constraint is
  demonstrably founder-bandwidth-in-the-channel (not product), the advisor-network
  search for a partner-success lead begins (§12.4, Hire 1).

### 12.4 Hiring triggers and sequence (rules, not dates)

Hiring is triggered by **revenue and measured founder-hour saturation, never by
fundraise optimism.** Costs are fully-loaded rough figures (salary × ~1.25 for
payroll/tools/insurance).

| # | Role | Trigger (all must hold) | Cost (loaded) | What they take off the founder |
|---|---|---|---|---|
| 0a | **Counsel (contract)** | Now → first contract | $3–7.5k setup + bursts | TESS, pilot agreement, state map (§11) |
| 0b | **Hospice-insider advisor (equity)** | Before first paid close | 0.25–1% advisory equity | Door-opening, pitch truth-testing |
| 0c | **VA / data contractor (part-time, optional)** | If founder GPL-collection hours cap the data engine (>8 hrs/wk founder time on mechanical collection) | $15–20/hr × ~10 hrs/wk ≈ $700–900/mo | Mechanical GPL requests, data entry into the ingest queue (founder still clicks promote — guardrail #4) |
| 1 | **Partner success / operations** | ≥8–12 paying hospices **and** ARR ≥ $100–150k **and** founder spending >15 hrs/wk on onboarding/support that a documented playbook covers | $70–90k salary → ~$90–115k loaded | Onboarding, QBR prep from the cockpit, coordinator support, pilot logistics |
| 2 | **Founding engineer or data lead** | ARR ≥ $250–300k, or a signed multi-site system whose integration demands outpace the AI-agent workflow | $130–170k + 0.5–1.5% equity → ~$165–215k loaded | Platform hardening, integrations, data pipeline scale; founder keeps product direction |
| 3 | **Second seller** | Only after the founder has personally closed ~25 logos, the playbook is written, win/loss is instrumented, and pipeline demonstrably exceeds founder capacity | $70–90k base + variable (~$120–160k OTE) | Mid-market hospice motion; founder moves up to systems/employers |
| 4 | **Employer-channel lead** | First 2–3 employer logos closed by founder + channel economics validated | ~$120–180k OTE | Benefits-broker relationships, employer pipeline |

**Explicit non-hires:** no marketing hire (the four organic loops + Index PR are
founder+AI work by design); no customer-support hire (support load at hospice counts
under 50 is measured in hours/week and belongs with partner success); no COO/chief of
staff (the operating docs are the chief of staff).

**The org at milestones:**

- **$0 → $150k ARR:** founder + counsel + advisor (+ optional VA). Payroll: $0.
- **~$150k ARR (≈ early 2027):** + partner success. Payroll ≈ $90–115k. Still
  default-alive on revenue if infra + tools stay under §9's fixed-cost envelope.
- **~$300–600k ARR (2027):** + engineer/data lead; possibly seller #2 late in the year.
  Team of 3–4. This is the largest the company gets before either default-alive
  profitability or a deliberate, proof-backed raise (§10.7) — never both assumed.
- **~$2M ARR (2028 shape):** 6–8 people (2 sales, 1–2 partner success, 2 eng/data,
  founder). Anything beyond this is post-acquisition-conversation scale.

### 12.5 What the founder never delegates

Pricing decisions and guardrail exceptions (there are none, but the refusal is the
founder's); the first conversation with any new hospice system or employer; anything
that publishes a number (Index releases, home-level claims — guardrail #4 requires a
human, and that human is the founder until a data lead exists); kill-switch flips
(`OUTREACH_LIVE`, `BILLING_LIVE`, `PARTNER_DIGEST_ENABLED`); acquisition conversations.

---

## 13. Timeline — the aggressive plan of record

Two clocks run at once: the **product clock** (the 13-week plan, day-level near,
milestone-level far) and the **commercial clock** (pipeline, pilots, payment). The
90-day scoreboard defines success: **one hospice paying in-product by October 16,
2026** — a real Stripe subscription on a real partner, on real family cases. Dates
below are commitments to attempt, with kill/adjust criteria attached; they are
aggressive on purpose and honest about what each one assumes.

### 13.1 Now → Rename Day (Jul 17 – Jul 27) — finish Phase 1

| Date | Product | Founder / commercial |
|---|---|---|
| Thu Jul 17 – Fri Jul 18 | Sprint continues: metro pages + fair-price index on `regional_benchmarks` with ISR | **Commission TESS knockout now** (gates Rename Day); begin Utah GPL weekend collection list |
| Sat–Sun Jul 19–20 | — | **Weekend GPL collection** (Utah): first verified-tier raw material; apply **Migration A** Monday morning per the PR #163 runbook |
| Mon Jul 20 – Wed Jul 22 | Dual-audience homepage + nominate-your-hospice + share loops (the four organic loops); **Migration B + Stripe institutional billing behind `BILLING_LIVE`** | **Pricing decision by Jul 23** (price IDs into env — §7 is the input to that decision); draft the 25-hospice target list |
| Thu Jul 23 – Sat Jul 25 | `/hospices/[state]` + claim-your-page; AI digest into partner email; full QA + prod demo | First 5 warm-entry emails queued (family-initiated rules do not constrain B2B outreach; `OUTREACH_LIVE` governs home-contact only) |
| **Sun Jul 27** | **RENAME DAY: Open Farewell everywhere.** Old domain 301s forever; old-domain inbound mail stays live; brand-grep lands in CI | Announce under the new name to the warm list |

**Phase-1 exit gate:** sprint demo clean on prod under the new name; ≥2 verified Utah
metro×item groups live; billing completes in test mode; suite green; old deep links
land on new twins. **Slip rule:** Rename Day slips a week before anything else does
(counsel latency is the only accepted cause).

### 13.2 Pilot-ready + first pipeline (Jul 28 – Aug 8) — Phase 2

- **Product:** post-rename audit (day 1, non-negotiable); the **pilot cockpit**
  (`/admin/pilot/[partnerId]` — activation rate, checker usage, median documented
  savings, satisfaction, coordinator engagement, all n≥5-suppressed);
  onboarding-in-a-day timed to <1 founder-hour; benchmark expansion Wave 1; bulk
  ingest v2 + CA GPL collection; community tier goes real; `directory.ts` scale fix.
- **Commercial (the aggressive part):** 25 named Utah/regional hospices in the CRM by
  Aug 1. 15 outreaches sent by Aug 8. Target: **5 discovery calls booked** by Aug 8.
  Collateral finalized under the new name: one-pager, demo script (staged GPL +
  coordinator-tools beats), pilot agreement (compliance addendum §3-aligned),
  security/trust packet v1 (§11.10).
- **Legal:** counsel retained on the institutional package: pilot agreement redline,
  anti-steering per launch state, AKS framing memo (§11.6).

### 13.3 Reach + moat + discovery grind (Aug 10 – Aug 28) — Phase 3

- **Product:** national directory pipeline (raw→clean→promote, email-coverage
  tracked); first non-Utah state ingested end-to-end; programmatic metro generation
  from data; Fair-Price-Index v2 stat engine (`index_cells`, n≥5-gated) + public
  CSV/JSON dataset + "cite this"; hospice facility pages lift noindex where real;
  grounded-AI wave 2 (document explainer, comparison narrator, model tiering round 2).
- **Commercial:** run **10+ discovery calls** across Aug; convert to **3 pilot
  commitments by Sep 1** (pilot structure per §7.4). The pitch discipline: unfunded
  mandate coverage → staff-hours returned → steering-liability relief → family
  financial protection as referral differentiation. **Never** CAHPS-repair.
- **Data:** first defensible original stat drafted from real data (founder + counsel
  review before anything is press-facing).

### 13.4 Prove and convert (Aug 31 – Oct 16) — Phase 4

- **M1 (target first two weeks of Sep):** pilot live on product rails — real families
  through referral links, cockpit metrics moving, weekly product triage of real
  friction. (The plan deliberately leaves this backlog unspecified; real usage sets it
  and it takes priority over everything else.)
- **M2 — Billing on:** with the pilot's yes, `BILLING_LIVE` flips for that partner,
  real price IDs, invoice copy in bereavement-support framing. **The 90-day goal is
  met the day this webhook fires with a real subscription.** Target: by **Oct 16**,
  stretch Sep 30.
- **M3 — The proof artifact:** quarter-in-review report per partner (ProofSheet v2 +
  AI digest + cockpit metrics) — printable, forwardable, the thing the champion takes
  to their board and we hand to hospice #2. Repeatability test: a second org from
  seed → approve → onboard → first family → first report without founder heroics.
- **M4–M7:** outcomes-density unlocks strictly data-gated (labels → responsiveness
  scoring internal-only → anomaly dashboard; reputation profiles stay parked below
  n>5 + significance); employer channel product-complete; platform hardening week
  (RLS audit, backup/restore drill, incident runbook, load sanity); Spanish i18n only
  if human review capacity materializes.

### 13.5 The scoreboard (what "done" means on Oct 16, 2026)

1. One hospice paying in-product (real Stripe subscription, real partner).
2. Verified tier real in ≥2 states, visible n, sources on every row; community tier
   live from consented contributions.
3. The proof loop closed on product rails: referral → family → outcome → cockpit →
   quarter report → renewal conversation, n≥5 suppression intact end-to-end.
4. Reach compounding: programmatic metros + hospice pages indexed, dataset citable,
   four loops instrumented and producing leads.
5. AI layer governed: 100% of calls cost-tagged, every model/prompt change eval-gated,
   every public endpoint rate-limited, every user-facing sentence grounded-or-silent.
6. Open Farewell everywhere; old domain redirecting; SEO recovered at +2/+6-week checks.
7. Zero guardrail breaches (CI grep suite green; human sign-off at each phase gate).

### 13.6 Q4 2026 (Oct 17 – Dec 31) — repeat what the pilot proved

Planned at Phase-4 exit against reality; the committed shape:

- **Commercial:** hospices #2–#5 signed off the proof artifact; target **5 paying
  partners / ~$40–60k ARR run-rate by Dec 31** (§10 scenarios). First employer
  discovery conversations (product is ready per M5; sales effort stays ~80/20
  hospice/employer).
- **Data:** 4–6 verified metros; first quarterly **Fair-Price Index release under the
  Open Farewell name** as a press/citation event (the first original stat, counsel-
  cleared) — targeted mid-Q4.
- **Compliance:** SOC 2 readiness program starts (platform + policies; §11.3) —
  vendor selected by Nov, Type I audit window booked for Q1 2027.
- **Financing checkpoint (Dec):** with 3–5 paying logos and renewal signal forming,
  decide bootstrap-vs-raise per §10.7's triggers. Default: don't raise.

### 13.7 2027 — the repeatable year (quarterly milestones)

| Quarter | Hospice logos (cum.) | Employers (cum.) | ARR exit-rate | Milestones |
|---|---|---|---|---|
| Q1 | 10–12 | 1 pilot | ~$120–150k | SOC 2 Type I attested; Hire 1 trigger evaluated; second Index release; first multi-site (2–20 location) regional operator signed |
| Q2 | 18–22 | 2–3 | ~$250–320k | Hire 1 aboard; pilot→paid playbook v2; employer pricing validated (§7.5); Type II observation window opens |
| Q3 | 28–35 | 4–6 | ~$420–550k | Hire 2 trigger evaluated; 15+ verified metros; index licensed citations measurable in AI answers; first hospice-chain (VITAS/Gentiva-class) conversation off published pilot metrics |
| Q4 | 40–50 | 6–10 | ~$600–800k | SOC 2 Type II attested; seller #2 evaluated; 2028 plan written against real churn/renewal data (the year-2 question — §14 R6) |

Assumptions under this table are explicit in §10.1 (close rates, ACVs, churn) — the
table is the **plan** scenario; §10.4 carries lean and upside variants.

### 13.8 2028 — the shape, not the schedule

Hospice motion industrialized (100–150 logos reachable at 2 sellers + systems deals);
employer channel carrying growth (~25–50 logos ≈ $1M+ on its own per the PEPM math in
§7.5); the Index as the cited national standard with 3+ years of quarterly releases;
dataset density (outcomes on thousands of cases) that makes the acquisition
conversation (§15) one we can start from strength — or decline.

### 13.9 Kill / pivot criteria (pre-committed, so momentum can't argue later)

- **No pilot signed by Oct 1** after ≥20 genuine discovery conversations → the hospice
  channel is mispriced or mistimed: shift lead channel to employers/EAP brokers within
  30 days (the bible's pre-authorized pivot), keep hospice as pull-only.
- **Pilot runs but won't convert to paid by Dec 31** (families served, savings
  documented, still no signature) → willingness-to-pay hypothesis fails at this price
  structure: drop to per-family micro-fee or grant-funded tier (§7.7) before
  concluding the channel is dead.
- **Median documented family savings < $1,500-equivalent across 10+ instrumented
  cases** (ROADMAP's validation gate) → the value claim is weaker than believed:
  reweight the pitch to time-saved + compliance-proof, and reprice accordingly.
- **Any guardrail breach or regulator contact** → stop, fix, document publicly.
  No milestone outranks the guardrails.
## 14. Risks & hurdles — the full register

Ordered by (likelihood × impact) as judged today. Each row carries the mitigation
already in motion and the early-warning signal that escalates it. The register is
reviewed monthly against the scorecard; the kill/pivot criteria in §13.9 are the
pre-committed responses to the worst of these firing.

| # | Risk | L×I | Mitigation in motion | Early-warning signal |
|---|---|---|---|---|
| R1 | **Willingness-to-pay fails** — hospices love the pilot, won't sign the check (the load-bearing unknown) | H×H | Paid-conversion designed into the pilot calendar (§7.4); price built inside the 13.7% for-profit margin and under signature thresholds; fallback per-family lane + sponsorship tier; kill-criteria drop pricing before declaring the channel dead | Pilots complete with praise but no signature by week 10; "no budget" appearing after results reviews rather than before |
| R2 | **Sales cycle longer than the 90-day clock** — "paying by Oct 16" meets healthcare procurement reality (the docs' own 4–6-month conservative reading) | H×M | Pilot-first entry (free, ED-signable); monthly Checkout as the smallest yes; "about to pay" defined strictly; Phases 2–3 deliberately pilot-independent so product/data compound while sales grinds | <5 discovery calls by Aug 8; <3 pilot commitments by Sep 1 |
| R3 | **Channel scar tissue** — the Grace association tars all funeral-adjacent vendors | M×H | Architecture-as-answer (no provider money, family-initiated, post-admission, no PHI); compliance packet leads the sale; advisor from inside the industry (§12.3) | The Grace objection surviving the compliance one-pager in >2 discoveries |
| R4 | **AKS/steering misstep or regulator contact** — ours or a partner's counsel reads the model differently | L×H | Counsel clearance gates each launch state; OIG-aligned post-admission design; the §11.6 memo in every packet; geo-gating available same-day | Any partner-counsel redline on inducement language; any state-board inquiry |
| R5 | **HIPAA drift** — convenience pulls a future flow toward hospice-transmitted data | M×H | BAA-trigger conditions written (§11.2); approach C designed out; pilot agreement commits "BAA before any PHI"; architecture review on any partner-integration feature | Any partner requesting census upload "to make it easier" — the answer is the flow, not a BAA |
| R6 | **Year-2 renewal unknown** — hospices treat year 1 as a one-time compliance checkbox | M×H | Embedding strategy: the tool in intake workflow + the proof report in their compliance file; QBR cadence off the cockpit; renewal thesis instrumented from case #1 | Portal logins decaying after month 2; reports unopened |
| R7 | **Solo-founder capacity & bus factor** — sales, data, product, ops in one person | H×M | Every founder task gets a tool (§12.1); ruthless three-questions weekly filter; advisor + contractor lanes; documented ops (runbooks, this plan) reduce bus-factor damage; hiring triggers pre-written | Founder-hours >15/wk on any one partner; data cadence slipping two weeks running |
| R8 | **Data cold-start** — verified tier stays thin; the Index can't clear its own n>5 gate | M×M | Founder ingest tool + weekend cadence; CA SB 658 as the second collection state; consented community tier; the honest-badge architecture means thin data degrades gracefully instead of lying | <2 verified metros by Sep; first Index slips past Q4 |
| R9 | **Trust/accuracy incident** — one wrong published number or harmful AI answer | L×H | Guardrail #4 machinery (n-gates, methodology, corrections page); eval harness on every model change; deterministic fallbacks; under-claiming verdict language; crisis-language escalation | Any correction request from a home; eval regression caught in CI |
| R10 | **Funeral-home hostility** — legal threats, opt-out campaigns, badmouthing to hospices | M×M | Under-claiming language; n-gates make home-level defamation structurally impossible; opt-out honored same-day; the FD-facing page frames us as the family's-rights layer, not the enemy; E&O + media rider | First demand letter; opt-out rate >5% of contacted homes |
| R11 | **Competitor wake-up** — Empathy adds a "price advocate" feature; a well-funded copy launches clean | M×M | Their payer conflict is structural (§6.5); our compounding outcomes corpus + channel trust are time-assets; if matched at scale, become the neutral data layer they license — the acquisition conversation from strength | Empathy marketing language shifting toward "lower the bill"; a funded neutral entrant |
| R12 | **SEO/AI-discovery volatility**, incl. post-rename dip | H×M | The rename runbook (301s forever, change-of-address, +2/+6-week checks); four loops + institutional distribution + owned list diversify (guardrail #6); programmatic surfaces rebuild breadth | Impressions not recovered at +6 weeks; any loop >50% of new leads |
| R13 | **Rename execution risk** (Jul 27) | M×M | Runbook rehearsed; old-domain inbound stays live indefinitely; TESS gate with a staged fallback name; slip rule: the date moves before quality does | TESS not clean by Jul 25 |
| R14 | **Platform concentration** (Vercel/Supabase/Anthropic/Stripe) | L×M | Exportable Postgres; standard Next.js; model-agnostic eval harness makes provider swaps evidence-gated rather than scary; acceptable concentration at this stage, revisited at scale | Any vendor pricing/terms shock |
| R15 | **Nonprofit affordability wall** — mission-aligned buyers with −1.3% margins | H×L | Sponsorship tier (donor/foundation-invoiced); for-profit-first sequencing (13.7% margins); grant exploration honest ("being explored," never promised) | Nonprofit pilots stalling at price in >2 cases |
| R16 | **Employer-channel timing temptation** — chasing the bigger ACVs before hospice proof exists | M×M | Sequencing doctrine (§8.8): ~80/20 until 5 hospices pay; employer product-complete but sales-parked; the pivot is *pre-authorized only* as R2's failure response | Founder calendar showing employer meetings displacing hospice discovery pre-proof |
| R17 | **Legal-entity/formation drag** — LLC-vs-C-corp drift, d/b/a filings, foreign qualification | M×L | Counsel item #7; resolved at setup fixed-fee; blocks nothing operationally except the raise | Any contract or raise conversation reaching paper before reconciliation |
| R18 | **Key-vendor compliance surprise** (e.g., a subprocessor's incident) | L×M | Subprocessor list + DPAs in the packet; incident-response ladder incl. partner notification; cyber policy | Any subprocessor breach notice |
| R19 | **Grief-adjacent product harm** — a family in crisis meets an AI feature at the worst moment | L×H | Crisis-language detection → 988 + human path; grief concierge deliberately parked behind a clinical safety review; tone rules (no growth-hacks in grief) are product law | Any crisis interaction transcript flagged in review |
| R20 | **Guardrail erosion under revenue pressure** — the "just this once" insurer check or home fee | L×H | The guardrails are written as law in `CLAUDE.md`, this plan, and the partner paper; billing code structurally excludes homes/insurers; the founder's stated position: the one unrecoverable mistake | Any term sheet or partnership draft that prices a guardrail |

**What we do not list as a risk:** input-cost inflation (§9.8 — no plausible AI/infra
shock matters), demand decline (§4.2 — mortality doesn't cycle), and funeral-industry
retaliation through pricing (homes competing harder on price *is the mission
succeeding*).

---

## 15. Endgame — the premium acquisition, from strength

### 15.1 The base case, stated plainly

Build the two assets an acquirer cannot replicate — the **conflict-free consumer
brand** and the **proprietary outcomes dataset** — on near-zero burn, with recurring
institutional revenue proving both are monetizable. Run it pure while it's ours.
When the money is right, take the offer with a clear conscience. The category's
acquirers are demonstrably active — Cake → Foundation Partners (2024), Everplans →
NGL → Precoa, Lantern → Wellthy, Willing → MetLife, Farewill sold — but note what
that graveyard actually shows: **companies were absorbed cheaply into funeral and
insurer money after running out of road.** The entire design of this company —
default-alive economics, institution-paid revenue, a dataset that compounds with
time — exists so that our version of that conversation happens from strength, at a
recurring-data multiple (6–9×), not as a distress absorption (1–3×).

### 15.2 Acquirer classes and what each is buying

| Class | Who (type) | What they're buying | Why they can't build it |
|---|---|---|---|
| **Life insurers / group-benefits platforms** | The Empathy-distribution carriers; group-life platforms | The neutral family-side layer their conflicted concierges can't be; the employer-channel book; the brand that de-toxifies their claims moment | Their payer position is the disqualifier — buying neutrality is their only path to it |
| **Bereavement/benefits incumbents** | Empathy-class platforms | The missing component (funeral-price advocacy) + the outcomes dataset that powers it | Same conflict; plus the dataset's time moat (§6.5) |
| **Healthcare/hospice-adjacent platforms** | EHR-adjacent, post-acute software, hospice-tech | A monetized bereavement module across ~6,700 hospices + the family-experience layer | Channel trust: they'd arrive as a vendor; we arrive as the family's advocate |
| **Consumer-trust data businesses** | The Carfax/FAIR-Health/NerdWallet pattern owners | A category-defining index + the only outcomes corpus in death care | The data cannot be backfilled at any price |
| **Strategic wild cards** | Estate/legal platforms, employer-benefits suites | Bereavement completes their life-event coverage | Build-vs-buy math at our margins favors buy |

### 15.3 What makes the asset priceless (the acquirer's diligence view)

1. **The outcomes corpus is longitudinal and consent-clean** — every record carries
   its provenance, consent flag, and methodology; a 2028 buyer cannot recreate
   2026–27 at any spend.
2. **The brand is the compliance answer** — an acquirer inherits the only
   funeral-adjacent name hospices can hand to families, plus the published
   guardrails that keep it that way.
3. **The revenue is recurring, institutional, and clean** — no revenue line an
   acquirer's counsel has to unwind (the anti-model, §2.4, is diligence-proof by
   construction).
4. **The index position compounds unattended** — citations, backlinks, and
   AI-answer presence accrue to the dataset's owner.

### 15.4 The BATNA is real: independence

The plan's economics (default-alive at 2–3 logos; profitable with a team at ~$400k
ARR) mean **no offer ever has to be taken.** A company that can decline is the only
kind that gets premium offers. The employer channel is the venture-scale option we
keep alive — exercised on our proof, our timing, or not at all.

### 15.5 What survives any deal (the founder's terms, written early)

Negotiating positions soften; documents don't. Any acquisition conversation starts
from: families never pay; the published dataset stays public; the corrections page
survives; no per-referral monetization of the family flow, ever. An acquirer who
won't take those terms is buying the one thing the terms protect — which is the
signal to decline. (A mission-lock was deliberately not put in the charter — the
protection is priced into the deal instead; that is a founder choice, documented
here so it is made consciously every time.)
# Appendices

## Appendix A — Product route inventory (as of `main` @ `353607f`, 2026-07-17)

**Totals:** 116 pages · 49 API routes · 4 crons.

**Public / SEO (~75 pages).** Cost cluster: `/`, `/average-funeral-cost`,
`/funeral-costs` (+ 87 `/funeral-costs/[city]` metros), `/funeral-homes` +
`/funeral-homes/[zip]`, `/fair-price-index`, `/prices`, `/methodology`,
`/funeral-home-tactics`. Reference: `/glossary` (+63 `[slug]`), `/faith` (+12
traditions, 6 denominations), `/estate` (+50 `[state]`), `/guidance/[scenario]`.
Guides: `/guides`, `/how-to-pay`, `/plan-ahead`, `/planning`, `/home-funeral`,
`/body-donation`, `/digital-legacy`, `/funeral-etiquette`,
`/medicaid-estate-recovery`, `/out-of-state-death`, `/reverse-mortgage`,
`/survivor-benefits`, `/veterans`, `/talking-to-kids`, `/headstone-vendors`,
`/end-of-life`, `/final-days`, `/after` (+ `/accounts-to-close`,
`/death-certificates`, `/estate-basics`), `/after-hospice`. Grief: `/grief`,
`/death-of-a-child`, `/disenfranchised-grief`, `/overdose-loss`, `/pet-loss`,
`/sudden-loss`, `/suicide-loss`. Trust/legal: `/about`, `/our-role`,
`/corrections`, `/rights`, `/faq`, `/how-it-works`, `/accessibility`, `/privacy`,
`/terms`.

**Family tools & flow.** `/analyzer`, `/compare-quotes`, `/decide`, `/bill-check`,
`/cash-advance-check`, `/certificates`, `/subscriptions`, `/eulogy`, `/obituary`,
`/memorial`, `/livestream`; negotiate: `/negotiate/start` → `/negotiate/[id]/`
`preview|status|results|compare|closed`; account: `/dashboard`, `/account`,
`/vault`, `/briefing`, `/next-30-days`, `/timeline`, `/worksheet`, `/plan-now`,
`/prep`, `/where` (+ `/just-happened`), `/resume/[id]`, `/notifications`,
`/preferences/[id]`, `/unsubscribe`, `/family`, `/household/[id]`, `/login`.
(`/paywall` is a dead orphan from the decommissioned era.)

**Partner-facing.** `/partners`, `/partners/apply`, `/employers`,
`/for-funeral-homes`, `/funeral-home-opt-out`, `/partner/[code]`,
`/partner/r/[token]` (+ `/links`, `/check`), `/partner/sample-hospice`; portal:
`/portal`, `/portal/check|links|materials|team|settings|login|paused`.

**Admin (9).** `/admin/ai-costs`, `/admin/benchmarks`, `/admin/faith-qa`,
`/admin/ingest-gpl`, `/admin/messages`, `/admin/outcomes`,
`/admin/outreach-preview`, `/admin/partners`, `/admin/vetting`.

**API (49).** Analyzer/checker: `analyze-price-list` (+`/draft-letter`,
`/explain`), `extract-price-list-image`, `compare-bill`, `subscription-finder`,
`benchmarks/tier`. Negotiate: `negotiate/start|choose|preview|preview-selection`,
`negotiate/[id]` (+`/messages`, `/quote`, `/outcome`). AI content: `eulogy`,
`obituary`. Family/account: `family/digest`, `household/{create,update,revoke,
rotate}`, `account/delete`, `preferences/sms`, `share/{create,[id]}`,
`suppression/clear`, `planning/signup`. Partner/portal: `partner/{apply,
demo-request,links,resolve}`, `portal/{settings,settings/rotate-token,team}`.
Admin: `admin/{funeral-homes,partners,outcomes,ingest-gpl,benchmarks/promote}`.
Inbound: `inbound/email` (Postmark), `inbound/resend-webhook`. Hospices:
`hospices/search`. Auth: `auth/callback`, `auth/signout`. Cron:
`cron/{anniversary,quote-notifications,nurture-emails,partner-digest}`.

## Appendix B — Database inventory

**~19 tables** across base schema + **24 migrations** (idempotent
`BOOTSTRAP.sql` regenerated per change; `VERIFY.sql` checks; founder-applied in
the Supabase SQL editor, one per build day).

| Table | Purpose | Access model |
|---|---|---|
| profiles, tasks, negotiations, negotiation_outreach, negotiation_messages, price_list_analyses, cert_trackers, obituaries | Family account + case data (incl. outcomes columns: listed/quoted/negotiated/paid, hidden fees, satisfaction, benefit dollars recovered) | RLS owner-scoped (`auth.uid()`); child tables scope through parent case |
| planning_signups | Email list | Anon insert-only |
| funeral_homes | Directory (193 UT seeded; vetting cols; `gpl_url`, `last_verified_at`) | Public column-scoped read |
| share_links, household_links | Family sharing | Token-scoped |
| partners, partner_codes, partner_members, partner_leads | Institutional layer (types: hospice/employer/insurer — insurer for exclusion enforcement) | Service-role only; resolved after token/session checks |
| api_cost_events | AI cost ledger (feature, model, tokens, case link) | Service-role only (deny-all RLS) |
| regional_benchmarks | Promoted verified/community tiers (ships empty; founder promotions only) | Service-role only |
| hospices | CMS reference layer (6,852 facilities) | Service-role only; public search API |

Migration timeline (2026): 04-25 directory · 04-26 quote items · 05-05 share
links · 05-08 (dead) paywall cols · 05-09 anniversaries + quote notifications ·
05-16 nurture · 05-21 coordinator messages · 06-03 vetting · 06-09(+b) RLS
hardening · 06-22 **outcomes** · 06-27 **partners** · 07-01 bereavement cadence ·
07-02 benchmark zip · 07-03 SMS, household, partner codes/onboarding, pilot
metrics · 07-13 **portal identity + cost ledger** · 07-16 inbound AI parse ·
07-17 **regional benchmarks** · 07-20 **hospices + consent** (founder-applies
Monday). Pending per the sprint: Migration B (billing columns, Jul 23).

## Appendix C — AI system inventory

**Models (in `lib/claude.ts`):** workhorse `claude-sonnet-5`; classifier
`claude-haiku-4-5`; thinking disabled; per-call `max_tokens` caps; `callClaude`
throws on truncation; every call tagged to `api_cost_events`.

**Ledger pricing (in `lib/ai-costs.ts`):** sonnet-5 **$2/$10/$0.20** per Mtok
(in/out/cache-read) through 2026-08-31, then **$3/$15/$0.30**; haiku
**$1/$5/$0.10**; unknown models priced at sonnet sticker by design (over-estimate,
never under).

| Feature (ledger tag) | Model | max_tokens | Notes |
|---|---|---|---|
| analyzer-extract | sonnet-5 | 2,000 | ≤20k-char paste |
| advocacy-summary | sonnet-5 | 1,000 | |
| extract-price-list-image | sonnet-5 (vision) | 2,700 | ≤8MB, client-downscaled; never stored |
| line-item-explain | sonnet-5 | 400 | |
| draft-letter | sonnet-5 | 1,000 | |
| compare-bill | sonnet-5 ×2 | 2,000 | quote + bill |
| obituary / eulogy | sonnet-5 | 1,100 / 3,800 | deterministic fallbacks |
| subscription-finder | **haiku-4-5** | 2,000 | ≤50k-char statement |
| inbound-quote-parse | sonnet-5 | 1,300 | 6k-char slice; 15s timeout |
| partner-digest | sonnet-5 | 400 | per report page-load |
| founder-ingest | sonnet-5 | 2,000 | the GPL ingest tool |
| *(eval)* | sonnet-5 | — | 14 fixtures × 2 calls; `npm run eval:analyzer`; baseline committed |

Non-AI by design: funeral-home outreach emails (deterministic reviewed template);
benchmark matching (deterministic code); negotiation follow-ups (written, unwired
pending review flow).

## Appendix D — Source documents index (the constellation this plan sits on)

Canonical: `CLAUDE.md` (operating contract) · `docs/OPERATING_PLAN.md` (bible) ·
`docs/PRODUCT_PLAN_2026-Q3.md` (13-week master) · this document (business master).
Execution: `docs/ROADMAP.md` · `docs/PRODUCT_SPRINT_2026-07-16.md` (+
`_BUILDSHEETS.md`) · `docs/EXECUTION_PLAN.md` · `docs/GO_TO_MARKET.md` ·
`docs/NAMING_SPRINT_2026-07.md`. Market/legal: `Honest_Funeral_Market_Research.pdf`
· `docs/LAWYER_BRIEF.md` · `docs/LAWYER_OUTREACH.md` · `docs/COMPLIANCE_ADDENDUM.md`
· `docs/ANTI_STEERING_EVIDENCE.md`. Sales: `docs/HOSPICE_GTM.md` ·
`docs/BATTLECARD.md` · `docs/HOSPICE_COLLATERAL.md` · `docs/sales/*` (outreach
sequence, discovery script, demo script, one-pager, pilot agreement, ROI template,
staged demo GPL). Data: `docs/DATA_PLAN.md` · `docs/FAIR_PRICE_INDEX.md` ·
`docs/BENCHMARK_EXPANSION_SPEC.md`. Finance: `docs/FINANCE_FUNDRAISING.md` ·
`docs/INVESTOR_TEASER.md` · `docs/SCORECARD.md` · `docs/MARKET_READINESS.md`.
Trust/ops: `docs/SECURITY.md` · `docs/PRIVACY_RETENTION.md` ·
`docs/TRUST_OPS_RUNBOOK.md` · `docs/TRUST_SPINE.md` · `docs/FAMILY_SUPPORT_SOP.md`
· `docs/AI_STRATEGY.md`. Superseded/historic (kept for the record):
`docs/LAUNCH_CHECKLIST.md`, `docs/PAYWALL_RECOMMENDATION.md`,
`docs/PAYMENT_DECOMMISSION.md` (executed), `docs/REFUND_SOP.md`, the June 2026
`BUSINESS_PLAN.md` this document replaces.

## Appendix E — Glossary of internal terms

**ADC** — average daily census (hospice size metric; our pricing tiers key on it).
**Approach A/B/C** — the HIPAA enrollment models (self-serve / staff-assisted /
census-transmitted); A is law, C is designed out. **Badge honesty** — a data
surface never claims a stronger tier than its source. **The bible** —
`docs/OPERATING_PLAN.md`. **BILLING_LIVE / OUTREACH_LIVE / …_ENABLED** — env kill
switches; flips are founder-only actions. **Channel-survival rules** — the four
market-research laws (family-initiated, post-admission, hospice-transmits-nothing,
never "arranging"). **Community/Verified/Modeled** — the three data tiers.
**Contribute-consent** — the unchecked-by-default checkbox governing whether an
analysis feeds aggregates. **Dry-run rows** — outreach ledger entries written when
`OUTREACH_LIVE` is off. **Founding partner** — first-five-logo terms (−20% year 1,
reference rights). **GPL** — General Price List, the FTC-mandated itemized price
list. **Guardrails #1–6** — the six non-negotiables (§2.2). **The loops** — the
four organic growth loops (§8.6). **n>5 rule** — no public data claim below six
records + significance + ≥4 operators. **The one-purpose test** — AKS analysis
governing inducement (§11.6). **Proof sheet / proof artifact** — the one-page
pilot-results document. **Rename Day** — Jul 27, 2026: Honest Funeral → Open
Farewell. **The scoreboard** — the seven Oct-16 "done" criteria (§13.5).
**The wedge** — the "is this quote fair?" checker. **WB-xxxx** — case reference
prefix in outreach subjects (legacy "Walk Beside" naming).

## Appendix F — Assumptions & disclaimers

1. **Figures.** Market and competitor figures are drawn from cited public sources
   as verified in the July 2026 market research; figures labeled *derived* are
   arithmetic on those inputs; pricing and the financial model are explicit,
   labeled hypotheses. Verify any external-facing figure against its primary
   source before publishing it — and replace industry-sourced statistics with our
   own corpus data as density permits (already flagged in §4.8/§11.7).
2. **The load-bearing unknown** is institutional willingness-to-pay (R1). Every
   revenue number downstream of A1–A6 inherits it. The plan's defense is speed to
   the test, not confidence in the guess.
3. **Dates.** The aggressive calendar (§13) is a commitment to attempt with
   pre-committed kill/adjust criteria — not a promise of outcomes on dates.
4. **Legal.** Nothing here is legal advice; counsel-gated items are marked and the
   engagement (§11.5) is the authority. This plan is written to be shown to
   counsel, partners, and investors as the company's honest self-description.
5. **Brand.** "Honest Funeral" and "Open Farewell" refer to the same company across
   the Jul 27 rename; code never hardcodes the name (`lib/brand.ts`).
6. **Supersession.** This document replaces the June 2026 business plan. Where any
   older doc conflicts with this one, this one and the bible govern; where this
   document conflicts with the six guardrails, **the guardrails win.**
