-- Walk Beside — Supabase schema
-- Run this once in the SQL editor of your Supabase project.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- Profiles (mirrors auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  zip text,
  scenario text,
  deceased_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_write" on public.profiles;
create policy "profiles_self_write" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Tasks (the dashboard's three-tasks-at-a-time list)
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phase text not null,                 -- 'first-steps' | 'funeral' | 'service' | 'documents' | 'estate'
  title text not null,
  detail text,
  href text,
  status text not null default 'open', -- 'open' | 'done'
  position int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_status_idx on public.tasks (user_id, status, position);

alter table public.tasks enable row level security;
drop policy if exists "tasks_owner" on public.tasks;
create policy "tasks_owner" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Negotiations
-- ---------------------------------------------------------------------------
create table if not exists public.negotiations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  zip text not null,
  service_type text not null,
  target_home_name text,           -- specific home the family is considering
  target_home_estimate_cents int,  -- price they were quoted (if any)
  status text not null default 'started', -- 'started' | 'contacting' | 'received' | 'closed' | 'cancelled'
  best_quote_cents int,
  savings_cents int,
  fee_cents int,
  stripe_setup_intent_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists negotiations_user_idx on public.negotiations (user_id, created_at desc);

alter table public.negotiations enable row level security;
drop policy if exists "negotiations_owner" on public.negotiations;
create policy "negotiations_owner" on public.negotiations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Negotiation outreach (one row per funeral home contacted)
-- ---------------------------------------------------------------------------
create table if not exists public.negotiation_outreach (
  id uuid primary key default gen_random_uuid(),
  negotiation_id uuid not null references public.negotiations(id) on delete cascade,
  home_name text not null,
  home_email text,
  initial_email_id text,
  initial_email_body text,
  quote_cents int,
  notes text,
  status text not null default 'sent', -- 'sent' | 'replied' | 'no-reply' | 'declined'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.negotiation_outreach enable row level security;
drop policy if exists "outreach_owner" on public.negotiation_outreach;
create policy "outreach_owner" on public.negotiation_outreach
  for all using (
    auth.uid() = (select user_id from public.negotiations where id = negotiation_id)
  );

-- ---------------------------------------------------------------------------
-- Price list analyses
-- ---------------------------------------------------------------------------
create table if not exists public.price_list_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_text text,
  total_quoted_cents int,
  total_fair_cents int,
  potential_savings_cents int,
  items jsonb,
  created_at timestamptz not null default now()
);

alter table public.price_list_analyses enable row level security;
drop policy if exists "analyses_owner" on public.price_list_analyses;
create policy "analyses_owner" on public.price_list_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Death certificate trackers
-- ---------------------------------------------------------------------------
create table if not exists public.cert_trackers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_to_order int not null default 0,
  ordered int not null default 0,
  recipients jsonb,                -- [{ name, mailed_at, received_at }]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cert_trackers enable row level security;
drop policy if exists "certs_owner" on public.cert_trackers;
create policy "certs_owner" on public.cert_trackers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Obituary drafts
-- ---------------------------------------------------------------------------
create table if not exists public.obituaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inputs jsonb,
  draft text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.obituaries enable row level security;
drop policy if exists "obits_owner" on public.obituaries;
create policy "obits_owner" on public.obituaries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded price lists (create manually in Dashboard or via this hint)
-- ---------------------------------------------------------------------------
-- In Supabase: Storage → New bucket → name "price-lists", private.
