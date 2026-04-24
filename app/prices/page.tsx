"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand, Footer } from "@/components/Brand";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import {
  SERVICE_TOTALS,
  SERVICE_LABELS,
  fmtRange,
  adjustedRange,
  fmtUSD,
  type ServiceType,
} from "@/lib/pricing-data";
import { FIVE_QUESTIONS } from "@/lib/scenarios";

/**
 * Screen 4 — Fair price lookup.
 * Free tier. Family enters zip + (optional) the home + price they were quoted.
 * Returns fair range + deal rating + 5 questions + CTA into AI negotiation.
 */
export default function PricesPage() {
  const [zip, setZip] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("traditional-burial");
  const [quotedHome, setQuotedHome] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totals = SERVICE_TOTALS.find((t) => t.type === serviceType)!;
  const [low, high] = adjustedRange(totals.fairLow, totals.fairHigh, zip);

  const quotedNum = Number(quotedPrice.replace(/[^0-9.]/g, ""));
  const dealRating = computeOverall(quotedNum, low, high, totals.predatoryHigh);

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
              Three minutes here can save thousands. We don&rsquo;t collect anything
              we don&rsquo;t need.
            </p>
          </div>

          <Card>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="zip" hint="Used to adjust prices for your region.">
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
              <div>
                <Label htmlFor="home" hint="Optional. We&rsquo;ll rate their quote.">
                  Funeral home you&rsquo;re considering
                </Label>
                <Input
                  id="home"
                  placeholder="e.g. Smith & Sons"
                  value={quotedHome}
                  onChange={(e) => setQuotedHome(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quote" hint="Optional. The all-in number they gave you.">
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
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setSubmitted(true)} disabled={!zip}>
                Show fair prices
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
              <Card tone="primary">
                <CardEyebrow>Fair total range for your area</CardEyebrow>
                <h2 className="font-serif text-3xl text-primary-deep mb-2">
                  {fmtRange(low, high)}
                </h2>
                <p className="text-ink-soft">
                  This is what most families with no special circumstances pay
                  for a {SERVICE_LABELS[serviceType].toLowerCase()} in your
                  area. Anywhere from {fmtUSD(totals.predatoryLow)} to{" "}
                  {fmtUSD(totals.predatoryHigh)} is what predatory pricing
                  looks like.
                </p>
              </Card>

              {quotedHome && quotedNum > 0 && (
                <Card tone={dealRating.tone}>
                  <CardEyebrow>
                    {quotedHome} &mdash; quoted price compared to regional range
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

              <Card tone="soft">
                <CardEyebrow>Arrangement Kit &middot; $19 one-time</CardEyebrow>
                <CardTitle>See every line item fair price, not just the total.</CardTitle>
                <p className="text-ink-soft mb-4">
                  The regional total above tells you whether you&rsquo;re in the
                  right neighborhood. The paid Arrangement Kit breaks every
                  line item down &mdash; basic services fee, casket, embalming,
                  cemetery charges &mdash; so you know exactly which lines to
                  push back on when you&rsquo;re in the arrangement meeting.
                </p>
                <ul className="text-sm text-ink-soft space-y-1 mb-5 list-disc list-inside">
                  <li>Line-item fair-price breakdown, adjusted for your zip</li>
                  <li>The printable one-page cheat sheet for the meeting</li>
                  <li>Scripts for declining specific upsells without guilt</li>
                  <li>Price list analyzer &mdash; upload their GPL, get each line flagged</li>
                </ul>
                <LinkButton href="/prep" variant="primary">
                  Unlock the Arrangement Kit
                </LinkButton>
                <p className="text-xs text-ink-muted mt-3">
                  One-time $19. No subscription. Included free if you use our
                  advocate outreach.
                </p>
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

      <Footer />
    </main>
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

