# Hospice-as-Payer Audit — the founder's direction vs. the site, the docs, and the law

> **Status: decision document, 2026-08-19.** Commissioned by the founder:
> *"ensure congruence for the payer being hospice… paid for by the hospice
> treating their particular people… they must receive a code or referral link
> from their hospice the second they enter the hospice… a full-service
> end-of-life planning system that helps source the best prices and reviews in
> the area based on your preferences and then helps in the whole process…
> check for legality of this direction."*
>
> Method: seven parallel code/doc audits covering every surface of the site,
> four legal research streams (repo legal corpus, federal AKS/CMP, state
> funeral law, HIPAA + state health-privacy), a synthesis pass, and an
> adversarial verification pass — six load-bearing legal claims re-verified
> against primary sources (three needed correction; corrections are
> incorporated below), and all fifteen high-severity code findings confirmed
> at file:line. **Not legal advice.** This exists to arm retained counsel —
> which the repo already treats as the gate to the first hospice signature.

---

## 1. The verdict up front

**The direction is not a pivot. It is ~80% the model this repo already
designed, documented, and drafted contracts for** — hospice pays, family free,
code handed at admission, family activates. `docs/legal/HOSPICE_SERVICES_AGREEMENT_DRAFT.md`
§1.1 already says *"Hospice may provide families with activation materials
(printed cards, a QR code, a link, or a claim code) only after admission, and
each family activates directly."* `app/partners/apply/page.tsx:48` already
markets *"Your team hands families a link during admission week."* The billing
plumbing (hospice-only Stripe subscription, invoice line "bereavement support
program") is built and dormant.

**Overall legality judgment: viable-with-conditions.** No statute, regulation,
or enforcement action found contradicts hospice-as-payer per se — and several
authorities affirmatively support it (hospices are federally *required* to fund
bereavement/psychosocial support, 42 C.F.R. 418.64(d); OIG has blessed
navigation platforms and post-admission free benefits in analogous advisory
opinions). But everything favorable is analogy: **no authority anywhere
addresses a hospice paying a third-party platform for a funeral-navigation
family benefit.** The repo's own AKS memo says it plainly: *"No authority found
prohibits the arrangement; no authority found blesses it specifically either."*

**Four phrases in the direction, taken literally, are where it stops being
viable.** Each collides with primary law, not just with house guardrails:

| # | The phrase | The problem | The compliant version |
|---|---|---|---|
| 1 | "paid for by the hospice **treating that particular patient**" | Per-patient pricing is the fee shape that (a) OIG volume-linkage hostility targets, (b) supplies Texas's "for compensation" element for unlicensed funeral directing, (c) reads as inducement under Florida's all-payer Patient Brokering Act (felony), and (d) pressures family-level attribution toward the hospice — the HIPAA business-associate trigger | **Flat, census-banded, fair-market-value subscription** — exactly what the legal drafts already chose. Hospice-as-payer: yes. Per-patient invoice: no (without counsel blessing a blinded structure) |
| 2 | "must **NOT be free in all its parts** to everyone" | Gating today-free tools behind a hospice code converts the benefit from a sponsored public utility (marginal remuneration ≈ $0) into **countable remuneration to that hospice's patients** under the Beneficiary Inducements CMP — and it is the one move the entire legal corpus has never analyzed | Sell the **institutional wrapper** (attribution, reporting, materials, staff orientation) and any **new** paid-tier capability — never re-gate what is free today, without a fresh counsel analysis and a site-wide claim rewrite first |
| 3 | "**the second they enter** the hospice" | Lawful in exactly one shape. Automatic enrollment or any hospice-pushed delivery using family contact info is (a) the Texas solicitation definition (reaches "any other entity" contacting the family of a person near death), (b) a written HIPAA BAA trigger, and (c) the Grace failure mode that scarred this channel | **Code/QR/card in the admission packet, post-election; the family activates.** Already built (`/plan-now?ref=CODE`, portal materials). "At admission" = the hospice hands it; never = the platform fires |
| 4 | "the **best** prices and **reviews**… based on your preferences" | "Best" rankings and home-level review scores forfeit the anti-steering defense (guardrail #3 is also state law), the OIG navigation-platform analogy (which turns on payment-blind ordering), the n>5+significance publish gate, and — if any home ever paid for placement — NY/VA/UT license-revocation exposure | **Family-set preference FILTERS over neutral, deterministic, payment-blind, disclosed ordering.** Comparison yes, recommendation never. Reviews are also a 100% missing capability (zero review data renders anywhere family-facing) |

**Restated in its viable form, the direction survives essentially intact:**
the hospice pays a flat, census-banded, FMV-documented subscription for a
bereavement-support program; families get the code in the admission packet
post-election and self-activate; the full-service layer is navigation and
education in which the family signs everything and every pre-death selection is
explicitly non-binding; presentation is preference-filtered but
neutrality-ordered; reporting back to the hospice is aggregate-only.

---

## 2. The direction, decomposed — what's built, what's missing, what collides

### 2.1 "The hospice is the payer" — ✅ congruent, built, and dormant

- **Payer identity is already law in code.** `lib/billing.ts:40`
  `billingEligible()` allowlists only `hospice | employer`; insurers and
  funeral homes are structurally unpayable (re-checked in the Stripe webhook).
  Every invoice line is hardcoded *"bereavement support program — [tier]"*.
- **The documented offer** (BUSINESS_PLAN §10, v3.0 2026-08-18): pilot $0/60
  days → Small (<50 ADC) $4,800/yr · Mid (50–100) $9,600/yr · Large (100+)
  $18,000/yr · multi-site $30k+; fallback lane $60/family-served quarterly
  (docs-only, deliberately priced above the annual).
- **But nobody can pay today.** `BILLING_LIVE` is off (`lib/billing-gate.ts:37`
  409s every checkout), the `2026-08-18-partner-billing.sql` migration is
  founder-applied-only and unapplied, no `STRIPE_PRICE_*` env ids exist, no
  partner has a tier assigned, and the marketing surface carries **no price a
  hospice can see** — the only offer on `/partners` is a free 60-day pilot and
  a demo form. BUSINESS_PLAN §2's own words: *"A hospice that said yes today
  could not pay us."*
- **Payment deliberately gates nothing.** The webhook never touches
  `partners.active`; a `past_due` or canceled hospice keeps full service
  (*"families are never leverage"*, `app/api/stripe/webhook/route.ts:36`).
  That's the designed inverse of "service conditional on the hospice paying."

**Bottom line:** the payer half of the vision needs no strategy change — it
needs the migration applied, counsel retained, Stripe prices created,
`BILLING_LIVE` flipped, and a price put in front of hospices.

### 2.2 "Treating that particular patient" — ⚠️ the fee-shape decision

The founder's phrasing names the payer correctly but implies a per-patient
unit. Verified state of the law and the repo:

- The repo is **internally split and has never reconciled it**:
  `docs/legal/AKS_CMP_MEMO_DRAFT.md` Condition 2 (*"Flat fees only; no
  per-activation, per-referral, or volume-linked component"*) and
  `HOSPICE_SERVICES_AGREEMENT_DRAFT.md` §5.2 (fee *"fixed in advance…does not
  vary with the number of families who activate"*) vs.
  `Honest_Funeral_Market_Research.pdf` Part 6 (*"Hospice pays, per family
  served — the Help Texts pattern — is the model this research supports,"*
  $25–$75/family) and `COMPLIANCE_ADDENDUM.md` §3 (contemplates both).
- **Correction from adversarial verification (important):** per-patient FMV
  fees are *not per se illegal* — the amended personal-services safe harbor
  (42 C.F.R. 1001.952(d), eff. 2021) requires the *methodology*, not the
  aggregate, be set in advance at FMV without referral linkage, and Help Texts
  sells per-family openly. Nor is flat automatically safe: OIG AOs **25-08**
  and **26-15** (both unfavorable, 2025–26) condemned *flat/subscription* fees
  that bought referral access — flatness is no defense when payment buys
  steering. What makes per-patient *materially riskier here*: (a) the platform
  runs a hospice directory, so volume-linked fees pattern-match OIG's
  long-standing hostility; (b) Fla. Stat. 817.505 (all-payer Patient Brokering
  Act, felony, no federal nexus needed) reads per-patient benefit-buying as
  inducement-shaped; (c) Tex. Occ. Code 651.001(7) defines funeral directing
  as arranging *"for compensation"* — per-patient fees make that element easy
  to prove for a specific death; (d) invoice-verification pressure pushes
  toward patient-level reconciliation with the hospice — the HIPAA
  business-associate trigger. (Note: aggregate blinded activation counts *can*
  be invoiced without exchanging PHI; the risk is audit pressure, not
  arithmetic.)
- **Recommendation:** keep the drafts' flat census-band structure as the
  default; put "can any per-patient form survive — census bands, or
  expert-blessed blinded counts?" to counsel as structuring question #1. Never
  bill off the per-code claim counts that already exist in the portal UI
  (`lib/partner/codes.ts:26` — they're currently disciplined as *"never a
  target to hit"*; wiring money to them would be literal per-referral pricing,
  the documented failure mode).

### 2.3 "Not free in all its parts to everyone" — 🔴 the central collision, and the corpus's blind spot

This is the one genuinely new thing in the direction, and it is the single
change that maximizes legal exposure while contradicting the most code.

**What the site promises today, as pinned law:**

- `lib/copy.ts:12` — `FREE_FOR_EVERY_FAMILY = "Everything here is free for
  every family — no referral, no code, no link needed."` Comments forbid
  retyping it; renders on the homepage (`app/page.tsx:111`), hospice finder,
  and hospice directory.
- `lib/copy.ts:28` + `components/ReferralCoBrand.tsx:79-80` —
  `FREE_WITH_OR_WITHOUT_LINK` + *"The link never unlocks anything."* Rendered
  on every referral arrival surface **and printed on the partner one-pager**
  hospices hand families.
- `app/our-role/page.tsx:172` — addressed to regulators and press: *"Every
  tool on the site is free to families **and always will be**."*
- `HOSPICE_SERVICES_AGREEMENT_DRAFT.md` §2(d) — covenant not to *"charge any
  family any amount for anything."* `LAWYER_BRIEF.md` §4.5 — "free to
  families, forever" is *"the company's central public claim"* counsel must
  verify site-wide. `HOSPICE_FAMILY_ROADMAP.md:526` — every feature ships
  *"free to the family with no exceptions."* `docs/ROADMAP.md:22` —
  *"Guardrail #2 already honored here — none of this is paywalled."*
- The old consumer paywall was built once and deliberately killed
  (2026-06-26); `app/paywall/page.tsx` is a redirect stub, and a repo-wide
  vitest fs-scan (`lib/__tests__/billing-guardrails.test.ts:198`) structurally
  forbids any file outside `app/api/stripe/` from importing the Stripe
  factory.

**The precise legal problem with gating (verified):** today, because every
family gets identical free tools, the marginal remuneration a hospice buys for
its patients is ~zero — the hospice buys attribution + reporting, i.e. an
institutional wrapper around a public utility. Gate the full tier to paying
hospices' families and the delta the code unlocks becomes **countable,
provider-linked remuneration** under 42 U.S.C. 1320a-7a(a)(5) (remuneration
includes *"items or services for free or for other than fair market value"*),
far above the $15/$75 nominal-value carve-out, strengthening both the CMP
inference and the AKS one-purpose inference (the hospice would be purchasing a
valuable exclusive patient benefit). Simultaneously it renders "free to
families, forever" **misleading** under FTC §5 / state UDAP (not literally
false — no family pays — but the full tier becomes unavailable to non-code
families at any price), falsifies the printed partner materials, and weakens
(not breaks) the unlicensed-practice defenses that lean on the
free-public-education posture. And — decisive for sequencing — **no document
in the legal corpus analyzes gating-without-charging at all.** The AKS memo
analyzes only the ungated design; `PAYWALL_RECOMMENDATION.md` analyzed gating
only under the dead family-paid model; `PRODUCT_SPRINT_2026-07-16` states the
prohibition (*"attribution + sponsorship, never access"*) without legal
analysis. It is the corpus's one blind spot, and the direction lands exactly
on it.

**Also the strategy cost:** the free layer's documented job is reach, AI/press
citations, and the crowdsourced data flywheel — *"Publish free and public
(only a public URL gets cited by journalists, Wikipedia, and LLMs)"*
(OPERATING_PLAN:187–188). The Fair-Price Index API ships
`isAccessibleForFree: true` machine-readably. Gating L1 doesn't just annoy
lawyers; it unplugs the acquisition engine and shrinks the n>5 benchmark
pipeline that guardrail #4 runs on.

**The three options, honestly stated:**

- **A. Status quo, sharpened (recommended now):** everything currently free
  stays free to everyone; the hospice buys the institutional wrapper —
  attribution, aggregate reporting, AI digest, coordinator tools, co-branded
  materials, staff orientation — plus the pilot→paid conversion.
  `EXECUTION_PLAN_2026-08` §5 already answers "why pay if it's free?" with
  seven mechanisms; mechanism 3 is the load-bearing sentence: *"What the
  hospice buys is not what families get free… does not exist in the free layer
  and never will."* Zero new legal exposure; this is what the drafted
  contracts and the AKS memo defend.
- **B. Sponsored premium tier (the direction's viable form — decide with
  counsel, later):** everything currently free stays free (delta on existing
  tools stays zero); a **new, never-was-free** concierge layer — durable
  admission-onward case object, cross-device continuity, human-advocate
  priority, managed follow-through — exists only via a hospice code. This is
  still hospice-exclusive family-visible value, i.e. still countable
  remuneration, so it needs the full AO 19-03 mitigation pattern locked in by
  contract (post-admission-only, never in any hospice marketing, family-
  initiated, FMV flat fee, bereavement framing) **and** a rewrite of the
  "free to families, forever" claim family-wide **before** launch. Legally
  unanalyzed today → counsel question, not a sprint item. The docs even
  pre-approved the implementation hook: extend `/api/partner/resolve` to
  return `{ name, tier? }` (`B2B2C_UX_RESEARCH_SYNTHESIS` §3 — "only build
  this when a real tiered-contract need exists").
- **C. Gate existing tools (do not do this):** maximizes CMP/AKS exposure,
  breaks the regulator-facing promise, kills the SEO/citation/data engine,
  falsifies printed materials, and re-treads the decommissioned-paywall path
  with a worse payer story.

### 2.4 "Code from their hospice the second they enter" — ✅ built, with one bright red line

**Congruent and already shipped**, end to end:

- Coordinator self-issues `HF-XXXXXX` codes: `/partner/r/[token]/links` and
  `/portal/links`; materials page generates QR posters, printed one-pagers,
  and email snippets all pointing at `/plan-now?ref=CODE`
  (`app/portal/materials/page.tsx:41`), with post-admission-only language
  already in the coordinator script: *"Hand it over, or post it, only where
  families already in our care will see it — the admission packet or any time
  after is fine. Never where families who haven't chosen us yet would see
  it."* (`materials/page.tsx:110`) — that's the AO 19-03 mitigation pattern in
  shipped copy.
- Family side: `?ref=` is remembered on-device 30 days
  (`lib/referral-codes.ts` — TTL comment: *"covers the hospice stay"*), stamps
  `partner_id`/`partner_code` onto negotiations and analyses best-effort,
  reporting-only, and the co-brand banner fuses the hospice name to the
  neutrality pledge.
- Solicitation law clears this shape **by construction**: the hospice
  initiates the handoff, the family initiates platform contact. Utah even has
  an express statutory blessing (§58-9-502(2): responding to a notification
  from a hospice/family representative is not solicitation).

**The red line, stated once:** *"the second they enter"* must always mean
**the hospice hands materials; the family activates.** The moment it becomes
automatic — an enrollment event at admission, a roster/census upload, an EHR
trigger, hospice staff entering family contact info, platform-initiated
outreach before the family acts — it is simultaneously (a) the Texas
solicitation definition (§651.001 reaches *"any other entity"* contacting the
family of a person near death — note: the repo's `BUSINESS_PLAN.md:531`
"licensee-scoped" characterization is **wrong** and needs correcting), (b) a
written HIPAA BAA trigger (`HIPAA_BA_POSITION_DRAFT.md` lines 29–34: any
hospice-transmitted family data, staff-assisted enrollment, census intake, or
EHR integration → BAA + full HIPAA program first), and (c) the literal Grace
failure mode (hospital EHR feed auto-texting on "Expired") that made this
channel paranoid — in a climate where the June 2026 DOJ takedown included a
hospice buying decedent data from a funeral-home employee.

**Real gaps under this component** (compliant-shape gaps, not violations):

- **Activation is the unmeasured link** (BUSINESS_PLAN §R: *"channel-survival
  law forbids every push mechanism… no activation-rate data exists"*).
  Coordinator adoption is unowned; the only backstop is the founder-side
  unclaimed-codes nudge on `/admin/partners`.
- **Attribution is fragile:** one browser's localStorage, 30-day TTL, claimed
  only at negotiation start. Different device / >30 days / cleared storage ⇒
  an unattributed case the paying hospice's report never sees. Account-level
  durable attribution (still family-initiated) is the fix.
- **No admission-date concept exists anywhere** in the schema (only
  `date_of_death`). Admission-anchored measurement would need a
  family-self-reported signal to stay HIPAA-clean.

### 2.5 "Full-service end-of-life planning system… helps in the whole process" — 🟡 half-built, two legal edges

**What exists is more than the strategy docs admit** (THE_WEDGE still preaches
"narrow and deep," but the build has outrun the rhetoric): `/plan-now` is a
real admission-week wizard (path → zip-adjusted fair range → wishes/faith →
benefit sweep → point person → printed plan + first-call card, hospice
co-brand); `/final-days`, `/end-of-life`, 32-task `/next-30-days`, MERP and
reverse-mortgage and Medicare-SEP guides, the 13-month bereavement cadence,
household sharing, per-assignee digests, the negotiate flow, and the after
arc.

**What's structurally missing for "a system":**

- **The admission plan is an island.** `honestfuneral.plan-now.v1` appears in
  no continuity mechanism — absent from `SHARE_KEYS` (`lib/share-keys.ts:13`),
  `HOUSEHOLD_KEYS`, and every phase-detector signal; the phase model has **no
  pre-death phase at all** (a mid-admission family classifies as "crisis").
  The bridge from admission-week answers to the at-need flow is a printed PDF;
  the family re-enters cold at the death. (Verification note: `/briefing`
  does read the plan — same-device only; the cross-device/share break stands.)
- **No enrollment/case object, no server-side journey state** — the journey is
  stitched from localStorage snapshots by design (the privacy architecture),
  which is exactly what makes it hard to package as a "program" a hospice
  buys. Any durable case object must remain family-created to preserve
  "the hospice transmits nothing."
- **No preference profile:** preferences live in four disjoint localStorage
  stores and never influence which homes are contacted —
  `lib/negotiation/directory.ts:47` selects by ZIP proximity only, capped at
  4 vetted homes.
- **Post-choice dead-ends:** post-decision guidance unlocks only via a closed
  in-platform negotiation (`gateUntilPaid`/`pickedHome` naming — dormant
  paywall scaffolding already flagged as a guardrail-#2 regression hazard);
  a family that picks a home outside the platform never unlocks the rest.

**The two legal edges of "full-service," verified:**

1. **Unlicensed funeral directing / "arranging."** TX 651.001(7) (*"acts
   associated with or arranging for the disposition… for compensation"*,
   Class B misdemeanor) and SC 40-19-20(19)(d) (*"making arrangements at or
   before the time of death, financial or otherwise"*) are broad enough that
   the founder's phrasing supplies missing elements: hospice payment adds the
   compensation nexus; "from admission onward" adds the pre-death window.
   Enforcement history (Heritage Cremation/Legacy multi-state actions; 2026 NY
   AG indictment) targets sellers/arrangers who take custody of the
   transaction — never pure publishers/educators — which is the line the
   architecture must keep: family signs everything, platform forms no
   contracts, holds no funds, sells no merchandise.
2. **Preneed law is the sharpest newly-relevant risk of the pre-death
   window.** FL 497.452(1)(a) (*"No person… may sell, advertise to sell, or
   make an arrangement for a preneed contract"* — any person, felony-grade
   ch. 497 regime), UT 58-9-501(4) (criminal for any person; a preneed
   arrangement is anything *"sold in advance of the death"*), TX Fin. Code
   ch. 154. The shipped product already operates pre-death (wizard "Planning
   ahead" timing; Terms authorize *"preplanning for yourself or an identified
   individual"*). The platform stays outside these statutes only while every
   pre-death selection is documented as **explicitly non-binding** and the
   platform never locks a price or completes an arrangement with a home.
   "Full-service from admission" makes this the first per-state counsel
   opinion to buy (FL/TX/UT).

Also: the CoP framing cuts both ways — 42 C.F.R. 418.64 makes bereavement
support a *core service* hospices must provide *"directly by hospice
employees,"* so the contract must position the platform as a **supplemental
resource supporting the hospice's own program**, never an outsourced
replacement, and never the hospice "buying the funeral" (funeral goods are
excluded from the Medicare benefit).

### 2.6 "Best prices and reviews, based on preferences" — 🔴 as phrased, no; as filters, yes

- **"Best" is structurally banned today**, on purpose, everywhere: results
  order by quoted price ascending with the anti-steering disclosure rendered
  (*"Ranked by the price they quoted you — nothing else"*), compare-quotes
  renders in entry order (*"no ranking, sorting, winner badge, or
  recommendation anywhere"*), `ANTI_STEERING_EVIDENCE.md`'s counsel exhibit is
  the *zero grep hits* for "recommended/best match/top choice," and a vitest
  word-ban pins partner/billing surfaces against "featured/recommended/
  sponsor." This is also the property OIG credited in the favorable
  navigation-platform opinions (AO 19-04, 23-04: ordering driven by
  user-centric criteria, not by who pays) — i.e., neutrality is not just
  guardrail #3, it's the load-bearing fact in the closest favorable federal
  precedent, and (via NY PBH §3450 / Va. §54.1-2806 / Utah aiding statutes)
  payment-blindness is state-law compliance too.
- **Reviews are a zero-capability:** the only review-like data in the entire
  schema is `funeral_homes.google_rating`/`google_review_count`, rendered
  exclusively in the admin vetting UI. No collection, no display, no
  testimonials table. Home-level quality claims are additionally parked behind
  the n>5 + statistical-significance gate (`PRODUCT_PLAN_2026-Q3:212`) with
  named defamation/trade-libel exposure.
- **The viable version, precisely:** family-set preference **filters** (faith,
  language, distance, service type, budget) over the neutral candidate set,
  with deterministic, payment-blind, on-screen-disclosed ordering — "here are
  the homes matching what you told us matters, in [disclosed order]; you
  choose." That is reconcilable with every promise on the site. A platform
  "best pick," a ranked list by quality score, or sub-threshold review scores
  is not — and "sources the best prices" is fine when it means the negotiate
  flow's actual mechanic (gather real itemized quotes, show the fair-range
  math, flag the overcharges) rather than a superlative about homes.
- **Capability gap under any version:** per-home local price inventory is
  thin — pricing is a modeled national catalog with regional multipliers
  (`lib/pricing-data.ts:4` warns against representing it as locally
  verified), zero GPLs ingested, vetted directory empty as of 2026-08-18
  (BUSINESS_PLAN gate: SLC dataset by Oct 1). Real "prices in the area" come
  from the L2 outreach flow, which needs the directory populated.

---

## 3. Legality — the full breakdown

### 3.1 The six verified claims

Each was attacked by an independent adversarial verifier against primary
sources (2026-08-19). Corrections are the operative versions.

| # | Claim (operative version) | Risk | Verdict |
|---|---|---|---|
| C1 | Funeral goods/services are payable by **no** federal health care program, so the funeral-selection side of the product sits entirely outside the federal AKS; the only federal inducement vector is hospice selection/retention (CMP + AKS on the hospice benefit itself). Verified exhaustively — VA burial, FEMA, SSA $255, state burial funds all fall outside "federal health care program"; 2025–26 DOJ hospice/funeral takedowns all charged inducement into the *hospice* benefit, never funeral selection. | favorable | **confirmed** |
| C2 | Post-admission-only delivery + zero pre-admission marketing + family self-activation is a defensible CMP/AKS posture **without any safe harbor actually covering it** — nominal-value caps at $15/$75 (still current); the promotes-access exception was limited in 2016 to Medicare/Medicaid-payable items; the position rests on AO 19-03/00-03/12-17 analogies plus the 418.64(d) procurement framing; hospice election is revocable (42 C.F.R. 418.28) and transferable (418.30), so "already admitted" never fully moots influence. | high | **confirmed** |
| C3 | Per-patient pricing is **materially riskier** than the flat census-tier fee the legal drafts mandate — but not per se indefensible (1001.952(d) requires methodology-set-in-advance FMV, not flatness; AOs 25-08/26-15 actually condemned *flat* fees that bought referral access, so flatness is no defense either). The repo is genuinely split (legal drafts: flat-only; market research: per-family) and counsel must reconcile. Per-family invoicing does *not* strictly require family-level attribution (blinded counts are feasible); the real HIPAA risk is audit pressure toward patient-level reconciliation. | blocker → high (as corrected) | **needs-correction** (corrected above) |
| C4 | Whether a hospice that **pays for, co-brands, and distributes** the platform at admission (as part of its own 418.64(d) obligation) makes the platform a HIPAA **business associate is genuinely unresolved** — and OCR's recommend-vs-offer app-scenario distinction **cuts against** the repo's non-BA position (the non-BA scenarios all lack the hire/payment fact present here). The position's solid leg is the *separate* no-health-information element of the BA definition — the exact paragraph the repo's own draft flags to "pressure-test hardest." If on-behalf-of is found, family-entered data becomes PHI and the "no PHI" recital is circular. | high | **needs-correction** (corrected above) |
| C5 | Gating today-free tools converts the benefit into countable provider-linked remuneration (value = the delta the code unlocks, far above nominal), strengthening the CMP/AKS inference — **and no document in the corpus analyzes gating-without-charging.** Corrections: gating would not literally breach the never-charge covenant (which fails to reach the move at all — a drafting gap); it makes "free forever" *misleading* rather than false; it *weakens* rather than breaks the activity-based licensing defenses. | blocker (for the gating move as phrased) | **needs-correction** (corrected above) |
| C6 | A "full-service EOL planning system from admission onward" stays outside unlicensed-funeral-directing and preneed statutes **only while** the platform sells nothing, holds no funds, forms no contracts, and documents pre-death selections as expressly non-binding — the pre-death window is where the any-person statutes live (FL 497.452; UT 58-9-501(4); SC "at or before the time of death"; TX "for compensation"). Necessary conditions, not automatically sufficient: the platform must also avoid itself "making arrangements" (e.g., transmitting family selections to homes as commitments, coordinating disposition logistics). | high | **confirmed** |

### 3.2 Federal (AKS · CMP · CoPs · OIG · Funeral Rule)

- **The frame the repo chose is the correct one** (independently confirmed):
  funerals aren't federally payable → the danger vector is the free family
  benefit inducing *hospice* selection/retention, primarily exposing the
  **hospice customer** — which means pilot hospices' compliance officers will
  diligence exactly this, and the platform carries derivative
  (conspiracy/aiding) exposure and cannot treat it as "the hospice's problem."
- **The affirmative regulatory hook is real:** hospices must run an organized
  bereavement program through 13 months post-death, unfunded, inside the
  per-diem (42 C.F.R. 418.64(d)); several states *require* pre-death family
  support in hospice licensing (GA, CA, ME, UT R432-750). "The hospice buys a
  bereavement/psychosocial-support resource" is a purchase inside an existing,
  mandated spending category — with the supplemental-not-core caveat above.
- **No exception fits; the mitigation pattern is the defense:** AO 19-03's
  factors (already-selected patients, unadvertised, tailored to a legitimate
  goal) are persuasive precedent, not safe harbors, and must become contract
  terms with audit/termination rights against a hospice's marketing team.
- **Guidance is about to move:** the promised hospice ICPG has not issued as
  of Aug 2026 (operative guidance is still the 1999 CPG, which lists patient
  inducements as a hospice risk area). An ICPG could drop mid-pilot and reset
  compliance appetites. The company's own OIG advisory-opinion request on the
  frozen pilot design is the only arrangement-specific certainty available —
  months-long, requestor-binding, effectively unappealable if unfavorable:
  a deliberate strategic decision for counsel.
- **FTC Funeral Rule:** binds funeral *providers* (16 C.F.R. 453.1(i)), not
  the platform; invoking families' GPL rights is unproblematic federally. The
  2022 ANPR has produced no amendments (only a routine PRA notice, Jan 2026).
  Watch-item: mandatory online price disclosure would commoditize part of the
  GPL-collection moat — a business consequence, not a legal one.

### 3.3 HIPAA + state health-privacy

- **The bare handoff is clean as built:** hospice hands code, family
  activates, hospice transmits nothing → no covered-entity or BA status from
  the handoff itself; a bare code mapping to the *hospice* is not PHI.
- **The BA question is the company's single most load-bearing assumption and
  it is weaker than the repo thinks** (C4): payment + co-branding +
  admission distribution + "discharges the hospice's 418.64(d) obligation"
  reads closer to OCR's *offered-by-or-on-behalf-of* (BA) scenarios than its
  *recommended* (non-BA) scenario, which is expressly conditioned on the
  provider *not* having hired the developer. The surviving defense leg is that
  nothing the platform handles is individually identifiable *health*
  information — in tension with (a) the AKS framing that the service supports
  the hospice's bereavement-counseling obligation and (b) decedent-name +
  hospice-attribution data (decedent PHI runs 50 years). This is counsel
  question #1, and the AKS framing and the HIPAA framing must survive in the
  same services agreement.
- **The written BAA trigger list is the right bright line** (rosters, staff
  enrollment, EHR, named-family visibility, family-level reporting,
  auto-enrollment at admission). Death opens no data channel: post-death
  reporting stays aggregate, for 50 years.
- **The marketing rule actually favors this model:** "financial remuneration"
  under 45 C.F.R. 164.501 means payment flowing *to* the covered entity *from*
  the vendor whose product is described. Here it flows the other way, so the
  hospice's recommendation isn't authorization-requiring marketing — and the
  admission-packet handoff is independently exempt as face-to-face
  (164.508(a)(3)(i)(A)). **Guardrail #1 does double duty:** the moment any
  value flows platform→hospice (free pilot? discounts tied to distribution?),
  this analysis degrades — counsel should look at whether even the free pilot
  counts as in-kind remuneration for the non-face-to-face channels.
- **Small-cell gap found in shipped code:** `familiesHelped`,
  `priceListChecks`, and per-code claim counts sit **outside** the n≥5
  suppression gate (`lib/partner/report-data.ts:28-35`,
  `lib/partner/codes.ts:26-39`). At pilot scale (n=1–4 for months), a labeled
  code with claims=1 lets a hospice infer which family activated — eroding
  the aggregate-only representation counsel is being asked to bless. Extend
  the suppression gate and covenant a minimum cell size; never issue codes
  per-family or per-nurse at pilot scale.
- **State law reaches the platform directly regardless of HIPAA:** WA My
  Health My Data (private right of action, no HIPAA-entity exemption, in
  force) plausibly covers a family member's use of a bereavement/EOL service
  with a hospice-attribution code as consumer health data; NV and CT are
  parallel. Before knowingly serving WA/NV/CT through the hospice flow: a
  consumer-health-data policy, opt-in consent surfaces, and zero ad-tech on
  grief/bereavement/hospice-linked pages (also the FTC Health Breach
  Notification Rule exposure). The grief self-check's stores-nothing design
  is the right instinct; keep it.

### 3.4 State funeral law (the corrected map)

- **The four-state solicitation framing in CLAUDE.md is wrong in both
  directions and should be corrected before the counsel packet goes out:**
  FL's at-need ban is licensee-scoped and post-death (anchor: §497.005
  definition + §497.152 discipline; §497.164 is licensee rulemaking — fix
  `LAWYER_BRIEF.md:243`); ME is preneed-only and licensee-only; NE is
  licensee discipline. The two that actually matter for a platform: **TX**
  (§651.001 solicitation reaches *"any other entity"* contacting the family
  of a person near death — fix `BUSINESS_PLAN.md:531`) and **NJ** (45:7-65.3,
  any person, in-facility, expressly covers "the making of at need or preneed
  funeral arrangements" — open questions whether home hospice is a "similar
  health care facility" and whether a hospice worker handing a paid platform's
  packet is the platform's "agent"; resolve before any NJ presence).
- **Family-initiated activation clears every solicitation statute found** —
  it is the design's load-bearing fact, and Utah blesses it expressly.
- **Unlicensed practice + preneed:** covered in §2.5 — the pre-death window
  is where any-person statutes live; non-binding documentation + family-signs-
  everything + no funds/contracts/merchandise is the defense, necessary but
  not sufficient (also never transmit family selections to homes as
  commitments).
- **Supply-side poison confirmed:** NY PBH §3450 and Va. §54.1-2806 make
  funeral-patronage payments license-revocation offenses for homes; Utah
  mirrors with aiding exposure for the platform. Any future "best/featured"
  surface a home paid to appear in is state-law radioactive on both sides.
- **FL Patient Brokering Act (§817.505)** is the sleeper: all-payer, felony,
  no federal nexus — it makes flat-fee structure and post-admission-only
  delivery *state criminal law* hygiene, not just federal optics.
- **Merchandise tripwire:** the moment the platform sells caskets/urns or
  takes payment for goods, funeral-director licensing attaches in OK/GA-style
  states and the "we sell nothing" defense weakens everywhere. Keep the
  advice+data line absolute.

### 3.5 What only retained counsel can close (the ask list, prioritized)

1. **HIPAA BA position** (the decisive one): does paid + co-branded +
   admission-distributed convert the family relationship into "on behalf of"?
   Can the AKS bereavement-procurement framing and the HIPAA consumer-service
   framing coexist in one services agreement?
2. **Fee structure:** can any per-patient form survive (census bands fixed in
   advance; expert-blessed blinded counts)? What FMV documentation must exist
   before the pilot contract? Does an activation-count invoice at n<5 itself
   constitute an identifiable disclosure?
3. **CMP reach:** does "remuneration to any individual eligible for benefits"
   reach value running to the *family* rather than the patient — and if
   gating proceeds, is countable remuneration the full service value or the
   delta over the public tier?
4. **Gating-without-charging** (the corpus blind spot): effect on the
   licensing analyses, the Utah CSPA posture, and the "free to families,
   forever" claim; what claim rewrite must precede any gating.
5. **Advisory-opinion strategy:** file on the frozen pilot design before or
   after pilot #1, weighing timeline, requestor-only binding, and the pending
   hospice ICPG.
6. **State constructions:** TX §651.001(7) "for compensation" under a
   hospice-paid engagement + the exact operative TX solicitation section;
   SC §40-19-20(19)(d) reach; UT "facilitating a disposition" (ask DOPL or
   strategically don't); FL preneed line for platform-assisted pre-death
   planning; NJ agent/facility questions.
7. **Contract drafting:** clauses locking the AO 19-03 mitigations +
   audit/termination rights; tighten the aggregate-only covenant with a
   minimum cell size on the currently unsuppressed counts.
8. **Hospice-side exposure** ("the question that kills a pilot if missed"):
   the hospice's own AKS/CMP/brokering exposure + the proactive compliance
   packet to hand its compliance officer; Utah R432-750 constraints.
9. **Disclosure:** should the family-facing flow say "your hospice paid for
   this" — does disclosure cut or add inducement risk; is it required under
   any state consumer-protection theory? Does even a free pilot count as
   platform→hospice remuneration under the HIPAA marketing rule?
10. **Consumer-health-data overlay:** WA MHMDA / NV / CT consent surfaces and
    policy before scaling the hospice flow; FTC HBNR coverage given the grief
    features.

---

## 4. Site congruence map — what the audit found, area by area

All high-severity findings below were independently re-verified at file:line.

| Area | Payer-congruence today | Biggest finding |
|---|---|---|
| Marketing/trust pages | Payer story present but **generalized and internally contradictory** | FAQ says *"no one pays us anything yet"* (`app/faq/page.tsx:75`) while privacy asserts as present fact *"Families never pay us. Hospices and employers do"* (`app/privacy/page.tsx:38,153`) and the homepage says *"are funded by the institutions we partner with"* — pick one tense; the privacy claim is the riskiest. Also `app/terms/page.tsx:110` §4 reserves **compensated third-party referrals** (insurance/financing/legal), contradicting the FAQ/about "never" claims and grazing guardrail #1 — delete or narrow it. |
| L1 free tools | Uniformly free, anonymous, ungated — **by pinned law** | Full inventory of ~60 "free" claims across metadata/UI/print compiled (change surface if positioning shifts). Gating would also unplug the SEO/citation/data roles these pages are documented to serve. |
| EOL planning surface | Closest existing asset to the vision (`/plan-now`) but **not a system** | The admission plan is an island — no continuity into share links, household view, phase detection, or the at-need flow; no pre-death phase exists; no enrollment/case object anywhere. |
| Negotiate flow (L2) | Kill-switch (`OUTREACH_LIVE`), vetted-only directory, consent gates, price-ascending neutral results all **intact and verified** | Attribution is reporting-only by contract and fragile (30-day single-browser localStorage). Stale pre-decommission copy in the failure-alert path (`lib/negotiation/send.ts:103` "paid negotiation… refunded"). |
| Partner layer (L3) | Activation mechanics fully built; **code deliberately unlocks nothing**; no admission-date concept; hospice transmits nothing (verified clean, incl. consent-drop of the claimant's own email) | Two hygiene items: `negotiate/start` stamps attribution when the *code* is active without checking the *partner* is active (paused partners keep accruing claims); `/partners` + ProofSheet market "referral conversations/reputation" value while materials forbid pre-admission use — reconcile the two postures for counsel. |
| Money | Consumer path verifiably dead (redirect stubs + repo-wide Stripe-import test pin); institutional billing complete and **dark** | `BILLING_LIVE` off, migration unapplied, no prices, no tiers, free-pilot-only marketing: today the entire L3 product is free to an approved hospice indefinitely. "Invoiced by arrangement" copy has no backing mechanism. |
| Strategy docs | Coherent and mostly congruent with the direction's viable form | `docs/ROADMAP.md:34` still says L3 "does not exist" (stale — BUSINESS_PLAN v3.0 is current); the per-family-pricing split (legal drafts vs market research) is unreconciled; THE_WEDGE's "narrow and deep" rhetoric lags the shipped breadth. |

**Citation-hygiene fixes before any counsel packet ships:**
`LAWYER_BRIEF.md:243` (FL anchor → §497.005/§497.152), `BUSINESS_PLAN.md:531`
(TX reaches "any other entity"), CLAUDE.md channel-rules four-state framing
(ME preneed/licensee-only; NE licensee discipline; **add NJ** as the broad
any-person statute), `docs/ROADMAP.md` L3 status.

---

## 5. The workplan

**Phase 0 — decisions (founder) + counsel (the existing gate, now sharpened).**
1. Ratify the restated direction (§1): hospice pays flat census-band FMV;
   code-in-packet at admission; family activates; navigation-not-arranging;
   filters-not-rankings; aggregate-only reporting.
2. Decide the free/gated question as **A now, B as a counsel-gated roadmap
   item, never C** (§2.3).
3. Retain counsel (shortlist + outreach email already drafted in
   `docs/COUNSEL_SHORTLIST_2026-08.md` / `COUNSEL_OUTREACH_EMAIL.md`) with the
   §3.5 ask list; fix the citation-hygiene items first.

**Phase 1 — congruence fixes, safe to ship now (no legal exposure, no
strategy change).**
- Resolve the payer-tense contradiction (FAQ vs privacy vs homepage) into one
  honest formulation.
- Delete/narrow the Terms §4 compensated-referral carve-out.
- Update `docs/ROADMAP.md`'s stale L3 section; reword `send.ts`'s stale
  paid/refund alert copy; align the partner-active check in
  `negotiate/start`'s attribution path.
- Extend the n≥5 suppression gate to `familiesHelped`, `priceListChecks`, and
  per-code claim counts; add the minimum-cell-size covenant to the agreement
  drafts.
- Reconcile the ProofSheet/partners "referral reputation" copy with the
  materials page's pre-admission prohibition.

**Phase 2 — make "the hospice pays" true (already scheduled; the direction
just raises its priority).** Apply the prod migrations; retain counsel
(gates the signature, not the build); create the three Stripe prices; set
env; flip `BILLING_LIVE`; add a real pricing/packaging section + post-pilot
terms to `/partners`; add partner-facing terms (MSA/order-form surface);
populate the SLC GPL dataset + vetted directory (Oct 1 gate) so the at-need
flow can run a real case.

**Phase 3 — the admission-onward spine (congruent under every option, worth
building regardless of the gating decision).**
- Bridge `/plan-now` into the journey: add its key to SHARE_KEYS/household
  payload/phase-detector; add a pre-death phase; carry the plan into the
  negotiate wizard so the family never re-answers at the death.
- Durable, account-level, family-initiated attribution (survives devices and
  30 days); optional family-self-reported admission date for measurement.
- Unified preference profile; preference **filters** on the neutral candidate
  set with disclosed deterministic ordering.
- Close the post-choice dead-end (rename the `gateUntilPaid` scaffolding away
  from paywall semantics; let outside-chosen-home families unlock guidance).
- Coordinator activation kit (the unowned link): admission-packet checklist,
  laminated card, measured-but-never-pushed activation follow-through via the
  existing founder-side nudge.

**Phase 4 — only after counsel: the sponsored tier (option B) and any
review-like surface.** Tier via `{ name, tier? }` on `/api/partner/resolve`;
new-capabilities-only exclusives; site-wide claim rewrite first. Reviews only
as n>5+significance home-level data with defamation review — or not at all;
preference filters deliver most of the felt value without the exposure.

---

## 6. The one-paragraph answer

Hospice-as-payer is the right direction and it is already this company's
documented, drafted, and mostly-built model — the audit found the payer
identity congruent everywhere that matters, the admission-code handoff built
end-to-end in its one legal shape, and the revenue merely switched off, not
missing. The law supports the model's skeleton and rewards exactly the
architecture already shipped (post-admission delivery, family activation, zero
hospice data, payment-blind neutrality, aggregate reporting); what it
punishes is precisely the four literal phrases — per-patient pricing, gating
today-free tools, automatic enrollment at admission, and "best" rankings —
each of which converts a defensible position into the highest-risk variant of
an open legal question. Build the spine, flip on billing, fix the copy
contradictions, hand counsel the sharpened question list, and sell the
restated version: *your hospice pays a flat bereavement-support subscription;
your family gets the code in the admission packet and everything it needs,
free, from that moment through the year after — and nobody, ever, is steered.*
