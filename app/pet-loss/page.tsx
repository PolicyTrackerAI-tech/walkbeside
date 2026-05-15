import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { EmailCapture } from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Pet loss — the grief is real, the euthanasia decision, what comes after",
  description:
    "An honest guide to losing an animal companion: how to know when it's time, in-home euthanasia, cremation and burial options, the grief that's not 'just a pet,' and resources that actually help.",
  openGraph: { images: [ogImage("When the animal you loved dies", "Grief")] },
};

/**
 * /pet-loss — public, indexable. Dedicated page for animal-companion
 * loss. Builds on the pet-loss section of /disenfranchised-grief.
 * Covers the unique elements: euthanasia decision, in-home euthanasia,
 * post-death options, and the validation that the grief is real.
 *
 * Voice: factual + validating, no FD-tagline, no performed empathy.
 */
export default function PetLossPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="pet-loss"
        title="Pet loss — when the animal you loved dies"
        description="The euthanasia decision, in-home options, disposition paths, the surviving pets and children, and resources for grief that isn't 'just a pet.'"
        eyebrow="Grief"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Pet loss</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              When the animal you loved dies.
            </h1>
            <p className="text-lg text-ink-soft">
              Most content about pet loss is either dismissive
              (&ldquo;it&rsquo;s just a dog&rdquo;) or saccharine
              (&ldquo;all dogs go to heaven&rdquo;). This page is
              neither. The grief is real, the decisions are hard,
              and you have more options than most vets explain.
            </p>
          </div>

          <Card tone="primary">
            <CardEyebrow>The thing to know first</CardEyebrow>
            <CardTitle>Your grief is the size of the relationship, not the size of the species.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                A 14-year relationship with a dog who slept next to
                you, went on every walk, was the first face you saw
                every morning &mdash; that&rsquo;s a substantial bond,
                regardless of what species the other party was. Many
                people grieve pets more intensely than distant human
                relatives. The day-to-day relationship was deeper.
              </p>
              <p>
                If a coworker says &ldquo;it&rsquo;s just a cat,&rdquo;
                they&rsquo;re telling you about themselves, not about
                you. The grief you&rsquo;re feeling is documented in
                veterinary-bereavement research and recognized by
                every major grief organization. It doesn&rsquo;t
                need anyone&rsquo;s permission to be real.
              </p>
            </div>
          </Card>

          {/* The euthanasia decision */}
          <Card>
            <CardEyebrow>The euthanasia decision</CardEyebrow>
            <CardTitle>How to know when it’s time.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                For most pet deaths, you&rsquo;re asked to make the
                choice that human deaths rarely demand: whether and
                when to end the life. There is no &ldquo;right&rdquo;
                moment, and the people who tell you there is have
                probably not actually been in your position.
              </p>
              <p>
                Veterinarians commonly use one of two frameworks to
                think about quality of life:
              </p>
              <p>
                <strong className="text-ink">The HHHHHMM scale</strong>{" "}
                (Dr. Alice Villalobos) &mdash; score each of seven
                factors from 0&ndash;10:
              </p>
              <ul className="space-y-1 list-disc pl-5">
                <li>
                  <strong className="text-ink">H</strong>urt &mdash;
                  is pain managed?
                </li>
                <li>
                  <strong className="text-ink">H</strong>unger &mdash;
                  eating enough?
                </li>
                <li>
                  <strong className="text-ink">H</strong>ydration
                  &mdash; drinking enough?
                </li>
                <li>
                  <strong className="text-ink">H</strong>ygiene
                  &mdash; clean, no pressure sores?
                </li>
                <li>
                  <strong className="text-ink">H</strong>appiness
                  &mdash; still expressing joy?
                </li>
                <li>
                  <strong className="text-ink">M</strong>obility &mdash;
                  able to stand, walk to outside or litter?
                </li>
                <li>
                  <strong className="text-ink">M</strong>ore good days
                  than bad &mdash; honestly, week by week?
                </li>
              </ul>
              <p>
                A total above 35 generally indicates acceptable
                quality of life. Below 35, the conversation about
                end-of-life options is reasonable to have.
              </p>
              <p>
                <strong className="text-ink">The five-things test</strong>{" "}
                &mdash; simpler. List five things your pet loves most
                (a specific walk, a specific food, the family member
                they greet, a favorite spot). When they no longer
                respond to 3 or more, it&rsquo;s a sign the life
                they had is mostly gone. This is not a clinical scale;
                it&rsquo;s how many veterinary behaviorists actually
                talk to families.
              </p>
              <p>
                Neither framework removes the difficulty of the
                decision. What they do is name what you&rsquo;re
                actually trying to measure: not whether your pet is
                alive, but whether the life is still recognizable as
                theirs.
              </p>
            </div>
          </Card>

          {/* The guilt */}
          <Card tone="warn">
            <CardEyebrow>The guilt specific to euthanasia</CardEyebrow>
            <CardTitle>You will second-guess. That’s common.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Almost every pet owner who has chosen euthanasia
                reports some version of the same regret loop: <em>was
                it too soon? was it too late? should I have tried
                one more thing?</em> This loop is so universal that
                pet-bereavement counselors consider it a near-default
                part of pet grief.
              </p>
              <p>
                A few honest framings that help:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Most veterinarians, asked privately, say families wait too long, not too soon.</strong>{" "}
                  Sparing your pet a bad final week is something
                  almost no one regrets at year three. Watching a
                  pet decline for an extra month is more commonly
                  regretted.
                </li>
                <li>
                  <strong className="text-ink">You can&rsquo;t actually know.</strong>{" "}
                  No one knows whether the right day was Tuesday or
                  Saturday. The choice is between two unknowable
                  alternatives. That uncertainty is not a moral
                  failure.
                </li>
                <li>
                  <strong className="text-ink">The relationship is the larger thing.</strong>{" "}
                  Twelve years of love is not undone by one decision
                  at the end. The decision is the smallest part of
                  the relationship by a wide margin.
                </li>
              </ul>
              <p>
                If the guilt is persistent past 8&ndash;12 weeks and
                interfering with daily life, a pet-loss-specific
                grief counselor can help. Resources at the bottom of
                the page.
              </p>
            </div>
          </Card>

          {/* In-home euthanasia */}
          <Card>
            <CardEyebrow>In-home euthanasia</CardEyebrow>
            <CardTitle>An option most vets don’t mention.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most pets are euthanized at the veterinary clinic. A
                growing alternative is in-home euthanasia &mdash; a
                veterinarian comes to your house, the procedure
                happens in your pet&rsquo;s familiar bed or favorite
                spot, surrounded by the people they knew. Most
                families who have done both describe in-home as
                meaningfully easier on the pet and on the humans.
              </p>
              <p>
                <strong className="text-ink">Typical cost in 2026:</strong>{" "}
                $300&ndash;$700 for the visit and procedure,
                $150&ndash;$350 for private cremation arranged
                through the same service. Total $450&ndash;$1,000.
                Often more than a clinic visit ($150&ndash;$400)
                but the difference buys you a different experience.
              </p>
              <p>
                <strong className="text-ink">National network:</strong>{" "}
                <a
                  href="https://www.lapoflove.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-deep underline"
                >
                  Lap of Love
                </a>{" "}
                operates in most US metros and is the largest
                end-of-life vet service. Search for &ldquo;[your
                city] in-home euthanasia&rdquo; for local
                alternatives &mdash; many independent vets offer
                this as well.
              </p>
              <p>
                <strong className="text-ink">What the visit looks like:</strong>{" "}
                vet arrives with two injections. The first is a
                sedative &mdash; your pet falls asleep within
                5&ndash;10 minutes, deep and peaceful. The second
                stops the heart. The whole visit is usually 45&ndash;90
                minutes; the procedure itself is 15&ndash;20. You can
                hold them throughout. You can be in any room you
                want. The vet handles cremation arrangements if you
                want; otherwise you can keep the body for burial.
              </p>
            </div>
          </Card>

          {/* After death */}
          <Card>
            <CardEyebrow>After death — disposition options</CardEyebrow>
            <CardTitle>Five paths, by cost and meaning.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Communal cremation</strong>{" "}
                  &mdash; multiple pets cremated together, ashes
                  scattered by the crematory at a memorial garden.
                  $50&ndash;$150. No ashes returned. The most
                  common option for clinic euthanasias.
                </li>
                <li>
                  <strong className="text-ink">Private cremation</strong>{" "}
                  &mdash; your pet cremated alone, ashes returned to
                  you in a basic container or urn. $150&ndash;$400.
                  Standard for families who want the ashes.
                </li>
                <li>
                  <strong className="text-ink">Home burial</strong>{" "}
                  &mdash; legal in most jurisdictions for small to
                  medium pets, on your own property. Some
                  municipalities require a minimum depth (typically
                  3 feet) and prohibit burial in apartment complexes
                  or rental properties. Check local rules. Cost: $0
                  plus a meaningful afternoon.
                </li>
                <li>
                  <strong className="text-ink">Pet cemetery burial</strong>{" "}
                  &mdash; like human cemetery burial but for animals.
                  $500&ndash;$2,500 depending on plot size, marker,
                  perpetual care. The International Association of
                  Pet Cemeteries &amp; Crematories (IAOPCC) maintains
                  a directory.
                </li>
                <li>
                  <strong className="text-ink">Aquamation (alkaline hydrolysis)</strong>{" "}
                  &mdash; same result as flame cremation, less energy,
                  no emissions. Available at many newer pet crematories.
                  Slightly more expensive than flame cremation
                  ($200&ndash;$500); ashes are typically lighter in
                  color.
                </li>
              </ol>
              <p>
                <strong className="text-ink">Memorial keepsakes:</strong>{" "}
                cremation gardens, paw-print impressions in clay or
                metal, fur clippings preserved in lockets, pendants
                with a small amount of ashes, custom portraits.
                Vary widely in cost and meaning. None of these are
                required and skipping them does not mean you loved
                your pet less.
              </p>
            </div>
          </Card>

          {/* Other pets grieve */}
          <Card>
            <CardEyebrow>The other pets in the house</CardEyebrow>
            <CardTitle>They notice. They grieve too.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Surviving pets &mdash; dogs especially, but also
                cats and bonded pairs of small animals &mdash;
                routinely show grief behaviors after the loss of an
                animal housemate: reduced appetite, lethargy,
                searching the house for the missing pet, sleeping in
                unusual places, increased clinginess to humans,
                changes in vocalization.
              </p>
              <p>
                <strong className="text-ink">What helps:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  If possible, let surviving pets see and smell the
                  body of the one who died (vets call this
                  &ldquo;closure viewing&rdquo;). Animals seem to
                  understand absence better than disappearance.
                </li>
                <li>
                  Keep their routine consistent. Same walk times,
                  same feeding times, same beds. Routine is
                  comforting.
                </li>
                <li>
                  Don&rsquo;t rush into adopting a replacement. Most
                  veterinary behaviorists suggest 3&ndash;6 months
                  of stability for the surviving pet before
                  introducing a new animal, unless the surviving
                  pet is clearly suffering from being alone.
                </li>
                <li>
                  Watch for behaviors that persist past 6&ndash;8
                  weeks &mdash; loss of appetite, severe lethargy,
                  weight loss. A vet check is reasonable; sometimes
                  what looks like grief is also a medical issue.
                </li>
              </ul>
            </div>
          </Card>

          {/* Telling kids */}
          <Card>
            <CardEyebrow>If there are children in the house</CardEyebrow>
            <CardTitle>This is often a child’s first experience with death.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                For many children, a pet&rsquo;s death is the first
                time they encounter death directly. It&rsquo;s a
                significant emotional event, and how the adults
                handle it shapes their relationship with grief for
                years.
              </p>
              <p>
                The general rules from{" "}
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  our talking-to-kids guide
                </Link>{" "}
                apply directly:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Use the word <em>died</em>. Not &ldquo;put to
                  sleep&rdquo; (causes sleep anxiety), not
                  &ldquo;went to a farm&rdquo; (causes later
                  confusion and broken trust when discovered).
                </li>
                <li>
                  Honest age-appropriate explanation. For younger
                  kids: &ldquo;Buddy&rsquo;s body got too sick to
                  keep working, and so the vet helped him die
                  peacefully. He won&rsquo;t come back.&rdquo;
                </li>
                <li>
                  Let them be present at the goodbye if they want
                  and are old enough (generally 6+). In-home
                  euthanasia is particularly child-appropriate &mdash;
                  the home setting makes the moment feel less
                  clinical.
                </li>
                <li>
                  Let them help with disposition decisions in
                  age-appropriate ways: pick the burial spot, draw
                  pictures to bury with the body, write a goodbye
                  letter. Participation makes grief easier.
                </li>
                <li>
                  Don&rsquo;t rush to a replacement pet. Children
                  often interpret quick replacement as &ldquo;the
                  one they had didn&rsquo;t matter.&rdquo;
                </li>
              </ul>
            </div>
          </Card>

          {/* Bereavement leave / work */}
          <Card>
            <CardEyebrow>Taking time off</CardEyebrow>
            <CardTitle>Most employers don’t formally allow it. Ask anyway.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Almost no US employer formally offers bereavement
                leave for pet loss. In practice, many managers
                will grant a day or two of PTO or even
                informal bereavement leave if you ask honestly:
                &ldquo;My dog died yesterday. I&rsquo;m going to be
                useless tomorrow. Can I take a personal day?&rdquo;
                Most reasonable managers say yes; a few
                employers have started formally including pet loss
                in bereavement policies.
              </p>
              <p>
                If your workplace is hostile to the request, you
                are not obligated to share the reason. &ldquo;Personal
                day, family situation&rdquo; is sufficient. The grief
                is real; protecting yourself from people who would
                minimize it is not weakness.
              </p>
            </div>
          </Card>

          {/* Resources */}
          <Card tone="primary">
            <CardEyebrow>Resources</CardEyebrow>
            <CardTitle>Six things worth knowing about.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-3 list-decimal pl-5">
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
                  . Online chat support, certified pet-loss
                  counselor directory, free 24/7 helpline. The
                  national authority on pet bereavement.
                </li>
                <li>
                  <strong className="text-ink">Lap of Love grief support</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://www.lapoflove.com/Resources/Pet-Loss-Support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    lapoflove.com/Resources/Pet-Loss-Support
                  </a>
                  . Free monthly online support groups, articles,
                  and grief counseling referrals. Available to
                  anyone, not just their euthanasia clients.
                </li>
                <li>
                  <strong className="text-ink">Veterinary school hotlines</strong>{" "}
                  &mdash; several major veterinary schools run free
                  pet-loss support phone lines: Cornell, UC Davis,
                  Tufts, Washington State, Michigan State,
                  University of Illinois. Search &ldquo;[your state]
                  veterinary school pet loss hotline&rdquo;
                  for the closest. Staffed by trained veterinary
                  social-work students; free.
                </li>
                <li>
                  <strong className="text-ink">Books that grief counselors recommend:</strong>{" "}
                  &ldquo;The Loss of a Pet&rdquo; by Wallace
                  Sife (foundational text), &ldquo;Goodbye, Friend&rdquo;
                  by Gary Kowalski, &ldquo;Saying Goodbye to the
                  Pet You Love&rdquo; by Lorri Greene. For children:
                  &ldquo;Dog Heaven&rdquo; or &ldquo;Cat Heaven&rdquo;
                  by Cynthia Rylant, &ldquo;The Tenth Good Thing
                  About Barney&rdquo; by Judith Viorst.
                </li>
                <li>
                  <strong className="text-ink">In-home euthanasia search:</strong>{" "}
                  <a
                    href="https://www.lapoflove.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    lapoflove.com
                  </a>{" "}
                  or your local search engine plus &ldquo;mobile
                  veterinarian&rdquo; or &ldquo;in-home
                  euthanasia.&rdquo;
                </li>
                <li>
                  <strong className="text-ink">Pet cemetery / crematory directory:</strong>{" "}
                  the International Association of Pet Cemeteries
                  &amp; Crematories at{" "}
                  <a
                    href="https://www.iaopc.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    iaopc.com
                  </a>
                  . Member directory with state-by-state listings.
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
                Pet loss grief follows the same general arc as other
                grief. Get professional help if:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Functioning is severely impaired past 6&ndash;8
                  weeks.
                </li>
                <li>
                  Sleep is severely disrupted past 6&ndash;8 weeks.
                </li>
                <li>
                  You are having persistent thoughts of self-harm
                  or wanting to die &mdash; same-day call to 988.
                </li>
                <li>
                  The guilt about the euthanasia decision is
                  obsessive and not lessening over months.
                </li>
                <li>
                  You are avoiding any reminder of your pet, including
                  family members or rooms in your house, in ways
                  that interfere with daily life.
                </li>
              </ul>
              <p>
                A grief counselor who specifically works with pet
                loss is worth the cost. APLB&rsquo;s counselor
                directory is the most reliable place to find one.
                In a crisis, call or text{" "}
                <strong className="text-ink">988</strong> &mdash;
                yes, this is the kind of thing they handle.
              </p>
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
                &mdash; the general framework; everything in it
                applies to pet loss too.
              </li>
              <li>
                <Link
                  href="/disenfranchised-grief"
                  className="text-primary-deep underline"
                >
                  When the world doesn&rsquo;t recognize your loss
                </Link>{" "}
                &mdash; pet loss is one of several covered;
                this page is the dedicated deep version.
              </li>
              <li>
                <Link
                  href="/talking-to-kids"
                  className="text-primary-deep underline"
                >
                  Talking to children about death
                </Link>{" "}
                &mdash; written for human deaths, but the principles
                apply to pets (and often, this is the first time).
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information, not medical
            or veterinary advice. Specific decisions about end-of-life
            care for your pet go through your veterinarian or a
            certified veterinary specialist. The organizations and
            books mentioned are based on wide use in pet-bereavement
            literature; mention is not endorsement of any specific
            therapeutic approach. In a mental-health crisis, call
            or text 988.
          </p>

          <EmailCapture
            source="pet-loss"
            title="Save this."
            subtitle="The grief lasts longer than the rituals around it. We'll email this guide so it's there in the weeks ahead."
            buttonLabel="Email me this guide"
            successMessage="It's in your inbox. We're sorry for your loss."
          />

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
