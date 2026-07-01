-- Bereavement check-in cadence: re-anchor from the decommissioned paid_at to a
-- real date_of_death. Run once in the Supabase SQL editor. Idempotent.
--
-- Why: the anniversary cron (app/api/cron/anniversary) selected candidates by
-- profiles.paid_at — a column nothing writes since the family charge was
-- decommissioned — so the bereavement touchpoint engine matched zero users and
-- sent nothing. Milestones now anchor on the date of the death itself, which
-- is also the clock Medicare's hospice bereavement requirement runs on
-- (42 CFR 418.64 — support offered for up to ~13 months after the death).
--
-- The date is set ONLY when the family explicitly provides it (optional field
-- in the /negotiate/start intake). Deliberately NO proxy fallback (signup date,
-- negotiation date): a mis-anchored condolence email — e.g. to a /plan-ahead
-- user whose person has not died — is the worst possible failure mode, so no
-- date means no cadence. Under-claiming, as everywhere else in this product.
--
-- Privacy: rides the existing owner-scoped profiles RLS (profiles_self_read /
-- profiles_self_write). The cron reads via the service-role key. No policy is
-- loosened.

alter table public.profiles
  add column if not exists date_of_death date;

comment on column public.profiles.date_of_death is
  'Date of the loved one''s passing, provided explicitly by the family (optional intake field). Anchors the 1mo/3mo/6mo/1yr/13mo bereavement check-in cadence. Never inferred from signup or activity — no date, no cadence.';

-- The cron's candidate query: opted-in profiles with a death date at least the
-- shortest milestone (30 days) in the past.
create index if not exists profiles_bereavement_idx
  on public.profiles (date_of_death, anniversary_emails_opt_in)
  where date_of_death is not null;

-- The old paid_at-based partial index (profiles_anniversary_idx) is left in
-- place — harmless, and paid_at remains a legacy read for old accounts.
