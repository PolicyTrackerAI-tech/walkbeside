# Honest Funeral — Compliance Addendum (Institutional Pivot)

> **Status:** companion to the bible ([`OPERATING_PLAN.md`](OPERATING_PLAN.md) Part 8) and the realigned [`ROADMAP.md`](ROADMAP.md). This is the **delta** the B2B2C pivot introduces — it does **not** restate the existing legal docs. Read those first; this points at the gaps they don't cover.
>
> Ryan Currie · June 2026 · v1 · Not legal advice. Everything tagged **[COUNSEL]** is an explicit ask for the startup/healthcare/consumer-regulatory attorney engaged before the first institutional contract or any PHI handling (per bible Part 8).

---

## 0. What changed, and why a delta doc exists

The model flipped from **consumer-paid advocate** (family pays $49, we contact homes) to **institution-paid source of truth** (hospices/employers/insurers pay; families free; we present neutral options and never steer). That flip moves the legal center of gravity from *consumer-fee + outreach-deception* risk to **anti-steering law, HIPAA/BAA, institutional contracting, and FTC §5 claims substantiation on our own published data**.

The three existing docs were written for the old model. They remain ~80% valid (the funeral-rule leverage, the deterministic-template defense, privacy retention mechanics all carry over), but they are **silent** on the four pivot risks. This doc supplies only that silence.

### What each existing doc already covers vs. what's new here

| Topic | `LAWYER_BRIEF.md` | `CLAIMS_VALIDATION.md` | `PRIVACY_RETENTION.md` | **New in this addendum** |
|---|---|---|---|---|
| Funeral Rule / GPL leverage | §5A ✅ | §4 ✅ | — | Unchanged — carries over as-is |
| Funeral/broker licensing | §5B ✅ (highest priority) | §5 ✅ | — | Re-scoped: we no longer *negotiate as paid agent*, which **shrinks** this risk (see §1.4) |
| Anti-steering law | **absent** | absent | — | **§1 — entirely new; now the #1 launch gate** |
| HIPAA / BAA / PHI | §5F mentions CCPA only | absent | basic store/delete only | **§2 — entirely new** |
| Institutional contracts (pilot/MSA/data-use) | §5G consumer-fee only | absent | absent | **§3 — entirely new** |
| FTC §5 claims substantiation | §5D ✅ (savings claims) | §2 ✅ (price ranges) | — | **§4 — extends to our *published* Fair-Price Index + replaces the stale 2015 stat** |
| CAN-SPAM | §5E ✅ (outreach to homes) | §3 ✅ | — | **§5 — extends to institutional outreach + family transactional mail** |
| ToS / Privacy / consumer-fee | §5G, §5J ✅ | — | ✅ store/retain/delete | **§6 — institutional ToS + privacy rewrite for the B2B2C data flow** |
| Outreach deception (impersonation) | §4.1 ✅ | §3 ✅ (guaranteed by construction) | — | Unchanged — `buildOutreachEmail` defense still holds |
| Consumer $49 fee, refunds, secondary referrals | §3, §5G, §5H ✅ | §2 ✅ | — | **Mostly mooted** — see §7 (decommission removes the fee) |

**One-line takeaway for counsel:** the old brief's "does paid advocacy need a funeral/broker license?" was the launch gate. Under the new model the launch gate is **"can a hospice put our neutral tool in a grieving family's hands without it being an unlawful referral/steer, and what data agreement do we need to do it?"**

---

## 1. Anti-steering law (the new #1 launch gate)

**Why it's now central:** in the old model the family hired *us* to contact homes. In the new model a **hospice** (a healthcare provider, often with its own referral-disclosure duties) hands our tool to a grieving family. If our product looks like it funnels families to particular homes — or if the hospice looks like it's referring families to a commercial vendor for kickback — both we and the hospice have a problem. This is guardrail #3 *and* federal/state law.

### Design constraints engineers MUST honor (neutral-handoff design)

These are not preferences; they are the conditions under which a hospice can lawfully endorse us.

