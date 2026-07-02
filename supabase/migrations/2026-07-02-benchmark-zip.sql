-- Crowdsourced benchmark pipeline (roadmap Phase 1): region-aware aggregation
-- needs the zip the family entered alongside the parsed items. Older rows
-- (zip null) still aggregate nationally.
--
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor, same as
-- 2026-06-22-negotiation-outcomes.sql / 2026-06-27-partners.sql /
-- 2026-07-01-bereavement-cadence.sql. The code path degrades gracefully
-- until this is applied (insert retries without the column).

alter table public.price_list_analyses
  add column if not exists zip text;

comment on column public.price_list_analyses.zip is
  'Zip entered with the analysis; drives regional benchmark aggregation. De-identified use only.';
