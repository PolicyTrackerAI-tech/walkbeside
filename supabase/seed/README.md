# Funerose demo account

For investor pitches, sister walkthroughs, and press demos.

This seeds a fictional **Johnson family** case into a real Supabase
project so reviewers can sign in and see what the product looks like
with real data. No real family information is used.

## What gets seeded

- **Auth user**: `demo@funerose.com` (password set by you via env)
- **Family**: Sarah Johnson (surviving spouse) → profile `display_name`
- **Deceased**: Robert Johnson (fictional)
- **Scenario**: hospital, with launch-metro ZIP
- **Service type**: traditional burial with viewing
- **Negotiation**: 3 homes contacted
  - Johnson Memorial — replied, $7,500 (above fair range)
  - Oakview Funeral Services — replied, $5,800 (best quote)
  - Memorial Gardens — pending
- **Obituary**: partial draft with `[TO VERIFY]` tokens visible
- **Dashboard tasks**: 3 completed, 2 open
- **No payments** — the demo intentionally stops before the Stripe
  charge so reviewers see the pre-payment state

## Running it

Two paths. Pick the one that fits your workflow.

### Option A — Node script (recommended; handles auth user for you)

```bash
DEMO_PASSWORD='set-a-strong-one'   \
DEMO_ZIP=94110                     \
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co  \
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>  \
node scripts/seed-demo.mjs
```

The script is idempotent — run it again to reset to fresh state.
Takes < 10 seconds against a local Supabase project.

### Option B — SQL only (if you prefer the Supabase SQL editor)

1. In Supabase **Authentication → Users**, create the user manually
   (email `demo@funerose.com`, password of your choice, mark email
   confirmed).
2. Copy the resulting UUID.
3. Open `supabase/seed/demo-account.sql`, edit the two `\set` lines
   at the top with your UUID and launch-metro ZIP.
4. Run the file via psql, or paste into the Supabase SQL editor.

## Sharing the demo with reviewers

Once seeded, tell the reviewer:

> Sign in at `https://<your-domain>/login` with
> `demo@funerose.com` / `<the password you set>`.

## Resetting the demo

Re-run either Option A or Option B. Both delete all prior demo-user
rows before re-inserting, so the state is clean each time.

## What to remind reviewers of

- The family is fictional; any resemblance to a real Johnson family
  is coincidental.
- The three funeral-home names (Johnson Memorial, Oakview, Memorial
  Gardens) are placeholders for the demo only.
- No real emails are sent — the `*.example` domains on the outreach
  rows are reserved-for-documentation and will bounce if contacted.

## Do not commit

- `.env.local` with `DEMO_PASSWORD` filled in
- Any credential screenshots

The password is never checked in and never appears in this repo.
