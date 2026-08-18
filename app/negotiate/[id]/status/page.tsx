"use client";

import { useEffect, useRef, useState, use } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle, CardEyebrow } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { CaseStepper } from "@/components/negotiate/CaseStepper";
import { fmtCents } from "@/lib/stripe";
import {
  anyOutreachSent,
  outreachStatusLabel,
} from "@/lib/negotiation/status-labels";

interface Outreach {
  id: string;
  home_name: string;
  home_email: string | null;
  status: string;
  quote_cents: number | null;
  notes: string | null;
  initial_email_body: string | null;
}

interface Message {
  id: string;
  outreach_id: string | null;
  direction: "inbound_fd" | "outbound_to_fd" | "outbound_to_family";
  from_address: string | null;
  subject: string | null;
  body_text: string | null;
  created_at: string;
  delivered_at: string | null;
  // AI-proposed quote parsed from an inbound reply (2026-07-16 migration).
  // Absent on a pre-migration schema — every read is null-guarded.
  ai_quote_cents?: number | null;
  ai_quote_items?: { name: string; cents: number }[] | null;
  ai_parse_confidence?: number | null;
  ai_confirmed_at?: string | null;
}

/** An unconfirmed AI-parsed quote attached to one outreach row. */
interface AiProposal {
  messageId: string;
  cents: number;
  itemCount: number;
}

interface NegotiationView {
  id: string;
  status: string;
  zip: string;
  service_type: string;
  target_home_name: string | null;
  target_home_estimate_cents: number | null;
  best_quote_cents: number | null;
  savings_cents: number | null;
}

