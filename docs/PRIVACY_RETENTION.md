# Data retention & deletion

What Honest Funeral stores, how long, and how it's deleted. Pairs with the
public /privacy page; this is the operational source of truth.

## What we store

| Data | Where | Tied to |
|------|-------|---------|
| Account (email) | Supabase `auth.users` | the user |
| Profile (display name, zip, scenario, deceased name) | `profiles` | user (FK cascade) |
| Tasks / checklist progress | `tasks` | user (FK cascade) |
| Negotiations + outreach + messages | `negotiations`, `negotiation_outreach`, `negotiation_messages` | user (FK cascade) |
| Price-list analyses, cert trackers, obituary drafts | `price_list_analyses`, `cert_trackers`, `obituaries` | user (FK cascade) |
| Marketing signups (cheat-sheet/plan-ahead) | `planning_signups` | email (NOT cascaded) |
| Funeral-home directory | `funeral_homes` | not personal data (business listings) |

We never sell data and never share a family's email with funeral homes (outreach
goes from our address; replies relay through us).

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

**Caveat:** outreach already emailed to funeral homes can't be recalled from
their inboxes; only our stored records are erased. Stripe payment records are
retained by Stripe per their policy + our legal/accounting obligations.

## Backups

Supabase managed backups retain data for the project's plan window (confirm +
extend to ≥30 days before launch — see LAUNCH_CHECKLIST). A deleted account may
persist in backups until they roll off; document this in the privacy policy if
required by the launch states.
