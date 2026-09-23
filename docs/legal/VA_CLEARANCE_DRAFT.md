# Virginia Clearance Analysis: Title 54.1, Chapter 28 and Adjacent Law (DRAFT)

> **DRAFT for Virginia counsel review. Not legal advice.** Prepared
> 2026-09-23 as the DC-metro successor to
> [`UTAH_CLEARANCE_DRAFT.md`](UTAH_CLEARANCE_DRAFT.md) (Utah went cold on
> 2026-09-23; the DMV is the launch market). Same law as before: no state
> goes live uncleared. **Virginia is the hardest of the three DMV
> jurisdictions**: the position below holds for the core product, but two
> features need redesign or counsel's blessing first, and those soft spots
> are sharper than anything in the Utah memo.
>
> **How the research was done, and how much to trust each quote.** Research
> ran on 2026-09-23 through web search. This environment's network policy
> blocked direct fetches of `law.lis.virginia.gov`, `law.justia.com` and
> similar hosts, so full sections could not be read. Every citation is
> tagged:
> - **[OFFICIAL-EXTRACT]**: statutory or regulatory text returned from the
>   official site's indexed text. The wording is very likely right, but
>   re-read the full section before relying on it.
> - **[SECONDARY]**: taken from a summary or secondary source. Confirm it.
> - **[NOT RETRIEVED]**: we know the document exists but could not read it.

## 1. Question and position

May Honest Funeral Co. run its free family service (funeral-price education,
comparison, the "is this fair?" analyzer, price-list requests, negotiation
coaching) and its hospice-paid bereavement program for Virginia families
without a license under Chapter 28 of Title 54.1?

**Position, in three parts:**

1. **The information layer is clearly outside the license.** This covers
   public price education, the analyzer, guides, the Fair-Price Index, and
   benchmarks. Virginia's own Code separates asking about prices from
   making arrangements (§ 54.1-2812, below). The First Amendment protects
   truthful price information, and the leading case on that point is a
   Virginia licensing-board case.
2. **The at-need quote-request feature is defensible, but only in a
   redesigned shape.** Today the product tells a home that the family
   "selected your firm … at the price you quoted" and relays scheduling of
   the arrangement meeting. Virginia's definition of licensed practice
   expressly includes "the making of arrangements for the funeral service."
   That is the one current product behavior this memo says must change
   (§4.1).
3. **Pre-death outreach for a Virginia family must stay off until counsel
   answers §4.2.** Virginia makes it unlawful for any person, not only
   licensees, to engage in "the business of preneed funeral planning"
   without a license (§ 54.1-2805). It defines preneed funeral planning as
   "the making of arrangements prior to death." Hospice families are
   pre-death by definition, and the wizard offers a "Planning ahead" option.
   Pre-death **price education** is fine. Pre-death **outreach to homes for
   an identified dying person** is the closest approach in the product.

Nothing sends to a funeral home today (`OUTREACH_LIVE` is off), so none of
this is live exposure yet. It gates the go-live.

## 2. The statutory framework

- **§ 54.1-2800 (definitions).**
  - "Practice of funeral services" means engaging in the care and
    disposition of the human dead, the preparation of the human dead for
    the funeral service, burial or cremation, **the making of arrangements
    for the funeral service or for the financing of the funeral service**
    and the selling or making of financial arrangements for the sale of
    funeral supplies to the public. **[OFFICIAL-EXTRACT]**
  - "Preneed funeral planning" means **the making of arrangements prior to
    death** for (i) the providing of funeral services or (ii) the sale of
    funeral supplies. **[OFFICIAL-EXTRACT]**
  - "Funeral service licensee" means a person who is licensed in the
    practice of funeral services. **[OFFICIAL-EXTRACT]**
- **§ 54.1-2805 (any person):** "It shall be unlawful for any person to
  engage in or hold himself out as engaging in the practice of funeral
  services or **the business of preneed funeral planning**, to operate a
  funeral service establishment, or to act as a funeral director or
  embalmer" without a license. **[OFFICIAL-EXTRACT, paraphrase-adjacent;
  confirm verbatim]**
