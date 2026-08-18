# Production setup — infrastructure gates 1–4

Turn the "stand up production" gates into copy-paste. Do these top to bottom.
This covers infrastructure only (Supabase, domain, env vars, deliverability).
For the current business-readiness gates (legal, vetted homes, pilot
agreement) see **GO_TO_MARKET.md Phase 0** — `LAUNCH_CHECKLIST.md` is retired.

> Keep **`OUTREACH_LIVE` unset / `false`** through ALL of this. It only flips
> to `true` once GO_TO_MARKET.md's Phase 0 gates are cleared — legal
> clearance + vetted homes, not a payment step (there is no family payment).

---

## Gate 1 — Production Supabase

1. **Create the project** at supabase.com → New project. Region: **West US**
   (closest to Utah). Save the DB password.
2. **Run the schema.** SQL Editor → paste **all of `supabase/BOOTSTRAP.sql`** →
   Run. (That's `schema.sql` + every migration, in order, idempotent. Re-gen
   with `npm run build:bootstrap` if migrations change.)
3. **Confirm RLS.** Table Editor → each table shows "RLS enabled." (The bootstrap
   enables it on all of them; spot-check `profiles`, `negotiations`,
   `funeral_homes`.)
4. **Storage bucket.** Storage → New bucket → name **`price-lists`**, **Private**.
5. **Magic-link auth.** Authentication → Providers → Email → enable, with
   **Magic Link** on. Then Authentication → **Email Templates**: in BOTH the
   **Magic Link** and **Confirm signup** templates, make sure the one-time
   code `{{ .Token }}` appears in the body alongside the link — the portal
   login (`/portal/login`) asks users to TYPE that code, and a first-ever
   sign-in sends the *Confirm signup* template, not Magic Link. Suggested
   body for both:

   ```html
   <h2>Sign in to Honest Funeral</h2>
   <p>Your one-time code: <strong style="font-size:24px">{{ .Token }}</strong></p>
   <p>Type it on the sign-in page — or <a href="{{ .ConfirmationURL }}">click here to sign in directly</a>.
   Only the newest email works.</p>
   ```
6. **Auth URL config.** Authentication → URL Configuration → **Site URL** =
   `https://honestfuneral.co`; under **Redirect URLs** add the wildcard
   `https://honestfuneral.co/**` (an exact `/auth/callback` entry is NOT
   enough — sign-in links carry a `?next=` query and Supabase silently falls
   back to the bare Site URL when the redirect doesn't match, which strands
   users on the homepage).
7. **Grab the keys** (Project Settings → API): Project URL, `anon` key,
   `service_role` key (secret — Vercel only, never commit).

