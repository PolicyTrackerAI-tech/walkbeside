# Honest Funeral — Business Plan

_Confidential · v3.0 · August 16, 2026 · Ryan Currie, Founder · honestfuneral.co_

> **Version note.** v3.0 supersedes the June 2026 plan (v1) and the July 2026
> v2.0 draft (PR #167, unmerged). It carries v2's pricing, cost, and
> kill-criteria machinery forward, re-dates the execution calendar to reality as
> of August 16, and folds in the 2026-08-16 payer-viability research: four
> parallel research passes (internal docs, hospice payer economics, legal
> landscape, comparable-company outcomes, ~150 sources). Where that research
> corrected a prior belief, the correction is stated in place and marked
> **[corrected]**.

> **A note on figures.** Market and competitor figures are drawn from public
> sources (cited in the appendix); figures labeled *derived* are arithmetic on
> those inputs. Pricing and the financial model are **explicit, labeled
> hypotheses**, not forecasts. This plan is deliberately honest about what is
> unproven, chiefly **whether and what a hospice will pay**, because that
> honesty is the brand.

---

# Part I — Where we are

## 1. The company in one page

**Honest Funeral is the free, neutral source of truth for funeral pricing**, and
the advocate that helps grieving families act on it. ~3 million Americans die
each year into a market where identical services vary 100–200%+ within one
metro, only ~18% of funeral homes post prices online, and everyone who claims to
help the family is paid by someone with a stake in the funeral bill.

We take the one seat no one else can occupy: **paid by no one with a stake in
the funeral price.** Families pay nothing, ever. Funeral homes pay nothing,
ever. Insurers may distribute us or acquire us, never pay us. Revenue comes from
the institutions that serve the dying and have no funeral-price stake:
**hospices first, then employers** (B2B2C). The compounding assets are a
**proprietary outcomes dataset** and a **conflict-free brand**; the base-case
exit is a **premium strategic acquisition**.

The six guardrails are law and are enforced in code where code can enforce them:
(1) never funeral-home or insurer money; (2) never charge the grieving family;
(3) never steer a family to a specific home; (4) never publish a number we can't
defend (n>5 + significance + methodology); (5) never own the funeral or its
capital risk; (6) never rent the whole flywheel from one platform.

**Where we are in one sentence:** the product is built through all three layers,
the legal design is sound on the evidence, no one has paid us a dollar, and the
only thing between this plan and its first proof point is a selling motion that
has not started.

## 2. Status: the honest inventory (as of 2026-08-16)

**Built and live** (main @ `c47a6a0`, shipped through the July sprint):

- **L1, the free source of truth:** fair-price lookup, the "is this quote fair?"
  analyzer (eval-gated), 87 ISR metro pages, hospice state pages + facility
  claim flow, a 63-term glossary, 40+ guides, and the citable Fair-Price Index.
- **L2, the instrumented family service:** the at-need negotiate flow with
  outcomes instrumentation, owner-scoped by RLS, with the outreach kill switch
  (`OUTREACH_LIVE`) off by founder choice.
- **L3, the institutional product:** partner portal, admin vetting and partner
  management, partner referral links + check flow, and the AI digest cron.
- **Governance:** anti-steering by construction (neutral ordering, no
  "recommended" home), consent-gated dataset contributions, deletion cascade,
  the n>5 publication gate, CI guardrail checks.

**Built but dark, or missing:**

- **No billing surface.** `lib/stripe.ts` is 24 lines of scaffolding. A hospice
  that said yes today could not pay us. (Spec exists: Migration B +
  institutional-only Stripe, sprint Day 8.)
- **Migration A (hospice directory data) not applied in prod**; hospice search
  runs empty until it is. `ADMIN_EMAILS` not yet set in Vercel (blocks the
  audit-stream PR #175).
- **Counsel not retained.** The lawyer brief exists to brief counsel; the two
  load-bearing legal positions (§15) are the founder's research, not an
  attorney's opinion. Utah anti-steering clearance, the #1 launch gate, is
  uncleared. Entity form (LLC vs Delaware C-corp) is unresolved in the docs.
- **Zero commercial motion.** No discovery calls, no pilots, no LOIs, no named
  prospect list committed to. The v2 plan's early-warning tripwire ("<5
  discovery calls by Aug 8") **fired eight days before this document's date.**

**In flight elsewhere:** MBC Step-2 application; YC target ~November; the
November checkpoint decides founder full-time. The rename ("Open Farewell") is
ON HOLD by founder decision (2026-07-27); the brand remains Honest Funeral and
this plan drops all rename-dependent scheduling from v2.

## 3. What the August 2026 research settled

The question asked was: is this a profitable endeavor, and are there legal
problems with selling to hospices? The verdict, which this plan is built on:

1. **Profitable today: no, by design.** Free-to-family is layers 1 and 2; the
   sellable product is layer 3. Revenue is $0 because the selling test has not
   started, not because there is nothing to sell.
2. **Can be profitable: yes, with qualifiers.** Hospices verifiably pay outside
   vendors for family-facing bereavement support, anchored by an unfunded
   federal mandate and public CAHPS scoring. But every proven ticket in the
   channel is small, roughly 40% of hospices run negative Medicare margins and
   cannot buy, and no hospice has ever bought funeral-price navigation
   specifically. The realistic entry sale is the **$4,800–$9,600 tier to
   mid-size and large hospices, for-profits included**, pitched on CAHPS +
   mandate compliance + staff-hours returned. The hospice channel tops out
   around **$60–70M**; scale lives in the employer channel.
3. **Legal problems: none fatal.** No statute, rule, advisory opinion, or
   enforcement action found prohibits the model as designed. What remains is a
   counsel checklist (§15) and four prohibited behaviors, all already excluded
   by the product's design. Counsel gates the first signature, not the first
   conversation.

# Part II — The business

## 4. The problem

- **Scale and permanence.** ~3.0M U.S. deaths/year, rising past 3.6M by 2037.
- **Opacity.** Only ~18% of homes post prices online. The FTC Funeral Rule
  guarantees an itemized price list on request but not online; the FTC's 2022
  regulatory review remains an ANPR with **no proposed or final rule as of
  August 2026** **[corrected: v2 assumed an NPRM]**. Scarce price data is a
  problem for families and a moat for whoever collects it.
- **Dispersion.** Identical services vary 100–200%+ within one metro; median
  funeral ~$6,280 (cremation) / ~$8,300 (burial).
- **Worst possible buyer.** At-need purchasing is once-in-a-lifetime,
  grief-state, time-pressured, zero-repeat. Engineered for the upsell.
- **Everyone "helping" is conflicted.** Comparison sites are paid by the homes;
  insurer-backed concierges serve the insurer; the home is the seller. The
  neutral seat is empty. The August research confirmed it is still empty: no
  company sells funeral-price transparency with hospices as the payer.

## 5. The product: three layers

Families get the first two free; institutions buy the third.

1. **Free source of truth:** price lookup, the analyzer, guides, glossary, metro
   and hospice pages, the quarterly Fair-Price Index. Job: reach + data + trust.
2. **Instrumented family advocacy:** we invoke the family's FTC right to
   itemized quotes, return neutral side-by-side options (the family chooses; we
   never steer), and capture outcomes data. Its second job is the strategic one:
   the outcomes layer no competitor can scrape.
3. **Institutional product:** the partner portal + reporting a hospice (then an
   employer) uses to hand families the neutral tool and to **prove they
   delivered their bereavement obligation**: aggregate-only reporting, never
   family-level rows.

The hospice-facing product is funeral-price advocacy wrapped in a light
practical-navigation layer (after-death checklist, what-to-do-next), enough to
map to the ~13-month bereavement obligation without building a deep
estate/probate/grief platform. The price wedge makes us different and safe to
hand a family; the light wrapper makes us enough to satisfy the mandate.

## 6. The market, updated

The ~$20B funeral economy is the size of the pain, **not our TAM**; we touch
none of that spend. Our market is what institutions pay for
bereavement/family-navigation tooling, sized bottom-up with MedPAC's March 2026
data **[corrected: v1 used ~5,800 hospices from CDC 2022]**:

**The hospice channel (the beachhead):**

- **6,706 Medicare-certified hospices** (2024, +2.6% YoY); 82% for-profit by
  count; 52.9% of Medicare decedents used hospice (>1.3M hospice deaths/yr);
  $28.3B Medicare hospice spend.
- **Margins are barbelled:** aggregate 8.0%; for-profit +13.7%; nonprofit −1.3%;
  hospital-based −25.6%. The bottom two volume quintiles (~40% of providers,
  ~10% of patients) run **negative** margins and are effectively non-buyers. The
  top quintile serves 67% of patients at +9.5%.
- **The buyable segment** is therefore mid-size and large hospices, skewing
  for-profit: fewer logos than the raw 6,706 suggests, but each with real budget
  and most of the families.
- **Channel ceiling:** full theoretical penetration at blended ~$9–10k ACV is
  **~$60–70M ARR**. A proof-and-data beachhead, not the scale engine. Chain
  contracts (VITAS ADC ~22,000; Gentiva ~34,000) are $1M+ each at per-family
  rates and are sequenced 2027+.
- **Budget reality to respect:** bereavement has historically run at **no more
  than ~1.4% of Medicare hospice revenue** (MedPAC's ceiling estimate), mostly
  consumed by required staff. MedPAC just recommended freezing FY2027 rates
  17–0; CMS finalized +2.3% with new utilization scrutiny; sector attention is
  on HOPE compliance (live Oct 2025) and fraud-audit defense. **The subscription
  must be sold as displacement and leverage (CAHPS, compliance proof,
  staff-hours), never as new budget.**

**The employer channel (the scale layer, and it is allowed):** employers have no
funeral-price stake, so employer-as-payer is permitted. At an illustrative $3.50
PEPM, a 1,000-employee company is ~$36–42k ACV: **~25 employer logos ≈ $1M ARR
vs ~100–110 hospices at blended ACV.** Everest Funeral Concierge began selling
funeral concierge (including price comparison and negotiation) directly to
employers in October 2025, which validates employer appetite for exactly this
benefit category. Empathy's 1,000+ employer accounts validate the budget line;
its insurer-paid structure leaves the "actually lowers the bill" seat empty for
us.

**What we never sell into:** funeral homes (forbidden) and insurers-as-payer
(forbidden). The August research makes the cost of that choice explicit: the
only venture-scale company in the category (Empathy, $162M raised, revenue in
the tens of millions tripling YoY) is insurer-paid. We trade that channel for
the neutral seat, on purpose, and say so plainly.

**SOM (now):** 20–30 named independent and regional hospices, Utah first
(drivable, fast-deciding), ADC 20–150, for-profits included.

## 7. Evidence for the payer, and evidence to respect

**For (verified August 2026):**

- **The mandate is real and unfunded.** 42 CFR §418.64(d) requires an organized
  bereavement program for the family up to a year post-death; Medicare pays
  nothing additional for it (nonreimbursable cost center).
- **Hospices already pay third parties for family experience.** Every hospice
  with 50+ eligible decedents must retain a CMS-approved CAHPS survey vendor.
  Bereavement mailer and program software runs $1,950–$2,750; death doulas run
  $1,500–$5,000 per engagement; hospice EHRs start around $14k/yr. Five-figure
  vendor line items are normal.
- **Help Texts is the existence proof:** eight years selling 13-month
  per-family grief-text subscriptions to hospices, marketed explicitly on the
  CMS mandate and CAHPS scores; ~90% of its revenue is B2B. Durable, and tiny
  (~$1M raised, six staff): proof the budget line opens, and proof small tickets
  alone don't make a big company.
- **The market moved toward this payer:** Betterleave launched as an employer
  bereavement benefit (2022) and pivoted to hospice partnerships (2024).
  Compassus deployed Empathy across 200+ hospice locations after a 3-month
  pilot: hospice compliance departments demonstrably approve family-facing
  death-logistics vendors.
- **The product works as an institutional benefit:** Everest has negotiated
  funeral prices for families for nearly two decades as an institutionally
  funded benefit (25M+ covered lives). Only the hospice-as-payer version of
  funeral-price navigation is unproven.

**To respect (also verified):**

- Nobody, anywhere, has ever sold funeral-price navigation to a hospice. The
  white space is real and it cuts both ways.
- The proven hospice tickets are low-thousands. Our $4,800/$9,600 tiers sit at
  the top of the demonstrated band; $18,000 is defensible mainly for multi-site
  programs. **[corrected]** The "$25–75 per family" anchor band cited as
  validated in v2 §7.3 is **illustrative and untested**; price-testing it is a
  pilot objective, and we stop calling it validated anywhere, including to
  investors.
- Activation is the unmeasured link: channel-survival law forbids every push
  mechanism, so revenue depends on families self-activating from a handed link,
  and no activation-rate data exists yet. The behavioral trend (single-home
  shopping rising to 54.7%) runs against organic uptake.
- A live competitor exists: **Renidy**, an AI funeral-planning platform piloting
  with Texas hospices (Hospice News, July 2026). The channel thesis is being
  tested by someone else too.

## 8. Competition

| Player | What they are | Who pays them | Why we win |
|---|---|---|---|
| **Empathy** | After-loss concierge (~$162M raised; 50M+ covered lives; 8 of top-10 life carriers; 1,000+ employers; revenue tens of millions, 3× YoY) | **Insurers / employers** | Serves the insurer; structurally conflicted on driving the funeral *bill* down. We are the neutral price layer their payer model can't offer. |
| **Everest Funeral Concierge** | Funeral concierge incl. price comparison + negotiation; 25M+ covered lives; employer offering since Oct 2025 | Insurers / employers | Validates the product-as-benefit; absent from the hospice channel; staffs licensed FDs (a mitigation we can copy cheaply). |
| **Help Texts / Betterleave** | Hospice-paid grief texts / hospice family-comms SaaS | **Hospices** | Prove hospices pay for family support; adjacent to (not competing with) funeral pricing; potential partners. |
| **Renidy** | AI funeral-planning platform piloting with TX hospices (2026) | TBD | Watch closely; our moat is the outcomes dataset + conflict-free brand + price data they'd have to collect from zero. |
| **The graveyard: Cake, Lantern, Everplans, Farewill, Grace** | Consumer end-of-life planners | The grieving family, or no one | Died or down-exited into funeral/insurer money (Cake→Foundation Partners; Lantern→Wellthy; Farewill→Dignity at £12.9M vs £30M+ raised; Grace died with no payer). We flip the payer and stay un-ownable by funeral money. |
| **Comparison sites (Funeralocity, Parting, Ever Loved)** | Directory / lead-gen | **Funeral homes** | Home-paid = not neutral (documented consumer-advocate criticism); none achieved scale. |
| **Status quo** | The home; the hospice's own counselors | / hospice | We arm the family with the home's own FTC price list and do the pricing+admin maze counselors aren't resourced for. |

**One line:** *the only player paid by no one with a stake in the funeral
price.*

## 9. The moat (a someday-asset, stated honestly)

Real in ~3 years, ~zero today. Four powers on one rule (no funeral-home or
insurer money): counter-positioning (a 3–5 year window), trust/brand,
conflict-free embedding in hospice/employer workflows, and the proprietary
outcomes layer (quoted vs paid, what advocacy negotiated, which homes flex).
Price lists are scrapeable; outcomes are not. Honest caveats: the moat needs
case volume we don't have; free price data alone has existed for 60 years
without becoming the standard; our bet is that outcomes + advocacy proof +
conflict-free brand + AI-citation distribution transform it. The FTC's stalled
rulemaking is a tailwind for the data moat: online price posting remains
voluntary, so collected GPL data stays scarce. If a future rule mandates
disclosure, moat value shifts to the outcomes layer, which is already the plan.

# Part III — The money

## 10. Pricing & packaging

**Who pays and why exactly them:** the hospice carries an unreimbursed ~13-month
bereavement obligation and has no stake in the funeral price. Paying us passes
the conflict test. Enforced in code: only `partner_type in
('hospice','employer')` can ever reach a billing state. There is structurally no
way to invoice an insurer or a funeral home.

**Metric:** census-tiered **flat annual subscription** (cleanest optics; nothing
may smell like a per-referral fee). Per-activation pricing was evaluated and
**rejected** as the closest pattern-match to the referral-fee failure mode. PEPM
for employers only.

**The hospice price list** (hypothesis until a pilot converts; tier reads
updated by the August research):

| Tier | ADC | Price | Effective per family | Read on the evidence |
|---|---|---|---|---|
| Pilot | any (10–15 families) | **$0 for 60 days** | | The conversion machine (below) |
| Small | <50 | **$4,800/yr ($400/mo)** | $16–32 | Supported; near Help Texts economics |
| Mid | 50–100 | **$9,600/yr ($800/mo)** | $17–32 | Supported for the top volume quintiles, sold on CAHPS + compliance + staff-hours |
| Large | 100+ | **$18,000/yr ($1,500/mo)** | ≤$33 | A stretch for single sites; lead with Mid and upgrade on proof |
| System / multi-site | 2–20 sites | custom, anchor **$30k+/yr** | | Sequenced 2027+ |
| Nonprofit sponsorship | any | Small/Mid invoiced to a foundation/donor sponsor the hospice nominates | | Case-by-case, never promised in collateral |

Prices triangulate: (a) the per-family anchor band ($25–75, **illustrative, to
be price-tested in pilots**); (b) below typical ED signature thresholds (~$10k)
for the tiers we sell first; (c) ~0.1–0.2% of hospice revenue; (d) a fraction of
one bereavement-coordinator FTE ($55–75k loaded). Blended ACV across a realistic
mix lands near **$9–10k**, which roughly halves the logos needed for any ARR
target vs the old flat-$5k math.

**Mechanics and policy (carried from v2, unchanged):** monthly recurring prices
($400/$800/$1,500) as the default Checkout objects, annual prepay −10% via
invoice, auto-renew with a 60-day out-clause in year 1. Invoice language:
**"bereavement support program — [tier]"** (procurement-safe; matches the AKS
framing in §15). Fallback lane if the annual stalls: **$60 per family served,
quarterly, 12-family minimum ($2,880/yr floor)**, priced deliberately above the
annual's effective rate so the annual is the rational choice. Founding-partner
rate for the first 5 logos: year-1 −20% for a reference call, logo rights, and a
case study. Never allowed: free-forever, per-referral anything, family charges,
success-fees on savings, insurer subsidy of a hospice's subscription. Price
rises only on renewal anniversaries, capped +20%/yr.

**The pilot (the conversion machine):** free, 60 days, ~10–15 families,
**family self-enrollment only** (no PHI transmitted → no BAA by construction),
founder runs every case, success criteria agreed in writing up front (families
served, satisfaction ≥4.0/5, documented savings target, staff-hours returned),
aggregate-only de-identified reporting, perpetual de-identified-aggregate
data-use grant. Conversion is calendared, not asked for at the end: week-2
metrics conversation, week-6 mid-review with first price-list preview (tier
pre-selected by census), week-9 proof sheet + the monthly-Checkout ask. "About
to pay" counts only as a signed order form or an ED's written commitment with a
start date.

**Employer pricing (wave 2, priced now):** $3.50 PEPM list, $3.00 at 1,000+,
$2.50 at 5,000+, $6,000/yr floor; 90-day $0 pilot, one division or up to 1,000
employees. Benefits brokers at 10–15% of year-1 are acceptable distribution
cost, not a conflict (brokers have no funeral-price stake).

## 11. Cost base & unit economics

- **Variable cost per family served:** ~$0.10–0.25 measured (AI + email), $1.00
  planning ceiling. Gross margin ~96–99%. The unit *sale* is the hard part, not
  the unit cost.
- **Fixed base:** ~$170–340/mo today; ~$0.8–1.7k/mo at pilot-ready posture
  (insurance bound, counsel retainer bursts). Two small logos cover it.
- **One-time near-term:** counsel setup package, planning estimate $3–7.5k
  (fixed-fee ask); insurance at first signed pilot.
- **Worst-case 2026 cash need:** ~$12–18k against ~$40k committed founder
  capital. Pre-revenue burn never exceeds ~$2k in any month. The company is
  default-alive by construction; the aggressive commercial calendar is a
  low-regret bet.

## 12. Path to profitability

**The break-even ladder** (the hiring governor in reverse; no rung is climbed
until the bar below holds for two consecutive months):

| Threshold | Monthly bar | What it means |
|---|---|---|
| Infrastructure break-even | ~$1.7k MRR | 2–3 small logos; the company outlives its costs |
| + Hire 1 | ~$11k MRR | first employee affordable on revenue |
| + Founder at $120k | ~$21k MRR | **the business pays its founder**; ~26 blended hospice logos, or fewer with employers |
| + Hire 2 | ~$36k MRR | repeatable-motion team |

**The logos math** (both readings kept honest):

| Path to $1M ARR | At blended ~$9–10k hospice ACV | At employer ~$21–42k ACV |
|---|---|---|
| Logos required | ~100–110 | **~25–50** |

**Scenarios, re-based to Aug 16** (v2's "plan" dates assumed a selling motion
that did not start; its lean case is now the operative plan):

| | **Operative plan** (was v2 lean) | **Stretch** (v2 plan, compressed) |
|---|---|---|
| Counsel retained + list built | by Aug 29 | by Aug 22 |
| 20 discovery conversations | by Oct 1 | by Sep 19 |
| Pilots signed | 2–3 by Oct 15 | 2–3 by Oct 1 |
| First paid logo | **Dec 2026** | Nov 2026 |
| EOY 2026 | 1–2 logos, ~$7–14k ARR | 3–5 logos, ~$25–42k ARR |
| EOY 2027 | ~18 logos, ~$170k ARR | ~40–49 logos, ~$690k ARR |
| 2028 shape | employer channel opening on hospice proof | ~$1.8–2.6M ARR, employers carrying growth |

We underwrite the operative plan (default-alive throughout) and work the
stretch. Assumptions that remain unvalidated and are flagged as such:
pilot→paid conversion ~50–66%; blended ACV; 85% gross retention in 2027 (the
year-2 renewal question is the make-or-break unknown); ~10–20 instrumented
cases per partner per quarter.

**What "profitable" means at each stage:** infrastructure-profitable at 2–3
logos (Q4 2026–Q1 2027 in the operative plan); founder-salary-profitable at
~$21k MRR (2027, requiring the stretch case or early employer wins);
venture-scale only via the employer channel (tens of logos, not hundreds).

## 13. Financing

Bootstrap by default; raise on proof. The raise trigger is mechanical: 1–2 paid
recurring contracts + renewal/expansion signal + free-tool traction climbing.
When green (earliest realistic: Q1 2027 in the operative plan), a **$250–500k
angel/mission round** (the FreeWill / Bain-Double-Impact investor profile) buys
founder full-time, the hospice-insider hire, SOC 2, and a doubled data cadence.
A $1–2M seed is justified only by employer-channel proof. Anyone pushing
funeral-home or insurer monetization is disqualified by definition. MBC Step-2
and the ~November YC window run in parallel; **the November checkpoint decides
full-time using the §18 gates, not feelings.** Entity: resolve to Delaware
C-corp at counsel setup, before any contract or raise.

# Part IV — Where we go

## 14. The selling test, re-dated (Aug 18 → Dec 31)

The 90-day question is singular: **will one hospice pay?** Everything below
serves it. Product work is deliberately capped at the four items in week 1; this
is a selling quarter, not a building quarter.

**Week of Aug 18 (restart week):**
1. Send the counsel outreach brief (drafted, queued); target one firm covering
   healthcare-regulatory (AKS/HIPAA, highest priority) + consumer/FTC; fixed-fee
   setup package $3–7.5k. Counsel gates signatures, not conversations.
2. Build the named 20–30 target list: Utah independents first, then mid/large
   regional operators including for-profits (they have the +13.7% margins).
   Disqualify bottom-quintile hospices early; they cannot buy.
3. First 10 outreaches go out (deterministic templates, CAN-SPAM-clean).
4. Product (one week, in parallel): apply Migration A + pending prod
   migrations; set `ADMIN_EMAILS`; ship the Day-8 billing surface behind
   `BILLING_LIVE=false` so a yes can become a payment.

**Aug 25 – Oct 1 (discovery grind):** 20 genuine discovery conversations. The
pitch order, research-verified: CAHPS star ratings and public family-experience
reporting first, the unfunded §418.64(d) obligation second, staff-hours returned
third, free-and-neutral-for-families as the close. Never pitch CAHPS as a
Medicare-dollars lever (it is pay-for-reporting; the reputation lever is real).
Never pitch "more referrals." The compliance packet (security + trust + the AKS
one-pager) ships with every pilot conversation unprompted; the Grace story is
answered by architecture, not reassurance.

**Sep 15 – Oct 15:** sign 2–3 pilots (ED-signable, $0, written success
criteria). **Kill gate Oct 1** (§18) if 20 conversations have produced no pilot.

**Oct – Nov (pilot execution):** founder runs every family case by hand.
Week-2 / week-6 / week-9 conversion mechanics per §10. Bind insurance at first
signed pilot. Instrument every case: the ≥$1,500 median-savings gate needs 10+
cases of evidence.

**Dec 1 – 31 (conversion window):** the monthly-tier Checkout ask off the proof
sheet. **Kill gate Dec 31** (§18). December financing checkpoint: with 1–2
paying logos and renewal signal forming, decide bootstrap-vs-raise per §13.

**Standing rule:** the employer pivot is pre-authorized **only** as the Oct-1
kill response, not as a temptation to chase bigger ACVs before hospice proof.
Until then effort stays ~80/20 hospice/employer.

## 15. Legal posture and counsel plan

**The verdict (research current to Aug 16, 2026; counsel confirmation
pending):** nothing found is fatal. The funeral itself is never federally
payable, so anti-kickback exposure attaches only to hospice selection, which
post-admission-only delivery addresses (OIG AO 00-3 is the closest authority;
the §418.64(d) procurement framing is the strongest argument). Every at-need
solicitation statute found regulates licensees or uninvited contact; the
family-initiated design is neither. No state licenses "funeral consultants" as
a category. No funeral price publisher has ever been found to face a
defamation/trade-libel suit, including 60 years of FCA surveys.

**The four ways to make it illegal (all excluded by design; keep them excluded):**

1. Pre-admission marketing use of the benefit, or per-activation pricing
   (beneficiary-inducement / kickback territory; flat fee + post-admission only).
2. Platform-initiated contact with bereaved or dying-patient families (the
   Grace failure mode; arguably illegal for any person in NJ).
3. **Payment-influenced hospice recommendations anywhere on the consumer site**
   (new risk, live since the hospice state pages + facility-claim flow shipped:
   hospice care IS federally payable, so if paying hospices ever rank or badge
   better in a surface families use to choose a hospice, the platform itself
   has AKS exposure). **The hospice directory must be provably payment-blind,
   with the firewall documented**, the hospice-side mirror of guardrail #3.
4. Funeral-home money in any form (also license-revocation bait for the homes
   in NY/VA).

**Corrections to prior internal beliefs [corrected]:** FTC action was an ANPR
(2022), not an NPRM; no rule exists as of Aug 2026. Maine's ban is
preneed-only and licensee-scoped. Texas's solicitation rule is licensee-scoped.
**New Jersey belongs on the watch list ahead of all four previously believed
states** (its ban reaches "any person" soliciting in health-care facilities);
the family-initiated packet flow should clear it, and NJ mechanics get specific
sign-off before any NJ pilot.

**Counsel engagement (priority order, fixed-fee asks):**

1. Utah anti-steering clearance (the #1 launch gate; no state goes live
   uncleared).
2. AKS/CMP memo: flat-fee FMV documentation, §418.64(d) procurement recitals,
   no volume linkage; optionally a real OIG advisory opinion once pilot design
   freezes.
3. The HIPAA/AKS dual-frame contract, the subtlest drafting problem in the
   model: the AKS-safe framing ("procurement of the hospice's own bereavement
   obligation") pulls toward business-associate status, while the HIPAA-safe
   framing needs a consumer service the family elects with aggregate-only
   reporting. One firm blesses the contract under both readings; the partner
   dashboard never shows family-level rows; BAA-avoidance-by-self-enrollment is
   the single most load-bearing legal assumption in the company.
4. Pilot agreement + data-use grant review (the moat's paper).
5. TX (§651.001(7)) and SC (§40-19-20(d)) unlicensed-practice opinions before
   entering those states; consider the Everest mitigation (a licensed funeral
   director consultant on call).
6. Entity reconciliation to Delaware C-corp; substantiation standards for
   published claims; privacy-policy rewrite for B2B2C; WA My Health My Data
   scan; NJ/ME/CA state checks as those states enter scope.

**Climate note (a sales weapon, not just a risk):** the 2025–26 DOJ/OIG
hospice-fraud takedowns and six-state enhanced-oversight regime mean hospice
compliance officers are primed to reject anything that smells like inducement.
Our architecture (no provider money, family-initiated, post-admission, no PHI)
is the answer; lead with it.

## 16. Team (and the gap we'll close)

Ryan Currie, founder: builder + trained outbound seller; founder-led sales
until ~25 logos. The named gap: solo founder, no hospice/healthcare insider, a
recognized handicap for a B2B healthcare sale and the literal lesson of the
death-tech graveyard. Plan: recruit a former hospice ED or bereavement director
as advisor first, then paid first hire or cofounder, before the raise. Add
named credentialed reviewers (FD, estate attorney, grief clinician) to anchor
the YMYL content. Top-3 priority, not an afterthought.

## 17. Risks (the load-bearing ten)

| # | Risk | Mitigation | Early warning |
|---|---|---|---|
| R1 | **Willingness-to-pay fails** (the #1 unknown) | Conversion designed into the pilot calendar; price inside the for-profit margin and under signature thresholds; fallback per-family lane + sponsorship tier; §18 gates drop pricing before declaring the channel dead | Pilots end with praise but no signature by week 10 |
| R2 | **Sales cycle beats the calendar** (healthcare B2B averages ~12 months; our clock says paid-by-Dec) | Pilot-first entry (free, ED-signable); monthly Checkout as the smallest yes; "about to pay" defined strictly | The re-set tripwires: <10 discoveries by Sep 12; <2 pilots by Oct 1 |
| R3 | **Channel scar tissue** (Grace) | Architecture-as-answer; compliance packet leads the sale; insider advisor | The Grace objection surviving the compliance one-pager in >2 discoveries |
| R4 | **AKS/steering misstep or regulator contact** | Counsel clearance gates each launch state; post-admission design; payment-blind directory (§15) | Any partner-counsel redline on inducement language |
| R5 | **HIPAA drift** (convenience pulls toward hospice-transmitted data) | BAA-trigger conditions written; self-enrollment is the flow; "census upload to make it easier" is refused by design | Any partner requesting a census upload |
| R6 | **Year-2 renewal unknown** | Embedding: the tool in intake workflow + the proof report in their compliance file; QBR cadence; renewal thesis instrumented from case #1 | Portal logins decaying after month 2 |
| R7 | **Solo-founder capacity** | Tools for every founder task; three-questions weekly filter; pre-written hiring triggers | Founder-hours >15/wk on any one partner |
| R8 | **Data cold-start** (the Index can't clear its own n>5 gate) | Founder ingest cadence; consented community tier; honest-badge architecture degrades gracefully | <2 verified metros by Oct |
| R9 | **Competitor wake-up** (Empathy adds price advocacy; Renidy wins the channel) | Their payer conflict is structural; our outcomes corpus + channel trust are time-assets; if matched, become the neutral data layer they license | Empathy language shifting toward "lower the bill"; Renidy landing a multi-state operator |
| R10 | **Guardrail erosion under revenue pressure** | Guardrails as law in CLAUDE.md + this plan; billing code structurally excludes homes/insurers; the one unrecoverable mistake | Any draft that prices a guardrail |

## 18. Kill criteria & checkpoints (pre-committed, so momentum can't argue later)

- **No pilot signed by Oct 1** after ≥20 genuine discovery conversations → the
  hospice channel is mispriced or mistimed: shift lead channel to
  employers/EAP brokers within 30 days (the pre-authorized pivot), keep hospice
  as pull-only.
- **Pilot runs but won't convert to paid by Dec 31** (families served, savings
  documented, still no signature) → the willingness-to-pay hypothesis fails at
  this price structure: drop to the per-family micro-fee or grant-funded tier
  before concluding the channel is dead.
- **Median documented family savings < $1,500-equivalent across 10+
  instrumented cases** → the value claim is weaker than believed: reweight the
  pitch to time-saved + compliance-proof, and reprice.
- **Any guardrail breach or regulator contact** → stop, fix, document publicly.
  No milestone outranks the guardrails.

**The November full-time / raise checkpoint (go when green):** ≥1 paid
recurring contract (a 2nd in pilot); converting >1 in ~5 hospice conversations;
documented savings + satisfaction across ~10+ cases with a renewal signal;
free-tool traction + first AI/press citations climbing; runway covered by
revenue, ~12–18 months of savings, or a raise. Rule: don't quit on feeling or
on consumer sales; go full-time when these turn green.

## 19. Endgame

Base case: **premium acquisition** by an insurer, platform, or incumbent, from
strength. The category's acquirers are demonstrably active, and the graveyard
shows what to avoid: companies absorbed cheaply into funeral and insurer money
after running out of road (Cake, Everplans, Lantern, Farewill). This company's
design (default-alive economics, institution-paid recurring revenue, a dataset
that compounds with time) exists so our version of that conversation happens at
a recurring-data multiple, not as a distress absorption. The BATNA is real:
independence is a good business at hospice scale and a better one with the
employer channel. What survives any deal: the guardrails.

---

## Appendix — key facts & sources (verified August 2026)

- **Hospice channel:** 6,706 Medicare hospices (2024); 82% for-profit; 52.9% of
  Medicare decedents; $28.3B spend; margins 8.0% aggregate / +13.7% for-profit /
  −1.3% nonprofit; bottom two volume quintiles negative. _(MedPAC March 2026
  Report to Congress, Ch. 10.)_ FY2026 update +2.6%; FY2027 +2.3% with the new
  SSVI screen; MedPAC recommended a FY2027 freeze 17–0. _(CMS-1835-F;
  CMS-1851-F; MedPAC.)_
- **Bereavement mandate:** 42 CFR §418.64(d); not separately reimbursed
  (nonreimbursable cost center); historic spend ≤~1.4% of Medicare revenue.
  _(eCFR; CMS Benefit Policy Manual Ch. 9; MedPAC Mar 2013 Ch. 12.)_
- **Vendors hospices pay:** CAHPS vendor mandate (hospicecahpssurvey.org
  approved list); Help Texts (helptexts.com; GeekWire May 2024); Bereavement
  Management System $1,950–$2,750; doulas $1,500–$5,000 (Hospice News Nov
  2023); Betterleave hospice pivot (Hospice News Jul 2024); QliqSOFT/WellSky
  Outreach.
- **Comparables:** Empathy $72M Series C May 2025, $162M total, revenue
  tens-of-millions 3× YoY (Businesswire; Calcalist); Everest employer expansion
  Oct 2025 (Businesswire); Grace post-mortem (Kruger essay, Jan 2023); Cake →
  Foundation Partners Sep 2024; Lantern → Wellthy Nov 2024; Farewill → Dignity
  £12.9M, completed Feb 2025; Renidy (Hospice News Jul 21, 2026).
- **Legal:** OIG AO 00-3; 42 U.S.C. §1320a-7b(b); SSA §1128A(a)(5); OIG
  nominal-value policy (2016); Fla. Stat. §497.005/.381; Tex. Occ. Code
  §651.001(7)/.454; 32 M.R.S. §1402; Neb. Rev. Stat. §38-1424; **N.J.S.A.
  §45:7-65.3**; S.C. Code §40-19-20; Cal. B&P §7615–16; N.Y. PBH §3450; Va.
  Code §54.1-2806; FTC Funeral Rule ANPR 87 Fed. Reg. (Nov 2, 2022), no
  NPRM/final as of Aug 2026; 16 CFR §453.1(i); 45 CFR §160.103; §164.502(f)
  (decedent PHI, 50 years); OCR health-app guidance.
- **Consumer market:** ~3.0M deaths/yr → 3.6M+ by 2037 (CDC/NCHS); median
  funeral ~$6,280 cremation / ~$8,300 burial (NFDA); ~18% of homes post prices
  online; same-metro variation 100–200%+.
- **Full research memo with live links:** the 2026-08-16 payer-viability
  research (four tracks, ~150 sources); companion PDF
  `Honest_Funeral_Market_Research.pdf` (July 2026) in the repo root.

> **Substantiation note:** confirm every external-facing figure against its
> primary source before sharing. Replace any dated statistic with the current
> primary source.
