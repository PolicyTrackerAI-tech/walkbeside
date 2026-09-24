# DMV Legal Overview: one market, three jurisdictions (DRAFT)

> **DRAFT for counsel. Not legal advice.** Prepared 2026-09-23, when Utah
> went cold and the DC metro became the launch market. It sits on top of
> three jurisdiction memos:
> [`DC_CLEARANCE_DRAFT.md`](DC_CLEARANCE_DRAFT.md),
> [`MD_CLEARANCE_DRAFT.md`](MD_CLEARANCE_DRAFT.md),
> [`VA_CLEARANCE_DRAFT.md`](VA_CLEARANCE_DRAFT.md). The federal positions
> ([`AKS_CMP_MEMO_DRAFT.md`](AKS_CMP_MEMO_DRAFT.md),
> [`HIPAA_BA_POSITION_DRAFT.md`](HIPAA_BA_POSITION_DRAFT.md)) carry over
> unchanged. Business registrations and tax are in
> [`DMV_OPERATING_REGISTRATIONS_DRAFT.md`](DMV_OPERATING_REGISTRATIONS_DRAFT.md).
> The counsel ask list is
> [`COUNSEL_PACKET_DMV_2026-09.md`](COUNSEL_PACKET_DMV_2026-09.md).

## 1. The bottom line

| | **DC** | **Maryland** | **Virginia** |
|---|---|---|---|
| Licensed-practice definition | Custody only ("care and disposal of human remains") | Operating an establishment; **for compensation**, preparing a body or **arranging** disposition | Includes "**the making of arrangements** for the funeral service" and its financing |
| Any-person clause | Operating an establishment unlicensed | "Practice … **or assist in the practice**" (§ 7-501); holding out by "description of services" (§ 7-502) | "Practice of funeral services **or the business of preneed funeral planning**" (§ 54.1-2805); Class 1 misdemeanor |
| Pre-death ("preneed") exposure | Low (§ 3-421 is an apprentice rule) | Low (no any-person preneed-planning ban found) | **High**: preneed planning is "the making of arrangements prior to death" |
| Solicitation rules | Licensee-scoped; **expressly excludes "responses to requests for information from consumers"** | Licensee-scoped, but reaches solicitation "by an agent" of "a dying individual or [their] relatives" | Licensee-scoped; cappers/steerers; referral commissions barred |
| Regulator's posture on price transparency | **An active ally**: Attorney General price survey, online price lists mandated | Neutral; FCAME publishes surveys openly | Mixed: lost an FTC price-advertising case (2004); guidance warns licensees about unlicensed third parties (GD 65-4) |
| Consumer-protection exposure | **Highest**: CPPA, $1,500 per violation, public-interest-group standing | Moderate (MCPA) | Moderate (VCPA; class-action bill failed in 2026) |
| Privacy law | None comprehensive found | **MODPA**: 35,000-user threshold, nonprofits covered, strict limits on health data | VCDPA: 100,000-user threshold |
| Sales tax on the hospice subscription | 6% now, **7% from 2026-10-01** | **3%** (enterprise SaaS / IT services, since 2025-07-01) | Generally none |
| **Overall** | **Cleanest. Launch first.** | Clear with the selection redesign | **Clear for education and at-need; pre-death outreach off until counsel answers** |

**The core product clears in all three jurisdictions:** price education, the
analyzer, guides, benchmarks, and the hospice-paid bereavement program.
**One current behavior needs redesign in all three.** The selection email
conveys a price acceptance and the platform relays scheduling of the
arrangement meeting. **One behavior needs to stay off in Virginia** until
counsel answers: pre-death outreach to homes.

## 2. Cross-border: which law applies when a family and a home are in different jurisdictions?

The DC metro is one funeral market. DC even issues courtesy cards to
Maryland and Virginia funeral directors (D.C. Code § 3-415), and the
product's matching now treats the metro as one service market
(`lib/service-markets.ts`). The working assumption, pending counsel:

- **The family's jurisdiction** governs consumer protection (CPPA, MCPA,
  VCPA) and privacy (MODPA, VCDPA).
- **The home's jurisdiction** governs anything that touches the licensed
  practice. An outreach email landing on a Virginia licensee is Virginia
  conduct (GD 65-4).
- **So the strictest applicable rule governs each case.** A DC family
  requesting a quote from an Arlington home is subject to Virginia's
  "making of arrangements" analysis for that email.

**Recommendation: design once, to the strictest rule, market-wide.** Apply
the Virginia redesign (family-voice selection, no price acceptance, no
scheduling relay, "price information" wording) to **every** DMV outreach,
not only Virginia's. State-branching email copy is fragile and saves
nothing. The one place state-branching earns its complexity is the
**pre-death gate**. It must trigger when the family is in Virginia **or**
any recipient home is in Virginia, until counsel clears §4.2 of the
Virginia memo. **[COUNSEL: confirm the conflict-of-laws assumption.]**

## 3. Launch order inside the DMV

