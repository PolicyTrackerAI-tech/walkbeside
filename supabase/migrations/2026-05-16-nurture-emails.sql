-- Nurture-email tracking for planning_signups.
--
-- Welcome email already fires on signup (see /api/planning/signup).
-- This migration adds the per-row state needed to send two follow-up
-- nurture emails (step 1 at +7 days, step 2 at +21 days) and supports
-- a one-click unsubscribe.
--
-- Schedule lives in vercel.json; the cron route at
-- /api/cron/nurture-emails reads these columns and advances them.

alter table public.planning_signups
  add column if not exists nurture_step int not null default 0,
  add column if not exists last_nurture_sent_at timestamptz,
  add column if not exists unsubscribed_at timestamptz;

-- Partial index for the cron query: "rows still eligible for nurture
-- (not unsubscribed) ordered by readiness." Keeps the daily scan
-- cheap as the list grows.
create index if not exists planning_signups_nurture_due_idx
  on public.planning_signups (nurture_step, last_nurture_sent_at, created_at)
  where unsubscribed_at is null;
