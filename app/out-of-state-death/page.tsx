import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "When someone dies far from home — out-of-state and international",
  description:
    "How to transport remains across state lines or back from another country. The two-funeral-home model, typical costs, the cheaper option most families miss, and the paperwork that actually matters.",
  openGraph: { images: [ogImage("When someone dies far from home", "Logistics")] },
};

/**
 * /out-of-state-death — public, indexable. Procedural guide for the
 * niche but high-anxiety scenario of a death away from home: another
 * US state, another country, at sea. Voice is factual and direct; no
 * emotional weight beyond the practical decisions.
 */
export default function OutOfStateDeathPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Death away from home</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              When someone dies in another state or country.
            </h1>
            <p className="text-lg text-ink-soft">
              The body needs to get home, the paperwork involves two
              jurisdictions, and the bill is bigger than most
              families expect &mdash; or much smaller if you know the
              cheaper option. This page is the practical playbook for
              the three scenarios: out-of-state, international, and
              at sea.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>First, slow down</CardEyebrow>
            <CardTitle>You have more time than the calls suggest.</CardTitle>
            <p className="text-ink-soft mt-3">
              When a death happens far from home, the family often
              gets contacted by a local funeral home or hospital
              within hours, with quick decisions urged: pick a home,
              authorize transport, send a wire. Almost none of it is
              actually urgent. Bodies are routinely held for several
              days in cooled storage at no charge. Take a breath,
              compare options, and don&rsquo;t authorize anything
              over the phone in the first 24 hours.
            </p>
          </Card>

          <Card>
            <CardEyebrow>The model that runs every long-distance case</CardEyebrow>
            <CardTitle>Two funeral homes, working together.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Long-distance death care almost always uses two
                funeral homes that coordinate:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">The shipping (or &ldquo;sending&rdquo;) funeral home</strong>{" "}
                  &mdash; located where the death occurred. They take
                  custody of the body, complete the death-side
                  paperwork, prepare the remains for transport, and
                  hand off to the carrier.
                </li>
                <li>
                  <strong className="text-ink">The receiving funeral home</strong>{" "}
                  &mdash; located where you want the funeral or
                  burial. They handle the destination-side paperwork
                  and the final service.
                </li>
              </ul>
              <p>
                Both charge a basic-services fee. Both will quote you
                the same line items required by the FTC Funeral Rule
                (
                <Link
                  href="/glossary/gpl"
                  className="text-primary-deep underline"
                >
                  GPL
                </Link>
                ). The bill is the combination of: shipping home&rsquo;s
                services + receiving home&rsquo;s services + transport
                cost.
              </p>
              <p>
                <strong className="text-ink">Important:</strong> the
                receiving home almost always recommends a specific
                shipping home in the death-location city. They have
                established relationships. You are not obligated to
                use the recommended shipping home. Comparing two or
                three options on the shipping side is the single
                biggest cost-reduction opportunity in this scenario,
                since shipping homes vary in price as much as any
                other funeral homes do.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Out-of-state (within the US)</CardEyebrow>
            <CardTitle>The most common scenario. Mostly procedural.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Typical cost in 2026:</strong>{" "}
                $3,000&ndash;$8,000 all in (both funeral homes +
                transport + casket if required by the airline) for
                a body shipped by air. Ground transport, where
                feasible, runs $1,500&ndash;$3,500. Distance,
                regional pricing, and weekend surcharges all move
                the number.
              </p>
              <p>
                <strong className="text-ink">Transport options:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Commercial air cargo</strong>{" "}
                  &mdash; standard for trips over ~500 miles. Body
                  travels in a specific air-tray shipping container
                  the funeral home prepares. Major US carriers
                  (Delta, American, United) have dedicated human
                  remains programs. Usually next-day delivery.
                </li>
                <li>
                  <strong className="text-ink">Funeral-home ground transport</strong>{" "}
                  &mdash; common for distances under 300&ndash;500
                  miles. Cheaper than air; some funeral homes drive
                  the route themselves.
                </li>
                <li>
                  <strong className="text-ink">Family driving</strong>{" "}
                  &mdash; possible in states that allow family
                  transport of remains (see{" "}
                  <Link
                    href="/home-funeral"
                    className="text-primary-deep underline"
                  >
                    home funeral guide
                  </Link>{" "}
                  for which states). You need a burial-transit permit
                  from the death-location county. Generally the
                  cheapest option but the most logistically complex
                  &mdash; refrigeration on the road, timing, etc.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Paperwork the family handles:</strong>{" "}
                authorization for embalming (sometimes required for
                air transport even where it&rsquo;s not required for
                burial), authorization for the casket choice, and
                signing the burial-transit permit. The shipping
                funeral home walks you through each.
              </p>
              <p>
                <strong className="text-ink">Death certificate quirk:</strong>{" "}
                the death certificate is filed in the state where
                death occurred, not where the deceased lived. Your
                receiving funeral home will order extras from the
                death-location state on your behalf, but you may need
                to handle some institutions yourself if they want
                in-state certificates &mdash; particularly for
                property held in the deceased&rsquo;s home state.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>International (death abroad)</CardEyebrow>
            <CardTitle>The State Department gets involved. Plan on weeks.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                When a US citizen dies abroad, the nearest US embassy
                or consulate is automatically notified by local
                authorities (or by the family). The embassy can
                help in specific ways and not at all in others.
              </p>
              <p>
                <strong className="text-ink">What the embassy will do:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Issue the{" "}
                  <strong className="text-ink">Consular Report of Death of a US Citizen Abroad</strong>{" "}
                  (CROD). This document is accepted by US institutions
                  as the equivalent of a US death certificate. Order
                  at least 10 certified copies.
                </li>
                <li>
                  Coordinate with the local authorities and the
                  family on disposition decisions.
                </li>
                <li>
                  Maintain a list of local English-speaking funeral
                  homes and shipping agents you can contact.
                </li>
                <li>
                  Notify next-of-kin if you weren&rsquo;t the one
                  who reported the death.
                </li>
              </ul>
              <p>
                <strong className="text-ink">What the embassy won&rsquo;t do:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Pay for any of it. All costs are the family&rsquo;s
                  responsibility.
                </li>
                <li>
                  Take custody of the body or remains.
                </li>
                <li>
                  Override the destination country&rsquo;s
                  requirements (some countries require local
                  embalming, lead-lined caskets, or specific
                  paperwork that&rsquo;s legally non-negotiable).
                </li>
                <li>
                  Speed up local authorities. Some countries require
                  autopsy by default; releasing the body can take
                  1&ndash;3 weeks.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Typical cost in 2026:</strong>{" "}
                $5,000&ndash;$20,000+ all in for international
                repatriation. Variables: country, distance, whether
                local embalming is required, casket type required by
                origin or destination country, airline carrier, time
                of year (peak-season air-cargo surcharges).
              </p>
              <p>
                <strong className="text-ink">Steps:</strong>
              </p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  Contact the nearest US embassy or consulate (24-hour
                  emergency line). Phone numbers are at{" "}
                  <a
                    href="https://travel.state.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    travel.state.gov
                  </a>
                  .
                </li>
                <li>
                  Ask the embassy for their list of local funeral
                  homes / shipping agents.
                </li>
                <li>
                  Choose a US receiving funeral home. They will
                  coordinate with the foreign shipping agent.
                </li>
                <li>
                  Authorize the foreign shipping agent and the
                  US receiving home (each will send paperwork).
                </li>
                <li>
                  Pay both. Wire transfers are common. Expect
                  6,000&ndash;15,000 dollars in wires across several
                  recipients.
                </li>
                <li>
                  Wait for transport. International repatriation
                  typically takes 2&ndash;4 weeks from death to
                  arrival at the US receiving home.
                </li>
              </ol>
              <p>
                <strong className="text-ink">Check for repatriation insurance.</strong>{" "}
                Many travel insurance policies (including the
                free-ish ones bundled with credit cards) cover
                repatriation of remains, often up to $25,000&ndash;$50,000.
                Check the deceased&rsquo;s most recent travel
                booking and credit card benefits BEFORE paying out
                of pocket. Some employer travel benefits include
                this too.
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>The option most families don&rsquo;t consider</CardEyebrow>
            <CardTitle>Cremate where they died. Fly home with the urn.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Direct cremation at the death location, then shipping
                or carrying the cremated remains home, dramatically
                reduces cost and complexity in both out-of-state and
                international cases.
              </p>
              <p>
                <strong className="text-ink">Typical cost:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Out-of-state direct cremation + shipping the urn
                  (or carrying it as carry-on luggage):{" "}
                  <strong className="text-ink">$1,500&ndash;$3,500 total.</strong>
                </li>
                <li>
                  International direct cremation + return of
                  cremated remains:{" "}
                  <strong className="text-ink">$2,000&ndash;$6,000 total</strong>{" "}
                  in most countries.
                </li>
              </ul>
              <p>
                Cremated remains can be shipped via USPS (specifically
                Priority Mail Express, the only USPS service that
                accepts human cremated remains) for about $80&ndash;$200.
                They can also be carried in person on US domestic and
                most international flights &mdash; the TSA-recognized
                container is an X-ray-transparent urn (typically
                plastic, wood, or cardboard; not metal or stone).
                Print the death certificate or CROD to carry with you
                for any TSA questions.
              </p>
              <p>
                A memorial service can be held at home, on the
                family&rsquo;s schedule, weeks or months after the
                death. There is no requirement that the service
                follow the cremation immediately.
              </p>
              <p>
                <strong className="text-ink">When this isn&rsquo;t the right choice:</strong>{" "}
                religious traditions that require burial (most Jewish,
                Muslim, Eastern Orthodox traditions), strong family
                preference for a viewing, or specific country
                restrictions on cremation. Otherwise, this option
                routinely saves families $3,000&ndash;$15,000 with no
                meaningful sacrifice.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Death at sea</CardEyebrow>
            <CardTitle>The cruise ship scenario, and military at sea.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most large cruise ships have onboard morgue facilities
                that hold remains in cooled storage until the next
                US port. From there, the case becomes a standard
                out-of-state or international death, depending on
                where the ship docks.
              </p>
              <p>
                If the ship is at sea long enough to require an
                in-port emergency landing in a foreign country, the
                international rules above apply.
              </p>
              <p>
                <strong className="text-ink">Burial at sea</strong>{" "}
                of the full body is permitted under EPA rules more
                than 3 nautical miles from shore, with notification
                to the EPA within 30 days. Cremated remains can be
                scattered at sea with no permit required. Both options
                are common for US Navy veterans &mdash; the Navy
                offers free burial-at-sea services for eligible
                veterans and dependents (
                <a
                  href="https://www.mynavyhr.navy.mil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  mynavyhr.navy.mil
                </a>
                {" "}
                — search &ldquo;burial at sea&rdquo;).
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Specific common scenarios</CardEyebrow>
            <CardTitle>The four cases families call us about most.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">A college student dies at school.</strong>{" "}
                The college&rsquo;s dean of students or counseling
                office can connect the family to a local funeral home
                that handles student deaths regularly. Many
                universities will help coordinate with the receiving
                funeral home and may have a small fund for transport
                costs. Ask.
              </p>
              <p>
                <strong className="text-ink">A snowbird dies in their winter home.</strong>{" "}
                Very common in Florida, Arizona, Texas. Many families
                in this situation skip out-of-state transport entirely
                by doing direct cremation in the winter state and
                carrying the urn back. The deceased&rsquo;s legal
                home of record (not the death state) determines
                probate jurisdiction.
              </p>
              <p>
                <strong className="text-ink">A vacationing family member dies.</strong>{" "}
                Tourism-heavy areas have funeral homes that handle
                this routinely. The hotel or resort can often refer
                you. Beware of mark-ups specific to tourist areas
                &mdash; compare 2 or 3 shipping homes by phone, the
                same way you&rsquo;d compare at home.
              </p>
              <p>
                <strong className="text-ink">Active military overseas.</strong>{" "}
                The Department of Defense handles transport and
                paperwork for service members who die on active duty.
                This is fully covered and procedurally different from
                civilian repatriation &mdash; the military casualty
                assistance officer assigned to the family handles
                most decisions. Family doesn&rsquo;t need to arrange
                anything privately.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Watch out</CardEyebrow>
            <CardTitle>Three traps in the long-distance scenario.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">1. Don&rsquo;t wire money on the first phone call.</strong>{" "}
                Scams targeting families who&rsquo;ve just been
                notified of an out-of-state death are real. If
                anyone claiming to be a hospital, funeral home, or
                government official asks for an immediate wire
                transfer, hang up and call them back at a number
                you find independently (Google the institution).
              </p>
              <p>
                <strong className="text-ink">2. Double-quoted basic services.</strong>{" "}
                Some receiving funeral homes try to charge a full
                basic-services fee in addition to the shipping
                home&rsquo;s basic-services fee for the same case.
                The FTC Funeral Rule allows each to charge their own
                basic services, but the totals should reflect the
                division of work &mdash; not two full fees for the
                same case. Ask the receiving home to itemize what
                they&rsquo;re doing that the shipping home isn&rsquo;t.
              </p>
              <p>
                <strong className="text-ink">3. Mandatory caskets for shipping.</strong>{" "}
                Airlines require a specific shipping container (an
                &ldquo;air tray&rdquo; or &ldquo;combination unit&rdquo;).
                That container is included in transport cost; you do
                NOT have to buy a separate casket for shipping. A
                funeral home that says &ldquo;we need to put them in
                a casket for the flight&rdquo; is often selling you
                a casket you don&rsquo;t need.
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardTitle>When the body is home, the rest of our toolkit applies.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              Long-distance transport is the most unusual piece of a
              long-distance death. Everything after the body arrives
              &mdash; arrangement meeting, service decisions, 30-day
              paperwork, estate &mdash; works the same as for any
              local death.
            </p>
            <LinkButton href="/decide" size="lg">
              See what fits your situation →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not legal,
            medical, or financial advice. International repatriation
            requirements, embassy procedures, and airline transport
            rules change. Confirm current details with the US
            embassy or consulate in the country of death, the
            airline cargo division, and the chosen funeral homes
            before relying on anything here for a specific case.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
