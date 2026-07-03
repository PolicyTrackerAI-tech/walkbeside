-- The five pilot metrics (roadmap Phase 4): benefit dollars recovered is the
-- one metric with no existing column — admin-entered per case during the
-- pilot (VA burial benefits, SSA lump sum, located life policies, county
-- assistance actually claimed). Aggregate-only on every partner surface.
--
-- FOUNDER-APPLIED ONLY — run with the other pending migrations.

alter table public.negotiations
  add column if not exists benefit_dollars_recovered_cents int;

comment on column public.negotiations.benefit_dollars_recovered_cents is
  'Admin-entered during the pilot: benefit dollars the family actually recovered (VA/SSA/insurance/county). Reporting aggregate only.';
