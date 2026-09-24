# DC claims re-audit: every public claim held to the CPPA standard

_Run 2026-09-24 for the DC launch (DMV legal overview §4 #8; DC clearance
draft DC-1, DC-2). It builds on the August claims register
([`A3-CLAIMS-REGISTER.md`](../SITE_AUDIT_2026-07/A3-CLAIMS-REGISTER.md)),
which remains the evidence file for every number. Not legal advice; counsel
confirms._

## Why DC is the strict case

DC's Consumer Protection Procedures Act (D.C. Code § 28-3901 et seq.)
reaches a free service. A "consumer" includes anyone who would "receive"
consumer services, and a "trade practice" includes providing information
about the sale of consumer goods and services. That describes our whole
product. The core misrepresentation and omission prongs of § 28-3904 need
no proof of reliance or intent. Remedies are treble damages or **$1,500 per
violation**, plus fees, and public-interest organizations can sue with a
"sufficient nexus." (Sources and verification levels:
[`DC_CLEARANCE_DRAFT.md`](DC_CLEARANCE_DRAFT.md) §6.)

The test applied to every claim below: **is it true, can we show it, and
would a reasonable DC consumer read more into it than we can support?**

## Method

1. Swept `app/`, `components/`, the email builders and the city-page data
   for independence, vetting, savings, speed, legal-rights, free-forever and
   who-pays claims (grep patterns in the appendix).
2. Checked each against its substantiation: code tripwires for structural
   claims, the A3 register for numbers, the regulation text for FTC Rule
   claims.
3. Fixed today whatever narrows a claim without changing the product.
   Anything that needs a legal judgment goes to counsel.

Verdicts: ✅ holds, with the evidence named · 🔧 narrowed today · ⚖️ counsel
decides · 📌 holds today, but has a condition that could break it.

## The register

