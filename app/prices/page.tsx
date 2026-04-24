"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand, Footer } from "@/components/Brand";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { PriceTable } from "@/components/PriceTable";
import {
  SERVICE_TOTALS,
  SERVICE_LABELS,
  fmtRange,
  adjustedRange,
  classifyPrice,
  LINE_ITEMS,
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
                  <CardEyebrow>{quotedHome}&rsquo;s quote</CardEyebrow>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h2 className="font-serif text-3xl text-ink">
                      {fmtUSD(quotedNum)}
                    </h2>
                    <span className="text-base font-medium uppercase tracking-wider">
                      {dealRating.label}
                    </span>
                  </div>
                  <p className="text-ink-soft mt-2">{dealRating.message}</p>
                  {dealRating.tone !== "good" && (
                    <div className="mt-5">
                      <LinkButton
                        href={`/negotiate/start?zip=${encodeURIComponent(zip)}&svc=${encodeURIComponent(serviceType)}&home=${encodeURIComponent(quotedHome)}&q=${encodeURIComponent(String(quotedNum))}`}
                      >
                        Get us a better price →
                      </LinkButton>
                      <p className="text-xs text-ink-muted mt-2">
                        We contact 3–5 homes anonymously. You pay nothing
                        unless we save you money.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              <div>
                <h2 className="font-serif text-2xl text-ink mb-3">
                  Line item by line item
                </h2>
                <p className="text-ink-soft mb-4">
                  This is what every funeral home charges for, what&rsquo;s fair, and
                  what&rsquo;s required. The shaded rows are the highest-markup items
                  to watch.
                </p>
                <PriceTable
                  zip={zip}
                  filterService={serviceType}
                  highlightHighMarkup
                />
              </div>

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
                  Our AI contacts 3–5 funeral homes in your area anonymously,
                  asks for itemized prices, and negotiates on your behalf. You
                  only pay 20% of what we save you, capped at $500 — and only
                  if you actually take the deal.
                </p>
                <LinkButton
                  href={`/negotiate/start?zip=${encodeURIComponent(zip)}&svc=${encodeURIComponent(serviceType)}`}
                  size="lg"
                >
                  Start AI negotiation
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
  if (quoted <= fairHigh) {
    return {
      label: "Good deal",
      tone: "good",
      message: `That&rsquo;s within fair range (${fmtUSD(fairLow)}–${fmtUSD(fairHigh)}). Worth still asking for the itemized General Price List to confirm.`,
    };
  }
  if (quoted <= (fairHigh + predatoryHigh) / 2) {
    return {
      label: "High",
      tone: "warn",
      message: `That&rsquo;s above fair range. You could likely save $${(quoted - fairHigh).toLocaleString()}–$${(quoted - fairLow).toLocaleString()} by comparing to other homes.`,
    };
  }
  return {
    label: "Overpriced",
    tone: "bad",
    message: `That&rsquo;s in predatory territory. Most families in your area pay $${fairLow.toLocaleString()}–$${fairHigh.toLocaleString()} for the same service. You should walk away or compare immediately.`,
  };
}

// classifyPrice + LINE_ITEMS imported for completeness (reserved for line-item view)
void classifyPrice;
void LINE_ITEMS;
