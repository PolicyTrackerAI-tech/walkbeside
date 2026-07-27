import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND } from "@/lib/brand";
import { FREE_FOR_EVERY_FAMILY } from "@/lib/copy";
import { US_STATES } from "@/lib/us-states";
import { displayHospiceName } from "@/lib/hospice-display";
import {
  DIRECTORY_AS_OF,
  listHospicesByState,
  summarizeOwnership,
  groupByCity,
  type CityGroup,
} from "@/lib/hospice-directory";
import { ogImage } from "@/lib/og";

/*
 * Hospice-DIRECTORY surface — word-ban nuance (docs/SPRINT_DAYS_5-9_BUILDSHEETS.md
 * §DAY 6): CMS facts (Medicare-certified, ownership type, the dataset
 * citation) are factual and FINE here; the Medicare/CMS word restrictions
 * apply to EMPLOYER surfaces only. Still banned on this page: the three
 * promotional adjectives (any form — the gate greps this directory for them),
 * the CMS family-survey acronym (banned everywhere, always), pre-admission
 * benefit framing, hospice-selection verbs, and present-tense adoption claims
 * about any named hospice ("hospices can offer", never "this hospice offers").
 */

export const dynamicParams = false; // junk slugs and CMS territory rows 404
export const revalidate = 86400;

/** One threshold governs all long-page chrome (jump nav, letter strip). */
const CITY_JUMP_THRESHOLD = 25;

export async function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const entry = US_STATES.find((s) => s.slug === state);
  if (!entry) return {};
  // cache()-shared with the page body — one read, counts can never disagree.
  const rows = await listHospicesByState(entry.abbr);
  return {
    // Honest degrade: NEVER render a wrong or zero count into indexed metadata.
    title: rows
      ? `Hospices in ${entry.name} — all ${rows.length} Medicare-certified providers`
      : `Hospices in ${entry.name} — the Medicare-certified directory`,
    description: rows
      ? `All ${rows.length} Medicare-certified hospices in ${entry.name}, from the CMS Provider Data Catalog — grouped by city, each with its own public-record page — plus questions families can ask their own hospice about after-death support.`
      : `The Medicare-certified hospice directory for ${entry.name}, from the CMS Provider Data Catalog, plus questions families can ask their own hospice about after-death support.`,
    alternates: { canonical: `/hospices/${state}` },
    openGraph: { images: [ogImage(`Hospices in ${entry.name}`, "Directory")] },
  };
}

/** Letter bucket for the jump strip: A–Z, everything else under "#". */
function letterFor(group: CityGroup): string {
  if (!group.city) return "#";
  const ch = group.city.trim().charAt(0).toUpperCase();
  return ch >= "A" && ch <= "Z" ? ch : "#";
}

/** Bucket city groups by first letter, A–Z in order, "#" (non-letter) last. */
function bucketByLetter(
  groups: CityGroup[],
): { letter: string; groups: CityGroup[] }[] {
  const buckets = new Map<string, CityGroup[]>();
  for (const g of groups) {
    const letter = letterFor(g);
    const list = buckets.get(letter);
    if (list) list.push(g);
    else buckets.set(letter, [g]);
  }
  const letters = [...buckets.keys()].sort((a, b) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b),
  );
  return letters.map((letter) => ({ letter, groups: buckets.get(letter)! }));
}

const anchorFor = (letter: string) =>
  letter === "#" ? "cities-other" : `cities-${letter}`;

/**
 * The family education block — deliberately IDENTICAL across all 51 pages:
 * honest shared boilerplate beats 51 mechanically-spun variants; the unique
 * content on each page is the data. Six questions, from the Day-6 copy
 * fan-out (the written-materials slot was deliberately dropped in review —
 * do not re-add it).
 */
const QUESTIONS: { q: string; why: string }[] = [
  {
    q: "Who do we call at the moment of death — at any hour — and will a nurse come to pronounce the death?",
    why: "For an expected death under hospice care, the first call is usually the hospice, not 911 — but confirm exactly how your team wants it handled, and keep the number where everyone can find it.",
  },
  {
    q: "Is there any rush afterward? How long can we stay with them before anyone needs to be called or anything needs to happen?",
    why: "It's easy to assume there's a clock. Usually there isn't — and it helps to hear that from your own team ahead of time.",
  },
  {
    q: "When the time comes, who calls the funeral home we've chosen — your team or us — and what will they need from us?",
    why: "Practice varies. Some hospice nurses make that call for you; others will ask you to. Knowing which, in advance, is one less decision at the worst moment.",
  },
  {
    q: "Who certifies the death certificate, and how quickly? Is there anything that could slow it down?",
    why: "Nearly everything that follows — bank accounts, insurance, benefits — waits on death certificates. A delay in the signing delays all of it.",
  },
  {
    q: "What happens to the medications and the equipment — who disposes of or collects each, and what's our part?",
    why: "Controlled medications have disposal rules, and equipment pickup runs on the supplier's schedule. Sorting out whose job each piece is now saves a string of phone calls later.",
  },
  {
    q: "What bereavement support do you offer afterward — for how long, and which family members can use it?",
    why: "Grief support after the death is part of hospice care, and it often extends well past the funeral. Asking now means you'll know what's there before you need it — including for children.",
  },
];