1. **Present ALL eligible homes, ranked only by neutral, disclosed criteria.** The directory (`lib/negotiation/directory.ts`) already returns `active = true AND vetted = true` homes. Constraint: **ordering must be deterministic and neutral** (distance, then name/rating) and the criterion must be **shown on screen**. No paid placement, ever (guardrail #1 already forbids home money — keep the ordering logic free of any field that could become a paid signal).
2. **No "recommended home."** The L1 `/funeral-homes` directory and the L2 negotiate results must never render a single highlighted/CTA'd home as *the* pick. The family selects; we present. (The `chosen` column added in `2026-06-22-negotiation-outcomes.sql` records the family's *own* selection after the fact — it must never become an input that pre-selects for the next family.)
3. **The hospice/partner handoff is a neutral tool link, not a referral to a vendor.** When the partner portal (L3, net-new) lets a social worker hand the tool to a family, the artifact handed over is **"a free neutral funeral-pricing tool,"** worded identically regardless of which homes exist near that family. Build the handoff copy as a single reviewed constant, the way `buildOutreachEmail` is a single deterministic template — so neutrality is guaranteed by construction, not by per-case discretion.
4. **No financial relationship that could read as a kickback flows to the home selection.** Already true (we take no home money). Engineering constraint: the partner reporting dashboard (L3) must report **aggregate outcomes** (families served, satisfaction, savings, time-to-resolution), never "we sent N families to Home X" — that framing would convert a neutral tool into a referral log.
5. **Geo-gating stays available.** Keep the ability (noted in `LAWYER_BRIEF.md` §6 and §9) to limit the at-need flow to counsel-cleared states. The pivot makes this *more* important: each launch state may treat hospice→vendor handoffs differently.

### [COUNSEL] checklist — anti-steering

- [ ] **Per launch state** (start: **Utah**), is a hospice's handoff of our free neutral tool to a family a prohibited "referral for consideration," an FTC Funeral Rule steering issue, or clean? Map Utah first; gate the rest.
- [ ] Does any state bar a *third party* (us) from presenting a curated set of funeral homes even when neutral and unpaid-by-homes? Distinguish "directory/information service" (safe) from "referral service/broker" (regulated).
- [ ] **Anti-Kickback / safe-harbor read** — even though no money flows *to* homes, does a **hospice paying us** while we present homes create any anti-kickback or patient-brokering exposure for the *hospice*? (This is the question that kills a pilot if missed.) Confirm the hospice's own referral-disclosure obligations are satisfied by our neutral framing.
- [ ] Exact on-screen disclosure language for the neutral-criteria ordering and the "we present, you choose, we take no funeral-home money" statement.
- [ ] Sign-off gate: **no new launch state goes live until counsel clears its anti-steering posture** (mirror risk-register row in bible Part 13).

**MVP-for-one-hospice scope cut:** for the first Utah pilot we only need Utah cleared and the founder running cases by hand. We do **not** need a 50-state anti-steering map, automated geo-gating UI, or multi-state partner contracts yet — those are "later."

---

## 2. HIPAA / BAA for hospice data (entirely new)

**Why it's new:** the old model never touched a covered entity. A hospice is a HIPAA covered entity; the moment it shares a patient/family identifier with us *for our service*, we likely become a **business associate** and need a **BAA** — and our whole trust brand makes a breach existential (bible Part 13: "over-invest here").

### The strategy that minimizes this risk: don't become a BA if we can avoid it

| Approach | PHI exposure | BAA needed? | Use when |
|---|---|---|---|
| **(A) Family self-enrollment** (hospice gives the family a link/flyer; family enters their own info into our consumer app) | The family is the source; hospice shares no PHI with us | **Likely no BAA** — we're acting for the consumer, not handling the hospice's PHI | **MVP — default for the first pilot** |
| **(B) Social-worker-assisted enrollment** (worker types family info into a partner form) | Minimal identifiers, family-authorized | Possibly — depends on whether the worker is acting as the CE | Later, if self-enroll friction is too high |
| **(C) Hospice sends us a referral list / census** (names of decedents/families) | Direct PHI transfer from CE to us | **Yes — BAA required, full HIPAA stack** | Avoid in MVP; only with BAA + SOC 2 in flight |

