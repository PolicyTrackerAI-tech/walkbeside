"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";

export function DemoRequestForm() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const r = await fetch("/api/partner/demo-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, org, email, note: note || undefined }),
      });
      setState(r.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <Card tone="primary">
        <CardTitle>Got it — we&rsquo;ll be in touch.</CardTitle>
        <p className="text-ink-soft mt-2 text-sm">
          A person reads every message and replies personally, usually within
          a business day, to find a time that works.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Schedule a call</CardTitle>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="demo-name">Your name</Label>
            <Input id="demo-name" value={name} maxLength={80} required onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="demo-org">Organization</Label>
            <Input id="demo-org" value={org} maxLength={120} required onChange={(e) => setOrg(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="demo-email">Work email</Label>
          <Input id="demo-email" type="email" value={email} maxLength={254} required onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="demo-note" hint="Optional — good times to reach you, questions you already have.">
            Anything else?
          </Label>
          <Textarea id="demo-note" rows={3} maxLength={600} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Request a call →"}
        </Button>
        {state === "error" && (
          <p className="text-sm text-bad">
            Couldn&rsquo;t send just now — try again, or email
            partners@honestfuneral.co directly.
          </p>
        )}
      </form>
    </Card>
  );
}
