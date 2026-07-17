"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";

export function ApplyForm({
  defaultType,
}: {
  defaultType?: "hospice" | "employer";
}) {
  const [org, setOrg] = useState("");
  const [type, setType] = useState<string>(defaultType ?? "hospice");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  // CMS-directory suggestions for the org field (hospices only). Purely
  // additive — a datalist never restricts what can be typed, so an org that
  // isn't in the CMS file (or an employer) still applies with free text.
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Suggestions render only while this holds (gated in the JSX below, so the
  // effect never has to clear state synchronously).
  const suggestible = type === "hospice" && org.trim().length >= 2;

  useEffect(() => {
    if (!suggestible) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/hospices/search?q=${encodeURIComponent(org.trim().slice(0, 80))}`,
          { signal: controller.signal },
        );
        if (!r.ok) return;
        const body = (await r.json()) as {
          hospices?: { name: string; city: string | null; state: string | null }[];
        };
        setSuggestions(
          (body.hospices ?? []).map((h) =>
            [h.name, [h.city, h.state].filter(Boolean).join(", ")]
              .filter(Boolean)
              .join(" — "),
          ),
        );
      } catch {
        // Suggestions are a nicety — typing free text is the real path.
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [org, type, suggestible]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const r = await fetch("/api/partner/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: org,
          partnerType: type,
          contactName,
          contactEmail: email,
          notes: notes || undefined,
        }),
      });
      setState(r.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <Card>
        <CardTitle>Application received.</CardTitle>
        <p className="text-ink-soft mt-2 text-sm">
          A person reviews every application — we&rsquo;ll email{" "}
          you at the address you gave, usually within a business day, with
          your report link and everything your team needs to share the tools.
        </p>
        <div className="mt-4">
          <LinkButton href="/partner/sample-hospice" variant="secondary">
            See a sample report while you wait →
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Apply — about two minutes</CardTitle>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="org">Organization</Label>
            <Input
              id="org"
              value={org}
              maxLength={120}
              required
              list="hospice-suggestions"
              autoComplete="off"
              onChange={(e) => setOrg(e.target.value)}
            />
            <datalist id="hospice-suggestions">
              {(suggestible ? suggestions : []).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="hospice">Hospice</option>
              <option value="employer">Employer</option>
            </Select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="contact">Your name</Label>
            <Input id="contact" value={contactName} maxLength={80} required onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" value={email} maxLength={254} required onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="notes" hint="Optional — census size, how you'd share it, anything you want us to know.">
            Anything else?
          </Label>
          <Textarea id="notes" rows={3} maxLength={600} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Apply →"}
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
