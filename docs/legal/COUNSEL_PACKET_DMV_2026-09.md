# Counsel engagement packet: DMV launch (2026-09)

> **Status: DRAFT, founder-prepared with AI assistance. Not legal advice.**
> This supplements [`COUNSEL_PACKET_2026-08.md`](COUNSEL_PACKET_2026-08.md)
> now that the launch market is the DC metro (2026-09-23). **The federal
> questions in that packet stand unchanged** (HIPAA business associate, fee
> structure, CMP reach, gating-without-charging, contract covenants,
> advisory-opinion strategy, disclosure, consumer-health data,
> anti-steering filters). This packet **replaces its state-law questions**
> (its Q3 hospice-licensing clause and Q6) with the DMV set, and adds three
> DMV-specific questions. The gate stands: **counsel review blocks the
> first hospice signature.**

## 1. What to send

1. This packet, then [`DMV_LEGAL_OVERVIEW.md`](DMV_LEGAL_OVERVIEW.md): the
   three-jurisdiction comparison, the cross-border rule, and the unified
   product-change list.
2. The three clearance drafts, each ending in numbered questions:
   [`DC_CLEARANCE_DRAFT.md`](DC_CLEARANCE_DRAFT.md) ·
   [`MD_CLEARANCE_DRAFT.md`](MD_CLEARANCE_DRAFT.md) ·
   [`VA_CLEARANCE_DRAFT.md`](VA_CLEARANCE_DRAFT.md).
3. The federal drafts and August packet, unchanged:
   [`COUNSEL_PACKET_2026-08.md`](COUNSEL_PACKET_2026-08.md),
   [`AKS_CMP_MEMO_DRAFT.md`](AKS_CMP_MEMO_DRAFT.md),
   [`HIPAA_BA_POSITION_DRAFT.md`](HIPAA_BA_POSITION_DRAFT.md),
   [`HOSPICE_SERVICES_AGREEMENT_DRAFT.md`](HOSPICE_SERVICES_AGREEMENT_DRAFT.md)
   (governing law now DMV, not Utah),
   [`../sales/PILOT_AGREEMENT.md`](../sales/PILOT_AGREEMENT.md).
4. Business setup: [`DMV_OPERATING_REGISTRATIONS_DRAFT.md`](DMV_OPERATING_REGISTRATIONS_DRAFT.md)
   and [`ENTITY_PLAN_DRAFT.md`](ENTITY_PLAN_DRAFT.md).
5. Live-product artifacts: `lib/negotiation/email-body.ts` (**the most
   important single file**: the outreach and selection emails), `/terms`,
   `/privacy`, `/our-role`, `/for-funeral-homes`, `/how-it-works`, and the
   negotiate wizard.

## 2. The DMV questions (ask in this order)

The first three gate the first pilot signature and the first home
outreach. The rest gate scale.

