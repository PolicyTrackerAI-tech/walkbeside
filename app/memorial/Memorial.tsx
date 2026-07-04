"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { HelpFooter } from "@/components/HelpFooter";

const STORAGE_KEY = "honestfuneral.memorial.v1";

interface MemorialProgram {
  fullName: string;
  birthDate: string;
  deathDate: string;
  serviceDate: string;
  serviceTime: string;
  serviceLocation: string;
  officiant: string;
  processionalMusic: string;
  openingWords: string;
  readings: string;
  speakers: string;
  hymnsSongs: string;
  closingWords: string;
  recessionalMusic: string;
  burialDetails: string;
  receptionDetails: string;
  familyThanks: string;
  donationsTo: string;
}

const DEFAULT: MemorialProgram = {
  fullName: "",
  birthDate: "",
  deathDate: "",
  serviceDate: "",
  serviceTime: "",
  serviceLocation: "",
  officiant: "",
  processionalMusic: "",
  openingWords: "",
  readings: "",
  speakers: "",
  hymnsSongs: "",
  closingWords: "",
  recessionalMusic: "",
  burialDetails: "",
  receptionDetails: "",
  familyThanks: "",
  donationsTo: "",
};

export function Memorial() {
  const [data, setData] = useState<MemorialProgram>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MemorialProgram;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only hydration from localStorage, which can't be read during SSR-safe render
        setData({ ...DEFAULT, ...parsed });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data, hydrated]);

  function update<K extends keyof MemorialProgram>(
    key: K,
    value: MemorialProgram[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    if (!confirm("Clear the entire program and start over?")) return;
    setData(DEFAULT);
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
              Memorial program helper
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Build the service program.
            </h1>
            <p className="text-lg text-ink-soft">
              Fill in what you know. Skip what you haven&rsquo;t
              decided. The program below updates as you type. Print it
              when you&rsquo;re ready &mdash; many funeral homes will
              fold and stack it for free.
            </p>
          </div>

          <Card>
            <CardEyebrow>The basics</CardEyebrow>
            <div className="space-y-4 mt-3">
              <div>
                <Label htmlFor="fullName">Full name (as it should appear)</Label>
                <Input
                  id="fullName"
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Margaret Ann Whitfield"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="birthDate">Date of birth</Label>
                  <Input
                    id="birthDate"
                    value={data.birthDate}
                    onChange={(e) => update("birthDate", e.target.value)}
                    placeholder="May 14, 1947"
                  />
                </div>
                <div>
                  <Label htmlFor="deathDate">Date of death</Label>
                  <Input
                    id="deathDate"
                    value={data.deathDate}
                    onChange={(e) => update("deathDate", e.target.value)}
                    placeholder="April 28, 2026"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Service details</CardEyebrow>
            <div className="space-y-4 mt-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="serviceDate">Service date</Label>
                  <Input
                    id="serviceDate"
                    value={data.serviceDate}
                    onChange={(e) => update("serviceDate", e.target.value)}
                    placeholder="Saturday, May 11"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceTime">Time</Label>
                  <Input
                    id="serviceTime"
                    value={data.serviceTime}
                    onChange={(e) => update("serviceTime", e.target.value)}
                    placeholder="2:00 PM"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="serviceLocation">Where</Label>
                <Input
                  id="serviceLocation"
                  value={data.serviceLocation}
                  onChange={(e) => update("serviceLocation", e.target.value)}
                  placeholder="St. Mark's Lutheran Church · 412 Oak Street"
                />
              </div>
              <div>
                <Label htmlFor="officiant">Officiant / leader</Label>
                <Input
                  id="officiant"
                  value={data.officiant}
                  onChange={(e) => update("officiant", e.target.value)}
                  placeholder="Pastor Tom Reilly"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Order of service</CardEyebrow>
            <p className="text-sm text-ink-soft mt-1 mb-4">
              Use multiple lines for each section. Anything you skip
              just won&rsquo;t appear on the program.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="processionalMusic">Processional music</Label>
                <Input
                  id="processionalMusic"
                  value={data.processionalMusic}
                  onChange={(e) =>
                    update("processionalMusic", e.target.value)
                  }
                  placeholder="Ave Maria — Schubert"
                />
              </div>
              <div>
                <Label htmlFor="openingWords">
                  Opening words / welcome
                </Label>
                <Textarea
                  id="openingWords"
                  rows={2}
                  value={data.openingWords}
                  onChange={(e) => update("openingWords", e.target.value)}
                  placeholder="A few sentences from the officiant"
                />
              </div>
              <div>
                <Label htmlFor="readings">Readings</Label>
                <Textarea
                  id="readings"
                  rows={3}
                  value={data.readings}
                  onChange={(e) => update("readings", e.target.value)}
                  placeholder="Psalm 23 — read by Sarah Whitfield&#10;Mary Oliver, &lsquo;In Blackwater Woods&rsquo; — read by Tom Reilly"
                />
              </div>
              <div>
                <Label htmlFor="speakers">Speakers / eulogy</Label>
                <Textarea
                  id="speakers"
                  rows={2}
                  value={data.speakers}
                  onChange={(e) => update("speakers", e.target.value)}
                  placeholder="Sarah Whitfield — daughter&#10;James Whitfield — son"
                />
              </div>
              <div>
                <Label htmlFor="hymnsSongs">Hymns / songs</Label>
                <Textarea
                  id="hymnsSongs"
                  rows={2}
                  value={data.hymnsSongs}
                  onChange={(e) => update("hymnsSongs", e.target.value)}
                  placeholder="Amazing Grace — congregation&#10;What a Wonderful World — recorded"
                />
              </div>
              <div>
                <Label htmlFor="closingWords">Closing words / blessing</Label>
                <Textarea
                  id="closingWords"
                  rows={2}
                  value={data.closingWords}
                  onChange={(e) => update("closingWords", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="recessionalMusic">Recessional music</Label>
                <Input
                  id="recessionalMusic"
                  value={data.recessionalMusic}
                  onChange={(e) =>
                    update("recessionalMusic", e.target.value)
                  }
                  placeholder="What a Wonderful World — Louis Armstrong"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardEyebrow>After the service</CardEyebrow>
            <div className="space-y-4 mt-3">
              <div>
                <Label htmlFor="burialDetails">Burial / committal</Label>
                <Textarea
                  id="burialDetails"
                  rows={2}
                  value={data.burialDetails}
                  onChange={(e) => update("burialDetails", e.target.value)}
                  placeholder="Private burial to follow at Greenwood Cemetery"
                />
              </div>
              <div>
                <Label htmlFor="receptionDetails">Reception</Label>
                <Textarea
                  id="receptionDetails"
                  rows={2}
                  value={data.receptionDetails}
                  onChange={(e) => update("receptionDetails", e.target.value)}
                  placeholder="All are welcome at a reception in the church hall immediately following the service"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Closing</CardEyebrow>
            <div className="space-y-4 mt-3">
              <div>
                <Label htmlFor="familyThanks">Family thank-you</Label>
                <Textarea
                  id="familyThanks"
                  rows={3}
                  value={data.familyThanks}
                  onChange={(e) => update("familyThanks", e.target.value)}
                  placeholder="The family of Margaret Whitfield thanks you for being here today and for the love and care you've shown us."
                />
              </div>
              <div>
                <Label htmlFor="donationsTo">In lieu of flowers</Label>
                <Input
                  id="donationsTo"
                  value={data.donationsTo}
                  onChange={(e) => update("donationsTo", e.target.value)}
                  placeholder="Donations to the American Cancer Society"
                />
              </div>
            </div>
          </Card>

          <Card tone="primary">
            <CardTitle>Print the program</CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              The program previews below. Use your browser&rsquo;s print
              dialog to print on letter paper, or save as PDF and email
              to the funeral home for them to print and fold.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => window.print()}>Print preview →</Button>
              <Button variant="ghost" onClick={reset}>
                Start over
              </Button>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            Saved on this device only. Refresh anytime — your work
            stays.
          </p>

          <HelpFooter />
        </div>

        {/* Print preview / live preview area */}
        <div className="max-w-2xl mx-auto px-5 pb-12">
          <ProgramPreview data={data} />
        </div>
      </section>
    </main>
  );
}

function ProgramPreview({ data }: { data: MemorialProgram }) {
  const has = (s: string) => s && s.trim().length > 0;
  const anything =
    has(data.fullName) ||
    has(data.serviceDate) ||
    has(data.processionalMusic) ||
    has(data.openingWords) ||
    has(data.readings) ||
    has(data.speakers) ||
    has(data.hymnsSongs);

  if (!anything) {
    return (
      <Card tone="soft" className="no-print">
        <p className="text-sm text-ink-soft text-center italic">
          Your program preview will appear here as you fill in the
          form above.
        </p>
      </Card>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-surface p-8 print:border-0 print:shadow-none print:p-12">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-ink-muted mb-3">
          In loving memory of
        </p>
        <h2 className="font-serif text-4xl text-ink leading-tight">
          {data.fullName || "[Full name]"}
        </h2>
        {(has(data.birthDate) || has(data.deathDate)) && (
          <p className="text-base text-ink-soft mt-2">
            {data.birthDate || "[Born]"} &nbsp;&mdash;&nbsp;{" "}
            {data.deathDate || "[Died]"}
          </p>
        )}
      </div>

      {(has(data.serviceDate) ||
        has(data.serviceTime) ||
        has(data.serviceLocation)) && (
        <div className="mt-8 text-center">
          <p className="text-base text-ink">
            {[data.serviceDate, data.serviceTime]
              .filter((v) => has(v))
              .join(" · ")}
          </p>
          {has(data.serviceLocation) && (
            <p className="text-base text-ink-soft mt-1">
              {data.serviceLocation}
            </p>
          )}
          {has(data.officiant) && (
            <p className="text-sm text-ink-muted mt-1 italic">
              Officiant: {data.officiant}
            </p>
          )}
        </div>
      )}

      <div className="my-8 border-t border-border" />

      <div className="space-y-5">
        <ProgramSection title="Processional" body={data.processionalMusic} />
        <ProgramSection title="Welcome" body={data.openingWords} />
        <ProgramSection title="Readings" body={data.readings} />
        <ProgramSection title="Eulogy & remembrances" body={data.speakers} />
        <ProgramSection title="Hymns & songs" body={data.hymnsSongs} />
        <ProgramSection title="Closing words" body={data.closingWords} />
        <ProgramSection title="Recessional" body={data.recessionalMusic} />
      </div>

      {(has(data.burialDetails) || has(data.receptionDetails)) && (
        <>
          <div className="my-8 border-t border-border" />
          <div className="space-y-5">
            <ProgramSection
              title="Burial"
              body={data.burialDetails}
            />
            <ProgramSection
              title="Reception"
              body={data.receptionDetails}
            />
          </div>
        </>
      )}

      {(has(data.familyThanks) || has(data.donationsTo)) && (
        <>
          <div className="my-8 border-t border-border" />
          <div className="text-center space-y-3">
            {has(data.familyThanks) && (
              <p className="text-ink-soft italic font-serif">
                {data.familyThanks}
              </p>
            )}
            {has(data.donationsTo) && (
              <p className="text-sm text-ink">
                <strong>In lieu of flowers:</strong> {data.donationsTo}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ProgramSection({ title, body }: { title: string; body: string }) {
  if (!body || !body.trim()) return null;
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">
        {title}
      </p>
      <p className="text-ink whitespace-pre-line leading-relaxed">{body}</p>
    </div>
  );
}
