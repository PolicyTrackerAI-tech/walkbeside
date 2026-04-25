"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Cheatsheet } from "@/components/Cheatsheet";
import { LINE_ITEMS, fmtRange, adjustedRange } from "@/lib/pricing-data";
import {
  FIVE_QUESTIONS,
  DECLINE_SCRIPTS,
  POST_SIGNING_NEGOTIABLE,
} from "@/lib/scenarios";

/**
 * Screen 9 — Arrangement meeting prep kit.
 * The sister's knowledge as a product. Printable cheat sheet.
 */
export default function PrepPage() {
  const [zip, setZip] = useState("");

  function print() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={<BackLink defaultHref="/dashboard" defaultLabel="Dashboard" />}
        className="no-print"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div className="no-print">
            <CardEyebrow>Arrangement meeting prep kit</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink mb-3">
              The cheat sheet you bring to the meeting.
            </h1>
            <p className="text-ink-soft">
              You walk in with this; the meeting goes differently. Below is
              everything explained, plus a one-page version you can print.
            </p>
          </div>

          <Card className="no-print">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="zip" hint="Adjusts the price ranges below.">
                  Your zip code
                </Label>
                <Input
                  id="zip"
                  inputMode="numeric"
                  maxLength={5}
                  value={zip}
                  onChange={(e) =>
                    setZip(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>
              <Button onClick={print} disabled={!zip}>
                Print cheat sheet
              </Button>
            </div>
            {!zip && (
              <p className="text-xs text-ink-muted mt-3">
                Enter your zip first so the cheat sheet is calibrated to your
                area.
              </p>
            )}
          </Card>

          <Cheatsheet zip={zip} />

          <div className="no-print space-y-6">
            <Card tone="primary">
              <CardTitle>The one question that changes everything</CardTitle>
              <p className="font-serif text-2xl italic text-primary-deep mb-3">
                &ldquo;Can I see your itemized General Price List before we begin?&rdquo;
              </p>
              <p className="text-ink-soft">
                This is your right under the FTC Funeral Rule. Asking it tells
                the funeral director you know your rights. From that moment
                forward, the prices they quote you will be more honest.
              </p>
            </Card>

            <Card>
              <CardTitle>What you&rsquo;ll be shown vs. what&rsquo;s required</CardTitle>
              <ul className="space-y-3 text-[15px]">
                {LINE_ITEMS.map((it) => {
                  const [lo, hi] = adjustedRange(it.fairLow, it.fairHigh, zip);
                  return (
                    <li
                      key={it.id}
                      className="border-b border-border last:border-b-0 pb-3 last:pb-0"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <strong className="text-ink">{it.name}</strong>
                        <span className="text-ink-soft text-sm">
                          {fmtRange(lo, hi)}
                        </span>
                      </div>
                      <p className="text-ink-soft text-sm mt-1">{it.notes}</p>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card tone="soft">
              <CardTitle>Five questions to ask any funeral home</CardTitle>
              <ol className="space-y-3 list-decimal list-inside">
                {FIVE_QUESTIONS.map((q) => (
                  <li key={q.q} className="text-ink">
                    <span className="font-medium">{q.q}</span>
                    <p className="text-sm text-ink-soft pl-6 mt-1">{q.why}</p>
                  </li>
                ))}
              </ol>
            </Card>

            <Card>
              <CardTitle>Scripts for declining upsells</CardTitle>
              <p className="text-ink-soft text-sm mb-4">
                Read these aloud. They&rsquo;re polite, firm, and don&rsquo;t require you
                to explain yourself.
              </p>
              <ul className="space-y-3 text-[15px]">
                {DECLINE_SCRIPTS.map((s) => (
                  <li key={s.upsell}>
                    <strong className="text-ink">{s.upsell}</strong>
                    <p className="text-ink-soft italic mt-1">
                      &ldquo;{s.script}&rdquo;
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card tone="warn">
              <CardTitle>What&rsquo;s still negotiable after you sign</CardTitle>
              <ul className="space-y-3 text-[15px]">
                {POST_SIGNING_NEGOTIABLE.map((n) => (
                  <li key={n.item}>
                    <strong className="text-ink">{n.item}</strong>
                    <p className="text-ink-soft text-sm mt-1">{n.how}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
