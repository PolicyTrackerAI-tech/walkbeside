# Hospice GTM — The Sales Playbook to Land the First Hospice

> **Scope.** This operationalizes **Part 5 of the [Operating Plan](OPERATING_PLAN.md)** (the institutional sales machine). It is the **90-day critical path**: the one milestone that matters is *one hospice paying (or about to)*. Everything here serves that. Aligned to the six guardrails in [`CLAUDE.md`](../CLAUDE.md) — most load-bearing here: **#1 never take funeral-home/insurer money**, **#3 never steer** (the legal reason a hospice can endorse us), and **#2 free to families**.
>
> Founder-led, solo, until paid contracts + a raise. If a task in this doc doesn't book a call, advance a pilot, or produce defensible proof, defer it.

---

## 0. The one-line thesis you are selling

> *"You're federally required to provide thirteen months of bereavement support, you're paid nothing extra to do it, and it shows up in your CAHPS scores. We give every one of your families a neutral guide through the funeral and the after-death maze — free to them — and hand you a report that proves you delivered it. And because we never take a dime from funeral homes, we're the one thing you can ethically put in a grieving family's hands."*

Two regulatory facts anchor every conversation and both are verified:

- **42 CFR 418.64** (Condition of Participation: Core services) — hospices must run an *organized bereavement program* under a qualified professional, providing services **for at least 13 months after the death**. It is a **CoP** (survey-able; non-compliance threatens Medicare certification) and it is **unfunded** — no per-diem add-on covers it.
- **CAHPS Hospice Survey** — the "Emotional and Spiritual Support" composite explicitly asks caregivers about *support in the weeks after their family member died*. Results are **publicly reported on Care Compare**, feed **Star Ratings**, and non-participation triggers a **4% annual payment update (APU) penalty**. This is the family-satisfaction lever the bible names.

We sell *into the gap between the mandate and the funding* — and into the CAHPS score.

---

## Part A — The target list (Stage 1)

**Goal:** a real CRM with **20–30 named Utah hospices** and a named human at each. Exit criterion: list exists with contacts.

### A.1 ICP — who qualifies for the list

| Include | Why | Exclude / deprioritize |
|---|---|---|
| **Independent / regional Utah hospices** | Local (drive to them), small enough to decide fast, founder can reach the decision-maker | National chains (VITAS, Amedisys, Gentiva) — procurement too slow for pilot #1 |
| Non-profit + small for-profit, ~20–150 census | Real bereavement burden, thin staffing | Hospital-system-embedded with a large in-house grief dept (harder to displace, slower) |
| Has a named **Bereavement/Grief Coordinator** | The pain owner + likely champion | "Bereavement = one chaplain part-time" still fine — that's *more* pain, keep it |

**Decision-maker map** (target the first you can reach; the ED signs):
1. **Bereavement / Grief Coordinator** or **Director of Counseling** — the *champion* (owns the 42 CFR 418.64 burden day-to-day).
2. **Executive Director / Administrator** — the *economic buyer* (signs the pilot + contract).
3. **Volunteer Coordinator / Social Worker / Chaplain** — the *warm entry* (often the easiest first human).

### A.2 Sources to build the list

| Source | What you get | How to use it |
|---|---|---|
| **Medicare Care Compare** (medicare.gov/care-compare, Hospice) | Every Medicare-certified UT hospice: legal name, address, phone, ownership, CAHPS star scores, "emotional & spiritual support" sub-score | Primary list source. **The CAHPS sub-score is sales gold** — a hospice scoring low on emotional/spiritual support is your warmest lead; lead the email with *their* number. |
| **Provider of Services (POS) file / CMS public data** (data.cms.gov) | Census/size signal, ownership type, certification date | Filter to UT; size → tier hypothesis (Part E pricing). |
| **NHPCO** (member directory + state affiliate) | Membership signal, conference/PR-event lists, who's active in the field | Find the engaged operators; warm-intro surface. |
| **Utah DOPL** (dopl.utah.gov licensee search) | Licensed facilities + licensed counselors/clinical staff names | Cross-reference to *name the human* (the bereavement coordinator) — turns a generic "info@" into a real contact. |
| **Utah Hospice & Palliative Care Org / state association** | Local roster, events, the "who knows whom" map | Warm-intro path; in-person event = fastest Stage-2 conversion. |
| Hospice websites + LinkedIn | Bereavement coordinator name + email pattern, program description | Confirm the named human; infer email (`first.last@`, verify before send). |