- **§ 54.1-2809 (penalty):** "Any person, partnership, corporation,
  association, or its agents or employees who violate any of the provisions
  of this chapter shall be guilty of a Class 1 misdemeanor."
  **[OFFICIAL-EXTRACT; section number per the extract, confirm]**
- **§ 54.1-2801 (exemptions):** only (A) officers of state or local
  institutions burying inmates at public expense and (B) courtesy cards for
  out-of-state licensees. **[OFFICIAL-EXTRACT]** Unlike Utah's § 58-9-305,
  there is **no** exemption for clergy, "any other recognized individual,"
  or nonprofessional tasks. The defense here must be definitional; there is
  no exemption to fall back on.
- **§ 54.1-2810:** "No person shall conduct, maintain, manage or operate a
  funeral establishment unless a license for each such establishment has
  been issued by the Board." **[OFFICIAL-EXTRACT]**
- **§ 54.1-2806 (licensee discipline):** grounds include employing
  "cappers," "steerers," or "solicitors" to obtain funeral business;
  employing any agent "for the purpose of calling upon individuals or
  institutions by whose influence dead human bodies may be turned over to a
  particular funeral establishment"; and direct or indirect payment of
  commissions "for the purpose of securing business." **[OFFICIAL-EXTRACT
  via summary]** In the preneed context, a "capper," "steerer," or "shill"
  is "a person who serves to entice another to purchase a product or to
  direct the course of action and choice of the buyer in a preneed funeral
  contract sale." **[OFFICIAL-EXTRACT; confirm which section holds this
  definition]**
- **§ 54.1-2812 (price lists):** every licensee "shall furnish a written
  general price list"; "Individuals **inquiring** in person about funeral
  arrangements or **the prices of funeral goods** shall be given the
  general price list. **Upon beginning discussion of funeral arrangements**
  or the selection of any funeral goods or services, the general price list
  must be offered." **[OFFICIAL-EXTRACT]**
- **§ 54.1-2820 et seq. (preneed contracts):** it is unlawful for any
  person residing or doing business in Virginia to make a preneed funeral
  contract that does not meet the article's requirements, including
  identifying the seller and the seller's license number. **[SECONDARY]**
- **§ 54.1-2825 (person to make arrangements):** the Code's designation
  mechanism for who arranges the funeral and disposition. That person is
  the family or their designee, never the platform. **[title only; NOT
  RETRIEVED]**
- **18VAC65-20-500 (licensee discipline, effective 2022-12-07):**
  prohibits at-need solicitation and in-person preneed solicitation by
  licensees and their agents. General advertising and non-in-person
  preneed solicitation are allowed. It also defines false, deceptive, or
  misleading advertising, including anything giving "a false impression as
  to ability, care, and cost of conducting a funeral."
  **[OFFICIAL-EXTRACT via summary]**
- **18VAC65-30-50 (preneed solicitation):** "After a request to discuss
  preneed planning is initiated by the contract buyer or interested
  consumer, any contact and in-person communication shall take place only
  with a funeral service licensee or a licensed funeral director."
  **[OFFICIAL-EXTRACT; the extract surfaced under the preneed-solicitation
  rule heading; confirm the section]** It binds licensees, but it is the
  clearest statement of the Board's model: once a consumer asks to plan
  ahead, the conversation belongs to a licensee.
- **Board Guidance Document 65-4, "Aiding and abetting unlicensed
  practice"** (reaffirmed 2019-01-24 and again in July 2023). It guides
  licensees on "dealing with individuals or entities who may not be
  licensed and/or who may not be licensed in the state in which
  arrangements are or will be made with the family to be served." The
  Board's FAQ tells licensees to file a complaint with DHP Enforcement when
  "an individual or entity seeking to contract for funeral services with
  the Virginia establishment" cannot be verified as licensed.
  **[FAQ: OFFICIAL-EXTRACT. GD 65-4 full text: NOT RETRIEVED. Also a 2025
  guidance-document action on Town Hall (file GDoc_DHP_8211_20250417):
  NOT RETRIEVED. Pull both.]**
