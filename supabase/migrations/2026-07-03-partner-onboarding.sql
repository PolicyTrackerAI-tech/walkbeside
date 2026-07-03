-- Self-serve hospice partner onboarding (roadmap Phase 4): the application
-- form writes a PENDING partners row (active=false — inert everywhere: the
-- report page, the links manager, and code resolution all require active).
-- A human — the founder — flips active on /admin/partners. Every new
-- institutional money relationship keeps its human approval gate.
--
-- FOUNDER-APPLIED ONLY — run with the other pending migrations (requires
-- 2026-06-27-partners.sql).

alter table public.partners
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists application_notes text,
  add column if not exists approved_at timestamptz;

comment on column public.partners.approved_at is
  'Set when the founder activates the partner on /admin/partners. active=false rows are pending applications.';
