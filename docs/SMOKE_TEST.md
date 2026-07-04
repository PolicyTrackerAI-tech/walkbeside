# Pre-launch smoke test (free-to-families outreach)

The signed-off manual run before — and right after — you flip `OUTREACH_LIVE`
to `true`. The goal: prove a real family can start outreach and a real
funeral home gets a real, correct email, with no surprises. Do **Phase 1 in
test mode first**, then **Phase 2 once, for real**, with your own free-email
account.

Headless half first: `npm run smoke:check` (see Phase 0). The browser steps
can't be automated (magic-link auth), so they're a checklist.

> Flow recap: `/negotiate/start` builds the outreach rows as `pending` and
> calls `sendOutreachForNegotiation()` **directly, synchronously, in the same
> request** — there is no payment step of any kind; Honest Funeral is free to
> families. `OUTREACH_LIVE` is the only gate: when it's not `"true"`, rows are
> recorded as `dry_run` (no email sent) and the negotiation still moves from
> `pending_payment` → `contacting` (a leftover status name from the old
> payment-era schema — it just means "intake done, sending in progress," not
> "awaiting a charge").

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

## Phase 1 — Full flow in TEST mode (`OUTREACH_LIVE=false`, no real emails)

Sign in with any account (a free-email account isn't needed — nothing is
ever charged).

1. **Start** — go through `/negotiate/start`, pick a launch-area ZIP + service,
   consent as point person.
   - [ ] Redirects straight to `/negotiate/[id]/status` — no payment screen
     anywhere, and outreach has already fired server-side by the time you land
   - [ ] `npm run smoke:check -- --neg=<id>` → negotiation status `contacting`,
     outreach rows `dry_run` (not `sent`)
2. **Idempotency check** — reload the status page a few times.
   - [ ] Rows stay `dry_run`; `sendOutreachForNegotiation` only ever sends rows
     still in `pending`, so nothing re-sends or double-counts on reload
3. **Pick a home** — once a quote is recorded, choose one from
   `/negotiate/[id]/results`.
   - [ ] Chosen home is notified; negotiation status flips to `closed`
   - [ ] Picking never asks for payment or shows a charge of any kind

---

## Phase 2 — One REAL send (do this once)

Only after Phase 1 passes, legal is cleared (GO_TO_MARKET.md Phase 0), and
homes are vetted.

1. Set `OUTREACH_LIVE=true`. The env validator now **hard-requires** these
   when live (boot fails without them): `RESEND_API_KEY`,
   `RESEND_WEBHOOK_SECRET`, `UNSUBSCRIBE_SECRET`, `ADMIN_EMAILS`,
   `CRON_SECRET` (see `lib/env.ts` — Stripe is deliberately **not** on this
   list; there's no family payment to gate). Also set `RESEND_FROM` (verified
   domain) and `ALERT_WEBHOOK_URL`. Re-run `npm run smoke:check`.
   - [ ] smoke:check shows `OUTREACH_LIVE = true`, 0 blockers
   - [ ] `RESEND_WEBHOOK_SECRET` is set — the bounce/complaint webhook 500s
     without it, so bad addresses keep getting emailed (deliverability risk)
2. Run **one** negotiation pointed at a home **you control** (add a test home
   in `/admin/vetting` with your own inbox, vetted + active).
   - [ ] A real email arrives at that inbox, from your verified domain
   - [ ] Subject + body are correct; reply-to is the negotiation address
   - [ ] `--neg=<id>` shows the row as `sent` with an `initial_email_id`
3. **Reply pipeline** — reply to that email from the home inbox.
   - [ ] Reply shows on the family's negotiation status page (and/or
     `/admin/messages`)
4. **Bounce path** (optional) — send to a known-bad address; confirm
   `email.bounced` → the home flips `active=false` and an alert fires (if
   `ALERT_WEBHOOK_URL` set).

---

## Go / no-go

- [ ] Phases 0–2 all green
- [ ] You're watching Vercel logs + the alert channel for the first real families

If anything is off, set `OUTREACH_LIVE=false` immediately — no further real
emails go out; new outreach records as `dry_run`.