- **The Board:** nine members, seven of them practicing funeral service
  licensees. **[SECONDARY]** It regulates licensees, establishments,
  crematories, preneed contracts and trust accounts.

## 3. Why the platform sits outside the licensed practice

1. **Virginia's own Code separates price inquiry from arrangement-making.**
   § 54.1-2812 treats "individuals inquiring … about … the prices of
   funeral goods" as a different event from "beginning discussion of
   funeral arrangements." Every product surface that asks for, reads,
   compares, or explains prices sits on the inquiry side of the Code's own
   line. This is the best textual anchor in any of the three DMV
   jurisdictions, and it should lead the brief.
2. **"The making of arrangements for the funeral service" read in
   context.** The clause sits among care, disposition, preparation,
   financing, and selling: all things the provider does to deliver the
   funeral. Read with its neighbors (*noscitur a sociis*), "making
   arrangements" is fixing the funeral with the provider: selecting goods
   and services, setting the service, contracting. The family does that
   directly with the home. The platform selects nothing for the family,
   contracts for nothing, and pays for nothing.
3. **The First Amendment, in a Virginia licensing-board case.** *Virginia
   State Board of Pharmacy v. Virginia Citizens Consumer Council, Inc.*,
   425 U.S. 748 (1976), struck down a Virginia licensing board's ban on
   drug-price advertising. Its reasoning was the consumer's interest in
   price information. A construction of § 54.1-2800 that made publishing
   or explaining funeral prices licensed practice would run straight into
   it.
4. **This Board has already lost a price-transparency fight.** In 2004 the
   FTC took a consent order against the Virginia Board of Funeral Directors
   and Embalmers (FTC matter 041-0014, final order approved 2004-10-05). The
   charge was that the Board barred licensees from truthful price and
   discount advertising. The order required it to amend its rule
   restricting advertising of services that can be contracted before death.
   **[SECONDARY via FTC press release]**
5. ***North Carolina State Board of Dental Examiners v. FTC*, 574 U.S. 494
   (2015):** a board controlled by active market participants, acting
   against non-licensee competitors without active state supervision, has
   no *Parker* immunity. Seven of Virginia's nine members are licensees.
   A Board action aimed at shutting down a free price-transparency service
   invites exactly this antitrust exposure. That deters the Board; it is
   not a defense to a statutory violation.
6. **Price publishers already operate in Virginia without licenses.**
   Consumers' Checkbook publishes home-level DC-area funeral prices
   (including Northern Virginia homes) and ratings for 49 area homes. The
   Funeral Consumers Alliance of the Virginia Blue Ridge publishes
   home-level price surveys. The Memorial Society of Northern Virginia
   (Arlington) has operated for decades. No enforcement against any of them
   was found. **[SECONDARY]**
7. **The family is the arranger** (§ 54.1-2825), and signs everything
   directly with the home.

## 4. The soft spots (buy counsel's answers on exactly these)

### 4.1 The selection email and the scheduling relay: "making of arrangements"

**What the product does today:**
- `buildSelectionEmail` (`lib/negotiation/email-body.ts`) tells the chosen
  home: "The family has selected your firm for {service} **at the price you
  quoted: {$X}**." It continues: "We're helping with scheduling and any
  pre-meeting questions on their behalf … We'll relay everything and keep
  the thread going until the meeting is on the calendar."
- The first outreach email says: "If your firm is selected, we'll reach out
  to help schedule the in-person arrangement meeting."
- The same promise appears in the wizard (`app/negotiate/start/Wizard.tsx`,
  "If you pick a home, we help schedule the in-person…") and on
  `/how-it-works`.

