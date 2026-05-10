-- Track when we've notified the family that a quote arrived from a
-- funeral home. The hourly cron at /api/cron/quote-notifications
-- watches for outreach rows that have a real quote (quote_cents or
-- quote_items populated) but no notified_at yet, sends the family
-- an email, and marks the row as notified to prevent re-sends.
--
-- Margaret refactor section: closes the loop on the V2 outreach
-- pipeline. Sister enters quotes (manually or via Resend webhook
-- in a future PR); the cron tells the family without us having to
-- watch the inbox.

alter table public.negotiation_outreach
  add column if not exists notified_at timestamptz;

comment on column public.negotiation_outreach.notified_at is
  'Margaret-section-27: timestamp the family was emailed about this quote arriving. NULL = not yet notified.';

create index if not exists outreach_notified_idx
  on public.negotiation_outreach (notified_at, quote_cents)
  where quote_cents is not null;