> **Already have a production project running and just need to catch it up on
> new migrations?** Don't try to track which of the 20+ files in
> `supabase/migrations/` have already been run — every migration in this repo
> is written idempotent (`if not exists` / `drop ... if exists` / `create or
> replace` / `on conflict`, verified across all of them). Just regenerate and
> re-paste the **current** `supabase/BOOTSTRAP.sql` (`npm run build:bootstrap`
> if it's stale) into the SQL editor and run it again — already-applied
> statements no-op, new ones apply. Simpler and safer than a manual ledger.

## Gate 2 — Domain + DNS

1. Vercel → Project → **Domains** → add `honestfuneral.co` (+ `www` redirect).
2. At your registrar, add the DNS records Vercel shows (A/ALIAS + CNAME). SSL
   auto-provisions in a few minutes.
3. Leave the email DNS records for Gate 4 (they're added at the same registrar).

## Gate 3 — Vercel environment variables

Project → Settings → Environment Variables (Production scope). The app
**fail-fasts at boot** if a required-when-live var is missing once
`OUTREACH_LIVE=true` (see `lib/env.ts`), so set them now.

### Always required
| Var | Value / source |
|-----|----------------|
| `NEXT_PUBLIC_APP_URL` | `https://honestfuneral.co` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role (secret) |

### Required before going live (`OUTREACH_LIVE=true`)
| Var | Value / source |
|-----|----------------|
| `RESEND_API_KEY` | Resend → API Keys |
| `RESEND_WEBHOOK_SECRET` | Resend → Webhooks signing secret (`whsec_…`) — Gate 4 |
| `UNSUBSCRIBE_SECRET` | generate: `openssl rand -hex 32` |
| `CRON_SECRET` | generate: `openssl rand -hex 32` |
| `ADMIN_EMAILS` | your email(s), comma-separated — gates `/admin/*` |

Confirmed against `lib/env.ts`'s boot-time validator — the `STRIPE_*` vars are
deliberately **not** on this list. There is no family-facing checkout (and
never will be again); Stripe exists only for *institutional* billing
(hospice/employer subscriptions — see the billing section below), which is
optional/billing-scoped, never a go-live gate for outreach.

### Strongly recommended
| Var | Value / source |
|-----|----------------|
| `RESEND_FROM` | `Honest Funeral <hello@honestfuneral.co>` (family-facing) |
| `OUTREACH_FROM` | `Honest Funeral <arrangements@honestfuneral.co>` (to funeral homes) |
| `HONEST_FUNERAL_FREE_EMAILS` | your email — flags founder/test accounts (`lib/auth-paid.ts`); no fee to waive anymore, just a QA/test-account marker |
| `ALERT_WEBHOOK_URL` | Slack/Discord incoming webhook — push alerts for failed sends/bounces |
| `ANTHROPIC_API_KEY` | console.anthropic.com — AI features (else deterministic fallbacks) |
| `NEXT_PUBLIC_HELP_PHONE` | your support number, E.164 (e.g. `+13855531141`) |

### The kill-switches (leave OFF until ready)
| Var | Set to |
|-----|--------|
| `OUTREACH_LIVE` | `false` (flip to `true` only once GO_TO_MARKET.md Phase 0 is cleared) |
| `NURTURE_ENABLED` | unset/`false` until the nurture sequence is ready |
| `ANNIVERSARY_EMAILS_ENABLED` | unset/`false` — bereavement check-in email cadence |
| `OUTREACH_NOTIFICATIONS_ENABLED` | unset/`false` |
| `PARTNER_DIGEST_ENABLED` | unset/`false` — monthly aggregate partner-activity email cron |
| `BEREAVEMENT_SMS_ENABLED` | unset/`false` — SMS variant of the bereavement cadence; also requires the three `TWILIO_*` vars below to actually send |
| `BILLING_LIVE` | unset/`false` — institutional Stripe checkout/portal (billing section below). Off → the portal Billing card shows "invoiced by arrangement" and the checkout/portal-link routes 409. The webhook is NOT behind this flag (a flag flip must never desync billing state from Stripe). |

### Optional (institutional billing — hospices/employers only, never families)

| Var | Value / source |
|-----|----------------|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (test `sk_test_…` until the founder go-live decision) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint `https://…/api/stripe/webhook` signing secret (`whsec_…`); in dev, from `stripe listen` |
| `STRIPE_PRICE_SMALL` | `price_…` id — monthly recurring price the founder creates in the Stripe dashboard (tier <50 ADC) |
| `STRIPE_PRICE_MID` | `price_…` id — monthly recurring price (tier 50–100 ADC) |
| `STRIPE_PRICE_LARGE` | `price_…` id — monthly recurring price (tier 100+ ADC) |

Billing posture (BUSINESS_PLAN §10 is the source of truth):

- **Who can pay:** `partner_type in ('hospice','employer')` only, enforced in
  code (`lib/billing.ts` allowlist + pins in
  `lib/__tests__/billing-guardrails.test.ts`). There is structurally no way to
  invoice an insurer, a funeral home, or a family.
- **Amounts live only in Stripe.** The founder creates one product
  ("Bereavement support program — pilot subscription") with three monthly
  recurring prices at the current tier sheet (small/mid/large, e.g.
  $400/$800/$1,500 per month at the v3 price list); code carries env price ids
  only and never hardcodes an amount. The founder assigns each partner's tier
  in `/admin/partners`; checkout refuses to run until a tier is assigned.
- **Annual prepay (−10%)** is not a Checkout object: send it as a Stripe
  invoice (net-30, PO number on the invoice) from the dashboard, then mark the
  tier/status by hand if needed. Monthly Checkout is the default ask.
- **Invoice language:** every subscription invoice carries the description
  "bereavement support program — [tier]" (set by the checkout route;
  procurement-safe AKS framing). Keep dashboard-created invoices to the same
  wording.
- **Dunning:** Stripe smart retries + emails. `billing_status` moves to
  `past_due`, which is visible in `/admin/partners` — and changes nothing
  else. **Service is never cut off mid-family-case**; nothing in the product
  gates on billing state, by design. A lapsed hospice is a founder
  conversation, not an outage.
- **Revenue recognition:** monthly ratable (a bookkeeping note, not code —
  annual-prepay invoices recognize 1/12 per month).

### Optional (reply pipeline — can wait past v1)
`POSTMARK_INBOUND_USER`, `POSTMARK_INBOUND_SECRET` (funeral-home reply relay),
`OUTREACH_POSTAL_ADDRESS` (overrides the CAN-SPAM footer address).

### Optional (opt-in SMS channel — `lib/sms.ts`, Twilio REST, dry-run without these)
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` — all three required
together before `BEREAVEMENT_SMS_ENABLED=true` can send a real text.

After setting vars, **redeploy** so they take effect.

## Gate 4 — Email deliverability

1. **Verify the domain in Resend.** Resend → Domains → add `honestfuneral.co` →
   it generates **SPF, DKIM, DMARC** records. Add them at your registrar.
   Wait for "Verified" (5–60 min). Without this, outreach lands in spam.
2. **Resend bounce webhook.** Resend → Webhooks → endpoint
   `https://honestfuneral.co/api/inbound/resend-webhook`, events
   **`email.bounced` + `email.complained`** → copy the secret into
   `RESEND_WEBHOOK_SECRET`. (Auto-deactivates bad addresses to protect sender rep.)
3. **(Optional) Postmark inbound** for funeral-home replies: add MX on
   `reply.honestfuneral.co` → Postmark; set `POSTMARK_INBOUND_*`. Can wait past v1.

## After gates 1–4

- Deploy `main` to Vercel.
- Run `npm run smoke:check` against prod creds (config + that homes exist for
  the launch market).
- Then follow `docs/SMOKE_TEST.md` and clear the remaining gates in
  **GO_TO_MARKET.md Phase 0** (legal clearance, vetted homes, pilot agreement)
  before flipping `OUTREACH_LIVE=true` — it's a business-readiness switch, not
  a payment one.
