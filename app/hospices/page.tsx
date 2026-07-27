import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { HelpFooter } from "@/components/HelpFooter";
import { BRAND } from "@/lib/brand";
import { FREE_FOR_EVERY_FAMILY } from "@/lib/copy";
import { US_STATES } from "@/lib/us-states";
import { DIRECTORY_AS_OF } from "@/lib/hospice-directory";
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

export const metadata: Metadata = {
  title: "Hospices by state — every Medicare-certified hospice in all 50 states and D.C.",
  description: `Every Medicare-certified hospice in all 50 states and D.C., listed state by state from the CMS Provider Data Catalog (directory data as of ${DIRECTORY_AS_OF}) — plus questions families can ask their own hospice about after-death support.`,
  alternates: { canonical: "/hospices" },
  openGraph: { images: [ogImage("Hospice directory", "By state")] },
};

/**
 * The hospice-directory index: the crawl path into the 51 state pages
 * (without it they'd be sitemap-orphans). Fully static, no DB read — so no
 * counts are claimed anywhere on this page.
 */
export default function HospicesIndexPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/" defaultLabel="← Home" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-7">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Hospice directory
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Every Medicare-certified hospice, by state.
            </h1>
            <p className="text-lg text-ink-soft mb-3">
              We keep a plain copy of the CMS Provider Data Catalog&rsquo;s
              hospice directory (as of {DIRECTORY_AS_OF}) — every
              Medicare-certified hospice in all 50 states and D.C. We list all
              of them because we rank none of them: no ratings, no
              endorsements, and no hospice pays to appear. Each state page has
              the full list, grouped by city, along with the after-death
              questions worth asking the hospice caring for your family.
            </p>
            <p className="font-medium text-ink">{FREE_FOR_EVERY_FAMILY}</p>
          </div>

          <nav aria-label="Hospice directories by state">
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              {US_STATES.map((s) => (
                <li key={s.abbr}>
                  <Link
                    prefetch={false}
                    href={`/hospices/${s.slug}`}
                    className="block py-3 text-[15px] text-primary-deep underline-offset-2 hover:underline"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="text-xs text-ink-muted">
            Operate a hospice? Hospices can offer {BRAND.name}{" "}
            to every family they serve — free to them.{" "}
            <Link
              href="/partners/apply"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              Apply →
            </Link>
          </p>

          <p className="text-xs text-ink-muted">
            Source: CMS Provider Data Catalog, Hospice — General Information
            (dataset yc9t-dgbk). A listing is a public record, not an
            endorsement.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