1. **Virginia preneed planning (the single most important state answer).**
   Va. Code § 54.1-2805 makes it a misdemeanor for **any person** to engage
   in "the business of preneed funeral planning" unlicensed. § 54.1-2800
   defines that as "the making of arrangements prior to death." Hospice
   families are pre-death. (a) Is platform-sent outreach to funeral homes
   for an identified living patient inside it? (b) Is a family-sent
   template (we supply the text, the family sends it) clearly outside?
   (c) Is pre-death **price education** (benchmarks, the analyzer, rights
   guides) clearly outside? Until this is answered, the plan keeps
   pre-death outreach off whenever the family or any recipient home is in
   Virginia. (Virginia memo §4.2; overview change #4.)
2. **"Making arrangements" / "assist in the practice": the selection
   redesign.** Today the chosen home is told the family "selected your firm
   … at the price you quoted," and the platform relays scheduling of the
   arrangement meeting. We propose instead: a message in the family's voice,
   no price acceptance, the quote attached for reference only, and no
   scheduling relay. Does that shape clear Va. Code § 54.1-2800 ("the making
   of arrangements for the funeral service") and Md. Health Occ. § 7-501
   ("assist in the practice")? What authorization and agency language do you
   want in the outreach and selection emails? (Virginia memo §4.1; Maryland
   memo §4.1; overview changes #1–3, #5.)
3. **Hospice-side, per jurisdiction** (replaces the August packet's Utah
   R432-750 clause in Q3). The state licensing rules all require year-long
   bereavement support: Virginia 12VAC5-391-370 (at least one year),
   Maryland COMAR 10.07.21, and DC's rules under § 44-501. Does anything in
   them constrain a hospice buying this service or handing it to families?
   Should we be on the hospice's bereavement-resource list? The state
   Medicaid kickback analogs are Va. Code § 32.1-315, Md. Crim. Law
   § 8-511, and D.C. Code § 4-802. Do they transfer the federal analysis
   cleanly, and are there all-payer analogs?
4. **Cross-border conflict of laws.** Our working rule: the family's
   jurisdiction governs consumer protection and privacy; the home's
   jurisdiction governs anything touching the licensed practice; the
   strictest applicable rule governs each case, so we design market-wide to
   Virginia's text. Is that right? (Overview §2.)
5. **DC CPPA exposure.** The CPPA reaches free services ("receive"), covers
   "provide information about" as a trade practice, and gives
   public-interest organizations standing at $1,500 per violation. Which of
   our claims ("free to families, forever," "neutral," savings figures,
   "fair price" labels) is most exposed? What does the substantiation file
   need to contain? Does § 28-3904(f)'s material-omission prong make
   **disclosure of the hospice payer** mandatory in DC? (This sharpens the
   August packet's Q9.) (DC memo §6.)
6. **MODPA and the outcomes dataset.** Maryland's law applies at 35,000
   Maryland users, covers nonprofits, and limits sensitive-data processing
   to what is strictly necessary. Are grief check-ins or hospice status
   consumer health data? What de-identification standard lets the outcomes
   dataset (the business's moat) fall outside "personal data"? (Maryland
   memo §8.)
7. **Virginia GD 65-4 and the ask-or-don't-ask question.** Obtain the full
   text of the Board's "Aiding and abetting unlicensed practice" guidance
   (reaffirmed July 2023) and the 2025 Town Hall guidance action. Should we
   seek informal comfort from Board staff, or not ask?
8. **Name and holding-out in all three.** Is there any restriction on
   "funeral" in an unlicensed entity's name? Maryland § 7-502 reaches a
   "description of services." Bless the disclaimer text and placement, and
   the copy audit (overview change #7).
9. **CPA, not counsel: invoice tax classification.** DC taxes SaaS at 6%
   (7% from 2026-10-01). Maryland taxes enterprise SaaS and IT services at
   3%. Virginia generally does not tax SaaS. How does a "bereavement support
   program — [tier]" invoice classify in each?

## 3. What our research concluded (pressure-test these)

| # | Claim | Confidence |
|---|---|---|
| D1 | DC's licensed practice is custody-anchored (§ 3-402), and its solicitation definition expressly excludes "responses to requests for information from consumers." DC is the cleanest licensing jurisdiction. | High: statutory text, official extract |
| D2 | DC mandates online price lists for any home with a website (Consumer Bill of Rights for Funeral Home Establishments), and its Attorney General has surveyed and published all 38 DC homes' prices. The regulator's own policy is our product. | High: OAG and DLCP pages |
| D3 | Maryland clause (iii) needs *compensation* **and** *arranging disposition*. A flat hospice fee, owed regardless of any family's use, leaves both elements missing. **A per-family or per-funeral fee would weaken this.** | Medium: definition verified; construction untested |
| D4 | Virginia's text is the hardest in the market: "making of arrangements," an any-person preneed-planning ban, no useful exemptions, and a licensee-majority Board with an unlicensed-third-party guidance document. The core product still clears, because § 54.1-2812 itself separates price inquiry from arrangements. | Medium: text verified; construction untested |
| D5 | The current selection email (price acceptance plus scheduling relay) is inconsistent with the Utah memo's own "never conveys acceptance" requirement, not only with DMV law. It is drift, surfaced by the DMV's sharper text. | High: code read directly |
| D6 | None of the three DMV solicitation regimes reaches a platform directly. Virginia reaches any person through **licensure** (preneed planning), not solicitation. | Medium-high |

## 4. Research method and its limits

All DMV research ran 2026-09-23 through web search against official
sources. Direct fetches of `law.lis.virginia.gov`, `mgaleg.maryland.gov`,
`code.dccouncil.gov`, and `dcregs.dc.gov` were blocked by the research
environment's network policy. Every quotation in the clearance drafts is
tagged **[OFFICIAL-EXTRACT]** (the official site's indexed text: likely
exact, re-read before relying) or **[SECONDARY]**. Nothing was quoted from
memory. The firm should treat the section numbers as leads to verify, not
settled cites. The August packet's §5 citation-correction log practice
continues: when counsel corrects a cite, fix it in the draft and log it
here.
