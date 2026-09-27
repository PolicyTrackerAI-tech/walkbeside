# Counsel redline: the DMV product-change list

_Prepared 2026-09-24 for DMV counsel. Companion to
[`DMV_LEGAL_OVERVIEW.md`](DMV_LEGAL_OVERVIEW.md) §4 and the three clearance
drafts ([VA](VA_CLEARANCE_DRAFT.md), [MD](MD_CLEARANCE_DRAFT.md),
[DC](DC_CLEARANCE_DRAFT.md)). Draft wording for counsel to mark up. It is not
legal advice and nothing here ships until counsel approves it._

## How to use this document

Each row quotes the **current** text verbatim (file and line as of
2026-09-24), gives a **proposed** replacement, and names the concern it
answers (VA-n, MD-n, DC-n from the clearance drafts). Mark each row
**Approve**, **Revise** (write the wording), or **Reject**. Once marked, the
code change is mechanical: one PR, with the tests updated to pin the
approved wording.

**Nothing sends today.** `OUTREACH_LIVE` is off, so no funeral home has
received any of this text. These changes gate the first DMV home outreach.

**Already shipped, no counsel wording needed:** item #4, the Virginia
pre-death gate (`lib/negotiation/pre-death-gate.ts`). Before a death, no
home outreach goes out when the family or the home is in Virginia. Counsel's
answer on the Virginia preneed question (VA draft §4.2) decides whether
Virginia comes off that list.

## Three decisions first (everything below hangs on them)

**D1. What is the platform to the family?** Today's copy says "consumer
advocate" acting "on your behalf," with a next-of-kin attestation at the
authorization step. Options:

- **(a) Keep "advocate", narrowed.** The authorization is a
  price-information request only (MD-3, VA-7). The next-of-kin attestation
  stays.
- **(b) Information service, not an agent.** "At your request, we ask
  funeral homes for their prices." No agency language, and the next-of-kin
  attestation is dropped (nobody needs authority to ask for a price list).
- _Drafting default below: (a)._ It changes the least product, and the
  proposed text works under (b) by deleting the attestation.

**D2. May we tell the chosen home anything?** Options:

- **(a) No notice at all.** The family contacts the home directly.
- **(b) A notice in the family's voice** with no price acceptance and no
  scheduling (VA-1, MD-1).
- **(c) Today's notice:** price acceptance plus a scheduling relay. The
  drafts advise against this.
- _Drafting default below: (b)._

**D3. The pre-meeting message relay.** The family can message a home
through us without sharing their contact details. Options:

- **(a) Keep it for questions only.** No scheduling, no conveying
  acceptance.
- **(b) End it.** The family contacts the home directly.
- _Drafting default below: (a)._ It keeps the family's privacy benefit and
  drops the arranging-adjacent part.

## #1 and #2: the selection notice, and ending the scheduling relay (VA-1, VA-2, MD-1)

**1a. The selection email: `lib/negotiation/email-body.ts` `buildSelectionEmail`**
(sent by `lib/negotiation/notify-chosen-home.ts`)

| | Text |
|---|---|
| Current subject | `{Family} selected your firm (ref WB-…)` |
| Current body (core) | "The family has selected your firm for {service} at the price you quoted: {$}. They'll come in for the in-person arrangement meeting to make selections and sign directly with your firm. We're helping with scheduling and any pre-meeting questions on their behalf. Please reply to this thread with: your earliest available slot for an in-person meeting; what they should bring…; any questions… We'll relay everything and keep the thread going until the meeting is on the calendar." |
| **Proposed subject** | `{Family} would like to talk with your firm (ref WB-…)` |
| **Proposed body (core)** | "{Family} asked us to let you know they'd like to talk with your firm about {service}. For their reference, the price your firm sent was {$}. Nothing is agreed until the family meets with you and signs directly with your firm. They'll contact you directly to set a time. If you have a question for the family before then, you can reply to this email and we'll pass it along." _(Under D3(b), drop the last sentence.)_ |

**1b. Family-facing promises of the relay.** Every one of these changes
together.

