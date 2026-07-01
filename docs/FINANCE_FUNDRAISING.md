# Finance, Unit Economics & Fundraising

> **Scope.** This operationalizes **Part 9 of the [Operating Plan](OPERATING_PLAN.md)** (finance, unit economics, fundraising). It is the money model for a company whose product is **free to families and paid for by institutions**. It exists to answer three questions: *what does this cost to run, where does the money come from (and where it must never come from), and when/how do we raise?* Read alongside [`SCORECARD.md`](SCORECARD.md) (the go/no-go gate that triggers the raise) and [`ROADMAP.md`](ROADMAP.md) (what the money buys).
>
> Aligned to the six guardrails in [`CLAUDE.md`](../CLAUDE.md). The two most load-bearing here: **#1 — never take a dollar from funeral homes or from an insurer as our payer**, and **#2 — never charge the grieving family as the growth engine.** Every line item below obeys them. A revenue line that violates them is not "aggressive," it is the one unrecoverable mistake.

---

## 0. The one-paragraph money thesis

We run **near-zero-cost** today — the real expense is the founder's time, not infrastructure. Revenue comes in a strict order: **(1) institutional B2B2C recurring contracts** (hospices → employers; insurers distribute/acquire but never pay) are the engine; **(2) data / Fair-Price Index licensing** to non-conflicted buyers is the later, highest-margin layer; **(3) the free consumer tier** is *proof and data, never a revenue target*. We **bootstrap** until 1–2 paid contracts plus free-tool traction prove the model, then raise a small mission-aligned round — triggered by the [`SCORECARD.md`](SCORECARD.md) turning green, not by feeling — to put the founder full-time and hire a part-time licensed FD/bereavement expert first. The goal is to **look like a recurring-data business (6–9× revenue), not a content blog (1–3×)** by the time anyone underwrites us.

---

## 1. Cost structure (lean by design)

