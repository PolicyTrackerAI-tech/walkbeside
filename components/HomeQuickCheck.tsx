"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { DataTierBadge } from "@/components/DataTierBadge";
import {
  SERVICE_TOTALS,
  SERVICE_LABELS,
  fmtRange,
  adjustedRange,
  PRICING_LAST_UPDATED,
  DATA_SOURCE_LABEL,
  type ServiceType,
} from "@/lib/pricing-data";

interface TierInfo {
  tier: "verified" | "community" | "modeled";
  n?: number | null;
  lastUpdated?: string | null;
}

/**
 * The homepage's "just looking" quick check — a stripped-down sibling of
 * app/prices/PriceCalculator.tsx's no-quote mode. Deliberately omits the
 * has-quote flow, line-item breakdown, five questions, and arrangement-kit
 * upsell, all of which stay exclusive to /prices.
 */
export function HomeQuickCheck() {
  const [zip, setZip] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("traditional-burial");
  const [submitted, setSubmitted] = useState(false);
  const [fetchedTier, setFetchedTier] = useState<{
    zip: string;
    info: TierInfo;
  } | null>(null);

  // Every number this quick check shows is modeled math from the static
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
  const canSubmit = zip.length === 5;

  return (
    <Card className="border-2 border-primary">
      <CardEyebrow>See fair prices for your area · free, no account</CardEyebrow>
      <div className="grid sm:grid-cols-2 gap-5 mt-3">
        <div>
          <Label htmlFor="home-zip" hint="Used to adjust the numbers for your region and check our data coverage there. Never saved.">
            Your zip code
          </Label>
          <Input
            id="home-zip"
            inputMode="numeric"
            maxLength={5}
            placeholder="44106"
            value={zip}
            onChange={(e) => {
              setZip(e.target.value.replace(/[^0-9]/g, ""));
              setSubmitted(false);
            }}
          />
        </div>
        <div>
          <Label htmlFor="home-svc" hint="Pick the closest match.">
            Type of service
          </Label>
          <Select
            id="home-svc"
            value={serviceType}
            onChange={(e) => {
              setServiceType(e.target.value as ServiceType);
              setSubmitted(false);
            }}
          >
            {SERVICE_TOTALS.map((s) => (
              <option key={s.type} value={s.type}>
                {SERVICE_LABELS[s.type]}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <p className="text-sm text-ink-soft mt-4">
        You&rsquo;ll see a fair-price range for your zip code. No account, no
        email. Nothing is saved.
      </p>
      <div className="mt-4">
        <Button onClick={() => setSubmitted(true)} disabled={!canSubmit}>
          Show me fair prices
        </Button>
      </div>

      {submitted && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">
            Fair total range for your area
          </div>
          <div className="font-serif text-4xl text-primary-deep leading-none">
            {fmtRange(low, high)}
          </div>
          <p className="text-ink-soft mt-2">
            This is what most families pay for{" "}
            {SERVICE_LABELS[serviceType].toLowerCase()} in your area.
          </p>
          <p className="text-xs text-ink-muted mt-3">
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
          <Link
            href="/prices"
            className="inline-block mt-4 text-sm font-medium text-primary-deep underline-offset-2 hover:underline"
          >
            See the line-by-line breakdown →
          </Link>
        </div>
      )}
    </Card>
  );
}
