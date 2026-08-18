# Execution Plan — the selling quarter (Aug 18 → Dec 31, 2026)

_Companion to `docs/BUSINESS_PLAN.md` v3.0 (§14 selling test, §18 kill
criteria). This is the runnable version: week by week, with owners and gates.
Owner key: **F** = founder (only the founder can do it), **C** = Claude
sessions (delegate it), **F+C** = founder decides, Claude drafts._

## 0. The single objective

**One hospice paying in-product by Dec 31, 2026.** Operative plan: first
payment in December. Stretch: November. Everything below either fills the
pipeline, makes a signature legal, makes a payment possible, or makes the
pilot deliverable. Anything that does none of those waits until January.

## 1. The five workstreams (objectives → owners → gates)

| # | Workstream | Objective | Owner | Deadline | Gate it serves |
|---|---|---|---|---|---|
| A | **Sell** | 20 discovery conversations; 2–3 pilots signed; 1 paid conversion | F | rolling → Oct 1 → Dec 31 | §18 gates 1 & 2 |
| B | **Legal** | Counsel retained; UT anti-steering cleared; AKS memo; dual-frame pilot agreement; DE C-corp / d/b/a "Honest Funeral Co." | F+C | retained by Aug 29; deliverables before first signature | gates signatures |
| C | **Data** | SLC dataset ingested + directory vetted by Oct 1; Sacramento by Nov 30; Index-ready (≥2 verified metros) by mid-Q4 | F+C | Oct 1 (hard) | pilot deliverability; §18 gate 3 |
| D | **Product** (capped) | Billing surface; payment-blind directory audit; analytics; brand flip | C | Sep 15 | payment possible; AKS clean; November evidence |
| E | **Funding** | MBC Step-2 submitted; November full-time checkpoint on written gates | F | Nov | the December decision |

## 2. Week-by-week calendar

**Week of Aug 18 (restart week)**
- [F] Send the counsel outreach brief. Fixed-fee setup ask ($3–7.5k); add the
  d/b/a "Honest Funeral Co." item; drop the Open Farewell TESS spend.
- [F+C] Build the named target list, 20–30 hospices: Utah independents first,
  then mid/large regionals including for-profits; disqualify bottom-quintile.
- [F] First 10 outreaches sent (deterministic templates, CAN-SPAM-clean).
- [F, ~30 min] Apply Migration A + `npm run import:hospices`; set
  `ADMIN_EMAILS` in Vercel. The hospice finder must not demo empty.
- [F] Squarespace: permanent forward honestfuneralco.com → honestfuneral.co.
- [C] Flip `lib/brand.ts` to "Honest Funeral Co." (+ short-form style note).
- [F evenings] GPL day-one harvest begins from
  `docs/data/GPL_WORKLIST_2026-08.md`: the 20 direct URLs, then the FCA
  archive. Tag provenance + in-document effective dates.

**Week of Aug 25**
- [F] Discovery calls 1–5. Pitch order: CAHPS reputation → unfunded §418.64(d)
  mandate → staff-hours returned → free-and-neutral close. Ask every "no" for
  one intro (insider-advisor hunt starts here).
- [C] Assemble the sendable compliance packet (AKS one-pager, security & trust
  packet, pilot success-criteria template, proof-sheet template). [F] approves.
- [C] Build Day 8: Migration B + institutional Stripe behind
  `BILLING_LIVE=false`. Monthly price IDs $400/$800/$1,500 created by [F] in
  the Stripe dashboard; code never hardcodes amounts.
- [F] Call FCA of Utah (801-368-5884), openly, as allies.
- [F] Order the DOPL establishment roster (~$5); reconcile the worklist.
- Counsel retained by **Aug 29** (operative-plan deadline).

**Week of Sep 1**
- [F] Calls 6–10.
- [C] Payment-blind directory audit: verify no partner/claim status can affect
  hospice ranking, badging, or ordering anywhere a family chooses a hospice;
  write the firewall doc.
- [F+C] Pilot agreement + data-use grant to counsel (dual-frame review).
- [C] Analytics live (Plausible + Search Console) — the November checkpoint
  needs a measured reach curve.

