-- Self-serve neutral referral codes (roadmap Phase 4, item 1).
--
-- A hospice coordinator — holding the partner's founder-issued report_token —
-- generates their own referral links at /partner/r/<token>/links, no engineer
-- involved. A family arriving through ?ref=<code> is attributed to the
-- institution when (and only when) they start a negotiation, for AGGREGATE
-- reporting only. Invariants preserved by construction:
--   * partner_id/partner_code are reporting labels — never read by
--     /api/negotiate/choose, outreach, or any home-selection logic.
--   * The coordinator surface shows per-code claim COUNTS only; no case
--     detail, no home names, no prices (zero-visibility rule).
--   * Founder approval stays upstream: codes can only hang off a partners
--     row, and partners rows are founder-created.
--
-- FOUNDER-APPLIED ONLY — run with the other pending migrations (requires
-- 2026-06-27-partners.sql first). Code degrades gracefully until applied.

create table if not exists public.partner_codes (
  code text primary key,                       -- e.g. 'HF-7KQ2MD' (unambiguous alphabet)
  partner_id uuid not null references public.partners(id) on delete cascade,
  label text,                                  -- coordinator's own note, e.g. 'front-desk QR'
  active boolean not null default true,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists partner_codes_partner_idx
  on public.partner_codes (partner_id, created_at desc);

alter table public.partner_codes enable row level security;
-- No policies on purpose: service-role access only, same as partners.

-- The code a negotiation was claimed under (partner_id is derived from it at
-- claim time and stays authoritative for reporting).
alter table public.negotiations
  add column if not exists partner_code text references public.partner_codes(code) on delete set null;

comment on table public.partner_codes is
  'Coordinator-generated referral codes. Reporting attribution only — never read by selection/outreach logic.';
