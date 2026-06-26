import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";
import { ogImage } from "@/lib/og";
import { ArticleSchema } from "@/components/seo/ArticleSchema";

export const metadata: Metadata = {
  title: "How the funeral industry actually makes money — and how the sales floor pushes you",
  description:
    "The specific scripts, room layouts, and psychological framing that move families from a $3,000 cremation to a $12,000 funeral. Sourced from the FTC Funeral Rule, Reuters' multi-year investigation, and Funeral Consumers Alliance reports.",
  openGraph: { images: [ogImage("How the funeral industry's sales floor works", "Advocacy")] },
};

/**
 * /funeral-home-tactics — public, indexable. The deeper companion to
 * /rights. /rights says "here's what you can decline." This page says
 * "here's why and how the industry is structured to make you NOT
 * decline." Moat content. The honest critique no competitor can fake.
 *
 * Sources cited generally (FTC Funeral Rule, Reuters body-broker
 * series, Funeral Consumers Alliance, AARP). Speaks about "the
 * industry" and "many homes" — not specific named homes — to avoid
 * defamation risk. Acknowledges that honest funeral homes exist.
 */
export default function FuneralHomeTacticsPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <ArticleSchema
        slug="funeral-home-tactics"
        title="How the funeral industry's sales floor works"
        description="Specific scripts, room layouts, and pricing psychology. The Selection Room, the 'Protective' word, the three-tier package trick, the 'your loved one deserves' frame. Red flags vs green flags. Where to file complaints."
        eyebrow="Advocacy"
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>How the sales floor actually works</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The funeral industry’s playbook, in plain English.
            </h1>
            <p className="text-lg text-ink-soft">
              The funeral industry has a 150-year head start designing
              how arrangement meetings work, what the selection room
              looks like, and which words are on the price list. None
              of it is accidental. This page walks through the
              specific tactics so you can recognize them when
              they&rsquo;re used.
            </p>
            <p className="text-lg text-ink-soft mt-3">
              There are honest funeral homes &mdash; many of them
              independent, family-run, neighborhood operations. The
              tactics below are most aggressive at large chain
              homes, where corporate ownership has installed sales
              processes designed at the headquarters level. The
              pattern is documented in FTC Funeral Rule enforcement
              actions, in a multi-year Reuters investigation
              (2017&ndash;2018), and in the Funeral Consumers
              Alliance&rsquo;s state-by-state reports.
            </p>
          </div>

          {/* Ownership */}
          <Card>
            <CardEyebrow>Who owns the funeral home you’re sitting in</CardEyebrow>
            <CardTitle>Three corporations own a meaningful slice.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                About 80% of US funeral homes are independently owned,
                often by the same family for generations. The other
                20% are owned by one of three publicly-traded
                corporations or a handful of private-equity firms.
                The largest is SCI (Service Corporation
                International), which operates more than 1,500
                funeral homes and 400 cemeteries under hundreds of
                local brand names. Most consumers have no idea their
                neighborhood funeral home is a Fortune 500 outlet.
              </p>
              <p>
                The chain-owned home almost always looks exactly like
                an independent. Same lobby. Same staff. Same family
                name on the door &mdash; SCI typically keeps the
                acquired home&rsquo;s original name for decades. The
                differences are upstream: pricing models, sales
                training, casket-supplier exclusivity agreements,
                and per-arrangement profit targets set at corporate.
              </p>
              <p>
                <strong className="text-ink">How to check ownership:</strong>{" "}
                most state funeral-board websites list the licensed
                owner of every funeral home. Google
                &ldquo;[your state] funeral board license search.&rdquo;
                You can also check business filings on the state
                Secretary of State website. If the home is owned by
                a corporate LLC tracing back to Houston, Texas
                (SCI&rsquo;s headquarters), you&rsquo;re at a chain.
              </p>
              <p>
                This isn&rsquo;t inherently good or bad &mdash; chain
                homes can be perfectly honest, and independents can
                be predatory. But knowing matters when you&rsquo;re
                negotiating, because chain homes have less local
                flexibility on pricing.
              </p>
            </div>
          </Card>

          {/* The basic profit model */}
          <Card>
            <CardEyebrow>The profit model</CardEyebrow>
            <CardTitle>Margins by category.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Funeral home margins vary widely. Industry surveys
                and shareholder reports from publicly-traded chains
                indicate:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Caskets:</strong>{" "}
                  typical markup of 200&ndash;500% above wholesale.
                  A $1,200 casket retails for $4,000&ndash;$8,000.
                  Highest-margin line item in most arrangements.
                </li>
                <li>
                  <strong className="text-ink">Vaults / outer burial containers:</strong>{" "}
                  similar 200&ndash;400% markups. &ldquo;Protective&rdquo;
                  upgrades carry the highest per-unit margin.
                </li>
                <li>
                  <strong className="text-ink">Embalming and preparation:</strong>{" "}
                  typically 70&ndash;85% margin on the labor.
                </li>
                <li>
                  <strong className="text-ink">Basic services fee:</strong>{" "}
                  the &ldquo;non-declinable&rdquo; fee covers
                  overhead and is set to cover the home&rsquo;s
                  break-even on the case. Margin here depends on
                  efficiency, not markup.
                </li>
                <li>
                  <strong className="text-ink">Cash-advance items</strong>{" "}
                  (death certificates, obituary placement,
                  flowers): 10&ndash;30% markup is typical, despite
                  FTC Rule disclosure requirements.
                </li>
                <li>
                  <strong className="text-ink">Direct cremation:</strong>{" "}
                  typically the lowest-margin offering. Many
                  full-service homes quote it high specifically to
                  push families toward higher-margin packages.
                </li>
                <li>
                  <strong className="text-ink">Pre-need contracts:</strong>{" "}
                  significant cash advantage from interest-free use
                  of family funds for years before services are
                  rendered. Margins on services delivered later are
                  similar to at-need.
                </li>
              </ul>
              <p>
                The implication: every minute of the arrangement
                meeting that pushes you toward a casket upgrade,
                a vault upgrade, or a service add-on is the highest-
                value minute for the funeral home. The basic-services
                fee is fixed; the rest is where the meeting is
                aimed.
              </p>
            </div>
          </Card>

          {/* The Selection Room */}
          <Card>
            <CardEyebrow>The Selection Room</CardEyebrow>
            <CardTitle>Designed, not arranged.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The room where caskets are displayed is the
                single most engineered surface in the funeral home.
                Industry consulting firms charge $5,000&ndash;$30,000
                to redesign a selection room for maximum margin per
                customer. Specific techniques in use at most chain
                homes (and many independents):
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">The decoy casket.</strong>{" "}
                  An ugly low-priced casket is included specifically
                  to be rejected. Most families won&rsquo;t pick the
                  cheapest if it looks like a pine box; they trade up
                  to the second- or third-cheapest, which is where
                  the margin is set.
                </li>
                <li>
                  <strong className="text-ink">The price ladder.</strong>{" "}
                  Caskets are displayed in a sequence designed to
                  anchor your sense of &ldquo;normal.&rdquo; A
                  $10,000 mahogany casket prominently displayed makes
                  the $4,500 oak feel reasonable, even if you walked
                  in expecting to spend $2,000.
                </li>
                <li>
                  <strong className="text-ink">Lighting and music.</strong>{" "}
                  Warm lighting, soft music, beige walls. The room is
                  designed to feel like a luxury furniture showroom,
                  not a transactional space. The decisions feel
                  bigger because the room feels significant.
                </li>
                <li>
                  <strong className="text-ink">The salesperson&rsquo;s position.</strong>{" "}
                  Staff are trained to walk you toward higher-priced
                  options first and let you &ldquo;come back down&rdquo;
                  to a lower one &mdash; rather than starting with the
                  cheaper and trading up. The &ldquo;coming down&rdquo;
                  feels like you&rsquo;re being thrifty even when
                  you&rsquo;re still spending more than you intended.
                </li>
                <li>
                  <strong className="text-ink">The hidden lowest-priced casket.</strong>{" "}
                  FTC Funeral Rule requires homes to display or
                  describe the lowest-priced casket. Many homes
                  technically comply by listing it on the price list
                  but not putting it in the room. If you ask to see
                  it, they have to produce it &mdash; often
                  reluctantly.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Defense:</strong> ask
                directly for the price list before walking into the
                selection room. Read it. Pick your maximum casket
                price on paper. Walk in knowing that number. Refuse
                to be walked through the room in a particular order
                &mdash; ask to see the price list in their hands and
                point at the row you want.
              </p>
            </div>
          </Card>

          {/* The "Protective" word */}
          <Card tone="warn">
            <CardEyebrow>The “Protective” word</CardEyebrow>
            <CardTitle>One of the most carefully chosen words in the industry.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Sealed caskets &mdash; typically metal with a rubber
                gasket &mdash; are marketed as &ldquo;protective.&rdquo;
                Sealed vaults are marketed similarly. The word
                implies that the contents are preserved or shielded
                from the ground. Both implications are false.
              </p>
              <p>
                The FTC Funeral Rule explicitly prohibits funeral
                homes from claiming that any casket or vault
                preserves remains. There is no consumer-protective
                or scientific evidence that sealing meaningfully
                extends preservation. In sealed containers, the
                lack of oxygen can actually accelerate anaerobic
                decomposition, often producing a worse outcome than
                a non-sealed casket.
              </p>
              <p>
                <strong className="text-ink">Why the word survives:</strong>{" "}
                the FTC rule prohibits saying the casket &ldquo;preserves&rdquo;
                remains. It does not prohibit calling the casket
                &ldquo;protective.&rdquo; The industry settled on the
                word in the 1980s specifically because it implies
                preservation without making the prohibited claim.
                Salespeople are trained to use the word and not
                explain what it does.
              </p>
              <p>
                <strong className="text-ink">Defense:</strong> when
                the salesperson uses the word &ldquo;protective,&rdquo;
                ask: <em>&ldquo;Protective from what, specifically?
                Can you tell me in writing what this casket does that
                a standard casket doesn&rsquo;t?&rdquo;</em>{" "}
                The answer is generally a non-answer about
                &ldquo;gasketed seal&rdquo; with no functional
                consequence. Many salespeople will pivot to another
                feature rather than answer directly.
              </p>
            </div>
          </Card>

          {/* Packages vs à la carte */}
          <Card>
            <CardEyebrow>Packages vs à la carte</CardEyebrow>
            <CardTitle>The “three tiers” trick.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Most funeral homes present three package tiers:
                Basic, Standard, and Premium. The middle tier is
                priced to be the &ldquo;default&rdquo; choice &mdash;
                the Basic looks austere, the Premium feels excessive,
                and Standard feels like the responsible middle.
                Pricing is structured to make Standard the largest
                share of arrangements. This is a well-documented
                psychological pattern (the &ldquo;decoy effect&rdquo;
                or &ldquo;asymmetric dominance&rdquo;) used across
                industries; the funeral industry has used it
                explicitly since the 1980s.
              </p>
              <p>
                <strong className="text-ink">What the packages obscure:</strong>{" "}
                you are not required to pick a package. Federal law
                requires the funeral home to give you an itemized
                price list (GPL) and allow you to build your own
                combination from it. The only non-declinable item is
                the basic services fee. Everything else &mdash; the
                viewing, the casket, the visitation, the staff time
                for the service &mdash; can be picked individually,
                often saving 30&ndash;50% versus the equivalent
                package.
              </p>
              <p>
                <strong className="text-ink">Defense:</strong> ask
                for the itemized GPL up front. Build your own
                combination from it. If the salesperson pushes the
                package framework, say: <em>&ldquo;Federal law
                requires you to let me pick line items individually.
                I&rsquo;d like to do that.&rdquo;</em>{" "}
                That sentence ends the package conversation, every
                time.
              </p>
            </div>
          </Card>

          {/* The "your loved one deserves" frame */}
          <Card tone="warn">
            <CardEyebrow>The “your loved one deserves” frame</CardEyebrow>
            <CardTitle>The most effective sales tactic in any industry.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The most psychologically loaded part of the
                arrangement meeting is the moment when a salesperson
                says some version of: <em>&ldquo;You want what&rsquo;s
                best for them, right? She deserves to be remembered
                this way.&rdquo;</em>{" "}
                Or: <em>&ldquo;You only get one chance to do this
                right.&rdquo;</em>
              </p>
              <p>
                Families are uniquely vulnerable in this moment.
                Saying no to the upgrade can feel like saying no to
                love. The whole arrangement meeting is structured to
                make that connection &mdash; love expressed as
                spending. Many salespeople aren&rsquo;t consciously
                cynical about it; they&rsquo;ve been trained that
                the upgrade is &ldquo;giving the family what they
                really want.&rdquo;
              </p>
              <p>
                <strong className="text-ink">Three responses that work:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <em>&ldquo;She would have wanted us to keep it
                  simple.&rdquo;</em> Hard to argue with. Most
                  salespeople back off immediately.
                </li>
                <li>
                  <em>&ldquo;The way I remember her is between us.
                  This decision is about the box.&rdquo;</em>{" "}
                  Reframes the upsell from love to function.
                </li>
                <li>
                  <em>&ldquo;If I had unlimited money I&rsquo;d still
                  buy this one. That&rsquo;s the decision.&rdquo;</em>{" "}
                  Acknowledges the love and closes the conversation.
                </li>
              </ul>
              <p>
                If you find yourself crying and being pushed,
                say: <em>&ldquo;I need to step out and call my
                family. I&rsquo;ll come back in 30 minutes.&rdquo;</em>{" "}
                Then leave the room. Funeral homes are required to
                let you take a break. Most upsell pressure
                evaporates on the second meeting.
              </p>
            </div>
          </Card>

          {/* Pre-need */}
          <Card>
            <CardEyebrow>The pre-need conversation</CardEyebrow>
            <CardTitle>A long con dressed as responsibility.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Pre-need contracts (paying for your own funeral in
                advance) are heavily marketed because they&rsquo;re
                a long-term cash advantage for the funeral home:
                the home gets the money now, services are delivered
                years later, and many contracts have terms that
                favor the home if anything changes.
              </p>
              <p>
                Common problems:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Funeral home closure or ownership change.</strong>{" "}
                  Pre-need contracts don&rsquo;t always transfer
                  cleanly to a new owner. Independent homes that go
                  out of business sometimes leave families with
                  partially-recoverable funds in state insurance
                  pools (varies by state).
                </li>
                <li>
                  <strong className="text-ink">Inflation lock-in fictions.</strong>{" "}
                  Pre-need is sold with the promise of locking in
                  today&rsquo;s prices. In practice, many contracts
                  have clauses that allow the home to charge extras
                  for changes in &ldquo;market conditions&rdquo; at
                  time of delivery. Read the contract carefully if
                  considering one.
                </li>
                <li>
                  <strong className="text-ink">Cancellation penalties.</strong>{" "}
                  Many pre-need contracts have steep cancellation
                  fees. The money is not as accessible as a savings
                  account.
                </li>
                <li>
                  <strong className="text-ink">Locked-in services that the family doesn&rsquo;t want.</strong>{" "}
                  You pre-buy a viewing and a casket. Your family
                  wants a memorial service after cremation. The
                  pre-need contract is paid; the family ends up
                  paying again for what they actually want.
                </li>
              </ul>
              <p>
                <strong className="text-ink">Better alternative:</strong>{" "}
                a savings account labeled &ldquo;funeral&rdquo; with
                $3,000&ndash;$8,000 in it, plus a one-page written
                statement of preferences. The family has flexibility
                and the money stays yours.{" "}
                <Link
                  href="/plan-ahead"
                  className="text-primary-deep underline"
                >
                  More in the pre-need planning guide.
                </Link>
              </p>
            </div>
          </Card>

          {/* Spotting an honest funeral home */}
          <Card tone="good">
            <CardEyebrow>How to recognize an honest funeral home</CardEyebrow>
            <CardTitle>Six green flags.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  <strong className="text-ink">They give you the General Price List in writing without making you ask twice.</strong>{" "}
                  Federal law requires this. Honest homes hand it
                  over before the conversation starts.
                </li>
                <li>
                  <strong className="text-ink">They quote direct cremation by phone clearly and without trying to upsell.</strong>{" "}
                  Required by federal law; reluctance is a warning
                  sign.
                </li>
                <li>
                  <strong className="text-ink">They never tell you something is &ldquo;required by law&rdquo; that isn&rsquo;t.</strong>{" "}
                  Embalming isn&rsquo;t. Vaults aren&rsquo;t.
                  Caskets through the home aren&rsquo;t. Honest
                  homes know the law and represent it accurately.
                </li>
                <li>
                  <strong className="text-ink">They show you the lowest-priced casket without sighing about it.</strong>{" "}
                  Or shipping a third-party casket. They treat the
                  modest choice the same as the expensive one.
                </li>
                <li>
                  <strong className="text-ink">They let you take a break.</strong>{" "}
                  They actively suggest it. They don&rsquo;t pressure
                  same-day decisions on every line item.
                </li>
                <li>
                  <strong className="text-ink">They will write down what they verbally promised.</strong>{" "}
                  A handshake on a price during the meeting that
                  doesn&rsquo;t make it to the final itemized
                  contract is a warning sign. Honest homes put
                  everything in writing.
                </li>
              </ol>
              <p>
                Most independent neighborhood funeral homes hit five
                or six of these. Many chains hit two or three. None
                of these are guarantees, but they&rsquo;re strong
                signals.
              </p>
            </div>
          </Card>

          {/* Spotting a predatory funeral home */}
          <Card tone="bad">
            <CardEyebrow>How to recognize a predatory funeral home</CardEyebrow>
            <CardTitle>Six red flags.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Refusal to quote direct cremation by phone.</strong>{" "}
                  Federal violation. Walk away.
                </li>
                <li>
                  <strong className="text-ink">Telling you embalming is &ldquo;required&rdquo; when it isn&rsquo;t.</strong>{" "}
                  Federal violation. Document it (write down what
                  they said and when) and consider reporting to the
                  FTC at{" "}
                  <a
                    href="https://reportfraud.ftc.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    reportfraud.ftc.gov
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-ink">Refusing to accept a third-party casket without a fee.</strong>{" "}
                  Federal violation. They cannot charge a handling
                  fee for a casket you bought elsewhere.
                </li>
                <li>
                  <strong className="text-ink">Pressuring same-day decisions.</strong>{" "}
                  &ldquo;We need to schedule the embalming today.&rdquo;
                  &ldquo;The cremation is booked for tomorrow,
                  you need to pay now.&rdquo; Nothing is that
                  urgent. Reputable homes will hold the body in
                  cooled storage for days at no charge while you
                  decide.
                </li>
                <li>
                  <strong className="text-ink">The bill doesn&rsquo;t match the verbal quotes.</strong>{" "}
                  Surprise line items, fees mentioned at the end,
                  upgrades you didn&rsquo;t agree to. Ask for a
                  line-by-line walkthrough comparing the original
                  GPL quote to the final bill.
                </li>
                <li>
                  <strong className="text-ink">Aggressive emotional framing throughout the meeting.</strong>{" "}
                  Repeated invocations of what the deceased
                  &ldquo;deserves.&rdquo; Implications that you
                  don&rsquo;t love them if you pick a lower option.
                  Tears used as leverage. None of this is the work
                  of a respectable funeral home.
                </li>
              </ol>
            </div>
          </Card>

          {/* Filing a complaint */}
          <Card>
            <CardEyebrow>If you’ve been wronged</CardEyebrow>
            <CardTitle>Where to file a complaint, in order.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Documented violations of the FTC Funeral Rule are
                routinely punished &mdash; the FTC has imposed fines
                on dozens of funeral homes in undercover audits over
                the past two decades, including major chains.
                Reporting matters even if the family doesn&rsquo;t
                get money back.
              </p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  <strong className="text-ink">Federal Trade Commission</strong>{" "}
                  &mdash; the primary FTC Funeral Rule enforcer.
                  Report at{" "}
                  <a
                    href="https://reportfraud.ftc.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    reportfraud.ftc.gov
                  </a>
                  . Include the home&rsquo;s name, what was said,
                  what you paid, and any written documentation.
                </li>
                <li>
                  <strong className="text-ink">Your state attorney general&rsquo;s consumer protection division.</strong>{" "}
                  State AGs have parallel authority and sometimes
                  faster enforcement.
                </li>
                <li>
                  <strong className="text-ink">Your state funeral board.</strong>{" "}
                  Most states have one. They license funeral
                  directors and can revoke or suspend licenses for
                  violations.
                </li>
                <li>
                  <strong className="text-ink">Better Business Bureau.</strong>{" "}
                  Less enforcement power but public-facing complaints
                  affect the home&rsquo;s rating.
                </li>
                <li>
                  <strong className="text-ink">Funeral Consumers Alliance</strong>{" "}
                  &mdash;{" "}
                  <a
                    href="https://funerals.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-deep underline"
                  >
                    funerals.org
                  </a>
                  . National consumer-advocacy nonprofit with local
                  chapters in most states. They can help document a
                  case and often provide free consultation.
                </li>
                <li>
                  <strong className="text-ink">Local news consumer-protection reporters.</strong>{" "}
                  Most local TV stations have a consumer-affairs
                  reporter. They love documented funeral-industry
                  stories. Public attention often produces refunds
                  faster than regulatory action does.
                </li>
              </ol>
            </div>
          </Card>

          {/* Why we built this */}
          <Card tone="primary">
            <CardEyebrow>Why we built this site</CardEyebrow>
            <CardTitle>Honest funeral homes exist. This site helps you find them.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                None of this is to say the funeral industry is
                uniformly bad. Many funeral homes are honest,
                family-run businesses doing meaningful work for
                their communities. They follow the FTC Rule, quote
                clearly, and treat families with respect.
              </p>
              <p>
                The problem is that families have no way of knowing
                in advance which home they&rsquo;ve walked into. The
                arrangement meeting happens during the worst week of
                a family&rsquo;s life, when comparing prices and
                checking laws is the last thing anyone can manage.
              </p>
              <p>
                That&rsquo;s why we built this. We contact funeral
                homes on your behalf, we collect their written
                price quotes, and we compare them against fair-price
                ranges for your zip code. You walk in with a number
                you trust. The pressure tactics on this page
                don&rsquo;t work as well on a family that came in
                prepared.
              </p>
              <p>
                We take no money from any funeral home. No
                commissions, no referral fees, no kickbacks. We keep
                families free and are funded by the institutions we
                partner with. That&rsquo;s why we can write the page you
                just read.
              </p>
            </div>
            <div className="mt-5">
              <LinkButton href="/" size="lg">
                See how we help families →
              </LinkButton>
            </div>
          </Card>

          {/* Related */}
          <Card>
            <CardEyebrow>Related guides</CardEyebrow>
            <ul className="space-y-2 list-disc pl-5 text-ink-soft mt-3">
              <li>
                <Link
                  href="/rights"
                  className="text-primary-deep underline"
                >
                  What you can decline
                </Link>{" "}
                &mdash; the nine specific line items most families
                don&rsquo;t know they can refuse.
              </li>
              <li>
                <Link
                  href="/prices"
                  className="text-primary-deep underline"
                >
                  Fair prices in your zip
                </Link>{" "}
                &mdash; what funeral services should actually cost,
                by line item, in your area.
              </li>
              <li>
                <Link
                  href="/glossary"
                  className="text-primary-deep underline"
                >
                  Glossary
                </Link>{" "}
                &mdash; the industry&rsquo;s vocabulary, translated.
              </li>
              <li>
                <Link
                  href="/plan-ahead"
                  className="text-primary-deep underline"
                >
                  Pre-need planning playbook
                </Link>{" "}
                &mdash; the four-pillar weekend project; covers the
                better alternative to pre-need contracts.
              </li>
            </ul>
          </Card>

          <p className="text-xs text-ink-muted">
            This page is general consumer information based on
            publicly-documented practices in the US funeral industry.
            Sources include FTC Funeral Rule enforcement actions
            (1984&ndash;present), the Reuters body-brokers
            investigation (2017&ndash;2018), Funeral Consumers
            Alliance state-by-state reports, and AARP consumer
            research. The tactics described are common patterns
            documented across the industry; they are not claims
            about any specific funeral home. Many honest funeral
            homes operate without using any of them.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
