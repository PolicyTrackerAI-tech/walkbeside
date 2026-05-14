import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";

export const metadata: Metadata = {
  title: "Funeral etiquette — what to say, what to wear, what to bring",
  description:
    "An honest guide for friends and coworkers attending a funeral or supporting a grieving family. What to say, what NOT to say, what to wear, whether to bring kids, how to be useful after the funeral. No corny rules.",
  openGraph: { images: [ogImage("Funeral etiquette — what to say, what to wear", "Family")] },
};

/**
 * /funeral-etiquette — public, indexable. For ATTENDEES (friends,
 * coworkers, distant family) — not the bereaved. Massive evergreen
 * SEO opportunity. Practical guidance on what to do at funerals
 * and how to support grieving families afterward.
 */
export default function FuneralEtiquettePage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="funeral-etiquette"
        title="Funeral etiquette — what to say, what to wear, what to bring"
        description="For attendees, not the bereaved. What to say (almost nothing), what to wear, whether to bring kids, flowers vs donations, the casserole rules, and how to actually help."
        eyebrow="Family"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Funeral etiquette</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              What to say, what to wear, what to bring — and how to actually help.
            </h1>
            <p className="text-lg text-ink-soft">
              Most funeral-etiquette guides are written by people who
              don&rsquo;t know anyone bereaved &mdash; they cover
              napkin folding and dress codes and miss the things that
              actually matter. This is the version written from the
              perspective of people who&rsquo;ve been on the other
              side of the receiving line and remember which gestures
              helped and which ones didn&rsquo;t.
            </p>
          </div>

          {/* What to say */}
          <Card>
            <CardEyebrow>What to say</CardEyebrow>
            <CardTitle>Almost nothing. Just be there.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The single most universal piece of advice from
                grieving families: the people who try hardest to say
                the right thing usually say the worst thing. The
                people who simply show up without speeches are the
                ones the bereaved remember years later.
              </p>
              <p>
                <strong className="text-ink">Things that work:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  &ldquo;I&rsquo;m so sorry.&rdquo;
                </li>
                <li>
                  &ldquo;I loved [name].&rdquo; (followed by a
                  specific memory, if you have one)
                </li>
                <li>
                  &ldquo;I&rsquo;m thinking about you.&rdquo;
                </li>
                <li>
                  &ldquo;There are no words. I&rsquo;m just here.&rdquo;
                </li>
                <li>
                  A long silent hug. Often this is the whole thing.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Things to avoid:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  &ldquo;Everything happens for a reason.&rdquo;
                </li>
                <li>
                  &ldquo;They&rsquo;re in a better place.&rdquo;
                  (Unless you know the family&rsquo;s exact
                  religious framework and they&rsquo;d find this
                  meaningful.)
                </li>
                <li>
                  &ldquo;At least they didn&rsquo;t suffer.&rdquo;
                </li>
                <li>
                  &ldquo;At least you had so many good years.&rdquo;
                </li>
                <li>
                  &ldquo;I know how you feel.&rdquo; (You probably
                  don&rsquo;t. Don&rsquo;t claim it.)
                </li>
                <li>
                  &ldquo;Let me know if I can do anything.&rdquo;{" "}
                  (This sounds kind but puts the work on the
                  bereaved. See &ldquo;how to actually help&rdquo;
                  below for better.)
                </li>
                <li>
                  Long stories about your own losses, comparing
                  your grief to theirs.
                </li>
                <li>
                  Theology. Politics. Any sentence that begins with
                  &ldquo;at least.&rdquo;
                </li>
              </ul>
              <p>
                If you say the wrong thing, you say the wrong thing.
                Grieving families forgive almost everything except
                absence. Showing up matters more than saying it
                right.
              </p>
            </div>
          </Card>

          {/* What to wear */}
          <Card>
            <CardEyebrow>What to wear</CardEyebrow>
            <CardTitle>When in doubt, conservative and dark.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Traditional Western funerals: black, dark navy, or
                dark gray. Suit and tie for men or a comparable
                outfit (dark dress pants, dress shoes, button-up,
                tie optional). Knee-length or longer dress, skirt,
                or pantsuit for women. Closed-toe shoes. Minimal
                jewelry.
              </p>
              <p>
                <strong className="text-ink">Religious or cultural variations:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Jewish funerals:</strong>{" "}
                  conservative dark clothing. Men cover their head
                  (yarmulkes usually provided at the door). Married
                  women may cover their head in Orthodox settings.
                  Generally no flowers.
                </li>
                <li>
                  <strong className="text-ink">Catholic funerals:</strong>{" "}
                  conservative dark clothing. Standard funeral dress
                  code applies. Mass attendees follow standard
                  church etiquette (stand, sit, kneel with the
                  congregation if you&rsquo;re comfortable).
                </li>
                <li>
                  <strong className="text-ink">Muslim funerals:</strong>{" "}
                  modest clothing, dark colors. Women cover their
                  head and dress modestly (long sleeves, long
                  pants or skirt). Men in long pants and modest
                  shirt. Shoes removed before entering the prayer
                  area.
                </li>
                <li>
                  <strong className="text-ink">Hindu funerals:</strong>{" "}
                  white clothing is traditional (the opposite of
                  Western convention). Dress modestly. Some
                  families relax the rule for non-Hindu guests;
                  when in doubt ask the family or wear muted
                  colors.
                </li>
                <li>
                  <strong className="text-ink">Buddhist funerals:</strong>{" "}
                  vary widely by tradition; muted colors and
                  modesty work for most. White is appropriate in
                  some East Asian Buddhist traditions.
                </li>
                <li>
                  <strong className="text-ink">Celebration of life or memorial service:</strong>{" "}
                  the family often specifies a different dress
                  code (&ldquo;wear something colorful,&rdquo;
                  &ldquo;come as you are,&rdquo; &ldquo;wear his
                  favorite team&rsquo;s jersey&rdquo;). Follow it.
                  If unsure, conservative business attire is safe
                  default.
                </li>
                <li>
                  <strong className="text-ink">Outdoor or graveside:</strong>{" "}
                  add a coat, hat, and umbrella appropriate to the
                  season. Cemeteries are often colder and windier
                  than expected.
                </li>
              </ul>
            </div>
          </Card>

          {/* Whether to bring kids */}
          <Card>
            <CardEyebrow>Whether to bring kids</CardEyebrow>
            <CardTitle>Usually yes, with prep — and an escape plan.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Children who attend funerals tend to do better
                long-term than children who are excluded &mdash;
                even very young children. The general bereavement
                research is clear on this. That said, three
                practical points:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Prepare them.</strong>{" "}
                  Tell them what will happen, what they will see,
                  how long it will last, whether they will see the
                  body. Specific details reduce anxiety.
                </li>
                <li>
                  <strong className="text-ink">Give them an exit.</strong>{" "}
                  Sit near the back. Have a quiet activity in your
                  bag. Be prepared to take them out if they need it.
                </li>
                <li>
                  <strong className="text-ink">Ask the family first if you&rsquo;re a non-immediate guest.</strong>{" "}
                  Some families want the kids; some prefer a
                  quieter service. A quick text (&ldquo;I&rsquo;m
                  bringing the children if that&rsquo;s OK&rdquo;)
                  is a courtesy.
                </li>
              </ul>
              <p>
                For talking to your own kids about the death,{" "}
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  see the age-by-age guide
                </Link>
                .
              </p>
            </div>
          </Card>

          {/* Flowers vs donations */}
          <Card>
            <CardEyebrow>Flowers vs. memorial donations</CardEyebrow>
            <CardTitle>Read the obituary. It usually tells you.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The obituary almost always specifies one of three
                paths:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">&ldquo;In lieu of flowers, donations to [organization]&rdquo;</strong>{" "}
                  &mdash; send a donation. Many funeral homes
                  collect donations on behalf of the family or you
                  can give directly to the named organization. The
                  family is notified by the org that you gave;
                  amount is private.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;Flowers welcome&rdquo;</strong>{" "}
                  or no specification &mdash; flowers are
                  appropriate. Order through a florist with
                  delivery to the funeral home (the home will know
                  the timing). Spray, wreath, or potted plant are
                  all fine. Modest is better than ornate.
                </li>
                <li>
                  <strong className="text-ink">&ldquo;Family requests no flowers or donations&rdquo;</strong>{" "}
                  &mdash; some families want no formal tribute. A
                  card or a meal delivered later is the alternative.
                </li>
              </ul>
              <p>
                <strong className="text-ink">For Jewish funerals:</strong>{" "}
                flowers are traditionally not sent. A donation to a
                charity the family supports is the standard
                alternative. Sending a tree planted in Israel
                through JNF is a common tradition.
              </p>
              <p>
                <strong className="text-ink">Cost guidance:</strong>{" "}
                a respectable flower arrangement is
                $75&ndash;$200. A reasonable donation is whatever
                you would have spent on flowers or what feels
                meaningful to you &mdash; the family is not told the
                amount.
              </p>
            </div>
          </Card>

          {/* Money / cash gifts */}
          <Card>
            <CardEyebrow>Money and cash gifts</CardEyebrow>
            <CardTitle>Depends heavily on culture.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                In US white Protestant tradition, cash gifts to the
                family are unusual outside of severe financial
                hardship. The norm is flowers or donations.
              </p>
              <p>
                Other traditions vary substantially:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Many Asian cultures</strong>{" "}
                  (Chinese, Vietnamese, Filipino, Korean) include
                  monetary gifts in white envelopes, usually
                  $50&ndash;$200, sometimes more for close family.
                  Practices vary; if you&rsquo;re unsure, ask
                  someone from the community.
                </li>
                <li>
                  <strong className="text-ink">Latino traditions</strong>{" "}
                  often include cash contributions to help with
                  funeral costs, particularly for working-class or
                  immigrant families.
                </li>
                <li>
                  <strong className="text-ink">Black American funerals</strong>{" "}
                  sometimes include &ldquo;love offerings&rdquo;
                  collected at the service or beforehand.
                </li>
                <li>
                  <strong className="text-ink">For families facing financial hardship</strong>{" "}
                  of any background, a discreet envelope or a
                  GoFundMe contribution is appropriate and almost
                  always welcomed.
                </li>
              </ul>
              <p>
                When unsure, follow the obituary. If it specifies
                donations, donate. If a GoFundMe is mentioned or
                circulating, that&rsquo;s the family&rsquo;s signal.
              </p>
            </div>
          </Card>

          {/* What to bring */}
          <Card>
            <CardEyebrow>The casserole question</CardEyebrow>
            <CardTitle>Food helps. Just deliver it right.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Bringing a meal to the home is one of the most
                consistently useful things friends and neighbors do.
                A few practical rules from grieving families who
                have received hundreds of dishes:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">In a disposable container.</strong>{" "}
                  Returning dishes is a task the family doesn&rsquo;t
                  have bandwidth for. Foil pans, paper containers,
                  takeout boxes. If you absolutely must use a real
                  dish, write your name on tape and accept that you
                  may not see it again.
                </li>
                <li>
                  <strong className="text-ink">Label it.</strong>{" "}
                  What it is, when made, and what&rsquo;s in it
                  (especially allergens). Heating instructions if
                  needed. The family is not in a state to ask
                  questions.
                </li>
                <li>
                  <strong className="text-ink">Drop and go.</strong>{" "}
                  Don&rsquo;t expect to be invited in. A friendly
                  doorstep handoff and a wave is plenty. The
                  family is overwhelmed; brief is kind.
                </li>
                <li>
                  <strong className="text-ink">Coordinate.</strong>{" "}
                  Most families get a flood of food in the first
                  three days and nothing after. Sign up for a
                  meal-train slot for week two or three. Tools
                  like MealTrain.com let one person organize the
                  whole network.
                </li>
                <li>
                  <strong className="text-ink">Think beyond casserole.</strong>{" "}
                  Breakfast pastries (mornings are hard). Easy
                  snacks for grieving kids. Coffee. Paper plates and
                  utensils so the family doesn&rsquo;t have to wash
                  dishes. Toilet paper, paper towels, basic
                  household supplies. Less appetizing but often more
                  useful.
                </li>
              </ul>
            </div>
          </Card>

          {/* What happens at a service */}
          <Card>
            <CardEyebrow>What happens at each kind of service</CardEyebrow>
            <CardTitle>Quick guide so you’re not lost.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">Viewing (also called visitation or wake).</strong>{" "}
                Open hours, often the evening before the funeral.
                The body is present, sometimes with the casket open.
                You pay respects to the family, briefly view the
                body if open-casket and you feel comfortable, sign
                the guestbook, leave a flower or token if provided.
                Typical attendance: 30&ndash;90 minutes per guest.
                You don&rsquo;t have to stay the whole time.
              </p>
              <p>
                <strong className="text-ink">Funeral service (religious or non-religious).</strong>{" "}
                Usually 30&ndash;60 minutes. Held at a funeral home,
                place of worship, or sometimes a graveside. Includes
                readings, music, eulogies. Sit toward the back if
                you&rsquo;re a less-close guest &mdash; reserved
                rows up front are for immediate family.
              </p>
              <p>
                <strong className="text-ink">Mass (Catholic) or other religious service.</strong>{" "}
                Standard religious-service etiquette applies. If
                you&rsquo;re not Catholic and a Catholic funeral
                Mass is being held, you don&rsquo;t need to take
                communion (cross your arms over your chest at the
                altar to receive a blessing instead, or simply
                stay in your pew).
              </p>
              <p>
                <strong className="text-ink">Graveside service.</strong>{" "}
                Brief (15&ndash;30 min). Held at the cemetery. The
                casket is lowered or placed. Family stands closest;
                friends stand a respectful distance back. Sometimes
                a small handful of dirt is thrown by mourners onto
                the casket; you can participate or not.
              </p>
              <p>
                <strong className="text-ink">Memorial service.</strong>{" "}
                Like a funeral but held without the body present
                (often after cremation or burial has already
                occurred). More relaxed in tone &mdash; sometimes
                weeks after the death. Standard funeral etiquette
                still applies unless the family specifies otherwise.
              </p>
              <p>
                <strong className="text-ink">Reception or repast.</strong>{" "}
                Held after the service, often at the funeral home,
                a private home, or a restaurant. Less formal.
                Brings together everyone for food and conversation.
                You can stay 30 min to a few hours depending on
                relationship.
              </p>
            </div>
          </Card>

          {/* How to actually help */}
          <Card tone="primary">
            <CardEyebrow>How to actually help</CardEyebrow>
            <CardTitle>The week of the funeral, and the months after.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                &ldquo;Let me know if there&rsquo;s anything I can
                do&rdquo; is one of the most common things said and
                one of the least useful, because it puts the work on
                the bereaved to identify and ask. Most grieving
                people don&rsquo;t know what they need, can&rsquo;t
                bring themselves to ask, and find the open question
                exhausting.
              </p>
              <p>
                <strong className="text-ink">Instead, make a specific offer:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  &ldquo;I&rsquo;m bringing dinner Tuesday. Do you
                  prefer 5pm or 6pm drop-off?&rdquo;
                </li>
                <li>
                  &ldquo;I&rsquo;m picking up the kids from school
                  this week. Tell me where and what time.&rdquo;
                </li>
                <li>
                  &ldquo;I&rsquo;m going to mow your lawn this
                  Saturday. You don&rsquo;t need to be home.&rdquo;
                </li>
                <li>
                  &ldquo;I&rsquo;m going to handle the thank-you
                  cards. Send me the names and addresses when you
                  can.&rdquo;
                </li>
                <li>
                  &ldquo;Walking your dog at 6:30am all week. Don&rsquo;t
                  worry about replying.&rdquo;
                </li>
                <li>
                  &ldquo;I&rsquo;ll cover your Tuesday meeting.
                  I&rsquo;ll send notes.&rdquo;
                </li>
                <li>
                  &ldquo;I&rsquo;m grocery-shopping Sunday. Text me
                  a list or I&rsquo;ll send what I&rsquo;d cook.&rdquo;
                </li>
              </ul>
              <p>
                <strong className="text-ink">And — months later — keep showing up.</strong>{" "}
                The grief is loudest at week 1 and at month 6, but
                the support drops off after week 3. The most-cited
                meaningful gesture from grieving families:{" "}
                <em>the friend who texted on the 6-month anniversary
                because they remembered</em>. That single text is
                worth more than any of the casseroles. Put the
                date in your calendar now.
              </p>
            </div>
          </Card>

          {/* Bereavement leave from a coworker */}
          <Card>
            <CardEyebrow>If a coworker is grieving</CardEyebrow>
            <CardTitle>What to do at work, specifically.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Acknowledge the death briefly when they return.</strong>{" "}
                  &ldquo;I&rsquo;m so sorry about your dad. I&rsquo;m
                  here if you need anything.&rdquo; Then move on.
                  Don&rsquo;t avoid them, but don&rsquo;t hover.
                </li>
                <li>
                  <strong className="text-ink">Cover their work without making a show of it.</strong>{" "}
                  Quietly handle the small things they&rsquo;d
                  normally pick up. Don&rsquo;t expect thanks.
                </li>
                <li>
                  <strong className="text-ink">Lower your expectations of them for 4&ndash;8 weeks.</strong>{" "}
                  Concentration is impaired, emotional regulation
                  is harder, simple meetings can feel surreal.
                  They will recover, on their own timeline.
                </li>
                <li>
                  <strong className="text-ink">Don&rsquo;t schedule them on the deceased&rsquo;s birthday or anniversary if you know it.</strong>{" "}
                  If they&rsquo;ve mentioned the date, quietly
                  schedule around it.
                </li>
                <li>
                  <strong className="text-ink">Office collection:</strong>{" "}
                  if the office is collecting for flowers or a
                  donation, contribute proportionally to your
                  closeness and your means. $20&ndash;$50 is
                  typical.
                </li>
              </ul>
            </div>
          </Card>

          {/* Things people don't tell you */}
          <Card>
            <CardEyebrow>Three things people don’t tell you</CardEyebrow>
            <div className="text-ink-soft space-y-3 mt-3">
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  <strong className="text-ink">The receiving line is exhausting for the family.</strong>{" "}
                  Standing for 2+ hours hugging dozens of people is
                  physically and emotionally depleting. Brief is
                  kind. Move along after your moment.
                </li>
                <li>
                  <strong className="text-ink">It&rsquo;s OK to leave early.</strong>{" "}
                  If you have to leave the reception or service
                  before it ends, you don&rsquo;t need to make a
                  long goodbye. A quiet exit and a follow-up text
                  later is fine.
                </li>
                <li>
                  <strong className="text-ink">Crying in front of the bereaved is fine.</strong>{" "}
                  Don&rsquo;t worry that your tears will overwhelm
                  them. Grieving families generally find shared
                  grief comforting, not burdening. Just don&rsquo;t
                  make the conversation about your grief.
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
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  Talking to children about death
                </Link>{" "}
                &mdash; if you&rsquo;re bringing yours or supporting
                a niece/nephew/grandchild.
              </li>
              <li>
                <Link
                  href="/grief"
                  className="text-primary-deep underline"
                >
                  Grief, month by month
                </Link>{" "}
                &mdash; helpful to read so you understand what
                your friend or coworker is going through over the
                year ahead.
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information. Funeral
            etiquette varies substantially by region, religion,
            family, and individual preference. When in doubt, ask
            someone from the community or the family directly. The
            best etiquette is attention to what the specific family
            wants, not adherence to a generic rulebook.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