The strategy is *deliberately* capital-light. We are an advice + data layer (guardrail #5: never own the funeral or its capital risk), so there is no inventory, no fulfillment, no FD payroll, no real estate. Costs scale with cases and traffic, both of which are cheap.

### 1.1 The cost lines

| Category | What it is | Rough monthly cost (pre-raise, solo) | Scales with |
|---|---|---|---|
| **Infra — hosting** | Vercel (Next.js app), Supabase (Postgres + RLS + auth) | Free tier → low **tens of $/mo** | Traffic; flat for a long time |
| **Infra — email** | Resend (send) + Postmark Inbound (receive) | Free / low tens of $/mo | Send volume |
| **AI — per case** | Claude (`lib/claude.ts`, currently `claude-sonnet-4-6`): GPL vision OCR + analysis + outreach drafting + follow-ups | **~$1–2 per advocacy case** | Cases run |
| **AI — free tools** | Obituary/eulogy/analyzer drafts (trust features, not cost centers) | **~$0.02 / draft**; pennies/mo at pilot scale | Tool uses |
| **Domain / DNS / misc SaaS** | honestfuneral.co, CRM spreadsheet/Airtable, analytics | Low tens of $/mo | Flat |
| **Legal (one-time, lumpy)** | Startup counsel: anti-steering opinion, pilot agreement, MSA/order form, BAA template, ToS/privacy (see [`LAWYER_BRIEF.md`](LAWYER_BRIEF.md), [`HOSPICE_GTM.md`](HOSPICE_GTM.md) Part D.2) | **One-time $X,000s**, not recurring | Milestones, not volume |
| **Insurance** | E&O + general liability **before scaling** (Operating Plan §8) | Deferred until first paid contract | Scale |
| **Founder time** | *The actual cost.* Unpaid until the raise. | Opportunity cost only | — |

**The headline:** at pilot scale (10–15 families/pilot, a handful of pilots), total **cash burn is in the low tens of dollars per month plus a one-time legal spend.** Everything else is sweat. This is the whole point of bootstrapping: the runway is years, not months, because there is almost nothing to spend on.

### 1.2 Per-case unit economics (L2 — the family service)

The family service is **free to the family** and its *job is data*, not margin. But the cost must stay trivial so we can run it at zero family revenue indefinitely.

| Item | Cost |
|---|---|
| Claude vision OCR of GPLs + analysis | ~$0.50–1.00 |
| Outreach drafting + follow-up generation | ~$0.50–1.00 |
| Email send/receive (Resend/Postmark) | pennies |
| **Total marginal cost per advocacy case** | **~$1–2** |

> **Important correction vs legacy docs.** [`AI_STRATEGY.md`](AI_STRATEGY.md) computes margin as *"close costs ~$2/case vs $49 revenue."* **That $49 family revenue is dead** (guardrail #2; see [`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md)). The correct framing now: a case **costs ~$1–2 and produces $0 direct family revenue** — its return is an **outcomes record** (the moat asset) and a **savings case study** (sales ammunition). Cost-control levers still apply: prompt-caching keyed on stable system prompts, batching nightly jobs, and model-tiering (Haiku for classification, Sonnet for analysis/vision) per the shared-client design in `AI_STRATEGY.md` §Foundations.

### 1.3 Cost discipline rules

- [ ] Stay on free/low tiers (Vercel, Supabase, Resend, Postmark) until volume forces an upgrade — don't pre-buy capacity.
- [ ] Every Claude call is tagged `{feature, model, tokens, cost, negotiation_id}` so per-case cost stays visible (the shared-client pattern in `AI_STRATEGY.md`). Retrofitting attribution is painful.
- [ ] Legal is the only meaningful pre-raise spend — time it to milestones (first pilot agreement, first paid MSA), not speculatively.
- [ ] **Contractors before employees** (Operating Plan §11). No payroll until the raise.
- [ ] The founder's time is the scarce resource — protect it with the focus discipline (if a task doesn't grow reach, advance a deal, or deepen data, defer it).

---

## 2. Revenue lines — in strict priority order

Three lines, plus a hard **NEVER** list. Build them in order; do not let lines 2–3 distract from line 1.

### 2.1 The priority stack

| # | Line | What it is | Margin | When | Status |
|---|---|---|---|---|---|
| **1** | **Institutional B2B2C (the engine)** | Recurring contracts: **hospices → employers/EAPs** (insurers distribute/acquire, **never pay**). Per-facility annual SaaS, tiered by census. | High (software) | **Now → 90-day goal** | 🔴 0 contracts |
| **2** | **Data / Fair-Price Index licensing** | License the proprietary outcomes dataset + the [Fair-Price Index](FAIR_PRICE_INDEX.md) to **non-conflicted** buyers (researchers, journalists-via-citation, gov/regulatory, non-funeral fintech/estate platforms). | **Highest** (sell the same data many times) | **Later** (after data has depth + the Index is published) | ⚪ not started |
| **3** | **Lean / free consumer** | The free L1 tools + L2 family service. **Not a revenue line** — it is the proof of neutrality, the acquisition surface, and the data-collection instrument. | n/a (cost center, kept tiny) | Live now | 🟢 built, free |

### 2.2 Line 1 — Institutional B2B2C (the engine)

This is where survival lives. Detailed sales mechanics are in [`HOSPICE_GTM.md`](HOSPICE_GTM.md); the **money** view:

- **Payer:** the **hospice** (institution). The family is the beneficiary; the institution is the customer. This is the survivor pattern (Empathy/insurer, FreeWill/nonprofit, Trust&Will — all monetized an aligned third party).
- **The wedge that justifies the price:** the unfunded **42 CFR 418.64** 13-month bereavement mandate + the **CAHPS** emotional-and-spiritual-support measure (publicly reported, feeds Star Ratings, 4% APU penalty for non-participation). We sell into the gap between the mandate and the funding.
- **Pricing model (hypotheses — validate in pilots, do NOT hard-set):**

  | Model | Hypothesis | Notes |
  |---|---|---|
  | **Per-facility annual SaaS, tiered by census** *(primary)* | Small (<50) ~$X/yr · Mid (50–100) ~$2X · Large (100+) ~$3X | Predictable MRR, easy to budget against |
  | **Per-decedent-family fee** *(fallback)* | $Z per family served | Lower commitment for pilot #1 if annual feels big |
  | **Hybrid** | small base + per-family | only if both stall |

- **Value-anchoring math** (bring to the close, per `HOSPICE_GTM.md` Part F): staff hours saved × loaded hourly cost **+** CAHPS/APU-penalty avoidance framing **+** documented CoP compliance. The annual price should look small next to that. **Anchor on value, never on "software."**
- **Expansion path:** hospices first (drive-to, fast-deciding Utah independents) → mid-size **employers / benefits brokers** (bereavement-benefit gap) → **insurers as an unpaid distribution channel + eventual acquirer** (beneficiary goodwill) — but **insurers never pay us, period**; that bright line is what separates us from insurer-funded incumbents.

### 2.3 Line 2 — Data / Index licensing (later, highest margin)

- **What's sellable:** the **outcomes layer** (listed/quoted/negotiated/paid/hidden-fees/satisfaction — the moat, built but uncommitted, migration `supabase/migrations/2026-06-22-negotiation-outcomes.sql`) and the **[Fair-Price Index](FAIR_PRICE_INDEX.md)** benchmark.
- **Why it's the highest-margin line:** zero marginal cost to license the same dataset to many buyers; it's the Carfax / FAIR Health move — become the *cited standard*, then license the standard.
- **Who can buy (non-conflicted only):** academic/health-policy researchers, government/regulatory bodies, journalists (via free public citation, not paid), estate/fintech/benefits platforms with no stake in the funeral price.
- **Guardrails on this line:** the **public** Index is free and must stay free — *only a public URL gets cited by journalists, Wikipedia, and LLMs* (Operating Plan §4). Licensing is for the **deeper dataset / API**, not the headline. And **never publish a home-level number we can't defend** (guardrail #4: n>5 + significance + published methodology). A single exposed exaggeration ends the brand and the licensing business with it.
- **Timing:** do **not** chase this before the data has depth and the first Index is out. It is a Phase-3 (months 7–12) line, not a now-line.

### 2.4 The NEVER list (revenue we refuse — this is law, not preference)

| Refused revenue | Why it's forbidden | Guardrail |
|---|---|---|
| **Any fee from a funeral home** (listing, lead-gen, referral, "featured," co-funding a pilot) | Destroys neutrality — the entire moat | #1, #3 |
| **Insurer as our *payer*** (paid to favor an outcome) | We become Empathy: the insurer's concierge, not the family's advocate | #1 |
| **Charging the grieving family** as the growth engine ($49/$199 pay-to-send — *removed*) | At-need is the worst acquisition surface; it buried Halolife/Grace/Tulip/Cake/Willing | #2 |
| **Owning the funeral / capital risk** (taking a cut of the funeral, fronting costs) | We're an advice + data layer, not a funeral operator | #5 |
| **Renting the whole flywheel** to one platform (exclusive distribution that owns our reach) | Single-channel dependence is an existential fragility | #6 |

> If a prospect proposes funeral-home co-funding or insurer-as-payer, the answer is **no**, even if it's the fastest dollar. That dollar is the one unrecoverable mistake.

---

## 3. Valuation drivers — engineering the multiple

The exit is a **premium acquisition** (insurer, platform, or incumbent — Operating Plan §1.6). Everything below is about making us look like the high-multiple thing we are, and not the low-multiple thing we could be mistaken for.

### 3.1 The multiple, and which side of it we want to be on

| Business type | Typical revenue multiple | Are we this? |
|---|---|---|
| **Content / media / affiliate blog** | **~1–3×** | We must **not** read as this |
| **Recurring data / SaaS with proprietary data** | **~6–9×** | **This is the target identity** |

The same revenue is worth ~3× more if it's recurring SaaS backed by proprietary data than if it looks like content. So the work is to be — and to be *legible as* — a recurring data business.

### 3.2 The four drivers (and how each maps to our roadmap)

| Driver | Why it lifts the multiple | How we build it | Where it lives |
|---|---|---|---|
| **Recurring institutional revenue (MRR)** | Predictable ARR is the core SaaS multiplier | Per-facility annual contracts; net revenue retention via expansion + peer referrals | [`HOSPICE_GTM.md`](HOSPICE_GTM.md), [`PARTNER_PORTAL_SPEC.md`](PARTNER_PORTAL_SPEC.md) |
| **Proprietary outcomes data** | The one asset an acquirer *cannot* replicate; turns a service into a data moat | Instrument every case; grow the outcomes table; publish the Index off it | outcomes migration, [`DATA_PLAN.md`](DATA_PLAN.md), [`FAIR_PRICE_INDEX.md`](FAIR_PRICE_INDEX.md) |
| **The neutral brand** | A conflict-free trust brand is acquirer-rare and decades-durable (Consumer Reports / FAIR Health) | The trust spine — pledge, methodology, mistakes page, named reviewers | [`TRUST_SPINE.md`](TRUST_SPINE.md) |
| **Signed distribution contracts** | Locked institutional channels = embedded switching costs = de-risked revenue | Multi-year MSAs; co-branded hospice/employer integration | [`PARTNER_PORTAL_SPEC.md`](PARTNER_PORTAL_SPEC.md) |

### 3.3 What to track so the story is provable at diligence

- **ARR / MRR and net retention** — the SaaS numbers an acquirer underwrites first.
- **Outcomes-record count + coverage** (homes covered, GPLs, cases) — the depth-of-moat number.
- **Index citations + press pickups + backlinks** — proof of "cited standard" status.
- **Logo count + contract terms** (length, renewal, expansion) — signed-distribution evidence.
- **Gross margin per contract** (revenue − ~$1–2/case servicing) — proves SaaS economics, not services economics.

> **The diligence test:** could we hand an acquirer a data room that reads "recurring data business with a proprietary, conflict-free dataset and signed institutional distribution"? If yes, we earn the 6–9×. If it reads "funeral content site with some traffic," we get 1–3×. The roadmap is built to produce the former.

---

## 4. Fundraising

**Default stance: bootstrap.** We run lean enough (§1) that we don't *need* outside money to reach the 90-day milestone. We raise to *accelerate*, not to survive — and only when the evidence says go.

### 4.1 The raise trigger — tied to the SCORECARD, not to feeling

Per Operating Plan §10 and [`SCORECARD.md`](SCORECARD.md), do **not** raise (or quit the job) on hope or on consumer-sales dopamine. The go signal is the scorecard turning green:

| Signal | Green-light threshold | Current ([`SCORECARD.md`](SCORECARD.md)) |
|---|---|---|
| **Institutional revenue** | ≥1 paid recurring contract; a 2nd in pilot | 🔴 not started |
| **Repeatable motion** | Converting >1 in ~5 hospice conversations | 🔴 no conversations yet |
| **Family outcomes** | Documented savings + strong satisfaction across ~10+ cases | 🟡 instrumented, 0 cases |
| **Free-tool traction** | Organic traffic + first AI/press citations climbing | 🟡 built, analytics not wired |
| **Runway** | Revenue covers costs **OR** ~12–18 mo savings **OR** a raise | ⚪ founder to assess |

**Raise trigger (the rule):** open a round only after **1–2 paid institutional contracts + demonstrable free-tool traction** — i.e. the top two rows green and the outcomes/traction rows trending. Raising before that means raising on a story; raising after means raising on evidence (and at a far better valuation, per §3).

### 4.2 Sequencing — bootstrap → prove → raise

| Phase | Months (per [`ROADMAP.md`](ROADMAP.md)) | Funding posture |
|---|---|---|
| **0–1 Foundation / First proof** | 0–3 | **Bootstrap.** Personal savings cover the low-tens-of-$/mo + one-time legal. No raise. |
| **2 Repeatable** | 4–6 | **Bootstrap + raise *prep*.** 1–2 paid hospices in hand; assemble the data room; line up investors. |
| **3 Scale** | 7–12 | **Raise (seed) + go full-time.** Only once the scorecard is green. Use proceeds per §4.4. |

### 4.3 Who to target — mission-aligned only

The neutrality story is the asset; the wrong investor erodes it (pressure to take funeral-home/insurer money is the kiss of death). Target backers who *understand and value* a conflict-free, trust-first death-care model — the **FreeWill / Empathy-type mission-aligned backers** named in the bible's appendix and their analogues:

- Funds that backed aligned death-care / estate / benefits companies (FreeWill, Trust & Will, Empathy, Lantern-adjacent investors).
- Mission-driven / impact-leaning early-stage funds and healthcare-adjacent angels (especially those who grasp the hospice/CAHPS lever).
- Operators/angels from neutral-data businesses (the Carfax / FAIR Health pattern).
- **Avoid:** anyone whose thesis pushes toward funeral-home monetization, insurer-as-payer, or charging families — and anyone who wants a mission-lock-free for-profit to "find the obvious revenue in the homes." That revenue is forbidden (§2.4).

> **Entity note (Operating Plan §8):** Delaware C-corp, founder-owned, **no mission-lock**, clean cap table — standard and venture-compatible. Because there's no structural mission-lock, the *cap table itself* is part of neutrality: pick investors who hold the line.

### 4.4 Use of funds — in hiring order

Per Operating Plan §11 (contractors before employees; stay solo until paid contracts + a raise):

| Priority | Use | Why first |
|---|---|---|
| **1** | **Founder salary → full-time** | Unblocks the scarcest resource (founder time, §1); makes the GTM machine run at full intensity |
| **2** | **First hire: part-time licensed FD / bereavement expert** | Credibility + content review (E-E-A-T for a YMYL topic) + clinical sign-off on faith/grief content — the trust-spine reviewer the brand needs |
| **3** | **Engineering / ops** (likely contractor first) | Build L3 (partner portal + reporting dashboard) and the data/Index pipeline at scale |
| **4** | **Sales hire — *post-raise only*** | Scale the hospice → employer motion beyond founder-led; only after the pitch is proven repeatable |

Funds also cover: scaled legal (multi-state anti-steering clearance, MSA/BAA templates, SOC 2 path), E&O/GL insurance, and modest data-collection spend (mystery-shopping GPLs metro-by-metro). **Do not** spend the raise on paid consumer acquisition — at-need is the worst acquisition surface (the graveyard lesson) and consumer is not a revenue target (§2.3).

### 4.5 The raise narrative (what the deck says)

Lead with what makes us a 6–9× business, not a 1–3× one:

1. **Enormous, permanent pain** — ~3M deaths/yr → 3.6M by 2037; identical funerals vary 100–200%+ in a metro; only ~18% of homes post prices.
2. **The empty neutral seat** — every comparison site is paid by the homes, every executor is a vendor, Empathy serves the insurer. The conflict-free advocate seat is open and ours.
3. **A working B2B2C engine** — *N* paid hospices, the 42 CFR 418.64 + CAHPS wedge, recurring MRR (not consumer one-shots).
4. **A moat that compounds** — the proprietary outcomes dataset + the Fair-Price Index becoming the cited standard.
5. **A real, warm exit** — acquisition by an insurer/platform/incumbent; the acquirers are the same institutions in our distribution funnel.
6. **The discipline** — the six guardrails as the reason the moat is durable: we will *never* take the money that would break it.

---

## 5. The finance checklist (run against the scorecard)

- [ ] **Costs:** infra on free/low tiers; per-case AI cost tagged and ≤ ~$2; legal timed to milestones; no payroll pre-raise.
- [ ] **Revenue line 1:** first hospice pilot → first **paid** annual contract (the 90-day milestone); pricing validated, not guessed.
- [ ] **Revenue line 2:** deferred until the dataset has depth + Index #1 is public; non-conflicted buyers only.
- [ ] **Revenue line 3:** stays free; instrumented for data; **never** a revenue target.
- [ ] **NEVER list:** zero funeral-home/insurer-as-payer money; family service free; no funeral capital risk; no single-flywheel rental.
- [ ] **Valuation:** ARR/retention, outcomes-record count, citations, and signed-contract terms all tracked — the data room reads "recurring data business."
- [ ] **Raise:** not opened until 1–2 paid contracts + traction (scorecard top rows green); mission-aligned investors only; use of funds in the §4.4 order.

> **The one financial milestone that matters:** by day 90, **one institution paying (or about to).** That single paid contract is what converts this from a story into a fundable, ultimately acquirable, recurring-data business — without ever taking a dollar that would break the thing that makes it worth buying.