| File (line) | Current | Proposed |
|---|---|---|
| `app/negotiate/[id]/results/page.tsx` (67) | "Pick the home you want — it costs nothing. We'll notify them and help schedule the arrangement meeting. You'll meet with the home in person to make final selections and sign." | "Pick the home you want — it costs nothing. We'll let them know you'd like to talk, with no price agreed. You contact them to set a time, meet in person, and make every selection and signature directly with them." |
| `app/negotiate/[id]/status/page.tsx` (322–325) | "Choose the home you want and we'll notify them and help schedule the arrangement meeting." | "Choose the home you want and we'll let them know you'd like to talk. You set the meeting with them directly." |
| `app/negotiate/[id]/status/page.tsx` (438–441, message panel) | "Use this for scheduling and questions before the arrangement meeting…" | "Use this for questions before you meet with the home. To set a meeting time, contact the home directly…" _(D3(b): remove the panel.)_ |
| `app/negotiate/[id]/closed/page.tsx` (63–65) | "We've let {home} know they were selected, with the price they quoted in writing. They'll be in touch with times for the arrangement meeting." | "We've let {home} know you'd like to talk with them. No price is agreed until you meet and sign with them directly. Their contact details are below; call or email them to set a time." |
| `app/negotiate/[id]/closed/page.tsx` (91–93) | "The home reaches out to schedule your arrangement meeting — usually within a day or two." | "Contact the home to set your meeting. Mention the price they sent so it's on the table from the start." _(This is the existing not-live bullet, used in both modes.)_ |
| `app/negotiate/start/Wizard.tsx` (~669, authorization bullets) | "If you pick a home, we help schedule the in-person arrangement meeting and relay pre-meeting questions so your personal contact info stays private." | "If you pick a home, we let them know you'd like to talk. You set the meeting with them directly. Before then, we can pass questions along so your contact details stay private." |
| `app/how-it-works/page.tsx` (82) | "If you pick one, we help schedule the in-person arrangement meeting and stay on email for any pre-meeting questions or post-meeting disputes." | "If you pick one, we let them know you'd like to talk, and we can pass along questions before you meet. You set the meeting and sign everything directly with the home." _(Post-meeting disputes: see #7.)_ |
| `app/our-role/page.tsx` (65–67) | "Help schedule the in-person arrangement meeting between the family and the funeral home they select." | _Delete the bullet._ |
| `app/our-role/page.tsx` (147–152) | "If a family selects your firm, you will receive a "selected" email from us and we'll help schedule the arrangement meeting… We stay on email for scheduling, pre-meeting questions…" | "If a family would like to talk with your firm, you'll receive a short note from us saying so, with no price agreed and nothing arranged. The family contacts you directly." |
| `app/for-funeral-homes/page.tsx` (step 4) | "If they pick your firm, you get a "you've been selected" email from us with the quoted price reconfirmed and a request for arrangement-meeting availability." | "If the family would like to talk with your firm, we send a short note saying so. It doesn't accept a price and doesn't ask for availability. The family contacts you directly." |
| `app/terms/page.tsx` (74–78) | "After you select a home, Honest Funeral may help schedule the arrangement meeting and relay pre-meeting questions between you and the home…" | "After you select a home, Honest Funeral may let the home know you'd like to talk and may pass pre-meeting questions between you and the home through an in-app thread, so your contact details stay private until you choose to share them. Honest Funeral does not schedule meetings, accept prices, or agree to anything on your behalf." |

## #3: the outreach email becomes a price-information request only (VA-3)

**`lib/negotiation/email-body.ts` `buildOutreachEmail`**

| | Text |
|---|---|
| Current ¶1 | "I'm writing from Honest Funeral Co. on behalf of {family}. They've engaged us as their consumer advocate to gather price information from funeral homes in your area before they choose where to make arrangements." |
| **Proposed ¶1** | "I'm writing from Honest Funeral Co. on behalf of {family}. They've asked us to request price information from funeral homes in your area." |
| Current ¶2 (end) | "…The family is planning arrangements {timing}." |
| **Proposed ¶2 (end)** | _Delete the sentence._ The timing adds nothing to a price request and reads as arranging. |
| Current ¶3 | "They'll review what comes back. If your firm is selected, we'll reach out to help schedule the in-person arrangement meeting — the family attends and signs directly with you." |
| **Proposed ¶3** | "The family will review what comes back and will contact any firm they'd like to talk with directly." |

_Implementation note for the PR, not for counsel:_
`familyLabelFromOutreachBody()` parses "on behalf of X. They've engaged us"
out of stored bodies. The replacement must keep a stable anchor, and the
regex changes with it. The admin preview hint
(`app/admin/outreach-preview/PreviewForm.tsx`) repeats the old promise and
changes too.

## #5: the authorization covers a price-information request only (MD-3, VA-7)

| File | Current | Proposed |
|---|---|---|
| Outreach and selection email signature | "Authorization reference: WB-…" | "Request reference: WB-…" |
| Outreach email, new line before the footer | _(none)_ | "This is a request for price information only. It doesn't authorize any funeral arrangement or disposition decision, and we don't represent the family for those." |
| `Wizard.tsx` checkbox | "I am the legal next of kin or have written authority from the next of kin, and I authorize Honest Funeral on the terms above." | D1(a): "I am the legal next of kin or have written authority from the next of kin. I authorize Honest Funeral to request price information from funeral homes for my family. It's a price request only: every arrangement, decision and signature stays with my family and the funeral home." D1(b): "I'd like Honest Funeral to request price information from funeral homes for my family. It's a price request only: every arrangement, decision and signature stays with my family and the funeral home." |
| `app/terms/page.tsx` §3 ¶1 | "…Honest Funeral will contact funeral homes on your behalf and identify itself as your authorized advocate…" | "…Honest Funeral will ask funeral homes for price information at your request, and will say that it is writing for your family. This authorization covers that price request only. Honest Funeral is never your representative, agent or designee for any funeral arrangement, disposition decision or contract (for example, under Md. Health-Gen. § 5-509 or Va. Code § 54.1-2825)." |

## #6: the "not seeking to contract" footer, and the GD 65-4 answer (VA-6)

| File | Current footer | Proposed footer |
|---|---|---|
| `buildOutreachEmail` and `buildSelectionEmail` | "Honest Funeral Co. is a consumer advocacy service, not a licensed funeral establishment. We help families gather pricing and prepare for the arrangement meeting; the family makes all arrangements directly with the funeral home they select." | "Honest Funeral Co. is a consumer information service, not a licensed funeral establishment. We are not seeking to contract for funeral services, and we receive nothing from any funeral home. The family makes every arrangement directly with the funeral home they choose." |

**`/for-funeral-homes`, a new Q&A entry (proposed):**

> **Is this a third party "seeking to contract for funeral services"?**
> No. Virginia's Board guidance (GD 65-4) addresses unlicensed third parties
> that contract with families for funeral services or broker them. We don't.
> We don't sell, broker, or contract for any funeral good or service, and we
> take no money from funeral homes. A family asks us to request your price
> list, and then contacts you directly if they'd like to talk.

_Counsel: please confirm the GD 65-4 characterization against the current
text of the guidance document before this is published._

## #7: the copy audit — prices and rights, never "arrangements" (MD-2, DC-3)

The rule: we describe what we do as **price information, comparison, and
rights education**. We never describe what we do as arranging, or helping
arrange, a funeral. "The arrangement meeting" as the name of the family's
meeting with the home is fine. So is describing what the family does
there.

| File (line) | Phrase | Proposed |
|---|---|---|
| `app/terms/page.tsx` (43) | "built to help families navigate funeral arrangements and…" | "built to help families understand funeral prices and their rights, and…" |
| `app/our-role/page.tsx` (11, metadata) | "…helps families gather prices, compare quotes, and prepare for the arrangement meeting." | Keep. It describes the family's preparation, not arranging. |
| Email footers (#6) | "prepare for the arrangement meeting" | Replaced by #6. |
| `app/our-role/page.tsx` (~74–77) and `/how-it-works` (82) | "Stay on email for post-meeting disputes…" | "If the final bill differs from the quote, we'll help you compare the two and understand your rights." (Rights education, not representation in a dispute.) |
| `app/how-it-works/page.tsx` (16, 45, 51); `Wizard.tsx` header | "We contact homes on your behalf"; "your advocate" | D1(a): keep. D1(b): "At your request, we ask homes for their prices." |

_Method for the final audit, run once D1 is decided:_
`grep -rniE "arrang|on (your|the family.s) behalf|advocate|represent|schedul"`
over `app/`, `components/`, `lib/negotiation/email-body.ts` and
`lib/welcome-email.ts`. Classify each hit as describing **us** (fix) or
describing **the family and the home** (keep). The count on 2026-09-24 is
about 60 hits. Most describe the family's meeting and stay.

## #8 and #9: not wording changes

- **#8 (DC-1, DC-2).** The CPPA claims re-audit is in
  [`DC_CLAIMS_REAUDIT_2026-09.md`](DC_CLAIMS_REAUDIT_2026-09.md). The
  who-pays disclosure for hospice-activated families is packet Q9.
- **#9 (MD-5).** The MODPA review before 35,000 Maryland users is a design
  decision. It isn't needed for the pilot.

## What happens after counsel marks this up

1. One PR implements every approved row verbatim, and the tests pin the
   approved strings.
2. The founder reads the outreach and selection emails in the admin
   preview (`/admin/outreach-preview`) before `OUTREACH_LIVE` is set.
3. `CLAUDE.md`'s channel-survival section is updated to name the approved
   model (D1–D3), so later work can't drift back.
