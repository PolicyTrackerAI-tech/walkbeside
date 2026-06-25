# Plan: remove the consumer payment, keep families free, send zero live emails

> **Fee amount:** the live family charge is `FLAT_FEE_CENTS` in `lib/stripe.ts` = **$199** (an earlier **$49** in some docs/comments is stale). "The consumer fee" below means that constant — it is being removed entirely, so the figure doesn't change the plan.

**Why.** Guardrail #2 of the [Operating Plan](OPERATING_PLAN.md): never charge
the grieving family as the growth engine. Today families pay a flat **$49
upfront pay-to-send** fee before we contact funeral homes. That must go — the
family service becomes free; institutions (hospices) pay later (L3).

**The non-negotiable constraint while we do it:** **no live email ever reaches a
funeral home** unless the founder explicitly turns it on. This plan is designed
so that at no intermediate step can emails start flowing.

---

## How payment and sending are wired today (on `main`)

The send is currently **triggered by payment**, but **gated by a kill switch**:

- `/negotiate/start` builds the outreach rows as `pending` and **sends nothing**
  (negotiation status `pending_payment`).
- `/negotiate/[id]/preview` shows a teaser (blurred home names) + a "$49" button
  that form-POSTs to **`app/api/stripe/checkout/route.ts`**.
- `checkout` calls **`sendOutreachForNegotiation()`** on three paths: free/founder
  account (`isPaidUser`), Stripe-unconfigured dev, and — for a real card — after
  the **Stripe webhook** (`app/api/stripe/webhook/route.ts`) confirms payment. A
  reconciliation in `GET /app/api/negotiate/[id]/route.ts` can also call it.
- **`lib/negotiation/send.ts` `sendOutreachForNegotiation()` is the ONLY place an
  outreach email is sent**, and it self-gates:
  `const live = process.env.OUTREACH_LIVE === "true"` — when not `"true"` it
  records `dry_run` rows and **sends no email**. It also re-checks the denylist
  and only touches `pending` rows (idempotent).
- `lib/negotiation/directory.ts` only ever returns homes that are
  `active = true AND vetted = true`.

**Key insight:** removing payment removes the *trigger*, not the *gate*. As long
as (a) `sendOutreachForNegotiation` stays the only send path and (b)
`OUTREACH_LIVE` stays off, **no live email can fire regardless of payment.**

---

## The safety invariant (must hold at every step)

> The only function that emails a funeral home is `sendOutreachForNegotiation`,
> and it emails **only** when `OUTREACH_LIVE === "true"`. `OUTREACH_LIVE` stays
> **unset/false** in every environment. Therefore: zero live emails.

Two backstops reinforce it: the `vetted = true` directory gate, and the
`lib/env.ts` strict validator that refuses to run live without required vars.

---

## Staged plan

### Stage 0 — Freeze (do first, no code)
- Confirm `OUTREACH_LIVE` and `OUTREACH_NOTIFICATIONS_ENABLED` are unset/false in
  Vercel (all envs). Confirm the `send.test.ts` case "OUTREACH_LIVE off →
  dry_run, sends NO email" is green. This is the guarantee; verify it before
  touching anything.

### Stage 1 — Decouple the send trigger from payment
- Move the trigger: have `/negotiate/start` (after building `pending` rows) call
  `sendOutreachForNegotiation()` directly, instead of waiting for payment. Drop
  the `pending_payment` status; go straight to `contacting`/`dry_run`.
- **Still zero live emails** because `OUTREACH_LIVE` is off → it records
  `dry_run`. This is the **single most dangerous step**: if someone flipped
  `OUTREACH_LIVE` on at the same time, every `/negotiate/start` would email.
  **Neutralize:** keep `OUTREACH_LIVE` off; ship behind the existing self-gate;
  verify in prod that submissions produce `dry_run` rows (no sends) before any
  live discussion.
- Add a test: "`/negotiate/start` with `OUTREACH_LIVE` off creates `dry_run`
  rows and sends zero emails."

### Stage 2 — Remove the consumer charge
- Delete/short-circuit `app/api/stripe/checkout/route.ts` (the $49). Remove the
  paywall teaser + blurred-name gating on `/negotiate/[id]/preview` (or redirect
  it straight to `/status`/results). Stop the Stripe **webhook** from triggering
  sends (the trigger now lives in Stage 1); the webhook can become a no-op or be
  removed.
- Remove fee plumbing from the family path: `calcFeeCents` usage, `fee_cents`
  writes on the family flow, `/negotiate/[id]/preview` "$49" copy.
- Keep `lib/stripe.ts` and `lib/auth-paid.ts` as scaffolding (repurposed for
  institutional billing later) — but they no longer charge families.

### Stage 3 — Scrub family-pay copy + docs
- Sitewide copy: remove every "$49"/"$199"/"refundable"/"pay to send" family
  reference (homepage, `/how-it-works`, `/faq`, `/our-role`, dashboard, emails).
  Replace with "free to families; funded by the institutions we partner with."
- Docs: banner `PAYWALL_RECOMMENDATION.md` and `REFUND_SOP.md` as superseded;
  rewrite `LAUNCH_CHECKLIST.md` pricing items and `SMOKE_TEST.md` Phase 2;
  reframe `AI_STRATEGY.md` unit economics from family-$49 to institutional
  contract.

### Stage 4 — Institutional billing (later, when L3 exists)
- Stripe returns — billing **institutions** (per-facility annual SaaS), never
  families. New checkout lives in the partner portal, not the family flow.

---

## Verification checklist (run at each stage)

- [ ] `OUTREACH_LIVE` unset/false in all envs; `send.test.ts` dry-run case green.
- [ ] `grep` proves the only `sendEmail(...)` to a funeral-home address is inside
      `sendOutreachForNegotiation`. No other code path emails a home.
- [ ] New test: `/negotiate/start` with the switch off → `dry_run` rows, 0 sends.
- [ ] In prod (switch off): submitting a case creates `dry_run` outreach rows and
      sends nothing (check logs: `outreach.run` with `live:false`).
- [ ] No family-facing checkout or "$49" remains; choosing a home is free.
- [ ] `typecheck` + `lint` + `build` + vitest all green.

## Sequencing note
Stage 1 can ship independently and safely (emails stay off). Stages 2–3 are the
visible "payment is gone" change. Recommend keeping the Stripe scaffolding
(don't delete the processor) so it's ready to repurpose for institutional
billing in Stage 4. Do **not** flip `OUTREACH_LIVE` on as part of any of this —
going live with real outreach is a separate, explicit founder decision.
