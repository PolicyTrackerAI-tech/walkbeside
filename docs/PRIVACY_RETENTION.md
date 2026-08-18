# Data retention & deletion

What Honest Funeral stores, how long, and how it's deleted. Pairs with the
public /privacy page; this is the operational source of truth.

> **Updated 2026-08-18 (audit A8)** to add the post-pivot data classes the
> earlier version omitted (partner attribution, SMS, anonymous share/household
> links, email-signup IP hash, AI cost events) and to correct the Stripe line
> (Stripe now bills institutions, not families).

## What we store

| Data | Where | Tied to |
|------|-------|---------|
| Account (email, or Google-provided email+name) | Supabase `auth.users` | the user |
| Profile (display name, zip, scenario, deceased name, `date_of_death`, SMS phone + opt-in) | `profiles` | user (FK cascade) |
| Tasks / checklist progress | `tasks` | user (FK cascade) |
| Negotiations + outreach + messages (incl. inbound FD reply bodies + `raw_payload`) | `negotiations`, `negotiation_outreach`, `negotiation_messages` | user (FK cascade) |
| Price-list analyses, cert trackers, obituary drafts | `price_list_analyses`, `cert_trackers`, `obituaries` | user (FK cascade) |
| **Partner referral attribution** (`partner_id`, `partner_code`) | `negotiations`, `price_list_analyses` | reporting label only; never affects ranking |
| Marketing signups (cheat-sheet/plan-ahead), incl. `ip_hash` (one-way) + user agent | `planning_signups` | email (NOT cascaded) |
| **Anonymous share links** ("save for my daughter", 7-day expiry) | `share_links` | NOT tied to an account; service-role only since A8 |
| **Anonymous family-view links** (owner-secret gated) | `household_links` | NOT tied to an account |
| **AI cost events** (feature tag, model, token counts — no content, no user id) | `api_cost_events` | not personal data |
| Partner org data (application, leads) | `partners`, `partner_leads` | the partner org, not a family |
| Funeral-home directory | `funeral_homes` | not personal data (business listings) |

We never sell data and never share a family's email with funeral homes (outreach
goes from our address; replies relay through us). A hospice/employer partner only
ever sees aggregate, de-identified totals (n≥5 suppression on dollar/satisfaction
figures) — never a family's identity, prices, or chosen home.

**Photos are never stored.** A photographed price list is downscaled on the
device, sent to the AI provider to extract text, and discarded; only the
contact-redacted extracted text (≤5000 chars) is saved, and only for signed-in
users. There is no file-upload storage bucket in use.

## Retention

- **Account data**: retained until the user deletes their account (self-serve,
  below) — there's no automatic expiry while an account is active.
- **Marketing signups**: retained until unsubscribe; an unsubscribe is recorded
  (not hard-deleted) so we can honor suppression.
- **Recommended pre-launch policy** (enforce once there's volume): auto-purge
  negotiations + messages 12 months after a negotiation closes/cancels. Not yet
  automated — add a cron when warranted.

## Deletion (right to erasure)

Self-serve: **/account → "Delete my account."** It POSTs to
`/api/account/delete`, which (origin-checked) uses the service-role key to:

1. delete `planning_signups` rows for the user's email (email-keyed, not cascaded), then
2. `auth.admin.deleteUser(userId)` — which **cascades** to every user-owned
   table via `ON DELETE CASCADE` (profiles, tasks, negotiations →
   outreach/messages, analyses, cert trackers, obituaries),
3. sign the user out and return home.

Manual / by-request: run the same `deleteUser(userId)` from the Supabase
dashboard, or email the user's request to support. Deletion is immediate and
irreversible.

**Caveats (what an account deletion does NOT remove):**

- Outreach already emailed to funeral homes can't be recalled from their
  inboxes; only our stored records are erased.
- Anonymous `share_links` / `household_links` a user created are not tied to
  `auth.users`, so `deleteUser` does not cascade to them. They age out on their
  own (share: 7 days; household: 30-day rolling), but there is **no purge cron**
  — the expired row persists until manually cleared. QUEUE: add a purge job (a
  family who deletes their account reasonably expects these gone too).
- Aggregated, de-identified benchmarks derived from contributed prices are
  retained (they no longer identify the user).
- **Stripe holds no family payment records** — families never pay us. Stripe is
  used only to bill institutions; retention there follows Stripe's policy + our
  accounting obligations.
- Provider-side copies (Resend, Postmark, Twilio) and routine encrypted backups
  age out per each provider's window.

## Backups

Supabase managed backups retain data for the project's plan window (confirm +
extend to ≥30 days before launch — see LAUNCH_CHECKLIST). A deleted account may
persist in backups until they roll off; document this in the privacy policy if
required by the launch states.
