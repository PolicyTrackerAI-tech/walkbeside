-- Portal identity (product week Day 1): partner sign-in seats, captured demo
-- leads, analyzer attribution + extraction provenance, and the AI cost ledger.
--
-- partner_members is the table 2026-06-27-partners.sql explicitly reserved:
-- who may SIGN IN to /portal for a partner org. Additive on the
-- partners/partner_codes token model — report_token quick links keep working
-- unchanged; a seat just adds a session-gated way in (lib/partner/auth.ts
-- mirrors the admin gate). invited_email is stored LOWERCASE at every write
-- site; a member binds to their auth.users row on first login by email match.
--
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor, same as the other
-- 2026-06/07 migrations. Idempotent. Requires 2026-06-27-partners.sql and
-- 2026-07-03-partner-codes.sql.

create table if not exists public.partner_members (
  id             uuid primary key default gen_random_uuid(),
  partner_id     uuid not null references public.partners(id) on delete cascade,
  invited_email  text not null,
  role           text not null default 'member' check (role in ('owner', 'member')),
  user_id        uuid references auth.users(id) on delete set null,
  invited_at     timestamptz not null default now(),
  accepted_at    timestamptz,
  deactivated_at timestamptz,
  created_at     timestamptz not null default now()
);

comment on table public.partner_members is
  'Sign-in seats for /portal. RLS deny-all: reads/writes go through the service role behind lib/partner/auth.ts (requirePartnerMember), same posture as partners/partner_codes.';
comment on column public.partner_members.invited_email is
  'Always stored lowercase. Binds to auth.users on first login by email match (user_id + accepted_at stamped then).';
comment on column public.partner_members.deactivated_at is
  'Soft removal — a deactivated seat can no longer enter /portal but keeps its history.';

-- RLS: enabled, ZERO policies (deny-all; service-role only).
alter table public.partner_members enable row level security;

-- Plain-column unique index (not functional) so ON CONFLICT upserts can
-- target it; invited_email is lowercased at every write site instead.
create unique index if not exists partner_members_partner_email_idx
  on public.partner_members (partner_id, invited_email);
create index if not exists partner_members_user_idx
  on public.partner_members (user_id) where user_id is not null;

-- ---------------------------------------------------------------------------
-- partner_leads: "schedule a call" demo requests currently email the founder
-- and vanish (no row anywhere). Insert-only via service role from
-- /api/partner/demo-request; surfaced read-only on /admin/partners.

create table if not exists public.partner_leads (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  org        text,
  email      text not null,
  note       text,
  source     text not null default 'demo-request',
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.partner_leads is
  'Institutional demo/contact requests. RLS deny-all (service-role only); admin reads via the session gate.';

alter table public.partner_leads enable row level security;

-- ---------------------------------------------------------------------------
-- Portal settings columns (Day 2 UI; columns land with the identity migration
-- so the week needs no partners-table follow-up).

alter table public.partners
  add column if not exists brand_accent text,
  add column if not exists notification_email text;

comment on column public.partners.brand_accent is
  'Optional co-brand accent (hex). Name + accent only — no logo upload this cycle.';
comment on column public.partners.notification_email is
  'Where the monthly digest goes. Falls back to contact_email when null.';

-- ---------------------------------------------------------------------------
-- Analyzer attribution + extraction provenance. partner_id/partner_code are
-- reporting labels ONLY — never read by home selection, outreach, or ranking
-- (anti-steering is structural, same contract as negotiations.partner_id).
-- Written best-effort by the service role after the family's own insert; the
-- family flow never fails over attribution.

alter table public.price_list_analyses
  add column if not exists partner_id uuid references public.partners(id) on delete set null,
  add column if not exists partner_code text references public.partner_codes(code) on delete set null,
  add column if not exists confidence numeric,
  add column if not exists extraction_method text;

comment on column public.price_list_analyses.partner_id is
  'Reporting attribution only (referred family ran the checker). Never an input to any recommendation.';
comment on column public.price_list_analyses.extraction_method is
  'How the items were parsed: claude | naive | founder_ingest.';
comment on column public.price_list_analyses.confidence is
  '0-1 extraction confidence (item count + total consistency heuristic).';

create index if not exists price_list_analyses_partner_idx
  on public.price_list_analyses (partner_id) where partner_id is not null;

-- ---------------------------------------------------------------------------
-- api_cost_events: per-call AI cost ledger (AI_STRATEGY §3.3 #1). Written
-- best-effort by lib/claude.ts recordUsage(); a logging failure never blocks
-- a user-facing call.

create table if not exists public.api_cost_events (
  id               uuid primary key default gen_random_uuid(),
  feature          text not null,
  model            text not null,
  input_tokens     int not null default 0,
  output_tokens    int not null default 0,
  cache_read_tokens int not null default 0,
  negotiation_id   uuid,
  created_at       timestamptz not null default now()
);

comment on table public.api_cost_events is
  'One row per Claude API call: feature tag + token usage. RLS deny-all (service-role only).';

alter table public.api_cost_events enable row level security;

create index if not exists api_cost_events_feature_idx
  on public.api_cost_events (feature, created_at desc);
