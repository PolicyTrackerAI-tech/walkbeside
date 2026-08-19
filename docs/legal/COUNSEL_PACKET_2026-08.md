# Counsel engagement packet — first retained engagement (2026-08)

> **Status: DRAFT, founder-prepared with AI assistance. Not legal advice.**
> This is the cover document for the first retained-counsel engagement: what
> to send, what to ask first, and what our own research already says so the
> firm spends its hours confirming and correcting rather than discovering.
> It supersedes the question list in [`../LAWYER_BRIEF.md`](../LAWYER_BRIEF.md) §8
> where the two differ — this version incorporates an adversarially-verified
> research pass dated **2026-08-19** (full audit:
> [`../HOSPICE_PAYER_AUDIT_2026-08.md`](../HOSPICE_PAYER_AUDIT_2026-08.md)).
> The gate stands: **counsel review blocks the first hospice signature.**

---

## 1. The engagement in one paragraph

Honest Funeral is a free-to-family, institution-paid funeral-pricing and
end-of-life-navigation platform (full background:
[`../LAWYER_BRIEF.md`](../LAWYER_BRIEF.md) §§1–3). The founder intends to
sharpen the model to: **the hospice pays; the family receives an activation
code from their hospice in the admission packet; the code-linked service is a
full end-of-life planning experience.** Every position paper for that model is
pre-drafted in this folder (see [`README.md`](README.md)) — the firm's product
is (a) redlines of the drafts, (b) answers to the questions in §3 below, and
(c) a signed AKS/CMP memo, HIPAA business-associate position, and launch-state
clearance, which together unblock the first pilot signature.

## 2. What to send the firm (the packet contents)

1. This document, then [`../LAWYER_BRIEF.md`](../LAWYER_BRIEF.md) (business
   background + risk areas) and
   [`../HOSPICE_PAYER_AUDIT_2026-08.md`](../HOSPICE_PAYER_AUDIT_2026-08.md)
   (the current direction, its four risk phrases, and our verified research).
2. The drafts to redline: [`AKS_CMP_MEMO_DRAFT.md`](AKS_CMP_MEMO_DRAFT.md) ·
   [`HIPAA_BA_POSITION_DRAFT.md`](HIPAA_BA_POSITION_DRAFT.md) ·
   [`UTAH_CLEARANCE_DRAFT.md`](UTAH_CLEARANCE_DRAFT.md) ·
   [`HOSPICE_SERVICES_AGREEMENT_DRAFT.md`](HOSPICE_SERVICES_AGREEMENT_DRAFT.md) ·
   [`../sales/PILOT_AGREEMENT.md`](../sales/PILOT_AGREEMENT.md) ·
   [`ENTITY_PLAN_DRAFT.md`](ENTITY_PLAN_DRAFT.md).
3. The market research the positions were built on:
   `Honest_Funeral_Market_Research.pdf` (repo root), plus
   [`../COMPLIANCE_ADDENDUM.md`](../COMPLIANCE_ADDENDUM.md) and
   [`../ANTI_STEERING_EVIDENCE.md`](../ANTI_STEERING_EVIDENCE.md) (the
   anti-steering exhibit: what the code provably does not do).
4. Live-product artifacts (per LAWYER_BRIEF §7): the outreach email template
   (`lib/negotiation/email-body.ts`), `/terms`, `/privacy`, `/methodology`,
   `/our-role`, the partner portal flow, and a Supabase schema summary.

## 3. The prioritized questions (ask in this order)

The first three gate the pilot signature; the rest gate scale.

