# Production setup — critical-path gates 1–4

Turn the "stand up production" gates into copy-paste. Do these top to bottom.
Gate 5 (real Utah homes) is separate — see `seed/IMPORT_HOMES.md`. Gate 6
(lawyer) and gate 8 (smoke test, `SMOKE_TEST.md`) come after.

> Keep **`OUTREACH_LIVE` unset / `false`** through ALL of this. It only flips
> to `true` at the very end of the launch-day switch.

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
   **Magic Link** on. Edit the template subject to "Sign in to Honest Funeral."
6. **Auth URL config.** Authentication → URL Configuration → **Site URL** =
   `https://honestfuneral.co`; add the same to **Redirect URLs**.
7. **Grab the keys** (Project Settings → API): Project URL, `anon` key,
   `service_role` key (secret — Vercel only, never commit).

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
| `STRIPE_SECRET_KEY` | Stripe → API keys. **Test key now; swap to `sk_live_…` at launch.** |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → your endpoint signing secret (`whsec_…`) |
| `RESEND_API_KEY` | Resend → API Keys |
| `RESEND_WEBHOOK_SECRET` | Resend → Webhooks signing secret (`whsec_…`) — Gate 4 |
| `UNSUBSCRIBE_SECRET` | generate: `openssl rand -hex 32` |
| `CRON_SECRET` | generate: `openssl rand -hex 32` |
| `ADMIN_EMAILS` | your email(s), comma-separated — gates `/admin/*` |

### Strongly recommended
| Var | Value / source |
|-----|----------------|
| `RESEND_FROM` | `Honest Funeral <hello@honestfuneral.co>` (family-facing) |
| `OUTREACH_FROM` | `Honest Funeral <arrangements@honestfuneral.co>` (to funeral homes) |
| `HONEST_FUNERAL_FREE_EMAILS` | your email — runs the paid flow without charging you (QA) |
| `ALERT_WEBHOOK_URL` | Slack/Discord incoming webhook — push alerts for failed sends/bounces |
| `ANTHROPIC_API_KEY` | console.anthropic.com — AI features (else deterministic fallbacks) |
| `NEXT_PUBLIC_HELP_PHONE` | your support number, E.164 (e.g. `+13855531141`) |

### The kill-switches (leave OFF until ready)
| Var | Set to |
|-----|--------|
| `OUTREACH_LIVE` | `false` (flip to `true` LAST, launch-day) |
| `NURTURE_ENABLED` | unset/`false` until the nurture sequence is ready |
| `ANNIVERSARY_EMAILS_ENABLED` | unset/`false` |
| `OUTREACH_NOTIFICATIONS_ENABLED` | unset/`false` |

### Optional (reply pipeline — can wait past v1)
`POSTMARK_INBOUND_USER`, `POSTMARK_INBOUND_SECRET` (funeral-home reply relay),
`OUTREACH_POSTAL_ADDRESS` (overrides the CAN-SPAM footer address).

After setting vars, **redeploy** so they take effect.

## Gate 4 — Email deliverability

1. **Verify the domain in Resend.** Resend → Domains → add `honestfuneral.co` →
   it generates **SPF, DKIM, DMARC** records. Add them at your registrar.
   Wait for "Verified" (5–60 min). Without this, outreach lands in spam.
2. **Stripe webhook.** Stripe → Developers → Webhooks → Add endpoint:
   `https://honestfuneral.co/api/stripe/webhook`, event **`checkout.session.completed`**
   → copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. **Resend bounce webhook.** Resend → Webhooks → endpoint
   `https://honestfuneral.co/api/inbound/resend-webhook`, events
   **`email.bounced` + `email.complained`** → copy the secret into
   `RESEND_WEBHOOK_SECRET`. (Auto-deactivates bad addresses to protect sender rep.)
4. **(Optional) Postmark inbound** for funeral-home replies: add MX on
   `reply.honestfuneral.co` → Postmark; set `POSTMARK_INBOUND_*`. Can wait past v1.

## After gates 1–4

- Deploy `main` to Vercel.
- Run `npm run smoke:check` against prod creds (config + that homes exist once
  Gate 5 is done).
- Then follow `docs/SMOKE_TEST.md` (test-mode dry-run → one real send) and the
  **launch-day switch** in `LAUNCH_CHECKLIST.md` — `OUTREACH_LIVE=true` is the
  last step, only after legal clearance + vetted homes.
