# Anti-steering design evidence — pointer for counsel

> Not legal advice. This is a code-cited exhibit for the attorney engaged via
> [`LAWYER_OUTREACH.md`](LAWYER_OUTREACH.md), so the first call can start from
> "here's what's built" instead of spending billable time on discovery.
> Answers [`COMPLIANCE_ADDENDUM.md`](COMPLIANCE_ADDENDUM.md) §1's five design
> constraints, one bullet each. Deliberately short — expand only if counsel
> asks for more on a specific point.

1. **Deterministic, neutral directory ordering, no paid signal.**
   [`lib/negotiation/directory.ts:38-56`](../lib/negotiation/directory.ts) —
   `findHomesFromDirectory` selects only `name, email, zip` (no rating/paid
   field exists to sort by), filters `active = true AND vetted = true`, then
   orders by geographic proximity only: exact zip match → same 3-digit zip
   prefix → the rest. Same criterion for every family, every home.

2. **No "recommended home" UI.** Grepped `app/funeral-homes/` and
   `app/negotiate/` for "recommended," "our pick," "best match," "top
   choice" — zero hits. Results render as a flat, unranked-by-preference
   list; the family selects.

3. **Single reviewed hand-off copy constant.** The coordinator link-share
   page, [`app/partner/r/[token]/links/page.tsx:114-123`](../app/partner/r/%5Btoken%5D/links/page.tsx),
   carries one fixed "neutrality pledge" paragraph and describes every link
   as opening "free, neutral tools" — identical wording regardless of which
   homes exist near that family. Outreach emails to homes go through the
   single deterministic template `buildOutreachEmail`
   ([`lib/negotiation/email-body.ts`](../lib/negotiation/email-body.ts)).

4. **Aggregate-only partner reporting, n>5 suppression.**
   [`lib/partner-report.ts:68-119`](../lib/partner-report.ts) — cohorts below
   `SMALL_SAMPLE_THRESHOLD` return a discriminant `smallSample: true` object
   with the underlying numeric fields nulled at the source, not just hidden
   in the UI, "so the suppression gate can't be bypassed by a future
   consumer that forgets to re-check `smallSample`." No per-home routing
   counts ("we sent N families to Home X") exist anywhere in the schema or
   the digest.

5. **`OUTREACH_LIVE` kill switch + `vetted=true` gate intact.**
   [`lib/negotiation/send.ts:31`](../lib/negotiation/send.ts) — `const live =
   process.env.OUTREACH_LIVE === "true"`; every send path routes through
   `sendOutreachForNegotiation`, and non-live runs record `dry_run` rows
   instead of sending. `findHomesFromDirectory` (item 1) hard-filters on
   `vetted = true`, so an unreviewed import can never be contacted even with
   the switch on. Confirmed unset/false as of this writing — no other send
   path exists in the codebase.

**Open question for counsel, not answered by code:** whether a hospice
*paying* Honest Funeral while we present its families a set of homes creates
Anti-Kickback or patient-brokering exposure for the hospice itself
([`COMPLIANCE_ADDENDUM.md`](COMPLIANCE_ADDENDUM.md) §1's own flag — "the
question that kills a pilot if missed"). That's a legal judgment, not
something the design constraints above can resolve.
