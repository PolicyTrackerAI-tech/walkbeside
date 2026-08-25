# Pilot Onboarding Runbook

_The path a real hospice runs from "yes" to families activating, with every
switch, gate, and known edge named. Written by audit day A5 (2026-08-24);
verify against code before each pilot — line anchors drift._

**Standing law throughout:** nothing signs before counsel sign-off
(`docs/legal/COUNSEL_PACKET_2026-08.md` is the ask list) · benefit is
delivered post-admission only, family activates, hospice transmits nothing ·
`OUTREACH_LIVE` stays off until the founder flips it deliberately.

## 0. Preconditions (founder, one-time)

- [ ] `ADMIN_EMAILS` set in Vercel prod (admin gate fails closed without it).
- [ ] `supabase/migrations/2026-08-18-share-links-lockdown.sql` applied in prod.
- [ ] `supabase/migrations/2026-08-25-analysis-input-hash.sql` applied in prod
      **before the code deploys** — un-migrated, `/admin/ingest-gpl` 500s on
      every save (blocking the GPL harvest ingest) and analyzer persistence
      degrades to `saved: false`.
- [ ] SLC GPL ingest under way (`~/FH/gpl-harvest/README.md` runbook) and the
      first vetted homes in `funeral_homes` (`active AND vetted AND email`),
      so an at-need family doesn't dead-end at `no_homes_available`.
- [ ] Counsel has reviewed the agreement drafts (gates the SIGNATURE, not the
      build or the demo).

## 1. Create the org (either path)

**Self-serve:** hospice applies at `/partners/apply` → row lands
`active=false` → founder reviews on `/admin/partners`.
**Founder-led:** create via the same apply flow using the hospice's real
contact email (never a personal proxy — approval emails the portal links to
this address verbatim; there is no address-confirmation step, so typos ship).

## 2. Approve (founder, /admin/partners)

Approving flips `active=true`, stamps `approved_at`, seats the contact email
as the portal OWNER, and **sends a real email** to `contact_email` with both
access paths. Double-check the address before clicking — test orgs use
founder-owned addresses only.

The two access paths that email carries:
- **Portal (session):** `/portal/login` — email sign-in, per-seat.
- **Quick link (token):** `/partner/r/<report_token>` — the no-account bearer
  URL for line staff. Report, referral links, quote check, and (since A5)
  the printable family-materials kit all work from it. Rotating the token
  (`/portal/settings`) is the only revocation.

Pausing: set status `paused` on /admin/partners. Since A5 this parks BOTH
surfaces — session portal and every token page — the moment it lands.

## 3. Coordinator setup (hospice side, ~15 minutes)

1. Open the quick link (or sign in) → **Referral links** → create the first
   link (a label per team or facility is plenty; **never per-family** — the
   services agreement's no-per-family-codes covenant, and small counts band
   as "fewer than 5" regardless).
2. **Family materials** → print the one-pager + QR posters, copy the email
   snippets. Everything carries the neutrality pledge verbatim.
3. Placement rule (also in the materials' own copy): admission packet or any
   time after — never in anything used to attract families pre-election.

## 4. Families activate

Family scans/opens `/plan-now?ref=HF-XXXXXX` → attribution is remembered
on-device and stamps their later analyzer checks and cases → all reporting
back to the org is aggregate-only, n≥5-gated, small counts banded. The
platform never contacts a next of kin first; opt-in follow-ups to an
activated family are fine.

## 5. What the org sees while it runs

- Token report / portal: families-helped (banded), checker-families
  (distinct people, banded), dollar + satisfaction figures only at n≥5.
- Founder's own desks: `/admin/outcomes` (headline totals exclude demo-org
  cases automatically since A5), `/admin/partners` (leads now have a
  mark-handled button — triage once, not forever).
- Weekly digest cron (`PARTNER_DIGEST_ENABLED`) stays off until wanted.

## 6. Go-live for at-need outreach (the deliberate flip)

Prepared-only era: with `OUTREACH_LIVE` unset, families complete the flow,
rows record `dry_run`, and every surface says so honestly. **Those rows are
terminal** — flipping the flag later does NOT retro-send them (A2-09).

The flip, in order:
1. Vetted directory spot-check: the pilot ZIPs return real vetted homes.
2. Set `OUTREACH_LIVE=true` in Vercel + redeploy (founder-only action).
3. New cases now send live (vetted-only directory + denylist re-check at
   send time, both unchanged).
4. **Re-running a prepared-only case** the family still wants sent:
   `POST /api/admin/negotiations/rerun` with `{"negotiationId": "<uuid>"}`
   (admin-gated). It resets that case's `dry_run` rows to `pending` and
   re-invokes the one gated send path — with the flag off it harmlessly
   re-records `dry_run`, so the endpoint can never leak mail. Re-run ONLY
   cases where the family confirmed they still want outreach — weeks-old
   prepared cases may be long resolved.

## 7. Billing (when the pilot converts)

Day-8 machinery, inert until `BILLING_LIVE=true` + Stripe envs set: founder
assigns `billing_tier` on /admin/partners (census band, BUSINESS_PLAN §10) →
partner checks out via the portal → webhook stamps `billing_status`.
Flat subscription only — never per-patient (the hospice-payer audit's
phrase-1 red line).

## Known edges (accepted, watch-listed)

- One email = one org (a coordinator serving two orgs needs two addresses).
- `contact_email` is seated verbatim at approval; no confirmation step.
- Demo orgs share prod tables; `DEMO_ORG_MARKER` (lib/demo-org.ts) is the
  only separator — never hand-create partners with that marker text.
- Token = bearer capability: anyone holding the URL is the org. Rotation is
  the only cure for a leaked link.
