-- Share-link table for the "Save for my daughter" feature.
--
-- A share link snapshots the originating user's relevant sessionStorage
-- state (faith, decide answers, negotiate-wizard state) and gives them
-- a URL they can text to a family member. Both ends are anonymous —
-- no login required for either originator or recipient.
--
-- Privacy: links expire in 7 days. No PII in the URL — just the UUID.
-- The payload is a JSONB blob the client wrote; the server only stores
-- and returns it.

create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  opened_at timestamptz
);

create index if not exists share_links_expires_at_idx
  on public.share_links (expires_at);

comment on table public.share_links is
  'Margaret-section-7: anonymous share links for "Save for my daughter" handoff. Auto-expire after 7 days.';

-- RLS: anyone can read by id (the URL token IS the auth), anyone can
-- insert. We rely on the unguessable UUID for security; expired rows
-- return null from the read endpoint.
alter table public.share_links enable row level security;

drop policy if exists "anyone can create share links" on public.share_links;
create policy "anyone can create share links"
  on public.share_links
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "anyone can read non-expired share links" on public.share_links;
create policy "anyone can read non-expired share links"
  on public.share_links
  for select
  to anon, authenticated
  using (expires_at > now());

drop policy if exists "anyone can update opened_at" on public.share_links;
create policy "anyone can update opened_at"
  on public.share_links
  for update
  to anon, authenticated
  using (expires_at > now())
  with check (expires_at > now());
