"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { HelpFooter } from "@/components/HelpFooter";

const STORAGE_KEY = "honestfuneral.timeline.v1";

interface TimelineState {
  serviceDate: string;
  serviceTime: string;
  serviceLocation: string;
  receptionLocation: string;
  hasBurial: boolean;
  burialLocation: string;
  events: TimelineEvent[];
}

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  who: string;
  done: boolean;
}

const DEFAULT: TimelineState = {
  serviceDate: "",
  serviceTime: "",
  serviceLocation: "",
  receptionLocation: "",
  hasBurial: true,
  burialLocation: "",
  events: [],
};

const DEFAULT_EVENTS: Omit<TimelineEvent, "id" | "done">[] = [
  {
    time: "−2 hours",
    title: "Family arrives at the funeral home for private viewing",
    who: "Immediate family",
  },
  {
    time: "−1 hour",
    title: "Visitation / wake opens to guests",
    who: "All",
  },
  {
    time: "Service start",
    title: "Service begins — processional",
    who: "Officiant + family",
  },
  {
    time: "+45 min",
    title: "Service ends — recessional",
    who: "All",
  },
  {
    time: "+1 hour",
    title: "Pallbearers move casket / urn (if applicable)",
    who: "Pallbearers + funeral director",
  },
  {
    time: "+1.25 hour",
    title: "Procession to cemetery (if burial)",
    who: "Family + funeral home cars",
  },
  {
    time: "+1.75 hour",
    title: "Graveside committal",
    who: "Officiant + family",
  },
  {
    time: "+2.5 hours",
    title: "Reception begins",
    who: "All",
  },
];

