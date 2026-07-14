"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Field";

const SCORES: { value: number; label: string }[] = [
  { value: 1, label: "Not great" },
  { value: 2, label: "" },
  { value: 3, label: "Okay" },
  { value: 4, label: "" },
  { value: 5, label: "Excellent" },
];

// Mirrors the route's amountPaidCents cap so families see a plain message
// instead of the API's 400.
const MAX_PAID_DOLLARS = 100_000;

/**
 * Post-case outcome prompt shown on the /negotiate/[id]/closed page.
 * Records a 1–5 score plus, optionally, what the family ended up paying and
 * any fees that surprised them, via /api/negotiate/[id]/outcome (RLS-owned).
 * Mirrors the idle → busy → ok/err pattern used by EmailCaptureForm.
 */
export function CaseSatisfaction({
  negotiationId,
  initialScore = null,
  initialAmountPaidCents = null,
}: {
  negotiationId: string;
  initialScore?: number | null;
  initialAmountPaidCents?: number | null;
}) {
  const [score, setScore] = useState<number | null>(initialScore);
  // Seed from what's already recorded so a returning family sees their
  // earlier answer instead of an apparently blank form.
  const [paid, setPaid] = useState(
    initialAmountPaidCents != null
      ? initialAmountPaidCents % 100 === 0
        ? String(initialAmountPaidCents / 100)
        : (initialAmountPaidCents / 100).toFixed(2)
      : "",
  );
  const [surpriseFees, setSurpriseFees] = useState("");
  const [amountKnown, setAmountKnown] = useState(
    initialAmountPaidCents != null,
  );
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">(
    initialScore && initialAmountPaidCents != null ? "ok" : "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);

    const body: {
      satisfactionScore?: number;
      amountPaidCents?: number;
      surpriseFees?: string;
    } = {};
    if (score != null) body.satisfactionScore = score;

    const paidTrimmed = paid.trim();
    if (paidTrimmed) {
      const cleaned = paidTrimmed.replace(/[^0-9.]/g, "");
      const dollars = Number(cleaned);
      // $0 is a legitimate answer (donation programs, someone else paid) —
      // but an input with no digits at all is not.
      if (!cleaned || !Number.isFinite(dollars) || dollars < 0) {
        setState("err");
        setErrMsg(
          "We couldn't read that amount — a plain number like 4800 works best.",
        );
        return;
      }
      if (dollars > MAX_PAID_DOLLARS) {
        setState("err");
        setErrMsg("That's over $100,000 — double-check the amount.");
        return;
      }
      body.amountPaidCents = Math.round(dollars * 100);
    }

    const feesTrimmed = surpriseFees.trim();
    if (feesTrimmed) body.surpriseFees = feesTrimmed;

    if (score == null && body.amountPaidCents === undefined && !feesTrimmed) {
      setState("err");
      setErrMsg("Nothing to save yet — tap a score or add what you paid.");
      return;
    }

    setState("busy");
    try {
      const r = await fetch(`/api/negotiate/${negotiationId}/outcome`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setState("err");
        setErrMsg(
          typeof d?.error === "string" ? d.error : "Couldn't save. Try again.",
        );
        return;
      }
      if (body.amountPaidCents !== undefined) setAmountKnown(true);
      setState("ok");
    } catch {
      setState("err");
      setErrMsg("Network error. Try again.");
    }
  }

  if (state === "ok") {
    return (
      <Card tone="soft">
        <CardTitle>Thank you.</CardTitle>
        <p className="text-ink-soft mt-2">
          {amountKnown
            ? "Recorded — thank you. This helps the next family."
            : "We read every response. It helps us help the next family."}
        </p>
      </Card>
    );
  }

  return (
    <Card tone="soft">
      <CardTitle>How has this gone for you?</CardTitle>
      <p className="text-ink-soft mt-2 mb-4">
        Just for us. No wrong answer, and the money questions are optional.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Rate 1 to 5"
        >
          {SCORES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScore(s.value)}
              disabled={state === "busy"}
              aria-pressed={score === s.value}
              aria-label={`${s.value}${s.label ? ` — ${s.label}` : ""}`}
              className={`min-w-12 rounded-xl border px-4 py-3 text-center transition-colors disabled:opacity-50 ${
                score === s.value
                  ? "border-primary bg-primary-soft text-primary-deep"
                  : "border-border bg-surface text-ink hover:border-primary"
              }`}
            >
              <span className="block font-semibold">{s.value}</span>
              {s.label && (
                <span className="block text-xs text-ink-muted mt-0.5">
                  {s.label}
                </span>
              )}
            </button>
          ))}
        </div>
        <div>
          <Label htmlFor="outcome-amount-paid">
            What did you end up paying, all-in?
          </Label>
          <Input
            id="outcome-amount-paid"
            inputMode="decimal"
            placeholder="e.g. 4,800"
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            disabled={state === "busy"}
          />
        </div>
        <div>
          <Label htmlFor="outcome-surprise-fees">
            Any fees that surprised you?
          </Label>
          <Textarea
            id="outcome-surprise-fees"
            rows={3}
            maxLength={1000}
            value={surpriseFees}
            onChange={(e) => setSurpriseFees(e.target.value)}
            disabled={state === "busy"}
          />
        </div>
        <Button type="submit" disabled={state === "busy"}>
          {state === "busy" ? "Saving…" : "Save"}
        </Button>
        {state === "err" && errMsg && (
          <p className="text-sm text-bad">{errMsg}</p>
        )}
      </form>
    </Card>
  );
}