**Why it matters:** conveying a family's choice *at a stated price* is the
platform communicating acceptance on the family's behalf. The Utah memo
already named this as the thing the platform must never do ("never conveys
acceptance, never forms a contract"). The current code is inconsistent with
the Utah analysis, not only the Virginia one. In Virginia the same act maps
onto "the making of arrangements for the funeral service." It also fits
GD 65-4's frame of a third party "seeking to contract for funeral services
with the Virginia establishment."

**Recommended safe shape [COUNSEL: bless or adjust]:**
- The selection message becomes the **family's own message**. Either it is
  sent from or signed by the family, or it is clearly framed as "the family
  asked us to let you know they'll contact you directly." It contains **no
  price acceptance**. The quote goes along as reference only, with the words
  "nothing is agreed until they sign with you directly."
- The platform stops acting as the **scheduling relay**. It gives the
  family the home's contact details and a suggested message, and the family
  books the meeting themselves.
- The outreach email drops "If your firm is selected, we'll reach out to
  help schedule." It becomes a pure price-information request, which the
  home must answer at least by phone under the FTC Funeral Rule.

### 4.2 Pre-death outreach: "the business of preneed funeral planning"

**What the product does today:** the negotiate wizard offers "Planning ahead
(more than 30 days)." A date of death is optional (`dateOfDeath` in
`app/api/negotiate/start/route.ts`). The outreach email says "The family is
planning arrangements {timing}." A hospice family activating the product is
pre-death by construction.

**Why it matters:** § 54.1-2805 reaches **any person** engaging in "the
business of preneed funeral planning," defined as "the making of
arrangements prior to death." 18VAC65-30-50 shows the Board's model: once a
consumer starts preneed planning, only licensees talk to them. This is the
Virginia analog of the Florida any-person preneed question already in the
counsel packet (Q6(d)). Virginia's text is broader than Florida's.

**The line to hold:** pre-death **education** is not "making arrangements."
That covers what things cost, what the family's rights are, what to ask,
the analyzer run on a price list the family already has, and published
benchmarks. Pre-death **outreach to homes for an identified dying person**
is the closest approach, and "planning arrangements" is the wrong phrase to
have in any email.

**Recommended safe shape until counsel answers [COUNSEL]:**
- For a family whose person has not died (no date of death, or the
  "planning-ahead" timing), the product offers **price information only**:
  public price-list data, benchmarks, the analyzer, and education. Outreach
  is either not offered, or limited to a template the family sends
  themselves to request a general price list.
- Copy says "gathering price information," never "planning arrangements."
- Anything pre-death that records a family's tentative preferences is
  labeled **non-binding, information only**. No preneed contract, no
  deposit, and no financing, ever. Virginia's practice definition includes
  "the financing of the funeral service": no payment plans, no insurance or
  lender referrals. (Today `/how-to-pay` links only public and nonprofit
  aid programs. Keep it that way.)

### 4.3 GD 65-4, the licensee-controlled Board, and competitor complaints

The realistic enforcement path in Virginia is not a Board investigation
started on its own. It is a **licensee complaint**. Our outreach emails go
straight to licensees, and the Board's FAQ tells licensees to report
entities they cannot verify. Mitigations:
- The outreach footer already says "not a licensed funeral establishment …
  the family makes all arrangements directly." Add: "We are not seeking to
  contract for funeral services."
- The `/for-funeral-homes` page should answer the GD 65-4 question
  directly.
- Opt-out and the home denylist are already built.
- **[COUNSEL: ask-or-don't-ask.** Should we seek informal comfort from Board
  staff, as the Utah memo weighed for DOPL? Virginia's licensee-majority
  Board and the GD 65-4 posture argue for **not** asking before counsel has
  the shape settled.]

### 4.4 "Financing" and financial arrangements

The practice definition includes "the financing of the funeral service" and
"making of financial arrangements for the sale of funeral supplies." The
platform must never offer or broker payment plans, loans, insurance, or
crowdfunding tied to a particular home, and must never take a referral fee
for any of them. This matches guardrails #1 and #5, and is written down
here so a future "help families pay" feature does not wander into it.

