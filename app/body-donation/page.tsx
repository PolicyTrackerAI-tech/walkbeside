import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { DONATION_PROGRAMS } from "@/lib/body-donation-programs";

import { ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Whole-body donation to medical science — what families need to know",
  description:
    "Whole-body donation is free, supports medical research, and skips the funeral home entirely. Honest guide to what's involved, where to register, and the risks of for-profit body brokers.",
  openGraph: { images: [ogImage("Whole-body donation to medical science", "Options")] },
};

/**
 * /body-donation — public, indexable page covering whole-body donation
 * to medical science. Service-type already exists in /decide; this is
 * the dedicated educational surface.
 */
export default function BodyDonationPage() {
  // Group programs by state for cleaner display
  const programsByState = DONATION_PROGRAMS.reduce<
    Record<string, typeof DONATION_PROGRAMS>
  >((acc, p) => {
    if (!acc[p.state]) acc[p.state] = [];
    acc[p.state].push(p);
    return acc;
  }, {});
  const sortedStates = Object.keys(programsByState).sort();

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Whole-body donation</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The body goes to medical science. The family pays
              nothing. There&rsquo;s no funeral home.
            </h1>
            <p className="text-lg text-ink-soft">
              Whole-body donation &mdash; donating the entire body to
              a medical school or research institute &mdash; is free,
              supports the next generation of doctors and researchers,
              and skips the funeral home entirely. Cremated remains
              are returned to the family 1&ndash;3 years later. About
              20,000 Americans donate their bodies every year.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>Whole-body donation is not the same as organ donation.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Organ donation</strong>{" "}
                means specific organs are recovered shortly after
                death (typically in a hospital) and transplanted into
                living recipients. The rest of the body is returned to
                the family for normal funeral arrangements. Most
                states ask about organ donation on driver&rsquo;s
                license applications.
              </p>
              <p>
                <strong className="text-ink">Whole-body donation</strong>{" "}
                means the entire body is donated to a medical school
                or research program for anatomy education, surgical
                training, or biomedical research. It happens AFTER
                death (usually within 24&ndash;48 hours), is arranged
                separately from organ donation, and replaces a
                conventional funeral.
              </p>
              <p>
                <strong className="text-ink">You can usually do both.</strong>{" "}
                If a person registers for organ donation AND
                whole-body donation, transplantable organs are
                recovered first, then the body goes to the donation
                program. Some programs decline donors who&rsquo;ve had
                organs recovered &mdash; ask the specific program.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Why families choose this</CardEyebrow>
            <CardTitle>Three reasons.</CardTitle>
            <ol className="space-y-3 mt-4 text-ink-soft list-decimal list-inside">
              <li>
                <strong className="text-ink">It&rsquo;s free.</strong>{" "}
                Reputable programs cover transport (within their
                service area), cremation, and return of remains.
                Total cost to the family: $0 in many cases. Compare
                to direct cremation at $800&ndash;$3,000 or a
                conventional funeral at $7,000&ndash;$15,000.
              </li>
              <li>
                <strong className="text-ink">It supports medical training.</strong>{" "}
                Every doctor, nurse, surgeon, and physical therapist
                in the US trained on a donated body. The bodies are
                treated with profound respect &mdash; medical schools
                hold annual memorial services to honor donors.
              </li>
              <li>
                <strong className="text-ink">No funeral home, no upsells.</strong>{" "}
                The program handles transport, paperwork, and
                disposition. The family doesn&rsquo;t walk into an
                arrangement meeting at all. Many families pair this
                with a memorial service held without the body
                present, on their own terms.
              </li>
            </ol>
          </Card>

          <Card tone="warn">
            <CardEyebrow>Reality check</CardEyebrow>
            <CardTitle>It&rsquo;s not always possible. Plan a backup.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Programs reject bodies for many reasons: communicable
                diseases (HIV, hepatitis, COVID-19 in some periods),
                obesity beyond a threshold (commonly BMI &gt; 35),
                certain cancers, recent autopsy, severe trauma, or
                prior organ donation that affected anatomical
                integrity. Acceptance rates vary &mdash; some programs
                accept 70%+ of applicants, others under 50%.
              </p>
              <p>
                <strong className="text-ink">Always have a Plan B.</strong>{" "}
                If the program declines after death, the family needs
                to fall back on direct cremation, burial, or another
                option &mdash; on a tight timeline. Talk to a funeral
                home in advance about being available as backup if
                the donation falls through. Some programs even
                require a backup arrangement be in place before they
                accept the donation.
              </p>
              <p>
                <strong className="text-ink">Pre-register if at all possible.</strong>{" "}
                Most programs strongly prefer donors to pre-register
                while alive (paperwork, medical history, signed
                consent). Some programs accept post-death donations
                from next of kin, but it&rsquo;s harder and slower.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>How it actually works</CardEyebrow>
            <CardTitle>The basic timeline.</CardTitle>
            <ol className="space-y-3 mt-4 text-ink-soft list-decimal list-inside">
              <li>
                <strong className="text-ink">Pre-registration (ideally before death).</strong>{" "}
                The future donor completes a registration packet:
                medical history, signed consent, choice of how
                remains will be returned. The program keeps this on
                file.
              </li>
              <li>
                <strong className="text-ink">Death and notification.</strong>{" "}
                When the person dies, the family calls the program&rsquo;s
                24-hour line. The program confirms acceptance based
                on cause of death and current condition.
              </li>
              <li>
                <strong className="text-ink">Transport (within 24&ndash;48 hours).</strong>{" "}
                The program arranges transport from the place of
                death (home, hospital, or hospice) to its facility.
                Most programs cover transport within a defined
                service area; longer distances may incur a fee.
              </li>
              <li>
                <strong className="text-ink">Use period (months to years).</strong>{" "}
                The body is used for anatomy education or research.
                Most universities use a single body for one academic
                year of student training; some research uses are
                shorter.
              </li>
              <li>
                <strong className="text-ink">Cremation and return of remains.</strong>{" "}
                After the use period, the body is cremated. Cremated
                remains are returned to the family (or scattered, per
                family preference) typically 1&ndash;3 years after
                death.
              </li>
              <li>
                <strong className="text-ink">Memorial service (optional, anytime).</strong>{" "}
                Families typically hold a memorial service at any
                time after death &mdash; immediately, when remains
                are returned, or somewhere in between. Many medical
                schools also host annual donor-memorial services.
              </li>
            </ol>
          </Card>

          <Card tone="warn">
            <CardEyebrow>Important warning</CardEyebrow>
            <CardTitle>Avoid private &ldquo;body brokers.&rdquo;</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                In addition to university programs, there are
                for-profit companies that solicit body donations.
                Some are legitimate; many are not. A multi-year{" "}
                <a
                  href="https://www.reuters.com/investigates/special-report/usa-bodies-brokers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  Reuters investigation
                </a>{" "}
                (2017&ndash;2018) revealed major ethical problems at
                several private programs &mdash; bodies sold for
                purposes families never consented to, parts shipped
                internationally, sometimes used for crash testing or
                ballistics research instead of medical training.
              </p>
              <p>
                <strong className="text-ink">Our recommendation:</strong>{" "}
                use a university medical school program or a
                hospital-affiliated research institute. They&rsquo;re
                regulated by the same medical-ethics oversight that
                covers other research at the institution. If a
                for-profit company contacts the family, ask: Are you
                accredited by AATB (American Association of Tissue
                Banks)? Will the body be used at a single
                institution or shipped to multiple buyers? Will
                remains be returned and how long does that take?
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Programs by state</CardEyebrow>
            <CardTitle>
              {DONATION_PROGRAMS.length} respected university and research programs.
            </CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              Below is a representative (not exhaustive) list of major
              US programs. Most US states have at least one medical
              school with a donation program; if your state
              isn&rsquo;t listed below, call your nearest medical
              school directly. All listed programs accept donations
              free of charge to the family.
            </p>
            <div className="space-y-5">
              {sortedStates.map((state) => (
                <div key={state}>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold mb-2">
                    {state}
                  </div>
                  <ul className="space-y-3">
                    {programsByState[state].map((p) => (
                      <li
                        key={p.name}
                        className="rounded-xl border border-border bg-surface px-4 py-3"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-ink underline-offset-2 hover:underline"
                          >
                            {p.name}
                          </a>
                          <a
                            href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}
                            className="text-sm text-ink-soft font-mono"
                          >
                            {p.phone}
                          </a>
                        </div>
                        <p className="text-sm text-ink-soft">{p.notes}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card tone="primary">
            <CardTitle>If body donation isn&rsquo;t the right fit, the toolkit still helps.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              Many families pair a memorial service with body
              donation, and use most of our other tools &mdash;
              obituary helper, notifications hub, 30-day checklist,
              estate guide. Even when there&rsquo;s no funeral home,
              there&rsquo;s still everything that comes after.
            </p>
            <LinkButton href="/decide" size="lg">
              See what fits your situation →
            </LinkButton>
          </Card>

          <div className="text-xs text-ink-muted space-y-2">
            <p>
              This page is general consumer information, not medical or
              legal advice. Donation acceptance criteria, fees, and
              timelines vary by program and change occasionally.
              Confirm current rules directly with the program before
              making decisions. We are not affiliated with any program
              listed and take no commissions, referral fees, or
              kickbacks from any program.
            </p>
            <p>
              <strong className="text-ink-soft">Run a program listed here?</strong>{" "}
              If anything is wrong, out of date, or you&rsquo;d
              prefer not to be included, email{" "}
              <a
                href="mailto:corrections@honestfuneral.co"
                className="text-primary-deep underline-offset-2 hover:underline"
              >
                corrections@honestfuneral.co
              </a>{" "}
              and we&rsquo;ll update or remove the listing within 48
              hours.
            </p>
          </div>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
