-- Anniversary check-ins for the user's first month/six months/year
-- after they unlocked the toolkit. Margaret refactor section: long-term
-- relationship — turn one-time customers into trusted infrastructure.
--
-- The Vercel cron at /api/cron/anniversary runs daily, finds users whose
-- paid_at hits the appropriate window (≥30/180/365 days ago), sends the
-- corresponding email via Resend, and records it in
-- anniversary_emails_sent so we don't double-send.
--
-- Opt-in by default. Each email includes an unsubscribe link that hits
-- /preferences/[token] and flips the toggle to false.

alter table public.profiles
  add column if not exists anniversary_emails_opt_in boolean default true,
  add column if not exists anniversary_emails_sent jsonb default '[]'::jsonb;

comment on column public.profiles.anniversary_emails_opt_in is
  'Margaret-section-26: opt-in for 1mo/6mo/1yr post-paywall check-in emails. Default true; user can opt out via /preferences link in any email.';
comment on column public.profiles.anniversary_emails_sent is
  'Margaret-section-26: array of milestones already emailed: ["1mo", "6mo", "1yr"]. Prevents double-send when the cron runs daily.';

create index if not exists profiles_anniversary_idx
  on public.profiles (paid_at, anniversary_emails_opt_in)
  where paid_at is not null;
