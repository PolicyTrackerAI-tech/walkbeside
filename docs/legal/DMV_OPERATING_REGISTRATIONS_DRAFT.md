# DMV Operating Registrations, Tax, Privacy Thresholds, and Insurance (DRAFT)

> **DRAFT for counsel and CPA review. Not legal or tax advice.** Prepared
> 2026-09-23, when the founder is DMV-based and Utah is cold. This updates
> [`ENTITY_PLAN_DRAFT.md`](ENTITY_PLAN_DRAFT.md): the LLC-to-Delaware plan
> stands, and only the "foreign-register where operations are" step moves
> from Utah to the founder's DMV home jurisdiction. Verification tags as in
> the clearance memos: **[OFFICIAL-EXTRACT]**, **[SECONDARY]**, **[VERIFY]**.

## 1. Do these first (all cheap; some gate a live send)

1. **Fix the email postal address before any live send.** CAN-SPAM requires
   a valid physical postal address in every commercial email. Every
   outbound footer renders `lib/postal-address.ts`, which defaults to the
   Utah LLC's registered-agent address in West Jordan, UT. If that agent no
   longer receives mail for the company, set `OUTREACH_POSTAL_ADDRESS` in
   Vercel to a valid DMV address. That can be a USPS PO box or a private
   mailbox at a commercial mail receiving agency, both of which the FTC
   accepts. No code change is needed; the environment variable overrides
   the default. **[FTC CAN-SPAM guidance: VERIFY current wording]**
2. **Decide which entity registers in the DMV.** Recommendation: **don't
   foreign-register the Utah LLC anywhere in the DMV** if the Delaware
   corporation is days or weeks away (Clerky formation was in progress per
   the 2026-08 close-out). Register the **corporation** once, in the
   founder's home jurisdiction. Registering the LLC now and the corporation
   later doubles the filings and the annual fees.
3. **Keep the Utah LLC in good standing until it's emptied.** Utah requires
   a registered agent with a Utah address. If the founder was the agent, a
   commercial registered agent is roughly $50 to $150 a year. The LLC winds
   down after the asset assignment to the corporation (Entity Plan Phase 3).
   Its Utah d/b/a lapses with it. **[COUNSEL: timing so nothing signed by
   the LLC is orphaned.]**
4. **The personal tax move** (part-year Utah resident): a CPA question, not
   a company one. Flagged so it isn't missed.

## 2. What the founder's home jurisdiction triggers

"Doing business" is where the founder lives and works. Selling to a
hospice across the line generally does not, by itself, create a
registration duty there. **[COUNSEL: confirm for each case.]**

| If the founder lives in… | Entity registration | Local license | State tax registration |
|---|---|---|---|
| **DC** | Foreign registration with DLCP Corporations (CorpOnline) **[SECONDARY]** | **Basic Business License**, General Business category; **Home Occupation Permit** if home-based; Clean Hands **[OFFICIAL-EXTRACT: dlcp.dc.gov]** | OTR: sales tax on SaaS at 6%, **7% from 2026-10-01**; DC franchise tax **[VERIFY rate and minimum]** |
| **Maryland** | Foreign qualification with SDAT; annual report plus fee **[SECONDARY; VERIFY fee]** | No general state business license; county home-occupation zoning rules **[VERIFY per county]** | Comptroller: 3% technology-services sales tax on enterprise SaaS **[SECONDARY]** |
| **Virginia** | SCC certificate of authority (corporation) or certificate of registration (LLC, $100) **[OFFICIAL-EXTRACT]** | **BPOL** local business license (Arlington, Alexandria, Fairfax County, and others) plus home-occupation permit **[SECONDARY]** | No sales tax on SaaS generally **[SECONDARY]**; state corporate income tax |

**Trade name:** once the Delaware corporation's legal name is "Honest Funeral
Co.", no DMV jurisdiction needs a trade-name or fictitious-name filing.
Until then, Virginia requires a certificate of assumed or fictitious name
before transacting business under the name (§ 59.1-69, $10; misdemeanor,
and a bar to suing in Virginia courts). Maryland and DC have their own
trade-name registrations. **[OFFICIAL-EXTRACT for Virginia; SECONDARY for
Maryland and DC]** One more reason to finish the corporation first.

