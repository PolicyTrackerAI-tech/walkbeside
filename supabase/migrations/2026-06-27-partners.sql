-- L3 Partner Layer — pilot #1. Idempotent, RLS-safe, employer-ready naming.
-- Run once in the Supabase SQL editor, AFTER (or alongside) the still-unapplied
-- outcomes migration (2026-06-22-negotiation-outcomes.sql). gen_random_uuid /
-- gen_random_bytes are available on modern Supabase (pgcrypto).
--
-- Design + rationale: docs/P3_PARTNER_LAYER.md (judge-panel decision, 2026-06-27).

-- 1) Tenant table. partner_type reserves the employer/insurer end-state so the
--    later employer build is ADDITIVE, never a repaint.
create table if not exists public.partners (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                       -- e.g. 'Canyon Home Hospice' (shown on the report)
  partner_type  text not null default 'hospice'
                  check (partner_type in ('hospice', 'employer', 'insurer')),
  status        text not null default 'pilot'
                  check (status in ('pilot', 'active', 'paused', 'archived')),
  -- High-entropy capability token. Possession == authorization for the
  -- read-only aggregate report. Rotate this column to revoke a shared link.
  report_token  text not null unique default encode(gen_random_bytes(24), 'hex'),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists partners_report_token_idx on public.partners (report_token);

-- RLS ON, NO policies => deny-all to anon/authenticated. Only the service-role
-- key reads it (admin tooling + the report page), exactly like /admin/outcomes
-- and /admin/vetting.
alter table public.partners enable row level security;

-- 2) Attribution: tag a case to a referring partner. Nullable; most cases have
--    none. ON DELETE SET NULL so removing a partner never destroys a family's
--    case row.
alter table public.negotiations
  add column if not exists partner_id uuid references public.partners(id) on delete set null;

create index if not exists negotiations_partner_idx
  on public.negotiations (partner_id) where partner_id is not null;

comment on column public.negotiations.partner_id is
  'Referring partner (hospice). Set by the founder in /admin/outcomes AFTER the family has chosen a home. A reporting label ONLY — never read by /api/negotiate/choose, outreach, or home ranking (anti-steering is structural).';

-- negotiations / price_list_analyses RLS is INTENTIONALLY UNCHANGED. The new
-- column rides the existing owner-scoped policies; the partner report reads via
-- the service-role key with an explicit .eq('partner_id', id) filter. No anon or
-- public read is added anywhere.
--
-- DEFERRED (all additive later, FK onto partners(id) — zero repaint):
--   partner_codes(code text primary key, partner_id uuid, label text)   -- N referral codes/tenant + ?ref= cookie attribution (wave 2)
--   partner_members(partner_id uuid, email text, role text)             -- seats + magic-link / SSO for employers
--   partners.brand_logo_url / brand_color                               -- per-tenant branding
--   billing columns                                                     -- contracting
