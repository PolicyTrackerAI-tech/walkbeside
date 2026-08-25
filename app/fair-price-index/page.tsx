import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { LINE_ITEMS, PRICING_LAST_UPDATED, fmtUSD } from "@/lib/pricing-data";
import { DataTierBadge } from "@/components/DataTierBadge";
import { BRAND } from "@/lib/brand";
import { JsonLd } from "@/components/seo/JsonLd";
import { listActiveBenchmarks } from "@/lib/benchmarks-store";
import { datasetLastUpdated } from "@/lib/fair-price-dataset";
import { groupVerifiedMetros, metroSummaryLine } from "@/lib/verified-metros";
import { citySlugsForMetro } from "@/lib/city-pages";

// ISR: statically generated, revalidated hourly — and purged immediately by
// the benchmark promote route, so a founder promotion lists its metro here
// within the hour with no deploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Fair-Price Index — what funeral items should cost",
  description:
    "A free, neutral reference for what each common funeral charge should cost: national fair-price ranges for caskets, embalming, the basic services fee, vaults, cremation, death certificates, and more, with sources and methodology. Built by a service that takes no money from funeral homes or insurers.",
  alternates: { canonical: "/fair-price-index" },
};

const LAST_UPDATED = new Date(
  PRICING_LAST_UPDATED + "T00:00:00Z",
).toLocaleDateString("en-US", { year: "numeric", month: "long", timeZone: "UTC" });

const byId = new Map(LINE_ITEMS.map((it) => [it.id, it]));

const GROUPS: { label: string; ids: string[] }[] = [
  { label: "Professional services", ids: ["basic-services", "service-facility", "viewing", "graveside"] },
  { label: "Preparation & care of the body", ids: ["embalming", "body-prep", "refrigeration-shelter"] },
  { label: "Transport", ids: ["transfer", "hearse", "limo", "forwarding-remains", "receiving-remains"] },
  { label: "Cremation", ids: ["direct-cremation-fee", "cremation-process-fee", "cremation-container", "rental-casket", "witness-cremation-fee", "urn"] },
  { label: "Caskets", ids: ["casket-metal", "casket-wood"] },
  { label: "Cemetery & burial", ids: ["vault", "plot", "open-close", "headstone"] },
  { label: "Records, notices & keepsakes", ids: ["death-cert", "obituary-newspaper", "programs", "acknowledgement-cards", "register-book", "flowers-fh"] },
];

// Catch any benchmarked item not placed in a group above, so the Index can
// never silently omit one as the data grows.
const grouped = new Set(GROUPS.flatMap((g) => g.ids));
const ungrouped = LINE_ITEMS.filter((it) => !grouped.has(it.id)).map((it) => it.id);
const ALL_GROUPS = ungrouped.length
  ? [...GROUPS, { label: "Other", ids: ungrouped }]
  : GROUPS;

function unitSuffix(id: string): string {
  if (id === "death-cert") return " each";
  if (id === "refrigeration-shelter") return " / day";
  return "";
}

