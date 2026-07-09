import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { EmailCapture } from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "How to talk to children about death — age-by-age scripts and what not to say",
  description:
    "Plain words, real answers, age-appropriate scripts for ages 3 through 15. What 'passed away' and 'lost' do to a young child's understanding, why euphemisms backfire, and when to get professional help.",
  openGraph: { images: [ogImage("Talking to children about death", "Family")] },
};

/**
 * /talking-to-kids — public, indexable evergreen guide. Pure
 * informational content, no sister voice. Sources: National
 * Alliance for Children's Grief, the Dougy Center, the Sesame
 * Workshop "When Families Grieve" guidance, and consensus
 * grief-therapist literature.
 */
export default function TalkingToKidsPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="talking-to-kids"
        title="Talking to children about death"
        description="Age-by-age scripts for 3-5, 6-10, 11-15. The euphemisms that backfire. When to get professional help."
        eyebrow="Family"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Talking to children about death</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Use real words. Give real answers. Children handle the truth better than the workarounds.
            </h1>
            <p className="text-lg text-ink-soft">
              Children understand death in a different way than adults
              do, and that understanding shifts as they grow. The
              biggest mistake adults make is using euphemisms &mdash;
              &ldquo;passed away,&rdquo; &ldquo;lost,&rdquo;
              &ldquo;gone to sleep&rdquo; &mdash; that confuse young
              children and seem dishonest to older ones. The second
              biggest is hiding the death from them entirely. This
              page is age-by-age, scripts included.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>The words that backfire</CardEyebrow>
            <CardTitle>Stop using these. Pick the real words instead.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">&ldquo;Passed away&rdquo; / &ldquo;passed&rdquo;</strong>{" "}
                &mdash; vague to young children, evasive-sounding to
                older ones. Use &ldquo;died.&rdquo;
              </p>
              <p>
                <strong className="text-ink">&ldquo;Lost&rdquo; / &ldquo;we lost grandpa&rdquo;</strong>{" "}
                &mdash; young children may interpret literally and
                wonder why no one is looking for him. Use
                &ldquo;died.&rdquo;
              </p>
              <p>
                <strong className="text-ink">&ldquo;Gone to sleep&rdquo;</strong>{" "}
                &mdash; the single most damaging euphemism. Causes
                sleep anxiety in young children for months. They may
                refuse to go to sleep or fight bedtime. Never use.
              </p>
              <p>
                <strong className="text-ink">&ldquo;Went to a better place&rdquo;</strong>{" "}
                &mdash; if your family is religious and the child
                already understands the framework, fine. If they
                don&rsquo;t, leave it out for now. The location-of-the-soul
                question can come later; the immediate question is
                what death is.
              </p>
              <p>
                <strong className="text-ink">&ldquo;Got really sick&rdquo;</strong>{" "}
                &mdash; OK as an addition, dangerous as the only
                explanation. Young children who hear &ldquo;Grandma
                got sick and died&rdquo; may believe their own minor
                cold will kill them. Always specify: &ldquo;Grandma&rsquo;s
                body was very, very old and stopped working. That&rsquo;s
                different from when you have a cold.&rdquo;
              </p>
              <p>
                <strong className="text-ink">Use:</strong>{" "}
                &ldquo;died,&rdquo; &ldquo;is dead,&rdquo;
                &ldquo;their body stopped working,&rdquo;
                &ldquo;their heart stopped,&rdquo; or the specific
                cause if appropriate (&ldquo;cancer in her
                lungs&rdquo;).
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Ages 3 to 5 (preschool)</CardEyebrow>
            <CardTitle>Concrete, short, repeated.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Children in this range understand death as a temporary
                separation, like nap time or someone going on a trip.
                They do not yet understand that death is permanent,
                universal (everyone and everything will eventually
                die), or that it cannot be undone. They will ask the
                same questions repeatedly &mdash; not because they
                forgot the answer, but because they are working out
                what it means.
              </p>
              <p>
                <strong className="text-ink">What to say:</strong>{" "}
                &ldquo;Grandpa died. That means his body stopped
                working. He can&rsquo;t breathe or eat or talk or move
                anymore. He can&rsquo;t come back. We won&rsquo;t see him again,
                and that makes us very sad.&rdquo;
              </p>
              <p>
                <strong className="text-ink">Common questions and answers:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  &ldquo;When is Grandpa coming back?&rdquo; &mdash;{" "}
                  &ldquo;He can&rsquo;t come back. When someone dies, they
                  don&rsquo;t come back. I know that&rsquo;s really hard.&rdquo;
                </li>
                <li>
                  &ldquo;Will I die?&rdquo; &mdash; &ldquo;Yes, but
                  not for a very long time. Most people live until
                  they are very, very old. You will probably live
                  longer than I will.&rdquo;
                </li>
                <li>
                  &ldquo;Will you die?&rdquo; &mdash; &ldquo;Someday,
                  but not for a very long time. I&rsquo;m planning to be
                  around for a long, long time.&rdquo;
                </li>
                <li>
                  &ldquo;Why did Grandpa die?&rdquo; &mdash; specific
                  cause is fine if it doesn&rsquo;t generalize to ordinary
                  childhood illnesses. &ldquo;His body was very old
                  and his heart stopped working&rdquo; is better
                  than &ldquo;he got sick.&rdquo;
                </li>
              </ul>
              <p>
                <strong className="text-ink">What to expect:</strong>{" "}
                some regression (bedwetting, baby talk, clinginess),
                sleep disturbances, repeated questions, periods of
                seeming totally unaffected followed by sudden tears.
                All normal in the first 6 weeks.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Ages 6 to 10 (early grade school)</CardEyebrow>
            <CardTitle>The age of biological questions.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Children in this range begin to understand that death
                is permanent and that it happens to everyone. They
                often become intensely curious about the biology and
                logistics: what happens to the body, what cremation
                is, what a funeral is, what happens if you&rsquo;re buried,
                whether you can feel anything after you die. These
                questions can sound morbid; they are normal.
              </p>
              <p>
                Answer them. Honestly. Briefly. With a willingness to
                say &ldquo;I don&rsquo;t know&rdquo; when you genuinely
                don&rsquo;t (about, say, what happens after death &mdash;
                your honest answer is fine, even if it&rsquo;s &ldquo;some
                people believe ___ and some people believe ___, and I
                believe ___, and we don&rsquo;t know for sure&rdquo;).
              </p>
              <p>
                <strong className="text-ink">Common questions and answers:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  &ldquo;What happens to the body?&rdquo; &mdash;
                  honest, specific: &ldquo;Grandpa&rsquo;s body is at the
                  funeral home. They take care of bodies after
                  someone dies. Then the body will be cremated/buried, which means ___.&rdquo;
                </li>
                <li>
                  &ldquo;What is cremation?&rdquo; &mdash;
                  &ldquo;Cremation uses very high heat to turn the
                  body into ashes. The ashes are put in a special
                  container. Many families keep them or scatter
                  them in a place that mattered to the person.&rdquo;
                </li>
                <li>
                  &ldquo;Will Grandpa feel cold/lonely/scared?&rdquo;
                  &mdash; &ldquo;No. When someone dies, their body
                  doesn&rsquo;t feel anything anymore. They can&rsquo;t feel cold
                  or lonely or scared.&rdquo;
                </li>
                <li>
                  &ldquo;Did Grandpa know he was going to die?&rdquo;
                  &mdash; honest answer for the situation. If he was
                  ill and aware, yes; if it was sudden, no.
                </li>
                <li>
                  &ldquo;Could the doctors have saved him?&rdquo;
                  &mdash; for most natural deaths in old age, no
                  &mdash; &ldquo;sometimes bodies are just done, and
                  there&rsquo;s nothing the doctors can do.&rdquo; For
                  treatable conditions that weren&rsquo;t caught,
                  age-appropriate honesty is usually right.
                </li>
              </ul>
              <p>
                <strong className="text-ink">What to expect:</strong>{" "}
                more verbal sadness, anger (sometimes at the dead
                person for leaving), schoolwork slip-ups, sleep
                changes, sometimes nightmares about death. Often a
                period of seeming totally fine. The grief comes in
                waves; week 8 may look harder than week 2.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Ages 11 to 15 (preteen and teen)</CardEyebrow>
            <CardTitle>Treat them more like adults than you think they want.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Children in this range understand death the same way
                adults do &mdash; permanence, universality, the
                cause-effect chain. Their grief looks more like adult
                grief, but with the added complications of identity
                formation and the social pressure of being a teenager.
                They are often less willing to talk about it directly
                than younger children, particularly with parents.
              </p>
              <p>
                Make space. Don&rsquo;t force it. Include them in
                decisions: do they want to see the body, do they
                want to speak at the service, do they want to choose
                music or pictures. Offering choices respects them.
                Insisting they participate often backfires.
              </p>
              <p>
                Watch for what doesn&rsquo;t come out in conversation:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Withdrawal.</strong>{" "}
                  Some withdrawal is normal in adolescence and in
                  grief; both together can compound. A teen who
                  used to do activities and now does none, for
                  more than 6 weeks, warrants a check-in.
                </li>
                <li>
                  <strong className="text-ink">Anger outbursts.</strong>{" "}
                  Common, particularly in boys, and can be misread
                  as &ldquo;he&rsquo;s not even grieving.&rdquo; The anger
                  is often the grief.
                </li>
                <li>
                  <strong className="text-ink">Risk-taking.</strong>{" "}
                  Sudden interest in drinking, drugs, reckless
                  driving, dangerous behavior. Real and serious.
                  Statistically the risk increases after a parent&rsquo;s
                  death in particular.
                </li>
                <li>
                  <strong className="text-ink">Identification with the dead person.</strong>{" "}
                  Wearing their clothes, listening to their music,
                  imitating their habits. Common and often
                  comforting. Concerning only if it&rsquo;s accompanied by
                  expressed wishes to die or join them.
                </li>
              </ul>
              <p>
                Some teens grieve more openly with someone other than
                a parent &mdash; an aunt, a coach, a school counselor,
                a religious leader, a therapist. Don&rsquo;t take it
                personally. Make sure they have someone, even if it
                isn&rsquo;t you.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Should children come to the funeral?</CardEyebrow>
            <CardTitle>Usually yes &mdash; with preparation and an out.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most grief therapists and pediatric counselors
                recommend that children attend the funeral if they
                want to. Excluding them &mdash; usually out of a
                wish to protect them &mdash; tends to leave a gap
                they fill with imagination, which is often worse
                than reality.
              </p>
              <p>
                Three rules make this work:
              </p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Prepare them in advance.</strong>{" "}
                  Tell them what will happen, what they will see,
                  who will be there, how long it will last, whether
                  the casket will be open or closed. Specific details
                  reduce anxiety: &ldquo;The room will be full of
                  people. We&rsquo;ll walk in together. The casket will be
                  at the front. It will be open and you will be able
                  to see Grandpa. He will look very still. We will
                  sit for about an hour. People will cry.&rdquo;
                </li>
                <li>
                  <strong className="text-ink">Give them a choice.</strong>{" "}
                  &ldquo;You can come with us. You can wait at home
                  with Aunt Sarah. You can come and decide to leave
                  partway through. Whatever you choose is OK.&rdquo;
                  Respect what they choose.
                </li>
                <li>
                  <strong className="text-ink">Have a designated adult.</strong>{" "}
                  Someone who is not running the service whose only
                  job is the child &mdash; sit next to them, answer
                  questions, take them out if they need to leave.
                  Often a less-close relative or family friend so
                  the grieving immediate family can grieve.
                </li>
              </ol>
            </div>
          </Card>

          <Card tone="warn">
            <CardEyebrow>When to get professional help</CardEyebrow>
            <CardTitle>The warning signs that warrant a call.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most children process grief without professional
                support. The warning signs that warrant a call to a
                pediatrician, school counselor, or grief specialist:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Persistent expressed wishes to die or to be with
                  the deceased &mdash; at any age, this is a red
                  flag that warrants same-day evaluation.
                </li>
                <li>
                  Inability to function in daily life (school,
                  basic self-care) for more than 6 weeks.
                </li>
                <li>
                  Sleep disturbances that are still severe at 6 weeks
                  (terrors, refusal to sleep, severe insomnia).
                </li>
                <li>
                  Regression that persists past 8 weeks
                  (bedwetting, baby talk, severe separation
                  anxiety).
                </li>
                <li>
                  New risk behaviors in teens (drugs, alcohol,
                  self-harm, dangerous driving, sexual risk).
                </li>
                <li>
                  Withdrawal from all peers and activities for more
                  than 6 weeks.
                </li>
                <li>
                  Persistent guilt or beliefs that the death was the
                  child&rsquo;s fault.
                </li>
              </ul>
              <p>
                The first resource for most families is the school
                counselor, who has seen many grieving children and
                can refer up to a specialist if needed. The Dougy
                Center maintains a national directory of children&rsquo;s
                grief programs at{" "}
                <a
                  href="https://www.dougy.org/grief-support-resources/find-support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  dougy.org/find-support
                </a>{" "}
                &mdash; most programs are free.
              </p>
              <p>
                For loss by suicide, the Alliance of Hope for
                Suicide Loss Survivors (
                <a
                  href="https://allianceofhope.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  allianceofhope.org
                </a>
                ) has children-specific resources and forums.
              </p>
              <p>
                If a child of any age is expressing wishes to die or
                self-harm, call or text 988 (Suicide & Crisis
                Lifeline) immediately, or go to the nearest emergency
                room. 988 has counselors trained to talk to young
                people.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Books and resources</CardEyebrow>
            <CardTitle>What to actually buy.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Picture books that grief specialists routinely
                recommend, by age:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Ages 3&ndash;7:</strong>{" "}
                  &ldquo;The Invisible String&rdquo; by Patrice
                  Karst, &ldquo;The Goodbye Book&rdquo; by Todd
                  Parr, &ldquo;Lifetimes&rdquo; by Bryan Mellonie.
                </li>
                <li>
                  <strong className="text-ink">Ages 6&ndash;10:</strong>{" "}
                  &ldquo;The Memory Box&rdquo; by Joanna Rowland,
                  &ldquo;A Place in My Heart&rdquo; by Annette
                  Aubrey.
                </li>
                <li>
                  <strong className="text-ink">Ages 10&ndash;14:</strong>{" "}
                  &ldquo;Tear Soup&rdquo; by Pat Schwiebert,
                  &ldquo;A Kids Book About Death&rdquo; by Taryn
                  Schuelke.
                </li>
              </ul>
              <p>
                The Sesame Workshop has free, high-quality content
                for younger children at{" "}
                <a
                  href="https://sesameworkshop.org/topics/grief/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  sesameworkshop.org/topics/grief
                </a>{" "}
                including videos, printable storybooks, and a free
                grief tool kit.
              </p>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical
            or psychological advice. Children&rsquo;s grief varies and
            individual situations may need professional support
            beyond what&rsquo;s here. For acute concerns about a child&rsquo;s
            wellbeing, contact a pediatrician, school counselor, or
            licensed mental-health professional. In a crisis, call
            or text 988.
          </p>

          <EmailCapture
            source="talking-to-kids"
            title="Save this for when you need it."
            subtitle="Parents come back to this guide multiple times over months. We'll email it so it's one click away."
            buttonLabel="Email me this guide"
            successMessage="It's in your inbox. Take care."
          />

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
