# Anti-Kickback / Beneficiary-Inducement Position Memo (DRAFT)

> **DRAFT for counsel review. Not legal advice.** Prepared 2026-08-18 by the
> founder with AI assistance from primary sources (statutes, regulations, OIG
> advisory opinions and policy statements, 2023–2026 enforcement records).
> The ask to counsel: confirm or correct this analysis and deliver it as a
> firm memo suitable for a hospice compliance officer's file. **[COUNSEL]**
> flags mark judgment calls.

## Question presented

May a Medicare-certified hospice pay Honest Funeral Co. a flat annual
subscription to make a free funeral-price education and navigation service
available to families of admitted patients, consistent with the federal
Anti-Kickback Statute and the beneficiary-inducement Civil Monetary Penalty,
where the benefit is delivered only post-admission, families self-activate,
the fee has no volume linkage, and Honest Funeral takes no funeral-industry
money?

## Short answer (position)

Yes, as structured. The funeral itself is never payable by a federal health
care program, so the only federal nexus is the family's selection or
retention of the hospice. The model addresses that nexus four ways: the
benefit is procurement of the hospice's own mandated bereavement services
rather than a gift beyond the benefit; it is delivered post-admission only
and barred from pre-admission marketing; the fee is flat, set in advance, and
independent of volume; and the platform's consumer surfaces are provably
payment-blind toward hospices. No authority found prohibits the arrangement;
no authority found blesses it specifically either, and that asymmetry is why
this memo needs counsel's signature rather than ours.

## The facts that matter

1. Honest Funeral is free to families, takes no money from funeral providers
   or insurers (enforced in billing code), and presents all funeral options
   neutrally under a published anti-steering design.
2. The hospice pays a flat annual subscription, invoiced as "bereavement
   support program — [tier]," sized by census tier, fixed regardless of
   activations or referrals.
3. Families receive activation materials only after admission and activate
   themselves; the platform never cold-contacts families; the hospice
   transmits no patient information.
4. Medicare requires the hospice to make bereavement services available to
   the family up to a year after death (42 C.F.R. §418.64(d)) and pays
   nothing additional for it; hospice social workers commonly assist with
   funeral arrangements as psychosocial support today.
5. Honest Funeral also operates a free public directory of all Medicare
   hospices. Its payment-blindness is enforced by an automated test suite
   and documented in `docs/HOSPICE_DIRECTORY_FIREWALL.md`.

## Legal framework

- **Anti-Kickback Statute, 42 U.S.C. §1320a-7b(b):** criminalizes knowing
  and willful remuneration to induce referral, arranging, or recommending of
  items or services payable by a federal health care program. The "one
  purpose" test (United States v. Greber; United States v. Kats) condemns an
  arrangement if any one purpose of the payment is to induce referrals.
- **Beneficiary Inducements CMP, SSA §1128A(a)(5); 42 C.F.R. §1003.110:**
  prohibits offering remuneration to a Medicare or Medicaid beneficiary that
  the offeror knows or should know is likely to influence the beneficiary to
  order or receive items or services from a particular provider.
  "Remuneration" includes items or services provided free. Exceptions
  include, among others, arrangements that promote access to care and pose a
  low risk of harm.
- **OIG nominal-value policy (Dec. 7, 2016):** $15 per item / $75 aggregate
  annually. A benefit funded at $4,800 to $18,000 per year will not fit
  nominal value; the analysis cannot rest there.
- **OIG Advisory Opinion 00-3 (Apr. 7, 2000):** the closest authority. A
  hospice furnished free services to pre-election terminally ill patients.
  OIG recognized potential prohibited remuneration but declined sanctions
  given (1) unpaid volunteers, (2) primarily intangible benefits,
  (3) substantial benefit to a vulnerable population, and (4) structural
  barriers to overutilization of hospice election. The opinion also warns
  that free services substituting for what a referral source must itself
  furnish can be disguised kickbacks (citing the 1998 Special Fraud Alert on
  hospice–nursing home arrangements).
- **Enforcement pattern, 2025–2026:** national takedowns charged hospice
  owners for, among other things, cash payments to beneficiaries to enroll
  and remain enrolled. The prosecuted pattern is cash or cash-equivalents
  conditioned on election or retention; no enforcement located involves
  post-admission, in-kind bereavement support.