export default async function HospiceStatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const entry = US_STATES.find((s) => s.slug === state);
  if (!entry) return null; // unreachable: dynamicParams=false 404s first

  const rows = await listHospicesByState(entry.abbr);
  const mix = rows ? summarizeOwnership(rows) : null;
  const cityGroups = rows ? groupByCity(rows) : null;
  const letterBuckets =
    cityGroups && cityGroups.length > CITY_JUMP_THRESHOLD
      ? bucketByLetter(cityGroups)
      : null;
  const otherStates = US_STATES.filter((s) => s.abbr !== entry.abbr);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={
          <BackLink defaultHref="/hospices" defaultLabel="← All states" />
        }
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Hospices",
              item: `${BRAND.url}/hospices`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: entry.name,
              item: `${BRAND.url}/hospices/${entry.slug}`,
            },
          ],
        }}
      />
      <section className="flex-1">
        <div id="top" className="max-w-2xl mx-auto px-5 py-12 space-y-7">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Hospice directory · {entry.abbr}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Hospices in {entry.name}.
            </h1>
            {rows ? (
              <p className="text-lg text-ink-soft mb-3">
                {entry.name} has {rows.length}{" "}
                Medicare-certified hospices, per the CMS Provider Data Catalog
                — directory data as of {DIRECTORY_AS_OF}. The list below is
                all of them, grouped by city. It&rsquo;s a reference, not a
                ranking: we don&rsquo;t rate or endorse hospices, and no
                hospice pays to appear here or to change how it appears. If
                one of these is already caring for someone you love, the
                questions just below are worth asking them.
              </p>
            ) : (
              <p className="text-lg text-ink-soft mb-3">
                Medicare-certified hospices in {entry.name}, from the CMS
                Provider Data Catalog. It&rsquo;s a reference, not a ranking:
                we don&rsquo;t rate or endorse hospices, and no hospice pays
                to appear here or to change how it appears.
              </p>
            )}
            <p className="font-medium text-ink">{FREE_FOR_EVERY_FAMILY}</p>
          </div>

          {letterBuckets && (
            <nav
              aria-label="On this page"
              className="text-sm text-primary-deep flex flex-wrap gap-x-4 gap-y-1"
            >
              <a href="#questions" className="underline-offset-2 hover:underline">
                Questions for your hospice
              </a>
              <a href="#directory" className="underline-offset-2 hover:underline">
                The directory
              </a>
              <a
                href="#for-hospice-teams"
                className="underline-offset-2 hover:underline"
              >
                For hospice teams
              </a>
            </nav>
          )}

          <div id="questions" className="scroll-mt-4">
            <Card tone="primary">
              <CardEyebrow>
                If a hospice is caring for your family now
              </CardEyebrow>
              <CardTitle>
                Six questions to ask the hospice caring for your family
              </CardTitle>
              <p className="text-ink-soft mt-1 mb-4">
                After-death support is part of hospice care, but it&rsquo;s a
                part many families haven&rsquo;t heard much about ahead of
                time. If a hospice is already caring for someone you love, its
                team can answer all of these now — and asking early means the
                day itself holds fewer unknowns.
              </p>
              <ul className="space-y-4">
                {QUESTIONS.map((item) => (
                  <li key={item.q} className="flex gap-3">
                    <span className="text-primary-deep mt-1" aria-hidden>
                      •
                    </span>
                    <div>
                      <p className="text-ink">&ldquo;{item.q}&rdquo;</p>
                      <p className="text-sm text-ink-soft mt-1">{item.why}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-ink-soft mt-4">
                However your hospice answers, the funeral decisions stay yours
                — which funeral home, what kind of service, what it should
                cost. Nobody else can make those choices for you, and you
                don&rsquo;t have to figure out the prices alone. Hospices can
                offer {BRAND.name}{" "}
                to every family they serve. Whether or not yours does, the
                tools work for you today —{" "}
                <Link
                  href="/analyzer"
                  className="font-medium text-primary-deep underline-offset-2 hover:underline"
                >
                  check any funeral quote free →
                </Link>
              </p>
            </Card>
          </div>

          {rows && cityGroups ? (
            <section id="directory" aria-labelledby="directory-h" className="scroll-mt-4">
              <h2
                id="directory-h"
                className="font-serif text-2xl text-ink mb-1"
              >
                All {rows.length}{" "}
                Medicare-certified hospices in {entry.name}, by city.
              </h2>
              {mix && mix.length > 0 && (
                <p className="text-sm text-ink-soft mb-1">
                  {mix.map((m) => `${m.count} ${m.label}`).join(" · ")}{" "}
                  — ownership as reported to CMS.
                </p>
              )}
              <p className="text-sm text-ink-muted mb-1">
                Ownership tells you who runs the organization — not what the
                care is like.
              </p>
              <p className="text-sm text-ink-muted mb-5">
                Grouped by city; every listing is shown the same way. A
                listing is a public record, not an endorsement.
              </p>

              {letterBuckets && (
                <nav
                  aria-label="Jump to cities by first letter"
                  className="flex flex-wrap gap-1.5 mb-6"
                >
                  {letterBuckets.map((b) => (
                    <a
                      key={b.letter}
                      href={`#${anchorFor(b.letter)}`}
                      className="text-sm px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:border-primary"
                    >
                      {b.letter}
                    </a>
                  ))}
                </nav>
              )}

              {(letterBuckets ?? [{ letter: "", groups: cityGroups }]).map(
                (bucket) => (
                  <div
                    key={bucket.letter || "all"}
                    id={bucket.letter ? anchorFor(bucket.letter) : undefined}
                    className="space-y-5 scroll-mt-4 mb-5"
                  >
                    {bucket.groups.map((group) => (
                      <div key={group.city ?? "(none)"}>
                        <h3 className="font-medium text-ink text-[15px] mb-1">
                          {group.city
                            ? displayHospiceName(group.city)
                            : "City not listed"}
                        </h3>
                        <ul>
                          {group.rows.map((h) => (
                            <li key={h.ccn}>
                              <Link
                                prefetch={false}
                                href={`/hospices/${entry.slug}/${h.ccn}`}
                                className="block py-3 text-[15px] text-ink hover:text-primary-deep hover:underline underline-offset-2"
                              >
                                {displayHospiceName(h.name)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ),
              )}

              {letterBuckets && (
                <a
                  href="#top"
                  className="text-sm text-primary-deep underline-offset-2 hover:underline"
                >
                  Back to top ↑
                </a>
              )}
            </section>
          ) : (
            <Card tone="soft">
              <p className="text-ink-soft">
                {rows && rows.length === 0
                  ? `We don't have CMS directory rows for ${entry.name} right now.`
                  : "The directory list isn't available right now. It will be back shortly — and everything else on this page works without it."}{" "}
                <Link
                  href="/analyzer"
                  className="font-medium text-primary-deep underline-offset-2 hover:underline"
                >
                  Check a funeral quote free →
                </Link>
              </p>
            </Card>
          )}

          <div id="for-hospice-teams" className="scroll-mt-4">
            <Card tone="soft">
              <CardEyebrow>For hospice teams</CardEyebrow>
              <CardTitle>Do you operate one of these hospices?</CardTitle>
              <p className="text-ink-soft mt-1 mb-4">
                Hospices can offer {BRAND.name}{" "}
                to every family in their care — free planning help and a
                neutral check on funeral prices, delivered after admission as
                part of the bereavement and family support you already
                provide. Free to the family, always. Families take it up
                themselves; your organization transmits no patient
                information. And partnering changes nothing on this page —
                this directory lists every Medicare-certified hospice in the
                state the same way, partner or not.
              </p>
              <LinkButton href="/partners/apply" variant="secondary">
                Apply to offer it →
              </LinkButton>
            </Card>
          </div>

          <Card tone="soft">
            <CardEyebrow>Other states</CardEyebrow>
            <p className="text-sm text-ink-soft mb-3">
              Every state has a page like this one. Pick another:
            </p>
            <div className="flex flex-wrap gap-2">
              {otherStates.map((s) => (
                <Link
                  key={s.abbr}
                  prefetch={false}
                  href={`/hospices/${s.slug}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-border bg-surface hover:border-primary hover:bg-primary-soft transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            Source:{" "}
            <a
              href="https://data.cms.gov/provider-data/dataset/yc9t-dgbk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              CMS Provider Data Catalog, Hospice — General Information
              (dataset yc9t-dgbk)
            </a>
            . Directory data as of {DIRECTORY_AS_OF}. We show a plain subset
            of the public dataset — name, city, ownership — and add nothing
            to it. A listing is a public record, not an endorsement.{" "}
            <Link
              href="/hospices"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              All states →
            </Link>
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