| # | Claim (where) | Substantiation | Verdict |
|---|---|---|---|
| 1 | **"Free to families, always"** (wizard, `/negotiate` metadata, `/how-it-works`, terms) | No family charge exists anywhere: the consumer payment was decommissioned 2026-06-26, and the billing eligibility allowlist and Stripe factory scan are CI-tested (A10). | 📌 True while no feature is ever gated on a hospice code (counsel packet Q5). A code-gated feature would turn this into a DC misrepresentation first. |
| 2 | **"No money from funeral homes or insurers"** (homepage, pledge, terms, footers) | Guardrail #1, enforced by the billing factory scan and the eligibility allowlist, both CI-tested. | ✅ |
| 3 | **"Neutral," "never steers you to any provider"** (neutrality pledge, `/how-it-works`) | Anti-steering is structural: the directory draw is shuffled within each tier, no ranking uses partner data, and referral codes are reporting-only (`lib/negotiation/directory.ts`, [`ANTI_STEERING_EVIDENCE.md`](../ANTI_STEERING_EVIDENCE.md)). | ✅ |
| 4 | **"Independent"** (pledge, digest emails) | No ownership or revenue ties to any provider. | ✅ |
| 5 | **"Homes we've personally vetted"** (`/how-it-works`) | Vetting = licensed and operating, current email, in-market, not a duplicate, not a broker or aggregator ([`UTAH_HOMES_SOURCING.md`](../UTAH_HOMES_SOURCING.md) checklist). The word alone can read as a quality endorsement (§ 28-3904(a), (d)). | 🔧 **Defined on the page today:** "…checked that each is a licensed, operating funeral home with a current email, not a broker or directory listing; it isn't a rating or a recommendation." This also supports guardrail #3. |
| 6 | **"See the overcharges and FTC-rule violations in seconds"** (homepage + site metadata ×4) | The analyzer's own cards say "Likely FTC violation," and prices are compared against modeled ranges until a metro is verified. The metadata asserted certainty that the product itself doesn't. | 🔧 **Now "likely overcharges and FTC-rule problems"** on all five surfaces, matching the product. |
| 7 | **"Any funeral home must give you its price list when you ask"** (analyzer ahead-mode, `/plan-now`); **"…on request"** (`/prices`) | 16 CFR § 453.2(b)(4) requires the GPL for **in-person** inquiries. Phone inquiries get price information by phone (§ 453.2(b)(1)), not a mailed list. | 🔧 **Now says "in person"** (the analyzer line adds the phone rule). |
| 8 | **DC city page:** "Washington-area funeral costs run above the national average" (`lib/city-pages.ts`) | Our DC multiplier (1.20) is modeled from regional price parities. There are no DC price lists in the dataset yet. | 🔧 **Now "Our Washington-area ranges are modeled above the national average…"**, which states what the model does. |
| 9 | **Fair-price ranges for DC zips** (`/prices`, `/funeral-costs/washington-dc`, analyzer) | Every badge degrades to "Modeled estimate" with zero verified overrides (A3). DC promotes to "verified" only at n≥5 per metro label (guardrail #4). | ✅ The badge is the disclosure. Keep it until the DC dataset is promoted (target 10/16). |
| 10 | **Overpayment band "$2,000–$5,000"** (homepage, `/partners`, `/employers`, FAQ) | Projection framing, derived on `/methodology#overcharge-figure` from three cited anchors, and labeled "not a measured outcome of our cases" (A3-01). | ✅ |
| 11 | **Price dispersion "200–400%"**; casket markup "300–500%"; savings "40–70%" | FCA/CFA surveys, attributed where stated (A3-05). | ✅ |
| 12 | **"Can cost 2–3× more across town"** (`/plan-now`, dashboard card) | Unattributed, but a conservative under-claim next to the attributed 200–400%. | ✅ Low risk. Attribute it ("consumer surveys") at the next edit of either page. |
| 13 | **Partner metrics** ("Overcharge caught," "Avg satisfaction") on `/partners`, `/employers` | Labeled "Illustrative sample cohort — no customer has generated this." | ✅ |
| 14 | **"Your choices are never shared with {partner} — they see only anonymous totals"** (pledge) | Partner surfaces show aggregates only, with n≥5 and banding server-side (#191); family tables are RLS-scoped. | ✅ |
| 15 | **"Nothing leaves your device"** (on-device tools) | Verified per tool in A4. | ✅ |
| 16 | **Who pays**, for a hospice-activated family | `/how-it-works` and `/terms` say revenue comes from the institutions that serve families. The co-brand pledge says "Provided to you free by {partner}." Neither says the partner pays us. § 28-3904(f) makes a misleading omission of a material fact actionable. | ⚖️ **Counsel (DC-2, packet Q9):** is "Provided to you free by {partner}" plus the site-wide statement enough, or must the activation flow say the partner pays Honest Funeral? One change to `components/partner/NeutralityPledge.tsx` covers every surface. |
| 17 | **"In seconds"** (analyzer speed, homepage) | Unmeasured: the extraction routes set no `maxDuration`, and no latency is logged per run. | ✅ Low risk (puffery-adjacent). Measure p95 at launch; if it exceeds a minute, say "in under a minute." |
| 18 | **"Attachments don't reach the family yet"** (outreach email, `/for-funeral-homes`, new today) | True. Attachments are neither displayed nor parsed (A8-06 fix). | ✅ |
| 19 | **"Virginia has its own rules for arranging a funeral before a death"** (pre-death hold page, new today) | Va. Code § 54.1-2800 et seq. (preneed). | ✅ |
| 20 | **"Consumer advocate," "on your behalf," "help schedule the arrangement meeting"** | Truthful descriptions of today's product, but they are exactly what the MD/VA drafts flag as arranging-adjacent. | ⚖️ Counsel, via the redline ([`COUNSEL_REDLINE_DMV_2026-09.md`](COUNSEL_REDLINE_DMV_2026-09.md) D1–D3, #7). |

## What changed in code today

- `app/how-it-works/page.tsx`: defines "vetted" (#5).
- `app/page.tsx`, `app/layout.tsx`: "likely overcharges and FTC-rule
  problems" (#6).
- `app/analyzer/Analyzer.tsx`, `app/plan-now/PlanNow.tsx`,
  `app/prices/page.tsx`: the in-person GPL rule (#7).
- `lib/city-pages.ts`: the DC blurb states what the model does (#8).

## Standing rules for DC-facing copy (add to the review checklist)

1. A number needs a source on the page or a `/methodology` anchor.
2. A word that sounds like an endorsement ("vetted," "trusted," "best") is
   defined where it appears, or not used.
3. Legal-rights claims quote the rule's actual scope (in person vs by
   phone; the provider's duty vs the family's option).
4. A claim about a home's conduct is hedged the way the product hedges it
   ("likely").
5. Anything about who pays is decided once, in the neutrality pledge
   component, and rendered from there.

## Appendix: sweep patterns

```
grep -rhoiE "\b(vetted|independent|neutral|unbiased|conflict-free)\b" app components
grep -rhoiE "\b(save[sd]?|saving[s]?|overcharg\w*|overpa\w*|guarantee\w*)\b" app components lib
grep -rhoiE "(must|required to|have to) (give|send|provide|email|mail)" app components
grep -rn "Free to families, always|in seconds|Overcharge caught" app components lib
```