- **No advisory opinion exists on a hospice-paid bereavement or
  funeral-navigation benefit.** Absence is not clearance. **[COUNSEL:
  evaluate whether to seek an advisory opinion once the pilot design
  freezes.]**

## Analysis

**1. The funeral transaction is outside the statutes.** Funeral goods and
services are never payable by a federal health care program, so steering
within the funeral market, which the platform in any case does not do,
cannot implicate the AKS. The exposure, if any, attaches to the choice of
hospice.

**2. Selection inducement is addressed structurally.** The CMP requires
remuneration "likely to influence" selection of a particular provider. A
benefit that no prospective patient hears about before admission cannot
influence selection at the moment of election. The contract forbids
pre-admission marketing use outright, and the hospice covenants to it.
OIG AO 00-3's concern ran to free services for pre-election patients, the
direction this model excludes by design.

**3. Retention is the harder theory, and the procurement framing answers
it.** A family already receiving the benefit has, in theory, a reason to
remain with the hospice. Three responses. First, the benefit is in-kind
support of a kind the hospice is already obligated to make available under
§418.64(d); paying a vendor to help discharge a Condition of Participation
is the purchase of services, not a gift of remuneration beyond the benefit
package, in the same way hospices today pay grief-text vendors, bereavement
mailer services, and CAHPS survey vendors. Second, the prosecuted retention
cases involve cash to beneficiaries; nothing located treats mandated
bereavement-type support as an inducement to remain enrolled. Third, the
promotes-access-to-care exception provides a fallback frame: the benefit
improves access to non-reimbursed psychosocial support with low risk of
overutilization harm, since bereavement support does not drive federal
spend. **[COUNSEL: weigh whether the promotes-access exception analysis
belongs in the final memo or stays as fallback.]**

**4. The fee design removes volume optics.** Flat, set in advance, sized by
census tier only, no per-activation or per-referral component, arm's-length,
with an FMV recital in the contract and pricing visibly comparable to what
the hospice would spend to provide equivalent support internally (a fraction
of one bereavement-coordinator FTE). **[COUNSEL: advise on FMV documentation
form; a one-page contemporaneous FMV worksheet is drafted as a contract
exhibit option.]**

**5. Platform-side exposure is closed.** Because hospice care is federally
payable, a platform that accepted hospice money while preferring paying
hospices in consumer surfaces could itself face AKS exposure for
recommending providers. The consumer hospice directory is payment-blind:
ordering and presentation read no partner or billing status, the public page
states that no hospice pays to appear, and an automated test suite enforces
the separation. This is the hospice-side mirror of the platform's funeral
anti-steering rule.

## Conditions (drafted as contract covenants; any breach collapses the analysis)

1. Post-admission delivery only; no pre-admission marketing use, ever.
2. Flat fees only; no per-activation, per-referral, or volume-linked
   component; no payment routed through funeral providers or insurers.
3. Family-initiated activation only; no platform contact with families who
   have not activated; no hospice transmission of patient information.
4. Payment-blind hospice directory, continuously enforced and documented.

## Open items for counsel

- Confirm the retention analysis and the procurement framing's strength.
- Utah state analogs: whether Utah's insurance-fraud or kickback statutes
  add anything federal law does not. **[COUNSEL]**
- Advisory-opinion strategy: cost, timeline, and whether the certainty is
  worth it before scale. **[COUNSEL]**
- Whether any hospice compliance officer objection patterns (from their
  side's counsel) warrant additional recitals.

## Primary sources

42 U.S.C. §1320a-7b(b) · SSA §1128A(a)(5) · 42 C.F.R. §1003.110 · 42 C.F.R.
§418.64(d) · OIG AO 00-3 · OIG Policy Statement on Gifts of Nominal Value
(2016) · Special Fraud Alert, 63 Fed. Reg. 20415 (1998) · OIG Hospice
Compliance Program Guidance, 64 Fed. Reg. 54031 (1999) · DOJ national
health-care fraud takedowns (June 2025; 2026) and C.D. Cal. hospice
prosecutions · United States v. Greber, 760 F.2d 68 (3d Cir. 1985) · United
States v. Kats, 871 F.2d 105 (9th Cir. 1989).
