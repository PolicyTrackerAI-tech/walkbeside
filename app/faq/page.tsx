import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { LinkButton } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { HashOpenDetails } from "@/components/ui/HashOpenDetails";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const metadata: Metadata = {
  title: "Questions families ask — Honest Funeral FAQ",
  description:
    "Straight answers about how Honest Funeral works, how we make money, whether we're affiliated with funeral homes, and what the $249 fee covers.",
};

export const FAQ: { q: string; plain: string; a: React.ReactNode }[] = [
  {
    q: "What does Honest Funeral actually do?",
    plain:
      "We help families who've just lost someone make better funeral decisions under pressure. Three things: a free fair-price lookup that shows what funeral services should cost in your zip code; a $19 prep kit of questions to ask and upsells to decline; and advocate outreach — we contact funeral homes on your behalf as your named advocate and collect comparison quotes, for a flat $249 only if you pick a home we presented.",
    a: (
      <>
        <p>
          We help families who&rsquo;ve just lost someone make better funeral
          decisions under pressure. Three things, specifically:
        </p>
        <ul>
          <li>
            <strong>Fair price lookup</strong> (free) &mdash; see what funeral
            services should cost in your zip code, by line item, so you can
            rate any home&rsquo;s quote against local data.
          </li>
          <li>
            <strong>Prep kit</strong> ($19) &mdash; the questions to ask, the
            upsells to decline, and the rights families don&rsquo;t know they
            have.
          </li>
          <li>
            <strong>Advocate outreach</strong> ($249 flat, only on success)
            &mdash; we contact funeral homes on your behalf, as your named
            advocate, and collect comparison quotes. You make the final call.
          </li>
        </ul>
        <p>
          We&rsquo;re not a funeral home. We don&rsquo;t take possession of
          anyone. We don&rsquo;t sell caskets or urns. We help you{" "}
          <em>compare</em>.
        </p>
      </>
    ),
  },
  {
    q: "How do you make money?",
    plain:
      "We charge a flat $249 when a family chooses a funeral home we presented to them. That's it. No commissions from funeral homes. No referral fees for insurance or financing unless we disclose it on the same screen where the referral appears. If you never use advocate outreach, or you choose a home we didn't present, you pay nothing. The $19 prep kit is the only other thing we sell.",
    a: (
      <>
        <p>
          We charge a flat <strong>$249</strong> when a family chooses a
          funeral home we presented to them. That&rsquo;s it.
        </p>
        <ul>
          <li>No commissions from funeral homes.</li>
          <li>
            No referral fees for insurance or financing unless we disclose it
            on the same screen where the referral appears.
          </li>
          <li>
            If you never use advocate outreach, or you choose a home we
            didn&rsquo;t present, you pay nothing.
          </li>
        </ul>
        <p>
          The $19 prep kit is the only other thing we sell. Everything else
          &mdash; fair-price lookup, 72-hour guidance, obituary helper
          &mdash; is free.
        </p>
      </>
    ),
  },
  {
    q: "Are you affiliated with any funeral homes?",
    plain:
      "No. Honest Funeral is a consumer advocate, not a directory or a broker. We don't take commissions or kickbacks from funeral homes. We were built by a licensed funeral director and her brother, a software engineer — the incentives point at the family, not the home.",
    a: (
      <>
        <p>
          No. Honest Funeral is a consumer advocate, not a directory or a broker.
          We don&rsquo;t take commissions or kickbacks from funeral homes.
        </p>
        <p>
          We were built by a licensed funeral director who spent years
          watching families overpay &mdash; and her brother, a software
          engineer. The whole point of this site is that the incentives point
          at the family, not the home.
        </p>
      </>
    ),
  },
  {
    q: "What if I\u2019ve already picked a funeral home?",
    plain:
      "You can still use the fair-price lookup (free) to rate the quote they gave you against local data. If the quote is within the fair range for your zip, you're done. If it's above the range, you can go back and ask about lower-priced packages, ask the home to match a comparable quote, or let us reach out to 3–5 other homes for comparison quotes before you sign.",
    a: (
      <>
        <p>
          You can still use the fair-price lookup (free) to rate the quote
          they gave you against local data. If the quote is within the fair
          range for your zip, you&rsquo;re done &mdash; we don&rsquo;t need
          to do anything else.
        </p>
        <p>
          If it&rsquo;s above the range, you have options: go back and ask
          about lower-priced packages, ask the home to match a comparable
          quote, or let us reach out to 3&ndash;5 other homes for comparison
          quotes before you sign.
        </p>
      </>
    ),
  },
  {
    q: "Does the $249 apply to cremation-only arrangements?",
    plain:
      "Yes — the flat $249 covers advocate outreach regardless of whether the family chooses burial, cremation, direct cremation, or a hybrid service. We charge it once, per family, only when you pick a home we presented. Direct cremation is where families often overpay the most; comparison quotes typically save $1,500–$3,000 on direct cremation alone.",
    a: (
      <>
        <p>
          Yes &mdash; the flat $249 covers advocate outreach regardless of
          whether the family chooses burial, cremation, direct cremation, or
          a hybrid service. We charge it once, per family, only when you pick
          a home we presented.
        </p>
        <p>
          Direct cremation in particular is where families often overpay the
          most, because traditional homes quote it as if it were a full
          service. Comparison quotes typically save $1,500&ndash;$3,000 on
          direct cremation alone.
        </p>
      </>
    ),
  },
  {
    q: "What if you don\u2019t have price data for my area?",
    plain:
      "Our fair-price lookup works for most US zip codes. If we don't have enough local data to show a range, we'll say so plainly on the results page — we won't make up numbers. Advocate outreach still works in any zip with at least a few funeral homes: we send the request, homes respond under the FTC Funeral Rule, and you see whatever comes back.",
    a: (
      <>
        <p>
          Our fair-price lookup works for most US zip codes. If we
          don&rsquo;t have enough local data to show a range, we&rsquo;ll
          say so plainly on the results page &mdash; we won&rsquo;t make up
          numbers.
        </p>
        <p>
          Advocate outreach still works in any zip with at least a few
          funeral homes: we send the request, homes respond under the FTC
          Funeral Rule, and you see whatever comes back.
        </p>
      </>
    ),
  },
  {
    q: "What happens after I submit my zip code?",
    plain:
      "For the fair-price lookup: you see a results page with the regional range for each line item, and — if you entered a home's quote — a rating of that quote against the range. Nothing is saved. No account, no email collected. For advocate outreach: we show you the homes in your zip and ask for your authorization before anything goes out. You approve the list. We send the emails. Homes respond. We summarize in your dashboard.",
    a: (
      <>
        <p>
          For the fair-price lookup: you see a results page with the regional
          range for each line item, and &mdash; if you entered a home&rsquo;s
          quote &mdash; a rating of that quote against the range. Nothing is
          saved. No account, no email collected.
        </p>
        <p>
          For advocate outreach: we show you the homes in your zip and ask
          for your authorization before anything goes out. You approve the
          list. We send the emails. Homes respond. We summarize in your
          dashboard.
        </p>
      </>
    ),
  },
  {
    q: "Will funeral homes know I used Honest Funeral?",
    plain:
      "For the fair-price lookup: no. That happens entirely on our side, and no home is contacted. For advocate outreach: yes, and that's the point. We identify ourselves, by name, in every email. We invoke your rights under the FTC Funeral Rule to request a General Price List. Your surname is mentioned so the home knows who the inquiry is for; nothing else about you unless you tell us to share it. We don't impersonate families. Homes respond to Honest Funeral differently than to a grieving family, and that's exactly why this works.",
    a: (
      <>
        <p>
          For the fair-price lookup: no. That happens entirely on our side,
          and no home is contacted.
        </p>
        <p>
          For advocate outreach: yes, and that&rsquo;s the point.{" "}
          <strong>
            We identify ourselves, by name, in every email.
          </strong>{" "}
          We invoke your rights under the FTC Funeral Rule to request a
          General Price List. Your surname is mentioned so the home knows
          who the inquiry is for; nothing else about you unless you tell us
          to share it.
        </p>
        <p>
          We don&rsquo;t impersonate families. We don&rsquo;t send secret
          shoppers. Homes respond to Honest Funeral differently than to a grieving
          family, and that&rsquo;s exactly why this works.
        </p>
      </>
    ),
  },
  {
    q: "What is \u201Cadvocate outreach\u201D and is it anonymous?",
    plain:
      "Advocate outreach is the paid feature: we contact funeral homes on your behalf and collect comparison quotes. It is not anonymous — it's transparent. The homes know Honest Funeral is asking, they know we're a consumer advocate, and they know the FTC Funeral Rule gives them a legal obligation to provide a price list on request. We rely on the fact that homes respond differently when someone who knows the rules is doing the comparing.",
    a: (
      <>
        <p>
          Advocate outreach is the paid feature: we contact funeral homes on
          your behalf and collect comparison quotes. It is{" "}
          <strong>not anonymous</strong> &mdash; it&rsquo;s transparent.
        </p>
        <p>
          The homes know Honest Funeral is asking, they know we&rsquo;re a
          consumer advocate, and they know the FTC Funeral Rule gives them a
          legal obligation to provide a price list on request. We don&rsquo;t
          hide who we are; we rely on the fact that homes respond differently
          when someone who knows the rules is doing the comparing.
        </p>
      </>
    ),
  },
  {
    q: "Is this legal advice?",
    plain:
      "No. Honest Funeral is not a law firm, not a funeral home, and not a medical or financial advisor. The information on this site is general consumer guidance, not legal, medical, or financial advice. We reference the FTC Funeral Rule because it governs how funeral homes must disclose prices — but if you have a complex estate or legal question, you should talk to a licensed attorney in your state.",
    a: (
      <>
        <p>
          No. Honest Funeral is not a law firm, not a funeral home, and not a
          medical or financial advisor. The information on this site is
          general consumer guidance, not legal, medical, or financial
          advice.
        </p>
        <p>
          We reference the FTC Funeral Rule because it governs how funeral
          homes must disclose prices &mdash; but if you have a complex
          estate or legal question, you should talk to a licensed attorney
          in your state.
        </p>
      </>
    ),
  },
  {
    q: "Can I trust your price data?",
    plain:
      "Our regional ranges are based on General Price Lists collected from funeral homes, FTC Funeral Rule disclosures, and industry reports. We update them regularly. We'll always show you a range, not a single number — because real prices vary by neighborhood, by home, and by what's included in each package. The range tells you whether a quote is reasonable, not whether it's the lowest possible price. If you ever see a price estimate on this site that you think is wrong, email us and we'll look at it.",
    a: (
      <>
        <p>
          Our regional ranges are based on General Price Lists collected
          from funeral homes, FTC Funeral Rule disclosures, and industry
          reports. We update them regularly.
        </p>
        <p>
          We&rsquo;ll always show you a range, not a single number &mdash;
          because real prices vary by neighborhood, by home, and by
          what&rsquo;s included in each package. The range tells you whether
          a quote is <em>reasonable</em>, not whether it&rsquo;s the lowest
          possible price.
        </p>
        <p>
          If you ever see a price estimate on this site that you think is
          wrong, email us and we&rsquo;ll look at it.
        </p>
      </>
    ),
  },
  {
    q: "What if I\u2019m not sure I need your help?",
    plain:
      "Then don't pay us anything. Run the fair-price lookup for free. Read the 72-hour guidance for free. Use the obituary helper for free. Families routinely overpay by $2,000 to $5,000 on the funeral arrangement alone — usually because they don't know the fair range. If the free tools tell you the quote you've been given is already in range, you're done. Nothing else to do.",
    a: (
      <>
        <p>
          Then don&rsquo;t pay us anything. Run the fair-price lookup for
          free. Read the 72-hour guidance for free. Use the obituary helper
          for free.
        </p>
        <p>
          Families routinely overpay by{" "}
          <strong>$2,000 to $5,000</strong> on the funeral arrangement alone
          &mdash; usually because they don&rsquo;t know the fair range. If
          the free tools tell you the quote you&rsquo;ve been given is
          already in range, you&rsquo;re done. Nothing else to do.
        </p>
      </>
    ),
  },
  {
    q: "What do I do if the funeral home won\u2019t honor their quote?",
    plain:
      "For quotes we collected through advocate outreach: tell us within 14 days of service and we'll refund your $249. We also escalate with the home — a written GPL quote is a binding representation under the FTC Funeral Rule. For quotes you collected on your own: keep every written communication. You can file a complaint with the FTC at ReportFraud.ftc.gov, and (in many states) with your state attorney general or funeral board.",
    a: (
      <>
        <p>
          For quotes we collected through advocate outreach: tell us within
          14 days of service and we&rsquo;ll refund your $249. We also
          escalate with the home &mdash; a written GPL quote is a binding
          representation under the FTC Funeral Rule.
        </p>
        <p>
          For quotes you collected on your own: keep every written
          communication. You can file a complaint with the FTC at
          ReportFraud.ftc.gov, and (in many states) with your state attorney
          general or funeral board.
        </p>
      </>
    ),
  },
  {
    q: "How long does this whole process take?",
    plain:
      "Fair-price lookup: under three minutes. No account, no email. Advocate outreach: most homes respond within 24–72 hours. Start to finish (authorize, quotes, choose a home) typically takes 3–5 days. Families tell us this is worth waiting for — the savings on a single funeral arrangement often cover a year of living expenses for someone on a fixed income.",
    a: (
      <>
        <p>Fair-price lookup: under three minutes. No account, no email.</p>
        <p>
          Advocate outreach: most homes respond within 24&ndash;72 hours.
          Start to finish (authorize &rarr; quotes &rarr; choose a home)
          typically takes 3&ndash;5 days. Families tell us this is worth
          waiting for &mdash; the savings on a single funeral arrangement
          often cover a year of living expenses for someone on a fixed
          income.
        </p>
      </>
    ),
  },
  {
    q: "What if I need help after the funeral?",
    plain:
      "The first 30 days after a death involve a lot of paperwork — death certificates, Social Security, closing accounts, estate filings. Your dashboard includes a checklist with the right order and scripts for the calls you'll need to make. If something specific comes up (a disputed bill, a missing death certificate, an insurance claim that's been denied), email us — we'll point you at the right resource or office, even if it's not something we can handle directly.",
    a: (
      <>
        <p>
          The first 30 days after a death involve a lot of paperwork
          &mdash; death certificates, Social Security, closing accounts,
          estate filings. Your dashboard includes a checklist with the right
          order and scripts for the calls you&rsquo;ll need to make.
        </p>
        <p>
          If something specific comes up (a disputed bill, a missing death
          certificate, an insurance claim that&rsquo;s been denied), email
          us. We&rsquo;ll point you at the right resource or office, even if
          it&rsquo;s not something we can handle directly.
        </p>
      </>
    ),
  },
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, plain }) => ({
      "@type": "Question",
      name: q.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'),
      acceptedAnswer: {
        "@type": "Answer",
        text: plain,
      },
    })),
  };

  return (
    <main className="flex-1 flex flex-col">
      <JsonLd data={faqSchema} />
      <HashOpenDetails />
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Questions families ask
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-4">
              Straight answers.
            </h1>
            <p className="text-lg text-ink-soft">
              If you&rsquo;re weighing whether to trust this site with a
              decision you can&rsquo;t undo, these are the questions we get
              most. If we didn&rsquo;t answer yours, email us &mdash; we
              answer every one.
            </p>
          </div>

          <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {FAQ.map((item, i) => (
              <details
                key={i}
                id={slugify(item.q)}
                open={i < 3}
                className="group px-5 py-4 open:bg-surface-soft scroll-mt-20"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-serif text-lg text-ink list-none">
                  <span className="flex-1">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-primary-deep text-2xl leading-none group-open:rotate-45 transition-transform"
                  >
                    +
                  </span>
                </summary>
                <div className="mt-3 space-y-3 text-ink-soft [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-ink">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="rounded-2xl bg-primary-soft border-2 border-primary p-6">
            <h2 className="font-serif text-xl text-ink mb-2">
              Still have a question?
            </h2>
            <p className="text-ink-soft mb-4">
              We read every email. If you&rsquo;re about to make a decision
              under pressure and something on this site doesn&rsquo;t add
              up, tell us before you sign anything.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/prices">Look up fair prices</LinkButton>
              <LinkButton href="/how-it-works" variant="secondary">
                How advocate outreach works
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
