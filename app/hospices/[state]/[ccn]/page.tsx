import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { BRAND } from "@/lib/brand";
import { FREE_FOR_EVERY_FAMILY } from "@/lib/copy";
import { US_STATES } from "@/lib/us-states";
import { displayHospiceName } from "@/lib/hospice-display";
import { DIRECTORY_AS_OF, getHospiceByCcn } from "@/lib/hospice-directory";
import { ClaimPanel } from "./ClaimPanel";

/*
 * Hospice-DIRECTORY surface — word-ban nuance (docs/SPRINT_DAYS_5-9_BUILDSHEETS.md
 * §DAY 6): CMS facts (Medicare-certified, ownership type, the dataset
 * citation) are factual and FINE here; the Medicare/CMS word restrictions
 * apply to EMPLOYER surfaces only. Still banned on this page: the three
 * promotional adjectives (any form — the gate greps this directory for them),
 * the CMS family-survey acronym (banned everywhere, always), pre-admission
 * benefit framing, hospice-selection verbs, and present-tense adoption claims
 * about any named hospice ("hospices can offer", never "this hospice offers").
 *
 * This template is byte-identical for all ~6,852 records except the CMS
 * values — that uniformity IS the zero-steering guarantee. PROHIBITED here:
 * counts, sibling lists, "nearby hospices", or ANY comparative module. The
 * page carries exactly one facility and the way back to the neutral list.
 */

// NO generateStaticParams — 6,852 pages would wreck the build. Render on
// demand; NOINDEXED (below); NEVER in the sitemap.
export const revalidate = 86400;

const NOINDEX = { robots: { index: false, follow: true } } as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; ccn: string }>;
}): Promise<Metadata> {
  // noindex on EVERY branch, including misses — the gate greps rendered HTML.
  const { state, ccn } = await params;
  const entry = US_STATES.find((s) => s.slug === state);
  if (!entry) return { ...NOINDEX };
  const h = await getHospiceByCcn(ccn);
  if (!h || h.state !== entry.abbr) return { ...NOINDEX };
  const display = displayHospiceName(h.name);
  const city = h.city ? displayHospiceName(h.city) : null;
  return {
    ...NOINDEX,
    title: city
      ? `${display} — ${city}, ${h.state}`
      : `${display} — ${entry.name}`,
    description: `The public CMS record for ${display}, listed as a Medicare-certified hospice in ${entry.name} — and free funeral-pricing help for the families it cares for.`,
  };
}

