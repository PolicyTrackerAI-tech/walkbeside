# Honest Funeral — The Plan of Attack

**The master battle plan. Everything, beginning to end, in one place.** This
synthesizes the whole `docs/` set into a single narrative you can run the company
off. Each section points to its detailed spec for depth. When in doubt, this
document and [`OPERATING_PLAN.md`](OPERATING_PLAN.md) (the bible) win; the rest
elaborate.

> **One sentence:** Build the free, neutral source of truth for funeral pricing
> that every grieving family can use; deliver the hands-on help through the
> institutions that already serve the dying and will pay for it (hospices, then
> employers; insurers distribute or acquire, never pay); compound a proprietary outcomes dataset and a
> conflict-free brand into a moat and a premium acquisition — **never taking a
> dollar from the funeral homes we judge, and never charging the grieving
> family.**

---

## Contents

1. Mission, vision, north star
2. The guardrails (non-negotiable law)
3. What we sell — the product
4. Who we sell to — the customer
5. The economics — how the money works
6. **The lifecycle — how we sell it, beginning to end** (the heart)
7. The data asset & the Fair-Price Index — the moat
8. Marketing & authority — the reach engine
9. Legal & compliance — the gates
10. The technology — built, building, deferred
11. The 90-day plan of attack — the timeline
12. Metrics & the go/no-go
13. Operating rhythm
14. Risks & mitigations
15. The exit
16. The single next action