> **Do not** pull this list from any funeral-home or insurer dataset — keep the sourcing conflict-free (guardrail #1). All sources above are public/government/association.

### A.3 CRM fields to track (build this first — a spreadsheet is fine for pilot #1)

A lightweight sheet/Airtable, **not** new app code. Fields:

```
— Identity —
hospice_name · legal_name · website · city · UT_region · ownership(nonprofit/forprofit/hospital)
ccn (Medicare ID) · census_estimate · size_tier(S/M/L)

— Signals (the "why now") —
cahps_emotional_spiritual_score · cahps_star · care_compare_url
bereavement_program_notes · pain_hypothesis

— Contacts —
champion_name · champion_role · champion_email · champion_phone
economic_buyer_name(ED) · ED_email · warm_intro_path(who/how)

— Pipeline —
stage(1–8) · stage_entered_date · next_action · next_action_date
last_touch_date · touch_count · source · disposition_if_dead
pilot_start · pilot_families_target · pilot_families_actual
contract_status · annual_price_quoted · notes
```

> Outreach to a *hospice* (B2B) goes through your normal sales email, **not** `lib/negotiation/send.ts` — that function and the `OUTREACH_LIVE` switch govern emails to *funeral homes* only and must stay off. Never route hospice sales mail through it. CAN-SPAM still applies (Part C.3).

---

## Part B — The 8-stage pipeline (actionable checklist)

The bible's stages, made operational. Each stage has a **definition of done** and a **weekly target**.

| # | Stage | Concrete actions (checklist) | Exit criteria (DoD) | Weekly target |
|---|---|---|---|---|
| **1** | **List** | ☐ Pull all UT hospices from Care Compare ☐ Add CAHPS emotional/spiritual sub-score ☐ Name the champion via DOPL/LinkedIn ☐ Rank by (low CAHPS + independent + warm path) | 20–30 rows, each with a *named human* | List complete by end of week 1 |
| **2** | **Warm entry** | ☐ Map any 2nd-degree intro (NHPCO/UT assoc/LinkedIn) ☐ Send sequence (Part C) ☐ Call the bereavement coordinator ☐ Attend ≥1 local hospice event | A **booked discovery call** | 10 first-touches/wk → ≥2 calls booked/wk |
| **3** | **Discovery** | ☐ Run the discovery script (Part C.4) ☐ Confirm bereavement program shape, CoP burden, CAHPS pain, staffing gap ☐ Identify economic buyer | Confirmed pain + right decision-maker identified | 1–2 discoveries/wk |
| **4** | **Pitch** | ☐ Walk the family experience (free L1 tools + at-need advocacy) ☐ Show a mock **reporting dashboard** ☐ Lead with *their* CAHPS number, not features | Stated interest in a pilot | — |
| **5** | **Pilot proposal** | ☐ Send the 1-page offer (Part D) ☐ Agree family count + metrics + 60-day window in writing ☐ Confirm anti-steering + PHI-minimization (Part C.5) | **Signed pilot agreement** | First signature by end of week ~6 |
| **6** | **Deliver** | ☐ Founder runs **every** pilot case by hand ☐ Family enrolls *itself* (no PHI handoff) ☐ Capture full outcomes row per case (Part B.2) ☐ Weekly check-in with the champion | ~10–15 happy families + hard outcomes data | Run all pilot cases over the 60 days |
| **7** | **Results review** | ☐ Build the proof sheet (Part E) ☐ Present families served, satisfaction, savings, time-to-resolution ☐ Tie to CAHPS + CoP | A **yes to a paid annual contract** | — |
| **8** | **Close + expand** | ☐ Send order form / MSA (counsel-reviewed) ☐ Counter-sign ☐ **Ask for 2 peer-hospice intros** ☐ Log MRR | **Recurring revenue + ≥1 referral** | The 90-day milestone |

### B.1 Pipeline hygiene rules
- **No lead sits >7 days** without a `next_action_date`. Stale = re-touch or mark dead with a `disposition` reason.
- **One stage at a time per hospice**, but run the *portfolio* in parallel — you want ~3–5 in Discovery while 1–2 are in Pilot.
- **Kill fast.** If a hospice won't book a call after 4 touches, mark it dead and move on. Pivot signal (bible risk register): if *no* UT hospice will pilot, shift lead channel to employers/EAPs.

### B.2 The outcomes you MUST capture during the pilot (Stage 6)

This is the entire point of L2 — the pilot is a **data-collection instrument** wearing a service. Per case, record into the `negotiations` / `negotiation_outreach` outcomes columns (migration `supabase/migrations/2026-06-22-negotiation-outcomes.sql`):

| Field | Column | Source |
|---|---|---|
| Listed price (family's original quote) | `negotiations.target_home_estimate_cents` | intake |
| Each home's quote | `negotiation_outreach.quote_cents` | GPL replies |
| Negotiated price (chosen home) | `negotiations.negotiated_price_cents` | advocacy |
| What the family paid the **home** | `negotiations.amount_paid_cents` | follow-up |
| Hidden fees surfaced | `negotiation_outreach.hidden_fees` (jsonb) | GPL review |
| Chosen home | `negotiation_outreach.chosen` | family choice |
| Savings vs listed | `negotiations.savings_vs_listed_cents` (generated) | computed |
| Satisfaction (1–5) | `negotiations.satisfaction_score` | post-case ask |
| Time to resolution | `outcome_recorded_at` − case start | derived |

Recording is done by the founder via `/admin/outcomes` (service-role, gated by `ADMIN_PREVIEW_KEY` — mirrors `/admin/vetting`). **Family data stays RLS owner-scoped; no hospice ever gets row-level PHI** — they get the *aggregate* report only (Part E). This is both a privacy stance and the anti-steering posture: we present neutral options, the family chooses, and the hospice sees outcomes, not steering.

---

## Part C — Warm-entry + outreach sequence

### C.1 Channel priority
1. **Warm intro** (NHPCO peer, UT hospice association, LinkedIn 2nd-degree, a clergy/social-worker contact). Highest conversion — always look here first.
2. **Direct email to the named champion** (the sequence below).
3. **Phone the bereavement coordinator** (script C.3).
4. **In-person** at a UT hospice/palliative event. Counts as a warm entry.

### C.2 Email sequence (4 touches over ~12 days, CAN-SPAM compliant)

> **CAN-SPAM checklist for every send:** truthful subject + "from"; you are clearly identified; **valid physical postal address** in the footer; a working **opt-out** ("reply STOP / tell me to stop and I won't write again") honored within 10 days. Even though this is B2B relationship outreach, comply fully — we are a trust brand. Personalize each send with *their* CAHPS number from Care Compare.

**Email 1 — the CAHPS hook (Day 0)**
> **Subject:** Your 13-month bereavement requirement — a free tool for your families
>
> Hi [First name],
>
> I run Honest Funeral, a neutral guide that helps grieving families through funeral pricing and the after-death paperwork — free to the family, and we take no money from funeral homes or insurers.
>
> I noticed [Hospice]'s Care Compare "emotional and spiritual support" score and wanted to reach out: every hospice owes families 13 months of bereavement support under Medicare (42 CFR 418.64), but nobody funds the funeral-and-admin maze your counselors aren't resourced to handle. We cover exactly that gap — and hand you a report that proves your families were supported, which is the kind of thing CAHPS asks about.
>
> Worth 20 minutes to see if it'd help your families? I'm in Utah and happy to come to you.
>
> [Name] · Honest Funeral · [phone] · honestfuneral.co
> [Physical postal address] · Reply "stop" and I won't write again.

**Email 2 — the neutrality proof (Day 3, if no reply)**
> Quick add to my last note: the reason a hospice can actually put us in a family's hands is that we're neutral by design — we present every option and the family chooses; we never steer to a specific home, and we take no funeral-home money. That's a legal requirement for you (anti-steering) and the core of what we are. One link, free to your families, and a compliance-friendly report back to you. Open to a short call this week or next?

**Email 3 — the offer (Day 7)**
> I'll make this concrete: a **free 60-day pilot** — we serve ~10–15 of your families at no cost to them or you, and at the end I show you families served, satisfaction, and dollars saved. No commitment, no budget needed. If it helps your families and your scores, we talk about a paid year. Can I send the one-page outline?

**Email 4 — break-up (Day 12)**
> I don't want to crowd your inbox — I'll leave it here. If supporting families through the funeral-and-paperwork maze (and having proof of it for CAHPS) is ever useful, I'm one reply away. Either way, thank you for the work you do for these families. — [Name]

### C.3 Cold-call script (bereavement coordinator)
> "Hi, is this [Name]? I'm [Name] with Honest Funeral — I'll be quick. We give grieving families a free, neutral guide through funeral pricing and after-death paperwork, and we hand the hospice a report proving the families were supported — which helps with your 13-month bereavement obligation and your CAHPS scores. We take zero money from funeral homes, so we're something you can actually put in a family's hands. Could I grab 20 minutes this week to see if it'd help your families?"
>
> *If "we already do bereavement":* "Totally — your counselors do the grief support. We handle the **funeral-pricing and admin maze** they aren't resourced for, and we give you the documented proof. We complement your program, we don't replace it."

### C.4 Discovery-call script (Stage 3)

Anchor every question on the **unfunded 13-month mandate** and **CAHPS**. Goal: confirm pain + identify the economic buyer.

1. **Program shape:** "Walk me through your bereavement program — who runs it, how you cover the full 13 months, how families actually engage?"
2. **The CoP burden:** "42 CFR 418.64 requires the organized program — where does keeping that running stretch you thinnest? Staffing? The volume after a death?"
3. **The CAHPS lever:** "How are your emotional-and-spiritual-support scores trending on Care Compare? What moves them?"
4. **The funeral/admin gap (our wedge):** "When a family's deciding on a funeral or drowning in paperwork after the death — death certificates, accounts, benefits — who helps them, and what does it cost your staff?"
5. **The cost of the gap:** "How many staff hours a week go to things outside grief counseling — funeral logistics, admin questions?"
6. **Decision path:** "If a free pilot proved this helped your families, who besides you would say yes?" *(→ names the ED / economic buyer.)*
7. **Close to pilot:** "I'd love to run a free 60-day pilot with ~10–15 of your families and show you the numbers. Can I send the outline?"

### C.5 Objection handling (memorize)

| Objection | Response |
|---|---|
| **"Is this steering / a kickback?"** | "No — and it can't be. We present *all* options, the family chooses, and we take **no** funeral-home money. That's precisely why a hospice can ethically use us — we're built to satisfy anti-steering law, not skirt it." |
| **"No budget."** | "The pilot is free for 60 days. You only consider paying once savings and satisfaction are proven on your own families." |
| **"We already do bereavement."** | "Your counselors do grief. We do the funeral-pricing + after-death admin maze they aren't staffed for — and hand you the CAHPS/compliance report." |
| **"How do we know the prices are right?"** | "Published methodology and real itemized GPL data — and during the pilot you'll see it on your own families, not a brochure." |
| **"What about our families' privacy?"** | "Families enroll themselves; we minimize health data; we never hand you anyone's private case — you get aggregate outcomes only. If you ever share PHI we'll put a BAA in place first." |
| **"Send me something."** | *Good signal.* Send the one-pager (Part D) same day, with a specific call time proposed. |

---

## Part D — The pilot offer + agreement outline

### D.1 The one-page pilot offer (the leave-behind)

> **Honest Funeral — Free 60-Day Bereavement Support Pilot for [Hospice]**
>
> **What you get:** A neutral guide for your families through funeral pricing and the after-death paperwork maze — free to them — plus a report proving you delivered it (supports your 42 CFR 418.64 obligation and your CAHPS emotional-and-spiritual-support measure).
>
> **What it costs you:** Nothing. 60 days, ~10–15 families, no commitment.
>
> **How it works:** You refer families to a neutral tool (no steering, ever). They enroll themselves. We help each family get itemized funeral prices, push back on overcharges, and navigate after-death admin. We take **no money from funeral homes or insurers** — ever.
>
> **What you'll see at the end:** families served · average savings per family · satisfaction score · time-to-resolution — a one-page proof sheet.
>
> **Then:** if it helped your families, we discuss a simple annual agreement. If it didn't, we shake hands and you owe nothing.

### D.2 Pilot agreement outline (keep it to ~1 page; **counsel-review before first signature**)

| Clause | Content |
|---|---|
| **Parties & purpose** | Honest Funeral + [Hospice]; a no-fee 60-day evaluation of family bereavement support. |
| **Term** | 60 days from signature; either party may end with written notice. |
| **Scope** | ~10–15 families referred by the hospice; HF provides neutral funeral-pricing advocacy + after-death navigation, **free to families**. |
| **Anti-steering (load-bearing)** | HF presents neutral options; family chooses; HF takes no funeral-home/insurer money and makes no paid referral. |
| **Family enrollment & privacy** | Families self-enroll; **no PHI shared** by the hospice in the pilot; if any health data is ever exchanged, a **BAA** is executed first. Hospice receives **aggregate** outcomes only. |
| **Success metrics (in writing)** | Families served, avg savings, satisfaction (≥ target), time-to-resolution. Define the numbers *here* so Stage 7 isn't a debate. |
| **No fee / no obligation** | Pilot is free; no obligation to contract; no exclusivity. |
| **IP & data** | HF owns its outcomes dataset (de-identified/aggregate); hospice owns its patient relationships. |
| **Endorsement** | If successful, hospice will (best-efforts) provide a testimonial + 1–2 peer intros. |

> **Counsel asks before Stage 5** (extends `LAWYER_BRIEF.md`): (1) anti-steering exposure in Utah for a hospice-referred neutral tool; (2) BAA / PHI-minimization trigger for self-enrollment; (3) a reusable pilot agreement + a follow-on MSA/order form; (4) savings-claim substantiation standard (FTC §5) for the proof sheet.

---

## Part E — The results proof sheet (Stage 7 template)

One page. Numbers only come from the captured outcomes rows (Part B.2) — **never publish a figure you can't defend** (guardrail #4). Where n is small, say so.

> **Honest Funeral × [Hospice] — 60-Day Pilot Results**
> *[Dates] · n = [families served]*
>
> | Metric | Result | How measured |
> |---|---|---|
> | Families served | **[N]** | enrolled + completed cases |
> | Avg. savings / family | **$[X]** | `savings_vs_listed_cents`, mean |
> | Total savings to your families | **$[Y]** | sum |
> | Families who saved | **[N of N]** | savings > 0 |
> | Satisfaction | **[X] / 5** | `satisfaction_score`, mean |
> | Avg. time to resolution | **[D] days** | case open → `outcome_recorded_at` |
> | Hidden fees caught | **[count] across [N] cases** | `hidden_fees` incidents |
>
> **Compliance value:** Documented support across [N] families during the 13-month bereavement window — evidence for 42 CFR 418.64 and a tailwind for your CAHPS emotional-and-spiritual-support score.
>
> **Two family quotes** *(consented, de-identified).*
>
> **The ask:** continue for all your families at **$[annual price]/year** (Part F). *(Plus: "Who are two peers who'd want this?")*

> Substantiation rule: only claim per-home or per-metro pricing publicly at **n>5 + significance** (guardrail #4). The proof sheet is a *private* aggregate for one hospice's own families — fine at any n if you state the n. Public Fair-Price Index numbers are a separate, higher bar.

---

## Part F — Pricing hypotheses to validate

Pricing is **deliberately not set** — these are hypotheses to test in pilots (Part 5 + Part 9 of the bible). Anchor on **value** (the unfunded mandate + CAHPS + staff hours saved), never on "software."

| Model | Hypothesis | Validate by |
|---|---|---|
| **Per-facility annual SaaS, tiered by census** *(primary)* | Small (<50 census) ~$X/yr · Mid (50–100) ~$2X · Large (100+) ~$3X. Predictable MRR; easy to budget. | Ask in Stage 7: "Is $[X]/yr defensible against the staff hours + CAHPS lift you saw?" |
| **Per-decedent-family fee** *(alternative)* | $Z per family served; scales with volume; lower commitment. | Offer as the fallback if annual feels too big for pilot #1. |
| **Hybrid** | Small base + per-family. | Only if both above stall. |

**Value-anchoring math to bring to Stage 7:** staff hours saved × loaded hourly cost + the CAHPS-penalty avoidance framing (a 4% APU swing on a small hospice is real money) + the "documented CoP compliance" line. The price should look small next to that.

**Guardrail on pricing:** the payer is the **hospice** (institution), never the family and never a funeral home/insurer. If a prospect proposes funeral-home co-funding or an insurer-as-payer arrangement, the answer is **no** — that's the one unrecoverable mistake (guardrail #1).

---

## Part G — MVP-for-one-hospice vs. later (explicit scope cuts)

| Capability | **MVP (pilot #1, build/do now)** | **Later (after first paid contract)** |
|---|---|---|
| CRM | A spreadsheet/Airtable with the Part A.3 fields | A real CRM + sequencing tool |
| Hospice "portal" | **None** — founder refers families by hand; family self-enrolls via the existing `/negotiate` flow | Scrappy partner portal (hospice enrolls/refers in 30s) |
| Reporting dashboard | **A hand-built proof sheet** from `/admin/outcomes` data | Live reporting dashboard reading outcomes (L3) |
| Outcomes capture | Founder records each case in `/admin/outcomes` (service-role, admin-gated) | Same, plus auto-rollups |
| Pilot delivery | **Founder runs every case personally** | Templatized playbook, then a hire |
| Contracts | One counsel-reviewed pilot agreement + simple order form | Reusable MSA + data terms + BAA template |
| PHI handling | **Avoid entirely** — self-enrollment, aggregate-only reporting | BAA + HIPAA-aware handling if a hospice insists on sharing PHI; SOC 2 path |
| Pricing | Quote a single tiered number, negotiate live | Published tiers validated across 3–5 hospices |
| Outreach scale | 20–30 UT hospices, by hand | Programmatic + a sales hire post-raise |

**Do NOT build for pilot #1:** the partner portal, a live dashboard, multi-state legal clearance, employer channel, or any new app routes. The MVP is **a spreadsheet, the existing app, `/admin/outcomes`, a hand-made proof sheet, and the founder's calendar.** Code work that *does* serve pilot #1: confirm the outcomes migration is applied and `/admin/outcomes` persists/reads correctly (P1 in the [ROADMAP](ROADMAP.md)).

---

## Part H — The 90-day operating cadence (against this playbook)

- **Weeks 1–4:** Build the 20–30 list (Part A); confirm outcomes capture works end-to-end; send first 10 outreaches; book first discovery calls; get the pilot agreement counsel-reviewed.
- **Weeks 5–8:** 10+ discovery calls; **sign 1–2 free pilots**; run every case by hand capturing all outcomes; weekly champion check-ins.
- **Weeks 9–12:** Build proof sheets; **ask for the paid contract + 2 peer intros**; write the decision memo vs. the scorecard.

**Weekly scorecard (log every Friday):** new hospice contacts · calls booked · discoveries run · pilots live · pilot cases delivered · paid contracts / MRR.

**The single milestone:** by **day 90, one hospice paying (or about to).** Everything in this doc exists to make that yes happen — and to prove it repeats.

---

### Sources (regulatory anchors verified)
- 42 CFR 418.64 — Condition of participation: Core services (13-month bereavement requirement): [eCFR](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-418/subpart-C/subject-group-ECFR35b48a647589673/section-418.64) · [Alliance for Care at Home — Bereavement CoP tip sheet](https://allianceforcareathome.org/wp-content/uploads/BereavementCoPTip_Sheet.pdf)
- CAHPS Hospice Survey (emotional & spiritual support measure, Care Compare reporting, 4% APU penalty): [CMS](https://www.cms.gov/medicare/quality/hospice/cahpsr-hospice-survey) · [AHRQ](https://www.ahrq.gov/cahps/surveys-guidance/hospice/index.html) · [Alliance — CAHPS & Star Ratings](https://allianceforcareathome.org/wp-content/uploads/CAHPS_Star_Ratings.pdf)
