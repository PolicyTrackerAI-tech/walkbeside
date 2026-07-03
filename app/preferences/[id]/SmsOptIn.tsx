"use client";

import { useState } from "react";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

/**
 * Opt-in for the SMS version of the check-ins. Same five touchpoints as the
 * emails, shorter; free to the family (we absorb the cost); STOP always
 * works. The preferences link itself is the credential (an unguessable id
 * mailed to the account's inbox) — same trust level as unsubscribe.
 */
export function SmsOptIn({
  id,
  initialPhone,
  initialOptIn,
}: {
  id: string;
  initialPhone: string;
  initialOptIn: boolean;
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [optedIn, setOptedIn] = useState(initialOptIn);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(nextOptIn: boolean) {
    setState("saving");
    try {
      const r = await fetch("/api/preferences/sms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, phone, optIn: nextOptIn }),
      });
      if (!r.ok) throw new Error();
      setOptedIn(nextOptIn);
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  return (
    <Card>
      <CardEyebrow>Text messages</CardEyebrow>
      <CardTitle>
        {optedIn ? "Check-ins by text are on." : "Prefer texts to email?"}
      </CardTitle>
      <p className="text-sm text-ink-soft mt-2 mb-4">
        The same five gentle check-ins over the thirteen months after a loss,
        as short texts instead of (or alongside) the emails. Free — we cover
        the cost. Reply STOP to any of them and they end immediately. Your
        number is used for these check-ins and nothing else.
      </p>
      <div className="max-w-xs">
        <Label htmlFor="sms-phone">Mobile number</Label>
        <Input
          id="sms-phone"
          type="tel"
          inputMode="tel"
          placeholder="(555) 555-0142"
          value={phone}
          maxLength={20}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        {optedIn ? (
          <Button variant="secondary" onClick={() => save(false)} disabled={state === "saving"}>
            Turn texts off
          </Button>
        ) : (
          <Button onClick={() => save(true)} disabled={state === "saving" || phone.trim().length < 10}>
            {state === "saving" ? "Saving…" : "Start check-ins by text"}
          </Button>
        )}
        {state === "saved" && <span className="text-sm text-good">Saved ✓</span>}
        {state === "error" && (
          <span className="text-sm text-bad">
            That number didn&rsquo;t look right — try the 10-digit format.
          </span>
        )}
      </div>
    </Card>
  );
}
