"use client";

import { useEffect, useRef, useState } from "react";
import { trackTool } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";

/**
 * The claim panel on a facility page (/hospices/[state]/[ccn]). POSTs to
 * /api/partner/claim, which resolves the hospice server-side by CCN — the
 * org name is never sent from the client. Consent is explicit and unbundled:
 * the email is kept only when the checkbox is checked (the server enforces
 * it; this panel just doesn't pretend otherwise).
 */
export function ClaimPanel({
  ccn,
  orgName,
}: {
  ccn: string;
  orgName: string;
}) {
  const [email, setEmail] = useState("");
  const [contactOk, setContactOk] = useState(false);
  const [note, setNote] = useState("");
  const [needEmail, setNeedEmail] = useState(false);
  const [formState, setFormState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const sentRef = useRef<HTMLParagraphElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Move focus to the confirmation when the form is replaced — the focused
  // submit button unmounts, and silence reads as a broken page to AT.
  useEffect(() => {
    if (formState === "sent") sentRef.current?.focus();
  }, [formState]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (contactOk && email.trim() === "") {
      setNeedEmail(true);
      emailRef.current?.focus();
      return;
    }
    setNeedEmail(false);
    setFormState("sending");
    try {
      const r = await fetch("/api/partner/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ccn, // verbatim string — never numeric-cast
          email: email.trim() || undefined,
          contactOk,
          note: note.trim() || undefined,
        }),
      });
      if (r.ok) {
        trackTool("hospice_claim_submitted");
        setFormState("sent");
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  if (formState === "sent") {
    return (
      <p ref={sentRef} tabIndex={-1} role="status" className="text-sm text-ink outline-none">
        Received. If you checked the box, a person will follow up. Nothing
        about this page has changed.
      </p>
    );
  }

  return (
    <div>
      <h3 className="font-medium text-ink mb-1">Claim this page</h3>
      <p className="text-sm text-ink-soft mb-3">
        If you work at {orgName}, you can claim its page. Claiming changes
        nothing here — not the listing, not what families see — and it
        isn&rsquo;t an endorsement; the directory stays neutral either way.
        Leave a work email if you&rsquo;d like a reply, and check the box only
        if it&rsquo;s OK for a person to follow up.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label htmlFor="claim-email" hint="Optional. If the box below is unchecked, we don't keep it.">
            Work email
          </Label>
          <Input
            id="claim-email"
            ref={emailRef}
            type="email"
            value={email}
            maxLength={254}
            aria-invalid={needEmail || undefined}
            aria-describedby={needEmail ? "claim-email-error" : undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="claim-contact-ok"
            className="flex items-start gap-2 text-sm text-ink-soft"
          >
            <input
              id="claim-contact-ok"
              type="checkbox"
              checked={contactOk}
              onChange={(e) => setContactOk(e.target.checked)}
              className="mt-1"
            />
            <span>OK to contact me about this claim</span>
          </label>
          <p className="text-xs text-ink-muted mt-1">
            Unchecked, we don&rsquo;t keep your email and won&rsquo;t follow
            up.
          </p>
        </div>
        <div>
          <Label
            htmlFor="claim-note"
            hint="Anything we should know — your role, context, a question."
          >
            Note (optional)
          </Label>
          <Textarea
            id="claim-note"
            rows={3}
            maxLength={600}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={formState === "sending"}>
          {formState === "sending" ? "Sending…" : "Send claim"}
        </Button>
        {needEmail && (
          <p id="claim-email-error" role="alert" className="text-sm text-bad">
            Add your work email so we can reach you.
          </p>
        )}
        {formState === "error" && (
          <p role="alert" className="text-sm text-bad">
            That didn&rsquo;t go through. Try again in a minute, or email{" "}
            {BRAND.supportEmail}{" "}
            and mention this page.
          </p>
        )}
      </form>
    </div>
  );
}
