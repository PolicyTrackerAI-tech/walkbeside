"use client";

import { useEffect, useState, use } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle, CardEyebrow } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { fmtCents } from "@/lib/stripe";

interface Outreach {
  id: string;
  home_name: string;
  home_email: string | null;
  status: string;
  quote_cents: number | null;
  notes: string | null;
}

interface Message {
  id: string;
  outreach_id: string | null;
  direction: "inbound_fd" | "outbound_to_fd" | "outbound_to_family";
  from_address: string | null;
  subject: string | null;
  body_text: string | null;
  created_at: string;
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
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches from a remote API (not derivable during render) and polls it; the initial call plus interval are the same external sync, not a render-time computation.
    refresh();
    // Nothing will change without a founder adding vetted homes to this ZIP —
    // polling would just hammer the API forever for no reason.
    if (neg?.status === "no_homes_available") return;
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader backHref="/dashboard" backLabel="Dashboard" />
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>
              {noHomesAvailable ? "No coverage yet" : "Negotiation in progress"}
            </CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              {noHomesAvailable
                ? <>We don&rsquo;t have vetted funeral homes in your area yet.</>
                : <>We&rsquo;re contacting funeral homes for you.</>}
            </h1>
            <p className="text-ink-soft mt-2">
              {noHomesAvailable
                ? <>We don&rsquo;t want to contact a home we haven&rsquo;t personally verified. Reply to any email from us and we&rsquo;ll help you directly, or check back soon as we add coverage in your region.</>
                : <>Most homes reply within 24 hours. We&rsquo;ll surface the best two or three options as they come in. You can check back here any time.</>}
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
                    onSaved={refresh}
                  />
                ))}
                {outreach.length === 0 && (
                  <p className="text-ink-muted text-sm">
                    We&rsquo;re contacting funeral homes now. First responses
                    usually arrive within 4&ndash;24 hours. This page refreshes
                    automatically every few seconds.
                  </p>
                )}
              </ul>
              {outreach.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink-muted">
                  <LegendDot label="Sent" className="bg-ink-muted" />
                  <LegendDot label="Read" className="bg-primary" />
                  <LegendDot label="Replied" className="bg-primary-deep" />
                  <LegendDot label="Quoted" className="bg-good" />
                  <LegendDot label="Declined" className="bg-bad" />
                </div>
              )}
            </div>
          )}

          {someReplied && (
            <Card tone="primary">
              <CardTitle>Ready to see what we found?</CardTitle>
              <p className="text-ink-soft mb-4">
                We&rsquo;ve received at least one quote. Choose the home you want and
                we&rsquo;ll release the contact info.
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
  onSent,
}: {
  negotiationId: string;
  outreach: Outreach[];
  messages: Message[];
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
        Use this for scheduling and questions before the arrangement meeting.
        Your personal contact info stays private. You&rsquo;ll meet with the
        home in person to make selections and sign &mdash; that part happens
        at the funeral home, not here.
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
          <CardEyebrow>Send a message</CardEyebrow>
          <div className="grid gap-3">
            <div>
              <Label htmlFor="msg-home">Send to</Label>
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
                placeholder="Scheduling, pre-meeting questions, things they should know. We'll relay it from our team."
              />
            </div>
            {sendError && <p className="text-bad text-sm">{sendError}</p>}
            <div>
              <Button onClick={send} disabled={busy || !text.trim()}>
                {busy ? "Sending…" : "Send via Honest Funeral"}
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
  return (
    <li className={`flex flex-col ${align}`}>
      <div className={`max-w-[85%] rounded-2xl border border-border px-4 py-3 ${bg}`}>
        <div className="text-xs text-ink-muted mb-1">
          {label} · {when}
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

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function OutreachRow({
  outreach,
  negotiationId,
  onSaved,
}: {
  outreach: Outreach;
  negotiationId: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [quote, setQuote] = useState(
    outreach.quote_cents ? String(outreach.quote_cents / 100) : "",
  );
  const [notes, setNotes] = useState(outreach.notes ?? "");
  const [busy, setBusy] = useState(false);

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
              : outreach.status === "sent"
                ? "Email sent — waiting on reply"
                : outreach.status}
          </div>
        </div>
        {!editing && (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            {outreach.quote_cents ? "Update quote" : "Record their quote"}
          </Button>
        )}
      </div>
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
    </li>
  );
}
