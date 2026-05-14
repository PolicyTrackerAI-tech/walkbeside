import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";

export const metadata: Metadata = {
  title: "The final days — caring for someone who is dying",
  description:
    "What dying actually looks like in the last two weeks. When to call hospice. What helps and what hurts in the final hours. The before-death companion to our hospice guide.",
  openGraph: { images: [ogImage("The final days — caring for someone who is dying", "Caregiving")] },
};

/**
 * /final-days — public, indexable. The caregiver-facing companion to
 * /after-hospice. Covers the period BEFORE death: recognizing the final
 * stage, the 1-2 week window, the last 24-72 hours, the hour itself,
 * what helps, what hurts, and care of the caregiver. Voice is third-
 * person factual; no sister-as-FD first person.
 */
export default function FinalDaysPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="final-days"
        title="The final days — caring for someone who is dying"
        description="The last two weeks, the last 24-72 hours, the hour of death. What helps, what hurts, and care of the caregiver."
        eyebrow="Caregiving"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>The final days</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Caring for someone who is dying — the last weeks, the last hours, the last breath.
            </h1>
            <p className="text-lg text-ink-soft">
              About 1.7 million Americans receive hospice care each
              year. Almost all of them die at home or in a hospice
              facility, surrounded by family who have never done this
              before. This page is what to expect, what helps, and
              what doesn&rsquo;t &mdash; written for the people
              sitting at the bedside.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>If you are reading this in real time</CardEyebrow>
            <CardTitle>Two rules to anchor on.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">1.</strong> The hospice
                agency has a 24-hour line. Call them at the first
                sign of distress, breathing change, or your own
                panic. They will talk you through almost anything
                over the phone, and they will send a nurse if needed.
                Their number is on the printed materials they left in
                the home; if you can&rsquo;t find it, the patient&rsquo;s
                medical chart will have it.
              </p>
              <p>
                <strong className="text-ink">2.</strong> Do not call
                911 unless directed by hospice. A 911 call triggers a
                paramedic response and, in some jurisdictions, a
                coroner investigation &mdash; turning a peaceful home
                death into a chaotic medical emergency. Hospice is the
                right call for everything in this stage.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>When it&rsquo;s time</CardEyebrow>
            <CardTitle>Calling hospice earlier than you think.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Medicare hospice eligibility starts when a physician
                estimates a life expectancy of 6 months or less. Most
                families wait too long: the median length of hospice
                stay in the US is about 18 days, and roughly a third
                of patients receive hospice for less than a week
                before death. The benefit is designed for 6 months,
                and the longer earlier window is where most of the
                relief happens &mdash; for both the patient and the
                family.
              </p>
              <p>
                <strong className="text-ink">Signs that the final stage is approaching:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Sleep is increasing &mdash; 16+ hours a day is
                  common.
                </li>
                <li>
                  Appetite is dropping, often to near-zero. Liquids
                  too.
                </li>
                <li>
                  Less talking, less interest in TV or visitors.
                </li>
                <li>Withdrawal from previously enjoyed activities.</li>
                <li>
                  Worsening confusion or sundowning (more disoriented
                  in the evening).
                </li>
                <li>
                  Increased reliance on caregivers for basic tasks
                  (toileting, bathing, eating).
                </li>
              </ul>
              <p>
                If your loved one is showing several of these and is
                not yet in hospice, ask the treating physician about
                a referral. Hospice is a benefit, not a defeat. It
                covers: nurse visits (typically 1&ndash;3 per week,
                more as needed), a home health aide for bathing and
                hygiene, all medications related to the terminal
                diagnosis, durable medical equipment (hospital bed,
                wheelchair, oxygen), a social worker, a chaplain if
                wanted, and 13 months of bereavement support after
                death.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The 1–2 week window</CardEyebrow>
            <CardTitle>What the body is doing.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                In the last 7&ndash;14 days, the body is shutting
                down systematically. The changes are not failures of
                care &mdash; they are the body protecting itself and
                conserving energy for the heart and brain.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Eating stops.</strong>{" "}
                  Pushing food at this stage causes nausea, choking,
                  and aspiration. The dying body cannot process food.
                  Tiny sips of water, ice chips, or a damp cloth on
                  the lips is the most appropriate kind of hydration.
                </li>
                <li>
                  <strong className="text-ink">Confusion increases.</strong>{" "}
                  Conversations may not make sense. Some people seem
                  to talk to relatives or pets who have already
                  died, or reach for things in the air. Hospice
                  nurses uniformly describe this as common and
                  meaningful, not distressing.
                </li>
                <li>
                  <strong className="text-ink">Body temperature fluctuates.</strong>{" "}
                  Hot then cold, sometimes within hours. Use light
                  blankets that can be added or removed easily.
                </li>
                <li>
                  <strong className="text-ink">Long sleep.</strong>{" "}
                  Most of the day is sleep. Waking is often hard.
                  Don&rsquo;t try to keep them awake.
                </li>
                <li>
                  <strong className="text-ink">Skin and nail changes.</strong>{" "}
                  Hands and feet may turn cool and slightly purple
                  (mottling) as circulation pulls toward the core.
                  Lips may darken. These are circulation changes,
                  not pain.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The last 24–72 hours</CardEyebrow>
            <CardTitle>What dying actually looks like.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                In the final 1&ndash;3 days, the changes accelerate.
                None of this is unusual. None of it requires a
                trip to the emergency room.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Breathing patterns change.</strong>{" "}
                  Cheyne-Stokes breathing &mdash; long pauses (10 to
                  30 seconds) followed by a few rapid shallow
                  breaths &mdash; is common in the last days. So is
                  shallow rapid breathing alternating with slow deep
                  breaths.
                </li>
                <li>
                  <strong className="text-ink">The &ldquo;death rattle.&rdquo;</strong>{" "}
                  A wet, rattling sound caused by saliva pooling in
                  the throat that the body no longer clears. It
                  sounds distressing to the family. It does not
                  appear to cause discomfort to the dying person.
                  Hospice may position the body on its side or use
                  light suction; aggressive suctioning is usually
                  avoided because it causes more distress than the
                  rattle does.
                </li>
                <li>
                  <strong className="text-ink">Limited response.</strong>{" "}
                  They may not open their eyes, may not respond when
                  spoken to. They may still respond to touch and
                  voice intermittently. Hearing is the last sense to
                  go &mdash; assume they hear you.
                </li>
                <li>
                  <strong className="text-ink">Terminal restlessness.</strong>{" "}
                  Some people become agitated in the last days &mdash;
                  picking at sheets, repositioning, calling out.
                  Hospice has medications for this. Call them.
                </li>
                <li>
                  <strong className="text-ink">Incontinence.</strong>{" "}
                  Loss of bladder or bowel control is common as
                  muscles relax. Hospice provides chux pads, briefs,
                  and instruction on gentle cleanup. The home health
                  aide handles most of it.
                </li>
              </ul>
            </div>
          </Card>

          <Card tone="good">
            <CardEyebrow>What helps</CardEyebrow>
            <CardTitle>Small, gentle things — done often.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Mouth and lip care.</strong>{" "}
                  Damp cloth or a moistened oral swab on the lips
                  every 30&ndash;60 minutes. Lip balm. This is the
                  single most reliably comforting thing you can do.
                </li>
                <li>
                  <strong className="text-ink">Repositioning every 2 hours.</strong>{" "}
                  Prevents pressure sores and helps the lungs.
                  Hospice will show you the technique &mdash; it&rsquo;s
                  not as hard as it looks.
                </li>
                <li>
                  <strong className="text-ink">Talk to them.</strong>{" "}
                  Tell them what you&rsquo;re doing as you do it
                  (&ldquo;I&rsquo;m going to lift your shoulder a
                  little, this might feel cool&rdquo;). Tell them
                  what you want to say. Hearing is the last sense.
                </li>
                <li>
                  <strong className="text-ink">Familiar music, soft.</strong>{" "}
                  Music they loved. Low volume.
                </li>
                <li>
                  <strong className="text-ink">A calm room.</strong>{" "}
                  Soft light. One or two people at a time at the
                  bedside. Big crowds can be agitating.
                </li>
                <li>
                  <strong className="text-ink">Permission to go.</strong>{" "}
                  Many hospice nurses describe people who seem to be
                  &ldquo;waiting&rdquo; for permission to die,
                  particularly waiting for a particular family member
                  to arrive or leave the room. Saying &ldquo;It&rsquo;s
                  OK to go, we&rsquo;ll be all right&rdquo; is not
                  morbid &mdash; it is often what they need to hear.
                </li>
              </ul>
            </div>
          </Card>

          <Card tone="bad">
            <CardEyebrow>What doesn&rsquo;t help</CardEyebrow>
            <CardTitle>Common impulses to resist.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Pushing food and water.</strong>{" "}
                  At this stage, eating causes harm. The body cannot
                  process it; pushing fluid can cause aspiration and
                  fluid in the lungs.
                </li>
                <li>
                  <strong className="text-ink">Aggressive suctioning of the rattle.</strong>{" "}
                  Causes more distress to the patient than the
                  sound causes to them. Hospice avoids it for that
                  reason.
                </li>
                <li>
                  <strong className="text-ink">Trying to wake or rouse them.</strong>{" "}
                  Their job right now is to sleep. Let them.
                </li>
                <li>
                  <strong className="text-ink">Loud crying at the bedside.</strong>{" "}
                  Grieve fully &mdash; just take it out of the room
                  for the worst of it. Calm in the room helps the
                  dying.
                </li>
                <li>
                  <strong className="text-ink">Asking medical questions on Google.</strong>{" "}
                  Almost all of it has the wrong answer for the
                  hospice-stage. Hospice has the right answer for
                  your specific person. Call them.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The hour of death</CardEyebrow>
            <CardTitle>How you&rsquo;ll know, and what to do.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Death usually comes quietly. The pauses between
                breaths get longer. Then one is the last. The body
                relaxes. The eyes may stay slightly open. There is
                no machine, no alarm, no announcement. Families
                often miss the exact moment because every previous
                pause felt like the last.
              </p>
              <p>
                <strong className="text-ink">There is no rush to do anything.</strong>{" "}
                Sit. Breathe. Touch them if you want. Many families
                find themselves holding a hand, brushing the hair,
                straightening the bedclothes, or simply staying
                quiet. The 10&ndash;30 minutes after death is the
                last time the room will be like this. There is no
                wrong way to be in it.
              </p>
              <p>
                <strong className="text-ink">When you&rsquo;re ready, call hospice.</strong>{" "}
                A hospice nurse will come to the home &mdash;
                usually within 30&ndash;90 minutes &mdash; pronounce
                death, complete the medical portion of the death
                certificate, dispose of any controlled medications,
                and call the funeral home you&rsquo;ve chosen (or
                help you choose one). Hospice handles the
                logistics. You just have to be there.
              </p>
              <p>
                What happens next &mdash; the funeral home arrival,
                the arrangement meeting, the 30-day paperwork &mdash;{" "}
                <Link
                  href="/after-hospice"
                  className="text-primary-deep underline"
                >
                  is covered in our after-hospice guide
                </Link>
                .
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>Care of the caregiver</CardEyebrow>
            <CardTitle>You are also being changed by this.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Caregiving in the final stage is physically and
                emotionally exhausting. The combination of broken
                sleep, sustained vigilance, and anticipatory grief
                produces a kind of fatigue that doesn&rsquo;t lift
                with one good night&rsquo;s rest. It is not weakness;
                it is real biology.
              </p>
              <p>
                <strong className="text-ink">Pace yourself like this is a marathon.</strong>{" "}
                Sleep when they sleep, even briefly. Eat. Drink water.
                Step out of the room for 20 minutes when someone else
                can sit. Take a walk if you can.
              </p>
              <p>
                <strong className="text-ink">It is OK to leave the bedside.</strong>{" "}
                You do not have to be there at the exact moment of
                death to have done this well. Many people seem to die
                during the few minutes their primary caregiver
                stepped out of the room. Nurses describe this as
                common &mdash; some readings of it suggest the dying
                person waited for the caregiver to be out so they
                could go without protecting them through it. Whether
                that&rsquo;s right or not, missing the moment is not
                a failure.
              </p>
              <p>
                <strong className="text-ink">Watch for caregiver burnout.</strong>{" "}
                If you&rsquo;re feeling chronically resentful, numb,
                snapping at people, can&rsquo;t sleep when there&rsquo;s
                an opportunity, or thinking &ldquo;I just want this
                to be over&rdquo; &mdash; that&rsquo;s burnout, not
                a character flaw. Hospice provides respite care: up to
                5 consecutive days where the patient stays in a hospice
                facility so the family can rest. Ask for it.
              </p>
              <p>
                <strong className="text-ink">The hospice social worker is for you, too.</strong>{" "}
                Many caregivers don&rsquo;t realize the social worker
                visits are partly for the family. Use them. They&rsquo;ve
                seen thousands of families through this and can name
                what you&rsquo;re feeling before you can.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>If they want to die at home</CardEyebrow>
            <CardTitle>This is usually possible. Hospice makes it possible.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most Americans say they would prefer to die at home,
                but only about 30% do. The biggest reason for the
                gap is that families panic and call 911 in the final
                hours, triggering an emergency-medical response that
                ends in the hospital.
              </p>
              <p>
                Hospice exists to prevent this. If the patient is on
                hospice, you have a 24-hour line, a nurse who will
                come to the home, and a clear plan for what to do at
                every stage. Death at home is not only possible
                &mdash; it&rsquo;s the standard hospice outcome.
              </p>
              <p>
                If they are NOT yet on hospice and you suspect they
                are in the final months, getting them enrolled is
                the single most important step. Their treating
                physician initiates the referral. Most hospice
                agencies can start care within 24&ndash;48 hours.
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardTitle>When the day comes, we handle the rest.</CardTitle>
            <p className="text-ink-soft mt-3 mb-5">
              The hospice death itself is usually peaceful. The 30
              days after &mdash; funeral arrangements, death
              certificates, Social Security, banks, insurance,
              probate &mdash; are where most families get overwhelmed.
              The toolkit handles that part. When you&rsquo;re ready,
              there&rsquo;s no rush.
            </p>
            <LinkButton href="/after-hospice" size="lg">
              See the after-hospice guide →
            </LinkButton>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical
            advice. Specific medication, pain management, and care
            decisions go through the hospice agency or attending
            physician. If you have a real-time concern about your
            loved one&rsquo;s comfort or your own ability to cope,
            call the hospice 24-hour line.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