**Doc map:** strategy → [`OPERATING_PLAN.md`](OPERATING_PLAN.md); governance →
[`../CLAUDE.md`](../CLAUDE.md); execution → [`ROADMAP.md`](ROADMAP.md) +
[`GO_TO_MARKET.md`](GO_TO_MARKET.md) + [`ENGINEERING_BACKLOG.md`](ENGINEERING_BACKLOG.md);
sales → [`HOSPICE_GTM.md`](HOSPICE_GTM.md) + [`HOSPICE_COLLATERAL.md`](HOSPICE_COLLATERAL.md);
product → [`PARTNER_PORTAL_SPEC.md`](PARTNER_PORTAL_SPEC.md) + [`TRUST_SPINE.md`](TRUST_SPINE.md);
data → [`FAIR_PRICE_INDEX.md`](FAIR_PRICE_INDEX.md) + [`DATA_PLAN.md`](DATA_PLAN.md);
money → [`FINANCE_FUNDRAISING.md`](FINANCE_FUNDRAISING.md); reach →
[`MARKETING_AUTHORITY.md`](MARKETING_AUTHORITY.md); legal →
[`COMPLIANCE_ADDENDUM.md`](COMPLIANCE_ADDENDUM.md); payment unwind →
[`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md); metrics →
[`SCORECARD.md`](SCORECARD.md).

---

## 1. Mission, vision, north star

- **Mission.** No family should be overcharged, misled, or alone at the worst
  moment of their life. We are the neutral guide through death in America — clear
  prices, straight answers, someone on the family's side, beholden to no one but
  them.
- **Vision.** A country where funeral pricing is transparent and every grieving
  family has an honest guide — so no one is ever exploited in grief again.
- **North-star metric.** Families meaningfully helped per month.
- **Positioning.** "Empathy is the insurer's concierge. We are the family's
  advocate." The only player paid by no one with a stake in the funeral price —
  the one thing no funded incumbent can copy without breaking its own model.

**Why this wins (the thesis):** the pain is enormous and permanent (~3M deaths/yr
→ 3.6M+ by 2037; identical services vary 100–200% in a metro; FTC still doesn't
require online prices); **neutrality is the only durable advantage** and that
seat is empty; **the grieving family is the wrong payer** (once-in-a-lifetime,
grief-state, zero-repeat — it killed Halolife, Cake, Willing, Farewill); **the
institutions that serve the dying will pay** (hospices owe a federal duty —
**42 CFR 418.64**, ~13 months of bereavement support — with no funding to do it
well; they are the survivor-pattern payer whose interests align with the
family's); **data + trust is the moat, not the price list**; and the exit
(acquisition by an insurer/platform/incumbent) is real.

---

## 2. The guardrails (non-negotiable law)

Any move that breaks one of these is wrong no matter how good it looks:

1. Never take money from **funeral homes** or from an **insurer as our payer**.
2. Never charge the **grieving family** as the growth engine. Free to them.
3. Never **steer** a family to a specific home. Neutral options; they choose.
   (Legal requirement — anti-steering law — and the reason hospices can endorse us.)
4. Never publish a **number we can't defend** (n>5 + significance before any
   home-level claim; publish methodology).
5. Never own the **funeral or its capital risk**. We're an advice + data layer.
6. Never **rent the whole flywheel** from one platform. Diversify reach.

---

## 3. What we sell — the product

Three layers that compound. **Families get L1 + L2 free; hospices buy L3 (and
the neutral service it wraps).**

| Layer | Who it's for | What it is | Status |
|---|---|---|---|
| **L1 — Free source of truth** | Families (free) | Fair-price lookup, "is this quote fair?" checker, pillar guides, glossary, city pages, the Fair-Price Index | **Built** (city pages, glossary, head-term page, analyzer, `/fair-price-index` + `/methodology`) — extend |
| **L2 — Instrumented family service** | Families (free) | At-need advocacy (invoke the family's FTC right to itemized quotes; neutral side-by-side) + after-death navigation. Its real job is **DATA** | **Built and live.** Negotiate flow + outcomes instrumentation (`/admin/outcomes`) shipped and applied; a region with zero vetted homes now surfaces that honestly (`no_homes_available`) instead of the fake-home fallback bug that used to run |
| **L3 — Institutional** | Hospices (paid) | Partner portal (enroll/refer families to a neutral tool) + reporting dashboard (families served, satisfaction, savings, time-to-resolution) | **Built ahead of the first yes** — `/partners` marketing + demo request, `/partners/apply`, `/partner/[code]` + `/partner/r/[token]` referral flow, a coordinator-facing AI quote-check tool, `/admin/partners` status pipeline. **Still 0 signed hospices** — the gate is now sales, not engineering |

**What the hospice is actually buying** (frame the sale around this, not
"software"): a way to **deliver their unfunded 13-month bereavement mandate**
(42 CFR 418.64) that **lifts their CAHPS family-satisfaction scores**, **saves
staff hours**, and gives them a **report that proves they delivered** — plus the
one funeral-pricing resource they can **ethically** hand a grieving family,
because we take no funeral-home money and never steer.

**The moat** = the proprietary **outcomes dataset** (what families were quoted vs.
what they actually paid, what advocacy negotiated, which homes flex) + the
**conflict-free brand**. The price list is scrapeable; the outcomes layer exists
nowhere else. See §7.

---

## 4. Who we sell to — the customer

- **Beachhead ICP:** independent / regional **Utah hospices** — local enough to
  drive to, small enough to decide in months not years. Decision-makers:
  **Executive Director, Bereavement/Grief Coordinator, Director of Counseling**,
  sometimes Volunteer Coordinator.
- **Why hospices first:** a federal duty + no funding + a satisfaction lever
  (CAHPS) + interests aligned with the family. The survivor-pattern payer.
- **Next channels (later):** mid-size **employers** + benefits brokers
  (bereavement gap), then **insurers** (beneficiary goodwill) — as distribution
  partners, **never as our payer** (guardrail #1).
- **The family** is the **beneficiary, not the payer** — the whole point.

---

## 5. The economics — how the money works

- **Free to family. Hospice pays.** Pricing hypothesis: **per-facility annual
  SaaS, tiered by patient census** (predictable MRR); validate exact numbers in
  pilots. Alternative: per-decedent-family fee. Anchor price on value (the
  mandate + CAHPS + staff hours), not "software."
- **Cost structure (lean):** infra tens of $/month early; ~a couple dollars per
  advocacy case in AI + email. **Your main cost is your time.** You can operate a
  long time on very little.
- **Revenue lines, in order:** (1) institutional B2B2C recurring — the engine;
  (2) data/Index licensing to non-conflicted buyers — later, highest margin;
  (3) lean/free consumer — proof + data, not a revenue target. **NEVER:**
  funeral-home fees, insurer-as-payer.
- **The consumer fee is dead, not "being removed":** the $49 pay-to-send charge
  and all Stripe checkout/webhook code are fully decommissioned (shipped
  2026-06-25/26, [`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md)) — no
  `app/api/stripe/` route exists on `main`. Guardrail #2 is honored today, not
  pending.
