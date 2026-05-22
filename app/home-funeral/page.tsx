import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import {
  getRequiringStates,
  getAllowingStates,
} from "@/lib/home-funeral";

import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";

export const metadata: Metadata = {
  title: "Home funerals — what they are, where they're legal, and how they work",
  description:
    "A home funeral is family-led care of the body after death — washing, dressing, holding a vigil, then transporting to cremation, burial, or donation. Legal in 41 US states. A plain-language guide with state-by-state rules.",
  openGraph: { images: [ogImage("Family-led home funerals", "Options")] },
};

/**
 * /home-funeral — public, indexable page covering family-led home
 * funerals. NOT a service we offer; it's information for families
 * considering this path. Many of the toolkit tools (preferences
 * worksheet, prep kit, certificate tracker) still apply.
 */
export default function HomeFuneralPage() {
  const requiringStates = getRequiringStates();
  const allowingStates = getAllowingStates();

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="home-funeral"
        title="Home funerals — family-led care of the body"
        description="A home funeral is family-led care of the body — washing, dressing, vigil, transport. Legal in 41 US states. What it is, what it isn't, and how it works."
        eyebrow="Options"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Home funerals</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The family takes care of the body. It&rsquo;s legal in
              most states.
            </h1>
            <p className="text-lg text-ink-soft">
              A home funeral &mdash; sometimes called a family-led
              funeral or family-directed funeral &mdash; is when the
              family handles the body themselves: washing, dressing,
              holding a vigil at home, and arranging transport to the
              place of cremation, burial, or donation. It is the way
              every family handled death until the late 1800s, and it
              is legal in {allowingStates.length} US states.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>What a home funeral is &mdash; and isn&rsquo;t.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">It is:</strong> the family
                taking responsibility for the body after death. You
                wash, dress, and lay out your person yourselves. The
                body stays at home for a vigil &mdash; commonly 1 to 3
                days &mdash; before being transported to the crematory
                or cemetery. You file the death certificate yourself
                (or with help). You transport the body in your own
                vehicle, an SUV, or a friend&rsquo;s pickup truck.
              </p>
              <p>
                <strong className="text-ink">It is not:</strong>{" "}
                refusing all professional help. Most home-funeral
                families work with a death doula, a home-funeral
                guide, or a hospice nurse for support. It is also not
                the same as a green burial &mdash; you can have a home
                funeral followed by traditional burial, by cremation,
                by green burial, or by body donation.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Why families choose this</CardEyebrow>
            <CardTitle>Three reasons that come up over and over.</CardTitle>
            <ol className="space-y-3 mt-4 text-ink-soft list-decimal list-inside">
              <li>
                <strong className="text-ink">Intimacy.</strong>{" "}
                Bathing and dressing your person yourself, and keeping
                them at home for a few days, is how families have done
                this for most of human history. Many find it
                meaningful in a way no funeral home can replicate.
              </li>
              <li>
                <strong className="text-ink">Cost.</strong> A home
                funeral followed by direct cremation typically runs
                $800&ndash;$1,500 total &mdash; vs. $7,000&ndash;$15,000
                for a conventional funeral. The savings come from
                eliminating the funeral home&rsquo;s basic services
                fee, embalming, viewing facility, and transportation
                charges.
              </li>
              <li>
                <strong className="text-ink">Control.</strong> No
                upsells. No pressure. No protective casket pitch. You
                handle everything on your own timeline, in your own
                home, surrounded by people who knew the person.
              </li>
            </ol>
          </Card>

          <Card tone="warn">
            <CardEyebrow>Reality check</CardEyebrow>
            <CardTitle>It&rsquo;s harder than people expect.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Home funerals are physical, emotional, and
                administrative work. The body needs to be kept cool
                (ice packs or dry ice, replaced every 12 hours).
                Someone has to file paperwork during a vigil. Someone
                has to arrange transport. Someone has to call the
                crematory or cemetery and confirm timing.
              </p>
              <p>
                If you don&rsquo;t have at least 2&ndash;3 family
                members or close friends willing to do this work, OR
                if there&rsquo;s family conflict about whether to do
                a home funeral, OR if the death involved trauma that
                left visible injuries &mdash; conventional funeral
                home support is probably the right call.
              </p>
              <p>
                Most home-funeral families also work with a{" "}
                <strong>home-funeral guide</strong> or{" "}
                <strong>death doula</strong> &mdash; a non-licensed
                helper who walks the family through care of the body,
                paperwork, and transport. Typical fee:{" "}
                $500&ndash;$1,500. Find one through the National Home
                Funeral Alliance.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Legal status by state</CardEyebrow>
            <CardTitle>
              Required involvement in {requiringStates.length} states. Family-led
              allowed in {allowingStates.length}.
            </CardTitle>
            <div className="text-ink-soft space-y-4 mt-4">
              <div>
                <p className="text-sm font-semibold text-ink mb-2">
                  States requiring funeral-director involvement at some
                  step (filing the death certificate, transporting the
                  body, or signing off on disposition):
                </p>
                <div className="flex flex-wrap gap-2">
                  {requiringStates.map((s) => (
                    <span
                      key={s.abbr}
                      className="text-xs px-2.5 py-1 rounded-full bg-warn-soft border border-warn/30 text-ink"
                      title={s.requirement}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-ink-muted mt-2">
                  In these states the family can still hold the vigil
                  at home, wash and dress the body, and participate
                  fully &mdash; a funeral director just has to be
                  involved in specific paperwork or transport steps.
                  Hover over a state for the exact requirement.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink mb-2">
                  States where family-led is fully legal end-to-end:
                </p>
                <div className="flex flex-wrap gap-2">
                  {allowingStates.map((s) => (
                    <span
                      key={s.abbr}
                      className="text-xs px-2.5 py-1 rounded-full bg-good-soft border border-good/30 text-ink"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-ink-muted">
                Source: National Home Funeral Alliance. State rules
                change &mdash; verify with{" "}
                <a
                  href="https://www.homefuneralalliance.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  homefuneralalliance.org
                </a>{" "}
                before you commit.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The basic steps</CardEyebrow>
            <CardTitle>What it actually looks like.</CardTitle>
            <ol className="space-y-3 mt-4 text-ink-soft list-decimal list-inside">
              <li>
                <strong className="text-ink">Pronouncement of death.</strong>{" "}
                A hospice nurse, attending physician, or coroner
                pronounces death and signs the medical portion of the
                death certificate. (Same first step regardless of how
                you proceed.)
              </li>
              <li>
                <strong className="text-ink">Notify your support people.</strong>{" "}
                Death doula, home-funeral guide, family members who
                volunteered to help. Have ice packs / dry ice on hand
                already &mdash; you need them within a few hours.
              </li>
              <li>
                <strong className="text-ink">Wash and dress the body.</strong>{" "}
                Cool water, mild soap, soft cloths. Dress in chosen
                clothes. Place dry ice or ice packs along the torso to
                slow decomposition. Position arms at sides; close eyes
                and mouth gently.
              </li>
              <li>
                <strong className="text-ink">Hold the vigil.</strong>{" "}
                Body laid out at home, typically on a bed or table.
                Family and close friends visit, share stories, sit
                with the body. Most vigils last 1&ndash;3 days. The
                room should be cool (60&ndash;65°F if possible).
                Replace ice every 12 hours.
              </li>
              <li>
                <strong className="text-ink">File the death certificate.</strong>{" "}
                In states that allow family-led, you file directly with
                the county vital records office. Timeline varies but
                is usually within 5 days of death. Order extra copies
                (10&ndash;15 is typical for the family&rsquo;s
                paperwork needs).
              </li>
              <li>
                <strong className="text-ink">Transport for final disposition.</strong>{" "}
                You drive the body to the crematory, cemetery, or
                donation center yourself, in your own vehicle. You
                need the burial-transit permit from the county (issued
                with or after the death certificate). The crematory or
                cemetery still does its own work; you just deliver
                instead of paying a funeral home for transport.
              </li>
            </ol>
          </Card>

          <Card>
            <CardEyebrow>Where this fits with our toolkit</CardEyebrow>
            <CardTitle>
              Most of what we built is still useful.
            </CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              The Honest Funeral toolkit is built for families using
              funeral homes &mdash; but if you&rsquo;re doing a home
              funeral, several pieces still help:
            </p>
            <ul className="space-y-2 text-ink-soft list-disc pl-5">
              <li>
                The <strong>30-day checklist</strong> still applies
                &mdash; death certificates, Social Security, banks,
                insurance, accounts to close. These don&rsquo;t change
                based on who handled the body.
              </li>
              <li>
                The <strong>certificate tracker</strong> helps you keep
                track of how many original death certificates you
                ordered and where each one went.
              </li>
              <li>
                The <strong>obituary helper</strong>, the{" "}
                <strong>memorial planner</strong>, and the{" "}
                <strong>notifications hub</strong> all work the same.
              </li>
              <li>
                The <strong>price-list analyzer</strong> is the one
                tool you won&rsquo;t need &mdash; you&rsquo;re not
                negotiating a funeral home&rsquo;s GPL.
              </li>
            </ul>
          </Card>

          <Card tone="soft">
            <CardEyebrow>If you want professional help</CardEyebrow>
            <CardTitle>We&rsquo;ll help you find a death doula.</CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              We don&rsquo;t maintain a directory of death doulas yet.
              The most reliable national directories are below. All
              free to search. Most doulas charge $500&ndash;$1,500 to
              walk a family through a home funeral end-to-end.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.homefuneralalliance.org/find-a-home-funeral-guide.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  National Home Funeral Alliance &mdash; Find a guide
                </a>
              </li>
              <li>
                <a
                  href="https://www.nedalliance.org/edda-directory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  National End-of-Life Doula Alliance &mdash; Directory
                </a>
              </li>
              <li>
                <a
                  href="https://www.inelda.org/find-a-doula/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  INELDA Doula directory
                </a>
              </li>
            </ul>
          </Card>

          <Card tone="primary">
            <CardTitle>If you&rsquo;re using a funeral home, we can help with that too.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              Most of the families we work with go through a funeral
              home &mdash; we just help them avoid getting taken
              advantage of. If a home funeral isn&rsquo;t for you,
              the toolkit still walks you through the rest.
            </p>
            <LinkButton href="/decide" size="lg">
              See what fits your situation →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not legal
            advice. Home funeral laws are state-specific and change
            occasionally. Verify with the National Home Funeral
            Alliance and your state&rsquo;s vital records office before
            making decisions. We are not affiliated with NHFA, NEDA,
            or INELDA.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
