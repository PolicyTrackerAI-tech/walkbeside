-- Negotiation outcomes instrumentation: capture what actually happened, per
-- case and per home, so we can measure savings, choices, and satisfaction.
-- Run this once in the Supabase SQL editor. Idempotent.
--
-- Why: today the schema records the INBOUND side — the family's original quote
-- (negotiations.target_home_estimate_cents) and each home's quote
-- (negotiation_outreach.quote_cents) — but nothing about the OUTCOME: which
-- home was chosen, what was negotiated, what the family ultimately paid, what
-- hidden fees surfaced, and how satisfied they were. This adds those columns.
--
-- Reuse, not duplication — these already exist and are kept as-is:
--   listed_price (per case)  = negotiations.target_home_estimate_cents
--   quoted_price (per home)  = negotiation_outreach.quote_cents
--   best-quote rollup        = negotiations.best_quote_cents
-- Only genuinely-missing outcome fields are added below.
--
-- Privacy: every new column sits on a row already protected by the existing
-- owner-scoped RLS (negotiations_owner / outreach_owner, keyed on auth.uid()).
-- No policy is loosened — outcome data stays private to the owning family. The
-- internal admin view reads via the service-role key (like /admin/vetting).
--
-- The product is free to families (no advocate fee). amount_paid_cents below is
-- the price the family paid the FUNERAL HOME — an analytics figure only.

-- ---------------------------------------------------------------------------
-- Per-home outcomes (negotiation_outreach)
-- ---------------------------------------------------------------------------
alter table public.negotiation_outreach
  add column if not exists chosen boolean not null default false;

alter table public.negotiation_outreach
  add column if not exists listed_price_cents int;      -- this home's pre-negotiation list / sticker price

alter table public.negotiation_outreach
  add column if not exists negotiated_price_cents int;  -- price after we pushed back, for this home

alter table public.negotiation_outreach
  add column if not exists hidden_fees jsonb;           -- [{ "label": "...", "cents": 12345, "note": "..." }]

comment on column public.negotiation_outreach.chosen is
  'True for the single home the family selected. Set via /admin/outcomes (the founder runs pilot cases by hand); choosing a home in the product is free via /api/negotiate/choose.';
comment on column public.negotiation_outreach.hidden_fees is
  'Fees found beyond the quote. Shape: [{label, cents, note?}].';

create index if not exists outreach_chosen_idx
  on public.negotiation_outreach (negotiation_id, chosen);

-- At most one chosen home per case, enforced at the database level. The admin
-- API also clears siblings when marking a new choice (it sets the others false
-- before setting the new one true, so this partial unique index is satisfied).
create unique index if not exists negotiation_outreach_one_chosen_idx
  on public.negotiation_outreach (negotiation_id) where chosen;

-- ---------------------------------------------------------------------------
-- Per-case outcomes (negotiations)
-- ---------------------------------------------------------------------------
alter table public.negotiations
  add column if not exists negotiated_price_cents int;  -- final negotiated price on the chosen home

alter table public.negotiations
  add column if not exists amount_paid_cents int;       -- what the family paid the FUNERAL HOME (NOT the $199 fee)

alter table public.negotiations
  add column if not exists satisfaction_score smallint
  check (satisfaction_score is null or satisfaction_score between 1 and 5);

alter table public.negotiations
  add column if not exists outcome_recorded_at timestamptz;

-- Computed savings vs the family's original listed quote. Uses the amount
-- actually paid when known, else the negotiated price. NULL until both a listed
-- price and an outcome exist. (First generated column in the schema — chosen so
-- the figure can never drift from its inputs. amount_paid_cents and
-- negotiated_price_cents are added above so they exist when this is evaluated.)
alter table public.negotiations
  add column if not exists savings_vs_listed_cents int
  generated always as (
    target_home_estimate_cents - coalesce(amount_paid_cents, negotiated_price_cents)
  ) stored;

comment on column public.negotiations.amount_paid_cents is
  'Analytics only: cents the family paid the funeral home. The product is free to families — there is no advocate fee.';
comment on column public.negotiations.savings_vs_listed_cents is
  'Generated: target_home_estimate_cents - coalesce(amount_paid_cents, negotiated_price_cents).';

create index if not exists negotiations_outcome_idx
  on public.negotiations (outcome_recorded_at desc) where outcome_recorded_at is not null;

-- RLS is intentionally UNCHANGED. The new columns are covered by the existing
-- owner-scoped policies (negotiations_owner, outreach_owner). No public read is
-- added here — outcome data is family-private; the admin view uses service role.