- **Valuation drivers (build for these):** recurring revenue (data/SaaS ~6–9× vs
  ~1–3× for content), proprietary outcomes data, the neutral brand, signed
  distribution. Look like a recurring data business, not a blog.
- **Fundraising:** bootstrap now; raise after **1–2 paid contracts + free-tool
  traction**, tied to the [`SCORECARD.md`](SCORECARD.md) go/no-go. Use the raise
  for a founder salary (go full-time), the first hire (part-time licensed FD /
  bereavement expert), then eng/ops, then sales. Contractors before employees.
  Detail: [`FINANCE_FUNDRAISING.md`](FINANCE_FUNDRAISING.md).

---

## 6. The lifecycle — how we sell it, beginning to end

Two interlocking lifecycles. **6A** wins the hospice (the sale). **6B** delivers
for the family (the service that produces the proof + the data). **6C** is how
they compound.

### 6A. The institutional sales lifecycle (winning a hospice)

The disciplined process, end to end. Mechanics + scripts in
[`HOSPICE_GTM.md`](HOSPICE_GTM.md); collateral in [`HOSPICE_COLLATERAL.md`](HOSPICE_COLLATERAL.md).

| Stage | What happens | Exit criteria | Asset used |
|---|---|---|---|
| **0. Pre-flight** | Clear the gate before any cold email (see §11) | Legal cleared, collateral printed, pitch memorized, pilot agreement drafted, can run a family free, list built | §11 checklist |
| **1. List** | 20–30 named Utah hospices + decision-maker contacts (Medicare Care Compare, NHPCO, Utah DOPL) | A real CRM list | target-list framework |
| **2. Cold outreach** | Email → call → voicemail → follow-up; warm entry via chaplains/social workers or straight to the bereavement coordinator | A booked discovery call | cold email/call/vm copy |
| **3. Discovery** | Learn their bereavement program, CoP compliance burden, CAHPS, staffing | Confirmed pain + right decision-maker | discovery script |
| **4. Pitch** | Lead with their pain (the mandate + CAHPS), not our features | Interest in a pilot | hospice leave-behind |
| **5. Pilot proposal** | Free 60-day pilot, ~10–15 families, metrics in writing, de-identified data grant | Signed pilot agreement | pilot one-pager |
| **6. Deliver** | You personally run every pilot case (6B); capture outcomes + satisfaction | Happy families + hard data | family one-pager + `/admin/outcomes` |
| **7. Results review** | Present families served, satisfaction, savings, time-to-resolution | A yes to a paid annual contract | the proof sheet |
| **8. Close + expand** | Paid annual contract; ask for intros to peer hospices | Recurring revenue + referrals | the contract |

**The pitch (memorize):** "You're required to provide thirteen months of
bereavement support and you get paid nothing extra to do it — and it shows up in
your family-satisfaction scores. We give every one of your families a neutral
guide through the funeral and the after-death maze — free to them — and hand you
a report that proves you delivered it. And because we never take a dime from
funeral homes, we're the one thing you can ethically put in a grieving family's
hands."

**The big-four objections** (full handling in HOSPICE_GTM): *Is this steering?* →
No; neutral tool, full options, we take no funeral-home money, which is why we
can't steer. *No budget?* → Free pilot; contract only once savings + satisfaction
prove out. *We already do bereavement.* → We handle the pricing + admin maze your
counselors aren't resourced for, and hand you the CAHPS report. *How do we know
the prices are right?* → Published methodology, real GPL data, shown on your own
families during the pilot.

