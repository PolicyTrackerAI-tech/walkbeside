-- Coordinator-flow message thread.
-- Captures inbound (FD → us via Postmark Inbound) and outbound (us → FD, us → family)
-- messages tied to a negotiation, so the family never has to email the
-- funeral home directly. Read-side surfaces on /negotiate/[id]/status.

create table if not exists public.negotiation_messages (
  id uuid primary key default gen_random_uuid(),
  negotiation_id uuid not null references public.negotiations(id) on delete cascade,
  outreach_id uuid references public.negotiation_outreach(id) on delete set null,
  direction text not null check (
    direction in ('inbound_fd', 'outbound_to_fd', 'outbound_to_family')
  ),
  from_address text,
  to_address text,
  subject text,
  body_text text,
  body_html text,
  raw_payload jsonb,           -- entire provider webhook payload for debugging
  inbound_provider text,        -- 'postmark' for V1; other providers if/when we add them
  inbound_message_id text,      -- provider's Message-ID for dedup on retries
  delivered_at timestamptz,     -- when the outbound send was confirmed; null for inbound
  created_at timestamptz not null default now()
);

create index if not exists negotiation_messages_neg_idx
  on public.negotiation_messages (negotiation_id, created_at desc);

-- Unique partial index — dedupes inbound webhook retries from Postmark
create unique index if not exists negotiation_messages_inbound_id_idx
  on public.negotiation_messages (inbound_message_id)
  where inbound_message_id is not null;

alter table public.negotiation_messages enable row level security;

-- Family can read all messages on their own negotiation
drop policy if exists "negotiation_messages_owner_read" on public.negotiation_messages;
create policy "negotiation_messages_owner_read" on public.negotiation_messages
  for select using (
    exists (
      select 1 from public.negotiations n
      where n.id = negotiation_messages.negotiation_id
        and n.user_id = auth.uid()
    )
  );

-- Family can insert outbound_to_fd messages on their own negotiation;
-- the application layer enforces the direction constraint and triggers
-- the outbound send. Service role bypasses RLS for inbound webhook writes.
drop policy if exists "negotiation_messages_owner_send" on public.negotiation_messages;
create policy "negotiation_messages_owner_send" on public.negotiation_messages
  for insert with check (
    direction = 'outbound_to_fd'
    and exists (
      select 1 from public.negotiations n
      where n.id = negotiation_messages.negotiation_id
        and n.user_id = auth.uid()
    )
  );
