"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { HelpFooter } from "@/components/HelpFooter";
import { PrintHeader, PrintFooter } from "@/components/print/PrintHeader";

const STORAGE_KEY = "honestfuneral.eulogy.draft.v1";

interface Prompt {
  id: string;
  question: string;
  hint: string;
  multiline?: boolean;
}

const PROMPTS: Prompt[] = [
  {
    id: "name",
    question: "Who is the eulogy for?",
    hint: "Their full name as you'd say it aloud at the service.",
  },
  {
    id: "relationship",
    question: "Your relationship to them",
    hint: "e.g. son, daughter, longtime friend, neighbor of forty years.",
  },
  {
    id: "essence",
    question: "If a stranger asked who they were, what would you say in one sentence?",
    hint: "The thing that captures them. Not their job — who they were.",
    multiline: true,
  },
  {
    id: "story",
    question: "Tell one story that captures them.",
    hint: "A small moment is better than a big one. The day they did something only they would do.",
    multiline: true,
  },
  {
    id: "voice",
    question: "What did they say all the time?",
    hint: "A phrase, a saying, the joke they made every Thanksgiving. The thing you'll hear in your head forever.",
    multiline: true,
  },
  {
    id: "loved",
    question: "What did they love?",
    hint: "People, places, foods, hobbies, music. Two or three things.",
    multiline: true,
  },
  {
    id: "taught",
    question: "What did they teach you, even without trying?",
    hint: "The lesson you carry from them. Doesn't have to be profound — small ones land best at services.",
    multiline: true,
  },
  {
    id: "audience",
    question: "Who's in the room when you give this?",
    hint: "Family, friends, work colleagues, religious community, kids? Helps tune the tone.",
  },
];