**Design constraints engineers MUST honor (PHI minimization):**

1. **Prefer self-enrollment (A) for the pilot.** The existing consumer auth + `profiles`/`negotiations` flow already supports a family signing themselves up. The partner portal's MVP is a **link generator + a flyer**, not a PHI intake form.
2. **Collect the minimum.** We already store family email, deceased name, zip, scenario (`PRIVACY_RETENTION.md` table). Do **not** add diagnosis, hospice medical record numbers, dates of death/admission, or any clinical field. None of the pivot features need PHI beyond what the family voluntarily enters.
3. **Segregate any partner-attributable identifier.** If a pilot uses a partner code to attribute a family to a hospice, that code must live on a non-clinical column and never be joined to anything that would make the dataset PHI. Outcomes columns (`negotiated_price_cents`, `satisfaction_score`, etc.) are financial/satisfaction analytics — keep them PHI-free.
4. **RLS stays owner-scoped; reporting reads aggregate.** Family rows stay private under the existing `negotiations_owner` / `outreach_owner` RLS (unchanged by the outcomes migration, per its header comment). The L3 reporting dashboard must read **aggregated, de-identified** outcomes via the service-role key behind the same admin gate (`lib/admin-auth.ts`), never per-family PHI. A hospice sees "12 families served, avg satisfaction 4.6, avg savings $X" — not a roster.
5. **Service-role access is logged and gated.** Mirror `app/admin/vetting` exactly: service-role client + `requireAdminPage`/`requireAdminApi` (`isAdminEmail` allowlist). Set `ADMIN_EMAILS` in prod (the env validator enforces this when `OUTREACH_LIVE` is on — extend that enforcement to the partner dashboard).
6. **De-identification threshold before any cross-family aggregate is shown to a partner:** reuse the public-claim rule from the bible (n>5 + significance). A partner-facing number computed on <6 families must be suppressed, not shown.

### [COUNSEL] checklist — HIPAA/BAA

- [ ] Under approach (A) **family self-enrollment**, do we avoid business-associate status entirely? Confirm the line where assisted enrollment (B) or a referral feed (C) crosses into requiring a BAA.
- [ ] Provide / review a **standard BAA** we can sign if a hospice insists on (B)/(C), and the minimum HIPAA Security Rule controls we must have first.
- [ ] Are decedent identifiers PHI here, and does a family voluntarily entering a deceased relative's name change the analysis?
- [ ] **SOC 2 path** — what's the minimum security posture for the first paid contract vs. for scaling? (See `SECURITY.md` — extend it with the SOC 2 roadmap.)
- [ ] Breach-notification obligations if we ever do hold PHI (vs. the CCPA/state breach duties already flagged in `LAWYER_BRIEF.md` §5F).

**MVP-for-one-hospice scope cut:** ship approach **(A) only**. No BAA, no PHI intake, no referral feed for the first pilot. SOC 2 is a *path*, not a pilot blocker — but a written security one-pager and the de-identification threshold **are** pilot blockers.

---

## 3. Institutional contracts (entirely new — there was no B2B contract before)

The old model had a $49 consumer charge (Stripe Checkout) and a refund SOP. The new model needs a **contract stack** we've never drafted.

### The three documents the pivot requires

| Doc | Purpose | When | MVP scope |
|---|---|---|---|
| **Pilot Agreement** | Free 60-day pilot, ~10–15 families, metrics in writing, no fee, clear data-use, easy exit, no PHI under approach (A) | **Stage 5 of the sales process** (bible Part 5) — the first thing we need | **Required for pilot.** Short (2–4 pp). Must state: free, neutral, no funeral-home money, family self-enrolls, we report aggregate outcomes, either party can end it. |
| **MSA + Order Form** | Paid annual contract: per-facility SaaS or per-decedent-family fee, term, SLAs, liability cap, indemnity, insurance | **Stage 8** — only when converting a pilot to paid | Later. Don't draft until a pilot is converting. |
| **Data-Use Terms** | Our right to use de-identified outcomes data in the aggregate Fair-Price Index + dataset moat; the partner's confidentiality | Folded into the pilot agreement first, formalized in the MSA | **Pilot version required** — this is what protects the moat. |

