# Honest Funeral — Tactical Operating Plan

> **This is the company bible.** One thesis, every function, run it off this.
> From a neutral family-side advocate to the institution-paid source of truth
> for American death care.
>
> Ryan Currie, Founder · June 2026 · v1 · Built on nine deep-research streams.
> Canonical copy of the operating plan PDF, committed to the repo so every
> plan, doc, and agent aligns to it. Governance summary lives in the root
> [`CLAUDE.md`](../CLAUDE.md); the realigned execution plan lives in
> [`ROADMAP.md`](ROADMAP.md).

**The thesis in one sentence:** build the free, neutral source of truth for
funeral pricing that every grieving American can use, deliver the hands-on help
through the institutions that already serve the dying and will pay for it, and
compound a proprietary outcomes dataset into a moat and an eventual premium
acquisition — **never taking a dollar from the funeral homes we judge.**

---

## 0. How to use this document

The operating manual for the whole company. Read Parts 1–2 once to lock the
thesis. Live in Parts 5 (sales), 11 (operating rhythm), and 12 (roadmap) day to
day. Revisit Part 13 (risks) and Part 10 (the scorecard) monthly. Treat Part 14
(the guardrails) as non-negotiable law.

You are building three things at once — a **free source of truth** (reach +
data), an **institution-paid service** (revenue), and a **proprietary dataset**
(the moat). They feed each other. Every week ask: did I grow reach, did I move
an institution toward paying, and did I deepen the data? If a task doesn't do
one of those three, it's probably a distraction.

**Legal/compliance note.** Several sections flag items for an attorney
(anti-steering law, hospice data/HIPAA, claims substantiation, contracts).
These are real and load-bearing. This document tells you what to ask; it is not
legal advice. Get a startup attorney with healthcare + consumer-protection
familiarity before the first institutional contract or any handling of PHI.

---

## 1. The thesis and the north star

**Mission.** No family should be overcharged, misled, or alone at the worst
moment of their life. Honest Funeral is the neutral guide through death in
America — clear prices, straight answers, and someone on the family's side,
beholden to no one but them.

**Vision.** A country where funeral pricing is finally transparent and every
grieving family has an honest guide — so no one is ever exploited in grief
again.

**What we believe (the thesis, expanded):**

1. **The pain is enormous and permanent.** ~3M Americans die a year, rising
   past 3.6M by 2037. Median funerals run $6,280–$8,300; identical services
   vary 100–200%+ in the same metro; only ~18% of homes post prices online and
   the FTC still doesn't require it. PE roll-ups keep raising prices. The
   exploitation is structural and durable.
2. **Neutrality is the only durable advantage.** Every comparison site is paid
   by the homes; every executor is a vendor; Empathy serves the insurer. The
   seat that is neutral, executes, and is open to everyone is empty. That seat
   is ours — and it's defensible only as long as we take no money from funeral
   homes or insurers.
3. **The grieving family is the wrong payer.** At-need is once-in-a-lifetime,
   grief-state, zero-repeat — the worst acquisition surface in the economy. It
   buried Halolife, Grace, Tulip, Cake, Willing, and more. We make the family
   the beneficiary and an institution the payer.
4. **The institutions that serve the dying will pay.** Hospices have a federal
   duty (13 months of bereavement support, 42 CFR 418.64) and no money to do it
   well; employers have a bereavement gap and can pay. Insurers want beneficiary
   goodwill but are a distribution / acquisition partner, **never our payer**.
   Hospices and employers are the survivor-pattern payers whose interests align
   with the family's.
5. **Data + trust is the moat, not the price list.** Public prices are
   scrapeable. The proprietary OUTCOMES layer — what families actually paid,
   what advocacy negotiated, which homes flex — exists nowhere else, and the
   conflict-free brand compounds over time. Together they make us the cited
   standard (the Carfax / FAIR Health move).
6. **Revenue is fuel; the exit is real.** The base-case ending is acquisition by
   an insurer, platform, or incumbent. Run it pure while it's ours and take the
   best offer when ready. The work between now and then is to build what an
   acquirer can't replicate: trust and data.

**Positioning.** "Empathy is the insurer's concierge. We are the family's
advocate." We are the only player paid by no one with a stake in the funeral
price — the one thing no funded incumbent can copy without breaking its own
model.

---

## 2. The strategy: three engines and the moat

The company runs on three engines that compound. Each week of work should feed
at least one.

