> **⚠️ SUPERSEDED (2026-06-24).** Tied to the old family-paid $49 charge, which is being removed (families become free; institutions pay) — see [OPERATING_PLAN.md](OPERATING_PLAN.md) and [PAYMENT_DECOMMISSION.md](PAYMENT_DECOMMISSION.md). Kept for history until the charge is gone.

# Refund SOP

The promise we make everywhere: **flat $49, refundable within 14 days if we
don't save you anything.** This is the process for honoring it. For V1 (first
~10 deals) refunds are manual via the Stripe dashboard; automate once volume
justifies it.

> Draft with sensible defaults — the founder should confirm the criteria and
> the refund window before launch.

## When a refund is owed

Approve a refund if **any** of these is true within 14 days of payment:

1. **No savings.** The best quote we brought back wasn't below what the family
   would have paid on their own (the core promise).
2. **No usable result.** We couldn't reach contactable homes / got no quotes
   back, so the $49 bought nothing.
3. **The family simply asks within 14 days.** Default to honoring it — the
   goodwill and trust are worth far more than $49, and disputes cost more.

Edge cases (use judgment, lean toward refunding):
- Family paid, then a home they'd already chosen independently came back cheaper.
- Duplicate/accidental charge.
- A home dishonored the quote it sent us.

## How to process a refund

1. **Find the charge.** Stripe Dashboard → Payments → search the family's email
   or the negotiation's Checkout session id (stored on
   `negotiations.stripe_payment_intent_id`).
2. **Refund in Stripe.** Open the payment → Refund → full $49 → reason. Refunds
   to the original card take 5–10 business days.
3. **Mark it in the data.** Update the negotiation so we don't double-count it
   as revenue and so support has context:
   - set `negotiations.status = 'refunded'` (or add a note in
     `negotiation_outreach.notes` for V1 if you'd rather not add a status).
4. **Tell the family.** Short, warm, no friction:
   > "Done — your $49 is refunded (5–10 business days back to your card). Thank
   > you for giving us a try, and I'm sorry we didn't save you money this time.
   > If there's anything else I can do, just reply."
5. **Log it.** Keep a simple running list (date, email, amount, reason) for
   accounting + to watch the refund rate. If the refund rate climbs, that's a
   signal the savings promise or home-vetting needs work.

## Who decides

- **[FILL IN]** — for V1, the founder approves all refunds.
- Target SLA: respond to a refund request within **1 business day**; process
  within **2**.

## Post-launch automation (when volume warrants)

- An `/admin` refund button that calls Stripe's refund API + flips
  `status='refunded'` + emails the family in one click.
- Optional: auto-offer a refund if a closed negotiation's best quote wasn't
  below the family's target estimate.

## Related

- Money flow + statuses: `docs/area_paywall-pricing` / `lib/stripe.ts`.
- Data retention (what's kept after a refund): `docs/PRIVACY_RETENTION.md`.
- Stripe retains its own payment + refund records per its policy.