**Design/operational constraints engineers + founder MUST honor:**

1. **The data-use grant is load-bearing for the moat.** Every pilot/MSA must grant us the right to use **de-identified, aggregated** outcomes for the Fair-Price Index and dataset. Without it, the data we collect can't legally fuel the product the bible is built around. Engineers: ensure the export pipeline that feeds the Index pulls only fields the data-use terms cover.
2. **Billing reuses Stripe, repurposed.** `CLAUDE.md` notes Stripe is "being repurposed from consumer fee to institutional billing." Constraint: the consumer $49 charge path (`app/api/stripe/checkout`) is being decommissioned (§7); institutional billing is a **separate** Stripe product (invoice/subscription per facility), not the consumer Checkout flow. Do not reanimate the consumer charge.
3. **Liability cap + E&O.** The bible Part 8 flags E&O / general-liability insurance "before scaling." A paid MSA needs a liability cap aligned to the policy.

### [COUNSEL] checklist — contracts

- [ ] Draft a **reusable pilot agreement** (free, 60-day, ~10–15 families, no PHI, aggregate reporting, mutual exit, **de-identified data-use grant**).
- [ ] Draft the **MSA + order form** template (per-facility annual SaaS *and* per-decedent-family alternatives per bible Part 5), with term, liability cap, indemnity, confidentiality.
- [ ] **Data-use terms** — confirm our right to use de-identified aggregate outcomes in a public Index; confirm the partner can't claim ownership of our dataset.
- [ ] Insurance: what E&O / general-liability coverage before the first paid contract?
- [ ] Confirm all contracts/Stripe/domains sit in the **entity's** name (bible says Delaware C-corp; `LAWYER_BRIEF.md` §6 still says LLC — **reconcile this**: the bible Part 8 specifies a Delaware C-corp, the brief assumes an LLC. [COUNSEL] confirm entity form for the pivot.).

**MVP-for-one-hospice scope cut:** **pilot agreement only** (with the data-use grant inside it). MSA, order form, and insurance wait until a pilot is converting to paid.

---

## 4. Claims substantiation under FTC §5 — extended to our *own published* data

**What's already covered:** `LAWYER_BRIEF.md` §5D and `CLAIMS_VALIDATION.md` §2 already flag the consumer-facing savings/fair-price claims ("overpay $2,000–$5,000," "save $1,500–$3,000," deal ratings on named homes) as needing substantiation. That analysis still holds. **Keep those disclaimers.**

**What's new with the pivot:** the bible makes a **published Fair-Price Index** (national + per-metro, quarterly, with a press headline like "Families in [metro] overpay by $X") a core product and the PR/AI-citation engine. The instant we publish a number under our own name, **FTC §5 substantiation and defamation/trade-libel exposure attach to *our* claim**, not an industry source's.

### New design constraints engineers MUST honor (the "never publish a number we can't defend" guardrail, in code)

1. **Replace the stale 2015-era variation stat.** The "same-metro variation 100–200%+ / only ~18% post prices online" figures in the bible Appendix and on L1 pages are **industry-sourced, not ours**. Constraint: tag every such figure with its source in code/CMS, and **swap to our own data the moment we have it** (the GEO strategy in bible Part 6 literally requires an *original* stat per page). Until then, attribute — never present a borrowed stat as our finding.
2. **n>5 + statistical significance before ANY home-level or metro-level public number.** This is bible guardrail #4 and Part 4. Build it as a **publish gate**: the Index/methodology pipeline must refuse to emit a per-home or per-metro figure computed on ≤5 records or without significance. No manual override that bypasses the gate.
3. **Publish a methodology page + a public mistakes page** (bible Part 7 trust spine; `ROADMAP.md` P2 lists both as gaps). The methodology page is the substantiation artifact counsel will point to. The mistakes page (the GiveWell move) is part of the §5 defense — visible correction practice.
4. **Single-home figures are never defamatory by construction.** The outcomes data per home (`negotiation_outreach.listed_price_cents`, `negotiated_price_cents`, `hidden_fees`) is family-private under RLS. Constraint: it may feed **aggregate** Index figures only; **no per-named-home public claim** without n>5, significance, and counsel review. The `hidden_fees` jsonb especially must never surface publicly against a named home.