1. **DC first.**
   - It has the cleanest licensing text and a regulator that already
     publishes the data we publish.
   - **Online price lists are mandated**, so DC's roughly 38 homes are the
     fastest verified dataset in the market.
   - The CPPA is the price of admission. It is a claims-discipline problem
     we already have tooling for (the claims register and guardrail #4).
2. **Maryland next** (Montgomery and Prince George's). It clears with the
   selection redesign. Watch MODPA as usage grows, and collect sales-tax
   exemption certificates.
3. **Virginia last for home outreach**, and fully once counsel answers the
   preneed question. Virginia families get the education layer and at-need
   outreach (with the redesign) from day one. Pre-death outreach waits.

A hospice pilot does **not** have to wait for Virginia. A hospice serving
all three jurisdictions can run a pilot where every family gets the
education layer and bereavement support, and home outreach follows the
gate above.

## 4. The unified product-change list (pending counsel; nothing sends today)

`OUTREACH_LIVE` is off, so none of this is live exposure. These gate the
first DMV home outreach. They are **not** implemented in this pass, on
purpose: counsel should pick the authorization and agency language first,
and implementing ahead of that means re-implementing.

**Exception, shipped 2026-09-24: #4, the pre-death gate.** It only removes
outreach, so it needs no language choice, and CLAUDE.md already made it
law. It lives in `lib/negotiation/pre-death-gate.ts`: a Virginia family's
case before a death is held (`pre_death_hold`, with an honest status page),
Virginia homes drop out of every other family's pre-death case, and the
admin re-run route applies the same check. Counsel's answer on the
Virginia preneed question decides whether "VA" comes off the list.

| # | Change | Files | From |
|---|---|---|---|
| 1 | Selection message in the family's voice; **no price acceptance**; quote attached "for reference, nothing agreed until you sign directly" | `lib/negotiation/email-body.ts` (`buildSelectionEmail`), `lib/negotiation/notify-chosen-home.ts` | VA-1, MD-1 |
| 2 | **End the scheduling relay**: the family gets the home's contact details and a suggested message | selection email; `app/negotiate/start/Wizard.tsx` (~l.669); `app/how-it-works/page.tsx` (~l.82) | VA-2, MD-1 |
| 3 | Outreach becomes a **price-information request only**: drop "If your firm is selected, we'll reach out to help schedule…" and "planning arrangements {timing}" | `buildOutreachEmail`; `app/admin/outreach-preview/PreviewForm.tsx` hint | VA-3 |
| 4 | ✅ **Shipped 2026-09-24.** **Pre-death gate**: no home outreach while the person is living (no date of death, or timing "planning-ahead") when the family **or** any recipient home is in Virginia; education layer only | `app/api/negotiate/start/route.ts`, wizard; needs home state from `funeral_homes.state` | VA-4 |
| 5 | Authorization text says it covers a **price-information request only**, never disposition decisions; the platform is never a representative or designee | outreach body "Authorization reference"; `/terms` | MD-3, VA-7 |
| 6 | Footer adds "We are not seeking to contract for funeral services"; `/for-funeral-homes` answers the Virginia GD 65-4 question | outreach footer; `app/for-funeral-homes` | VA-6 |
| 7 | Copy audit: we advise on **prices and rights**, never "arrangements"; no service description that sounds like the licensed practice | wizard, `/how-it-works`, `/our-role`, emails | MD-2, DC-3 |
| 8 | CPPA claims re-audit before DC launch, and a decision on disclosing the hospice payer | claims register; family activation flow | DC-1, DC-2 |
| 9 | Outcomes dataset on de-identified records; MODPA review before 35,000 Maryland users | data model | MD-5 |

## 5. The statutory map update (for CLAUDE.md's channel-survival rules)

Of the three DMV solicitation regimes, **none reaches a platform directly.**
All are licensee-scoped. DC's definition expressly excludes "responses to
requests for information from consumers." Maryland's reaches a licensee
soliciting "by an agent," and we are never an agent. **But Virginia reaches
any person through licensure, not solicitation:** § 54.1-2805 makes it a
Class 1 misdemeanor for anyone to engage in "the business of preneed funeral
planning" unlicensed. That is why the pre-death gate (change 4) exists.
Family-initiated activation remains house law everywhere regardless.

## 6. What carries over from the Utah work unchanged

- The federal AKS/CMP and HIPAA positions (federal law; no state dependency
  except the state Medicaid kickback analogs, now mapped: Va. Code
  § 32.1-315, Md. Crim. Law § 8-511, D.C. Code § 4-802).
- The services agreement's dual frame and the covenants: post-admission
  only, family self-activation, aggregate-only reporting with n≥5 cells.
- The six guardrails. In the DMV, guardrail #1 is also **license law for our
  counterparties**. A home that paid us would violate Virginia's commission
  ban (§ 54.1-2806) and DC's solicitation clause (B), and would risk
  Maryland's agent-solicitation ground.

## 7. What the Utah memo got right that the DMV confirms

The Utah memo's "related product requirements" said: "no contract formation
in-platform ever; pre-death selections labeled non-binding; the platform
never conveys acceptance." The DMV research shows the current selection email
conflicts with the third of those. That is not a new DMV requirement. It is
an existing requirement the code drifted from, and the DMV's sharper text
surfaced it.