### 6B. The family service lifecycle (delivering for a family)

End to end, the family journey — free to them, and the place the moat data is
born. Every step honors guardrail #3 (never steer).

1. **Referral in.** The hospice hands the family the one-pager (claim code /
   short URL / QR). The family **self-enrolls** — **no PHI touches us** (HIPAA
   minimization; see §9).
2. **Orientation (free tools, L1).** Fair-price lookup for their area; the
   "is this quote fair?" checker (photograph a price list → we flag overcharges +
   FTC violations).
3. **Advocacy (L2).** We invoke the family's **FTC Funeral Rule right** to
   itemized General Price Lists, request them from local **vetted** homes
   (`active = true AND vetted = true`), and return a **neutral side-by-side** —
   never a recommendation.
4. **Decision.** The family chooses. We never pick for them.
5. **Outcome capture (the moat).** Record listed / quoted / negotiated / paid /
   chosen home / hidden fees / satisfaction in `/admin/outcomes`. This is the
   proprietary dataset.
6. **After-death navigation.** Death certificates, accounts to close, benefits
   (Social Security, VA) — the longer multi-touch window beyond the funeral.
7. **Bereavement window.** The relationship spans the hospice's 13-month mandate;
   satisfaction feeds the hospice's CAHPS and our proof sheet.

> **Safety:** outreach to homes stays **OFF** (`OUTREACH_LIVE` off). In early
> pilots, "contacting homes" can be **you, by hand** (phone/email). The single
> code send path (`lib/negotiation/send.ts`) won't email anyone until the switch
> is deliberately flipped — a separate, explicit decision. If a region has zero
> vetted homes, the flow now reports that honestly (`status: no_homes_available`)
> instead of silently substituting fake homes — a real bug fixed 2026-07-04.

### 6C. How they interlock (the B2B2C flywheel)

Hospice refers → we serve the family **free** → we capture **outcomes** → the
**report** proves the hospice's mandate + our value → the hospice **pays + refers
peers** → the **data + brand compound** → cheaper consumer acquisition (SEO/AI
citations) + a warmer institutional pipeline + a stronger Fair-Price Index → which
earns more press, reach, and data. Every turn makes the next sale easier and the
moat deeper.

---

## 7. The data asset & the Fair-Price Index — the moat

- **The outcomes layer** (per case: listed/quoted/negotiated/paid/chosen/hidden
  fees/satisfaction) is the gold — it scales with the family service and exists
  nowhere else. Instrumented, merged, and live (`/admin/outcomes`); the current
  gap is **volume** (0 cases recorded — no pilot has run yet), not code.
- **Four collection channels:** (1) our own advocacy (the gold); (2) **mystery
  shopping** GPLs metro-by-metro (FTC entitles anyone); (3) **crowdsourcing**
  ("upload the price list you were given"); (4) **public postings** (states
  requiring online GPLs).
