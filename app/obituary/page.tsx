"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { OBITUARY_PROMPTS } from "@/lib/content";

const OBIT_STORAGE_KEY = "honestfuneral.obituary.draft.v1";

/** Screen 12 — Obituary helper. Question by question. */
export default function ObituaryPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const hydratedRef = useRef(false);

  // Hydrate persisted answers on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(OBIT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed && typeof parsed === "object") setAnswers(parsed);
      }
    } catch (e) {
      console.error("Could not hydrate obituary draft from storage:", e);
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  // Debounced persistence on answers change.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(OBIT_STORAGE_KEY, JSON.stringify(answers));
        setSavedAt(Date.now());
      } catch (e) {
        // Storage quota or private mode — silent failure is OK.
        console.error("Could not persist obituary draft:", e);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [answers]);

  const at = step;
  const total = OBITUARY_PROMPTS.length;
  const current = at < total ? OBITUARY_PROMPTS[at] : null;
  const value = current ? answers[current.id] ?? "" : "";

  function next() {
    setStep((s) => Math.min(s + 1, total));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/obituary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inputs: answers }),
      });
      if (!r.ok) {
        let msg =
          "Drafting failed. This is usually a temporary issue with our AI provider. Wait 30 seconds and try again.";
        try {
          const e = await r.json();
          if (e?.error?.message) msg = e.error.message;
          else if (typeof e?.error === "string") msg = e.error;
        } catch {}
        throw new Error(msg);
      }
      const d = await r.json();
      setDraft(d.draft);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not draft.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" defaultLabel="Dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          {!draft && (
            <>
              <div>
                <CardEyebrow>Obituary helper</CardEyebrow>
                <h1 className="font-serif text-3xl text-ink mb-3">
                  Writing an obituary when you&rsquo;re exhausted.
                </h1>
                <p className="text-ink-soft">
                  Tell us about the person who died &mdash; a few sentences
                  about their life, their people, what mattered to them.
                  We&rsquo;ll produce a draft you can edit, verify, and share
                  with family before anything gets published.
                </p>
                <p className="text-sm text-ink-muted mt-3">
                  We never auto-publish. We never guess at family members.
                  Every name and date is yours to confirm before anything
                  leaves your dashboard.
                </p>
              </div>

              <Card>
                {current ? (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">
                      Question {at + 1} of {total}
                      {!current.required && " · optional"}
                    </div>
                    <Label htmlFor={current.id}>{current.label}</Label>
                    {current.id === "career" || current.id === "passions" ? (
                      <Textarea
                        id={current.id}
                        rows={3}
                        placeholder={current.placeholder}
                        value={value}
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [current.id]: e.target.value }))
                        }
                      />
                    ) : (
                      <Input
                        id={current.id}
                        placeholder={current.placeholder}
                        value={value}
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [current.id]: e.target.value }))
                        }
                      />
                    )}
                    <div className="mt-5 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        onClick={prev}
                        disabled={at === 0}
                        type="button"
                      >
                        ← Back
                      </Button>
                      <div className="flex gap-2">
                        {!current.required && (
                          <Button variant="secondary" onClick={next} type="button">
                            Skip
                          </Button>
                        )}
                        <Button
                          onClick={next}
                          disabled={current.required && !value.trim()}
                          type="button"
                        >
                          {at === total - 1 ? "Done" : "Next →"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <CardTitle>Ready to draft.</CardTitle>
                    <p className="text-ink-soft mb-4">
                      We&rsquo;ll write a warm first version you can edit. Anything
                      we get wrong, you can fix.
                    </p>
                    <Button onClick={generate} disabled={busy} size="lg">
                      {busy ? "Writing…" : "Write the draft"}
                    </Button>
                    {error && (
                      <div className="mt-4 text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {savedAt && (
                <p className="text-xs text-ink-muted">
                  Saved
                </p>
              )}
            </>
          )}

          {draft && (
            <>
              <Card tone="primary">
                <CardEyebrow>Your draft</CardEyebrow>
                <div className="mb-4 rounded-xl border border-primary/40 bg-white px-4 py-3 text-sm text-ink-soft">
                  This is a draft. Please verify every name, date, and
                  relationship before publishing. We don&rsquo;t guess at
                  facts &mdash; if something is missing from what you told
                  us, you&rsquo;ll see{" "}
                  <span className="font-mono text-ink">[TO VERIFY]</span>{" "}
                  in the draft. Fill those in before sharing.
                </div>
                <Textarea
                  rows={10}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="bg-white"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => navigator.clipboard.writeText(draft)}>
                    Copy
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDraft(null);
                      setStep(0);
                    }}
                  >
                    Start over
                  </Button>
                </div>
              </Card>

              <Card tone="soft">
                <CardTitle>Where to publish — and what it costs</CardTitle>
                <ul className="space-y-2 text-[15px] text-ink">
                  <li>
                    <strong>Online (free)</strong> — funeral home website,
                    Legacy.com, social media. Most families share these now.
                  </li>
                  <li>
                    <strong>Local newspaper ($150–$500+)</strong> — charged per
                    word. Keep it short. Ask the paper for the &ldquo;funeral
                    notice&rdquo; rate, which is cheaper than the obituary
                    rate.
                  </li>
                  <li>
                    <strong>Family newsletter / church bulletin (free)</strong>{" "}
                    — often missed; reaches the people who matter most.
                  </li>
                </ul>
              </Card>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