### [COUNSEL] checklist — claims substantiation

- [ ] What substantiation standard applies to a **quarterly published Fair-Price Index** under FTC §5 (vs. consumer ad claims)? What disclaimers/methodology suffice?
- [ ] **Defamation / trade-libel** review of the publish-gate: at what n and significance can we publish a metro figure? A per-home figure (if ever)?
- [ ] Confirm the methodology page + mistakes page satisfy the substantiation-record expectation.
- [ ] Sign off on replacing borrowed stats with our own once volume exists; advise on attributing borrowed stats meanwhile.

**MVP-for-one-hospice scope cut:** for the first pilot we are **not** publishing an Index yet (it's bible Weeks 9–12 / `ROADMAP.md` P4). MVP only needs: borrowed stats correctly attributed in code, and the publish-gate (n>5 + significance) *designed* so it's ready when the Index ships. Defamation review waits until just before first publication.

---

## 5. CAN-SPAM — extended to institutional + family transactional mail

**What's already covered:** `LAWYER_BRIEF.md` §5E and `CLAIMS_VALIDATION.md` §3 cover CAN-SPAM on **outreach to funeral homes**. That's already built defensively: `lib/negotiation/email-body.ts` includes a one-click HMAC opt-out (`funeralHomeOptOutUrl`) and a `postalAddressLine()` in every outreach body, plus the `OUTREACH_LIVE` kill switch in `lib/negotiation/send.ts` and the `vetted = true` directory gate. **This carries over unchanged.**

**What's new with the pivot:** two new email audiences.

1. **Institutional cold outreach** (founder emailing 20–30 Utah hospices, bible Part 5 Stage 2). These are commercial B2B emails → **CAN-SPAM applies**: honest headers, physical address, working opt-out. Constraint if/when this is sent through our infra (Resend): route it through a path that appends the same `postalAddressLine()` + an unsubscribe, mirroring the outreach template. Founder hand-sent emails from a personal/work inbox still need an address + opt-out line.
2. **Family transactional/relationship mail** (welcome, case updates). Mostly transactional (CAN-SPAM-lighter), but any nurture/marketing content needs the footer + unsubscribe. The existing footer/unsubscribe compliance work (task #14 in the tracker) covers this — confirm it still applies post-pivot.

### [COUNSEL] checklist — CAN-SPAM

- [ ] Confirm hospice cold-outreach emails are CAN-SPAM-compliant (header honesty, physical address, opt-out) and whether B2B changes anything.
- [ ] Confirm the existing funeral-home opt-out + family footer mechanics meet the bar; no change expected.

**MVP scope cut:** the funeral-home outreach mechanics are done and gated off. For the pilot, hospice outreach is low-volume founder-sent — just ensure address + opt-out are present. No new email infrastructure needed.

---

## 6. ToS / Privacy updates for the B2B2C data flow

**What's already covered:** `PRIVACY_RETENTION.md` covers what we store, retention, self-serve deletion (`/api/account/delete` cascade), and backups. `LAWYER_BRIEF.md` §5F/§5J cover CCPA/CPRA and advice disclaimers. **All carries over.**

**What's new with the pivot:** the privacy policy and ToS were written for *consumer-only* data. They are now **silent** on:

1. **The institutional data flow.** We must disclose that a family may arrive via a hospice/employer partner, that we report **de-identified aggregate** outcomes to that partner, and that we use de-identified outcomes to build a public Index/dataset. (`PRIVACY_RETENTION.md` says "We never sell data and never share a family's email with funeral homes" — extend it to "and we share only de-identified aggregates with institutional partners.")
2. **Partner-side terms.** A new institutional ToS / order-form terms govern the *partner's* use of our portal and dashboard (separate from the consumer ToS).
3. **Consumer-fee language removal.** The consumer ToS still describes the $49 charge and 14-day refund (`REFUND_SOP.md`, now legacy). These must be scrubbed when the decommission lands (§7).

### [COUNSEL] checklist — ToS/Privacy

- [ ] Rewrite the **consumer privacy policy** to disclose: partner-referred arrival, de-identified aggregate reporting to institutions, use of de-identified outcomes in a public Index/dataset, and retention of outcomes data.
- [ ] Draft **institutional ToS / portal terms** (partner's obligations, confidentiality, data-use, no funeral-home-money representation).
- [ ] Remove all **consumer-fee / refund** language from the ToS when the $49 charge is decommissioned (coordinate with `PAYMENT_DECOMMISSION.md`).
- [ ] Add the **retention auto-purge** policy (`PRIVACY_RETENTION.md` recommends 12-month purge of closed negotiations) to the privacy policy if a launch state requires it — but reconcile with the data-use grant (we keep **de-identified aggregates** indefinitely for the Index; we purge **identifiable** case data).

**MVP scope cut:** for the pilot we need (a) the privacy policy updated to cover de-identified aggregate sharing, and (b) the consumer-fee language removed. Full institutional ToS can ship with the first *paid* MSA, not the free pilot.

---

## 7. The consumer-fee compliance items the pivot *retires*

The pivot **removes** a whole risk surface the old brief spent §3, §5G, §5H, and `REFUND_SOP.md` on. Once [`PAYMENT_DECOMMISSION.md`](PAYMENT_DECOMMISSION.md) lands (guardrail #2 — never charge the family), these become **moot** and should be marked legacy, not asked of counsel:

- ❌ Consumer service-fee / brokerage-fee characterization (`LAWYER_BRIEF.md` §5G)
- ❌ 14-day conditional refund policy + disclosure (`REFUND_SOP.md`)
- ❌ Sales/service tax on the $49 digital service
- ❌ Secondary consumer referral revenue — insurance-producer licensing, lending rules, attorney-referral bar rules (`LAWYER_BRIEF.md` §5H) — **dropped** (referral revenue would also risk guardrails #1/#3; not pursued)

**One caveat that does NOT retire:** the deterministic outreach-template defense (`buildOutreachEmail`, `CLAIMS_VALIDATION.md` §3) stays load-bearing — we still email homes as the family's named advocate. Keep the template review on the counsel list (`LAWYER_BRIEF.md` §4.1, §8.2).

---

## 8. Consolidated counsel checklist (ask in this order)

Re-prioritized for the pivot. The old brief's #1 (consumer licensing) drops; anti-steering rises to #1.

1. **Anti-steering (§1)** — *gates the first pilot.* Can a Utah hospice hand our free neutral tool to a family lawfully? Any anti-kickback/patient-brokering exposure for the hospice? Per-state, Utah first.
2. **HIPAA/BAA (§2)** — does **family self-enrollment (approach A)** keep us out of business-associate status? Where's the line, and what's the SOC 2 path?
3. **Pilot contract + data-use grant (§3)** — draft the reusable free-pilot agreement with the de-identified data-use grant. Reconcile entity form (C-corp vs LLC).
4. **Claims substantiation for a *published* Index (§4)** — standard, disclaimers, defamation review of the publish-gate (n>5 + significance). (Needed before first Index, not first pilot.)
5. **CAN-SPAM on hospice outreach (§5)** — confirm compliant; low effort.
6. **ToS/privacy rewrite (§6)** + scrub consumer-fee language (§7).

**Carry-over from `LAWYER_BRIEF.md` (still ask):** outreach-template representation (§4.1), funeral/broker licensing **re-scoped** now that we no longer negotiate as a paid agent (confirm the lighter footprint), privacy for sensitive bereavement data (§5F).

---

## 9. Design constraints summary (the engineer-facing contract)

A single list of the non-negotiable build rules this addendum imposes, each traceable to a guardrail and a real code surface:

| # | Constraint | Guardrail | Code surface |
|---|---|---|---|
| 1 | Directory/results ordered by neutral, **on-screen-disclosed** criteria; no paid signal, no "recommended home" | #1, #3 | `lib/negotiation/directory.ts`, `/funeral-homes`, negotiate results UI |
| 2 | Partner handoff artifact is a single reviewed constant ("free neutral tool"), identical regardless of local homes | #3 | L3 partner portal (net-new) |
| 3 | Partner reporting is **aggregate only**, n>5 + significance, never a per-family roster or "sent to Home X" log | #3, #4 | L3 dashboard reads outcomes via service role + `lib/admin-auth.ts` |
| 4 | **Family self-enrollment (approach A)** is the default; no PHI intake; collect the minimum | #2, #5 | existing consumer auth + `profiles`/`negotiations`; partner portal = link generator, not intake |
| 5 | Family case data stays RLS owner-scoped; outcomes columns PHI-free; admin/dashboard reads de-identified aggregates via service role | #4 | `negotiations_owner`/`outreach_owner` RLS (unchanged by `2026-06-22-negotiation-outcomes.sql`); mirror `app/admin/vetting` |
| 6 | **Publish-gate**: Index/methodology pipeline refuses any per-home/per-metro figure with ≤5 records or no significance; no override | #4 | net-new Index pipeline; methodology + mistakes pages (`ROADMAP.md` P2/P4) |
| 7 | Borrowed stats attributed in code until replaced by our own data | #4 | L1 pages, bible Appendix figures |
| 8 | Institutional billing is a **separate** Stripe product; consumer $49 path decommissioned, not reanimated | #1, #2 | `app/api/stripe/checkout` (remove per `PAYMENT_DECOMMISSION.md`); new institutional billing |
| 9 | `OUTREACH_LIVE` stays off; single send path `sendOutreachForNegotiation`; `vetted = true` gate intact | #1, #3 | `lib/negotiation/send.ts`, `lib/negotiation/directory.ts` |
| 10 | `ADMIN_EMAILS` set in prod; partner dashboard behind `requireAdminPage`/`requireAdminApi`; extend env validator to enforce it | #4 | `lib/admin-auth.ts`, `lib/env.ts` |

---

## 10. MVP-for-one-hospice vs. later (explicit scope cut)

**Required to run the first free Utah pilot (Weeks 1–8):**
- Utah anti-steering cleared by counsel (§1)
- Family self-enrollment confirmed BAA-free (§2, approach A)
- Reusable pilot agreement + data-use grant (§3)
- Privacy policy updated for de-identified aggregate sharing; consumer-fee language scrubbed (§6, §7)
- Hospice outreach emails carry address + opt-out (§5)
- Security one-pager + de-identification threshold (n>5) wired into any partner-facing number (§2, §9)
- Entity form reconciled (§3)

**Explicitly deferred to "later" (do NOT build/draft for the pilot):**
- 50-state anti-steering map + automated geo-gating UI (§1)
- BAA + full HIPAA Security Rule stack + SOC 2 certification (§2 — *path* only now)
- MSA, order form, E&O insurance, institutional ToS (§3, §6 — wait for a converting pilot)
- Fair-Price Index publication + defamation review + methodology/mistakes pages live (§4 — Weeks 9–12)
- Any PHI intake (approaches B/C), referral feeds, secondary consumer referral revenue (§2, §7 — avoid)

**The one compliance milestone that gates everything:** by the first pilot, counsel has cleared **Utah anti-steering** and confirmed **family self-enrollment keeps us out of BAA territory**, and we have a **signed pilot agreement with a de-identified data-use grant**. Without those three, the pilot can't lawfully run. Everything else is "later."
