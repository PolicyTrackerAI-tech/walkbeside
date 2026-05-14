import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Disenfranchised grief — when the world doesn't recognize your loss",
  description:
    "Miscarriage, stillbirth, ex-spouses, estranged family, unmarried partners, chosen family, pet loss. Honest guide to the grief that other people dismiss — and the support that does exist for it.",
};

/**
 * /disenfranchised-grief — public, indexable. The "your grief counts"
 * page for losses society routinely minimizes. Builds on /grief but
 * focuses specifically on the categories where bereaved people get
 * told (explicitly or implicitly) that their loss isn't big enough to
 * grieve fully.
 *
 * Voice: factual + validating; no performed empathy, no sister-voice
 * first person, no "we know how hard this is" framing.
 */
export default function DisenfranchisedGriefPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Disenfranchised grief</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              When the world doesn’t recognize your loss.
            </h1>
            <p className="text-lg text-ink-soft">
              Society has scripts for some kinds of grief and not
              others. A widow gets a casserole brigade and three days
              off work. A woman who miscarries at 11 weeks often gets
              no acknowledgment at all. The grief itself is just as
              real. This is the guide for the losses other content
              forgets to mention.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>The term, and why it matters</CardEyebrow>
            <CardTitle>Naming it is the first thing that helps.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The phrase <em>disenfranchised grief</em> was coined
                in 1989 by Kenneth Doka, a grief researcher who
                noticed that some bereaved people don&rsquo;t get the
                social rituals that normally support mourning:
                bereavement leave, the funeral as a public gathering,
                expressions of sympathy, time off the conversational
                rotation. Without those rituals, the grief still
                happens &mdash; just alone, often with the added
                weight of feeling that the loss doesn&rsquo;t
                &ldquo;count.&rdquo;
              </p>
              <p>
                Naming it as disenfranchised grief is not just a
                label. It&rsquo;s a reframe: the problem isn&rsquo;t
                that your reaction is too big for the loss. The
                problem is that the loss is treated as too small by
                people whose job it isn&rsquo;t to size your grief.
                Both can be true at once.
              </p>
              <p>
                Below: five of the most common categories, with what
                helps for each. None of these are exhaustive, and
                they&rsquo;re not ranked. If you&rsquo;re grieving a
                kind of loss not on this list, the general guidance
                at the bottom of the page applies.
              </p>
            </div>
          </Card>

          {/* Category 1: Pregnancy and infant loss */}
          <Card>
            <CardEyebrow>Pregnancy and infant loss</CardEyebrow>
            <CardTitle>Miscarriage, stillbirth, NICU loss, SIDS.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                About 1 in 4 known pregnancies ends in miscarriage.
                Stillbirth (loss after 20 weeks) happens in about 1
                in 175 US pregnancies. Infant death in the first year
                happens to about 5 in every 1,000 births. None of
                this is rare. All of it is consistently treated as
                unspeakable.
              </p>
              <p>
                The grief is intense. The body remembers the
                pregnancy for weeks: hormone shifts, milk supply,
                physical recovery. Parents grieve a child they imagined
                and the future they had attached to that child. They
                grieve in a way that doesn&rsquo;t fit the cultural
                expectation that the loss is &ldquo;small.&rdquo;
              </p>
              <p>
                Common harm from well-meaning people: <em>&ldquo;at
                least it was early,&rdquo; &ldquo;you can try again,&rdquo;
                &ldquo;everything happens for a reason,&rdquo; &ldquo;at
                least you have other children.&rdquo;</em>{" "}
                None of those help. The grief is for{" "}
                <em>this child</em>.
              </p>
              <p>
                <strong className="text-ink">Resources:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Share Pregnancy &amp; Infant Loss Support</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://nationalshare.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    nationalshare.org
                  </a>
                  . National network of in-person and online support
                  groups, free.
                </li>
                <li>
                  <strong className="text-ink">M.E.N.D. (Mommies Enduring Neonatal Death)</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.mend.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    mend.org
                  </a>
                  . Stillbirth and infant loss specifically.
                </li>
                <li>
                  <strong className="text-ink">The Star Legacy Foundation</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://starlegacyfoundation.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    starlegacyfoundation.org
                  </a>
                  . Stillbirth research, advocacy, and family support.
                </li>
                <li>
                  <strong className="text-ink">First Candle</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://firstcandle.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    firstcandle.org
                  </a>
                  . SIDS, stillbirth, and infant loss. 24/7 grief
                  support line.
                </li>
              </ul>
              <p>
                Most hospitals have bereavement coordinators who can
                connect families to local groups within hours of the
                loss. Ask. The connection often matters more than
                anyone realizes at the time.
              </p>
            </div>
          </Card>

          {/* Category 2: Ex-spouse */}
          <Card>
            <CardEyebrow>The death of an ex-spouse or former partner</CardEyebrow>
            <CardTitle>You loved them once. The grief is real.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                When a former spouse dies &mdash; especially one you
                shared a long marriage with, raised children with, or
                stayed friendly with after the split &mdash; the grief
                often surprises people in its intensity. The social
                world has no script for this. You&rsquo;re not the
                widow at the funeral. You may not be invited to the
                funeral. You don&rsquo;t get bereavement leave. People
                assume that because the marriage ended, the grief is
                disqualified.
              </p>
              <p>
                It isn&rsquo;t. You&rsquo;re grieving the person, the
                shared history, and sometimes the version of yourself
                that loved them. Co-parents grieve the loss of a
                parenting partner. The grief can include relief and
                conflict and tenderness at the same time. All of that
                is legitimate.
              </p>
              <p>
                <strong className="text-ink">What helps:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Find one person who knew both of you and let them
                  bear witness. Often a long-time mutual friend who
                  saw the marriage from the outside.
                </li>
                <li>
                  If you have children together, your grief is going
                  to be different from theirs but happens alongside it.
                  A few sessions with a family therapist or grief
                  counselor can help you parent through it without
                  collapsing the two grieves into each other.{" "}
                  <Link
                    href="/talking-to-kids"
                    className="text-primary-deep underline"
                  >
                    The talking-to-kids guide
                  </Link>{" "}
                  applies.
                </li>
                <li>
                  Attending the funeral, if welcomed, is almost
                  always worth doing. Standing in the back is a real
                  option. Many divorced spouses regret skipping it.
                </li>
                <li>
                  You may want to write something for the children,
                  or just for yourself, acknowledging the loss in
                  your own words. The official obituary won&rsquo;t
                  reflect your version of them.
                </li>
              </ul>
            </div>
          </Card>

          {/* Category 3: Estranged family */}
          <Card>
            <CardEyebrow>The death of an estranged family member</CardEyebrow>
            <CardTitle>The relationship ended a while ago. The death is now.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Estrangement from a parent, sibling, or child is more
                common than the cultural narrative admits &mdash;
                roughly 1 in 4 US adults report a current estrangement
                from a family member. When the estranged person dies,
                the grief is genuinely complicated: you may grieve
                the parent they could have been more than the parent
                they were. The relationship that ended is the one
                you wanted; the one that died is the one you actually
                had.
              </p>
              <p>
                You may also feel something close to relief &mdash;
                the ongoing tension is finally resolved, the
                possibility of reconciliation is closed, the
                low-grade anxiety of &ldquo;will they show up at the
                holidays&rdquo; is gone. Relief and grief can sit in
                the same chest. Both are honest.
              </p>
              <p>
                Common landmines: pressure from extended family to
                attend the funeral, give a eulogy, claim grief that
                wasn&rsquo;t earned. Or the opposite &mdash;
                presumption that you shouldn&rsquo;t feel anything
                because &ldquo;you weren&rsquo;t close.&rdquo; Neither
                framing is yours to honor.
              </p>
              <p>
                <strong className="text-ink">What helps:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Decide one thing at a time. Do I attend the funeral?
                  Do I want to see the body? Do I want to speak? Each
                  is a separate question. Decline any of them without
                  apology if that&rsquo;s right.
                </li>
                <li>
                  A grief therapist who works with estrangement is
                  worth the cost. The grief has more layers than
                  &ldquo;straightforward&rdquo; bereavement and is
                  often misread by friends.
                </li>
                <li>
                  <strong className="text-ink">Stand Alone</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.standalone.org.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    standalone.org.uk
                  </a>
                  . UK-based but online resources and forums available
                  to anyone. The most thoughtful peer community for
                  estranged adults.
                </li>
                <li>
                  <strong className="text-ink">Together Estranged</strong>{" "}
                  &mdash; private online community for adults estranged
                  from family. Active US membership.
                </li>
              </ul>
            </div>
          </Card>

          {/* Category 4: Unmarried partner / chosen family / LGBTQ+ */}
          <Card>
            <CardEyebrow>Unmarried partners and chosen family</CardEyebrow>
            <CardTitle>The people who counted, on paper or not.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Long-term unmarried partners, queer chosen family,
                close friends who functioned as family, partners
                whose relationship was hidden from a biological family
                &mdash; all of these grievers carry the same kind of
                loss as a spouse or sibling, with none of the legal
                or social standing.
              </p>
              <p>
                The harms compound: not being notified of the death
                until late, not being listed in the obituary, being
                excluded from the funeral or only invited as a
                &ldquo;friend,&rdquo; having no right to medical or
                disposition decisions, being unable to take
                bereavement leave because HR doesn&rsquo;t recognize
                the relationship. For LGBTQ+ people whose families
                of origin were hostile or whose partner was closeted,
                the indignities can stack on top of the loss for
                months.
              </p>
              <p>
                <strong className="text-ink">What helps:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Hold your own ceremony if you weren&rsquo;t included
                  in the official one. With your chosen family. On
                  your schedule. Where you actually grieved them.
                </li>
                <li>
                  Talk to your employer&rsquo;s HR &mdash; many
                  bereavement-leave policies have been quietly updated
                  to include &ldquo;chosen family&rdquo; or &ldquo;any
                  loved one&rdquo; even when they don&rsquo;t advertise
                  it. Ask in writing.
                </li>
                <li>
                  <strong className="text-ink">PFLAG</strong>{" "}
                  (
                  <a
                    href="https://pflag.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    pflag.org
                  </a>
                  ) and <strong className="text-ink">SAGE</strong>{" "}
                  (
                  <a
                    href="https://sageusa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    sageusa.org
                  </a>
                  ) both have local chapters and grief support for
                  LGBTQ+ family loss.
                </li>
                <li>
                  Find an LGBTQ+-affirming grief therapist if needed:
                  Psychology Today filter for &ldquo;LGBTQ&rdquo; +
                  &ldquo;grief.&rdquo; Many areas have at least a few
                  options.
                </li>
              </ul>
              <p>
                Pre-emptive note for anyone reading this who is{" "}
                <em>not</em> currently grieving: a Designation of
                Agent form, healthcare proxy, and updated will are
                the three documents that prevent most of the harms
                above. If your relationship isn&rsquo;t recognized by
                default state law, those three pieces of paper change
                the math. See{" "}
                <Link
                  href="/plan-ahead"
                  className="text-primary-deep underline"
                >
                  the pre-need planning playbook
                </Link>
                .
              </p>
            </div>
          </Card>

          {/* Category 5: Pet loss */}
          <Card>
            <CardEyebrow>Pet loss</CardEyebrow>
            <CardTitle>The grief is the size of the relationship.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The bereaved-pet-owner is one of the most consistently
                dismissed grievers. &ldquo;It&rsquo;s just a dog&rdquo;
                from a coworker. No bereavement leave at most
                employers. No funeral. No casserole.
              </p>
              <p>
                The grief is not about the species. A 14-year
                relationship that involved daily caretaking, physical
                contact, communication, and presence is a
                substantial bond regardless of whether the other
                party was a human. Many people grieve pets more
                intensely than distant human relatives because the
                day-to-day relationship was deeper.
              </p>
              <p>
                Pet grief frequently includes a layer of guilt
                specific to euthanasia decisions &mdash; second-
                guessing whether it was time, whether more could have
                been done, the act of having made the choice.
              </p>
              <p>
                <strong className="text-ink">Resources:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Association for Pet Loss and Bereavement (APLB)</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.aplb.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    aplb.org
                  </a>
                  . Online chat support, support-group listings, and
                  a free hotline.
                </li>
                <li>
                  <strong className="text-ink">Lap of Love</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.lapoflove.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    lapoflove.com
                  </a>
                  . In-home euthanasia network with grief support
                  resources for clients and non-clients alike.
                </li>
                <li>
                  <strong className="text-ink">Many veterinary schools</strong>{" "}
                  run free pet-loss support hotlines (Cornell, UC
                  Davis, Tufts, Washington State, others). Search
                  &ldquo;[your state] veterinary school pet loss
                  hotline.&rdquo;
                </li>
              </ul>
            </div>
          </Card>

          {/* What helps universally */}
          <Card tone="primary">
            <CardEyebrow>What helps, across categories</CardEyebrow>
            <CardTitle>Five things that apply to any disenfranchised loss.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Name what happened to yourself.</strong>{" "}
                  Out loud, in writing, to one trusted person. Even
                  if no one else acknowledges it, you can. The act
                  of naming changes how the grief sits.
                </li>
                <li>
                  <strong className="text-ink">Find one peer.</strong>{" "}
                  The single thing every disenfranchised griever
                  describes as life-changing is meeting one other
                  person who&rsquo;s been through the specific kind
                  of loss. Online groups count. The peer doesn&rsquo;t
                  have to become a friend; they just have to exist.
                </li>
                <li>
                  <strong className="text-ink">Create your own ritual.</strong>{" "}
                  If society didn&rsquo;t give you a funeral, write
                  the eulogy you wished was given. Plant something.
                  Make a meal you used to share. Light a candle on a
                  specific date. The ritual doesn&rsquo;t need anyone
                  else&rsquo;s permission to be real.
                </li>
                <li>
                  <strong className="text-ink">Ask explicitly for what you need.</strong>{" "}
                  Most people are bad at offering support for losses
                  they don&rsquo;t recognize. They&rsquo;re better
                  when asked directly: &ldquo;Can you come over
                  Saturday and just sit with me?&rdquo; &ldquo;Can
                  you cover my shift this week?&rdquo; &ldquo;Can you
                  not bring it up in front of [other person] when
                  I&rsquo;m around?&rdquo;
                </li>
                <li>
                  <strong className="text-ink">Consider a grief therapist who works with your specific kind of loss.</strong>{" "}
                  Generic therapists are sometimes worse than nothing
                  when the loss is disenfranchised &mdash; they
                  default to standard grief frameworks that
                  don&rsquo;t fit. Filter for the specific loss type
                  on Psychology Today, or ask the relevant resource
                  organization (above) for a referral.
                </li>
              </ol>
            </div>
          </Card>

          {/* When professional help */}
          <Card tone="warn">
            <CardEyebrow>When to get professional help</CardEyebrow>
            <CardTitle>The threshold is the same as for any grief.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Disenfranchised grief has the same warning signs as
                recognized grief, and the threshold for professional
                help is the same. Don&rsquo;t let the &ldquo;it
                doesn&rsquo;t count&rdquo; framing make you wait
                longer than you would with a more publicly-recognized
                loss.
              </p>
              <p>Get help if:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  You can&rsquo;t function in daily life past 6&ndash;8
                  weeks.
                </li>
                <li>
                  Sleep is severely disrupted past 6&ndash;8 weeks.
                </li>
                <li>
                  You are having persistent wishes to die or to be
                  with the deceased &mdash; same-day call to 988.
                </li>
                <li>
                  Substance use is becoming a primary coping tool.
                </li>
                <li>
                  At 12 months, the grief is still acute, intrusive,
                  and interfering with daily life.
                </li>
              </ul>
              <p>
                If you&rsquo;re in crisis right now, call or text{" "}
                <strong className="text-ink">988</strong> (Suicide
                &amp; Crisis Lifeline) &mdash; 24 hours, free,
                confidential. Disenfranchised grief is exactly the
                kind of thing they handle, not just suicidal
                thoughts.
              </p>
            </div>
          </Card>

          {/* Cross-link */}
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
                &mdash; the general framework, the month-6 wall,
                finding a therapist.
              </li>
              <li>
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  Talking to children about death
                </Link>{" "}
                &mdash; especially relevant for ex-spouse and
                estranged-family deaths where children are involved.
              </li>
              <li>
                <Link
                  href="/plan-ahead"
                  className="text-primary-deep underline"
                >
                  Pre-need planning playbook
                </Link>{" "}
                &mdash; for anyone whose relationship isn&rsquo;t
                recognized by default state law and wants to prevent
                some of the harms above.
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical
            or psychological advice. Specific situations may require
            individual support beyond what&rsquo;s here. The
            organizations and resources listed are based on broad
            use by grief researchers and clinicians; mention is not
            endorsement of a specific therapeutic approach. In a
            mental-health crisis, call or text 988.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