1. **HIPAA business associate — the decisive one.** Does hospice payment plus
   hospice-distributed, co-branded activation materials handed at admission
   (as part of the hospice's own 42 C.F.R. 418.64(d) bereavement program)
   convert the family relationship into "on behalf of" the covered entity
   under OCR's health-app framework? Our verification pass found OCR's
   recommend-vs-offer distinction **cuts against** our drafted non-BA position
   (the non-BA scenarios all lack the hire/payment fact present here); the
   position's surviving leg is the separate no-health-information element of
   the 45 C.F.R. 160.103 definition — exactly the paragraph
   [`HIPAA_BA_POSITION_DRAFT.md`](HIPAA_BA_POSITION_DRAFT.md) flags to
   pressure-test hardest. Can the AKS bereavement-procurement framing and the
   HIPAA consumer-service framing survive in the same services agreement?
2. **Fee structure.** The drafts mandate a flat census-tier FMV fee; the
   market research recommends per-family ($25–$75, the Help Texts pattern);
   the founder's phrasing ("paid for by the hospice treating that particular
   patient") points per-patient. Reconcile: can any per-patient form survive
   42 C.F.R. 1001.952(d), the Beneficiary Inducements CMP, and all-payer
   state brokering statutes (Fla. Stat. 817.505 — felony, no federal nexus)?
   Note both directions of the 2025–26 OIG signal: AO 25-08 and AO 26-15
   were **unfavorable on flat/subscription fees that bought referral
   access** — flatness alone is no defense — while volume-linked fees remain
   the classic aggravator. What FMV documentation must exist before the
   pilot contract, and can an invoice ever reflect activation counts at
   pilot scale (n<5) without becoming an identifiable disclosure?
3. **Hospice-side exposure** (the question that kills a pilot if missed).
   Does paying us while we present funeral homes create AKS, CMP, or state
   patient-brokering exposure for the **hospice**, and what proactive
   compliance packet should we hand its compliance officer? Does the launch
   state's hospice licensing code (Utah R432-750 first) constrain what a
   hospice may buy for or hand to families?
4. **The CMP reach question.** Does 42 U.S.C. 1320a-7a(a)(5) ("remuneration
   to any individual eligible for benefits") reach a benefit whose value runs
   to the FAMILY rather than the Medicare-beneficiary patient? And if any
   part of the service is ever gated to paying hospices' families, is the
   countable remuneration the full service value or the delta over the free
   public tier?
5. **Gating-without-charging — the corpus's blind spot.** The founder is
   considering making parts of the service non-free-to-everyone (families
   still never pay; access gates on a hospice code). No existing analysis
   covers it. What happens to (a) the funeral/broker licensing analyses that
   lean on "we charge families nothing," (b) the Utah CSPA posture, and
   (c) the site-wide "free to families, forever" claim under FTC §5 / state
   UDAP — and what claim rewrite must precede any gating?
6. **State constructions the direction sharpens.** (a) TX: does a
   hospice-paid engagement make our activities "funeral directing … for
   compensation" (Occ. Code 651.001(7)), and confirm the exact operative
   solicitation prohibition (§§651.459–651.460 — official sources were
   unreachable in our pass); (b) SC: does 40-19-20(19)(d) reach a paid
   third-party planner that provides none of the underlying services;
   (c) UT: construction of "facilitating a disposition" (58-9-102) — seek
   DOPL comfort or strategically not ask; (d) FL: when does platform-assisted
   pre-death planning for an identified dying patient become "mak[ing] an
   arrangement for a preneed contract" (497.452(1)(a), any person); (e) NJ,
   before any NJ presence: is a hospice worker handing our packet in-facility
   "solicitation in person" by our "agent" under 45:7-65.3, and does
   "similar health care facilities" cover home hospice?
7. **Contract drafting.** Lock the OIG AO 19-03 mitigation pattern into the
   services agreement as covenants with audit/termination rights:
   post-admission-only delivery; no pre-admission marketing use; family-
   initiated activation; supplemental-not-core 418.64(d) framing;
   aggregate-only reporting with the numeric n≥5 minimum cell size (now in
   §4.2 of the draft, matching the code's enforcement in
   `lib/partner-report.ts`).
8. **Advisory-opinion strategy.** Should we file our own OIG advisory-opinion
   request on the frozen pilot design (flat fee; post-admission handoff;
   family self-activation; bereavement framing) before or after pilot #1 —
   weighing the months-long timeline, requestor-only binding effect, and the
   still-unissued hospice ICPG that could reset compliance appetites
   mid-pilot?
9. **Disclosure.** Must (or should) the family-facing flow disclose "your
   hospice paid for this"? Does disclosure cut or add inducement risk?
   Relatedly: would any value flowing platform→hospice (even the free pilot)
   count as "financial remuneration" under 45 C.F.R. 164.501, converting the
   hospice's non-face-to-face link delivery into authorization-requiring
   marketing? (The admission-packet handoff itself is face-to-face-exempt.)
10. **Consumer-health-data overlay.** Independent of any hospice contract:
    does WA My Health My Data (private right of action, no HIPAA-entity
    exemption) reach a family member's use of the hospice-linked flow — and
    what consent surfaces, separate policy, and ad-tech restrictions must
    ship before knowingly serving WA/NV/CT residents? Is the platform a
    covered provider under the amended FTC Health Breach Notification Rule
    given the grief self-check and bereavement check-ins?
11. **Anti-steering line-drawing** for any future preference feature: can
    family-set preference FILTERS and "matches what you told us" presentation
    be squared with the anti-steering covenants and the n>5/defamation
    publish gate — and what exact on-screen neutral-ordering disclosure
    should ship? ("Best" rankings and home-level review scores are off the
    table per house law; this question is about the compliant filter design.)

## 4. What our own research concluded (pressure-test these)

Six load-bearing claims, each adversarially re-verified against primary
sources on 2026-08-19 (full citations in the audit §3):

| # | Claim (operative, post-verification) | Verdict |
|---|---|---|
| C1 | Funeral goods/services are payable by no federal health care program → the funeral-selection side sits outside the federal AKS; the only federal inducement vector is hospice selection/retention. | confirmed |
| C2 | Post-admission-only + unadvertised + family-self-activated is a defensible CMP/AKS posture **without any covering safe harbor** (nominal-value $15/$75; the promotes-access exception was limited in 2016 to Medicare/Medicaid-payable items); the position rests on AO 19-03/00-03/12-17 analogies plus 418.64(d) procurement framing; election revocability (418.28/418.30) keeps the influence analysis alive post-admission. | confirmed |
| C3 | Per-patient pricing is materially riskier than flat census-tier but not per se indefensible (1001.952(d) requires methodology-set-in-advance FMV, not flatness; AO 25-08/26-15 condemned flat fees that bought referral access). The repo's own drafts (flat-only) and research (per-family) conflict and need reconciling. | corrected |
| C4 | Whether hospice payment + co-branding + admission distribution makes us a HIPAA business associate is genuinely unresolved; OCR's recommend-vs-offer distinction cuts against the drafted non-BA reading; the surviving leg is the no-health-information element. | corrected |
| C5 | Gating today-free tools converts the benefit into countable provider-linked remuneration (value = the delta the code unlocks) and is analyzed nowhere in our corpus; it would make the "free forever" claim misleading and weaken (not break) the licensing defenses. | corrected |
| C6 | A "full-service from admission" system stays outside unlicensed-funeral-directing and preneed statutes only while we sell nothing, hold no funds, form no contracts, and document pre-death selections as expressly non-binding — necessary, not automatically sufficient. | confirmed |

## 5. Citation corrections already applied (2026-08-19)

So the firm does not inherit our earlier errors — each of these is fixed in
the repo as of this packet's date:

- **FL at-need solicitation anchor** was cited as §497.164; the definition is
  §497.005 and the disciplinary vehicle §497.152 (§497.164 is licensee
  rulemaking). Fixed in [`../LAWYER_BRIEF.md`](../LAWYER_BRIEF.md) §5.L.
- **TX solicitation scope** was described internally as licensee-scoped; Occ.
  Code §651.001 reaches "any other entity" contacting a person near death or
  their family. Fixed in [`../BUSINESS_PLAN.md`](../BUSINESS_PLAN.md) §15 and
  the root [`CLAUDE.md`](../../CLAUDE.md) channel rules.
- **The "FL, TX, ME, NE" four-state ban framing** overstated ME (preneed-only,
  licensee-only, 32 M.R.S. §1402) and NE (licensee discipline, §38-1424) and
  omitted **NJ** (45:7-65.3 — the broadest, any-person, in-facility statute).
  Fixed in [`CLAUDE.md`](../../CLAUDE.md).
- **Minimum cell size** in the services agreement §4.2 is now numeric (n≥5,
  matching `SMALL_SAMPLE_THRESHOLD`) and extended to bare counts and
  per-referral-link tallies, which the product bands below n=5 on every
  partner-visible surface — applied **server-side** (banded before anything
  reaches the partner's browser payload), with usage figures counted as
  **distinct families** rather than raw checks, and sub-cell counts (e.g.
  "families who saved") banded even inside an n≥5 cohort
  (`lib/partner-report.ts` `displayCount`, `lib/partner/codes.ts`,
  `lib/partner/report-data.ts`).

## 6. Soft spots we are asking the firm to attack, not bless

1. The dual-frame services agreement: AKS procurement framing ("supports the
   hospice's 418.64(d) program") vs. HIPAA consumer framing ("independent
   service the family elects") — the drafts choose language intended to hold
   both; confirm it can.
2. The no-PHI recital (§4.1) is circular if on-behalf-of is found — the
   drafts say so themselves. The reporting design (aggregate + n≥5 banding)
   is the mitigation; is it enough?
3. "Navigation, never arranging" under a paid, hospice-linked, pre-death
   engagement — the quote-request/outreach feature is our closest approach to
   "arranging/facilitating," and pre-death operation is where the any-person
   preneed statutes live.
4. Everything favorable in our federal position is analogy — no authority
   addresses a hospice paying a platform for a funeral-navigation family
   benefit. Tell us if the analogies are weaker than we think.
