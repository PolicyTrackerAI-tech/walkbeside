-- Migration A (sprint Day 3): the CMS hospice reference layer + explicit
-- contribute-consent on checker analyses.
--
-- hospices mirrors the CMS Provider Data Catalog "Hospice - General
-- Information" dataset (data.cms.gov dataset yc9t-dgbk, ~6,852 rows),
-- imported by scripts/import-hospices.mjs. It is PUBLIC REFERENCE data — the
-- product-side top of the partner funnel (homepage hospice finder, /partners
-- apply autocomplete, /hospices/[state] pages). No patient or family data is
-- ever anywhere near this table, and nothing in it is ever contacted
-- (channel-survival: the hospice transmits nothing; families self-serve).
--
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor, same as the other
-- 2026-06/07 migrations. Idempotent. Requires schema.sql
-- (price_list_analyses).

create table if not exists public.hospices (
  id         uuid primary key default gen_random_uuid(),
  ccn        text not null unique,      -- CMS certification number
  name       text not null,
  city       text,
  state      text,
  zip        text,
  ownership  text,                      -- CMS ownership category, verbatim
  created_at timestamptz not null default now()
);

comment on table public.hospices is
  'CMS hospice directory (Provider Data Catalog dataset yc9t-dgbk), imported by scripts/import-hospices.mjs. Public reference data only — never patient/family data, never a contact list. RLS deny-all: reads go through the service role (/api/hospices/search).';
comment on column public.hospices.ccn is
  'CMS certification number — a ZERO-PADDED STRING (e.g. ''011500''). Never cast to a number; the leading zeros are load-bearing.';
comment on column public.hospices.ownership is
  'CMS ownership_type category, verbatim (e.g. ''Non-Profit'').';

-- RLS: enabled, ZERO policies (deny-all; service-role only).
alter table public.hospices enable row level security;

-- Friday's /hospices/[state] pages list per state. The finder's name ilike
-- seq-scans — fine at ~7k rows, no trigram index needed.
create index if not exists hospices_state_idx on public.hospices (state);

-- ---------------------------------------------------------------------------
-- price_list_analyses: explicit contribute-consent for the benchmark feed
-- (D8). Three-state, filtered as contributed !== false in
-- lib/benchmark-sources.ts:
--   NULL  = legacy row (pre-consent era, grandfathered into aggregation under
--           the existing de-identified-accumulation disclosure)
--   true  = the family checked the analyzer's opt-in box (2026-07-20 on)
--   false = the box was not checked — the row persists for the family's own
--           history but is EXCLUDED from benchmark aggregation

alter table public.price_list_analyses
  add column if not exists contributed boolean;

comment on column public.price_list_analyses.contributed is
  'Explicit "add my de-identified prices to the public fair-price data" opt-in (2026-07-20). NULL = pre-consent legacy row (still aggregated); true = consented; false = declined (excluded from benchmark aggregation).';
