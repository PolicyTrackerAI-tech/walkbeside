# Security and trust summary

*Honest Funeral ([legal entity name]) · prepared August 2026. This is the security summary we offer on discovery calls, written from what the product actually does today. Where a control is partial or not yet built, this document says so, because a compliance file full of soft claims protects no one. Questions and reports: [security contact email].*

## The design, in one paragraph

The hospice transmits nothing to us. A coordinator hands a family a link or card; the family decides whether to enroll, directly with us, as a consumer. Family case data is scoped to the family's own account. The hospice receives aggregate, de-identified outcomes only, and small cohorts are suppressed at the data layer rather than shown. There is no census upload, no patient roster, and no family-contact field anywhere in the partner product. Privacy here is structural, not procedural: the risky data flows do not have a surface to happen on.

## What the hospice can give us

The partner product accepts, in total: the organization's name and type, a contact name and work email, short free-text notes, and labels for referral codes. No field anywhere asks for a patient or family name, contact detail, diagnosis, census, or date of death. The price-list checker available to coordinators accepts pasted price documents and is built for funeral-home price lists. Checks run from the no-login report link are not saved at all; checks run from a signed-in portal account are saved to that coordinator's own account with contact details stripped. Nothing a coordinator checks there enters our benchmark dataset or the hospice's report.

## What the family gives us, and who can see it

Families sign up themselves with an email address and password. A family may enter: their zip code and scenario, the name of the person who died, funeral quotes and price-list text or photos, and, if they use those tools, obituary or eulogy inputs and an opt-in phone number for bereavement check-ins.

- Every family case table (cases, outreach, messages, analyses, trackers, drafts, profile) is protected by Postgres row-level security scoped to the owning account. One family cannot read another's rows, and partner organizations cannot read any family's rows.
- The hospice sees aggregate outcomes only: families served, average satisfaction, average savings, time to resolution. A report computed on fewer than five families shows the count and no averages; the suppression happens in the data layer, not in the display.
- During a pilot the founder runs every case by hand and can see the cases they run, through an access path restricted to a founder-maintained admin allowlist. No partner-facing surface shows an individual family.
- When a family arrives through a hospice's link, the case is tagged to that hospice for aggregate counting. The family's identity is never shown to the hospice.

## Consent and the benchmark dataset

Contribution of a family's anonymized price data to our public benchmark dataset is a separate, unchecked-by-default checkbox. Declining does not change the service. A decline is honored at the storage layer, not just the interface. Coordinator-run price checks carry no consent checkbox at all, deliberately: only a family can consent to contributing family data.

## Deletion and retention

A family can delete their account at any time from their account page. Deletion is immediate and cascades through the database: profile, tasks, cases, outreach records, message history, analyses, certificate trackers, and obituary drafts are removed together. Two honest caveats. First, if a family created a time-boxed sharing link (a planning snapshot anyone with the link can view for 7 days, or a household link with a rolling 30-day expiry), those expire on their own clocks rather than being deleted with the account. Second, an email already delivered to a funeral home cannot be recalled from that inbox; our stored copy is what deletion removes. Platform backups roll off on the database provider's schedule.

## Outbound contact and the kill switches

We never cold-contact a family, a next of kin, or a patient. There is no code path for it. Outbound email to funeral homes exists for one purpose, gathering quotes a family asked for, and every such send routes through a single audited function behind a default-off environment switch; with the switch off, the system records what it would have sent instead of sending. Only funeral homes that have been human-vetted can ever be contacted; that filter is in the database query, not in policy. Family notification emails and opt-in bereavement text messages sit behind their own default-off switches. As of this writing the outreach switch is off.

## AI processing

We use Anthropic's Claude models for price-list analysis and writing help. What is sent: the price-list or bill text a family (or coordinator) pastes, uploaded price-list images, funeral homes' emailed replies, and obituary or eulogy inputs, as entered. What is never sent: account identities, email addresses from our database, or database rows. Contact details (emails, phone numbers, ID-shaped numbers) are stripped from stored price-list copies; the text sent for analysis is otherwise as the user entered it, and names are not redacted. Under Anthropic's commercial API terms, our data is not used to train their models.

## Application security

- All traffic is HTTPS with HSTS preload. Clickjacking, MIME-sniffing, and referrer-leak protections are enforced on every response. A content security policy runs in report-only mode while it is tightened; it is not yet enforced.
- State-changing endpoints carry origin checks and per-route request-size caps. Rate limiting is best-effort per server instance, not a hard global quota.
- Family sign-in is email and password with email confirmation. Coordinator portal sign-in is by emailed magic link, bound to an invited seat. Administrative tools require a signed-in session on the founder-maintained allowlist.
- A hospice's no-login report link is a shared-secret URL: anyone holding it can view that organization's aggregate report and manage referral codes. It exposes no family data, is excluded from search indexing, and can be rotated at any time from the portal, which immediately invalidates every previously shared copy.
- Logs mask email addresses and identifiers. Email bodies and raw webhook payloads are not logged.

## Subprocessors

| Service | Role | What it receives |
|---|---|---|
| Vercel | Hosting and delivery | All application traffic; server logs |
| Supabase | Database and authentication | All stored data described above |
| Anthropic | AI analysis and drafting | The AI inputs described above; not used for model training under commercial terms |
| Resend | Outbound email | Email content we send (case updates, and quote requests when outreach is live) |
| Postmark | Inbound email | Funeral homes' emailed replies to quote requests |
| Stripe | Payments, reserved for future institutional billing | Nothing today. No billing runs through it, and no family payment exists anywhere in the product |
| Twilio | Text messages | Dormant. Only an opt-in family phone number and check-in message, and only if the SMS switch is turned on; it is off today |
| Vercel Analytics | Page analytics | Cookie-free, aggregate page counts; URLs are stripped of query strings and identifiers before sending |

No advertising trackers, no session recording, and no other analytics are present. Operational alerts to the founder are masked and carry no family content.

## What we do not have yet

Stated plainly, because you will ask and should.

- No SOC 2 certification of our own. Vercel and Supabase publish their own compliance documentation; ours is a roadmap item tied to scale, not a current fact.
- No third-party penetration test yet.
- Content security policy is report-only, not enforced.
- Rate limiting is per-instance, not distributed.
- Retention is deletion-on-request today; a 12-month auto-purge of closed cases is written policy, not yet automated.
- No BAA is in place, because no PHI flows to us by design. If a hospice ever wanted a data flow that involves PHI, that flow would wait for a BAA and counsel review first.
- This is a single-founder company. Production access is limited to the founder. That is a small attack surface and also a single point of operational dependency; we state it rather than dress it up.

---

*Honest Funeral · [founder name] · [email] · honestfuneral.co*
*Free to families. No funeral-home or insurer money. We never steer.*
