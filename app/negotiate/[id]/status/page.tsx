"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Card, CardTitle, CardEyebrow } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { fmtCents } from "@/lib/stripe";

interface Outreach {
  id: string;
  home_name: string;
  status: string;
  quote_cents: number | null;
  notes: string | null;
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
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <Link
            href="/dashboard"
            className="text-sm text-ink-muted hover:text-ink-soft"
          >
            Dashboard
          </Link>
        </div>
      </header>
      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Negotiation in progress</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              We&rsquo;re contacting funeral homes for you.
            </h1>
            <p className="text-ink-soft mt-2">
              Most homes reply within 24 hours. We&rsquo;ll surface the best two or
              three options as they come in. You can check back here any time.
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
                  No outreach sent yet — refresh in a moment.
                </p>
              )}
            </ul>
          </div>

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
        </div>
      </section>
    </main>
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