## 5. Solicitation, steering, and referral fees

- **At-need solicitation** is barred for licensees and their agents
  (18VAC65-20-500). Family-initiated activation keeps the platform outside
  it even on an aggressive reading. The platform must also never be any
  home's agent.
- **Cappers and steerers:** a capper is one who "direct[s] the course of
  action and choice of the buyer." Guardrail #3 (neutral options; the family
  chooses) and guardrail #1 (no money from homes) are what keep us outside
  that definition. There is no product we profit from steering toward.
  The directory's fair-draw ordering (`lib/negotiation/directory.ts`,
  shipped 2026-09-23) is now part of the evidence.
- **Referral fees:** § 54.1-2806 disciplines a licensee who pays commissions
  "for the purpose of securing business." Any home-paid feature, whether
  featured listings, success fees, or per-lead pricing, would put the paying
  home's license at risk and make us the capper. **Guardrail #1 is Virginia
  license law for our counterparties.**
- **"Calling upon … institutions by whose influence dead human bodies may
  be turned over to a particular funeral establishment"** describes the
  Grace failure mode almost word for word: a hospice used as lead
  generation for a home. Our hospice relationship is the inverse. The
  hospice pays for neutral navigation, and no body is turned over to any
  particular home through our influence. Neutrality is what keeps it that
  way.

## 6. Name and holding-out

"Honest Funeral Co." uses no title Chapter 28 protects: funeral director,
embalmer, funeral service licensee, or funeral establishment. We found no
Virginia statute barring an unlicensed business from using the word
"funeral" in its name. **[NOT FOUND; COUNSEL confirm, including whether the
SCC refers names containing "funeral" to the Board at filing.]** Holding-out
risk sits in § 54.1-2805's "hold himself out as engaging in." The
persistent disclaimer ("we are not a funeral home or funeral director; we
do not arrange funerals or handle remains; your family contracts directly
with the funeral home") is the mitigation. **[COUNSEL: bless the text and
placement.]**

## 7. Registration obligations

1. **Fictitious name:** Va. Code § 59.1-69 requires a certificate of assumed
   or fictitious name, filed with the SCC clerk, before transacting business
   in Virginia under any name other than the legal one. The fee is $10.
   Noncompliance is a misdemeanor and bars suit in Virginia courts.
   **[OFFICIAL-EXTRACT + SECONDARY]** Not needed if the Delaware
   corporation's legal name is "Honest Funeral Co."
2. **Foreign registration:** a foreign LLC "transacting business" in
   Virginia needs an SCC certificate of registration (§§ 13.1-1051 to
   -1052, $100). A foreign corporation needs a certificate of authority
   (Article 17 of the Stock Corporation Act). A founder who lives and works
   in Virginia is very likely "transacting business." **[OFFICIAL-EXTRACT
   + SECONDARY]**
