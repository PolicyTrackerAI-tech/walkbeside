# HIPAA Business-Associate Position Paper (DRAFT)

> **DRAFT for counsel review. Not legal advice.** Prepared 2026-08-18. This
> is the single most load-bearing legal assumption in the company and is
> flagged as such in the business plan. The ask to counsel: confirm the
> position, then make sure the services agreement's language preserves it
> (the agreement and this paper were drafted together; see
> `HOSPICE_SERVICES_AGREEMENT_DRAFT.md` §§1.1, 4).

## Position

**Honest Funeral is not a covered entity and, in the default model, not a
business associate of any hospice. By construction, not by assertion.**

## The design facts

1. **Family self-enrollment only.** The hospice hands the family activation
   materials after admission; the family activates directly and enters its
   own information. The hospice transmits nothing: no census, no referral
   list, no contact information, no admission or death dates.
2. **Data minimization.** The platform collects from the family: email,
   decedent name, ZIP, and scenario. No diagnoses, no medical record
   numbers, nothing clinical, nothing sourced from any covered entity.
   Partner attribution rides a non-clinical code column.
3. **Aggregate-only reporting.** The hospice receives counts, satisfaction,
   and documented-savings ranges, de-identified with minimum cell sizes.
   The partner dashboard has no surface that displays an identifiable
   family, and adding one is prohibited by the services agreement.
4. **Kill conditions are written down.** The BAA trigger list: any
   hospice-transmitted family or patient data; any staff-assisted enrollment
   performed for the hospice; any census or referral-list intake; any EHR
   integration. If a future contract requires any of these, the sequence is
   BAA first, then a full HIPAA program. The pilot agreement already commits
   to "BAA signed before any PHI exchange."

## The legal analysis

- **Not a covered entity.** Honest Funeral is not a health plan, health care
  clearinghouse, or health care provider transmitting covered transactions
  (45 C.F.R. §160.103). Uncontroversial.
- **Business associate turns on "on behalf of."** A business associate is one
  who creates, receives, maintains, or transmits PHI in performing a
  function **on behalf of** a covered entity (45 C.F.R. §160.103). The
  design defeats both halves: no PHI is received from the hospice, and the
  service is not performed on the hospice's behalf; it is a consumer service
  the family independently elects, whose duties run to the family.
- **OCR's health-app guidance supports the consumer framing.** OCR has
  repeatedly distinguished apps a consumer independently selects and
  controls (not BAs) from apps provided by or on behalf of a covered entity
  (BAs). The decisive facts OCR looks to, consumer selection and consumer
  control of data flow, are both present here even though the hospice hands
  the family the link. **[COUNSEL: the hand-off is the subtle fact; confirm
  that hospice-distributed activation materials do not convert the consumer
  relationship into an on-behalf-of relationship, and whether any OCR FAQ or
  enforcement informs it.]**
- **The tension to manage, stated plainly.** The Anti-Kickback framing
  (see `AKS_CMP_MEMO_DRAFT.md`) characterizes the subscription as the
  hospice procuring services that help discharge its §418.64(d) bereavement
  obligation. That framing pulls toward "performing a function on behalf of
  the covered entity." The reconciliation drafted into the services
  agreement: what the hospice procures is the **program** (availability,
  materials, staff orientation, aggregate reporting); what the family
  receives is a **consumer service it elects**, with duties running to the
  family; and no PHI exists anywhere in the exchange either way. The BA
  definition requires PHI in the function; a program with no PHI in either
  direction cannot make its vendor a business associate regardless of
  framing. **[COUNSEL: this is the paragraph to pressure-test hardest.]**
- **Decedent information.** PHI protections run 50 years after death (45
  C.F.R. §160.103 ¶(2)(iv); §164.502(f)), which is why "just send us your
  census" is designed out rather than merely discouraged, and why the
  trigger list treats decedent data identically to living-patient data.
- **De-identification standard.** Aggregate reporting follows 45 C.F.R.
  §164.514 principles with minimum cell sizes. Strictly, §164.514 governs
  covered entities; the platform adopts it voluntarily as the reporting
  standard so the hospice's compliance office can file the reports without
  analysis. **[COUNSEL: confirm the contract's cross-reference reads as a
  standard, not as an admission of covered status.]**
- **If HIPAA does not apply, state law still does.** Washington's My Health
  My Data Act and successors define "consumer health data" broadly enough to
  reach bereavement-adjacent data held by non-covered entities. A 50-state
  consumer-health-privacy scan is a normal counsel deliverable, sequenced
  after the four launch-gating items. Utah's own consumer privacy act
  applies at scale thresholds the company does not yet meet. **[COUNSEL:
  confirm Utah thresholds; flag any state that regulates at our size.]**

## Voluntary posture regardless of status

Encryption in transit and at rest; owner-scoped row-level security on every
family table; PII masked in logs; deletion cascade; access limited by
allowlist. The company operates near the technical-safeguards bar because
hospice security reviews ask HIPAA-shaped questions regardless of BA status,
and because the posture costs little and de-risks the sale.

## What would change the answer

Any one of: hospice-transmitted patient data, staff-assisted enrollment on
the hospice's behalf, census/referral intake, EHR integration, or a partner
surface showing an identifiable family. Each is contractually prohibited,
architecturally absent, and listed as a BAA trigger. The company's position
is only as good as these stay true; the services agreement makes them
covenants rather than intentions.