**Week of Sep 8**
- [F] Calls 11–15. **Tripwire: fewer than 10 discoveries by Sep 12 →
  escalate cadence** (more outreach volume, second channel: UFDA contacts,
  hospice association lists).
- [F evenings] SLC ingest ≥50% of the ~45 unique GPLs; begin vetting homes
  into the directory (`active AND vetted`).

**Week of Sep 15**
- [F] Calls 16–20. First pilot signature chased to close. [F] Bind insurance
  (E&O + cyber) at the first signature.
- [C] Product freeze outside workstream D scope. Selling quarter discipline.

**Week of Sep 22**
- [F] Pilots 2–3 signed. SLC dataset complete; directory vetted for the pilot
  metro. **Tripwire: fewer than 2 pilots by Oct 1.**

**Week of Sep 29 — GATE**
- **Oct 1, §18 gate 1:** ≥20 genuine discovery conversations and ≥1 pilot
  signed, or the lead channel shifts to employers/EAP brokers within 30 days
  (pre-authorized pivot; hospice goes pull-only). Judged on the written
  definition, not vibes.

**October (weeks of Oct 6–27)**
- [F] Run every pilot family case by hand; instrument all of them (the ≥$1,500
  median-savings gate needs 10+ cases).
- [F] Week-2 cockpit-metrics conversation with each pilot ED.
- [F evenings, stall weekends] Sacramento pass using the worklist playbook.
- [F] MBC Step-2 in; YC decision prep for the ~Nov window.

**November (weeks of Nov 3–24)**
- [F] Week-6 mid-pilot reviews against written success criteria; first
  price-list preview, tier pre-selected by census.
- **November checkpoint (full-time / YC / raise), decided on the written
  gates:** ≥1 paid recurring contract with a 2nd in pilot; >1-in-5
  conversations converting; documented savings + satisfaction across ~10+
  cases with a renewal signal; reach curve climbing. Not feelings.
- [F+C] First Fair-Price Index release prepped (needs ≥2 verified metros;
  counsel-cleared claims; n>5 everywhere).

**December (weeks of Dec 1–29)**
- [F] Week-9 proof sheets + the monthly-Checkout ask (the smallest yes).
  "About to pay" counts only as a signed order form or an ED's written
  commitment with a start date.
- **Dec 31, §18 gate 2:** ≥1 paid conversion, or drop to the $60/family
  micro-fee lane ($2,880/yr floor) before declaring the channel dead.
- [F] December financing checkpoint per §13: bootstrap by default; raise only
  on green scorecard.

## 3. The weekly operating cadence

- **Daytime, every weekday: workstream A.** Calls and outreach own the
  calendar. Nothing on this plan is allowed to displace them.
- **Tuesday + Thursday evenings:** GPL ingest and directory vetting (~2 hrs).
- **Saturday morning:** data lane catch-up, scoreboard update, next week's
  target queue.
- **The three questions, every week** (from CLAUDE.md): did I grow reach, move
  an institution toward paying, and deepen the data?

## 4. The scoreboard (update weekly, judge monthly)

| Metric | Now (Aug 18) | Oct 1 bar | Dec 31 bar |
|---|---|---|---|
| Outreaches sent | 0 | 30+ | — |
| Discovery conversations | 0 | **20** | — |
| Pilots signed | 0 | **1–3** | — |
| Paying hospices | 0 | 0 | **1+** |
| Instrumented family cases | 0 | first cases | **10+** |
| Median documented savings | — | — | **≥$1,500** |
| Unique GPLs ingested (SLC) | 0 | **~45** | +Sacramento |
| Verified metros | 0 | 1 | **2+** (Index out) |
| Counsel deliverables | 0 | UT clearance + AKS memo + pilot agreement | d/b/a + entity done |
| MRR | $0 | $0 | **$400–800+** |

## 5. How the model is engineered to profit from hospices — not to stay free

The question this section answers: what stops "free to families" from quietly
becoming "free to everyone"? Seven mechanisms, each with its receipt.

