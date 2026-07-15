-- Regional benchmarks (product week Day 5): the verified/community data-tier
-- store, plus the funeral_homes provenance columns the weekend GPL ingest
-- needs.
--
-- regional_benchmarks holds per-region OVERRIDES of the hardcoded national
-- catalog (lib/pricing-data LINE_ITEMS × the zip-regions cost index). A row
-- exists only when a human promoted it on /admin/benchmarks with n>=5 real
-- data points behind it (guardrail #4 — never publish a number we can't
-- defend). lib/benchmarks-store.ts reads the narrowest active match
-- (zip3 > metro > state); no match means the price stays on the modeled tier.
--
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor, same as the other
-- 2026-06/07 migrations. Idempotent. Requires schema.sql (funeral_homes) and
-- 2026-06-09-rls-hardening.sql.

create table if not exists public.regional_benchmarks (
  id                 uuid primary key default gen_random_uuid(),
  scope              text not null check (scope in ('zip3', 'metro', 'state')),
  scope_value        text not null,
  line_item_id       text not null,
  fair_low_cents     int not null,
  fair_high_cents    int not null,
  predatory_at_cents int,
  tier               text not null check (tier in ('verified', 'community')),
  n_data_points      int not null default 0,
  sources            jsonb,
  version            text not null,
  active             boolean not null default true,
  effective_at       timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  unique (scope, scope_value, line_item_id, version)
);

comment on table public.regional_benchmarks is
  'Founder-promoted per-region benchmark overrides (verified/community tiers). RLS deny-all: reads go through the service role in lib/benchmarks-store.ts. The modeled tier needs NO rows — it is the code fallback (LINE_ITEMS × zip-regions cost index).';
comment on column public.regional_benchmarks.scope_value is
  'zip3 → 3-digit prefix (''841''); metro → must EXACTLY equal the lib/zip-regions.ts metro label for that region (''Salt Lake City''); state → 2-letter code (''UT'').';
comment on column public.regional_benchmarks.line_item_id is
  'Joins lib/pricing-data LINE_ITEMS ids (e.g. ''basic-services'').';
comment on column public.regional_benchmarks.tier is
  'verified = aggregated from real local price lists; community = reported by families in the area. Both require n>=5 at promotion time.';
comment on column public.regional_benchmarks.n_data_points is
  'How many real data points back this row — the n behind the public claim.';
comment on column public.regional_benchmarks.sources is
  'Provenance array: [{name, url?, kind, accessed}].';
comment on column public.regional_benchmarks.version is
  'Promotion batch label, e.g. ''2026-07-v1''. A re-promotion writes a new version and deactivates the old row.';

-- RLS: enabled, ZERO policies (deny-all; service-role only).
alter table public.regional_benchmarks enable row level security;

-- The store's one hot query filters active = true and scope_value in
-- (zip3, metro, state) — scope disambiguation happens in JS. A partial index
-- on scope_value covers it exactly; line_item_id rides along for the
-- per-item narrowest-scope pick.
create index if not exists regional_benchmarks_lookup_idx
  on public.regional_benchmarks (scope_value, line_item_id) where active;

-- ---------------------------------------------------------------------------
-- funeral_homes: provenance columns for the weekend GPL ingest
-- (scripts/ingest-gpl.mjs) — where a home's published price list lives and
-- when we last verified it.
--
-- DELIBERATELY NOT added to the column-scoped SELECT grants from
-- 2026-06-09-rls-hardening.sql: nothing public renders these yet, and the
-- ingest runs with the service role (which bypasses grants). Grant them to
-- anon/authenticated only when a public surface actually needs them.

alter table public.funeral_homes
  add column if not exists website text,
  add column if not exists gpl_url text,
  add column if not exists last_verified_at timestamptz;

comment on column public.funeral_homes.website is
  'The home''s own site (ingest provenance; not publicly granted).';
comment on column public.funeral_homes.gpl_url is
  'Where the home publishes its General Price List, when it does (CA SB 658 homes always do).';
comment on column public.funeral_homes.last_verified_at is
  'When we last confirmed the home''s published pricing (GPL ingest or manual check).';
