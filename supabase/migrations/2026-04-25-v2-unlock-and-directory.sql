-- V2 migration: pure $49 unlock flow + funeral home directory.
-- Run this once in Supabase SQL editor after schema.sql. Idempotent.

-- ---------------------------------------------------------------------------
-- Unlock timestamp on negotiations.
-- Set when the family pays the $49 advocate fee. Until set, dashboard blurs
-- home names. Independent from `status='closed'` (closed = deal finalized;
-- unlocked = paid to see the data).
-- ---------------------------------------------------------------------------
alter table public.negotiations
  add column if not exists unlocked_at timestamptz;

-- ---------------------------------------------------------------------------
-- Funeral home directory.
-- Sister-curated for launch city. Read-only for end users; written by service
-- role only (admin tools / SQL editor).
-- ---------------------------------------------------------------------------
create table if not exists public.funeral_homes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,                         -- outreach destination; null = exclude from outreach
  phone text,
  address text,
  city text,
  state text,                         -- 2-letter, uppercase
  zip text,
  lat double precision,
  lng double precision,
  google_rating numeric(2,1),         -- 0.0 to 5.0
  google_review_count int,
  notes text,                         -- internal notes (sister)
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists funeral_homes_zip_idx on public.funeral_homes (zip);
create index if not exists funeral_homes_state_active_idx on public.funeral_homes (state, active);

alter table public.funeral_homes enable row level security;

-- Public read of active homes — directory is not sensitive.
drop policy if exists "funeral_homes_public_read" on public.funeral_homes;
create policy "funeral_homes_public_read" on public.funeral_homes
  for select using (active = true);

-- No public write. Service role bypasses RLS, so admin updates work via the
-- SQL editor or service-role-keyed scripts.
