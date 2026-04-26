import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { FaithCheatsheet } from "@/components/FaithCheatsheet";
import {
  FAITH_TRADITIONS,
  getFaith,
  type FaithKey,
} from "@/lib/faith-traditions";
import { SERVICE_LABELS, SERVICE_TOTALS, fmtRange } from "@/lib/pricing-data";
import { JsonLd } from "@/components/seo/JsonLd";

const VALID_KEYS = FAITH_TRADITIONS.map((t) => t.key);

function isValidKey(s: string): s is FaithKey {
  return (VALID_KEYS as string[]).includes(s);
}

const EMBALMING_LABELS: Record<string, string> = {
  common: "Common in this tradition.",
  uncommon: "Not customary, but allowed.",
  discouraged: "Generally discouraged.",
  forbidden: "Not part of the tradition. Decline at the funeral home.",
};

const DISPOSITION_LABELS: Record<string, string> = {
  "burial-required": "Burial required",
  "burial-preferred": "Burial preferred (cremation may be allowed)",
  "cremation-required": "Cremation required",
  "cremation-preferred": "Cremation preferred",
  either: "No requirement — either accepted",
};

export async function generateStaticParams() {
  return VALID_KEYS.map((tradition) => ({ tradition }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tradition: string }>;
}): Promise<Metadata> {
  const { tradition } = await params;
  if (!isValidKey(tradition)) return {};
  const t = getFaith(tradition);
  return {
    title: `${t.label} — funeral planning guide`,
    description: t.notes,
  };
}

export default async function FaithPage({
  params,
}: {
  params: Promise<{ tradition: string }>;
}) {
  const { tradition: raw } = await params;
  if (!isValidKey(raw)) notFound();
  const t = getFaith(raw);
  const totals = SERVICE_TOTALS.find((s) => s.type === t.defaultServiceType);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${t.label} — funeral planning guide`,
    description: t.notes,
    datePublished: "2026-04-01",
    author: {
      "@type": "Organization",
      name: "Honest Funeral",
      url: "https://honestfuneral.co",
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <main className="flex-1 flex flex-col">
        <SiteHeader rightSlot={<BackLink defaultHref="/decide" defaultLabel="← All traditions" />} />

        <section className="flex-1">
          <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
            <div>
              <CardEyebrow>Faith tradition</CardEyebrow>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-3">
                {t.label}
              </h1>
              <p className="text-lg text-ink-soft">{t.notes}</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <FactCard label="Disposition" value={DISPOSITION_LABELS[t.dispositionNorm]} />
              <FactCard label="Timeline" value={t.timelineNorm} />
              <FactCard
                label="Embalming"
                value={EMBALMING_LABELS[t.embalmingNorm]}
              />
            </div>

            <Card tone="primary">
              <CardEyebrow>Recommended starting point</CardEyebrow>
              <CardTitle>{SERVICE_LABELS[t.defaultServiceType]}</CardTitle>
              {totals && (
                <p className="text-sm text-ink mb-4">
                  <span className="text-ink-muted">Fair total range nationally: </span>
                  <strong>{fmtRange(totals.fairLow, totals.fairHigh)}</strong>
                </p>
              )}
              <p className="text-ink-soft mb-5">
                This is the service type most families in this tradition
                choose. You can refine with the four-question decision guide if
                you want to weigh budget or other preferences.
              </p>
              <div className="flex flex-wrap gap-3">
                <LinkButton href={`/prices?svc=${t.defaultServiceType}`}>
                  See fair prices for my zip →
                </LinkButton>
                <LinkButton href="/decide" variant="secondary">
                  Refine with the decision guide →
                </LinkButton>
              </div>
            </Card>

            {t.cheatsheet && (
              <Card tone="soft">
                <CardEyebrow>What to coordinate before the arrangement meeting</CardEyebrow>
                <p className="text-ink-soft leading-relaxed">
                  {t.cheatsheet.communityNotes}
                </p>
              </Card>
            )}

            <div>
              <h2 className="font-serif text-2xl text-ink mb-3">
                Cheat sheet for the arrangement meeting
              </h2>
              <p className="text-ink-soft mb-5">
                Print this. Bring it. The questions and decline scripts at the
                top are tailored to {t.label.toLowerCase()} practice; the rest
                is the standard FTC-rights guidance every family should know.
              </p>
              <FaithCheatsheet tradition={t} />
            </div>

            <Card>
              <CardTitle>Other traditions</CardTitle>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                {FAITH_TRADITIONS.filter((other) => other.key !== t.key).map(
                  (other) => (
                    <li key={other.key}>
                      <Link
                        href={`/faith/${other.key}`}
                        className="text-primary-deep underline-offset-2 hover:underline"
                      >
                        {other.label} →
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
        {label}
      </div>
      <div className="text-sm text-ink leading-relaxed">{value}</div>
    </div>
  );
}
