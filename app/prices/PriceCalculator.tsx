"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { DataTierBadge } from "@/components/DataTierBadge";
import {
  LINE_ITEMS,
  SERVICE_TOTALS,
  SERVICE_LABELS,
  fmtRange,
  adjustedRange,
  displayThresholds,
  fmtUSD,
  PRICING_LAST_UPDATED,
  DATA_SOURCE_LABEL,
  type LineItem,
  type ServiceType,
} from "@/lib/pricing-data";
import { rateQuote } from "@/lib/price-rating";
import { FIVE_QUESTIONS } from "@/lib/scenarios";

type Mode = "no-quote" | "has-quote";

interface TierInfo {
  tier: "verified" | "community" | "modeled";
  n?: number | null;
  lastUpdated?: string | null;
}

const REQUIRED_LABEL: Record<LineItem["required"], string> = {
  yes: "Required",
  no: "Optional",
  burial: "Required for burial",
  cemetery: "Required by cemetery",
  cremation: "Required for cremation",
};

export function PriceCalculator() {
  const [mode, setMode] = useState<Mode>("no-quote");
  const [zip, setZip] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("traditional-burial");
  const [quotedHome, setQuotedHome] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fetchedTier, setFetchedTier] = useState<{
    zip: string;
    info: TierInfo;
  } | null>(null);

  // Every number this calculator shows is modeled math from the static
  // catalog, so its badge is always "modeled". The live tier endpoint only
  // powers the note pointing at /analyzer (which does consult the verified
  // store); any failure just hides the note. Never fires per keystroke — a
  // partial zip just returns.
  useEffect(() => {
    if (zip.length !== 5) return;
    const ctrl = new AbortController();
    fetch(`/api/benchmarks/tier?zip=${zip}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((t: TierInfo | null) => {
        if (
          t &&
          (t.tier === "verified" ||
            t.tier === "community" ||
            t.tier === "modeled")
        ) {
          setFetchedTier({ zip, info: t });
        }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [zip]);

  // Derived, keyed by zip so a stale fetch for a prior zip never shows.
  const tierInfo: TierInfo =
    fetchedTier?.zip === zip ? fetchedTier.info : { tier: "modeled" };

  const totals = SERVICE_TOTALS.find((t) => t.type === serviceType)!;
  const [low, high] = adjustedRange(totals.fairLow, totals.fairHigh, zip);
  // The predatory band adjusts by the SAME regional multiplier as the fair
  // range — mixing an adjusted fair range with national predatory numbers
  // let the two tools rate the same quote differently (guardrail #4).
  const [predLow, predHigh] = adjustedRange(
    totals.predatoryLow,
    totals.predatoryHigh,
    zip,
  );

  const quotedNum = Number(quotedPrice.replace(/[^0-9.]/g, ""));
  const dealRating =
    mode === "has-quote" ? rateQuote(quotedNum, low, high, predLow) : null;

  const lineItems = LINE_ITEMS.filter((li) => li.categories.includes(serviceType));

  const canSubmit =
    mode === "no-quote"
      ? zip.length === 5
      : zip.length === 5 && quotedHome.trim().length > 0 && quotedNum > 0;

  return (
    <>
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
            <Label htmlFor="zip" hint="Used to adjust the numbers for your region and check our data coverage there. Never saved.">
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
            What we&rsquo;ll do with your answers:
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
              A fair price for{" "}
              {SERVICE_LABELS[serviceType].toLowerCase()} in your area falls
              in this range. A quote of {fmtUSD(predLow)}&ndash;
              {fmtUSD(predHigh)} is what predatory pricing looks like for
              this service type in your area.
            </p>
            <p className="text-xs text-ink-muted mt-4">
              <DataTierBadge tier="modeled" className="mr-2" />
              {DATA_SOURCE_LABEL.modeled} &middot; Last updated{" "}
              {PRICING_LAST_UPDATED}
            </p>
            {tierInfo.tier !== "modeled" && (
              <p className="text-xs text-ink-muted mt-2">
                {tierInfo.tier === "verified"
                  ? "Real price lists from this area now back"
                  : "Family-reported prices from this area now back"}{" "}
                <Link
                  href="/analyzer"
                  className="underline text-primary-deep"
                >
                  our quote checker
                </Link>{" "}
                &mdash; {tierInfo.tier === "verified" ? "verified" : "those local"}{" "}
                ranges appear there first.
              </p>
            )}
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
                Regional ranges are based on national pricing benchmarks and
                public pricing data, adjusted for your area. A specific
                firm&rsquo;s actual current prices can only be verified by their
                printed GPL.
              </p>
              {dealRating.tone !== "good" && (
                <div className="mt-5 rounded-xl border border-primary-deep/20 bg-surface p-5">
                  <h3 className="font-serif text-lg text-ink mb-2">
                    {dealRating.tone === "bad"
                      ? "This home’s quote is above the regional range."
                      : "This quote is at the high end of the regional range."}
                  </h3>
                  <p className="text-sm text-ink-soft mb-3">
                    Want us to reach out to 3&ndash;5 other homes in your
                    zip for comparison quotes? We&rsquo;ll identify
                    ourselves as your advocate, request their General
                    Price Lists under your FTC rights, and summarize what
                    comes back.
                  </p>
                  <p className="text-sm text-ink-soft mb-4">
                    Free to families &mdash; we contact homes on your behalf at
                    no charge.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <LinkButton
                      href={`/negotiate/start?zip=${encodeURIComponent(zip)}&svc=${encodeURIComponent(serviceType)}&home=${encodeURIComponent(quotedHome)}&q=${encodeURIComponent(String(quotedNum))}`}
                    >
                      Have us contact funeral homes &mdash; free &rarr;
                    </LinkButton>
                    <LinkButton href="/how-it-works" variant="ghost">
                      How this works
                    </LinkButton>
                  </div>
                </div>
              )}
            </Card>
          )}

          <Card>
            <CardEyebrow>Line-by-line fair prices</CardEyebrow>
            <CardTitle>What each line on their price list should cost.</CardTitle>
            <p className="text-ink-soft mb-5 text-sm">
              Ranges are adjusted for your zip &mdash; except fixed
              per-unit fees like death certificates, which cost the same
              everywhere in a state. Required vs optional is tagged &mdash;
              anything marked optional, you can decline.
            </p>
            <ul className="divide-y divide-border">
              {lineItems.map((item) => {
                const t = displayThresholds(item, zip);
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
                        {fmtRange(t.fairLow, t.fairHigh)}
                      </div>
                      <div className="text-xs text-ink-muted">
                        over {fmtUSD(t.predatoryAt)} = overpriced
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
            <CardEyebrow>Arrangement Kit &middot; Free</CardEyebrow>
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
              Open the Arrangement Kit
            </LinkButton>
            <p className="text-xs text-ink-muted mt-3">
              Free. No account, no email required.
            </p>
          </Card>

          <Card tone="primary">
            <CardTitle>Want us to do the outreach for you?</CardTitle>
            <p className="text-ink-soft mb-4">
              With your written authorization, we contact funeral homes in
              your area as your advocate, request their itemized General
              Price Lists, and return side-by-side comparisons. You review
              the responses and choose. Free to families &mdash; we contact
              homes on your behalf at no charge.
            </p>
            <LinkButton
              href={`/negotiate/start?zip=${encodeURIComponent(zip)}&svc=${encodeURIComponent(serviceType)}`}
              size="lg"
            >
              Have us contact funeral homes &mdash; free
            </LinkButton>
          </Card>
        </>
      )}
    </>
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

