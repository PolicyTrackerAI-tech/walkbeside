-- Inbound AI parse (product week Day 4): a funeral home's email reply is
-- auto-parsed into a PROPOSED quote the family confirms with one click (P7).
--
-- The five ai_* columns hold the unconfirmed proposal only. They are never
-- ground truth: confirming still flows through the existing
-- /api/negotiate/[id]/quote route (the same path a hand-typed quote takes),
-- which then stamps ai_confirmed_at. Rides the existing negotiation_messages
-- RLS — owner-scoped SELECT, no family UPDATE policy, so the webhook and the
-- confirm stamp both write via the service role.
--
-- FOUNDER-APPLIED ONLY — run in the Supabase SQL editor, same as the other
-- 2026-06/07 migrations. Idempotent. Requires 2026-05-21-coordinator-messages.sql.

alter table public.negotiation_messages
  add column if not exists ai_quote_cents int,
  add column if not exists ai_quote_items jsonb,
  add column if not exists ai_parse_confidence numeric,
  add column if not exists ai_parsed_at timestamptz,
  add column if not exists ai_confirmed_at timestamptz;

comment on column public.negotiation_messages.ai_quote_cents is
  'AI-proposed all-in quote parsed from this inbound reply. A PROPOSAL only — never ground truth until a human confirms via /api/negotiate/[id]/quote.';
comment on column public.negotiation_messages.ai_quote_items is
  'AI-proposed itemization: [{name, cents}]. Same proposal-only contract as ai_quote_cents.';
comment on column public.negotiation_messages.ai_parse_confidence is
  '0-1 parse confidence (item count + stated-total consistency heuristic). Low-confidence parses are dropped, not stored.';
comment on column public.negotiation_messages.ai_parsed_at is
  'When the best-effort inbound parse ran. Null = never parsed (short body, Claude off, or parse declined).';
comment on column public.negotiation_messages.ai_confirmed_at is
  'When a human clicked "Use this" and the quote was written through the existing quote route. Null = still just a proposal.';