| Engine | What it is | What it produces |
|---|---|---|
| **1. Source of truth** | Free price tools, guides, and the Fair-Price Index | Reach, brand, AI/press citations, and the data flywheel — cheap acquisition |
| **2. Family service** | At-need advocacy + after-death navigation, lean and instrumented | Proof of neutrality, savings case studies, and the proprietary outcomes data |
| **3. Institutional revenue** | B2B2C contracts with hospices, then employers (insurers distribute + acquire, never pay) | Recurring revenue, distribution, and the warm pool of acquirers |

**The moat, stated plainly** — three real powers, all resting on one rule (no
funeral-home / insurer money):

- **Counter-positioning** — strongest today, but a 3–5 year window: no one paid
  by homes or insurers can be the neutral arbiter. Use the window to build the
  durable moat below.
- **Trust / brand** — the durable one, built over years of conflict-free
  behavior (the Consumer Reports / FAIR Health model). As a for-profit, your
  track record IS the structure.
- **Conflict-free embedding** — switching costs once you're built into
  hospice/employer workflows.

The data truth: the price list is not the moat (request-public by law; the FTC
wants it public). **The outcomes layer is.** Instrument for it from day one.

---

## 3. The product

Three layers. There's already a Next.js app with much of layer 1 built — extend
it. Build layer 3 new; it's what you sell.

**Layer 1 — Free public (acquisition + data + authority)**
- Fair-price lookup + "is this quote fair?" checker — the before-the-death hook
  families return to (the Zestimate mechanic).
- Pillar guides: "What to do in the first 72 hours," "How much does a funeral
  cost," "After-death admin checklist," plus faith, veterans, benefits.
  Answer-first, statistic-led, expert-reviewed, schema-marked.
- The Fair-Price Index page + methodology page + trust spine
  (no-funeral-home-money pledge, named reviewers, mistakes page).
- Programmatic local pages — one per metro/home from the dataset.

**Layer 2 — Family service (lean, instrumented — the data engine)**
- At-need advocate flow — invokes the family's FTC right to itemized GPLs,
  returns neutral side-by-side quotes. Kept free/low-cost. Its real job is data.
- **Outcomes instrumentation (critical):** capture for every case — listed
  price, quoted price, negotiated price, what the family chose and paid,
  hidden-fee incidents, and a satisfaction score.
- After-death navigation — certificates, account-closing, benefits checklist.

**Layer 3 — Institutional (the sellable product — build new)**
- Partner portal — a hospice/employer enrolls or refers families; co-branded /
  white-label.
- Neutral referral/intake flow a social worker can use in 30 seconds — presents
  a neutral tool, never steers to a specific home (anti-steering safe; Part 8).
- Reporting dashboard — families served, satisfaction, savings,
  time-to-resolution: the compliance + CAHPS + ROI proof the institution needs.

**Build priority order**
1. Instrument the existing at-need flow for outcomes (can't sell or defend
   without this data).
2. Ship/clean the free price tool + 3 pillar guides + trust spine.
3. Build a scrappy partner portal + reporting dashboard for the first pilot.
4. Index + programmatic pages. Everything else waits.

---

## 4. The data asset and the Fair-Price Index

The dataset is the moat and the sales ammunition. Treat data collection as a
core product function.

**How to collect it (four channels):** (1) your own advocacy service — every
at-need case yields real GPLs + the outcomes layer (the gold); (2) mystery
shopping — request GPLs (the FTC Funeral Rule entitles anyone), metro by metro;
(3) crowdsourcing — "upload the price list you were given" on the free tools;
(4) public postings — states requiring online GPLs; scrape + normalize.

**How to structure it:** price layer (per home → per line item on a fixed
~24-item taxonomy → per metro, every record timestamped); outcomes layer (the
moat — per case: listed / quoted / negotiated / paid / chosen home / hidden fees
/ satisfaction). Guardrails: never publish single-home pricing in a defamatory
way; require n>5 and significance before any home-level public claim; publish a
methodology page.

