# Launch-day smoke test (upfront pay → send)

The signed-off manual run before — and right after — you flip `OUTREACH_LIVE`
to `true`. The goal: prove a real family can pay and a real funeral home gets a
real, correct email, with no surprises. Do **Phase 0 + 1 in test mode first**,
then **Phase 2 once, for real**, with your own free-email account.

Headless half first: `npm run smoke:check` (see Phase 0). The browser steps
can't be automated (Stripe Checkout + magic-link auth), so they're a checklist.

> Money flow recap: `/negotiate/start` stores homes as `pending` and sends
> **nothing**. The ONLY send point is `sendOutreachForNegotiation()`, fired from
> the Stripe webhook **and** the status-page reconciliation, **after** payment.
> When `OUTREACH_LIVE !== "true"`, sends are recorded as `dry_run` (no email).

---

## Phase 0 — Preflight (headless)

```bash
npm run smoke:check                  # config + contactable-home counts
npm run smoke:check -- --zip=84101   # + the homes that zip would contact
```

- [ ] `OUTREACH_LIVE` reported as expected for this phase
- [ ] Contactable homes (active + vetted + email) > 0 for the launch area
- [ ] No `✗` blockers printed (exit code 0)

---

## Phase 1 — Full flow in TEST mode (no real emails, no real money)

Set `OUTREACH_LIVE=false` and use Stripe **test** keys. Sign in with a normal
account (NOT one on `HONEST_FUNERAL_FREE_EMAILS`, so you exercise real Checkout).

1. **Start** — go through `/negotiate/start`, pick a launch-area ZIP + service.
   - [ ] Lands on `/negotiate/[id]/preview`
   - [ ] Preview shows a count + blurred home names; **nothing sent yet**
   - [ ] `npm run smoke:check -- --neg=<id>` → status `pending_payment`, outreach rows all `pending`
2. **Pay** — click “Get my quotes — $49”, pay with Stripe test card `4242 4242 4242 4242`, any future expiry/CVC/ZIP.
   - [ ] Redirects to `/negotiate/[id]/status`
3. **Send fired (as dry_run)** —
   - [ ] `npm run smoke:check -- --neg=<id>` → status `contacting`, outreach rows flipped `pending` → `dry_run`
   - [ ] Stripe (test) dashboard shows the webhook `checkout.session.completed` delivered 2xx
   - [ ] Vercel logs show `stripe.webhook.outreach_sent` (or `negotiate.reconcile_sent`)
4. **Missed-webhook backstop** (optional) — disable the webhook, repeat 1–2; revisiting `/status` should still flip rows via reconciliation.
   - [ ] Rows flip to `dry_run` on status-page load even with the webhook off
5. **Pick a home** — choose one from the results.
   - [ ] Chosen home is notified; negotiation moves to closed/selected; page state correct
   - [ ] Picking did **not** trigger a second charge

---

## Phase 2 — One REAL send (do this once)

Only after Phase 1 passes, legal is cleared, and homes are vetted.

1. Swap Stripe **test → live** keys in Vercel; re-register the **live** webhook → update `STRIPE_WEBHOOK_SECRET`.
2. Set `OUTREACH_LIVE=true`. The env validator now **hard-requires** these when live (boot fails without them): `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `UNSUBSCRIBE_SECRET`, `ADMIN_EMAILS`, `CRON_SECRET`. Also set `RESEND_FROM` (verified domain) and `ALERT_WEBHOOK_URL`. Re-run `npm run smoke:check`.
   - [ ] smoke:check shows `OUTREACH_LIVE = true`, live Stripe key, 0 blockers
   - [ ] `RESEND_WEBHOOK_SECRET` is set — the bounce/complaint webhook 500s without it, so bad addresses keep getting emailed (deliverability risk)
3. Run **one** negotiation signed in with an account on `HONEST_FUNERAL_FREE_EMAILS` (skips the charge, still sends), pointed at a home **you control** (add a test home in `/admin/vetting` with your own inbox, vetted + active).
   - [ ] A real email arrives at that inbox, from your verified domain
   - [ ] Subject + body are correct; reply-to is the negotiation address
   - [ ] `--neg=<id>` shows the row as `sent` with an `initial_email_id`
4. **Reply pipeline** — reply to that email from the home inbox.
   - [ ] Reply shows on the family `/status` page (and/or `/admin/messages`)
5. **Bounce path** (optional) — send to a known-bad address; confirm `email.bounced` → the home flips `active=false` and an alert fires (if `ALERT_WEBHOOK_URL` set).

---

## Go / no-go

- [ ] Phases 0–2 all green
- [ ] Refund path ready (Stripe dashboard) in case a real family needs it
- [ ] You're watching Vercel logs + the alert channel for the first real families

If anything is off, set `OUTREACH_LIVE=false` immediately — in-flight and future
payments record as `dry_run` and no further emails go out.