## 3. Sales tax on the hospice subscription (the invoice question)

| Jurisdiction | Treatment of the hospice subscription | Rate | Notes |
|---|---|---|---|
| **DC** | SaaS taxable as a digital good / data processing service | 6% → **7% on 2026-10-01** | Economic nexus at $100k or 200 transactions; physical presence creates nexus regardless |
| **Maryland** | Enterprise SaaS / IT services (NAICS 518, 519, 5415, 5132) | **3%** since 2025-07-01 (individual-use SaaS 6%) | Old SaaS exemption repealed; Comptroller Technical Bulletin No. 56 |
| **Virginia** | Electronically delivered software / SaaS generally not taxable | 0% | Delivery now presumed electronic (Tax Commissioner Ruling 16-135 line) |

**Three actions:**
1. **Ask a CPA how the invoice classifies.** The execution plan invoices the
   subscription as "bereavement support program — [tier]." Is that taxable
   SaaS, or a non-taxable support or consulting service? The answer changes
   DC and Maryland tax on every invoice.
2. **Collect nonprofit exemption certificates at signature.** Many DMV
   hospices are nonprofits with state sales-tax exemption certificates.
3. **Configure the billing surface before the first paid invoice.** Stripe
   Tax registrations in the jurisdictions where we have nexus. Code never
   hardcodes rates, matching how price IDs are handled today.

## 4. Privacy law thresholds: count users by state now

| Law | Applies at | Counts nonprofits? | Health data |
|---|---|---|---|
| **MODPA (Maryland)** | **35,000** Maryland consumers a year (excluding payment-only data), or 10,000 plus 20% of revenue from data sales | **Yes** | Processed only when **strictly necessary**; sale banned |
| **VCDPA (Virginia)** | **100,000** Virginia consumers a year, or 25,000 plus more than 50% of revenue from data sales | No (exempt) | Opt-in consent for sensitive data |
| **DC** | No comprehensive statute found **[VERIFY]** | n/a | Breach-notification law applies |

**Action:** analytics should report distinct users by state (Maryland and
Virginia at least) so the threshold crossing is a date we see coming, not
one we discover. MODPA is the binding constraint. A free tool with real DMV
reach can plausibly cross 35,000 Maryland users within a year of launch. The
outcomes dataset should be built on **de-identified** records from the
start (see the Maryland memo §8).

## 5. Insurance (bind at the first signature, per the execution plan)

- **E&O / professional liability** and **cyber**: confirm the policy
  territory covers DC, Maryland, and Virginia operations. Confirm the
  business description reads "funeral price information and consumer
  education/advocacy platform." Do **not** describe it as "funeral
  services": underwriters may exclude or misrate it, and the description
  should match the licensing position.
- Ask whether the CPPA's statutory damages ($1,500 per violation) and
  defense costs for consumer-protection claims are covered or excluded.
  DC is where that exposure lives.

## 6. Address and account hygiene

- Postal address (item 1.1) → `OUTREACH_POSTAL_ADDRESS`.
- Stripe account business address and tax settings; bank address.
- Google Workspace, domain registrar contact, and Vercel billing address.
- Public pages: none of `/terms`, `/privacy`, `/our-role`, or
  `/for-funeral-homes` names Utah or a Utah governing law (checked
  2026-09-23), so no public-page edit is needed for the move.
- The hospice services agreement's governing law and venue are updated in
  the draft (was Utah / Salt Lake). See
  [`HOSPICE_SERVICES_AGREEMENT_DRAFT.md`](HOSPICE_SERVICES_AGREEMENT_DRAFT.md).

## 7. Cost sketch (DMV delta over the existing entity plan)

| Item | Approximate cost | When |
|---|---|---|
| Foreign registration of the corporation (one jurisdiction) | ~$100–300 | At formation |
| Local license (DC BBL / Virginia BPOL) | ~$100–400 (term- and locality-dependent) **[VERIFY]** | At formation |
| Commercial registered agent for the Utah LLC until wind-down | ~$50–150/yr | Now, if needed |
| PO box / CMRA mailbox for CAN-SPAM | ~$100–300/yr | Before any live send |
| CPA: invoice tax classification + Stripe Tax setup | ~$300–750 one-time | Before first paid invoice |