3. **Local business license (BPOL) and home-occupation zoning:** Arlington,
   Alexandria, Fairfax County, and the other localities each license
   businesses located there. **[SECONDARY. Confirm with the locality once
   the founder's address is fixed.]**
4. **No Board license category** exists that the platform could or must
   hold.
5. **Sales tax:** Virginia generally does not tax electronically delivered
   software or SaaS (Tax Commissioner Ruling 16-135 line; delivery is now
   presumed electronic). **[SECONDARY]**

## 8. Consumer protection overlay (VCPA)

- A "supplier" is "a seller, lessor, licensor, or professional that
  advertises, solicits, or engages in consumer transactions." A "consumer
  transaction" is "the advertisement, sale, lease or offering for sale or
  lease, of goods or services to be used primarily for personal, family or
  household purposes." **[OFFICIAL-EXTRACT]** A free service arguably is not
  offered "for sale" to the family. Do not rely on that; our honesty duties
  are the same either way (guardrail #4).
- **Private action (§ 59.1-204):** actual damages or $500, whichever is
  greater. For willful violations, up to three times actual damages or
  $1,000, whichever is greater, plus attorney's fees. **[OFFICIAL-EXTRACT
  via summary]**
- **Watch item:** the 2026 session passed a state-court class-action bill
  (SB 229 / HB 449). As of May 2026 it was reported vetoed, or amended to
  bar statutory damages. It is **not in force**. If it returns, VCPA
  statutory damages become a class-action risk. **[SECONDARY. Re-check at
  the 2027 session.]**

## 9. Hospice side (what a Virginia hospice may buy)

- **12VAC5-391-370 (effective 2025-05-22):** the hospice "shall provide
  bereavement services to the family for a minimum of one year after the
  patient's death." Bereavement service is defined by 42 CFR 418.3, and the
  hospice must "maintain a list of individuals who provide spiritual and
  bereavement services." **[OFFICIAL-EXTRACT]** This strengthens the
  procurement framing: a Virginia hospice buying bereavement support is
  buying something its **state license** requires, not only its Medicare
  conditions of participation. **[COUNSEL: should we be listed on the
  hospice's bereavement-resource list, and does that help or hurt the
  "supplemental, not core" framing in the AKS memo?]**
- **Va. Code § 32.1-315 (the state Medicaid kickback statute):** it is a
  Class 6 felony, with fines up to $25,000, to knowingly and willfully
  solicit, receive, offer, or pay remuneration for referring an individual
  for items or services payable "under medical assistance," or to induce
  such services. **[OFFICIAL-EXTRACT]** Virginia Medicaid pays for hospice,
  so the federal inducement analysis in the AKS memo transfers to Virginia
  Medicaid hospice patients unchanged. **[COUNSEL: is there any Virginia
  all-payer analog, and does the post-admission-only design carry over
  cleanly?]**

## 10. Privacy

The **Virginia Consumer Data Protection Act** (§ 59.1-575 et seq.) applies
to a business that controls or processes personal data of at least 100,000
Virginia consumers a year, or at least 25,000 with more than 50% of revenue
from selling personal data. It exempts nonprofits and HIPAA covered
entities. **[OFFICIAL-EXTRACT + SECONDARY]** We are below the threshold
today. A free national tool with DMV reach could cross 100,000 Virginia
users, so count Virginia users in analytics. Once the Act applies, health
data such as grief check-ins is "sensitive data" and needs opt-in consent.
**[COUNSEL]**

## 11. Home-level claims and defamation

Virginia's anti-SLAPP statute (§ 8.01-223.2, amended effective 2023-07-01)
gives immunity for good-faith statements on matters of public concern that
the First Amendment would protect, and allows fee awards. **[SECONDARY]**
Home-level price flags on published price lists are plausibly a matter of
public concern. Guardrail #4 (n>5, significance, a cited methodology)
doubles as the good-faith record.

## 12. Enforcement reality

- No Virginia Board or Attorney General action against a price publisher,
  comparison site, or navigation platform was found. The published
  enforcement posture (GD 65-4) targets third parties "seeking to contract
  for funeral services," which the platform must never do.
- The Board has lost a price-competition fight with the FTC before (2004).
  After *NC Dental*, a licensee-majority board has personal antitrust
  exposure if it moves against a non-licensee competitor.
- **Most likely trigger:** a funeral home that receives our outreach
  complains under GD 65-4. The redesign in §4.1 and the footer language in
  §4.3 are aimed at that trigger.

## 13. Product requirements this analysis imposes

None of these is live today, because `OUTREACH_LIVE` is off. All of them
gate a Virginia family's first home outreach.

| # | Requirement | Where | Status |
|---|---|---|---|
| VA-1 | Selection message carries no price acceptance and is framed in the family's voice | `lib/negotiation/email-body.ts` `buildSelectionEmail`; `notify-chosen-home.ts` | **Change needed** (pending counsel's wording) |
| VA-2 | Stop relaying the scheduling of the arrangement meeting; hand the family the home's contact details instead | selection email; `Wizard.tsx` (~line 669); `app/how-it-works/page.tsx` (~line 82) | **Change needed** |
| VA-3 | The outreach email is a price-information request only; drop "If your firm is selected, we'll reach out to help schedule…" and "planning arrangements" | `buildOutreachEmail` | **Change needed** |
| VA-4 | Pre-death Virginia families (no date of death, or the "planning-ahead" timing) get price information only; no home outreach until counsel clears §4.2 | `app/api/negotiate/start/route.ts` + wizard | **Change needed** (a state- and timing-aware gate) |
| VA-5 | Pre-death preferences are labeled non-binding; no preneed contract, deposit, financing, insurance, or lender referral, ever | product-wide | True today; keep |
| VA-6 | Footer adds "We are not seeking to contract for funeral services"; `/for-funeral-homes` answers the GD 65-4 question | outreach footer; `app/for-funeral-homes` | **Change needed** (copy) |
| VA-7 | The platform is never a home's agent and never the family's designated arranger under § 54.1-2825 | contracts + terms | True today; write it into the terms |
| VA-8 | No money from homes, ever (guardrail #1 is also Virginia license law for the homes) | billing factory scan + CI | True today; tripwired |

## 14. Open questions for Virginia counsel (the engagement's Virginia deliverable)

1. **Construction of "the making of arrangements for the funeral service"**
   (§ 54.1-2800). Which of these fall inside it: requesting a price list on
   a family's written authorization; conveying a family's selection;
   scheduling the arrangement conference? Does the § 54.1-2812
   inquiry-versus-arrangements line carry the weight we put on it?
2. **Preneed planning (§ 54.1-2805).** Is any platform-sent outreach for an
   identified living patient "the business of preneed funeral planning"? Is
   a family-sent template (the platform supplies text, the family sends it)
   clearly outside? Does 18VAC65-30-50 reach a non-licensee's
   communications at all?
3. **GD 65-4.** Obtain the full text and the 2025 Town Hall guidance
   action. Does either address information or advocacy services? Should we
   ask Board staff for comfort, or not ask?
4. **Name.** Any restriction on "funeral" in an unlicensed entity's legal or
   fictitious name, or an SCC referral practice?
5. **VCPA.** Does it reach a free service at all? What is the § 59.1-204
   exposure profile, and what is the status of the 2026 class-action bill?
6. **§ 32.1-315 and any all-payer analog.** Hospice-side constraints under
   12VAC5-391. Does listing us as a bereavement resource help or hurt the
   framing?
7. **Aiding and abetting.** Could our emails expose a licensee to an
   aiding-and-abetting charge (and so expose us)? Does the redesigned
   selection flow remove that?
8. **Defamation.** What anti-SLAPP posture fits home-level price flags?

## Sources

Va. Code §§ 54.1-2800, -2801, -2805, -2806, -2809, -2810, -2812, -2820,
-2825 (law.lis.virginia.gov section pages, via indexed extracts) ·
18VAC65-20-500; 18VAC65-30-50 · Board of Funeral Directors and Embalmers:
Guidance Documents page, Unlicensed Practice FAQ (dhp.virginia.gov) · Va.
Code §§ 59.1-69, 59.1-198/-199/-204 (VCPA), 13.1-1051/-1052, 32.1-315,
59.1-576 (VCDPA), 8.01-223.2 · 12VAC5-391-370 · FTC matter 041-0014 (Virginia
Board of Funeral Directors and Embalmers, final consent order approved
2004-10-05) · *Va. State Bd. of Pharmacy v. Va. Citizens Consumer Council*,
425 U.S. 748 (1976) · *N.C. State Bd. of Dental Examiners v. FTC*, 574 U.S.
494 (2015) · Consumers' Checkbook Washington-area funeral home ratings
(checkbook.org) · FCA of the Virginia Blue Ridge price surveys (fcavbr.org)
· McGuireWoods alert (May 2026) and Virginia Mercury (2026-05-04) on SB
229 / HB 449 · Virginia Tax Commissioner Ruling 16-135.
