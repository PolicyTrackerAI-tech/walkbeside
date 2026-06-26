"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";

const SCORES: { value: number; label: string }[] = [
  { value: 1, label: "Not great" },
  { value: 2, label: "" },
  { value: 3, label: "Okay" },
  { value: 4, label: "" },
  { value: 5, label: "Excellent" },
];

/**
 * Post-case satisfaction prompt shown on the /negotiate/[id]/closed page.
 * One tap records a 1–5 score via /api/negotiate/[id]/outcome (RLS-owned).
 * Mirrors the idle → busy → ok/err pattern used by EmailCaptureForm.
 */
export function CaseSatisfaction({
  negotiationId,
  initialScore = null,
}: {
  negotiationId: string;
  initialScore?: number | null;
}) {
  const [score, setScore] = useState<number | null>(initialScore);
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">(
    initialScore ? "ok" : "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function submit(value: number) {
    setScore(value);
    setState("busy");
    setErrMsg(null);
    try {
      const r = await fetch(`/api/negotiate/${negotiationId}/outcome`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ satisfactionScore: value }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setState("err");
        setErrMsg(
          typeof d?.error === "string" ? d.error : "Couldn't save. Try again.",
        );
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
      <Card tone="soft">
        <CardTitle>Thank you.</CardTitle>
        <p className="text-ink-soft mt-2">
          We read every response. It helps us help the next family.
        </p>
      </Card>
    );
  }

  return (
    <Card tone="soft">
      <CardTitle>How has this gone for you?</CardTitle>
      <p className="text-ink-soft mt-2 mb-4">
        One tap, just for us. No wrong answer.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Rate 1 to 5">
        {SCORES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => submit(s.value)}
            disabled={state === "busy"}
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
      {state === "err" && errMsg && (
        <p className="text-sm text-bad mt-3">{errMsg}</p>
      )}
    </Card>
  );
}
