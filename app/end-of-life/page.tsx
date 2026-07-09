import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { EmailCapture } from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "End of life — when you’re the one dying",
  description:
    "For people with a terminal diagnosis or in the last phase of a long illness. Palliative care vs hospice, advance directives, medical aid in dying where legal, comfort-vs-treatment decisions, and the practical things worth doing.",
  openGraph: { images: [ogImage("End of life — when you're the one dying", "Planning")] },
};

/**
 * /end-of-life — public, indexable. For the dying person, not the
 * caregivers (that's /final-days) or the well-and-planning audience
 * (/plan-ahead). Uses second-person where it helps — one of the few
 * pages on the site where "you" addresses the reader as the
 * patient, not the family.
 *
 * Voice: calm, direct, validating of every choice. Includes MAID
 * (medical aid in dying) where it's legal, with a careful distinction
 * between MAID eligibility (terminal diagnosis, capable adult) and
 * suicidal ideation in someone not terminally ill — those need
 * different responses.
 */
export default function EndOfLifePage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="end-of-life"
        title="End of life — when you're the one dying"
        description="For people with a terminal diagnosis. Palliative vs hospice, MAID where legal, treatment decisions, where to die, what to actually do with the time."
        eyebrow="Planning"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>End of life</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              For the person whose own death is coming.
            </h1>
            <p className="text-lg text-ink-soft">
              Most content about death is written for the family. This
              page is for you. If you&rsquo;ve been given a terminal
              diagnosis, are entering hospice, or are coming to the
              end of a long illness, this is what&rsquo;s in front of
              you medically, legally, and practically &mdash; and the
              things worth doing while there&rsquo;s still time.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>The first 2 weeks after a diagnosis</CardEyebrow>
            <CardTitle>Slow down. Don’t decide everything yet.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                A terminal diagnosis triggers a cascade of decisions
                that medical teams sometimes push to make quickly:
                accept treatment plan A or B, transfer to a specialist
                center, enroll in a clinical trial, start chemo
                immediately. Almost none of it is as urgent as it
                sounds in the first conversation.
              </p>
              <p>
                Most cancers, end-stage diseases, and other terminal
                conditions allow for a 1&ndash;2 week pause to gather
                information, get a second opinion, talk to family,
                and pick the path you actually want. Doctors will
                respect a thoughtful pause &mdash; many of them
                privately wish more patients took one.
              </p>
              <p>
                <strong className="text-ink">In the first two weeks:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Get the diagnosis in writing. Specifically the
                  prognosis (the estimated time, with a range), the
                  proposed treatment, and the proposed treatment&rsquo;s
                  realistic outcomes.
                </li>
                <li>
                  Get a second opinion. Most major cancer centers
                  (MD Anderson, Memorial Sloan Kettering, Mayo Clinic,
                  Dana-Farber) offer remote second-opinion programs
                  for $1,000&ndash;$3,000, sometimes covered by
                  insurance.
                </li>
                <li>
                  Read the recent research on your specific
                  diagnosis. Cancer.gov, PubMed abstracts, and disease-specific advocacy organizations (e.g. ALS
                  Association, Cystic Fibrosis Foundation) are the
                  most reliable sources. Avoid forum anecdotes and
                  pharmaceutical-company marketing pages.
                </li>
                <li>
                  Talk to your primary care doctor (not just the
                  specialist) about what you&rsquo;re considering.
                  They&rsquo;ve known you longer and may have a less
                  treatment-aligned perspective.
                </li>
              </ul>
            </div>
          </Card>

          {/* Palliative vs hospice */}
          <Card>
            <CardEyebrow>Palliative care vs hospice</CardEyebrow>
            <CardTitle>Most people confuse these. They’re different.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Palliative care</strong>{" "}
                is comfort-focused care that can run alongside
                active treatment. You can have palliative care for
                a serious illness while still doing chemotherapy,
                surgery, or other curative treatment. Goal:
                manage symptoms (pain, nausea, fatigue, anxiety,
                shortness of breath) so the treatment is bearable
                and your quality of life is as high as it can be.
                Available at any stage of illness, including very
                early. Most major hospitals have a palliative-care
                team you can request a consult with.
              </p>
              <p>
                <strong className="text-ink">Hospice</strong> is also
                comfort-focused care, but it&rsquo;s for the final
                phase &mdash; when continued treatment isn&rsquo;t
                working or you&rsquo;ve decided to stop. Hospice
                eligibility under Medicare requires a physician to
                certify a life expectancy of 6 months or less. To
                enter hospice you stop active curative treatment for
                the terminal illness (you can still be treated for
                unrelated conditions). Hospice covers all medications,
                equipment, nurse and aide visits, social workers,
                chaplains, and 13 months of bereavement support for
                your family after death.
              </p>
              <p>
                <strong className="text-ink">The transition between them</strong>{" "}
                is usually a single conversation: &ldquo;treatment
                isn&rsquo;t working / isn&rsquo;t worth the side
                effects / isn&rsquo;t what I want to keep doing.&rdquo;
                Many patients find that switching from active treatment
                to hospice produces an immediate quality-of-life
                gain &mdash; the side effects stop, the appointments
                drop to one or two a week, the focus changes from
                fighting to living.
              </p>
              <p>
                The median length of US hospice care is about 18
                days, but the benefit is designed for 6 months.
                Earlier hospice = more relief for you and more
                support for your family. Almost no one regrets going
                in early; many regret waiting.
              </p>
            </div>
          </Card>

          {/* Treatment decisions */}
          <Card>
            <CardEyebrow>The treatment-or-not decision</CardEyebrow>
            <CardTitle>The question that matters more than the diagnosis.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Medical systems are oriented toward action. Every
                new treatment is presented as something to be done.
                Choosing comfort-only care &mdash; stopping or
                declining treatment that has poor odds, severe side
                effects, or low quality-of-life gains &mdash; is a
                legitimate medical choice, and one that doctors do
                not always present clearly.
              </p>
              <p>
                <strong className="text-ink">Questions worth asking before any treatment:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  How likely is this to extend my life, by how long,
                  and at what quality of life?
                </li>
                <li>
                  What are the most common side effects, how severe,
                  how long do they last?
                </li>
                <li>
                  What does the next 6 months look like if I do this
                  vs. if I don&rsquo;t?
                </li>
                <li>
                  Is this curative, or is it slowing the disease?
                </li>
                <li>
                  At what point do most patients in my situation
                  decide to stop this treatment?
                </li>
                <li>
                  Would you, the doctor, take this treatment if you
                  were me? (Surveys of oncologists show that doctors
                  routinely decline aggressive end-of-life treatments
                  for themselves that they recommend for patients.)
                </li>
              </ul>
              <p>
                None of this is morbid. It&rsquo;s how you find out
                what you&rsquo;re actually being offered.
              </p>
            </div>
          </Card>

          {/* MAID */}
          <Card tone="warn">
            <CardEyebrow>Medical aid in dying (MAID)</CardEyebrow>
            <CardTitle>Where it’s legal, and what it actually involves.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">First, an important distinction.</strong>{" "}
                Medical aid in dying (MAID, also called &ldquo;death
                with dignity&rdquo; or &ldquo;end-of-life options&rdquo;)
                is a legal medical option for people who already have
                a documented terminal illness with a prognosis of 6
                months or less. It is not the same as suicidal
                ideation in someone who is not terminally ill.
                If you&rsquo;re having thoughts of ending your life
                and you are not terminally ill, please call or text{" "}
                <strong className="text-ink">988</strong> &mdash;
                that&rsquo;s a different situation that deserves a
                different response.
              </p>
              <p>
                <strong className="text-ink">Where it&rsquo;s legal as of 2026:</strong>{" "}
                Oregon, Washington, Vermont, California, Colorado,
                DC, Hawaii, Maine, New Jersey, New Mexico, and
                Montana (court-recognized, no formal statute). Most
                states have a residency requirement, though Oregon and
                Vermont have removed theirs. A handful of additional
                states have legislation in active consideration.
              </p>
              <p>
                <strong className="text-ink">Eligibility (typical, varies by state):</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Adult (18+).
                </li>
                <li>
                  Terminal diagnosis with prognosis of 6 months or
                  less, certified by two physicians.
                </li>
                <li>
                  Mentally capable of making and communicating
                  healthcare decisions.
                </li>
                <li>
                  Two oral requests (some states require a waiting
                  period between them) and one written request,
                  witnessed.
                </li>
                <li>
                  Capable of self-administering the medication.
                </li>
                <li>
                  State residency (in states that require it).
                </li>
              </ul>
              <p>
                <strong className="text-ink">What it involves:</strong>{" "}
                a prescription for a barbiturate-based medication
                that you take orally at a time you choose. It
                works within minutes; the person typically falls
                asleep and dies peacefully. The process from first
                request to receiving the medication usually takes
                15&ndash;30 days depending on state. About one-third
                of people who receive the medication never take it
                &mdash; many describe the comfort of having the
                option as the point.
              </p>
              <p>
                <strong className="text-ink">Two organizations to know:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Compassion &amp; Choices</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://compassionandchoices.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    compassionandchoices.org
                  </a>
                  . The largest US end-of-life-options advocacy
                  organization. Free consultation, state-specific
                  guidance, lists of participating physicians.
                </li>
                <li>
                  <strong className="text-ink">Death With Dignity</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://deathwithdignity.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    deathwithdignity.org
                  </a>
                  . Focused on policy and state-specific procedural
                  guidance.
                </li>
              </ul>
            </div>
          </Card>

          {/* Legal & medical paperwork */}
          <Card>
            <CardEyebrow>The legal documents</CardEyebrow>
            <CardTitle>Three pieces of paper that prevent later harm.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Advance directive / healthcare proxy.</strong>{" "}
                  States what you want medically if you can&rsquo;t
                  communicate, and names the person who decides for
                  you. If you don&rsquo;t have one, sign it this week.
                  Free forms from your state&rsquo;s attorney-general
                  office or AARP.
                </li>
                <li>
                  <strong className="text-ink">POLST.</strong>{" "}
                  Physician Orders for Life-Sustaining Treatment.
                  This is an actual medical order, signed by you and
                  your doctor, that paramedics and ER staff must
                  follow. Particularly important if you don&rsquo;t
                  want CPR, intubation, or hospitalization in a
                  crisis. Initiated by your treating physician.
                </li>
                <li>
                  <strong className="text-ink">Will + beneficiary designations.</strong>{" "}
                  This isn&rsquo;t for you, it&rsquo;s for your
                  family &mdash; so they&rsquo;re not
                  ambushed by paperwork while they&rsquo;re grieving.
                  Update beneficiary forms on retirement accounts,
                  life insurance, and bank accounts (they override
                  the will).{" "}
                  <Link
                    href="/plan-ahead"
                    className="text-primary-deep underline"
                  >
                    Full pre-need planning guide.
                  </Link>
                </li>
              </ol>
              <p>
                If any one of these feels overwhelming, do them in
                order. Advance directive first &mdash; it&rsquo;s the
                shortest and matters in the next medical crisis.
                POLST when you have a doctor visit anyway. Will
                whenever there&rsquo;s an afternoon.
              </p>
            </div>
          </Card>

          {/* Where to die */}
          <Card>
            <CardEyebrow>Where you want to be</CardEyebrow>
            <CardTitle>Three settings. Most people prefer one. Few get it.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                About 70% of Americans say they would prefer to die
                at home. About 30% actually do. The biggest reason
                for the gap is unanticipated 911 calls in the final
                hours and lack of in-home support.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">At home</strong> &mdash;
                  possible with hospice in place. Requires at least
                  one capable caregiver or rotating family help.
                  Hospice provides medications, equipment, and a
                  24-hour line. Most peaceful option for most people.
                </li>
                <li>
                  <strong className="text-ink">Hospice inpatient facility</strong>{" "}
                  &mdash; some hospice agencies have residential
                  facilities for people without home support, or for
                  short stays during difficult symptom management.
                  Quiet, low-medical-intensity environment. Often
                  feels more like a guest house than a hospital.
                </li>
                <li>
                  <strong className="text-ink">Hospital</strong>{" "}
                  &mdash; the default if no plan is made and you
                  aren&rsquo;t on hospice. Highest-intensity
                  environment, often the least peaceful, sometimes
                  with last-day interventions you didn&rsquo;t want.
                </li>
              </ul>
              <p>
                Pick one and write it down. Tell your family. Tell
                your doctor. Put it in the advance directive. The
                decision becomes much harder to override if you&rsquo;ve
                stated it in writing in advance.
              </p>
            </div>
          </Card>

          {/* The practical things to do */}
          <Card tone="primary">
            <CardEyebrow>What you might want to do</CardEyebrow>
            <CardTitle>Things people consistently report mattering.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Hospice chaplains, palliative-care doctors, and
                grief researchers have asked dying people what
                mattered. The lists vary, but a few items show up
                over and over:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Letters.</strong>{" "}
                  To each person you love. Written by hand if you
                  can. Not for them to read now &mdash; for them to
                  read later, when they need it.
                </li>
                <li>
                  <strong className="text-ink">Recorded voice memos or videos.</strong>{" "}
                  10 minutes is enough. Tell a story. Say what you
                  want them to remember. Grandchildren who won&rsquo;t
                  meet you can hear you this way. The voice itself
                  is what matters &mdash; the words are secondary.
                </li>
                <li>
                  <strong className="text-ink">Funeral preferences in writing.</strong>{" "}
                  Burial or cremation. Service or no service. Music
                  if you have a song. Where ashes should go. Budget
                  permission (&ldquo;keep it modest&rdquo; is one of
                  the most useful things you can write).{" "}
                  <Link
                    href="/worksheet"
                    className="text-primary-deep underline"
                  >
                    Preferences worksheet here.
                  </Link>
                </li>
                <li>
                  <strong className="text-ink">Forgiveness conversations.</strong>{" "}
                  The four sentences hospice chaplain Ira Byock
                  identifies as the most important to say to anyone
                  before you die:{" "}
                  <em>I forgive you. Please forgive me. Thank you. I
                  love you.</em>{" "}
                  Most patients describe these conversations as the
                  most meaningful part of their final months.
                </li>
                <li>
                  <strong className="text-ink">Time outside.</strong>{" "}
                  If you can, regularly. A bench, a porch, a window.
                  The natural world is consistently named as where
                  dying people want to be.
                </li>
                <li>
                  <strong className="text-ink">A meal that mattered.</strong>{" "}
                  With one or two specific people. Not a big crowd.
                  Just the meal.
                </li>
              </ul>
              <p>
                You do not have to do any of this. Many people choose
                a quieter ending &mdash; reading, sleeping, watching
                old movies with one person in the room. The point of
                this list is options, not a checklist.
              </p>
            </div>
          </Card>

          {/* Telling family / the conversation */}
          <Card>
            <CardEyebrow>Talking to family</CardEyebrow>
            <CardTitle>How to say it. How to keep saying it.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                You don&rsquo;t have to be the strong one. Most
                families describe being grateful when the dying
                person stopped trying to protect them and started
                being honest about what they were feeling. The
                pretending is exhausting for both sides.
              </p>
              <p>
                <strong className="text-ink">Useful sentences:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  &ldquo;I&rsquo;m scared and I&rsquo;d like company.&rdquo;
                </li>
                <li>
                  &ldquo;Some days I&rsquo;m fine. Today is not one.&rdquo;
                </li>
                <li>
                  &ldquo;I want to talk about this. Most people are
                  too uncomfortable. Can you be the person I talk to?&rdquo;
                </li>
                <li>
                  &ldquo;I don&rsquo;t want to talk about it right now.
                  I want to watch a movie.&rdquo;
                </li>
                <li>
                  &ldquo;I&rsquo;ve decided to stop treatment. I need
                  you to support this even if you wouldn&rsquo;t make
                  the same choice.&rdquo;
                </li>
              </ul>
              <p>
                If family disagrees with your choices &mdash; about
                stopping treatment, about MAID, about where to die,
                about anything &mdash; you don&rsquo;t owe them
                agreement. Their grief is real but their grief is
                theirs. The hospice social worker or a family therapist
                can help mediate. Asking for that help is not a
                weakness.
              </p>
              <p>
                If you have young children or grandchildren, the
                children&rsquo;s book{" "}
                <em>The Goodbye Book</em> by Todd Parr is a gentle
                opener. More on age-appropriate conversations in our{" "}
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  talking-to-kids guide
                </Link>{" "}
                &mdash; written for parents, but useful for you to
                read so you can guide whoever talks to them.
              </p>
            </div>
          </Card>

          {/* Spiritual / existential */}
          <Card>
            <CardEyebrow>Spiritual and existential support</CardEyebrow>
            <CardTitle>You don’t have to be religious to want this.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Whatever your relationship to religion, the period
                between diagnosis and death often raises questions
                that aren&rsquo;t medical: what was this life for,
                what happens next, what do I want to be remembered
                for, what unfinished business matters. These
                questions are real even for people who don&rsquo;t
                hold religious beliefs.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Hospice chaplains</strong>{" "}
                  are available to every hospice patient and family.
                  They&rsquo;re explicitly trained to support people
                  of any faith, mixed faith, or no faith. They do not
                  evangelize. They sit with whatever you bring.
                  Visits are included in the hospice benefit; ask.
                </li>
                <li>
                  <strong className="text-ink">Death cafes</strong>{" "}
                  &mdash; informal community gatherings where people
                  discuss death and dying over coffee and cake. No
                  agenda, no religion. Started in 2011, now in dozens
                  of countries. Find one at{" "}
                  <a
                    href="https://deathcafe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    deathcafe.com
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-ink">The Conversation Project</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://theconversationproject.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    theconversationproject.org
                  </a>
                  . Free conversation guides for talking with family
                  about end-of-life wishes.
                </li>
                <li>
                  <strong className="text-ink">Books often loaned to dying patients:</strong>{" "}
                  &ldquo;Being Mortal&rdquo; by Atul Gawande,
                  &ldquo;When Breath Becomes Air&rdquo; by Paul
                  Kalanithi, &ldquo;On Living&rdquo; by Kerry
                  Egan (a hospice chaplain&rsquo;s observations).
                </li>
              </ul>
            </div>
          </Card>

          {/* Related */}
          <Card>
            <CardEyebrow>Related guides</CardEyebrow>
            <ul className="space-y-2 list-disc pl-5 text-ink-soft mt-3">
              <li>
                <Link
                  href="/plan-ahead"
                  className="text-primary-deep underline"
                >
                  Pre-need planning playbook
                </Link>{" "}
                &mdash; the four-pillar weekend project for getting
                paperwork in order.
              </li>
              <li>
                <Link
                  href="/final-days"
                  className="text-primary-deep underline"
                >
                  Caring for someone who is dying
                </Link>{" "}
                &mdash; for the people around you. Worth sharing.
              </li>
              <li>
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  Talking to children about death
                </Link>{" "}
                &mdash; for parents or grandchildren.
              </li>
              <li>
                <Link
                  href="/body-donation"
                  className="text-primary-deep underline"
                >
                  Whole-body donation
                </Link>{" "}
                &mdash; if it&rsquo;s something you&rsquo;re
                considering; pre-registration is strongly preferred
                by most programs.
              </li>
            </ul>
          </Card>

          <Card tone="primary">
            <CardTitle>When the day comes, your family won’t be doing this alone.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              The arrangement meeting, the 30-day paperwork, the
              estate &mdash; those are the parts that overwhelm
              families. Honest Funeral walks them through it. You can
              share this site with your family now so they have it
              when they need it.
            </p>
            <LinkButton href="/" size="lg">
              See how we help families →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical,
            legal, or psychological advice. End-of-life decisions
            are individual; your medical team, palliative-care
            physicians, hospice social workers, and chaplains are
            the right people for specific guidance. If you are not
            terminally ill and are having thoughts of ending your
            life, call or text 988 (Suicide &amp; Crisis Lifeline)
            &mdash; that is a different situation that deserves
            different support.
          </p>

          <EmailCapture
            source="end-of-life"
            title="Save this."
            subtitle="Whatever you do with the time, we won't ask you to come back here. The guide is yours; we'll just hold it for you."
            buttonLabel="Email me this guide"
            successMessage="It's in your inbox. Be well."
          />

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
