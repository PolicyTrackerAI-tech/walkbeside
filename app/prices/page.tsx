"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import {
  LINE_ITEMS,
  SERVICE_TOTALS,
  SERVICE_LABELS,
  fmtRange,
  adjustedRange,
  fmtUSD,
  type LineItem,
  type ServiceType,
} from "@/lib/pricing-data";
import { FIVE_QUESTIONS } from "@/lib/scenarios";

type Mode = "no-quote" | "has-quote";

const REQUIRED_LABEL: Record<LineItem["required"], string> = {
  yes: "Required",
  no: "Optional",
  burial: "Required for burial",
  cemetery: "Cemetery requires",
  cremation: "Required for cremation",
};

export default function PricesPage() {
  const [mode, setMode] = useState<Mode>("no-quote");
  const [zip, setZip] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("traditional-burial");
  const [quotedHome, setQuotedHome] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totals = SERVICE_TOTALS.find((t) => t.type === serviceType)!;
  const [low, high] = adjustedRange(totals.fairLow, totals.fairHigh, zip);

  const quotedNum = Number(quotedPrice.replace(/[^0-9.]/g, ""));
  const dealRating =
    mode === "has-quote"
      ? computeOverall(quotedNum, low, high, totals.predatoryHigh)
      : null;

  const lineItems = LINE_ITEMS.filter((li) => li.categories.includes(serviceType));

  const canSubmit =
    mode === "no-quote"
      ? zip.length === 5
      : zip.length === 5 && quotedHome.trim().length > 0 && quotedNum > 0;

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-surface/70">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Brand />
          <Link
            href="/where"
            className="text-sm text-ink-muted hover:text-ink-soft"
          >
            ← Back
          </Link>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
              See what you should expect to pay.
            </h1>
            <p className="text-lg text-ink-soft">
              Three minutes here can save thousands. No account, no email.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="How can we help?"
            className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface-soft p-1"
          >
            <ModeTab
              active={mode === "no-quote"}
              onClick={() => {
                setMode("no-quote");
                setSubmitted(false);
              }}
              title="I’m just looking"
              sub="No quote in hand yet"
            />
            <ModeTab
              active={mode === "has-quote"}
              onClick={() => {
                setMode("has-quote");
                setSubmitted(false);
              }}
              title="I have a quote"
              sub="Is this price fair?"
            />
          </div>

          <Card>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="zip" hint="Used only to adjust the numbers for your region. Never saved.">
                  Your zip code
                </Label>
                <Input
                  id="zip"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="44106"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div>
                <Label htmlFor="svc" hint="Pick the closest match.">
                  Type of service
                </Label>
                <Select
                  id="svc"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                >
                  {SERVICE_TOTALS.map((s) => (
                    <option key={s.type} value={s.type}>
                      {SERVICE_LABELS[s.type]}
                    </option>
                  ))}
                </Select>
              </div>
              {mode === "has-quote" && (
                <>
                  <div>
                    <Label htmlFor="home" hint="Whoever quoted you. Stays on your device.">
                      Funeral home name
                    </Label>
                    <Input
                      id="home"
                      placeholder="e.g. Smith & Sons"
                      value={quotedHome}
                      onChange={(e) => setQuotedHome(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quote" hint="The all-in total they gave you.">
                      Price they quoted (USD)
                    </Label>
                    <Input
                      id="quote"
                      inputMode="decimal"
                      placeholder="9500"
                      value={quotedPrice}
                      onChange={(e) => setQuotedPrice(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm text-ink-soft space-y-1">
              <p className="text-ink font-medium">
                What happens when you submit:
              </p>
              <ul className="space-y-0.5">
                <li>
                  &bull; You&rsquo;ll see a fair-price range for your zip code.
                </li>
                {mode === "has-quote" && (
                  <li>
                    &bull; You&rsquo;ll see a rating for the quote you
                    entered.
                  </li>
                )}
                <li>
                  &bull; No one gets contacted. No sales calls. Nothing gets
                  emailed.
                </li>
                <li>
                  &bull; Nothing is saved unless you choose to save it.
                </li>
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => setSubmitted(true)} disabled={!canSubmit}>
                {mode === "no-quote" ? "Show me fair prices" : "Rate this quote"}
              </Button>
              {submitted && (
                <span className="text-sm text-ink-muted self-center">
                  Updated for {zip}.
                </span>
              )}
            </div>
          </Card>

          {submitted && (
            <>
              <p className="text-sm text-ink-muted italic">
                This is just between us. We didn&rsquo;t email anyone, we
                didn&rsquo;t contact the funeral home, and we didn&rsquo;t save
                your information unless you asked us to.
              </p>

              <Card tone="primary">
                <CardEyebrow>Fair total range for your area</CardEyebrow>
                <h2 className="font-serif text-3xl text-primary-deep mb-2">
                  {fmtRange(low, high)}
                </h2>
                <p className="text-ink-soft">
                  This is what most families pay for a{" "}
                  {SERVICE_LABELS[serviceType].toLowerCase()} in your area. A
                  quote of {fmtUSD(totals.predatoryLow)}–
                  {fmtUSD(totals.predatoryHigh)} is what predatory pricing looks
                  like for this service type.
                </p>
              </Card>

              {mode === "has-quote" && dealRating && quotedNum > 0 && (
                <Card tone={dealRating.tone}>
                  <CardEyebrow>
                    {quotedHome} &mdash; how this quote compares
                  </CardEyebrow>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h2 className="font-serif text-3xl text-ink">
                      {fmtUSD(quotedNum)}
                    </h2>
                  </div>
                  <p className="text-ink-soft mt-2">{dealRating.message}</p>
                  <p className="text-xs text-ink-muted mt-3">
                    Regional ranges are based on aggregated General Price Lists
                    and public pricing data. A specific firm&rsquo;s actual
                    current prices can only be verified by their printed GPL.
                  </p>
                  {dealRating.tone !== "good" && (
                    <div className="mt-5">
                      <LinkButton
                        href={`/negotiate/start?zip=${encodeURIComponent(zip)}&svc=${encodeURIComponent(serviceType)}&home=${encodeURIComponent(quotedHome)}&q=${encodeURIComponent(String(quotedNum))}`}
                      >
                        Request comparison quotes on your behalf →
                      </LinkButton>
                      <p className="text-xs text-ink-muted mt-2">
                        We contact funeral homes as your authorized advocate.
                        Flat $249 only if you choose a home we present to you.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              <Card>
                <CardEyebrow>Line-by-line fair prices</CardEyebrow>
                <CardTitle>What each line on their price list should cost.</CardTitle>
                <p className="text-ink-soft mb-5 text-sm">
                  Ranges are adjusted for your zip. Required vs optional is
                  tagged &mdash; anything marked optional, you can decline.
                </p>
                <ul className="divide-y divide-border">
                  {lineItems.map((item) => {
                    const [lo, hi] = adjustedRange(item.fairLow, item.fairHigh, zip);
                    return (
                      <li key={item.id} className="py-4 flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-ink">
                              {item.name}
                            </span>
                            <RequiredPill value={item.required} />
                            {item.highMarkup && (
                              <span className="text-xs uppercase tracking-wide bg-warn-soft text-warn px-2 py-0.5 rounded-full">
                                High markup
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-ink-soft mt-1">
                            {item.notes}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-serif text-ink">
                            {fmtRange(lo, hi)}
                          </div>
                          <div className="text-xs text-ink-muted">
                            over {fmtUSD(item.predatoryAt)} = overpriced
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card tone="soft">
                <CardTitle>Five questions to ask any funeral home</CardTitle>
                <p className="text-ink-soft mb-4 text-sm">
                  The first one changes the entire conversation.
                </p>
                <ol className="space-y-3 list-decimal list-inside">
                  {FIVE_QUESTIONS.map((q, i) => (
                    <li key={i} className="text-ink">
                      <span className="font-medium">{q.q}</span>
                      <p className="text-sm text-ink-soft pl-6 mt-1">
                        {q.why}
                      </p>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card tone="soft">
                <CardEyebrow>Arrangement Kit &middot; $19 one-time</CardEyebrow>
                <CardTitle>
                  The printable cheat sheet, decline scripts, and GPL analyzer.
                </CardTitle>
                <p className="text-ink-soft mb-4">
                  You have the fair ranges above. The Kit is what you bring
                  into the meeting: one printable page, word-for-word scripts
                  for declining specific upsells, and the tool that reads a
                  funeral home&rsquo;s itemized price list and flags every line
                  above fair market.
                </p>
                <ul className="text-sm text-ink-soft space-y-1 mb-5 list-disc list-inside">
                  <li>Printable one-page cheat sheet for the arrangement meeting</li>
                  <li>Word-for-word scripts for declining specific upsells</li>
                  <li>GPL analyzer &mdash; upload their price list, get each line flagged</li>
                  <li>What&rsquo;s still negotiable even after signing</li>
                </ul>
                <LinkButton href="/prep" variant="primary">
                  Unlock the Arrangement Kit
                </LinkButton>
                <p className="text-xs text-ink-muted mt-3">
                  One-time $19. No subscription. Included free if you use our
                  advocate outreach.
                </p>
              </Card>

              <Card tone="primary">
                <CardTitle>Want us to do the calling for you?</CardTitle>
                <p className="text-ink-soft mb-4">
                  With your written authorization, we contact funeral homes in
                  your area as your advocate, request their itemized General
                  Price Lists, and return side-by-side comparisons. You review
                  the responses and choose. Flat $249 only if you select a home
                  we present to you &mdash; free otherwise.
                </p>
                <LinkButton
                  href={`/negotiate/start?zip=${encodeURIComponent(zip)}&svc=${encodeURIComponent(serviceType)}`}
                  size="lg"
                >
                  Start advocate outreach
                </LinkButton>
              </Card>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function ModeTab({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "bg-surface border border-border shadow-sm"
          : "hover:bg-surface/60"
      }`}
    >
      <div
        className={`font-medium ${active ? "text-primary-deep" : "text-ink-soft"}`}
      >
        {title}
      </div>
      <div className="text-xs text-ink-muted mt-0.5">{sub}</div>
    </button>
  );
}

function RequiredPill({ value }: { value: LineItem["required"] }) {
  const label = REQUIRED_LABEL[value];
  const isOptional = value === "no";
  const cls = isOptional
    ? "bg-good-soft text-primary-deep"
    : "bg-surface-soft text-ink-muted border border-border";
  return (
    <span
      className={`text-xs uppercase tracking-wide px-2 py-0.5 rounded-full ${cls}`}
    >
      {label}
    </span>
  );
}

function computeOverall(
  quoted: number,
  fairLow: number,
  fairHigh: number,
  predatoryHigh: number,
): { label: string; tone: "good" | "warn" | "bad"; message: string } {
  if (!quoted) {
    return {
      label: "—",
      tone: "warn",
      message: "Enter the price they quoted to see how it compares.",
    };
  }
  const median = Math.round((fairLow + fairHigh) / 2);
  const deltaPct = Math.round(((quoted - median) / median) * 100);

  if (quoted <= fairHigh) {
    const position = deltaPct <= 0 ? "within" : "in the upper portion of";
    return {
      label: `${fmtUSD(quoted)}`,
      tone: "good",
      message: `This quote is ${position} the regional fair range (${fmtUSD(fairLow)}–${fmtUSD(fairHigh)}). The regional median is ${fmtUSD(median)}. Ask for the itemized General Price List to verify each line.`,
    };
  }
  if (quoted <= (fairHigh + predatoryHigh) / 2) {
    return {
      label: `${fmtUSD(quoted)}`,
      tone: "warn",
      message: `This quote is approximately ${deltaPct}% above the regional median of ${fmtUSD(median)}. Regional fair range is ${fmtUSD(fairLow)}–${fmtUSD(fairHigh)}. You may want to request itemized prices from other firms for comparison.`,
    };
  }
  return {
    label: `${fmtUSD(quoted)}`,
    tone: "bad",
    message: `This quote is approximately ${deltaPct}% above the regional median of ${fmtUSD(median)}. Regional fair range is ${fmtUSD(fairLow)}–${fmtUSD(fairHigh)}. Comparing to other firms in your area is likely to materially change the price.`,
  };
}