1. **Only institutions can pay, and it is enforced in code.** The billing
   layer accepts `partner_type in ('hospice','employer')` and nothing else:
   there is structurally no way to invoice a family, a funeral home, or an
   insurer (BUSINESS_PLAN §10; the consumer payment path was fully
   decommissioned 2026-06-26 and CLAUDE.md forbids rebuilding it). The company
   cannot drift into the wrong revenue because the wrong revenue cannot be
   collected.

2. **The free layer is an input to the hospice sale, and it costs
   approximately nothing.** Serving a family completely costs $0.10–0.25
   measured (planning ceiling $1.00); the fixed base is ~$170–340/mo today
   (§11). Free-to-family is not a subsidy burning runway; it is the product's
   distribution (families arrive), its dataset (outcomes per case), and its
   trust story (the neutrality the hospice is buying). Every free family case
   makes the paid product more sellable; none of them can bankrupt us.

3. **What the hospice buys is not what families get free.** Families get
   navigation. The hospice buys the institutional wrapper around it: the
   partner portal, aggregate outcomes reporting, and documented proof that
   their unfunded 42 CFR §418.64(d) bereavement obligation was discharged,
   framed and invoiced as "bereavement support program — [tier]". That
   deliverable does not exist in the free layer and never will (§10; the
   partner reporting surfaces are L3 only).

4. **Free is time-boxed and calendared into a paid ask.** The only free
   institutional offering is the 60-day pilot, and its conversion is designed
   into the calendar, not requested at the end: week-2 metrics habit, week-6
   price preview, week-9 proof sheet + Stripe Checkout ask, with "about to
   pay" strictly defined (§10). A pilot cannot silently become a free
   customer; on day 60 it converts, drops to the micro-fee lane, or ends.

5. **Free-forever is forbidden by written policy.** The discount policy
   (§10, carried from v2 §7.7) explicitly disallows free-forever, per-referral
   anything, and success fees; the fallback lane ($60/family, $2,880/yr floor)
   is deliberately priced above the annual's effective rate so paying annually
   is the rational choice; the nonprofit answer is a sponsorship tier where a
   named third party pays, never $0. Every concession path still ends in
   revenue.

6. **The kill criteria make "nobody pays" a decision point, not a slow
   drift.** If no pilot signs by Oct 1 after 20 real conversations, the lead
   channel moves to employers, who pay more per logo. If pilots will not
   convert by Dec 31, pricing drops to the micro-fee lane before the channel
   is declared dead. If savings evidence is weak, the pitch reweights to
   time-saved + compliance-proof and reprices (§18). There is no scenario in
   the plan where the company keeps operating free-for-everyone indefinitely;
   every failure branch lands on a different payer or a different price,
   never on $0.

7. **The margin math makes hospice revenue convert to profit almost 1:1.**
   Gross margin is ~96–99%, so the P&L is a step function of logo count, not
   of usage: 2–3 small logos clear the infrastructure base (~$1.7k MRR),
   ~$21k MRR pays the founder at $120k, and the free layer's marginal cost is
   noise at every rung (§12). The company becomes profitable by selling,
   not by rationing the free product.

**The honest residual:** the one way this stays "free to everyone" is if no
institution ever pays, and the model's answer is not hope but the pre-committed
gates above plus two priced fallbacks (micro-fee lane; employer channel at
~$21–42k ACV). The remaining gap as of Aug 18 is operational, not structural:
the billing surface is unbuilt (workstream D, due Sep 15) and the selling
motion is unstarted (workstream A, starts this week). Structure is done;
execution is the quarter.

## 6. Explicitly out of scope until January

New product features beyond workstream D; the site-audit lane beyond A2
(≤ half a day/week); employer outreach before the Oct 1 gate says so;
chain/system deals; SOC 2 beyond vendor selection; any naming or domain work
(done); marketing spend (the loops + Index are founder+AI work, ~$0).

_Standing law underneath everything: the six guardrails; `OUTREACH_LIVE` stays
off; family-initiated activation only; post-admission delivery only; no
pretexting in data collection; 80/20 hospice/employer until five hospices pay._
