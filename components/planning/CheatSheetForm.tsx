"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function CheatSheetForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setMsg(null);
    try {
      const r = await fetch("/api/planning/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setState("err");
        setMsg(d?.error ?? "Couldn't save. Try again.");
        return;
      }
      setState("ok");
    } catch {
      setState("err");
      setMsg("Network error. Try again.");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary-soft/60 px-5 py-5">
        <p className="font-serif text-lg text-ink mb-2">
          Got it. Cheat sheet coming your way.
        </p>
        <p className="text-sm text-ink-soft mb-3">
          You can read it right now at the link below, or wait for the email
          &mdash; both are the same content.
        </p>
        <Link
          href="/prep"
          className="text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
        >
          Read the cheat sheet now &rarr;
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "busy"}
          className="flex-1"
          aria-label="Email address"
        />
        <Button type="submit" disabled={state === "busy" || !email}>
          {state === "busy" ? "Sending…" : "Send me the cheat sheet"}
        </Button>
      </div>
      {msg && state === "err" && (
        <p className="text-sm text-bad">{msg}</p>
      )}
      <p className="text-xs text-ink-muted">
        We don&rsquo;t spam &mdash; one email a month on planning-ahead
        topics, easy to unsubscribe. We never share your email.
      </p>
    </form>
  );
}
