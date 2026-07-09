import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { EmailCapture } from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Overdose loss — for families bereaved by drug overdose",
  description:
    "An honest guide for people grieving someone who died from a drug overdose. The specific grief, the stigma, the children, GRASP and SAMHSA, and what actually helps. No moralizing.",
  openGraph: { images: [ogImage("Overdose loss", "Grief")] },
};

/**
 * /overdose-loss — public, indexable. For people grieving someone
 * who died of a drug overdose. Frames addiction as a disease, not a
 * character failure. Names the specific stigma overdose-loss
 * survivors carry. GRASP as primary org; SAMHSA helpline mentioned
 * but framed for SURVIVORS (a SAMHSA helpline is for the bereaved
 * too, not only for active users).
 *
 * Sensitive content. Sister to redline before final MVP approval.
 */
export default function OverdoseLossPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="overdose-loss"
        title="Overdose loss"
        description="For families bereaved by drug overdose. Addiction as a disease, the stigma, the children, GRASP and SAMHSA, naloxone for surviving family who still use."
        eyebrow="Grief"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Overdose loss</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              When someone you love dies of an overdose.
            </h1>
            <p className="text-lg text-ink-soft">
              Over 100,000 Americans die of drug overdoses each year
              &mdash; more than gun deaths and car accidents combined.
              Behind every number is a family that is now grieving in
              a culture that doesn&rsquo;t yet know how to grieve this
              loss. This page is for those families.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>If you are in crisis</CardEyebrow>
            <CardTitle>988 is for grief too, not only for crisis.</CardTitle>
            <p className="text-ink-soft mt-3">
              If you are struggling, call or text{" "}
              <strong className="text-ink">988</strong> (Suicide
              &amp; Crisis Lifeline). It is staffed 24 hours, free,
              and trained for bereavement crises &mdash; not only for
              acute suicidal thinking. Overdose-loss grief is the kind
              of thing the counselors handle every day.
            </p>
          </Card>

          <Card tone="primary">
            <CardEyebrow>The first thing to say out loud</CardEyebrow>
            <CardTitle>Addiction is a disease. Your person didn’t choose to die.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The American Medical Association, the American
                Psychiatric Association, and the World Health
                Organization classify substance use disorder as a
                chronic, relapsing brain disease. It is not a moral
                failing, not a character defect, and not a choice in
                the way the culture often frames it. The disease
                changes how the brain processes reward, stress, and
                impulse control &mdash; physically, measurably,
                visible on brain scans.
              </p>
              <p>
                Your loved one died of a disease. Different from
                cancer in some ways, similar in many: medical
                guidance is variable, treatment is partial, relapse
                is common, and the disease is sometimes fatal.
                Other people will frame the death as something they
                did to themselves. That framing is wrong, and you
                don&rsquo;t have to accept it.
              </p>
              <p>
                Naming the death honestly &mdash; &ldquo;he died of
                an overdose&rdquo; or &ldquo;she died of the
                disease of addiction&rdquo; &mdash; tends to make
                the grief easier, not harder. The euphemisms
                (&ldquo;died unexpectedly,&rdquo; &ldquo;passed
                suddenly&rdquo;) protect other people&rsquo;s
                comfort, not yours.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>What makes this grief different</CardEyebrow>
            <CardTitle>Six features specific to overdose loss.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <strong className="text-ink">The relationship before death was probably complicated.</strong>{" "}
                  Many overdose-loss survivors describe years of
                  difficult interactions before death: broken
                  promises, theft, lies, the cycle of treatment and
                  relapse, the boundaries you had to set, the
                  conversations you had with yourself about what
                  you would do if the call came. The grief is for
                  the person they were before the disease, the
                  person you hoped they&rsquo;d become, and the
                  person who died &mdash; all three of whom were
                  different. This kind of grief has a clinical name
                  (&ldquo;ambiguous loss&rdquo;) and it is real.
                </li>
                <li>
                  <strong className="text-ink">Relief and grief together.</strong>{" "}
                  Many survivors describe feeling relief &mdash;
                  that the years of vigilance and dread are over,
                  that the late-night calls have stopped, that the
                  worst thing they feared has happened so they no
                  longer have to fear it. Relief sitting beside
                  grief is not a betrayal. It is a reasonable
                  response to a long, hard period.
                </li>
                <li>
                  <strong className="text-ink">The &ldquo;what could I have done&rdquo; loop.</strong>{" "}
                  Most overdose-loss survivors describe months or
                  years of cycling through &ldquo;if I had let them
                  stay&rdquo; or &ldquo;if I had insisted on
                  treatment&rdquo; or &ldquo;if I hadn&rsquo;t
                  given up.&rdquo; Almost no decision you made was
                  the cause of their death. Their disease was the
                  cause. Telling yourself this is sometimes the
                  central work of overdose-loss grief.
                </li>
                <li>
                  <strong className="text-ink">Stigma and judgment.</strong>{" "}
                  You will encounter people who lower their voices
                  when they ask how they died, who use the word
                  &ldquo;addict&rdquo; in ways that flatten the
                  person you loved, who imply that you should have
                  done something. The culture is changing on this
                  but slowly. Family events, work conversations,
                  even funeral attendance will be different than
                  for other kinds of death.
                </li>
                <li>
                  <strong className="text-ink">Anger at the substance, the dealer, the system.</strong>{" "}
                  Many overdose-loss survivors carry deep anger at
                  the medical system that did or didn&rsquo;t
                  treat properly, at insurance that denied or
                  delayed care, at the dealer who provided the
                  substance, at the pharmaceutical industry that
                  created the modern opioid crisis. The anger is
                  reasonable and is part of the grief.
                </li>
                <li>
                  <strong className="text-ink">The other family members who use.</strong>{" "}
                  Substance use disorders run in families. Many
                  overdose-loss survivors are simultaneously
                  grieving the deceased and worried about another
                  family member who uses. This is unusually
                  exhausting because the grief and the active
                  vigilance happen in the same chest.
                </li>
              </ol>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The first weeks</CardEyebrow>
            <CardTitle>What’s typical for overdose deaths, practically.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Medical examiner involvement.</strong>{" "}
                  Almost all overdose deaths involve the medical
                  examiner&rsquo;s office. An autopsy is common.
                  Toxicology takes 6&ndash;12 weeks. The death
                  certificate may initially say &ldquo;pending&rdquo;
                  for the cause and be amended later. See{" "}
                  <Link
                    href="/sudden-loss"
                    className="text-primary-deep underline"
                  >
                    the sudden-loss guide
                  </Link>{" "}
                  for what the ME process involves.
                </li>
                <li>
                  <strong className="text-ink">Accidental vs. intentional.</strong>{" "}
                  The medical examiner determines the manner of
                  death &mdash; accident, suicide, undetermined.
                  The vast majority of overdose deaths are ruled
                  accidental: someone took a substance, the
                  composition was unknown (fentanyl-contaminated
                  supply is now nearly universal), the body
                  couldn&rsquo;t process it. The &ldquo;intentional&rdquo;
                  framing is far less common than the cultural
                  narrative suggests.
                </li>
                <li>
                  <strong className="text-ink">Life insurance.</strong>{" "}
                  Overdose deaths ruled accidental are covered
                  normally by life insurance. Deaths ruled
                  intentional fall under the same suicide-clause
                  rules as other suicides (excluded in the first
                  2 years of the policy, covered after). If a claim is
                  denied, ask for the specific basis &mdash;
                  insurance companies sometimes deny in error or
                  on technicalities that can be appealed.
                </li>
                <li>
                  <strong className="text-ink">The obituary.</strong>{" "}
                  More and more overdose-loss families openly state
                  the cause in the obituary: &ldquo;died of an
                  accidental drug overdose&rdquo; or &ldquo;died of
                  the disease of addiction.&rdquo; This is one of the things long-term survivors most often cite as helpful. It reduces isolation, opens
                  conversations, and refuses the shame the culture
                  tries to attach. You are not required to do this
                  and many families don&rsquo;t; both choices are
                  legitimate.
                </li>
                <li>
                  <strong className="text-ink">Naloxone in the home.</strong>{" "}
                  If you have other family members who use, this is
                  the moment to make sure naloxone (Narcan) is in
                  the home and that everyone knows how to use it.
                  Free from most state health departments;
                  available over-the-counter without prescription
                  at most pharmacies. This is not a betrayal of
                  the person who died &mdash; it is honoring them
                  by protecting the next person.
                </li>
              </ul>
            </div>
          </Card>

          <Card tone="good">
            <CardEyebrow>What helps</CardEyebrow>
            <CardTitle>GRASP is the single most-cited resource.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Almost every long-term overdose-loss survivor who has
                been asked what helped most cites the same answer:
                meeting other overdose-loss survivors. The pattern
                is identical to other disenfranchised losses. The
                experience of being understood without explanation
                changes the grief.
              </p>
              <ul className="space-y-3 list-disc pl-5">
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
                  . National network specifically for overdose
                  loss. In-person chapters in most US states plus
                  active online groups. Free. Peer-led. The most
                  recommended resource for overdose-loss families.
                </li>
                <li>
                  <strong className="text-ink">SAMHSA National Helpline</strong>{" "}
                  &mdash; 1-800-662-HELP (4357). 24 hours, free,
                  confidential. Most people associate SAMHSA with
                  active substance-use support, but the helpline
                  also handles bereavement and family support; ask
                  for resources for overdose-loss survivors.
                </li>
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
                  . If you lost a child to overdose, TCF is the
                  primary US bereaved-parent organization. Many
                  chapters now have overdose-specific subgroups or
                  meetings.
                </li>
                <li>
                  <strong className="text-ink">Shatterproof</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.shatterproof.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    shatterproof.org
                  </a>
                  . Advocacy organization with grief resources and
                  community events. Their annual Walk to Fight
                  Addiction events have become important
                  community-gathering moments for survivors.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>If there are children</CardEyebrow>
            <CardTitle>Honesty about addiction protects them long-term.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Children who lose a parent or sibling to overdose
                often carry shame about the cause for years if the
                family treats it as unspeakable. Long-term outcomes
                are consistently better when the cause is named
                honestly, age-appropriately, and without judgment.
              </p>
              <p>
                Suggested framings, by age:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Young children (3&ndash;7):</strong>{" "}
                  &ldquo;Daddy had a sickness in his brain that made
                  him take medicine that wasn&rsquo;t safe. The
                  medicine made his body stop working. The
                  sickness is called addiction. It&rsquo;s not the
                  same as a cold or even cancer &mdash; it&rsquo;s a
                  different kind of sick that doctors are still
                  learning how to treat. He didn&rsquo;t want to
                  leave us.&rdquo;
                </li>
                <li>
                  <strong className="text-ink">Older kids and teens:</strong>{" "}
                  Explicit conversation about the disease model and
                  about the child&rsquo;s own risk. Substance use
                  disorders are heritable; pretending otherwise
                  doesn&rsquo;t protect a child of someone who died
                  of overdose, it isolates them. Make explicit:
                  &ldquo;The way Mom&rsquo;s brain reacted to
                  substances is something that can be inherited.
                  If you ever drink or try anything, you should
                  know that your wiring may make addiction more
                  likely. There is no version of this where I keep
                  this information from you.&rdquo;
                </li>
              </ul>
              <p>
                For both age groups, the framing in our{" "}
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  talking-to-kids guide
                </Link>{" "}
                applies. Add the overdose-specific honesty above.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>For your own ongoing recovery</CardEyebrow>
            <CardTitle>Things that long-term survivors describe doing.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">A GRASP group or another overdose-loss community</strong>{" "}
                  for at least the first year. The peer
                  understanding is consistently the
                  most-frequently-cited factor.
                </li>
                <li>
                  <strong className="text-ink">A therapist who works with overdose loss specifically</strong>{" "}
                  &mdash; substance-use family dynamics are
                  specialized; not every grief therapist has the
                  training. Psychology Today filter for
                  &ldquo;grief&rdquo; + &ldquo;substance use&rdquo;
                  is a reasonable start. GRASP can also refer.
                </li>
                <li>
                  <strong className="text-ink">Limit Al-Anon if it doesn&rsquo;t fit.</strong>{" "}
                  Al-Anon is excellent for many families but is
                  oriented toward the living-with-addiction
                  situation, not overdose bereavement. Some
                  survivors find continuing Al-Anon helpful; others
                  need to step away from the framework after the
                  death. Either is fine.
                </li>
                <li>
                  <strong className="text-ink">Advocacy work, eventually, if it helps.</strong>{" "}
                  Many overdose-loss survivors describe finding
                  meaning years later through advocacy &mdash; for
                  treatment access, for harm-reduction policy, for
                  reduced stigma. Shatterproof, Faces &amp; Voices
                  of Recovery, and local recovery community
                  organizations are paths in. This is not for
                  everyone and not for the first year, but for
                  some it becomes the thing that helps.
                </li>
              </ul>
            </div>
          </Card>

          <Card tone="warn">
            <CardEyebrow>For other family members who use</CardEyebrow>
            <CardTitle>This is the moment, if there is one.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                If you have another family member with a substance
                use disorder, the overdose death may be the highest-leverage moment of their life for entering treatment.
                Researchers find that close family overdose deaths
                are one of the most consistent triggers for treatment
                engagement &mdash; even more than a person&rsquo;s
                own overdose or arrest.
              </p>
              <p>
                The conversation is delicate, but worth having. SAMHSA
                helpline (1-800-662-HELP) can refer to local
                treatment programs and provide guidance on how to
                approach the conversation. Many states have free
                family-coaching resources through their behavioral
                health department.
              </p>
              <p>
                <strong className="text-ink">Naloxone in every relevant home.</strong>{" "}
                If anyone in the broader family or social circle
                uses opioids or could be exposed to fentanyl-contaminated supply, Narcan should be in their
                home and the people around them should know how to
                use it. Free from most state health departments and
                available OTC at most pharmacies. Not a betrayal
                of the person who died; the opposite.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Books and reading</CardEyebrow>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">&ldquo;Beautiful Boy&rdquo;</strong>{" "}
                  by David Sheff and{" "}
                  <strong className="text-ink">&ldquo;Tweak&rdquo;</strong>{" "}
                  by Nic Sheff &mdash; father-and-son memoirs about
                  meth addiction; widely used in overdose-loss
                  family circles for understanding the disease
                  model.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;Saving Sammy&rdquo;</strong>{" "}
                  by Beth Maloney &mdash; about the medical-system
                  failures that often surround substance-use death.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;In the Realm of Hungry Ghosts&rdquo;</strong>{" "}
                  by Gabor Maté &mdash; the disease model of
                  addiction explained at depth; helpful for
                  survivors needing to understand why their loved
                  one couldn&rsquo;t stop.
                </li>
                <li>
                  <strong className="text-ink">GRASP&rsquo;s own resource library</strong>{" "}
                  at{" "}
                  <a
                    href="https://grasphelp.org/grief-resources/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    grasphelp.org/grief-resources
                  </a>{" "}
                  includes book and article recommendations
                  specifically vetted by overdose-loss families.
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
                </Link>
              </li>
              <li>
                <Link
                  href="/sudden-loss"
                  className="text-primary-deep underline"
                >
                  Sudden death
                </Link>{" "}
                &mdash; the medical-examiner process and the
                pending death certificate apply.
              </li>
              <li>
                <Link
                  href="/disenfranchised-grief"
                  className="text-primary-deep underline"
                >
                  When the world doesn&rsquo;t recognize your loss
                </Link>{" "}
                &mdash; overdose loss is heavily stigmatized; the
                framework helps.
              </li>
              <li>
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  Talking to children about death
                </Link>{" "}
                &mdash; with the overdose-specific additions above.
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical
            or psychological advice. Overdose loss is highly
            individual; the organizations and books cited are based
            on broad recommendation in the overdose-loss community,
            but specific situations may require individual support
            beyond what&rsquo;s here. If you are in crisis, call or
            text 988. If you have an active substance use concern
            for yourself or a family member, call SAMHSA at
            1-800-662-HELP.
          </p>

          <EmailCapture
            source="overdose-loss"
            title="Save this for later."
            subtitle="You probably can't absorb all of this right now. We'll email it so it's there when you can."
            buttonLabel="Email me this guide"
            successMessage="It's in your inbox. You're not alone in this."
          />

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
