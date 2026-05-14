import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";

export const metadata: Metadata = {
  title: "Death of a child — for bereaved parents",
  description:
    "An honest guide for parents who have lost a child of any age. The unique grief, the marriage strain reality, surviving siblings, grandparent grief, and resources that actually help.",
  openGraph: { images: [ogImage("Death of a child", "Grief")] },
};

/**
 * /death-of-a-child — public, indexable. For bereaved parents,
 * grandparents, and siblings. Spans all ages of child (from
 * stillbirth through adult). The Compassionate Friends is the
 * primary national org. M.E.N.D. for pregnancy/neonatal overlap
 * (already in /disenfranchised-grief; this page covers older
 * children too).
 *
 * Sensitive content. Sister to redline before final MVP approval.
 * Voice: deeply validating, no performed empathy, honest about the
 * difficulty without saccharine framing.
 */
export default function DeathOfAChildPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="death-of-a-child"
        title="Death of a child"
        description="For bereaved parents of any-age children. The marriage strain reality (the 80% myth is false), surviving siblings, grandparents, The Compassionate Friends."
        eyebrow="Grief"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Death of a child</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              When you have lost a child.
            </h1>
            <p className="text-lg text-ink-soft">
              The death of a child is the loss our culture has the
              fewest words for. Some of what other people say will
              help. Most of it won&rsquo;t. This page is what we know
              from decades of research and from the largest
              bereaved-parent community in the country &mdash; what is
              survivable, what is unique to this loss, and where to
              find the people who can hear you.
            </p>
          </div>

          <Card tone="warn">
            <CardEyebrow>If you are in crisis</CardEyebrow>
            <CardTitle>988 is for grief, too.</CardTitle>
            <p className="text-ink-soft mt-3">
              Bereaved parents are at elevated risk of suicidal
              thoughts, particularly in the first 1&ndash;2 years
              and around birthdays and anniversaries. If you are
              struggling, call or text{" "}
              <strong className="text-ink">988</strong> &mdash; 24
              hours, free, trained for bereavement crises. This is
              exactly the kind of grief 988 handles.
            </p>
          </Card>

          <Card tone="primary">
            <CardEyebrow>The thing we know first</CardEyebrow>
            <CardTitle>You are still a parent.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Bereaved parents universally describe the same
                early confusion: am I still a mother? Am I still a
                father? When someone asks how many children I have,
                what do I say?
              </p>
              <p>
                The Compassionate Friends and decades of bereaved-
                parent literature converge on a clear answer: yes.
                You are still your child&rsquo;s parent. Death does
                not end parenthood. Many parents continue to
                celebrate birthdays, talk about their child to
                others, and identify as a parent of all their
                children &mdash; living and dead. There is no
                expiration on it.
              </p>
              <p>
                What to say when someone asks how many children you
                have is your call. Some bereaved parents say the
                full number (&ldquo;three: two living and one
                who died&rdquo;). Some say the living number to
                avoid the conversation. Many switch depending on
                context. None of these is wrong.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>What makes this grief different</CardEyebrow>
            <CardTitle>Five features bereaved parents describe consistently.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <strong className="text-ink">The order is wrong.</strong>{" "}
                  Parents are supposed to die before children. Every
                  bereaved parent describes some version of the same
                  feeling: this isn&rsquo;t how it&rsquo;s supposed
                  to be. The cultural script for grief assumes you
                  are grieving someone older &mdash; a parent,
                  spouse, grandparent. The script for losing a child
                  is mostly missing. Bereaved parents often feel that
                  they are off-map.
                </li>
                <li>
                  <strong className="text-ink">The future grief.</strong>{" "}
                  Other losses are grief for a person who lived. The
                  death of a child is also grief for everything that
                  was never going to happen &mdash; the milestones,
                  the wedding, the grandchildren, the version of
                  your life that included them growing up. This
                  grief continues to arrive in waves at every
                  milestone for decades. Their friends graduate; you
                  grieve. A song from their year comes on; you
                  grieve. This is normal and it does not mean you
                  haven&rsquo;t healed.
                </li>
                <li>
                  <strong className="text-ink">The marriage strain reality.</strong>{" "}
                  The widely-repeated statistic that 80% of couples
                  divorce after losing a child is a myth, based on a
                  small 1970s study that was misquoted for decades.
                  The actual divorce rate after child loss is closer
                  to 16% (lower than the general population). Most
                  marriages survive. But the marriages are changed.
                  Grieving partners often grieve at different
                  intensities and on different timelines, want to
                  talk about the loss differently, and find each
                  other&rsquo;s coping styles foreign. Couples
                  counseling specifically for bereaved parents
                  routinely helps.
                </li>
                <li>
                  <strong className="text-ink">Surviving siblings.</strong>{" "}
                  Often called &ldquo;the forgotten mourners&rdquo;
                  in bereavement research, surviving children are
                  consistently the most-overlooked grievers in the
                  family. They lose a sibling, they lose the parent
                  who is now grieving, and they lose the family
                  they had. Their behavior may regress, they may
                  become parentified (taking care of the grieving
                  parents), or they may grow up too fast. They
                  need their own support, distinct from yours.
                </li>
                <li>
                  <strong className="text-ink">Other people don&rsquo;t know what to say.</strong>{" "}
                  Friends, coworkers, sometimes extended family,
                  will say things that are wrong (&ldquo;at least
                  you have other children,&rdquo; &ldquo;you can
                  always have another,&rdquo; &ldquo;everything
                  happens for a reason&rdquo;). Some will avoid you
                  entirely. People who haven&rsquo;t lost a child
                  rarely know that the death will remain present
                  for the rest of your life and that &ldquo;moving
                  on&rdquo; is the wrong frame.
                </li>
              </ol>
            </div>
          </Card>

          <Card>
            <CardEyebrow>The timeline (such as it is)</CardEyebrow>
            <CardTitle>Bereaved parents describe an arc that is longer than other grief.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most bereaved-parent literature describes the
                following loose pattern, with the caveat that
                individual variation is enormous.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">First 6 months:</strong>{" "}
                  Acute grief. Sleep, appetite, daily function all
                  disrupted. Many parents describe a sense of
                  unreality. Returning to work too quickly is a
                  common regret; many bereaved parents recommend
                  taking 1&ndash;3 months off if possible, or
                  reducing to part-time.
                </li>
                <li>
                  <strong className="text-ink">6 to 24 months:</strong>{" "}
                  Slow softening, with sharp waves at milestones.
                  The first birthday, the first anniversary of the
                  death, the first holidays. The 6-month mark is
                  often when others assume you&rsquo;re &ldquo;over
                  it&rdquo; while you&rsquo;re still in the middle.
                  The second year is sometimes harder than the first
                  because the urgency has passed but the absence is
                  permanent.
                </li>
                <li>
                  <strong className="text-ink">2 to 5 years:</strong>{" "}
                  Most bereaved parents describe a gradual
                  integration. The grief is no longer the loudest
                  thing in every day, but it is still present and
                  unpredictable. Many parents describe finding a
                  new equilibrium around year 3 or 4. This is not
                  &ldquo;getting over it&rdquo; &mdash; it is
                  learning to carry it.
                </li>
                <li>
                  <strong className="text-ink">5 years and beyond:</strong>{" "}
                  Grief continues to arrive in waves at milestones
                  (graduations, weddings, the deceased child&rsquo;s
                  20th, 30th birthday). Most bereaved parents describe
                  the grief as &ldquo;always there, sometimes
                  quieter.&rdquo; The pain is rarely as constant as
                  the first year, but the loss never stops being a
                  central fact of their life. This is normal.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>If you have surviving children</CardEyebrow>
            <CardTitle>They are also grieving and they need explicit attention.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Surviving siblings grieve in ways that are easy to
                miss. The parents are grieving too &mdash; intensely
                &mdash; and the surviving children often try to
                protect their parents by hiding their own grief.
                This is not sustainable for the child.
              </p>
              <p>
                <strong className="text-ink">What helps:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Tell them their grief is welcome. Explicitly.
                  &ldquo;Your sister&rsquo;s death is your loss too.
                  You can be sad in front of me. You can be angry.
                  You can have days where you&rsquo;re fine and days
                  where you&rsquo;re not. All of that is OK with
                  me.&rdquo;
                </li>
                <li>
                  Make sure they are seen by someone outside the
                  family. A school counselor, a therapist, a
                  grief-specific support group for kids. The Dougy
                  Center maintains a national directory of
                  children&rsquo;s grief programs at{" "}
                  <a
                    href="https://www.dougy.org/grief-support-resources/find-support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    dougy.org/find-support
                  </a>
                  . Most programs are free.
                </li>
                <li>
                  Keep routines. School, sports, friends. Routine is
                  comforting for grieving children and protects them
                  from feeling that their whole life ended too.
                </li>
                <li>
                  Talk about their sibling. Use their name. Don&rsquo;t
                  treat the death as the unspeakable thing in the
                  house &mdash; that silence is often what surviving
                  siblings describe as the hardest part decades
                  later.
                </li>
                <li>
                  Watch for warning signs that warrant professional
                  help: persistent withdrawal past 6 weeks, sleep
                  disturbances past 6 weeks, school refusal,
                  regression past 8 weeks, new risk behaviors in
                  teens. See{" "}
                  <Link
                    href="/talking-to-kids"
                    className="text-primary-deep underline"
                  >
                    the talking-to-kids guide
                  </Link>{" "}
                  for the full list and age-by-age framing.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Grandparents and extended family</CardEyebrow>
            <CardTitle>Grandparents are double-grieving.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Grandparents who lose a grandchild are grieving on
                two simultaneous tracks: grief for the grandchild,
                and grief for their own child &mdash; the bereaved
                parent &mdash; whose pain they cannot fix. This
                &ldquo;double grief&rdquo; is widely documented in
                the literature.
              </p>
              <p>
                Grandparents often default to fixing-mode: cleaning,
                cooking, caring for surviving grandchildren, taking
                phone calls. This is real help in the early weeks.
                It is also often a way of managing their own grief
                by being useful. Both things are OK.
              </p>
              <p>
                <strong className="text-ink">The Compassionate Friends</strong>{" "}
                runs grandparent-specific resources and meetings in
                many chapters. The Bereaved Grandparents Foundation
                also has support specifically for this group.
              </p>
            </div>
          </Card>

          <Card tone="good">
            <CardEyebrow>What helps</CardEyebrow>
            <CardTitle>The Compassionate Friends is the main one.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Almost every long-term bereaved parent who has been
                asked what helped most names the same thing: other
                bereaved parents. Specifically, The Compassionate
                Friends, which has been the central US bereaved-
                parent organization for 50 years.
              </p>
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  <strong className="text-ink">The Compassionate Friends (TCF)</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.compassionatefriends.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    compassionatefriends.org
                  </a>
                  . Largest US bereaved-parent and sibling
                  community. Chapters in every state, free monthly
                  in-person meetings, online support groups for
                  parents AND for siblings, annual national
                  conference. The single most-cited resource by
                  bereaved parents.
                </li>
                <li>
                  <strong className="text-ink">Bereaved Parents of the USA</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.bereavedparentsusa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    bereavedparentsusa.org
                  </a>
                  . Another national network with active chapters
                  in many states. Some parents prefer the smaller
                  community feel; some prefer TCF.
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
                  Overlaps with our{" "}
                  <Link
                    href="/disenfranchised-grief"
                    className="text-primary-deep underline"
                  >
                    pregnancy and infant loss section
                  </Link>
                  .
                </li>
                <li>
                  <strong className="text-ink">For loss to suicide, overdose, or specific cause:</strong>{" "}
                  see also{" "}
                  <Link
                    href="/suicide-loss"
                    className="text-primary-deep underline"
                  >
                    suicide-loss
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/overdose-loss"
                    className="text-primary-deep underline"
                  >
                    overdose-loss
                  </Link>{" "}
                  guides. The bereaved-parent community recognizes
                  these as specific grief subsets and many
                  Compassionate Friends chapters have subgroups.
                </li>
                <li>
                  <strong className="text-ink">For homicide loss specifically:</strong>{" "}
                  Parents of Murdered Children (
                  <a
                    href="https://pomc.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    pomc.org
                  </a>
                  ) is the primary US organization.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Therapy considerations</CardEyebrow>
            <CardTitle>Bereaved-parent-specific is worth seeking out.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Generic grief therapy is often inadequate for
                bereaved parents &mdash; the unique features (the
                wrong order, the ongoing future grief, the
                identity-as-parent questions) require a clinician
                who has worked with this population specifically.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Psychology Today directory: filter for &ldquo;grief
                  and loss&rdquo; and read for &ldquo;bereaved
                  parents&rdquo; in the bio.
                </li>
                <li>
                  TCF chapters frequently maintain referral lists of
                  therapists who have worked with bereaved parents.
                </li>
                <li>
                  Couples counseling specifically for bereaved
                  parents (if the relationship is strained) is a
                  separate referral &mdash; ask TCF or the therapist
                  for a couples-focused colleague.
                </li>
                <li>
                  If the death involved trauma (witnessed,
                  homicide, suicide, sudden accident), trauma-
                  focused therapy (EMDR or CPT) is the evidence-
                  based response and runs in parallel with grief
                  therapy.
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Books</CardEyebrow>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">&ldquo;Bearing the Unbearable&rdquo;</strong>{" "}
                  by Joanne Cacciatore. Bereaved-parent-written, the
                  most-loaned book in this community.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;The Bereaved Parent&rdquo;</strong>{" "}
                  by Harriet Sarnoff Schiff. The foundational text;
                  still the most-recommended starting point decades
                  after publication.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;An Exact Replica of a Figment of My Imagination&rdquo;</strong>{" "}
                  by Elizabeth McCracken. Stillbirth specifically;
                  literary, helpful for parents who think through
                  grief by reading.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;Lament for a Son&rdquo;</strong>{" "}
                  by Nicholas Wolterstorff. Adult-child loss,
                  faith-grounded but quiet about it.
                </li>
                <li>
                  <strong className="text-ink">For surviving siblings:</strong>{" "}
                  &ldquo;The Empty Room&rdquo; by Elizabeth DeVita-
                  Raeburn and TCF&rsquo;s sibling resources.
                </li>
              </ul>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>The thing we cannot tell you</CardEyebrow>
            <CardTitle>And the thing we can.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                We cannot tell you that this gets better in the way
                most other losses get better. The grief for a child
                tends to be carried for a lifetime, not resolved.
                Bereaved parents who are 30 years out describe still
                being shaped by the loss; the absence remains a
                permanent feature of their life.
              </p>
              <p>
                What we can tell you is that bereaved parents
                consistently describe survival, integration, and
                even meaning over time. Most do not stay in acute
                grief forever. Most rebuild a life that includes
                the loss without being defined by it. Most describe
                being changed in ways they didn&rsquo;t want, but
                also &mdash; honestly &mdash; coming to know parts
                of themselves they wouldn&rsquo;t have known
                otherwise. None of this is silver lining; none of
                this is the death &ldquo;being worth it.&rdquo; It
                is simply what bereaved parents who have made it
                across the longest distances report from the other
                side.
              </p>
              <p>
                The path to that integration almost always runs
                through other bereaved parents. The Compassionate
                Friends meeting in your area is the most reliable
                next step we know how to recommend.
              </p>
            </div>
          </Card>

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
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  Talking to children about death
                </Link>{" "}
                &mdash; for surviving siblings.
              </li>
              <li>
                <Link
                  href="/disenfranchised-grief"
                  className="text-primary-deep underline"
                >
                  Pregnancy and infant loss
                </Link>{" "}
                section, if your loss is in that period.
              </li>
              <li>
                <Link
                  href="/suicide-loss"
                  className="text-primary-deep underline"
                >
                  Suicide loss
                </Link>{" "}
                and{" "}
                <Link
                  href="/overdose-loss"
                  className="text-primary-deep underline"
                >
                  overdose loss
                </Link>{" "}
                if those apply.
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical
            or psychological advice. Bereaved-parent grief is
            highly individual; the organizations and books cited
            are based on broad use in the bereaved-parent community,
            but specific situations may need professional support
            beyond what&rsquo;s here. In a mental-health crisis,
            call or text 988.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