- **The Fair-Price Index** — a named, quarterly, methodology-backed benchmark
  (national + per-metro) with a sharp headline each release ("Families in [metro]
  overpay by $X"). Our Case-Shiller: a recurring press event, an AI-citation +
  backlink engine, and the thing that makes us the cited standard. **Published
  free + public** (only a public URL gets cited). Detail:
  [`FAIR_PRICE_INDEX.md`](FAIR_PRICE_INDEX.md), [`DATA_PLAN.md`](DATA_PLAN.md).
- **Data guardrails (#4, inline):** never publish single-home pricing as a claim;
  require **n>5 + significance** before any published figure; cells below the gate
  are labeled modeled benchmarks, not observed claims; publish the methodology.

---

## 8. Marketing & authority — the reach engine

Marketing here is **authority, not ads** — be the answer Google, ChatGPT,
Perplexity, and journalists give about funeral costs.

- **SEO (built, strong):** topic clusters — head-term page, 87 city pages,
  63-term glossary, 40+ guides, valid Article/FAQ schema, clean sitemap/robots,
  dynamic OG. **Biggest gap: no named human author/expert reviewer** on the
  schema (critical for a YMYL topic).
- **Generative-engine optimization:** lead every page with an **original stat**
  (the Index) — the #1 driver of AI citations; expand schema (Dataset, FAQ,
  Breadcrumb); answer-first TL;DRs; Wikipedia/Wikidata presence; keep AI crawlers
  allowed; freshness.
- **The PR flywheel:** quarterly Index + an annual price-disclosure survey →
  press → backlinks → AI citations → traffic → more data → a stronger next Index.
- **Don't rent the flywheel:** diversify across SEO + AI citations + institutional
  distribution + earned press + an **owned email list**.
- **B2B2C collateral:** the hospice hands families a free, neutral, co-branded
  one-pager; you hand the hospice a leave-behind. Anti-steering-safe.
  Detail: [`MARKETING_AUTHORITY.md`](MARKETING_AUTHORITY.md),
  [`HOSPICE_COLLATERAL.md`](HOSPICE_COLLATERAL.md).

---

## 9. Legal & compliance — the gates

Engage a startup attorney (healthcare + consumer-protection) **before the first
institutional contract or any PHI**. The pivot's load-bearing items
([`COMPLIANCE_ADDENDUM.md`](COMPLIANCE_ADDENDUM.md)):

- **Anti-steering (hard design constraint):** several states bar steering, and
  hospices must present ALL options. The product is a **neutral tool**; never a
  paid referral. Clear **Utah** specifics with counsel before launch.
- **HIPAA / BAA:** if a hospice shares PHI we likely need a BAA. **Design to
  avoid it:** family **self-enrollment**, minimal PHI, SOC 2 as we scale.
- **Contracts:** a simple pilot agreement + an institutional MSA/order form + a
  de-identified data-use grant.
- **Claims substantiation (FTC §5):** every savings/fair-price claim backed by
  real data or disclaimed; no savings number stated until pilot data backs it.
- **CAN-SPAM** on outreach; ToS + privacy; E&O/GL insurance before scaling.
- **The one compliance milestone that gates the first pilot:** counsel clears
  Utah anti-steering **and** confirms self-enrollment keeps us out of BAA
  territory, **and** we have a signed pilot agreement with a data grant.

---

## 10. The technology — built, building, deferred

**Verified state on `main` (2026-07-05) — P1–P4 below all shipped.** Engineering
now moves faster than this doc; re-check
[`ENGINEERING_BACKLOG.md`](ENGINEERING_BACKLOG.md) for anything newer than this
edit before treating the list below as exhaustive.

- **Built (L1 + the rails):** the free price tools, guides, glossary, city pages,
  analyzer; the funeral-home directory with a **vetting gate** (`active AND
  vetted`) + the `/admin/vetting` tool; a **31-file vitest suite**. The consumer
  paywall is fully gone — no Stripe route exists on `main`.
- **Built (L2 — the moat, merged and applied, not "pending its PR"):** outcomes
  instrumentation — the migration, `/admin/outcomes`, family satisfaction
  capture — has been live for weeks. The negotiate flow no longer fakes homes
  when a region has none vetted; it honestly reports `no_homes_available`.
- **Built (L3 — institutional, ahead of the first hospice yes, not "build after
  a hospice yes"):** `/partners` (marketing page + demo-request capture),
  `/partners/apply`, the `/partner/[code]` + `/partner/r/[token]` referral flow,
  a coordinator-facing AI quote-check tool at `/partner/r/[token]/check`, an
  illustrative sample report at `/partner/sample-hospice`, and `/admin/partners`
  with the pilot/active/paused/archived status pipeline. **The gate now is sales
  (a signed hospice), not engineering.**
- **Built (P4 — the data asset):** `/fair-price-index` + `/methodology` are
  live; the line-item taxonomy is at **38 items** (past the original 21→24
  target); Vercel Analytics is wired sitewide, closing the reach-analytics gap.
- **What's actually next:** see the current backlog in
  [`ENGINEERING_BACKLOG.md`](ENGINEERING_BACKLOG.md). Engineering is no longer
  the bottleneck — §11 below still describes the *sales/legal* sequence
  accurately, but its engineering framing ("deferred until a hospice yes") is
  superseded by the above.
- **Safety invariant on every outreach ticket:** the only email-to-a-home path is
  `sendOutreachForNegotiation`, gated by `OUTREACH_LIVE` (kept **off**). Nothing
  shipped has flipped it.

---

## 11. The 90-day plan of attack — the timeline

The headline: **cold outreach starts in ~2–3 weeks, not after building
everything.** Pilots are run by hand; the portal comes after a yes. Full path:
[`GO_TO_MARKET.md`](GO_TO_MARKET.md).

### Phase 0 — Pre-flight gate (start now; mostly NOT engineering)
Start the **legal** item first (longest lead time). The gate to the first cold
email — **status per [`MARKET_READINESS.md`](MARKET_READINESS.md), verified
2026-07-05:**

- [ ] **Legal:** counsel clears Utah anti-steering + confirms self-enrollment
      avoids a BAA. **Still open — the lawyer's lane.**
- [x] **Free family:** a pilot family pays $0 — the payment decommission
      shipped; there is no charge anywhere in the code.
- [x] **Trust:** the "no funeral-home money" story is true + visible; the $49
      family copy is scrubbed sitewide and `/our-role`, `/methodology`,
      `/corrections` are live.
- [ ] **Pitch:** memorized, with objection handling. **Still open.**
- [ ] **Collateral:** family one-pager + hospice leave-behind + cold-email/call
      copy — drafted, **not yet designed/printed.**
- [ ] **Entity + contracts:** Delaware C-corp, the pilot agreement, an
      institutional MSA/order form, a de-identified data-use grant — drafted
      with counsel. **Still open — the lawyer's lane**
      ([`MARKET_READINESS.md`](MARKET_READINESS.md) §A).
- [x] **Outcomes recording works** — the migration is applied; `/admin/outcomes`
      has been live for weeks.
- [ ] **Target list:** 20–30 Utah hospices with contacts. **Still open.**

### Weeks 1–4 — Foundation & first data
The engineering items in this phase are **done** (outcomes applied, $49 copy
scrubbed, partner portal + Fair-Price Index built — see §10). What's left is the
founder/legal sequence: start the legal pre-flight **today** (longest lead
time); finalize pitch + collateral; form the entity; build the target list;
**first 10 hospice outreaches**.

### Weeks 5–8 — First pilots & proof
Book 10+ discovery calls; sign 1–2 free pilots; **run at-need cases by hand**,
capturing every outcome; first savings case studies. The partner portal +
reporting dashboard are **already built** (`/partners`, `/partner/[code]`,
`/admin/partners`) — use the live `/partner/sample-hospice` illustrative report
to sell the pilot, and the real per-partner report once a pilot has cases.

### Weeks 9–12 — Convert & publish
Compile the proof sheet (the live per-partner report generates this); ask for
the **paid annual contract** + peer intros; the **Fair-Price Index is already
published** (`/fair-price-index` + `/methodology`) — lean on it in the press
push; write the decision memo vs. the scorecard (raise? go full-time?).

**No longer true — corrected 2026-07-05:** the original plan below said to
defer the partner portal, reporting dashboard, Fair-Price Index build-out, and
programmatic SEO depth until a hospice said yes. That got overtaken — all of it
shipped ahead of the first signed hospice (see §10). `OUTREACH_LIVE` is the one
item on this list that's still deliberately off.

**12-month arc:** Phase 0 Foundation (0–1) → Phase 1 First proof (1–3) → Phase 2
Repeatable, 3–5 paid hospices + raise prep (4–6) → Phase 3 Scale: employer
channel, data-licensing pilot, seed raise / full-time (7–12).

---

## 12. Metrics & the go/no-go

- **North star:** families meaningfully helped per month.
- **Weekly dashboard:** Reach (visitors, tool uses, AI/press citations, subs) ·
  Service (cases, avg savings, satisfaction) · Data (homes covered, GPLs,
  outcomes records) · Sales (contacts, calls, pilots, MRR) · Authority (Index
  releases, press, backlinks, Wikipedia).
- **Go/no-go (quit-the-job):** ≥1 paid recurring contract (2nd in pilot);
  converting >1 in ~5 hospice conversations; documented savings + strong
  satisfaction across ~10+ cases; free-tool traction + first AI/press citations
  climbing; runway covered by revenue **or** ~12–18 mo savings **or** a raise.
  **Rule:** go full-time from evidence + stability, not feeling or consumer sales.
- **Current reading (2026-07-05):** 0 hospice contacts — sales, not engineering,
  is now the bottleneck; outcomes instrumentation applied and live; L1 and L3
  built; emails still off (`OUTREACH_LIVE` false, by design). The next number
  that matters: **hospice contacts → calls → first pilot.** Detail:
  [`SCORECARD.md`](SCORECARD.md).
- **Instrumentation gaps (close these to measure honestly):** ~~reach analytics
  not wired~~ **done** (Vercel Analytics, sitewide, 2026-07-05); ~~outcomes
  migration not applied~~ **done**; no sales CRM yet (a spreadsheet works);
  authority tracked by hand.

---

## 13. Operating rhythm

- **Morning (deep work):** product + data — apply outcomes, scrub fee copy,
  process GPLs, write guides.
- **Midday (live hours):** sales — hospice outreach, discovery calls, pilot
  delivery (when people answer).
- **Afternoon:** content + Index, case delivery, follow-ups.
- **Evening (lighter):** admin, CRM hygiene, tomorrow's 3 priorities.
- **Daily:** pick 3 priorities; ≥1 must move an institution toward paying.
  **Weekly:** reach up? a deal advanced? data deeper? **Monthly:** metrics vs the
  scorecard.
- **Focus discipline:** if a task doesn't grow reach, advance a deal, or deepen
  the data, defer it. Resist building features no one asked for; resist the
  consumer-revenue dopamine.
- **Hiring:** solo until paid contracts + a raise. Then: part-time licensed FD /
  bereavement expert → eng/ops → sales hire. Contractors before employees.

---

## 14. Risks & mitigations

| Risk | Mitigation | Kill / pivot signal |
|---|---|---|
| Empathy expands into funeral pricing | Go deeper on neutral price advocacy + data than an insurer-paid player can | If they match neutrality at scale, become the data layer they plug into |
| Hospice procurement too slow | Independents first; free pilots; parallel employer channel | If no hospice will pilot after sustained effort, shift to employers/EAPs |
| Anti-steering / compliance misstep | Neutral-by-design; **clear Utah anti-steering before the first pilot**; counsel sign-off before each new launch state; confirm self-enrollment avoids a BAA | A steering or HIPAA concern is **existential** to a trust brand → pause, fix the handoff |
| Health-data breach | Minimize PHI, BAAs, security basics, SOC 2 | Existential for a trust brand — over-invest |
| Data isn't defensible | Focus on the outcomes layer, not the public price list | If outcomes volume stays thin, lean on trust + regulatory position |
| SEO/AI volatility | Diversify discovery; own an email list + institutional distribution | Single-channel dependence = red flag |
| Solo-founder burnout | Ruthless focus on the 3 engines; the scorecard; contractors | Doing everything a little → cut scope |
| Neutrality-compromise temptation | The guardrails; never take home/insurer money | Taking that money is the one unrecoverable mistake |

---

## 15. The exit

Run it pure while it's yours. Build the two things an acquirer can't replicate —
a **trusted neutral brand** and **proprietary outcomes data** — and land the
institutions that pay for it. The base-case ending is acquisition by an insurer,
platform, or incumbent. When the money's right and you're ready, take the offer
with a clear conscience.

---

## 16. The single next action

**Start the legal pre-flight today** (longest lead time), and in parallel
finalize the pitch + collateral and build the 20–30 Utah hospice list. That puts
the **first cold email ~2–3 weeks out.** Everything in this document exists to
make that first hospice say **yes** — and to prove it repeats.

> Now go land the first one.
