-- Live shared household link (roadmap Phase 2). Upgrades the one-time
-- /resume snapshot into a durable, owner-refreshable, read-only family view:
-- the point person's device re-publishes the snapshot to a stable slug;
-- relatives open /household/<id> and see the CURRENT state; the owner can
-- refresh, rotate (new slug, old one dies), or revoke.
--
-- Security model — deliberately different from share_links: RLS is enabled
-- with NO policies, so the anon/authed PostgREST surface cannot touch this
-- table at all (share_links' anon-select pattern would leak owner_secret).
-- Every read and write goes through our API routes using the service role,
-- which checks owner_secret for mutations and strips it from reads.
--
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor with the other
-- pending migrations. Code degrades gracefully until applied (the /family
-- card reports the live link as unavailable; nothing else breaks).

create table if not exists public.household_links (
  id uuid primary key default gen_random_uuid(),
  -- Presented ONCE to the creating device and stored in its localStorage;
  -- required for update/rotate/revoke. Never returned by any read path.
  owner_secret uuid not null default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Rolling expiry: refreshed to now() + 30 days on every owner update.
  expires_at timestamptz not null default (now() + interval '30 days'),
  revoked_at timestamptz,
  -- Rotation trail: the row this one replaced (old slug is revoked).
  rotated_from uuid
);

create index if not exists household_links_expiry_idx
  on public.household_links (expires_at);

alter table public.household_links enable row level security;
-- No policies on purpose: service-role access only.

comment on table public.household_links is
  'Durable read-only family view slugs. Service-role only; owner_secret gates mutations. See app/api/household/*.';
