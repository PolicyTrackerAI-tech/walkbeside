import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "Social Security survivor benefits — what families miss after a death",
  description:
    "A $255 lump-sum payment, monthly survivor benefits for spouses and children, and benefits for divorced spouses — what the Social Security Administration actually pays after a death, and the steps families miss.",
};

/**
 * /survivor-benefits — public, indexable page covering SSA survivor
 * benefits. Top-level (like /veterans) for SEO and discoverability.
 * Factual reference; no sister voice. Source: SSA Publication 05-10084
 * "Survivors Benefits" (2025 edition).
 */
export default function SurvivorBenefitsPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-7">
          <div>
            <CardEyebrow>Social Security survivor benefits</CardEyebrow>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The federal benefits most families either never claim or claim too late.
            </h1>
            <p className="text-lg text-ink-soft">
              When a worker who paid into Social Security dies, the
              Social Security Administration pays a one-time
              $255 death benefit and, in many cases, monthly survivor
              benefits to a spouse, children, or dependent parents.
              Families miss this all the time &mdash; or apply so late
              they lose months of money they were owed.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>The single most important thing to know.</CardTitle>
            <p className="text-ink-soft mt-3">
              Social Security survivor benefits do not start
              automatically. The family has to apply. Most benefits
              are paid only from the month the application is
              filed &mdash; not from the date of death. Waiting six
              months to apply means losing six months of payments.
              Apply as soon as you have the death certificate.
            </p>
          </Card>

          <Card>
            <CardEyebrow>The $255 lump-sum death benefit</CardEyebrow>
            <CardTitle>One-time payment. Two-year deadline. Often forgotten.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                The $255 lump-sum death benefit goes to a surviving
                spouse who was living with the deceased at the time of
                death. If there is no eligible spouse, it goes to a
                child who qualifies for survivor benefits on the
                deceased&rsquo;s record.
              </p>
              <p>
                The amount has been fixed at $255 since 1954 and is
                not adjusted for inflation. It is more symbolic than
                meaningful as money, but families forfeit it routinely
                because no one tells them to apply.
              </p>
              <p>
                <strong className="text-ink">Deadline:</strong> you
                have two years from the date of death to apply. After
                that, the benefit is gone.
              </p>
              <p>
                <strong className="text-ink">How to apply:</strong>{" "}
                call the SSA at 1-800-772-1213 or visit a local SSA
                office. You cannot apply for the lump-sum online; it
                requires a phone call or in-person visit. Many funeral
                homes will report the death to SSA on the family&rsquo;s
                behalf, but reporting the death is not the same as
                applying for benefits.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Monthly survivor benefits for spouses</CardEyebrow>
            <CardTitle>Up to 100% of the deceased&rsquo;s benefit, for life.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                A surviving spouse can receive a monthly benefit based
                on the deceased worker&rsquo;s earnings record.
                Eligibility rules:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-ink">Age 60 or older</strong>{" "}
                  &mdash; receive 71.5% to 100% of the deceased&rsquo;s
                  benefit, scaled by the survivor&rsquo;s age. Filing
                  at 60 reduces the benefit; full retirement age gets
                  the full amount.
                </li>
                <li>
                  <strong className="text-ink">Age 50&ndash;59 if disabled</strong>{" "}
                  &mdash; receive 71.5%. The disability must have
                  begun before, or within seven years after, the
                  worker&rsquo;s death.
                </li>
                <li>
                  <strong className="text-ink">Any age if caring for the deceased&rsquo;s child under 16</strong>{" "}
                  &mdash; receive 75%. Often called the
                  &ldquo;mother&rsquo;s or father&rsquo;s benefit.&rdquo;
                </li>
              </ul>
              <p>
                If the surviving spouse remarries before age 60 (or
                age 50 if disabled), eligibility for survivor benefits
                on the late spouse&rsquo;s record ends. Remarrying at
                or after 60 does not affect the benefit.
              </p>
              <p>
                Survivors who are also entitled to Social Security on
                their own work record can take the higher of the two
                benefits, but not both. Strategy matters: it is often
                better to claim the smaller benefit first and let the
                larger one grow.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Survivor benefits for children</CardEyebrow>
            <CardTitle>Until age 18 &mdash; or longer in two cases.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                Each unmarried child of a deceased worker can receive
                75% of the deceased&rsquo;s benefit if they are:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Under 18, or</li>
                <li>
                  Age 18 or 19 and a full-time student in elementary
                  or secondary school (not college), or
                </li>
                <li>
                  Any age if disabled before age 22 and the disability
                  continues.
                </li>
              </ul>
              <p>
                Stepchildren, grandchildren, and adopted children can
                qualify under specific conditions. A family maximum
                limits the total payable to a single family
                (typically 150% to 180% of the deceased&rsquo;s
                benefit), so households with multiple eligible
                children receive a prorated share.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Divorced-spouse survivor benefits</CardEyebrow>
            <CardTitle>If the marriage lasted 10 years, the rules are mostly the same.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                A surviving divorced spouse can claim survivor
                benefits on a deceased ex-spouse&rsquo;s record if all
                of the following are true:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>The marriage lasted at least 10 years.</li>
                <li>
                  The surviving divorced spouse is at least 60 (or 50
                  if disabled, or any age if caring for the deceased
                  ex-spouse&rsquo;s child under 16).
                </li>
                <li>
                  The surviving divorced spouse has not remarried
                  before age 60 (50 if disabled).
                </li>
              </ul>
              <p>
                Claims by a divorced spouse do not affect the benefit
                amount paid to any current widow or widower or other
                survivors on the deceased&rsquo;s record. The current
                spouse never sees the divorced spouse&rsquo;s claim.
              </p>
              <p>
                <strong className="text-ink">Commonly missed:</strong>{" "}
                many divorced spouses do not realize they qualify and
                never apply. There is no list at SSA of who might be
                eligible &mdash; the divorced spouse has to know to
                ask.
              </p>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Dependent-parent survivor benefits</CardEyebrow>
            <CardTitle>Rare but worth checking.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                A parent age 62 or older who was receiving at least
                half their support from the deceased child can
                qualify for survivor benefits on that child&rsquo;s
                record. One eligible parent receives 82.5%; two
                eligible parents receive 75% each.
              </p>
              <p>
                This applies most often when an adult child was the
                primary financial supporter of an aging parent.
                Documentation of the support relationship is required.
              </p>
            </div>
          </Card>

          <Card tone="warn">
            <CardEyebrow>Watch out</CardEyebrow>
            <CardTitle>Three traps families fall into.</CardTitle>
            <div className="text-ink-soft space-y-3 mt-3">
              <p>
                <strong className="text-ink">1. Confusing &ldquo;reporting the death&rdquo; with &ldquo;applying for benefits.&rdquo;</strong>{" "}
                Most funeral homes report the death to SSA. That stops
                future payments on the deceased&rsquo;s record &mdash;
                it does not start payments to the survivor. Applying
                is a separate step.
              </p>
              <p>
                <strong className="text-ink">2. Returning the last payment.</strong>{" "}
                If the deceased received a Social Security payment
                for the month they died, that payment must be
                returned (Social Security is paid in arrears, not in
                advance, and you must have lived the entire month to
                be entitled to that month&rsquo;s payment). SSA usually
                reclaims it automatically from the bank account. Do
                not spend the final payment until SSA has
                reconciled.
              </p>
              <p>
                <strong className="text-ink">3. Claiming too early on your own record.</strong>{" "}
                Survivor benefits and your own retirement benefits are
                two separate streams. In many cases, it makes sense to
                claim the survivor benefit first and let your own
                retirement benefit keep growing until age 70 (or vice
                versa). A free consultation with SSA or a fee-only
                financial advisor can identify the optimal sequence.
              </p>
            </div>
          </Card>

          <Card tone="primary">
            <CardEyebrow>How to apply</CardEyebrow>
            <CardTitle>Three steps. About one hour of effort.</CardTitle>
            <ol className="space-y-3 mt-4 text-ink-soft list-decimal list-inside">
              <li>
                <strong className="text-ink">Gather documents.</strong>{" "}
                Certified death certificate, the deceased&rsquo;s
                Social Security number, the survivor&rsquo;s Social
                Security number, marriage certificate (for spouse
                claims), divorce decree (for divorced spouse claims),
                children&rsquo;s birth certificates, and bank
                information for direct deposit.
              </li>
              <li>
                <strong className="text-ink">Call SSA at 1-800-772-1213</strong>{" "}
                or schedule an appointment at a local SSA office.
                Survivor benefits cannot be applied for online (only
                retirement and disability can). Hours: 8 AM &ndash; 7
                PM local time, Monday&ndash;Friday. Expect a 30 to 90
                minute wait on the phone; appointment scheduling
                typically goes faster.
              </li>
              <li>
                <strong className="text-ink">Complete the interview.</strong>{" "}
                The SSA representative walks through eligibility
                questions, confirms documents, and sets up direct
                deposit. First payment usually arrives in 30 to 60
                days; some applications take longer if documents are
                missing.
              </li>
            </ol>
            <div className="mt-5">
              <LinkButton href="https://www.ssa.gov/benefits/survivors/" size="lg">
                SSA survivors benefits page →
              </LinkButton>
            </div>
          </Card>

          <p className="text-xs text-ink-muted">
            This page summarizes Social Security Administration
            guidance from Publication 05-10084 (Survivors Benefits)
            and the SSA website. Specific eligibility, payment
            amounts, and procedures change over time and may depend
            on details not covered here. For a binding answer about
            a specific situation, contact SSA directly at
            1-800-772-1213 or visit{" "}
            <a
              href="https://www.ssa.gov/benefits/survivors/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-deep underline"
            >
              ssa.gov/benefits/survivors
            </a>
            . We are not affiliated with the Social Security
            Administration.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