export default function NegotiationStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [neg, setNeg] = useState<NegotiationView | null>(null);
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [outreachLive, setOutreachLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch(`/api/negotiate/${id}`);
    if (!r.ok) {
      setError("Could not load negotiation.");
      return;
    }
    const d = await r.json();
    setNeg(d.negotiation);
    setOutreach(d.outreach);
    setMessages(d.messages ?? []);
    setOutreachLive(d.outreachLive === true);
  }

  // When the page first loaded — not reset when the effect re-runs on a
  // status change, so the fast-poll window is measured from the real mount.
  const mountedAtRef = useRef<number | null>(null);

  useEffect(() => {
    mountedAtRef.current ??= Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches from a remote API (not derivable during render) and polls it; the initial call plus the scheduled re-fetches are the same external sync, not a render-time computation.
    refresh();
    // Terminal states. no_homes_available won't change without a founder
    // adding vetted homes to this ZIP, and closed/cancelled cases never
    // change again — polling would just hammer the API for no reason.
    if (
      neg?.status === "no_homes_available" ||
      neg?.status === "closed" ||
      neg?.status === "cancelled"
    ) {
      return;
    }

    // Replies arrive over hours, not seconds — poll fast only while the
    // family is likely still watching, then back off. Recursive setTimeout
    // (not setInterval) so the cadence can change between ticks.
    let timer: number | undefined;
    const schedule = () => {
      const delay =
        Date.now() - (mountedAtRef.current ?? 0) < 5 * 60_000 ? 6_000 : 30_000;
      timer = window.setTimeout(() => {
        if (!document.hidden) refresh();
        schedule();
      }, delay);
    };
    schedule();

    const onVisibilityChange = () => {
      if (document.hidden) return;
      refresh();
      window.clearTimeout(timer);
      schedule();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh is re-created each render but only closes over `id`, which is already a dependency; listing it would tear down the poll schedule on every render.
  }, [id, neg?.status]);

  if (error) {
    return (
      <main className="max-w-xl mx-auto px-5 py-12">
        <p className="text-bad">{error}</p>
      </main>
    );
  }
  if (!neg) {
    return (
      <main className="max-w-xl mx-auto px-5 py-12 text-ink-muted">
        Loading…
      </main>
    );
  }

  const someReplied = outreach.some((o) => o.quote_cents != null);
  const noHomesAvailable = neg.status === "no_homes_available";
  // The one condition under which this page may say "we're contacting
  // funeral homes": an email really left. Prepared/dry-run rows never count.
  const sentAny = anyOutreachSent(outreach);

  // Latest unconfirmed AI-parsed quote for a home that has no recorded quote
  // yet. Matched by the webhook's outreach link first, then by sender email.
  // Display-only until the family clicks "Use this" (which posts the same
  // quote route a hand-typed quote uses).
  const proposalFor = (o: Outreach): AiProposal | null => {
    if (o.quote_cents != null) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.direction !== "inbound_fd") continue;
      if (m.ai_quote_cents == null || m.ai_confirmed_at) continue;
      const matchesHome =
        m.outreach_id === o.id ||
        (!!m.from_address &&
          !!o.home_email &&
          m.from_address.toLowerCase() === o.home_email.toLowerCase());
      if (matchesHome) {
        return {
          messageId: m.id,
          cents: m.ai_quote_cents,
          itemCount: Array.isArray(m.ai_quote_items)
            ? m.ai_quote_items.length
            : 0,
        };
      }
    }
    return null;
  };

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <CaseStepper stage="contacting" />
          <div>
            <CardEyebrow>
              {noHomesAvailable
                ? "No coverage yet"
                : sentAny
                  ? "Negotiation in progress"
                  : "Outreach prepared"}
            </CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              {noHomesAvailable
                ? <>We don&rsquo;t have vetted funeral homes in your area yet.</>
                : sentAny
                  ? <>We&rsquo;re contacting funeral homes for you.</>
                  : <>Your outreach is prepared.</>}
            </h1>
            <p className="text-ink-soft mt-2">
              {noHomesAvailable ? (
                <>We don&rsquo;t want to contact a home we haven&rsquo;t personally verified. Reply to any email from us and we&rsquo;ll help you directly, or check back as we add coverage in your region.</>
              ) : sentAny ? (
                <>We&rsquo;ve asked each home below for their itemized prices &mdash; your right under the FTC Funeral Rule. Each home&rsquo;s status updates here as replies come in; you can check back any time.</>
              ) : (
                <>For each home below we&rsquo;ve written the exact price-list request we&rsquo;d send &mdash; itemized prices are your right under the FTC Funeral Rule. <strong className="text-ink">Our team isn&rsquo;t sending outreach emails right now, so nothing has gone out to any home.</strong>{" "}
                You can contact any of them directly today, and anything you record here stays organized with your case.</>
              )}
            </p>
          </div>

          <Card tone="soft">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">
                  Zip
                </div>
                <div className="text-ink">{neg.zip}</div>
              </div>
              <div>
                <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">
                  Service
                </div>
                <div className="text-ink">{neg.service_type}</div>
              </div>
              <div>
                <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">
                  Baseline
                </div>
                <div className="text-ink">
                  {neg.target_home_estimate_cents
                    ? `${neg.target_home_name ?? ""} ${fmtCents(neg.target_home_estimate_cents)}`
                    : "—"}
                </div>
              </div>
            </div>
          </Card>

          {!noHomesAvailable && (
            <div>
              <h2 className="font-serif text-xl text-ink mb-3">Outreach</h2>
              <ul className="space-y-3">
                {outreach.map((o) => (
                  <OutreachRow
                    key={o.id}
                    outreach={o}
                    negotiationId={id}
                    proposal={proposalFor(o)}
                    onSaved={refresh}
                  />
                ))}
                {outreach.length === 0 && (
                  <p className="text-ink-muted text-sm">
                    {outreachLive ? (
                      <>We&rsquo;re lining up your outreach now. This page
                      refreshes automatically.</>
                    ) : (
                      <>We&rsquo;re preparing your request list. Nothing has
                      been sent to any home.</>
                    )}
                  </p>
                )}
              </ul>
            </div>
          )}

          {someReplied && (
            <Card tone="primary">
              <CardTitle>Ready to compare?</CardTitle>
              <p className="text-ink-soft mb-4">
                {sentAny ? (
                  <>We&rsquo;ve received at least one quote. Choose the home
                  you want and we&rsquo;ll notify them and help schedule the
                  arrangement meeting.</>
                ) : (
                  <>At least one quote is recorded. When you&rsquo;re ready,
                  choose the home you want &mdash; choosing is free, and
                  we&rsquo;ll walk you through what happens next.</>
                )}
              </p>
              <LinkButton href={`/negotiate/${id}/results`}>
                See results →
              </LinkButton>
            </Card>
          )}

          <MessagesPanel
            negotiationId={id}
            outreach={outreach}
            messages={messages}
            outreachLive={outreachLive}
            onSent={refresh}
          />
        </div>
      </section>
    </main>
  );
}

