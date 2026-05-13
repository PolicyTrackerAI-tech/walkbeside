import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "When someone dies in hospice — what to expect, what to do, what families miss",
  description:
    "An honest guide to a hospice death. What the final days actually look like, what to do in the first 30 minutes after death (don't call 911), the handoff to the funeral home, and the grief specific to long illness.",
};

/**
 * /after-hospice — public, indexable cause-of-death-specific guide.
 * Complements /guidance/home-expected (which is the urgent 2-hour
 * action flow). This page is the longer-form informational page:
 * what to expect emotionally, what hospice does and doesn't do,
 * and the grief specific to long illness.
 */
export default function AfterHospicePage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>When someone dies in hospice</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The smoothest kind of death, and the things families still get wrong.
            </h1>
            <p className="text-lg text-ink-soft">
              About 1.7 million Americans die in hospice care each
              year &mdash; nearly half of all deaths in the US. Of
              every kind of death, hospice deaths involve the fewest
              decisions, the least paperwork, and the most warning.
              That said, families still make a handful of avoidable
              mistakes in the first hour. This page is what to expect
              and what to do.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>If you are reading this in real time</CardEyebrow>
            <CardTitle>
              Do not call 911. Call hospice first.
            </CardTitle>
            <p className="text-ink-soft mt-3">
              The single most common mistake families make in the
              moment of a hospice death is calling 911. That call
              triggers a paramedic response and, in some
              jurisdictions, a coroner investigation &mdash; turning a
              peaceful death into a chaotic one. The hospice agency
              has a 24-hour line. Call them. They will send a nurse to
              pronounce death, handle paperwork, and walk you through
              what happens next.{" "}
              <Link
                href="/guidance/home-expected"
                className="text-primary-deep underline"
              >
                If you need the immediate-action checklist, start here.
              </Link>
            </p>
          </Card>

          <Card>
            <CardEyebrow>The final days</CardEyebrow>
            <CardTitle>What dying actually looks like.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                In the last 7&ndash;14 days, most hospice patients
                stop eating and drinking. This is not the family
                failing to feed them and not the body suffering. The
                dying body cannot process food, and pushing food or
                fluids at this stage can cause discomfort, not
                comfort. Hospice nurses will explain this when it
                starts. It is normal.
              </p>
              <p>
                In the last 24&ndash;72 hours, breathing usually
                changes. Patterns include long pauses
                (Cheyne-Stokes breathing), shallow rapid breaths, and
                a wet rattling sound (sometimes called the
                &ldquo;death rattle&rdquo;) caused by saliva pooling
                in the throat that the body no longer clears. The
                rattle sounds distressing but does not appear to
                cause the dying person discomfort. Hospice will
                position the body and may suction lightly; aggressive
                suctioning is usually avoided.
              </p>
              <p>
                Hands and feet often become cool and mottled
                (purplish patches) as circulation pulls toward the
                core organs. Body temperature can rise and fall. The
                person may seem to talk to people who are not there
                or reach for things. Hospice nurses uniformly describe
                this as common and not a sign of pain or fear.
              </p>
              <p>
                Hearing is the last sense to go. Whatever you want to
                say, say it. They likely hear you.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The moment of death</CardEyebrow>
            <CardTitle>How you will know, and what to do next.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Death usually comes quietly. Breathing slows, then
                stops. The body relaxes. The eyes may stay slightly
                open. There is no machine, no alarm, no countdown.
                Families often miss the exact moment because the long
                pauses in breathing made every previous pause feel
                like the last.
              </p>
              <p>
                <strong className="text-ink">There is no rush.</strong>{" "}
                You do not have to call anyone in the first 10
                minutes. Sit with the body if you want. Many families
                wash the face, brush the hair, place a hand on the
                chest, light a candle, pray, or simply breathe.
                Whatever you do in that first hour is yours.
              </p>
              <p>
                <strong className="text-ink">When you are ready, call hospice.</strong>{" "}
                A hospice nurse will come to the home, pronounce
                death, and complete the medical portion of the death
                certificate. This visit usually takes 30&ndash;90
                minutes. The nurse will also call the funeral home
                you have chosen (or help you choose one), notify the
                physician, and dispose of any controlled medications
                in the home.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>What hospice does (and does not do)</CardEyebrow>
            <CardTitle>The handoff to the funeral home.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Hospice handles:</strong>{" "}
                pronouncement of death, medical portion of the death
                certificate, disposal of controlled medications,
                notification of the attending physician, support
                calls and bereavement check-ins (typically for 13
                months after death, included in Medicare hospice
                benefits).
              </p>
              <p>
                <strong className="text-ink">Hospice does not handle:</strong>{" "}
                transporting the body, the funeral home arrangement
                meeting, cremation or burial decisions, the personal
                portion of the death certificate, obituary, memorial
                planning, estate matters, or notifying Social
                Security and other agencies.
              </p>
              <p>
                The funeral home you choose takes physical custody of
                the body once hospice has pronounced. Most hospice
                agencies have relationships with local funeral homes
                and will recommend one. You are not required to use
                their recommendation. Prices among funeral homes in
                the same city often vary by 200% to 400% for the same
                services. Comparing two or three before you commit
                is the single most effective way to avoid being
                overcharged.{" "}
                <Link
                  href="/prices"
                  className="text-primary-deep underline"
                >
                  See current price ranges here.
                </Link>
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>The advantage of a hospice death</CardEyebrow>
            <CardTitle>You have time. Use it.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                A hospice death gives families something most kinds of
                death do not: warning. Days or weeks of warning.
                Families who use that warning to compare funeral home
                prices, write down preferences with the dying person,
                gather important documents, and notify out-of-town
                family in advance avoid almost all of the chaos that
                follows other kinds of death.
              </p>
              <p>
                Things worth doing while the person is still alive but
                in hospice:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Ask them, gently, what they want. Cremation or
                  burial. Service or no service. Music. Where to
                  scatter ashes if cremation.{" "}
                  <Link
                    href="/preferences"
                    className="text-primary-deep underline"
                  >
                    There is a preferences worksheet here.
                  </Link>
                </li>
                <li>
                  Locate their will, any pre-need funeral contracts,
                  life insurance policies, and account passwords.
                </li>
                <li>
                  Call two or three funeral homes and ask for their
                  General Price List. You are not committing to
                  anything.{" "}
                  <Link
                    href="/glossary/gpl"
                    className="text-primary-deep underline"
                  >
                    What a GPL is and why it matters.
                  </Link>
                </li>
                <li>
                  Notify the people who will need to fly in. Funerals
                  typically happen 5&ndash;10 days after death;
                  someone flying in from across the country may need
                  earlier notice than you think.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Common emotional reactions</CardEyebrow>
            <CardTitle>Relief and guilt arrive together.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Many families feel relief in the hours after a
                hospice death &mdash; relief that the suffering is
                over, relief that the long vigil has ended, relief
                that they can sleep through the night again. That
                relief is normal. It is not a betrayal of the person
                who died. Hospice chaplains and social workers will
                say this out loud if asked.
              </p>
              <p>
                Some families also describe feeling that their grief
                already happened. Anticipatory grief during a long
                illness can be as intense as the grief after death,
                and the death itself can feel like a quieter event
                than people expect. This is also normal.
              </p>
              <p>
                Others find the grief lands much later &mdash; weeks
                or months out, when the caregiving identity is gone
                and the days that used to revolve around the dying
                person are suddenly empty. Hospice bereavement
                programs run for 13 months for exactly this reason.
                The first anniversary, holidays, and the deceased&rsquo;s
                birthday are the most common hard days. Use the
                bereavement services. They are free and they are
                included in the Medicare hospice benefit.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The next 30 days</CardEyebrow>
            <CardTitle>The practical checklist.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Things that have to happen in the first month, in
                rough order:
              </p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  Funeral home arrangement meeting (typically within
                  48 hours of death).
                </li>
                <li>
                  Order 10&ndash;15 certified death certificates.{" "}
                  <Link
                    href="/glossary/death-certificate"
                    className="text-primary-deep underline"
                  >
                    Why so many.
                  </Link>
                </li>
                <li>
                  Service or memorial, if planned (typically 5&ndash;10
                  days after death).
                </li>
                <li>
                  Notify Social Security (usually the funeral home
                  reports the death, but the family separately applies
                  for{" "}
                  <Link
                    href="/survivor-benefits"
                    className="text-primary-deep underline"
                  >
                    survivor benefits
                  </Link>
                  ).
                </li>
                <li>
                  Notify employer (for bereavement leave and any life
                  insurance through work).
                </li>
                <li>
                  Notify banks, brokerages, retirement accounts,
                  pension administrator, life insurance companies.
                </li>
                <li>
                  Begin probate if there is a will or significant
                  assets.{" "}
                  <Link
                    href="/estate"
                    className="text-primary-deep underline"
                  >
                    State-by-state probate basics.
                  </Link>
                </li>
                <li>
                  Cancel subscriptions, change utility accounts,
                  forward mail.{" "}
                  <Link
                    href="/after/accounts-to-close"
                    className="text-primary-deep underline"
                  >
                    Accounts-to-close checklist.
                  </Link>
                </li>
                <li>
                  Veterans benefits if applicable.{" "}
                  <Link
                    href="/veterans"
                    className="text-primary-deep underline"
                  >
                    VA burial benefits and survivor pensions.
                  </Link>
                </li>
              </ol>
            </div>
          </Card>

          <Card tone="primary">
            <CardTitle>Our toolkit walks the family through the rest.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              The hospice death itself is usually the smoothest part.
              The 30 days after &mdash; the death certificates, the
              accounts, the probate, the survivor benefits &mdash;
              are where most families get overwhelmed. The toolkit
              handles that part.
            </p>
            <LinkButton href="/decide" size="lg">
              See what fits your situation →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical,
            legal, or financial advice. Hospice practices,
            Medicare benefits, and state-specific rules change.
            For a binding answer about a specific situation, talk to
            the hospice agency, the funeral home, and (for benefits)
            the Social Security Administration directly.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
