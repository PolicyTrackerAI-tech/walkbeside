-- Add account-level paywall fields to profiles.
--
-- Margaret refactor section 12: payment moves from per-negotiation success
-- fee to one-time $49 upfront unlock for the full toolkit.
--
-- paid_at is the source of truth. NULL = unpaid. Set by the Stripe webhook
-- when the user completes the account-paywall checkout. Once set, the user
-- has access to every paid surface (dashboard, negotiate, next-30-days,
-- worksheet, obituary, certificates, analyzer, veterans).
--
-- stripe_customer_id is set the first time we create a Checkout session
-- for this profile. Used for refund handling later.

alter table public.profiles
  add column if not exists paid_at timestamptz,
  add column if not exists stripe_customer_id text;

comment on column public.profiles.paid_at is
  'Margaret-section-12: timestamp of the user''s one-time $49 paywall purchase. NULL = unpaid. Source of truth for isPaidUser().';
comment on column public.profiles.stripe_customer_id is
  'Margaret-section-12: Stripe customer id, set on first Checkout session create. Used for refund flow.';

create index if not exists profiles_paid_at_idx on public.profiles (paid_at);
