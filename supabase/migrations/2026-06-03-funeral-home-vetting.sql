-- Funeral home vetting: explicit sister-approval before any outreach.
-- Run this once in the Supabase SQL editor. Idempotent.
--
-- Why: until now the only gate on outreach was `active` (defaults true) +
-- a non-null email, so every imported row was outreach-eligible the moment
-- it landed. That is the wrong default for contacting real businesses. This
-- adds an explicit `vetted` flag that a licensed funeral director must set
-- per home. `findHomesFromDirectory` now requires `vetted = true`, so an
-- unreviewed home can never be contacted even if OUTREACH_LIVE is on.
--
-- Two independent flags, both required to contact a home:
--   active  — home is in good standing (auto-set false on bounce/complaint,
--             or manually when a home opts out). Gates public read (RLS).
--   vetted  — a human reviewed the row (correct email, real business, in our
--             launch area). Defaults FALSE so existing rows must be reviewed.

alter table public.funeral_homes
  add column if not exists vetted boolean not null default false;

alter table public.funeral_homes
  add column if not exists vetted_at timestamptz;

alter table public.funeral_homes
  add column if not exists vetted_by text;   -- reviewer label (e.g. "sarah")

-- Speeds the directory read (filters on vetted + active) and the admin
-- vetting page (filters by state + status).
create index if not exists funeral_homes_vetted_idx
  on public.funeral_homes (vetted, active);
create index if not exists funeral_homes_state_vetted_idx
  on public.funeral_homes (state, vetted);

-- NOTE: existing rows are now vetted = false. They will NOT appear in
-- outreach until reviewed and approved in /admin/vetting. This is intended:
-- no real funeral home is contacted until a human signs off.