export function Timeline() {
  const [state, setState] = useState<TimelineState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TimelineState;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount; state can't be read during SSR-safe render
        setState({ ...DEFAULT, ...parsed });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  function update<K extends keyof TimelineState>(
    key: K,
    value: TimelineState[K],
  ) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function loadDefaults() {
    setState((prev) => ({
      ...prev,
      events: DEFAULT_EVENTS.map((e, i) => ({
        ...e,
        id: `${Date.now()}-${i}`,
        done: false,
      })),
    }));
  }

  function addEvent() {
    setState((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          time: "",
          title: "",
          who: "",
          done: false,
        },
      ],
    }));
  }

  function updateEvent(id: string, patch: Partial<TimelineEvent>) {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === id ? { ...e, ...patch } : e,
      ),
    }));
  }

  function removeEvent(id: string) {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  }

  function toggleDone(id: string) {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === id ? { ...e, done: !e.done } : e,
      ),
    }));
  }

  function reset() {
    if (!confirm("Clear the timeline and start over?")) return;
    setState(DEFAULT);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const doneCount = state.events.filter((e) => e.done).length;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/dashboard" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6 no-print">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Service-day timeline
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The day, hour by hour.
            </h1>
            <p className="text-lg text-ink-soft">
              A printable timeline for the service day. Helps everyone
              know where to be and when &mdash; out-of-town family,
              pallbearers, the officiant, the caterer.
            </p>
            {hydrated && state.events.length > 0 && (
              <p className="mt-4 text-sm text-ink-muted">
                {doneCount} of {state.events.length} confirmed
              </p>
            )}
          </div>

          <Card>
            <CardEyebrow>The basics</CardEyebrow>
            <div className="space-y-4 mt-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="serviceDate">Service date</Label>
                  <Input
                    id="serviceDate"
                    value={state.serviceDate}
                    onChange={(e) => update("serviceDate", e.target.value)}
                    placeholder="Saturday, May 11"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceTime">Service start time</Label>
                  <Input
                    id="serviceTime"
                    value={state.serviceTime}
                    onChange={(e) => update("serviceTime", e.target.value)}
                    placeholder="2:00 PM"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="serviceLocation">Where the service is</Label>
                <Input
                  id="serviceLocation"
                  value={state.serviceLocation}
                  onChange={(e) =>
                    update("serviceLocation", e.target.value)
                  }
                  placeholder="St. Mark's Lutheran Church"
                />
              </div>
              <div>
                <Label htmlFor="receptionLocation">
                  Reception location (optional)
                </Label>
                <Input
                  id="receptionLocation"
                  value={state.receptionLocation}
                  onChange={(e) =>
                    update("receptionLocation", e.target.value)
                  }
                  placeholder="Church fellowship hall"
                />
              </div>
              <div>
                <Label htmlFor="burialLocation">
                  Burial / cemetery location (if applicable)
                </Label>
                <Input
                  id="burialLocation"
                  value={state.burialLocation}
                  onChange={(e) =>
                    update("burialLocation", e.target.value)
                  }
                  placeholder="Greenwood Cemetery"
                />
              </div>
            </div>
          </Card>

          {hydrated && state.events.length === 0 && (
            <Card tone="primary">
              <CardEyebrow>Start with a default timeline</CardEyebrow>
              <CardTitle>Most services follow this rough shape.</CardTitle>
              <p className="text-ink-soft mt-3 mb-4">
                Eight default events anchored to your service start
                time. Edit, remove, or add as your day unfolds.
              </p>
              <Button onClick={loadDefaults}>Load default timeline →</Button>
            </Card>
          )}

          {hydrated && state.events.length > 0 && (
            <Card>
              <CardTitle>Your timeline</CardTitle>
              <ul className="mt-4 space-y-2">
                {state.events.map((e) => (
                  <li key={e.id}>
                    <div
                      className={`rounded-xl border p-4 ${
                        e.done
                          ? "bg-good-soft border-good/30"
                          : "bg-surface border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleDone(e.id)}
                          aria-label={e.done ? "Mark not done" : "Mark done"}
                          className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${
                            e.done
                              ? "bg-good border-good text-white"
                              : "bg-surface border-border hover:border-primary"
                          }`}
                        >
                          {e.done ? "✓" : ""}
                        </button>
                        <div className="flex-1 min-w-0 grid sm:grid-cols-[120px_1fr] gap-2">
                          <Input
                            value={e.time}
                            onChange={(ev) =>
                              updateEvent(e.id, { time: ev.target.value })
                            }
                            placeholder="2:00 PM"
                            className="text-sm"
                          />
                          <Input
                            value={e.title}
                            onChange={(ev) =>
                              updateEvent(e.id, { title: ev.target.value })
                            }
                            placeholder="What happens"
                            className="text-sm"
                          />
                          <Input
                            value={e.who}
                            onChange={(ev) =>
                              updateEvent(e.id, { who: ev.target.value })
                            }
                            placeholder="Who's there"
                            className="text-sm sm:col-span-2"
                          />
                        </div>
                        <button
                          onClick={() => removeEvent(e.id)}
                          className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline shrink-0"
                          aria-label="Remove event"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={addEvent}>
                  + Add another event
                </Button>
              </div>
            </Card>
          )}

          {hydrated && state.events.length > 0 && (
            <Card tone="primary">
              <CardTitle>Print and share</CardTitle>
              <p className="text-ink-soft mt-3 mb-4">
                Print the timeline below and email it to the people who
                need it: officiant, pallbearers, caterer, photographer,
                out-of-town family.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => window.print()}>
                  Print preview →
                </Button>
                <Button variant="ghost" onClick={reset}>
                  Start over
                </Button>
              </div>
            </Card>
          )}

          <p className="text-xs text-ink-muted">
            Saved on this device only.
          </p>

          <HelpFooter />
        </div>

        {/* Print preview */}
        <div className="max-w-2xl mx-auto px-5 pb-12">
          <TimelinePreview state={state} />
        </div>
      </section>
    </main>
  );
}

function TimelinePreview({ state }: { state: TimelineState }) {
  const has = (s: string) => s && s.trim().length > 0;
  const anyEvents = state.events.length > 0;

  if (!anyEvents) {
    return (
      <Card tone="soft" className="no-print">
        <p className="text-sm text-ink-soft text-center italic">
          Your printable timeline will appear here once you add events.
        </p>
      </Card>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-surface p-8 print:border-0 print:shadow-none print:p-12">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-ink-muted mb-2">
          Service-day timeline
        </p>
        <h2 className="font-serif text-2xl text-ink">
          {has(state.serviceDate) ? state.serviceDate : "[Service date]"}
        </h2>
        {has(state.serviceLocation) && (
          <p className="text-base text-ink-soft mt-1">
            {state.serviceLocation}
          </p>
        )}
      </div>

      <ol className="space-y-3">
        {state.events.map((e) => (
          <li
            key={e.id}
            className={`rounded-xl border px-4 py-3 ${
              e.done ? "border-good/30 bg-good-soft/40" : "border-border"
            }`}
          >
            <div className="grid sm:grid-cols-[120px_1fr] gap-3">
              <div className="text-sm font-medium text-primary-deep uppercase tracking-wider">
                {e.time || "—"}
              </div>
              <div>
                <div className="text-base text-ink">
                  {e.title || "[Event]"}
                </div>
                {has(e.who) && (
                  <div className="text-sm text-ink-soft mt-0.5">
                    {e.who}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {(has(state.receptionLocation) || has(state.burialLocation)) && (
        <div className="mt-8 pt-6 border-t border-border space-y-1.5 text-sm text-ink-soft">
          {has(state.burialLocation) && (
            <p>
              <strong className="text-ink">Burial:</strong>{" "}
              {state.burialLocation}
            </p>
          )}
          {has(state.receptionLocation) && (
            <p>
              <strong className="text-ink">Reception:</strong>{" "}
              {state.receptionLocation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
