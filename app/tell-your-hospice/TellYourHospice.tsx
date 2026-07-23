"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { trackTool } from "@/lib/analytics";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";

/**
 * The prefilled intro note + the optional consented form. The note goes out
 * from the FAMILY's own mail client (mailto with an EMPTY recipient — they
 * add the coordinator they know); the form writes a partner_leads row and
 * notifies the founder internally. Neither path ever emails the hospice or
 * the family from our side.
 */

const INTRO_SUBJECT = "A free funeral-cost resource for the families you serve";

const INTRO_BODY = [
  `I'd like to pass along ${BRAND.name} (${BRAND.url}) — a free, independent site that shows families what a funeral should cost in their area and checks any funeral price list for overcharges.`,
  `It's free for every family: it's funded by the institutions it partners with, takes no money from funeral homes or insurers, and never steers anyone toward any particular funeral home.`,
  `It seems like something your bereavement team could offer families after a death, alongside the support you already provide.`,
  `If it looks useful, how it works for hospices is at ${BRAND.url}/partners.`,
].join("\n\n");

const MAILTO_HREF = `mailto:?subject=${encodeURIComponent(
  INTRO_SUBJECT,
)}&body=${encodeURIComponent(INTRO_BODY)}`;

export function TellYourHospice({
  initialHospice,
  initialCity,
  initialState,
}: {
  initialHospice: string;
  initialCity: string;
  initialState: string;
}) {
  const [copied, setCopied] = useState(false);
  const [hospice, setHospice] = useState(initialHospice);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [contactOk, setContactOk] = useState(false);
  const [formState, setFormState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  async function copyNote() {
    // Fire on intent, before the clipboard await — a pending permission
    // prompt or blocked clipboard must not swallow the count.
    trackTool("hospice_intro_copied", { action: "copy" });
    try {
      await navigator.clipboard.writeText(
        `Subject: ${INTRO_SUBJECT}\n\n${INTRO_BODY}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — offer a manual copy, but never let a missing
      // prompt() (some embedded browsers) crash the handler.
      try {
        window.prompt("Copy this note:", `Subject: ${INTRO_SUBJECT}\n\n${INTRO_BODY}`);
      } catch {
        // nothing left to offer
      }
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("sending");
    try {
      const r = await fetch("/api/partner/nominate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hospice,
          city: city || undefined,
          state: state || undefined,
          note: note || undefined,
          email: email || undefined,
          contactOk,
        }),
      });
      if (!r.ok) {
        setFormState("error");
        return;
      }
      setFormState("sent");
      trackTool("nominate_submitted");
    } catch {
      setFormState("error");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>The note, already written</CardTitle>
        <div className="mt-3 rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm text-ink-soft space-y-3">
          <p className="font-medium text-ink">Subject: {INTRO_SUBJECT}</p>
          {INTRO_BODY.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <a
            href={MAILTO_HREF}
            onClick={() => trackTool("hospice_intro_copied", { action: "mailto" })}
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl min-h-11 px-5 py-3 text-sm bg-primary-deep text-on-primary hover:bg-ink no-underline hover:no-underline"
          >
            Open in your email app
          </a>
          <Button variant="secondary" onClick={copyNote}>
            {copied ? "Copied" : "Copy the note"}
          </Button>
        </div>
        <p className="text-xs text-ink-muted mt-3">
          The &ldquo;To&rdquo; line is blank on purpose &mdash; you add the
          person you know. This note goes out from your email app, never from{" "}
          {BRAND.name}.
        </p>
      </Card>

      {formState === "sent" ? (
        <Card tone="primary">
          <CardTitle>Thank you &mdash; we have it.</CardTitle>
          <p className="text-ink-soft mt-2 text-sm">
            When we reach out to a hospice, it&rsquo;s our founder personally
            &mdash; and you and your family are never mentioned. We&rsquo;ll
            only contact you if you checked the box. Meanwhile, everything
            here is already free to you &mdash;{" "}
            <Link
              href="/analyzer"
              className="font-medium text-primary-deep underline-offset-2 hover:underline"
            >
              check a quote &rarr;
            </Link>
          </p>
        </Card>
      ) : (
        <Card>
          <CardTitle>Rather not send it yourself?</CardTitle>
          <p className="text-sm text-ink-soft mt-1">
            Tell us the hospice &mdash; introductions come from our founder,
            personally. You&rsquo;re never mentioned, and we&rsquo;ll only
            contact you if you check the box.
          </p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="nom-hospice">Hospice name</Label>
              <Input
                id="nom-hospice"
                value={hospice}
                maxLength={160}
                required
                onChange={(e) => setHospice(e.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nom-city">City</Label>
                <Input
                  id="nom-city"
                  value={city}
                  maxLength={80}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nom-state">State</Label>
                <Input
                  id="nom-state"
                  value={state}
                  maxLength={40}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="nom-note">Anything we should know? (optional)</Label>
              <Textarea
                id="nom-note"
                rows={3}
                maxLength={600}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nom-email">Your email (optional)</Label>
              <Input
                id="nom-email"
                type="email"
                value={email}
                maxLength={254}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <label
              htmlFor="nom-contact-ok"
              className="flex items-start gap-2 text-sm text-ink-soft"
            >
              <input
                id="nom-contact-ok"
                type="checkbox"
                checked={contactOk}
                onChange={(e) => setContactOk(e.target.checked)}
                className="mt-1"
              />
              <span>It&rsquo;s OK to contact me about this</span>
            </label>
            <Button type="submit" disabled={formState === "sending"}>
              {formState === "sending" ? "Sending…" : "Send this to our team"}
            </Button>
            {formState === "error" && (
              <p className="text-sm text-bad">
                That didn&rsquo;t go through &mdash; our fault, not yours. Try
                again in a minute, or send the note above from your own email;
                it does the same job.
              </p>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}