function MessagesPanel({
  negotiationId,
  outreach,
  messages,
  outreachLive,
  onSent,
}: {
  negotiationId: string;
  outreach: Outreach[];
  messages: Message[];
  outreachLive: boolean;
  onSent: () => void;
}) {
  const reachable = outreach.filter((o) => o.home_email);
  const [chosenOutreachId, setChosenOutreachId] = useState<string>("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Derive the effective selection at render time so the dropdown stays
  // valid when the outreach list updates without needing a useEffect.
  const validIds = new Set(reachable.map((o) => o.id));
  const effectiveOutreachId =
    chosenOutreachId && validIds.has(chosenOutreachId)
      ? chosenOutreachId
      : (reachable[0]?.id ?? "");

  async function send() {
    if (!effectiveOutreachId || !text.trim()) return;
    setBusy(true);
    setSendError(null);
    try {
      const r = await fetch(`/api/negotiate/${negotiationId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ outreachId: effectiveOutreachId, text }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setSendError(d?.error ? JSON.stringify(d.error) : `HTTP ${r.status}`);
        return;
      }
      setText("");
      onSent();
    } finally {
      setBusy(false);
    }
  }

  const homeNameById = Object.fromEntries(
    outreach.map((o) => [o.id, o.home_name] as const),
  );

  if (reachable.length === 0 && messages.length === 0) return null;

  return (
    <div>
      <h2 className="font-serif text-xl text-ink mb-3">Pre-meeting messages</h2>
      <p className="text-sm text-ink-muted mb-4">
        {outreachLive ? (
          <>Use this for scheduling and questions before the arrangement
          meeting. Your personal contact info stays private. You&rsquo;ll meet
          with the home in person to make selections and sign &mdash; that
          part happens at the funeral home, not here.</>
        ) : (
          <>Our team isn&rsquo;t relaying messages to funeral homes right now.
          Anything you write here is saved with your case &mdash; it
          won&rsquo;t be sent to the home, so for scheduling or questions,
          contact the home directly.</>
        )}
      </p>

      {messages.length > 0 && (
        <ul className="space-y-3 mb-5">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              homeName={
                m.outreach_id
                  ? (homeNameById[m.outreach_id] ?? "Funeral home")
                  : "Funeral home"
              }
            />
          ))}
        </ul>
      )}

      {reachable.length > 0 && (
        <Card>
          <CardEyebrow>{outreachLive ? "Send a message" : "Add a note"}</CardEyebrow>
          <div className="grid gap-3">
            <div>
              <Label htmlFor="msg-home">{outreachLive ? "Send to" : "About"}</Label>
              <Select
                id="msg-home"
                value={effectiveOutreachId}
                onChange={(e) => setChosenOutreachId(e.target.value)}
              >
                {reachable.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.home_name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="msg-text">Message</Label>
              <Textarea
                id="msg-text"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  outreachLive
                    ? "Scheduling, pre-meeting questions, things they should know. We'll relay it from our team."
                    : "Notes about this home — saved with your case, not sent."
                }
              />
            </div>
            {sendError && <p className="text-bad text-sm">{sendError}</p>}
            <div>
              <Button onClick={send} disabled={busy || !text.trim()}>
                {busy
                  ? outreachLive
                    ? "Sending…"
                    : "Saving…"
                  : outreachLive
                    ? "Send via Honest Funeral"
                    : "Save note"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  homeName,
}: {
  message: Message;
  homeName: string;
}) {
  const isInbound = message.direction === "inbound_fd";
  const label = isInbound ? homeName : "You (via Honest Funeral)";
  const align = isInbound ? "items-start" : "items-end";
  const bg = isInbound ? "bg-surface-soft" : "bg-primary-soft";
  const when = new Date(message.created_at).toLocaleString();
  // An outbound message with no delivery stamp was stored while our sending
  // was paused — it never reached the home, and (like a dry_run outreach row)
  // it will not send later. Say so instead of letting it look delivered.
  const savedNotSent =
    message.direction === "outbound_to_fd" && !message.delivered_at;
  return (
    <li className={`flex flex-col ${align}`}>
      <div className={`max-w-[85%] rounded-2xl border border-border px-4 py-3 ${bg}`}>
        <div className="text-xs text-ink-muted mb-1">
          {label} · {when}
          {savedNotSent && (
            <span className="ml-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider">
              Saved — not sent to the home
            </span>
          )}
        </div>
        {message.subject && (
          <div className="text-sm text-ink font-medium mb-1">
            {message.subject}
          </div>
        )}
        <pre className="text-sm text-ink whitespace-pre-wrap font-sans">
          {message.body_text}
        </pre>
      </div>
    </li>
  );
}

function OutreachRow({
  outreach,
  negotiationId,
  proposal,
  onSaved,
}: {
  outreach: Outreach;
  negotiationId: string;
  proposal: AiProposal | null;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [quote, setQuote] = useState(
    outreach.quote_cents ? String(outreach.quote_cents / 100) : "",
  );
  const [notes, setNotes] = useState(outreach.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // One-click confirm of the AI-parsed quote — posts the SAME route a
  // hand-typed quote uses (plus confirmMessageId so the source message gets
  // ai_confirmed_at stamped). The proposal itself is never the record.
  async function useProposal() {
    if (!proposal) return;
    setBusy(true);
    setConfirmError(null);
    try {
      const r = await fetch(`/api/negotiate/${negotiationId}/quote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          outreachId: outreach.id,
          quoteCents: proposal.cents,
          confirmMessageId: proposal.messageId,
        }),
      });
      if (!r.ok) {
        setConfirmError(
          "Couldn't save that quote — try again, or record it manually.",
        );
        return;
      }
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      onSaved();
    } catch {
      // Network-level failure (offline, connection reset) — same message as
      // an HTTP error so the tap never fails silently.
      setConfirmError(
        "Couldn't save that quote — try again, or record it manually.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      await fetch(`/api/negotiate/${negotiationId}/quote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          outreachId: outreach.id,
          quoteCents: Math.round(Number(quote) * 100),
          notes: notes || undefined,
        }),
      });
      setEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-ink font-medium">{outreach.home_name}</div>
          <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">
            {outreach.quote_cents
              ? `Quoted ${fmtCents(outreach.quote_cents)}`
              : outreachStatusLabel(outreach.status)}
          </div>
        </div>
        {!editing && (
          <div className="flex items-center gap-2">
            {justSaved && (
              <span className="text-xs text-good font-medium">Saved ✓</span>
            )}
            <Button variant="secondary" onClick={() => setEditing(true)}>
              {outreach.quote_cents ? "Update quote" : "Record their quote"}
            </Button>
          </div>
        )}
      </div>
      {proposal && !editing && (
        <div className="mt-3 rounded-xl border border-border bg-surface-soft px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            We read their reply
          </div>
          <p className="text-sm text-ink">
            Their email looks like a quote of{" "}
            <strong>{fmtCents(proposal.cents)}</strong>
            {proposal.itemCount > 0
              ? ` (${proposal.itemCount} item${proposal.itemCount === 1 ? "" : "s"})`
              : ""}
            . Nothing is recorded until you confirm it.
          </p>
          {confirmError && (
            <p className="text-bad text-sm mt-2">{confirmError}</p>
          )}
          <div className="mt-3 flex gap-2">
            <Button onClick={useProposal} disabled={busy}>
              {busy ? "Saving…" : "Use this"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setQuote(String(proposal.cents / 100));
                setEditing(true);
              }}
            >
              Edit first
            </Button>
          </div>
        </div>
      )}
      {editing && (
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor={`q-${outreach.id}`}>All-in price (USD)</Label>
            <Input
              id={`q-${outreach.id}`}
              inputMode="decimal"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`n-${outreach.id}`}>
              Notes (e.g. paste their email)
            </Label>
            <Input
              id={`n-${outreach.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <Button onClick={save} disabled={busy || !quote}>
              {busy ? "Saving…" : "Save"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {outreach.notes && !editing && (
        <p className="mt-3 text-sm text-ink-soft whitespace-pre-line">
          {outreach.notes}
        </p>
      )}
      {outreach.initial_email_body && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-ink-muted">
            {outreach.status === "dry_run" || outreach.status === "pending"
              ? "See the request we prepared"
              : "See the request we sent"}
          </summary>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-ink-soft border-l-2 border-border pl-3">
            {outreach.initial_email_body}
          </pre>
        </details>
      )}
    </li>
  );
}