**The Fair-Price Index (the product).** A named, quarterly, methodology-backed
benchmark — national + per-metro — with a sharp headline each release ("Families
in [metro] overpay by $X"). This is your Case-Shiller: a recurring press event,
a backlink + AI-citation engine, and the thing that makes you the cited
standard. Publish free and public (only a public URL gets cited by journalists,
Wikipedia, and LLMs).

---

## 5. Go-to-market: the institutional sales machine

This is where you spend most of your selling hours. The company's survival
hinges on landing the first paying institution.

**ICP (start here):** independent / regional **Utah hospices** — local enough to
drive to, small enough to decide fast. Decision-makers: Executive Director,
Bereavement/Grief Coordinator, Director of Counseling, sometimes Volunteer
Coordinator. Secondary: mid-size local employers + benefits brokers (later).

**The sales process (8 stages):**

| Stage | What happens | Exit criteria |
|---|---|---|
| 1. List | 20–30 named Utah hospices w/ contacts | A real CRM list with names |
| 2. Warm entry | Reach via chaplains/social workers or the bereavement coordinator | A booked discovery call |
| 3. Discovery | Learn their bereavement program, CoP burden, CAHPS, staffing | Confirmed pain + right decision-maker |
| 4. Pitch | Show the service + the report; lead with their pain | Interest in a pilot |
| 5. Pilot proposal | Free 60-day pilot, ~10–15 families, metrics in writing | Signed pilot agreement |
| 6. Deliver | You personally run every pilot case; capture outcomes + satisfaction | Happy families + hard data |
| 7. Results review | Present families served, satisfaction, savings | A yes to a paid annual contract |
| 8. Close + expand | Paid annual contract; ask for peer intros | Recurring revenue + referrals |

**The pitch (memorize):** "You're required to provide thirteen months of
bereavement support and you get paid nothing extra to do it — and it shows up in
your family-satisfaction scores. We give every one of your families a neutral
guide through the funeral and the after-death maze — free to them — and hand you
a report that proves you delivered it. And because we never take a dime from
funeral homes, we're the one thing you can ethically put in a grieving family's
hands."

**Pricing (hypotheses — validate in pilots):** pilot free, 60 days, capped
families. Paid: per-facility annual SaaS, tiered by patient census (predictable
MRR); alternative per-decedent-family fee. Anchor on value — the 13-month
mandate + CAHPS + staff hours saved, not "software."

**Objection handling:** "Is this steering?" → No; neutral tool, full options, we
take no funeral-home money, which is why we can't steer. "No budget" → free
pilot; contract only once savings/satisfaction prove out. "We already do
bereavement" → we handle the funeral-pricing + admin maze your counselors aren't
resourced for, and hand you the CAHPS/compliance report. "How do we know the
prices are right?" → published methodology, real GPL data, shown on your own
families during the pilot.

**Cadence:** simple CRM tracking every hospice through the 8 stages; weekly: X
new contacts, Y calls booked, Z pilots advancing. Founder-led until paid
contracts and a raise.

---

## 6. Marketing: becoming the source of truth

Marketing here is not ads — it's authority. Be the answer Google, ChatGPT, and
journalists give about funeral costs.

- **SEO architecture:** topic clusters (pillar guides + dense interlinked
  sub-articles); programmatic local pages; E-E-A-T for a YMYL topic (named
  authors with credentials, expert review, primary-source citations,
  transparent methodology).
- **Generative-engine optimization:** lead every page with an original
  statistic from your data (the #1 driver of AI citations); schema/JSON-LD;
  answer-first TL;DRs; Wikipedia/Wikidata presence; allow AI crawlers; keep
  content fresh.
- **The PR flywheel:** quarterly Fair-Price Index + an annual national
  price-disclosure survey → pitch personal-finance/consumer/local desks →
  high-authority backlinks → SEO + AI citations → traffic → more data → a
  stronger next Index.
- **Don't rent the whole flywheel.** Diversify discovery across SEO + AI
  citations + institutional distribution + earned press + an email list you own.

---

## 7. Brand, messaging, and the trust spine

**Narrative:** funeral pricing is broken and families get exploited at their
worst moment; everyone who claims to help is secretly paid by the industry or an
insurer; Honest Funeral is the one guide paid by no one with a stake in the
price.

**Messaging house.** Core promise: *On the family's side. Always.* Proof
pillars: (1) we take no money from funeral homes; (2) real prices, real data,
published methodology; (3) built and reviewed by funeral and grief experts; (4)
free to families. Voice: calm, plain-spoken, never salesy, never morbid.

**The trust spine (build these pages):** "We take no money from funeral homes";
methodology page; public mistakes page (the GiveWell move); named team + expert
reviewers with real credentials.

**The for-profit trust burden.** Because you're for-profit with no mission-lock,
neutrality is a practice you must prove, not a structure people can verify. Your
track record is the asset — be relentlessly, visibly neutral, and never publish
a number you can't defend. One exposed exaggeration undoes the brand.

---

## 8. Legal, compliance, and risk-control

Engage a startup attorney with healthcare + consumer-protection experience
before the first institutional contract or any handling of health data.

- **Entity:** Delaware C-corp, founder-owned, no mission-lock. Clean cap table.
- **FTC Funeral Rule — your leverage:** the Rule entitles consumers to itemized
  GPLs in person and by phone. You invoke the family's right on their behalf.
- **Anti-steering law — a hard design constraint:** several states bar steering
  families to a particular home, and hospices/social workers must present ALL
  options. The product must be a neutral tool that presents options and lets the
  family choose — never a paid referral. This is legal necessity and the reason
  hospices can endorse you. Confirm per state with counsel.
- **Hospice partnership & health-data compliance:** if a hospice shares any PHI,
  you likely need a BAA and HIPAA-aware handling. Design to minimize PHI; prefer
  family self-enrollment. Plan for SOC 2 as you scale.
- **Other must-dos:** claims substantiation (FTC §5) — every savings/fair-price
  claim backed by real data or disclaimed; CAN-SPAM on outreach emails; privacy
  policy + terms; data-licensing terms later; E&O/general-liability insurance
  before scaling.
- **Counsel checklist:** anti-steering exposure per launch state; HIPAA/BAA
  triggers + PHI minimization; standard pilot agreement + institutional
  MSA/order form + data terms; savings-claim substantiation standards; ToS +
  privacy + outreach-email compliance.

---

## 9. Finance, unit economics, and fundraising

- **Cost structure (lean):** infra runs tens of dollars/month early; per
  advocacy case a couple dollars in AI/email. Your main cost is your time.
- **Revenue lines (in order):** (1) institutional B2B2C (hospices → employers) — recurring, the engine
  (insurers distribute/acquire but never pay); (2) data/Index licensing to non-conflicted
  buyers — later, highest margin; (3) lean/free consumer — proof and data, not a
  revenue target. **Never:** funeral-home fees or insurer-as-payer deals.
- **Valuation drivers:** recurring revenue (data/SaaS ~6–9× vs ~1–3× for
  content), proprietary outcomes data, the neutral brand, signed distribution
  contracts. Look like a recurring data business, not a blog.
- **Fundraising:** bootstrap now; raise after 1–2 paid contracts + free-tool
  traction. Target mission-aligned investors. Use the raise to pay yourself a
  salary, hire, and accelerate data + sales.

---

## 10. Metrics, KPIs, and the scorecard

**North-star:** families meaningfully helped per month (used a tool, got a
fair-price answer, or were served through an institution).

**Weekly dashboard:** Reach (organic visitors, tool uses, AI/press citations,
email subs) · Service (cases run, avg savings/family, satisfaction) · Data
(homes covered, GPLs collected, outcomes records) · Sales (hospice contacts,
calls booked, pilots live, paid contracts/MRR) · Authority (Index releases,
press pickups, backlinks, Wikipedia citations).

**Go/no-go scorecard (the quit-the-job decision):** ≥1 paid recurring contract
(a 2nd in pilot); converting >1 in ~5 hospice conversations; documented savings
+ strong satisfaction across ~10+ cases; organic traffic + first AI/press
citations climbing; runway covered by revenue OR ~12–18 mo savings OR a raise.
**Rule:** don't quit on feeling or on consumer sales. Go full-time when these
turn green.

---

## 11. Operating rhythm

| Block | Focus |
|---|---|
| Morning (deep work) | Product + data: instrument the app, build the portal, process GPLs, write guides |
| Midday (live hours) | Sales: hospice outreach, discovery calls, pilot delivery |
| Afternoon | Content + Index work, case delivery, follow-ups |
| Evening (lighter) | Admin, CRM hygiene, planning tomorrow's 3 priorities |

**Cadence:** daily pick 3 priorities (≥1 must move an institution toward
paying); weekly personal review (reach up? a deal advanced? data deeper?);
monthly metrics vs the scorecard. **Focus discipline:** if a task doesn't grow
reach, advance an institutional deal, or deepen the data, defer it. Resist
building features no one asked for; resist chasing consumer-revenue dopamine.

**Hiring:** stay solo until paid contracts + a raise. First additions: a
part-time licensed funeral director / bereavement expert (credibility +
content review), then engineering/ops, then a sales hire post-raise.
Contractors before employees.

---

## 12. The roadmap

| Phase | Months | Goal |
|---|---|---|
| 0 — Foundation | 0–1 | Entity, free tools live + instrumented, trust spine, hospice target list |
| 1 — First proof | 1–3 | First pilots, first paid contract, first Index, first outcomes data |
| 2 — Repeatable | 4–6 | 3–5 paid hospices, repeatable pitch, more metros, raise prep |
| 3 — Scale | 7–12 | Employer channel, data-licensing pilot, seed raise / go full-time, drive the FTC/state rule |

**The 90-day sprint** (week-by-week): Weeks 1–4 foundation & first data
(incorporate; pledge page; outcomes instrumentation; 3 pillar guides +
methodology + trust pages; 20–30 hospice list; first mini-survey; first 10
outreaches). Weeks 5–8 first pilots & proof (10+ discovery calls; 1–2 free
pilots; run at-need cases by hand; partner portal + reporting v1; savings case
studies). Weeks 9–12 convert & publish (proof sheet; ask for the paid contract +
peer intros; publish the first Fair-Price Index with a press push; decision memo
vs the scorecard).

**The one milestone that matters:** by day 90, one institution paying (or about
to). Everything else is in service of making that yes happen and proving it
repeats.

---

## 13. Risk register

| Risk | Mitigation | Kill / pivot signal |
|---|---|---|
| Empathy expands into funeral pricing | Go deeper on neutral price advocacy + data than an insurer-paid player can | If they match neutrality at scale, become the data layer they plug into |
| Hospice procurement too slow | Independents first; free pilots; parallel consumer funnel + employer channel | If no hospice will pilot, shift lead channel to employers/EAPs |
| Anti-steering / compliance misstep | Neutral-by-design product; counsel sign-off before each state | Any regulator concern → pause, fix the handoff |
| Privacy / health-data breach | Minimize PHI, BAAs, security basics, SOC 2 | A breach is existential for a trust brand — over-invest here |
| Data isn't defensible | Focus on the outcomes layer, not the public price list | If outcomes volume stays thin, lean on trust + regulatory position |
| SEO/AI volatility | Diversify discovery; own an email list + institutional distribution | Treat single-channel dependence as a red flag |
| Solo-founder burnout | Ruthless focus on the 3 engines; the scorecard; contractors before hires | If you're doing everything a little, cut scope |
| Neutrality compromise temptation | The guardrails (Part 14); never take home/insurer money | Taking that money is the one unrecoverable mistake |

---

## 14. The guardrails we never break

1. **Never take a dollar from funeral homes or from an insurer as our payer.**
   The source of every moat and the reason institutions can endorse us. The one
   unrecoverable mistake.
2. **Never charge the grieving family as the growth engine.** Free to them;
   institutions pay.
3. **Never steer a family to a specific home.** Present neutral options; let
   them choose. Legal necessity and brand.
4. **Never publish a number we can't defend.** "Honest" is the brand; one bad
   figure undoes it.
5. **Never own the funeral or its capital risk.** Stay an advice + data layer;
   monetize around the funeral.
6. **Never rent the whole flywheel from one platform.** Diversify reach.

> Run it pure while it's yours. Build the two things an acquirer can't replicate
> — a trusted neutral brand and proprietary outcomes data — and land the
> institutions that pay for it. When the money's right and you're ready, take
> the offer with a clear conscience. Now go land the first one.

---

## Appendix: the facts this plan stands on

- **Market:** ~3.0M US deaths/yr → 3.6M+ by 2037; median funeral $6,280
  (cremation) / $8,300 (burial); same-metro price variation 100–200%+; only
  ~18% of homes post prices online; FTC online-disclosure rule still not
  enacted; PE roll-ups raise prices post-acquisition.
- **Channel:** Medicare requires ~13 months of hospice bereavement support
  (42 CFR 418.64), unfunded; ~1.8M hospice deaths/yr through ~5,000 providers;
  CAHPS is the family-satisfaction lever.
- **Competitor:** Empathy raised ~$162M, 8 of top 10 life insurers, ~1 in 5
  claims — but insurer-paid, so it cannot be the neutral funeral-price advocate.
- **Graveyard:** Halolife, Grace, Tulip, Solace, Cake, Willing, Tomorrow,
  Lantern, Everplans, Farewill — died/absorbed mostly for charging the grieving
  family or depending on funeral-home money.
- **Survivors:** Empathy, Trust & Will, FreeWill, Carfax, FAIR Health — all
  monetized a third party whose interests aligned with the user, and the best
  became the cited data standard.

_Full citations are in the five companion documents (strategy summary,
source-of-truth strategy, moat & mission playbook, for-profit plan, graveyard
analysis)._
