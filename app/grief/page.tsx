import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Grief, month by month — what to expect, when to get help, where to find it",
  description:
    "The shape of grief over weeks, months, and years. Why month 6 is often harder than month 1. How to find a grief therapist or support group. The warning signs that grief has become complicated. Honest, plain-language guide.",
};

/**
 * /grief — public, indexable. The "year-long arc" companion to the
 * 30-day at-need flow. Practical info on what grief looks like over
 * time, when to seek professional help, and where to find support.
 * No sister voice; factual references to published grief research
 * and named national organizations.
 */
export default function GriefPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Grief, month by month</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The first year is hard. The second year is often harder.
            </h1>
            <p className="text-lg text-ink-soft">
              Most of what families read in the first week is about the
              first month &mdash; the funeral, the paperwork, the
              accounts. Almost nothing prepares people for what
              happens after the casseroles stop arriving and everyone
              else&rsquo;s life goes back to normal. This page is
              about the year after that.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>If you are in crisis right now</CardEyebrow>
            <CardTitle>988 is staffed 24 hours. Anyone can call. It is not only for suicide.</CardTitle>
            <p className="text-ink-soft mt-3">
              The Suicide & Crisis Lifeline at <strong className="text-ink">988</strong>{" "}
              (call or text) is staffed by trained counselors and is
              free, confidential, and available 24 hours a day. It
              handles any mental-health crisis &mdash; not only
              suicidal thoughts. Grief that is becoming
              unmanageable is one of the most common reasons people
              call. You do not have to be in immediate danger.
            </p>
          </Card>

          <Card>
            <CardEyebrow>The shape of grief</CardEyebrow>
            <CardTitle>It is not a staircase. It is a wave.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The &ldquo;five stages of grief&rdquo; (denial, anger,
                bargaining, depression, acceptance) is the most widely
                cited model and the least supported by research.
                Elisabeth K&uuml;bler-Ross wrote it in 1969 to describe
                terminally ill patients facing their own death, not
                bereaved family members &mdash; and she later said
                publicly that she regretted how it had been applied.
                Decades of grief research since have not found a
                linear, universal sequence of stages.
              </p>
              <p>
                What researchers do find: grief is a wave that comes
                in irregular intervals, gradually with longer gaps
                between waves over years. Some weeks are nearly
                normal. Some are wholly underwater. Triggers (a
                song, a photo, an anniversary, a stranger&rsquo;s
                voice) can return the wave to full intensity
                temporarily.
              </p>
              <p>
                Most grief researchers now use a model closer to:{" "}
                <strong className="text-ink">acute grief</strong>{" "}
                in the first months (intense, intrusive, daily) →{" "}
                <strong className="text-ink">integrated grief</strong>{" "}
                over months to years (the loss is held alongside the
                rest of life, not at the center every day). For
                about 10% of bereaved adults, grief becomes{" "}
                <strong className="text-ink">complicated</strong>{" "}
                &mdash; persistent, severe, and interfering with
                daily life past 12 months. That is now a recognized
                clinical condition (Prolonged Grief Disorder in
                DSM-5-TR; Prolonged Grief Disorder in ICD-11) and
                responds well to treatment.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The timeline most families don&rsquo;t know about</CardEyebrow>
            <CardTitle>Month 1 to month 13.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Weeks 0&ndash;2: shock and logistics.</strong>{" "}
                Adrenaline carries most people through the funeral,
                the paperwork, the casseroles, the visitors. Sleep
                is often broken; appetite is unreliable. People
                describe feeling unreal, like watching themselves
                from outside.
              </p>
              <p>
                <strong className="text-ink">Weeks 3&ndash;8: the first hard drop.</strong>{" "}
                Visitors stop coming. The casseroles stop arriving.
                Other people&rsquo;s lives have gone back to normal.
                The thank-you notes are still unwritten. The bank,
                the credit card company, and Social Security are
                still asking for more paperwork. Many people
                describe this as the period when the death finally
                feels real.
              </p>
              <p>
                <strong className="text-ink">Months 3&ndash;6: the disappearance of social support.</strong>{" "}
                Most people experience a measurable drop in support
                from friends and family around month 3. Workplaces
                expect normal performance. Doctors who were
                solicitous in the first weeks stop asking. Many
                bereaved spouses and parents describe this as the
                loneliest stretch &mdash; the grief is still acute
                but no longer socially visible.
              </p>
              <p>
                <strong className="text-ink">Month 6: a measurable wall.</strong>{" "}
                Researchers track a spike in bereaved adults seeking
                mental-health care around month 6. The deceased is
                no longer freshly gone (the practical urgency is
                over) but the person is still dead and they always
                will be. Many bereaved spouses describe a
                second-grief at the same time &mdash; grief for the
                self they used to be alongside the deceased, not
                only grief for the person.
              </p>
              <p>
                <strong className="text-ink">Months 9&ndash;12: the &ldquo;firsts.&rdquo;</strong>{" "}
                The first birthday without them. The first
                anniversary. The first holidays. The first season
                turn. Each is harder than the bereaved usually
                expects. Planning the firsts in advance (where you
                want to be, who you want with you, whether you want
                to mark the day or escape it) helps.
              </p>
              <p>
                <strong className="text-ink">Month 13 and after.</strong>{" "}
                The first anniversary of the death is often
                anticipated as a wall and turns out to be a step
                down rather than a flatline. Most bereaved people
                describe the second year as different from the
                first, not necessarily easier &mdash; the grief is
                less constant but the absence is more permanent. The
                shape continues to slowly soften over years.
              </p>
            </div>
          </Card>

          <Card tone="warn">
            <CardEyebrow>When to get professional help</CardEyebrow>
            <CardTitle>The warning signs that warrant a call.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Grief is not a mental illness. Most bereaved adults
                do not need professional treatment. The warning signs
                that suggest professional support would help:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Persistent inability to function in daily life
                  (work, basic self-care, parenting) past 6&ndash;8
                  weeks.
                </li>
                <li>
                  Sleep is severely disrupted past 6&ndash;8 weeks
                  &mdash; less than 4 hours a night, or sleeping 12+
                  hours and unable to get out of bed.
                </li>
                <li>
                  Strong, persistent wishes to die or to be with the
                  deceased &mdash; any age, any duration, this
                  warrants a same-day call.
                </li>
                <li>
                  New or escalating substance use as the primary way
                  of coping.
                </li>
                <li>
                  Severe physical symptoms with no medical
                  explanation (chest pain, breathing trouble,
                  digestive issues) persisting past 8 weeks.
                </li>
                <li>
                  At 12 months, grief is still acute, intrusive, and
                  interfering with daily life &mdash; this is the
                  threshold for Prolonged Grief Disorder, a
                  treatable condition.
                </li>
                <li>
                  Feeling worse, not slowly better, at 6 months and
                  again at 9.
                </li>
                <li>
                  Frequent or vivid intrusive memories of finding the
                  body, witnessing the death, or being told the news
                  &mdash; if these persist past 3 months they may
                  indicate trauma in addition to grief.
                </li>
              </ul>
              <p>
                If a child of any age is showing these signs, see{" "}
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  the children&rsquo;s grief guide
                </Link>
                .
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Finding a grief therapist</CardEyebrow>
            <CardTitle>Specific search terms, specific directories.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Not all therapists are trained in grief. Searching for
                a generic therapist who happens to take new clients
                often produces someone competent but not specifically
                helpful for grief. Filter for &ldquo;grief and loss&rdquo;
                or &ldquo;bereavement&rdquo; as a specialty.
              </p>
              <p>
                <strong className="text-ink">Psychology Today directory.</strong>{" "}
                <a
                  href="https://www.psychologytoday.com/us/therapists"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  psychologytoday.com/us/therapists
                </a>
                . Filter by zip code, insurance accepted, and
                specialty &mdash; look for grief, bereavement, or
                complicated grief. Free to use; therapists pay to
                list. Most US therapists with online presence are
                here.
              </p>
              <p>
                <strong className="text-ink">Association for Death Education and Counseling (ADEC).</strong>{" "}
                <a
                  href="https://www.adec.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  adec.org
                </a>
                . The certifying body for grief counselors and
                educators. Their directory lists Certified Thanatologists
                and Fellows in Thanatology &mdash; clinicians with
                explicit grief training.
              </p>
              <p>
                <strong className="text-ink">The Compassionate Friends therapist directory</strong>{" "}
                &mdash; for parents grieving a child specifically.
              </p>
              <p>
                <strong className="text-ink">Insurance.</strong> If
                cost is a barrier, call the number on the back of the
                insurance card and ask for a list of in-network
                therapists with grief specialty. Most plans now
                cover therapy at the same cost as any other medical
                visit. Many therapists offer sliding-scale fees for
                clients without insurance &mdash; ask.
              </p>
              <p>
                <strong className="text-ink">Open Path Collective.</strong>{" "}
                <a
                  href="https://openpathcollective.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  openpathcollective.org
                </a>{" "}
                lists therapists offering $40&ndash;$80 sessions for
                a one-time $65 membership fee. Reliable safety net
                for the uninsured.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Free support groups</CardEyebrow>
            <CardTitle>By type of loss.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Support groups serve a different purpose than therapy:
                the value is community with other people who actually
                understand. Most are free, lay-led, and meet weekly.
              </p>
              <p>
                <strong className="text-ink">General grief.</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">GriefShare</strong>{" "}
                  &mdash; 13-week peer support groups, Christian
                  framework, free, meets nationally. Find a group at{" "}
                  <a
                    href="https://www.griefshare.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    griefshare.org
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-ink">Hospice bereavement groups</strong>{" "}
                  &mdash; if the death involved hospice, the hospice
                  agency runs free bereavement groups for 13 months
                  after death, included in the Medicare hospice
                  benefit. Open to family even if you live in a
                  different city than the hospice was in.
                </li>
                <li>
                  <strong className="text-ink">Modern Loss</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://modernloss.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    modernloss.com
                  </a>
                  . Online community, essays, and resources. Less
                  group-meeting, more comfort-in-reading.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Loss of a spouse or partner.</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Soaring Spirits International</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.soaringspirits.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    soaringspirits.org
                  </a>
                  . Widowed-only community, regional chapters,
                  weekend retreats. Spouse-specific.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Loss of a child.</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">The Compassionate Friends</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.compassionatefriends.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    compassionatefriends.org
                  </a>
                  . Parents and siblings of children of any age
                  (including adult children). Largest US bereaved-parent
                  community.
                </li>
                <li>
                  <strong className="text-ink">M.E.N.D. (mommies enduring neonatal death)</strong>{" "}
                  for stillbirth and infant loss specifically.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Loss by suicide.</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Alliance of Hope for Suicide Loss Survivors</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://allianceofhope.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    allianceofhope.org
                  </a>
                  . Online forum and resources designed by and for
                  suicide-loss survivors.
                </li>
                <li>
                  <strong className="text-ink">American Foundation for Suicide Prevention (AFSP)</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://afsp.org/find-a-support-group"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    afsp.org/find-a-support-group
                  </a>
                  . Directory of in-person and online support groups
                  by location.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Loss by overdose.</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">GRASP (Grief Recovery After a Substance Passing)</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://grasphelp.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    grasphelp.org
                  </a>
                  . National network of in-person and online support
                  groups specifically for overdose loss.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Grief at work</CardEyebrow>
            <CardTitle>Bereavement leave is a benefit, not a federal right.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                There is no federal law requiring bereavement leave.
                A handful of states (California, Illinois, Maryland,
                Oregon, Washington as of 2026) have passed
                bereavement-leave laws &mdash; most apply only to
                employers above a certain size and most cap leave at
                3&ndash;5 days. The federal Family and Medical Leave
                Act (FMLA) does not cover bereavement.
              </p>
              <p>
                In practice most US employers offer 3 to 5 days of
                paid bereavement leave for the death of an immediate
                family member (spouse, child, parent, sibling) and 1
                to 3 days for an extended family member. Many offer
                additional unpaid leave or PTO use on top.
              </p>
              <p>
                <strong className="text-ink">What to ask for:</strong>{" "}
                anything reasonable. Most managers grant more leave
                than the policy if asked directly. If the formal
                bereavement policy isn&rsquo;t enough, ask about:
                using accrued PTO; intermittent leave (a day off
                each week for the next month, instead of consecutive
                days); reduced schedule for a defined period; remote
                work for the first weeks back. Get the agreement in
                writing.
              </p>
              <p>
                <strong className="text-ink">Returning to work.</strong>{" "}
                Most people underestimate the difficulty of the
                first 2 weeks back. Concentration is impaired,
                emotional regulation is harder, ordinary work
                conversations feel surreal. Adjust expectations
                downward. Tell two or three trusted colleagues so
                they can quietly route around you for a few weeks.
                If your role allows it, take an actual lunch
                outside.
              </p>
              <p>
                If you supervise people: bereavement leave that
                ends crisply on day 5 is rare for actual humans.
                Plan for a 4 to 8 week period of reduced output. Do
                not pretend the death didn&rsquo;t happen; do not
                require the bereaved to bring it up. A brief,
                specific acknowledgement from the manager (&ldquo;I
                was so sorry to hear about your father. Take what
                you need this week.&rdquo;) is what most people
                wish for and rarely get.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The hard days</CardEyebrow>
            <CardTitle>Holidays, anniversaries, birthdays.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Many bereaved people describe holidays and anniversary
                dates in the first year as harder than expected.
                Anticipating them helps. The week leading up to a
                hard day is often worse than the day itself.
              </p>
              <p>
                <strong className="text-ink">Two questions to answer in advance, not on the day:</strong>
              </p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  Where do you want to be? With family, with one
                  close friend, alone, on a trip, doing something
                  that has nothing to do with the deceased,
                  visiting the cemetery.
                </li>
                <li>
                  Do you want to mark the day or pass through it? Some
                  people light a candle, write a letter, visit the
                  grave, look at photos. Others want a day off from
                  grief. Both are legitimate. Decide in advance.
                </li>
              </ol>
              <p>
                Many bereaved spouses describe the second-year
                anniversary as harder than the first because no one
                else remembers. Mark it on your own calendar; reach
                out to one or two people who knew the person and
                tell them you&rsquo;re thinking about them too.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Physical maintenance</CardEyebrow>
            <CardTitle>Grief is a physical event too.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Acute grief raises cortisol, disrupts sleep, suppresses
                appetite, and increases the risk of cardiac events
                (the &ldquo;widowhood effect&rdquo; is real; spousal
                bereavement is associated with about a 40% higher risk
                of mortality in the first 6 months for older adults).
                Physical maintenance is not optional and not vain.
              </p>
              <p>
                The interventions with the most evidence:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Sleep.</strong>{" "}
                  Disrupted sleep magnifies every other symptom. If
                  insomnia persists past 2 weeks, talk to a primary
                  care doctor. Short-term sleep medication is not
                  weakness and is often the most useful intervention
                  in the first months.
                </li>
                <li>
                  <strong className="text-ink">Walking.</strong>{" "}
                  20&ndash;30 minutes daily, outside if possible.
                  Modest effort but consistent. Lowers cortisol,
                  helps sleep, gives the body a job.
                </li>
                <li>
                  <strong className="text-ink">Eating regularly.</strong>{" "}
                  Even when appetite is gone, eating small amounts on
                  a schedule helps. Skipping meals magnifies grief
                  symptoms physically.
                </li>
                <li>
                  <strong className="text-ink">Medical check-in at 6&ndash;8 weeks.</strong>{" "}
                  See a primary care doctor. Tell them about the
                  death. Blood pressure, sleep, weight, mood &mdash;
                  any of these can drift in ways the bereaved
                  doesn&rsquo;t notice. Catching it early is
                  cheaper than catching it late.
                </li>
                <li>
                  <strong className="text-ink">Limit alcohol.</strong>{" "}
                  Common, understandable, and one of the most reliable
                  ways to extend acute grief and develop a new
                  problem. Watch for the line between
                  &ldquo;something to take the edge off&rdquo; and
                  daily.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Books grief therapists actually recommend</CardEyebrow>
            <CardTitle>Six titles, not fifty.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  <strong className="text-ink">&ldquo;It&rsquo;s OK That You&rsquo;re Not OK&rdquo;</strong>{" "}
                  by Megan Devine. Probably the single most-recommended
                  grief book of the last decade. Especially good
                  early in grief.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;The Year of Magical Thinking&rdquo;</strong>{" "}
                  by Joan Didion. Spousal loss. Often loaned, often
                  kept.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;A Grief Observed&rdquo;</strong>{" "}
                  by C.S. Lewis. Spousal loss, faith-grounded.
                  Short.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;The Wild Edge of Sorrow&rdquo;</strong>{" "}
                  by Francis Weller. For people who feel that
                  ordinary grief literature is too tidy.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;Bearing the Unbearable&rdquo;</strong>{" "}
                  by Joanne Cacciatore. Especially recommended for
                  child loss and traumatic loss.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;Option B&rdquo;</strong>{" "}
                  by Sheryl Sandberg & Adam Grant. Practical
                  framing, sudden-loss-friendly.
                </li>
              </ul>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>What not to expect</CardEyebrow>
            <CardTitle>Three myths to retire.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">1. There is no &ldquo;closure.&rdquo;</strong>{" "}
                The word entered popular use in the 1990s, mostly
                through television. It is not a clinical concept and
                grief researchers do not use it. The expectation that
                a single event (the funeral, the trial, the
                scattering of ashes) will end grief leaves the
                bereaved feeling broken when grief continues. There
                is no closure. There is integration.
              </p>
              <p>
                <strong className="text-ink">2. There are no stages.</strong>{" "}
                You will not work through five emotions in order and
                arrive at acceptance. Some people skip what others
                spend months in. Some return to anger at month 11
                after months of integration. The shape is not a
                staircase.
              </p>
              <p>
                <strong className="text-ink">3. You do not have to be stronger than this.</strong>{" "}
                Cultural pressure to be &ldquo;strong for the family&rdquo;
                or to return to normal at a predictable speed
                creates more harm than it prevents. People who let
                themselves grieve openly, who say out loud that
                they are not OK, who accept help &mdash; do better
                long-term than people who hold it together.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Grief-specific pages we&rsquo;ve built</CardEyebrow>
            <CardTitle>The companions to this page.</CardTitle>
            <ul className="space-y-2 list-disc pl-5 text-ink-soft mt-3">
              <li>
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  Talking to children about death
                </Link>{" "}
                &mdash; age-by-age scripts, warning signs, book
                recommendations.
              </li>
              <li>
                <Link
                  href="/after-hospice"
                  className="text-primary-deep underline"
                >
                  After a hospice death
                </Link>{" "}
                &mdash; the grief specific to long illness:
                anticipatory grief, relief mixed with guilt,
                caregiving-identity loss.
              </li>
              <li>
                <Link
                  href="/sudden-loss"
                  className="text-primary-deep underline"
                >
                  Sudden death
                </Link>{" "}
                &mdash; the grief specific to no-warning loss:
                shock, intrusive replay, the 6-month wall.
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical or
            psychological advice. Grief varies and individual
            situations may need professional support beyond what is
            here. The organizations and books named are based on
            wide use by grief researchers and clinicians; mention is
            not endorsement of any specific approach. In a
            mental-health crisis, call or text 988.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
