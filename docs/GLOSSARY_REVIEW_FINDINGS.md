# Glossary content — AI verification findings (2026-05-21)

Independent verification of the 64-term funeral glossary (`lib/glossary.ts`)
by 8 parallel agents (one per category), web-checked against FTC, NFDA,
Funeral Consumers Alliance, Consumer Reports, state vital-records, SSA.

> AI cross-verification, not a substitute for expert sign-off. Review against
> this list (or extend `/admin/faith-qa` to cover glossary).

## Summary: 118 claims checked — 97 confirmed, 19 needs-nuance, 2 wrong

Money figures largely aligned with 2023–24 NFDA data; FTC legal claims
(GPL on request, phone quoting, third-party casket no-handling-fee) all
confirmed. Only a couple of genuine errors.

## Fixed automatically (clear, well-cited)

- **Direct cremation / FTC**: corrected a false legal claim — homes are NOT blanket-required to *offer* direct cremation; the Rule requires that IF they offer cremation, direct cremation be a separately-priced option (no forced casket) + alternative container + phone quoting. Now stated accurately.
- **Celebrant fee**: $150–$500 → $250–$1,000 (most $300–$500); the $150 floor was below market.
- **Basic services fee**: "the only legally non-declinable item" → "the primary non-declinable item" (avoids overstating exclusivity).

## For human reviewer — needs-nuance (medium+)

| Term | Type | Issue & direction | Source |
|---|---|---|---|
| Non-declinable basic services fee | legal | Change to: 'The one fee a funeral home is allowed to charge every family regardless of what services they pick — the primary non-declinable item under the FTC Funeral Rul | 16 CFR 453.2(b)(3); the Funeral Rule allows ba |
| Funeral insurance | money | Increase upper range to reflect realistic lifetime premiums: 'Premiums for a $10,000 policy purchased at age 65 commonly total $20,000–$35,000 over the policyholder's exp | Gerber Life, AARP insurance: A $10,000 whole-l |
| Who signs the medical section of a | definition | Revise to: 'The medical section is signed by an attending physician, medical examiner, or (in some states) a trained hospice nurse, depending on state law and circumstanc | State vital records rules vary. Most allow phy |
| When burial-transit permit is issu | definition | Revise to: 'The burial-transit permit is issued by the county vital records office (or equivalent), typically within 1-5 business days of the death certificate being file | County practices vary. Some vital records offi |
| Cremated remains weight | definition | Change cremated-remains entry short description to 'roughly 4 to 8 pounds' or 'typically 4-8 pounds, up to 9 for larger adults' to align with cremation entry and industry | Cremation Association of America industry stan |
| Immediate burial must appear on Ge | legal | Change line 590 from 'must appear as its own line on every funeral home's General Price List under the FTC Funeral Rule' to 'should appear on the General Price List if th | 16 CFR Part 453.2(b)(4) requires itemized Gene |
| Third-party casket discount vs fun | money | Either: (1) Update third-party-casket entry to say 'typically run 200–400% above wholesale' to match the stated examples, OR (2) revise the casket entry example to a lowe | Casket entry line 313 and third-party-casket e |
| Vault and grave liner pricing - in | money | Update grave-liner entry line 722 to read: 'typically $700–$1,500 versus $1,500–$3,500 for a sealed concrete vault' (or $1,000–$3,500 if including lower-end sealed vaults | Internal inconsistency within glossary.ts: gra |
| Pre-need risk warning | watchout | Revise to: 'Funeral homes sometimes change ownership or close. New owners often honor pre-need arrangements but may not honor the original prices. Mishandled funds and ge |  |
| Letters testamentary | money | Update to '$5–$20+ per copy, depending on county' or '$5–$15+ per copy depending on jurisdiction' to reflect regional variation more accurately | County court fee schedules vary; $5-$15 is rea |
| Death doula | money | Revise to: 'Typical 2026 fees: $500–$5,000 for full home funeral packages, $80–$200 per hour for shorter engagements such as planning or hospice support.' This reflects t | [US Funerals Online - Death Doula Cost](https: |
| Coroner / Medical examiner | definition | Revise to: 'About 23 states use medical examiner systems, 13 use coroner systems, and 14 use mixed systems. Medical examiner systems serve about 48% of the US population. | [Bureau of Justice Statistics - Medical Examin |

_(12 medium+ nuance items; 7 more low-severity wording notes available in the raw verification output.)_

## Per-category summaries

**funeral-glossary-money-facts** — Verified 9 money-category glossary entries covering 45+ specific claims about funeral costs, FTC regulations, and insurance. Found 3 claims with HIGH severity issues: (1) basic services fee described incorrectly as "the only legally non-declinable item" (other services are also non-declinable under Funeral Rule), (2) funeral insurance premium estimates for a

**funeral-guidance-glossary** — Verified 5 paperwork category glossary entries covering death certificates, burial-transit permits, next of kin, right of disposition, and cremation authorization. Found 2 medium-severity issues: imprecise state count language in watchOut, and timing variance not disclosed in burial-transit permit description. Core legal claims verified against FTC Funeral R

**Glossary Fact-Check: "Body" Category Entries** — Verified all 14 "body" category glossary entries in /Users/ryancurrie/FH/lib/glossary.ts. Found one medium-severity inconsistency (cremated remains weight range overly broad and conflicting with cremation entry), and three low-severity wording/nuance issues. All major legal claims confirmed: embalming not required by law (except edge cases), green burial leg

**funeral-services-glossary** — Verification of 8 "services" category entries in /Users/ryancurrie/FH/lib/glossary.ts. Found one HIGH-severity legal claim error about FTC mandating direct cremation, and one MEDIUM-severity claim that immediate burial must appear on GPL. Most pricing figures and legal claims are confirmed, with appropriate caveats noted in project documentation.

**funeral-items-glossary** — Verification of 9 entries in the "items" category of /Users/ryancurrie/FH/lib/glossary.ts. Focus on FTC Funeral Rule claims, legal requirements, dollar figures, and scientific assertions. Most claims are confirmed; two show internal inconsistencies in pricing ranges and one markup percentage claim appears overstated.

**Funeral Glossary - Timing Category** — Verified all claims in the "timing" category (2 entries: pre-need and at-need). Nearly all claims are confirmed by authoritative sources including FTC guidance, state law, and consumer protection organizations. One claim needs nuance: the entry overstates how often funeral homes "refuse to honor contracts"—the more common issue is that new owners won't honor

**Glossary fact-check: "after" category entries** — Verification of 10 glossary entries in the "after" category (probate, executor, intestate, letters-testamentary, beneficiary-designation, payable-on-death, will, estate, small-estate-affidavit, power-of-attorney). Overall accuracy is high: all major legal principles are correct; monetary ranges and timelines are generally reasonable estimates. One entry has 

**funeral-guidance-glossary** — Verified all claims in the "people" category of lib/glossary.ts. Most factual claims about role definitions, licensing, and legal requirements are confirmed. Two claims need nuance: (1) death doula fee ranges are conservative compared to market data, and (2) state distribution of medical examiners vs. coroners is more complex than "about half/half." One clai
