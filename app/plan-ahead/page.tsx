import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Plan ahead — pre-need funeral and estate planning for the still-living",
  description:
    "The death folder, advance directives, beneficiary designations, written funeral preferences, and what NOT to do (pre-paid funeral contracts). A clear playbook for planning before it's urgent.",
  openGraph: { images: [ogImage("Plan ahead — the pre-need playbook", "Planning")] },
};

/**
 * /plan-ahead — public, indexable. For people preparing for themselves
 * or helping aging parents. Different audience than the at-need flow:
 * calmer, more time, decisions can be made on weekends. Covers the four
 * pillars (medical, legal/financial, practical, funeral preferences)
 * plus the death folder and the conversation with family.
 *
 * Voice: neutral third-person; no FD-credibility tagline. Treats the
 * reader as a competent adult planning for their family, not as a
 * grieving customer.
 */
export default function PlanAheadPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Plan ahead</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The work to do now so your family doesn’t have to do it later.
            </h1>
            <p className="text-lg text-ink-soft">
              A weekend of planning while nothing is urgent saves your
              family the worst kind of decisions in the worst week of
              their lives. This page is the full playbook: medical,
              legal, practical, and funeral &mdash; in the right order,
              with the traps marked.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>The shape of complete planning</CardEyebrow>
            <CardTitle>Four pillars. Maybe a weekend total.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most adults end up with one of these pillars handled
                and three half-done. Together they make the family&rsquo;s
                first weeks dramatically easier:
              </p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Medical decisions</strong>{" "}
                  &mdash; advance directive, healthcare proxy, POLST if
                  appropriate. What you want, who decides if you can&rsquo;t.
                </li>
                <li>
                  <strong className="text-ink">Legal and financial</strong>{" "}
                  &mdash; will, beneficiary designations on every
                  account, durable power of attorney. Where the money
                  goes and who can act on your behalf.
                </li>
                <li>
                  <strong className="text-ink">Practical</strong>{" "}
                  &mdash; the death folder (list of accounts, passwords,
                  insurance policies, documents), the &ldquo;if I die&rdquo;
                  letter, location of important papers. The map your
                  family will need.
                </li>
                <li>
                  <strong className="text-ink">Funeral preferences</strong>{" "}
                  &mdash; written, not pre-paid. Burial vs. cremation,
                  service vs. no service, where, who.
                </li>
              </ol>
              <p>
                None of this is morbid &mdash; it&rsquo;s the kindest
                thing you can do for the people you love. Working
                through it tends to feel calming, not heavy.
              </p>
            </div>
          </Card>

          {/* PILLAR 1: Medical decisions */}
          <Card>
            <CardEyebrow>Pillar 1 — Medical decisions</CardEyebrow>
            <CardTitle>What you want if you can’t say so yourself.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Advance directive (living will).</strong>{" "}
                A legal document stating what kind of medical care you
                want if you can&rsquo;t communicate &mdash; specifically
                around end-of-life: ventilator, feeding tube, CPR,
                comfort-only care. Free from your state&rsquo;s
                attorney-general office or AARP. Most states accept the
                same form across hospitals.
              </p>
              <p>
                <strong className="text-ink">Healthcare proxy (medical POA).</strong>{" "}
                The person you name to make medical decisions when you
                can&rsquo;t. Often combined with the advance directive
                into one document. Pick someone who knows your wishes
                and is willing to advocate &mdash; a spouse or adult
                child is typical, but anyone you trust qualifies.
              </p>
              <p>
                <strong className="text-ink">POLST (if appropriate).</strong>{" "}
                Physician Orders for Life-Sustaining Treatment.
                Different from the advance directive: this is an actual
                medical order signed by a doctor, valid across care
                settings. Appropriate for people with a serious
                illness or expected life span under 12 months.
                Initiated by the treating physician.
              </p>
              <p>
                <strong className="text-ink">Where to keep it:</strong>{" "}
                signed original in your death folder, copies to your
                healthcare proxy, primary care doctor, and the hospital
                system where you receive care. A copy in the glove box
                of your car isn&rsquo;t crazy. The document only helps
                if someone can find it.
              </p>
            </div>
          </Card>

          {/* PILLAR 2: Legal & financial */}
          <Card>
            <CardEyebrow>Pillar 2 — Legal and financial</CardEyebrow>
            <CardTitle>The will, the beneficiaries, and one other thing.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">A will.</strong> If you
                have any meaningful assets, real estate, or minor
                children, you need one. Roughly 60% of US adults die
                without a will; state intestate-succession law then
                decides who inherits, regardless of what you would
                have wanted. Templates from Quicken WillMaker or
                LegalZoom work for simple cases (under $200). For
                blended families, real estate in multiple states, or
                trusts, hire a local estate attorney for a one-hour
                consult ($150&ndash;$400).
              </p>
              <p>
                <strong className="text-ink">Beneficiary designations &mdash; the thing most people miss.</strong>{" "}
                Life insurance, 401(k), IRA, pension, payable-on-death
                bank accounts, and transfer-on-death brokerage accounts
                pass to the named beneficiary{" "}
                <em>regardless of what your will says</em>. The will
                that leaves &ldquo;everything to my spouse&rdquo; is
                overridden by the IRA beneficiary form that still
                names your ex from 1998.
              </p>
              <p>
                Audit every account: log in, find the beneficiary
                designation, update if needed. Add a contingent
                beneficiary too (who inherits if the primary
                predeceases you).{" "}
                <Link
                  href="/glossary/beneficiary-designation"
                  className="text-primary-deep underline"
                >
                  More on why this matters.
                </Link>
              </p>
              <p>
                <strong className="text-ink">Durable power of attorney (financial POA).</strong>{" "}
                The legal document that lets someone you trust handle
                your finances if you become incapacitated. Different
                from a healthcare POA. Common state-specific forms
                exist; an attorney can draft one in an hour. Without
                it, the only path is a court-appointed guardianship
                &mdash; slow, expensive, and adversarial.
              </p>
            </div>
          </Card>

          {/* PILLAR 3: Practical (death folder) */}
          <Card>
            <CardEyebrow>Pillar 3 — The death folder</CardEyebrow>
            <CardTitle>The map your family will need.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                A &ldquo;death folder&rdquo; (or &ldquo;in case of
                emergency&rdquo; binder) is a single place your family
                can find everything they&rsquo;ll need in the first
                weeks. Physical folder or password-protected digital
                file &mdash; both work. The point is one location, not
                15 emails.
              </p>
              <p>
                <strong className="text-ink">What goes in it:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Identity documents:</strong>{" "}
                  birth certificate, Social Security card, driver&rsquo;s
                  license copy, passport, marriage certificate, divorce
                  decree if applicable, citizenship/naturalization
                  papers, military discharge papers (DD-214) for
                  veterans.
                </li>
                <li>
                  <strong className="text-ink">Legal documents:</strong>{" "}
                  will, advance directive, healthcare proxy, durable
                  power of attorney, any trusts. Original signed
                  copies.
                </li>
                <li>
                  <strong className="text-ink">Financial accounts:</strong>{" "}
                  a written list of every bank, brokerage, retirement,
                  credit card, and pension account &mdash; institution
                  name, account number (last 4 is enough), and the
                  beneficiary on file. Update annually.
                </li>
                <li>
                  <strong className="text-ink">Insurance policies:</strong>{" "}
                  life insurance, long-term care, disability,
                  homeowners. Policy numbers and carrier contact info.
                  This is where families most commonly miss money &mdash;
                  small group life insurance through work, a credit
                  card&rsquo;s included $5K policy, etc.
                </li>
                <li>
                  <strong className="text-ink">Real estate and titles:</strong>{" "}
                  deed to the home, vehicle titles, any property in
                  other states.
                </li>
                <li>
                  <strong className="text-ink">Digital access:</strong>{" "}
                  the master password to your password manager (sealed
                  in an envelope, or stored with the manager&rsquo;s
                  emergency-access feature). DO list email accounts and
                  cloud-storage accounts.{" "}
                  <Link
                    href="/digital-legacy"
                    className="text-primary-deep underline"
                  >
                    Full digital-legacy walkthrough.
                  </Link>
                </li>
                <li>
                  <strong className="text-ink">Subscriptions list:</strong>{" "}
                  rough list of recurring charges so your family can
                  cancel them. Reduces the surprise of finding 8
                  forgotten services after the credit card is closed.
                </li>
                <li>
                  <strong className="text-ink">Funeral preferences:</strong>{" "}
                  one page, written. See Pillar 4 below.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Where to keep it:</strong>{" "}
                NOT a safe-deposit box (banks often freeze access at
                death, and the family can&rsquo;t get in until probate
                opens). A fireproof home safe is ideal. Tell two
                people where it is and what the combination is.
              </p>
            </div>
          </Card>

          {/* The "If I die" letter */}
          <Card>
            <CardEyebrow>The “if I die” letter</CardEyebrow>
            <CardTitle>One page. Plain language. Hugely useful.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Separate from the formal legal documents, write one
                page of plain-language instructions for whoever finds
                this when you&rsquo;re gone. The legal stuff covers
                what happens to the money. This covers everything
                else.
              </p>
              <p>
                <strong className="text-ink">What to include:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Who to call first (spouse, then an adult child or
                  close friend, then an attorney if one is named).
                </li>
                <li>
                  Where the death folder is.
                </li>
                <li>
                  Funeral preferences in a sentence or two
                  (&ldquo;direct cremation, no service, scatter at
                  Crater Lake if practical&rdquo;).
                </li>
                <li>
                  Anything you want said at a service, or a song you
                  want played.
                </li>
                <li>
                  Pets &mdash; who takes them.
                </li>
                <li>
                  Any items with sentimental but not monetary value
                  that should go to specific people (works around
                  awkward will-versus-letter conflicts; the formal
                  will controls anything contested).
                </li>
                <li>
                  One short paragraph for the family &mdash; whatever
                  you&rsquo;d want them to hear. Many people find this
                  the hardest and most meaningful part to write. The
                  reading happens at the worst possible moment;
                  writing it for them is a gift.
                </li>
              </ul>
            </div>
          </Card>

          {/* PILLAR 4: Funeral preferences */}
          <Card>
            <CardEyebrow>Pillar 4 — Funeral preferences</CardEyebrow>
            <CardTitle>Written, not pre-paid.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most adults don&rsquo;t leave funeral preferences in
                writing, and the family then makes those decisions in
                the worst week of their lives, under sales pressure.
                Half an hour now solves that.
              </p>
              <p>
                <strong className="text-ink">What to write down:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Disposition:</strong>{" "}
                  burial, cremation, green burial, body donation,
                  aquamation. Most-searched questions are settled by
                  this single decision.
                </li>
                <li>
                  <strong className="text-ink">Service or no service:</strong>{" "}
                  some people want a funeral; some want a memorial
                  weeks later with cremated remains; some want
                  neither. There&rsquo;s no wrong answer; the family
                  just needs to know.
                </li>
                <li>
                  <strong className="text-ink">Religious tradition or none:</strong>{" "}
                  who officiates and what tradition the service
                  follows.
                </li>
                <li>
                  <strong className="text-ink">Where:</strong>{" "}
                  graveyard, scattering location, hometown vs. current
                  city. Particularly important if you&rsquo;ve moved
                  far from where the rest of the family lives.
                </li>
                <li>
                  <strong className="text-ink">Music and readings:</strong>{" "}
                  if any specific songs or readings matter, name them.
                </li>
                <li>
                  <strong className="text-ink">Budget guidance:</strong>{" "}
                  one of the most useful sentences you can write:{" "}
                  <em>&ldquo;Spend the least amount that lets the
                  family feel good about saying goodbye. I don&rsquo;t
                  want a $12,000 funeral.&rdquo;</em>{" "}
                  Or whatever the truth is. Families overpay because
                  they&rsquo;re afraid of seeming cheap; written
                  permission to be frugal is liberating.
                </li>
              </ul>
              <p>
                We have a structured worksheet for this:{" "}
                <Link
                  href="/preferences"
                  className="text-primary-deep underline"
                >
                  fill out preferences here
                </Link>{" "}
                and we&rsquo;ll generate a one-page printable for the
                death folder.
              </p>
            </div>
          </Card>

          {/* The pre-paid trap */}
          <Card tone="warn">
            <CardEyebrow>Watch out</CardEyebrow>
            <CardTitle>The pre-paid funeral plan trap.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                You&rsquo;ll be heavily marketed to by funeral homes
                offering pre-paid plans &mdash; sign now, lock in
                today&rsquo;s prices, your family won&rsquo;t have to
                think about it. They sound responsible. For most
                families, they are a worse deal than they appear.
              </p>
              <p>
                <strong className="text-ink">Why pre-paid often goes wrong:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Funeral homes change ownership, close, or refuse to
                  honor contracts decades later. Recovery can be
                  partial or zero.
                </li>
                <li>
                  Locking in services years in advance means the
                  family is stuck with whatever you picked, even if
                  preferences shift, location changes, or the family
                  would rather grieve their own way.
                </li>
                <li>
                  Many plans have steep cancellation fees and
                  don&rsquo;t transfer cleanly across state lines.
                </li>
                <li>
                  In some states a portion of pre-paid funds is not
                  protected by trust or insurance. If the funeral home
                  fails before the death, the money may be gone.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Better alternative:</strong>{" "}
                a will + the death folder + clear written preferences +
                a savings account labeled &ldquo;funeral&rdquo; with
                enough to cover direct cremation ($1,500&ndash;$3,000)
                or a basic burial ($5,000&ndash;$8,000). The family
                still has flexibility, the money is still yours, and
                no funeral home holds it.
              </p>
              <p>
                The Funeral Consumer Alliance maintains state-by-state
                guidance on pre-paid plan protections at{" "}
                <a
                  href="https://funerals.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  funerals.org
                </a>
                . If you&rsquo;re considering a pre-paid plan anyway,
                read it first.
              </p>
            </div>
          </Card>

          {/* Pre-need for special cases */}
          <Card>
            <CardEyebrow>Special cases</CardEyebrow>
            <CardTitle>Three categories worth specific attention.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Veterans.</strong>{" "}
                Honorable-discharge veterans qualify for free burial
                in a national cemetery, a free headstone or marker,
                a burial flag, and military honors. Pre-registering
                with the VA simplifies the family&rsquo;s work at
                death.{" "}
                <Link
                  href="/veterans"
                  className="text-primary-deep underline"
                >
                  Full guide to veterans burial benefits.
                </Link>
              </p>
              <p>
                <strong className="text-ink">Body donors.</strong>{" "}
                Whole-body donation to a medical school is free,
                supports research, and skips the funeral home. Most
                programs strongly prefer donors to pre-register while
                alive (medical history, signed consent). Acceptance
                isn&rsquo;t guaranteed; pre-registering with two
                programs and having a backup direct-cremation arrangement
                is the standard approach.{" "}
                <Link
                  href="/body-donation"
                  className="text-primary-deep underline"
                >
                  Full guide.
                </Link>
              </p>
              <p>
                <strong className="text-ink">Specific faith traditions.</strong>{" "}
                Jewish, Muslim, and several other traditions have
                specific requirements (timing, washing, no embalming,
                burial within 24 hours). If your tradition has rules
                your family doesn&rsquo;t know, write them in the
                death folder along with the contact for the
                appropriate burial society (chevra kadisha for
                Jewish, mosque burial coordinator for Muslim, etc.).
              </p>
            </div>
          </Card>

          {/* Talking to family */}
          <Card>
            <CardEyebrow>Talking to family</CardEyebrow>
            <CardTitle>One conversation. 20 minutes. Hard but worth it.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Documents are nothing without the family knowing they
                exist. Schedule one conversation &mdash; over coffee,
                on a walk, holiday dinner is bad &mdash; and cover
                three things:
              </p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Where the death folder is.</strong>{" "}
                  Physical location, combination if it&rsquo;s in a
                  safe, who else knows.
                </li>
                <li>
                  <strong className="text-ink">Who&rsquo;s in charge of what.</strong>{" "}
                  Executor, healthcare proxy, financial POA. People
                  named for those roles should know they were named
                  and what it means.
                </li>
                <li>
                  <strong className="text-ink">Funeral preferences in one sentence.</strong>{" "}
                  Just a vibe-level statement: &ldquo;keep it small,
                  cremation, no big service.&rdquo; The written page
                  has the details; the conversation just makes sure
                  no one is surprised.
                </li>
              </ol>
              <p>
                If you&rsquo;re helping an aging parent through this
                conversation, the most useful frame is{" "}
                <em>&ldquo;help me know what you want so I can do it
                right.&rdquo;</em> Most older adults welcome the
                conversation; they were waiting for someone to bring
                it up.
              </p>
            </div>
          </Card>

          {/* Tools we provide */}
          <Card tone="primary">
            <CardEyebrow>Tools we built for this</CardEyebrow>
            <CardTitle>Plug your preferences in once. Print, share, done.</CardTitle>
            <p className="text-ink-soft mt-3 mb-4">
              We have a structured preferences worksheet, a fair-price
              lookup, a glossary of funeral terms, and a one-page
              arrangement cheat sheet. All free, no account needed.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/preferences">
                Open the preferences worksheet →
              </LinkButton>
              <LinkButton href="/prices" variant="secondary">
                See fair prices for your zip
              </LinkButton>
              <LinkButton href="/glossary" variant="secondary">
                Browse the glossary
              </LinkButton>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer guidance, not legal, tax,
            or medical advice. State laws and form requirements vary,
            particularly for advance directives, wills, and pre-paid
            funeral contracts. For state-specific questions, talk to a
            licensed attorney; for medical-decision documents, talk to
            your primary care doctor.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
