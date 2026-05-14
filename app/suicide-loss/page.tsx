import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Suicide loss — for survivors of suicide loss",
  description:
    "An honest guide for people grieving someone who died by suicide. The unique features of this grief, the resources that actually help, safety information for survivors, and 988.",
  openGraph: { images: [ogImage("Suicide loss — for survivors", "Grief")] },
};

/**
 * /suicide-loss — public, indexable. For people grieving someone who
 * died by suicide ("suicide loss survivors"). Follows safe-messaging
 * guidelines: does not describe methods, does not romanticize, focuses
 * on bereavement (post-event) not suicide prevention (pre-event).
 * 988 surfaced prominently because suicide loss survivors are at
 * elevated risk themselves.
 *
 * Sensitive content. Sister to redline before final MVP approval.
 * Voice: factual, validating, no performed empathy, treats reader
 * as a competent adult. National orgs only (AFSP, Alliance of Hope).
 */
export default function SuicideLossPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Suicide loss</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              When someone you love dies by suicide.
            </h1>
            <p className="text-lg text-ink-soft">
              This page is for the bereaved &mdash; people grieving
              someone who died by suicide. It is not a prevention
              page. The grief here is its own thing: harder than
              other grief in specific ways, isolating in ways the
              culture rarely names, and serviced by a small but
              capable network of organizations built by other
              survivors.
            </p>
          </div>

          {/* 988 first — survivors are at elevated risk */}
          <Card tone="warn">
            <CardEyebrow>If you are in crisis</CardEyebrow>
            <CardTitle>988 is for you, too.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Suicide loss survivors are statistically at higher
                risk for suicidal thoughts themselves, particularly
                in the first 1&ndash;2 years and at the anniversary
                of the death. This isn&rsquo;t a moral failing or a
                sign you&rsquo;re weak; it&rsquo;s a documented
                pattern in bereavement research.
              </p>
              <p>
                If you are having thoughts of ending your own life,
                or persistent wishes to be with the person who died:
                call or text <strong className="text-ink">988</strong>{" "}
                (Suicide &amp; Crisis Lifeline). 24 hours, free,
                confidential. The counselors are trained specifically
                to handle bereavement crises &mdash; they will not
                judge, escalate, or send police unless you&rsquo;re in
                immediate danger. Calling 988 because you&rsquo;re
                struggling with grief is exactly what it&rsquo;s for.
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>The term, and why it matters</CardEyebrow>
            <CardTitle>You are a suicide loss survivor.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The accepted term for someone bereaved by suicide is{" "}
                <em>suicide loss survivor</em>. Not &ldquo;suicide
                survivor&rdquo; (that&rsquo;s someone who attempted
                and lived). Not &ldquo;family of a suicide&rdquo;
                (clinical, distancing).
              </p>
              <p>
                The word &ldquo;survivor&rdquo; is intentional. It
                acknowledges that grief from suicide loss is itself
                survived &mdash; that the bereavement is something
                you live through, not something you simply process.
                Researchers and clinicians who work with this
                community use the term deliberately. You can too.
              </p>
              <p>
                Roughly 135 people are directly affected by every
                suicide in the US (CDC estimates), though that
                number understates the actual reach. You are not
                rare and you are not alone, even if it feels that
                way in the first weeks.
              </p>
            </div>
          </Card>

          {/* What makes this grief different */}
          <Card>
            <CardEyebrow>What makes this grief different</CardEyebrow>
            <CardTitle>Six features that compound other grief.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Grief researchers consistently identify suicide loss
                as one of the most difficult bereavements, not
                because the love is bigger but because the grief
                carries layers most other deaths don&rsquo;t.
              </p>
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <strong className="text-ink">The &ldquo;why&rdquo; that has no answer.</strong>{" "}
                  Most survivors describe being haunted by the
                  question of why, sometimes for years. Notes
                  rarely explain. Friends and family don&rsquo;t
                  have the answer either. Suicide is the result of
                  a moment when the person could not see another way
                  &mdash; not a rational decision that can be
                  reverse-engineered. Many therapists describe
                  helping survivors move from &ldquo;why did they
                  do this&rdquo; to &ldquo;they were in a kind of
                  pain I couldn&rsquo;t see&rdquo; as one of the
                  central tasks of suicide-loss therapy.
                </li>
                <li>
                  <strong className="text-ink">Anger.</strong>{" "}
                  Survivors frequently feel intense anger at the
                  person who died &mdash; for leaving, for the
                  burden left behind, for the specific moment they
                  chose. The anger sometimes feels shameful (&ldquo;I
                  shouldn&rsquo;t be angry at them&rdquo;). It is
                  one of the most universal features of suicide-loss
                  grief and it does not mean you didn&rsquo;t love
                  them.
                </li>
                <li>
                  <strong className="text-ink">Guilt and the rewind.</strong>{" "}
                  &ldquo;If I had called that night.&rdquo; &ldquo;If
                  I had seen the signs.&rdquo; &ldquo;If I had said
                  yes to the dinner.&rdquo; Mental replay of the
                  hours and weeks before is nearly universal. It is
                  not productive and it is not your fault &mdash;
                  but it is exhausting. Most therapists describe the
                  rewind as something to be acknowledged rather than
                  argued with.
                </li>
                <li>
                  <strong className="text-ink">Stigma.</strong>{" "}
                  Other people will be uncomfortable. Some will avoid
                  you. Some will lower their voice when they ask how
                  the person died. Some will treat the death as
                  shameful in ways that make your grief harder to
                  express. This is the cultural failure, not your
                  failure.
                </li>
                <li>
                  <strong className="text-ink">Intrusive imagery and trauma.</strong>{" "}
                  If you were the one to find the body, or if you
                  saw or read details, intrusive flashbacks are
                  common for weeks or months. If they persist past
                  3 months or are interfering with daily life,
                  trauma-focused therapy (EMDR or CPT specifically)
                  is the most evidence-based response. Standard
                  grief therapy is often not enough.
                </li>
                <li>
                  <strong className="text-ink">Heightened risk for survivors.</strong>{" "}
                  Suicide loss survivors are at elevated risk of
                  developing suicidal thoughts themselves. The 988
                  card at the top of this page is not symbolic.
                  Knowing this in advance helps; it&rsquo;s easier
                  to call for help when you&rsquo;ve already
                  understood that &ldquo;feeling like I can&rsquo;t
                  do this&rdquo; can become &ldquo;I want to leave
                  too&rdquo; in survivors specifically.
                </li>
              </ol>
            </div>
          </Card>

          {/* The first weeks */}
          <Card>
            <CardEyebrow>The first weeks</CardEyebrow>
            <CardTitle>Practical things, in rough order.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Logistics in suicide loss are usually different from
                other deaths because the medical examiner is
                involved. Most cases require an autopsy. The death
                certificate may be marked &ldquo;pending&rdquo; for
                weeks while toxicology is processed. This can
                complicate life insurance, account closures, and
                probate.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">The medical examiner&rsquo;s office</strong>{" "}
                  retains custody of the body for 24&ndash;72 hours
                  typically. The release is usually routine.{" "}
                  <Link
                    href="/sudden-loss"
                    className="text-primary-deep underline"
                  >
                    The sudden-loss guide
                  </Link>{" "}
                  covers what to expect.
                </li>
                <li>
                  <strong className="text-ink">Life insurance and the suicide clause.</strong>{" "}
                  Most US life insurance policies have a
                  &ldquo;suicide clause&rdquo; that excludes payout
                  if the death occurred within the first 2 years
                  (sometimes 1 year) of the policy. After that
                  period, suicide deaths are covered normally. Check
                  the policy carefully. If denied within the clause
                  period, ask for the specific clause and date of
                  policy &mdash; sometimes denials are made in
                  error.
                </li>
                <li>
                  <strong className="text-ink">The obituary.</strong>{" "}
                  You are not required to state the cause of death,
                  and you are not required to hide it. Many
                  survivors find that openly mentioning suicide in
                  the obituary (e.g. &ldquo;died by suicide on
                  March 14&rdquo; or &ldquo;died by suicide after a
                  long struggle with depression&rdquo;) reduces
                  isolation later. Others prefer not to. Both are
                  legitimate and the choice is yours.
                </li>
                <li>
                  <strong className="text-ink">The funeral.</strong>{" "}
                  Some clergy and some funeral homes used to refuse
                  to conduct services for people who died by
                  suicide. Almost none do now. If you encounter
                  resistance, find a different officiant; this is
                  a sign of the home or clergy, not of any moral
                  problem with your loved one.
                </li>
                <li>
                  <strong className="text-ink">Notifications.</strong>{" "}
                  You may want to decide in advance how to tell
                  extended family and friends. A short, factual
                  framing helps: &ldquo;[Name] died on [date]. They
                  took their own life. The funeral will be on
                  [date]. We loved them very much.&rdquo; Having
                  the words prepared saves you from improvising
                  during dozens of phone calls.
                </li>
              </ul>
            </div>
          </Card>

          {/* Children */}
          <Card>
            <CardEyebrow>If there are children</CardEyebrow>
            <CardTitle>Honesty about suicide protects them, not the opposite.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The instinct to hide the cause of death from
                children, especially young ones, is strong. Decades
                of research from suicide-loss-specific clinicians
                (including the Dougy Center and AFSP&rsquo;s
                children&rsquo;s resources) consistently find the
                opposite: children who are told age-appropriate
                truth at the time of the loss do better long-term
                than children who learn the truth later or piece it
                together from overheard conversations.
              </p>
              <p>
                The age-by-age framing in{" "}
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  our talking-to-kids guide
                </Link>{" "}
                applies, with two suicide-specific additions:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">For kids under 8:</strong>{" "}
                  Specific framing: &ldquo;Mommy&rsquo;s brain was
                  very sick. The sickness made her think things that
                  weren&rsquo;t true, and it told her to do
                  something that ended her life. It&rsquo;s a
                  different kind of sick than a cold or even cancer
                  &mdash; it&rsquo;s an illness of the brain. She
                  didn&rsquo;t want to leave us.&rdquo; This frames
                  suicide as a medical event of a sick brain
                  rather than a choice, which is honest and is what
                  is closest to clinical truth.
                </li>
                <li>
                  <strong className="text-ink">For older kids and teens:</strong>{" "}
                  Explicit conversation about their own mental
                  health. Suicide loss in a family raises the
                  child&rsquo;s lifetime risk; pretending otherwise
                  doesn&rsquo;t protect them, it isolates them.
                  Make explicit: &ldquo;If you ever have thoughts
                  about hurting yourself or about dying, I want you
                  to tell me. There is no version of this where I
                  lose you the way we lost Mom.&rdquo;
                </li>
              </ul>
              <p>
                If a child is showing warning signs (withdrawal,
                preoccupation with death, gifting away possessions,
                statements about being a burden), call or text 988
                with them or get a same-day evaluation from a
                pediatrician or child psychiatrist. Don&rsquo;t
                wait.
              </p>
            </div>
          </Card>

          {/* What helps */}
          <Card tone="good">
            <CardEyebrow>What helps</CardEyebrow>
            <CardTitle>Survivors of other suicides — that is what helps most.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Asked years later, almost every long-term suicide
                loss survivor describes the same single most-helpful
                thing: connecting with other people who had lost
                someone to suicide. The peer doesn&rsquo;t have to
                become a friend. They just have to exist. The
                experience of being understood without explanation,
                even once, changes the grief.
              </p>
              <p>
                Three reliable paths to that connection:
              </p>
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  <strong className="text-ink">AFSP support group directory.</strong>{" "}
                  The American Foundation for Suicide Prevention
                  maintains the largest US directory of in-person
                  and online suicide-loss support groups at{" "}
                  <a
                    href="https://afsp.org/find-a-support-group"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    afsp.org/find-a-support-group
                  </a>
                  . Free. Groups are peer-led, sometimes co-led by a
                  trained clinician. Many bereaved people describe
                  walking in unable to speak the words and walking
                  out feeling less alone for the first time since
                  the death.
                </li>
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
                  . Online community designed by and for survivors.
                  Articles, forums, and a free 24-hour chat. Often
                  the most accessible option in the first weeks when
                  in-person groups feel like too much.
                </li>
                <li>
                  <strong className="text-ink">International Survivors of Suicide Loss Day</strong>{" "}
                  &mdash; held annually on the Saturday before US
                  Thanksgiving. Hundreds of in-person events
                  worldwide; many are introductions to the local
                  AFSP community. If you can&rsquo;t face a weekly
                  group, attending this one day can be a first
                  step.
                </li>
              </ul>
            </div>
          </Card>

          {/* Therapy */}
          <Card>
            <CardEyebrow>Therapy that fits this loss</CardEyebrow>
            <CardTitle>Filter for the specific specialty.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Generic grief therapy is often inadequate for
                suicide loss. The specific challenges &mdash; the
                &ldquo;why&rdquo;, the trauma if you were the one
                to find the body, the anger, the stigma &mdash;
                benefit from a therapist who has worked with
                suicide loss specifically.
              </p>
              <p>
                <strong className="text-ink">Where to find one:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Psychology Today therapist directory at{" "}
                  <a
                    href="https://www.psychologytoday.com/us/therapists"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    psychologytoday.com/us/therapists
                  </a>{" "}
                  &mdash; filter for &ldquo;grief and loss&rdquo;
                  and read the bio for explicit mention of
                  suicide-loss work. Many therapists will list it
                  if they have the training.
                </li>
                <li>
                  AFSP&rsquo;s training program produces therapists
                  certified in suicide-loss bereavement; AFSP can
                  refer you to one in your area if you ask via the
                  contact form on their site.
                </li>
                <li>
                  If you had intrusive flashbacks or were the one to
                  find the body, look specifically for EMDR or
                  Cognitive Processing Therapy &mdash; trauma-
                  focused modalities with evidence specifically for
                  death-scene trauma.
                </li>
                <li>
                  If finances are a barrier, Open Path Collective
                  (
                  <a
                    href="https://openpathcollective.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    openpathcollective.org
                  </a>
                  ) lists therapists offering $40&ndash;$80 sessions
                  for a one-time $65 membership fee.
                </li>
              </ul>
            </div>
          </Card>

          {/* Anniversaries */}
          <Card>
            <CardEyebrow>The hard days</CardEyebrow>
            <CardTitle>The first anniversary is statistically harder than the first month.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Researchers tracking suicide-loss survivors find a
                spike in distress and suicidal thinking around the
                first anniversary of the death. This pattern is so
                consistent it&rsquo;s sometimes called the
                &ldquo;anniversary reaction.&rdquo;
              </p>
              <p>
                A plan helps. Two or three weeks before the
                anniversary, think about:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Where you want to be that day &mdash; with family,
                  alone, on a trip, with a specific friend.
                </li>
                <li>
                  Whether you want to mark the day (visit the
                  grave, light a candle, donate in their name) or
                  pass through it. Both are legitimate.
                </li>
                <li>
                  Who you&rsquo;ll call if it gets hard. A specific
                  name, not &ldquo;someone.&rdquo;
                </li>
                <li>
                  Scheduling a check-in with a therapist or a peer
                  from your support group on or near the day.
                </li>
              </ul>
              <p>
                The same applies to the person&rsquo;s birthday, the
                anniversary of the diagnosis if there was an
                illness, and holidays. Anticipating helps.
              </p>
            </div>
          </Card>

          {/* Survivors who attempted */}
          <Card tone="warn">
            <CardEyebrow>If you are also having thoughts of suicide</CardEyebrow>
            <CardTitle>Tell someone today. Not next week.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Suicide loss survivors are at elevated risk of
                developing their own suicidal thoughts. This is not
                a small effect: family members of people who died by
                suicide have roughly 2&ndash;4 times the lifetime
                risk of suicide compared to the general population.
                You are not betraying them by considering it; you
                are showing one of the known patterns of this kind
                of grief.
              </p>
              <p>
                What to do, in order:
              </p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  Call or text <strong className="text-ink">988</strong>{" "}
                  right now, even if it&rsquo;s mild. The counselors
                  are trained to talk to bereaved family members.
                </li>
                <li>
                  Tell one person in your life: a friend, sibling,
                  partner, parent. Not as a confession but as a
                  request. &ldquo;I&rsquo;m struggling and I need
                  you to check on me daily this week.&rdquo;
                </li>
                <li>
                  Make an appointment with a psychiatrist or your
                  primary care doctor within a few days. Medication
                  for depression and anxiety is often life-saving
                  in this specific period and is not weakness.
                </li>
                <li>
                  Reduce access to lethal means in your home.
                  Lock up firearms, remove or lock up large
                  quantities of medication. This single step is
                  one of the most evidence-based suicide-prevention
                  measures.
                </li>
              </ol>
              <p>
                If you are in immediate danger of harming yourself,
                go to the nearest emergency room or call 911.
              </p>
            </div>
          </Card>

          {/* Books */}
          <Card>
            <CardEyebrow>Books that suicide-loss therapists recommend</CardEyebrow>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">&ldquo;No Time to Say Goodbye&rdquo;</strong>{" "}
                  by Carla Fine. The foundational text in the
                  field, written by a survivor.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;After Suicide Loss: Coping with Your Grief&rdquo;</strong>{" "}
                  by Bob Baugher and Jack Jordan. Practical workbook-
                  style, often used in support groups.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;History of a Suicide&rdquo;</strong>{" "}
                  by Jill Bialosky. Sister loss, literary, helpful
                  for survivors who think through grief by reading.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;The Suicide Survivors&rsquo; Handbook&rdquo;</strong>{" "}
                  by Trudy Carlson. Practical resource specifically
                  for the first year.
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
                  href="/grief"
                  className="text-primary-deep underline"
                >
                  Grief, month by month
                </Link>{" "}
                &mdash; the general framework. Apply to suicide loss
                with the additions on this page.
              </li>
              <li>
                <Link
                  href="/sudden-loss"
                  className="text-primary-deep underline"
                >
                  Sudden death
                </Link>{" "}
                &mdash; the medical-examiner process, the pending
                death certificate, and the practical first weeks.
              </li>
              <li>
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  Talking to children about death
                </Link>{" "}
                &mdash; age-appropriate framing with the
                suicide-specific additions described above.
              </li>
              <li>
                <Link
                  href="/disenfranchised-grief"
                  className="text-primary-deep underline"
                >
                  When the world doesn&rsquo;t recognize your loss
                </Link>{" "}
                &mdash; suicide loss involves stigma that other
                losses don&rsquo;t. The framework helps.
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical
            or psychological advice. Suicide loss is highly
            individual; the organizations and books cited are based
            on broad recommendation by clinicians who work with
            suicide-loss survivors, but specific situations may
            require individual support beyond what&rsquo;s here. If
            you are in crisis, call or text 988. If you are in
            immediate danger of harming yourself, call 911 or go to
            the nearest emergency room.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
