-- Migration B (execution-plan workstream D): institutional billing columns on
-- partners.
--
-- INSTITUTIONAL BILLING ONLY. Families are never charged (Operating Plan
-- guardrail #2 — the consumer payment is decommissioned); insurers and funeral
-- homes are never payers (guardrail #1 — billing eligibility is enforced in
-- code as partner_type in ('hospice','employer')). No family-facing table ever
-- references these columns, and nothing anywhere gates family service on them:
-- dunning is Stripe's, and a past_due partner keeps full service (families are
-- not leverage — ever).
--
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor. Idempotent. If the
-- apply day is not 2026-08-18, rename the file for the real apply day (any
-- date after 2026-07-20 keeps BOOTSTRAP ordering correct) and keep the
-- VERIFY.sql comment in sync.

alter table public.partners
  add column if not exists stripe_customer_id text,
  add column if not exists billing_status text not null default 'none'
    check (billing_status in ('none','active','past_due','canceled')),
  add column if not exists billing_plan text,
  add column if not exists billing_started_at timestamptz,
  add column if not exists billing_tier text
    check (billing_tier in ('small','mid','large'));

comment on column public.partners.stripe_customer_id is
  'Stripe customer id, test-mode until BILLING_LIVE ships to prod. Created lazily by /api/stripe/checkout; backfilled by the webhook.';
comment on column public.partners.billing_status is
  'Subscription lifecycle as mirrored by /api/stripe/webhook: none (never subscribed), active, past_due (dunning — service is NEVER cut off on this), canceled.';
comment on column public.partners.billing_plan is
  'Stripe price id of the active subscription (env STRIPE_PRICE_SMALL/MID/LARGE — amounts live only in the Stripe dashboard, never in code).';
comment on column public.partners.billing_started_at is
  'First moment a checkout completed for this partner; set once, never overwritten by later subscription events.';
comment on column public.partners.billing_tier is
  'Founder-assigned census tier (small/mid/large) — set in /admin/partners per Business Plan §10 (tier pre-selected by census). Checkout refuses to run without it; the partner never self-selects a price.';

-- Trap (kept deliberately): partners is RLS deny-all with zero policies — this
-- migration adds columns only. Do NOT add policies or grants here.
