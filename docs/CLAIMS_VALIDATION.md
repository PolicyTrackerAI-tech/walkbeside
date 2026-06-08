# Honest Funeral — Claims Validation Audit

Every factual claim the product makes, where it lives, how confident we are,
and what must happen before launch. Four classes: **faith**, **fee/pricing**,
**outreach/outflow**, **rights/legal**. Regulatory analysis lives in
`docs/LAWYER_BRIEF.md`.

Confidence key: ✅ verified · 🟡 needs verification · 🔴 known-unvalidated / risk.

---

## 1. Faith claims 🔴 (built from model knowledge — none expert-verified)

**Source:** `lib/faith-traditions.ts` — 11 top-level traditions + 6 sub-profiles
(~80 discrete claims: disposition norm, timeline, embalming norm, decline
scripts, community notes per profile).

**Status:** Written from training knowledge with cited sources, but **not one
has been verified by a domain expert or against a live source.** Every claim is
tagged `// TODO-FD:` in code.

**Tooling built for this:** `/admin/faith-qa` renders all profiles for a single
review pass with status toggles + a copyable corrections export. This is the
validation mechanism — it needs a qualified reviewer (clergy / funeral director
/ community authority) to run through it.

**Highest-risk claims** (wrong here = we actively misadvise a grieving family
on a religiously binding matter):
- **"Cremation required"** — Hindu, Sikh. **"Cremation forbidden / burial
  required"** — Muslim, Orthodox Jewish, Eastern Orthodox. A reversed claim
  here is the worst failure mode in the product.
- **Burial-timing claims** — "within 24 hours" (Muslim, Orthodox Jewish). Acting
  on a wrong timeline has real consequences.
- **Embalming "forbidden"** — Jewish, Muslim. Decline scripts that assert this.
- **Denominational splits** — Reform vs Orthodox Jewish, Sunni vs Shia: the
  engine now branches on these (decide-engine), so an error propagates into the
  recommendation.

**Action:** Do **not** present faith content as authoritative until reviewed.
Consider a visible "general guidance, confirm with your clergy" disclaimer on
`/faith/*` and the decide flow until expert sign-off. Pre-launch blocker.

---

## 2. Fee & pricing claims

| Claim | Where | Status |
|---|---|---|
| Flat **$49**, only when family picks a presented home | `lib/stripe.ts`, homepage, /faq, /how-it-works, /prices, /terms, negotiate flow | ✅ consistent everywhere; old "20% of savings / capped $500" model fully removed |
| No commissions/kickbacks/listing fees from homes | /about, /faq, /how-it-works | ✅ true today (keep true) |
| Fair-price ranges per ZIP | `lib/pricing-data.ts`, /prices, /prep | 🔴 **national benchmarks, NOT validated against local price lists.** Code comments now say this. Displayed to families as a "fair range." |
| "Families overpay $2,000–$5,000" / "save $1,500–$3,000 on direct cremation" | homepage, /faq, /planning | 🟡 industry-sourced but **needs substantiation** for FTC §5; pair with sourcing/disclaimer |
| Deal rating good/fair/overpriced on a specific home | analyzer, compare | 🟡 opinion about a named business — see lawyer brief §4.4 |

**Action:** (a) keep $49 consistent (done); (b) before representing price ranges
as locally "fair," either validate against real GPLs (ties to the data work) or
disclaim clearly; (c) get counsel's read on savings-claim substantiation.

---

## 3. Outreach / outflow claims ✅ (validated at source; needs runtime guard)

**The site claims:** outreach is *transparent*, sent *by Honest Funeral as the
family's named advocate*, *never impersonating the family*, *not anonymous*, and
*invokes the FTC Funeral Rule* to request a GPL.

**Verified against `lib/negotiation/prompts.ts`:** the system prompts enforce
exactly this — repeatedly: *"You are NOT the family,"* *"Identify clearly that
the email is from Honest Funeral,"* *"Never claim to BE the family,"* *"Never use
deceptive language."* Signature blocks are required. ✅ The claim matches the
generator's intent.

**Gap 🟡:** the emails are **LLM-generated**, so intent ≠ guarantee. A model
slip could produce first-person-family language and silently violate our single
most important legal representation (lawyer brief §4.1).

**Action (pre-launch):** add an automated **pre-send guard / eval** that blocks
any outreach email which (a) lacks the Honest Funeral identification + signature,
or (b) contains first-person-bereaved phrasing ("my husband," "we lost," "after
my loss"). Cheap, deterministic, and it converts a claim into a guarantee. Also
add the family **authorization reference** to every email (the field exists in
`OutreachContext`) — confirm it's always populated.

**Quote parsing (`summarizeQuoteSystem`, analyzer):** extracts numbers from home
replies/price-list photos. 🟡 No confidence threshold or human check today —
a misread price could mislead. Recommend confidence scoring + "verify against
the original" disclaimer.

---

## 4. Rights / legal-content claims

**Source:** `/rights`, `/prep`, `lib/scenarios.ts`, `lib/pricing-data.ts` notes.

| Claim | Status |
|---|---|
| Embalming not legally required in most states (refrigeration alternative) | ✅ accurate to FTC Funeral Rule; `pricing-data` note already adds the state-nuance caveat |
| You may buy a casket from a third party; the home must accept it free of handling fee | ✅ FTC Funeral Rule |
| Home must provide an itemized GPL on request | ✅ FTC Funeral Rule |
| Grave liner/vault required by cemetery, not by law | ✅ generally accurate; cemetery-specific |
| Cremation needs only a combustible container; home must offer a low-cost alternative | ✅ FTC Funeral Rule |
| State-specific embalming / vault nuances | 🟡 `/rights` tagged `TODO: expert review`; embalming timing rules vary ~15 states |

**Action:** these are the most defensible claims (grounded in federal law).
Keep the state-nuance caveats; have counsel confirm the few state-specific lines.

---

## 5. Regulatory

See **`docs/LAWYER_BRIEF.md`** — licensing (does advocate outreach need a
funeral/broker license?), outreach representation, advertising substantiation,
privacy, fee model. Licensing is the pre-launch gating question.

---

## 6. Pre-launch action checklist (prioritized)

1. 🔴 **Faith content** — expert review via `/admin/faith-qa`; disclaim until
   signed off. (Wrong religious advice is the worst failure mode.)
2. 🔴 **Licensing read** — lawyer brief §B; gates whether/where outreach can run.
3. 🟡 **Outreach pre-send guard** — deterministic check that emails identify HF
   and never speak as the family. Converts our key legal claim into a guarantee.
4. 🟡 **Price-range honesty** — validate against real GPLs OR add a clear
   "national estimate, not locally verified" disclaimer before launch.
5. 🟡 **Savings-claim substantiation** — sourcing/disclaimer per counsel.
6. 🟡 **Quote-parse confidence** — threshold + "verify original" note.
7. ✅ **Fee = $49** — done, verified consistent.
8. ✅ **Positioning** — FD/sister claims removed; provenance corrected.
