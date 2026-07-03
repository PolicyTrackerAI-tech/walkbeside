"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";

export function ApplyForm() {
  const [org, setOrg] = useState("");
  const [type, setType] = useState("hospice");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
            <Input id="org" value={org} maxLength={120} required onChange={(e) => setOrg(e.target.value)} />
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