export default async function FairPriceIndexPage() {
  // Founder-promoted overrides (empty array when none exist or the read
  // degrades — the verified-metros section is then completely absent and the
  // disclaimer reads exactly as before).
  const active = await listActiveBenchmarks();
  const verifiedMetros = groupVerifiedMetros(active);
  const lastUpdated = datasetLastUpdated(active);

  // Built per-render: dateModified tracks the newest promoted row. The
  // hardcoded "Honest Funeral"/honestfuneral.co literals predate lib/brand
  // and are swept atomically on Rename Day (lib/brand.ts header) — only the
  // NEW distribution fields read BRAND.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Honest Funeral Fair-Price Index",
    description:
      "Fair-price ranges for the common charges on a US funeral home's General Price List, used by Honest Funeral's free quote checker.",
    creator: { "@type": "Organization", name: "Honest Funeral", url: "https://honestfuneral.co" },
    url: "https://honestfuneral.co/fair-price-index",
    dateModified: lastUpdated,
    isAccessibleForFree: true,
    // A real license (audit A6-05): the field previously pointed at our
    // methodology page, which is documentation, not a license — Dataset
    // Search wants a recognized one. CC BY 4.0 fits the citable-open-data
    // strategy: reuse allowed, attribution (a link back) required. The
    // methodology stays attached as isBasedOn.
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: "https://honestfuneral.co/methodology",
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${BRAND.url}/api/fair-price-index/data`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: `${BRAND.url}/api/fair-price-index/data?format=csv`,
      },
    ],
  };

  return (
    <main className="flex-1 flex flex-col">
      <JsonLd data={jsonLd} />
      <SiteHeader rightSlot={<BackLink defaultHref="/analyzer" defaultLabel="← The quote checker" />} />

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-10 space-y-8 text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              The Fair-Price Index
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              What funeral items should cost.
            </h1>
            <p className="text-lg">
              Funeral prices are notoriously hard to compare, and grief is a
              terrible time to negotiate. So here&rsquo;s a free, plain reference:
              the fair range for each common charge on a funeral home&rsquo;s
              price list. Built by a service that takes{" "}
              <strong className="text-ink">no money from funeral homes or
              insurers</strong> &mdash; so nobody&rsquo;s thumb is on the scale.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>How to use it</CardEyebrow>
            <p className="mt-2 text-ink">
              Compare each line on a quote to the fair range below. A charge near
              or below the low end is good; well above the high end is worth
              questioning.{" "}
              <Link href="/analyzer" className="text-primary-deep underline font-medium">
                Or paste your whole quote into the checker
              </Link>{" "}
              and we&rsquo;ll do it for you, line by line, and flag FTC issues.
            </p>
          </Card>

          {ALL_GROUPS.map((group) => (
            <div key={group.label} className="space-y-3">
              <h2 className="font-serif text-2xl text-ink">{group.label}</h2>
              <ul className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
                {group.ids.map((id) => {
                  const it = byId.get(id);
                  if (!it) return null;
                  const name = it.name.split("/")[0].split("—")[0].trim();
                  return (
                    <li key={id} className="px-5 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-ink font-medium">
                          {name}
                          {it.highMarkup && (
                            <span className="ml-2 align-middle text-[10px] uppercase tracking-wider text-warn font-semibold">
                              often marked up
                            </span>
                          )}
                        </span>
                        <span className="text-ink whitespace-nowrap font-semibold">
                          {fmtUSD(it.fairLow)}&ndash;{fmtUSD(it.fairHigh)}
                          <span className="text-ink-muted font-normal">
                            {unitSuffix(id)}
                          </span>
                        </span>
                      </div>
                      {it.notes && (
                        <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                          {it.notes}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Verified metros — completely absent when no metro-scope rows
              exist (or the store read degraded): the empty-store render is
              byte-identical to the pre-Day-7 page here. */}
          {verifiedMetros.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-serif text-2xl text-ink">Verified metros</h2>
              <p>
                Metros where real local data has replaced the modeled range
                for some items.
              </p>
              <ul className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
                {verifiedMetros.map((m) => {
                  const slug = citySlugsForMetro(m.metro)[0];
                  return (
                    <li key={m.metro} className="px-5 py-4">
                      {slug ? (
                        <Link
                          href={`/funeral-costs/${slug}`}
                          className="text-primary-deep underline font-medium"
                        >
                          {m.metro}
                        </Link>
                      ) : (
                        <span className="text-ink font-medium">{m.metro}</span>
                      )}{" "}
                      &mdash; {metroSummaryLine(m, LINE_ITEMS.length)}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <Card tone="warn">
            <div className="mb-3">
              <DataTierBadge tier="modeled" />
            </div>
            <p>
              These are national fair-price ranges &mdash; an informational
              reference, not an appraisal of any specific funeral home, and not
              legal or financial advice. The whole index is the modeled tier:
              national benchmarks adjusted by a regional cost index. As real
              price lists accumulate for a metro (at least five, and a person
              reviews the range before it publishes), its ranges upgrade to
              Verified &mdash; the
              data-tier badge on any zip&rsquo;s price page tells you which
              you&rsquo;re seeing.
              {verifiedMetros.length > 0 && (
                <>
                  {" "}The metros listed above are the exception &mdash; for
                  some items there, real local data has replaced the modeled
                  range.
                </>
              )}{" "}
              Fixed per-unit fees (like death
              certificates) are government-set, not cost-of-living items, so
              we benchmark them nationally; merchandise like caskets
              and urns you can buy from any third party. Last reviewed{" "}
              {LAST_UPDATED}. Where each number comes
              from, and the limits, are on the{" "}
              <Link href="/methodology" className="text-primary-deep underline">
                methodology page
              </Link>{" "}
              &mdash; and when we get one wrong, we fix it on the{" "}
              <Link href="/corrections" className="text-primary-deep underline">
                corrections page
              </Link>
              .
            </p>
          </Card>

          {/* Cite-this — the citability payoff. Always present (it cites the
              modeled index too); the date tracks the newest promoted row. */}
          <Card tone="soft">
            <CardEyebrow>To cite this index</CardEyebrow>
            <p className="mt-2 text-sm text-ink">
              {BRAND.name}. The Fair-Price Index &mdash; what funeral items
              should cost.{" "}
              <span className="break-all">{BRAND.url}/fair-price-index</span>.
              Updated {lastUpdated}.
            </p>
            <p className="mt-2 text-sm">
              Machine-readable data:{" "}
              <a
                href="/api/fair-price-index/data"
                className="text-primary-deep underline break-all"
              >
                {BRAND.url}/api/fair-price-index/data
              </a>{" "}
              (JSON, or add <code>?format=csv</code> for CSV).
            </p>
          </Card>

          <div className="pt-2">
            <LinkButton href="/analyzer">Check your quote against this &rarr;</LinkButton>
          </div>
        </article>
      </section>
    </main>
  );
}