export default async function HospiceFacilityPage({
  params,
}: {
  params: Promise<{ state: string; ccn: string }>;
}) {
  const { state, ccn } = await params;
  const entry = US_STATES.find((s) => s.slug === state);
  if (!entry) notFound();
  // CCN fetched VERBATIM — zero-padded / alphanumeric strings survive intact.
  const h = await getHospiceByCcn(ccn);
  if (!h || h.state !== entry.abbr) notFound();

  const display = displayHospiceName(h.name);
  const city = h.city ? displayHospiceName(h.city) : null;
  const location = [city, [h.state, h.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  // Params VERBATIM raw CMS values, exactly matching HospiceFinder's
  // nominateHref construction — the family sends the note themselves; the
  // platform contacts no one.
  const nominateHref = `/tell-your-hospice?hospice=${encodeURIComponent(h.name)}${
    h.city ? `&city=${encodeURIComponent(h.city)}` : ""
  }${h.state ? `&state=${encodeURIComponent(h.state)}` : ""}`;

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={
          <BackLink
            defaultHref={`/hospices/${entry.slug}`}
            defaultLabel={`← ${entry.name} hospices`}
          />
        }
      />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-7">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-ink-muted mb-3">
              <Link
                href="/hospices"
                className="underline-offset-2 hover:underline"
              >
                Hospice directory
              </Link>{" "}
              <span aria-hidden>·</span>{" "}
              <Link
                href={`/hospices/${entry.slug}`}
                className="underline-offset-2 hover:underline"
              >
                {entry.name}
              </Link>{" "}
              <span aria-hidden>·</span>{" "}
              <span aria-current="page">{display}</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              {display}
            </h1>
            <p className="text-lg text-ink-soft">
              Listed as a Medicare-certified hospice in{" "}
              {city ? `${city}, ` : ""}
              {entry.name}{" "}
              in the CMS Provider Data Catalog (directory data as of{" "}
              {DIRECTORY_AS_OF}). This page shows the core of its public CMS
              record — we don&rsquo;t rate or rank hospices, and a listing is
              not an endorsement.
            </p>
          </div>

          <div>
            <Card>
              <CardEyebrow>CMS record</CardEyebrow>
              <dl className="space-y-3 mt-1">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-muted">
                    Location
                  </dt>
                  <dd className="text-ink mt-0.5">
                    {location || "Not listed"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-muted">
                    Ownership
                  </dt>
                  <dd className="text-ink mt-0.5">
                    {h.ownership ?? "Not reported"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-muted">
                    CCN (CMS certification number)
                  </dt>
                  <dd className="text-ink mt-0.5 tabular-nums">{h.ccn}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-muted">
                    Source
                  </dt>
                  <dd className="text-ink mt-0.5">
                    CMS Provider Data Catalog, Hospice — General Information
                    (yc9t-dgbk) · as of {DIRECTORY_AS_OF}
                  </dd>
                </div>
              </dl>
              <p className="text-sm text-ink-muted mt-4">
                This is the complete public record we hold for any hospice. We
                add nothing to it — no ratings, no reviews.
              </p>
            </Card>
            <p className="text-xs text-ink-muted mt-2">
              Every hospice on our state pages has a page exactly like this
              one. No hospice pays to appear or to change how it appears.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>
              If this hospice is caring for your family — or cared for them
            </CardEyebrow>
            <CardTitle>Free help with the funeral side.</CardTitle>
            <p className="font-medium text-ink mt-1 mb-2">
              {FREE_FOR_EVERY_FAMILY}
            </p>
            <p className="text-sm text-ink-soft mb-4">
              Hospices can offer {BRAND.name}{" "}
              to every family they serve. Whether or not this one does, the
              tools work for you today — when a funeral home hands you a
              quote, we check it against fair local prices, line by line.
            </p>
            <LinkButton href="/analyzer" variant="secondary">
              Check a funeral quote free →
            </LinkButton>
            <p className="text-sm text-ink-soft mt-4">
              And if you&rsquo;d like {display}{" "}
              to offer these tools to the families who come after you,
              we&rsquo;ve written a short note you can send from your own
              email — it takes about a minute.{" "}
              <Link
                href={nominateHref}
                className="font-medium text-primary-deep underline-offset-2 hover:underline"
              >
                Tell your hospice →
              </Link>
            </p>
          </Card>

          <Card tone="soft">
            <CardEyebrow>For this hospice&rsquo;s team</CardEyebrow>
            <CardTitle>Is this your organization?</CardTitle>
            <p className="text-ink-soft mt-1 mb-4">
              Offer {BRAND.name}{" "}
              to your families — free to them, always. Families take it up on
              their own after admission; your team shares nothing more than a
              link or a printed page, no patient information ever flows to
              us, and your report shows only aggregate, de-identified
              outcomes. A person reviews every application.
            </p>
            <LinkButton
              href={`/partners/apply?org=${encodeURIComponent(display)}`}
              variant="secondary"
            >
              Apply as a partner →
            </LinkButton>
            <p className="text-sm text-ink-soft mt-4">
              You can also claim this page below. Claiming changes nothing
              about what&rsquo;s shown here or what families see — it just
              tells us a real person at this hospice is on the other end.
            </p>
            <div className="border-t border-border my-5" />
            <ClaimPanel ccn={h.ccn} orgName={display} />
          </Card>

          <p className="text-xs text-ink-muted">
            Source: CMS Provider Data Catalog (yc9t-dgbk), as of{" "}
            {DIRECTORY_AS_OF}. A listing is a public record, not an
            endorsement.{" "}
            <Link
              href={`/hospices/${entry.slug}`}
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              All {entry.name} hospices →
            </Link>{" "}
            <Link
              href="/hospices"
              className="text-primary-deep underline-offset-2 hover:underline"
            >
              Directory home →
            </Link>
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
