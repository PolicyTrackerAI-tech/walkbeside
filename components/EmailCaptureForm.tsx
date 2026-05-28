"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

interface Props {
  /** Identifies the page/surface that captured the email. Stored in planning_signups.source. */
  source: string;
  /** Card title — short, calm. */
  title: string;
  /** Explanatory paragraph above the form. */
  subtitle?: string;
  /** Button text. Default: "Send it to me". */
  buttonLabel?: string;
  /** Title shown after successful submit. Default: "Got it." */
  successTitle?: string;
  /** Message shown after successful submit. */
  successMessage?: string;
  /** Anti-spam note. Has a sensible default. */
  noteText?: string;
  /**
   * Prefill the email input — used by the EmailCapture server wrapper
   * to skip retyping for logged-in users. The input stays a normal
   * editable text field, so the user can clear or change it freely.
   */
  defaultEmail?: string;
}

/**
 * Client form for email capture on guide pages. Normally rendered via
 * the EmailCapture server wrapper, which reads the logged-in user's
 * email and passes it down as defaultEmail.
 *
 * Brand voice: calm, no marketing fluff, no urgency. The implied
 * contract is "we'll send one calm email a month and never share."
 */
export function EmailCaptureForm({
  source,
  title,
  subtitle,
  buttonLabel = "Send it to me",
  successTitle = "Got it.",
  successMessage = "It's in your inbox. Take care.",
  noteText = "We send one calm email a month. No marketing, easy to unsubscribe. We never share your email.",
  defaultEmail = "",
}: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setErrMsg(null);
    try {
      const r = await fetch("/api/planning/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setState("err");
        setErrMsg(d?.error ?? "Couldn't save. Try again.");
        return;
      }
      setState("ok");
    } catch {
      setState("err");
      setErrMsg("Network error. Try again.");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 px-6 py-6">
        <p className="font-serif text-xl text-ink mb-2">{successTitle}</p>
        <p className="text-ink-soft">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-soft px-6 py-6">
      <p className="font-serif text-xl text-ink mb-2">{title}</p>
      {subtitle && <p className="text-ink-soft mb-4">{subtitle}</p>}
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
            {state === "busy" ? "Sending…" : buttonLabel}
          </Button>
        </div>
        {errMsg && state === "err" && (
          <p className="text-sm text-bad">{errMsg}</p>
        )}
        <p className="text-xs text-ink-muted">{noteText}</p>
      </form>
    </div>
  );
}
