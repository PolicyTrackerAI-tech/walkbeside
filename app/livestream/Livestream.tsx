"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { HelpFooter } from "@/components/HelpFooter";

const STORAGE_KEY = "honestfuneral.livestream.v1";

interface LivestreamPlan {
  platform: string;
  url: string;
  meetingId: string;
  password: string;
  dialInNumber: string;
  serviceName: string;
  serviceDate: string;
  serviceTime: string;
  hostName: string;
  hostPhone: string;
  techHelper: string;
  notes: string;
}

const DEFAULT: LivestreamPlan = {
  platform: "",
  url: "",
  meetingId: "",
  password: "",
  dialInNumber: "",
  serviceName: "",
  serviceDate: "",
  serviceTime: "",
  hostName: "",
  hostPhone: "",
  techHelper: "",
  notes: "",
};

export function Livestream() {
  const [plan, setPlan] = useState<LivestreamPlan>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPlan({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // ignore
    }
  }, [plan, hydrated]);

  function update<K extends keyof LivestreamPlan>(
    key: K,
    value: LivestreamPlan[K],
  ) {
    setPlan((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    if (!confirm("Clear the live-stream plan and start over?")) return;
    setPlan(DEFAULT);
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
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6 no-print">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Live-stream coordinator
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              For everyone who can&rsquo;t be there.
            </h1>
            <p className="text-lg text-ink-soft">
              Most services live-stream now, and most families lose the
              link by Tuesday morning. This builds a single shareable
              card with platform, URL, dial-in, password, and host
              contact &mdash; print it and email it once, before the
              day-of chaos starts.
            </p>
          </div>

          <Card>
            <CardEyebrow>Step 1 — service details</CardEyebrow>
            <div className="space-y-4 mt-3">
              <div>
                <Label htmlFor="serviceName">Whose service</Label>
                <Input
                  id="serviceName"
                  value={plan.serviceName}
                  onChange={(e) => update("serviceName", e.target.value)}
                  placeholder="Margaret Whitfield"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="serviceDate">Date</Label>
                  <Input
                    id="serviceDate"
                    value={plan.serviceDate}
                    onChange={(e) => update("serviceDate", e.target.value)}
                    placeholder="Saturday, May 11"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceTime">
                    Service start time (with timezone)
                  </Label>
                  <Input
                    id="serviceTime"
                    value={plan.serviceTime}
                    onChange={(e) => update("serviceTime", e.target.value)}
                    placeholder="2:00 PM ET"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Step 2 — the stream</CardEyebrow>
            <div className="space-y-4 mt-3">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  value={plan.platform}
                  onChange={(e) => update("platform", e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base"
                >
                  <option value="">Pick one…</option>
                  <option>Zoom</option>
                  <option>Google Meet</option>
                  <option>YouTube Live</option>
                  <option>Facebook Live</option>
                  <option>Funeral home&rsquo;s own platform</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="url">Stream URL (full link)</Label>
                <Input
                  id="url"
                  type="url"
                  value={plan.url}
                  onChange={(e) => update("url", e.target.value)}
                  placeholder="https://us02web.zoom.us/j/12345678901"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="meetingId">
                    Meeting ID (if applicable)
                  </Label>
                  <Input
                    id="meetingId"
                    value={plan.meetingId}
                    onChange={(e) => update("meetingId", e.target.value)}
                    placeholder="123 4567 8901"
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Password (if applicable)
                  </Label>
                  <Input
                    id="password"
                    value={plan.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="margaret"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dialIn">Phone dial-in (Zoom/Meet)</Label>
                <Input
                  id="dialIn"
                  value={plan.dialInNumber}
                  onChange={(e) => update("dialInNumber", e.target.value)}
                  placeholder="+1 646 558 8656 (Zoom NY)"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Step 3 — who&rsquo;s in charge</CardEyebrow>
            <p className="text-sm text-ink-soft mt-1 mb-4">
              Don&rsquo;t put the immediate family on tech duty. Pick
              someone less close to the loss.
            </p>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hostName">Stream host name</Label>
                  <Input
                    id="hostName"
                    value={plan.hostName}
                    onChange={(e) => update("hostName", e.target.value)}
                    placeholder="Aunt Susan"
                  />
                </div>
                <div>
                  <Label htmlFor="hostPhone">Host&rsquo;s cell</Label>
                  <Input
                    id="hostPhone"
                    type="tel"
                    value={plan.hostPhone}
                    onChange={(e) => update("hostPhone", e.target.value)}
                    placeholder="(555) 555-1234"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="techHelper">
                  Tech helper (if different)
                </Label>
                <Input
                  id="techHelper"
                  value={plan.techHelper}
                  onChange={(e) => update("techHelper", e.target.value)}
                  placeholder="Cousin Mike — handles the laptop, mic, and unmuting attendees"
                />
              </div>
              <div>
                <Label htmlFor="notes">
                  Anything else attendees should know
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={plan.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="e.g. We'll mute all attendees during the eulogy. Open mic during reception. Recording will be available for 30 days."
                />
              </div>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>Tips for whoever is running it</CardEyebrow>
            <ul className="space-y-2.5 mt-3 text-ink-soft">
              <Bullet>
                <strong>Test the day before</strong>, at the venue, with
                the actual laptop and microphone you&rsquo;ll use. Half
                the time it&rsquo;s a Wi-Fi or audio problem you
                can&rsquo;t solve at 2pm Saturday.
              </Bullet>
              <Bullet>
                <strong>Use a wired mic if possible.</strong> Built-in
                laptop mics pick up everything &mdash; HVAC, footsteps,
                people whispering. A $30 lavalier or a venue&rsquo;s
                podium mic is worth it.
              </Bullet>
              <Bullet>
                <strong>Mute attendees by default.</strong> Otherwise
                someone&rsquo;s dog or doorbell ends up in the eulogy.
              </Bullet>
              <Bullet>
                <strong>Record</strong> if your platform supports it.
                Family members who couldn&rsquo;t make it will ask for
                it. Keep available for at least 30 days.
              </Bullet>
              <Bullet>
                <strong>One person, one job.</strong> The host runs the
                tech. They are not also a pallbearer or a speaker.
              </Bullet>
              <Bullet>
                <strong>If your venue has WiFi issues</strong>, hotspot
                from a phone with a strong cell signal. Test before the
                service.
              </Bullet>
            </ul>
          </Card>

          <Card tone="primary">
            <CardTitle>Print and share</CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              Print the card below or email to remote family members
              the day before.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => window.print()}>Print preview →</Button>
              <Button variant="ghost" onClick={reset}>
                Start over
              </Button>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            Saved on this device only.
          </p>

          <HelpFooter />
        </div>

        {/* Print preview */}
        <div className="max-w-2xl mx-auto px-5 pb-12">
          <SharePreview plan={plan} />
        </div>
      </section>
    </main>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-primary-deep mt-1" aria-hidden>
        •
      </span>
      <span>{children}</span>
    </li>
  );
}

function SharePreview({ plan }: { plan: LivestreamPlan }) {
  const has = (s: string) => s && s.trim().length > 0;
  const anyRequired =
    has(plan.serviceName) || has(plan.url) || has(plan.platform);
  if (!anyRequired) {
    return (
      <Card tone="soft" className="no-print">
        <p className="text-sm text-ink-soft text-center italic">
          Your shareable card will appear here as you fill in the
          form above.
        </p>
      </Card>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-surface p-8 print:border-0 print:shadow-none print:p-12">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-ink-muted mb-2">
          Live stream
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-ink leading-tight">
          Service for{" "}
          {plan.serviceName || "[Name]"}
        </h2>
        {(has(plan.serviceDate) || has(plan.serviceTime)) && (
          <p className="text-base text-ink-soft mt-1">
            {[plan.serviceDate, plan.serviceTime]
              .filter((v) => has(v))
              .join(" · ")}
          </p>
        )}
      </div>

      <div className="my-7 border-t border-border" />

      <div className="space-y-5">
        {has(plan.platform) && (
          <Field label="Platform" value={plan.platform} />
        )}
        {has(plan.url) && (
          <Field label="Direct link" value={plan.url} mono break />
        )}
        {(has(plan.meetingId) || has(plan.password)) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {has(plan.meetingId) && (
              <Field label="Meeting ID" value={plan.meetingId} mono />
            )}
            {has(plan.password) && (
              <Field label="Password" value={plan.password} mono />
            )}
          </div>
        )}
        {has(plan.dialInNumber) && (
          <Field label="Dial-in" value={plan.dialInNumber} mono />
        )}
      </div>

      {(has(plan.hostName) || has(plan.hostPhone)) && (
        <>
          <div className="my-7 border-t border-border" />
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">
              If something goes wrong
            </p>
            <p className="text-base text-ink">
              {plan.hostName || "[Host]"}
              {has(plan.hostPhone) && ` · ${plan.hostPhone}`}
            </p>
          </div>
        </>
      )}

      {has(plan.notes) && (
        <>
          <div className="my-7 border-t border-border" />
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-2">
              Note
            </p>
            <p className="text-ink-soft whitespace-pre-line leading-relaxed">
              {plan.notes}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  break: br,
}: {
  label: string;
  value: string;
  mono?: boolean;
  break?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">
        {label}
      </p>
      <p
        className={`text-ink ${mono ? "font-mono" : ""} ${br ? "break-all" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