export function Eulogy() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [duration, setDuration] = useState(5);
  const [tone, setTone] = useState<"reflective" | "warm" | "solemn">(
    "reflective",
  );
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        /* eslint-disable react-hooks/set-state-in-effect */
        if (parsed?.answers) setAnswers(parsed.answers);
        if (parsed?.duration) setDuration(parsed.duration);
        if (parsed?.tone) setTone(parsed.tone);
        if (parsed?.draft) setDraft(parsed.draft);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // ignore
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, duration, tone, draft }),
      );
    } catch {
      // ignore
    }
  }, [answers, duration, tone, draft]);

  const total = PROMPTS.length;
  const current = step < total ? PROMPTS[step] : null;
  const currentValue = current ? (answers[current.id] ?? "") : "";

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/eulogy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inputs: answers, durationMinutes: duration, tone }),
      });
      if (!r.ok) throw new Error("Drafting failed. Try again in 30 seconds.");
      const data = await r.json();
      setDraft(data.draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Drafting failed.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (!confirm("Discard the current draft and start over?")) return;
    setDraft(null);
    setAnswers({});
    setStep(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Eulogy helper
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              We&rsquo;ll draft a eulogy in your voice.
            </h1>
            <p className="text-lg text-ink-soft">
              Eight short questions. We turn your answers into a
              ready-to-read eulogy you can edit, time, and bring to
              the service.
            </p>
          </div>

          {!draft && current && (
            <Card>
              <p className="text-xs uppercase tracking-wider text-ink-muted mb-2">
                Question {step + 1} of {total}
              </p>
              <h2 className="font-serif text-xl text-ink mb-2">
                {current.question}
              </h2>
              <p className="text-sm text-ink-soft mb-4">{current.hint}</p>
              {current.multiline ? (
                <Textarea
                  rows={4}
                  value={currentValue}
                  onChange={(e) =>
                    setAnswers({ ...answers, [current.id]: e.target.value })
                  }
                  autoFocus
                />
              ) : (
                <Input
                  value={currentValue}
                  onChange={(e) =>
                    setAnswers({ ...answers, [current.id]: e.target.value })
                  }
                  autoFocus
                />
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {step > 0 && (
                  <Button variant="ghost" onClick={() => setStep(step - 1)}>
                    ← Back
                  </Button>
                )}
                <Button onClick={() => setStep(step + 1)}>
                  {step + 1 === total ? "Last question →" : "Next →"}
                </Button>
                <Button variant="ghost" onClick={() => setStep(step + 1)}>
                  Skip
                </Button>
              </div>
            </Card>
          )}

          {!draft && !current && (
            <Card tone="primary">
              <CardEyebrow>Almost there</CardEyebrow>
              <CardTitle>How long should the eulogy be?</CardTitle>
              <p className="text-ink-soft mt-3 mb-4">
                A typical service eulogy is 3&ndash;7 minutes. Shorter
                lands better than longer.
              </p>
              <Label htmlFor="duration">Length (in minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={15}
                value={String(duration)}
                onChange={(e) =>
                  setDuration(
                    Math.min(15, Math.max(1, Number(e.target.value) || 5)),
                  )
                }
              />

              <div className="mt-5">
                <div className="text-sm font-medium text-ink mb-1.5">Tone</div>
                <TonePicker value={tone} onChange={setTone} />
              </div>

              {error && (
                <p className="mt-3 text-sm text-bad">{error}</p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="ghost" onClick={() => setStep(total - 1)}>
                  ← Back
                </Button>
                <Button onClick={generate} disabled={busy}>
                  {busy ? "Drafting…" : "Draft my eulogy →"}
                </Button>
              </div>
            </Card>
          )}

          {draft && (
            <>
              {/* Screen-only editing UI */}
              <div className="print:hidden space-y-6">
                <Card tone="primary">
                  <CardEyebrow>Your draft</CardEyebrow>
                  <CardTitle>Read it aloud — that&rsquo;s the test.</CardTitle>
                  <p className="text-ink-soft mt-3">
                    Edit anything that doesn&rsquo;t sound like you.
                    Anything in [brackets] is a placeholder we couldn&rsquo;t
                    fill from your answers — replace with your own.
                  </p>
                </Card>
                <Card>
                  <Textarea
                    rows={20}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="font-serif text-base"
                  />
                  <div className="mt-5">
                    <div className="text-sm font-medium text-ink mb-1.5">
                      Try a different tone, then re-draft
                    </div>
                    <TonePicker value={tone} onChange={setTone} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={generate} disabled={busy}>
                      {busy ? "Drafting…" : "Draft again"}
                    </Button>
                    <Button onClick={() => window.print()}>Print</Button>
                    <Button variant="ghost" onClick={reset}>
                      Start over
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Print-only clean rendering of the draft. Renders the
                  current textarea contents as flowing paragraphs with a
                  letterhead — no UI chrome, no border, looks like a real
                  document the user can read at a podium. */}
              <div className="print-only">
                <PrintHeader title="Eulogy draft" />
                <div
                  className="font-serif"
                  style={{
                    fontSize: "13pt",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    color: "#111",
                  }}
                >
                  {draft}
                </div>
                <PrintFooter />
              </div>
            </>
          )}

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}

const EULOGY_TONES: {
  value: "reflective" | "warm" | "solemn";
  label: string;
  hint: string;
}[] = [
  { value: "reflective", label: "Reflective", hint: "honest, tender" },
  { value: "warm", label: "Warm", hint: "fond, a little light" },
  { value: "solemn", label: "Solemn", hint: "quiet, reverent" },
];

function TonePicker({
  value,
  onChange,
}: {
  value: "reflective" | "warm" | "solemn";
  onChange: (v: "reflective" | "warm" | "solemn") => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-1">
      {EULOGY_TONES.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`rounded-xl border px-3 py-2 text-left transition-colors ${
              active
                ? "border-primary bg-primary-soft"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="font-medium text-ink text-sm">{t.label}</div>
            <div className="text-xs text-ink-muted mt-0.5">{t.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
