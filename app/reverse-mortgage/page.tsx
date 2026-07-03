import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardTitle } from "@/components/ui/Card";
import { HelpFooter } from "@/components/HelpFooter";

export const metadata: Metadata = {
  title: "A reverse mortgage after a death — the heir's timeline | Honest Funeral",
  description:
    "When the borrower on a reverse mortgage dies, the loan comes due — but heirs have real rights: a response window, extensions up to a year, the 95%-of-appraised-value payoff, and non-recourse protection. The timeline, in plain English, for FHA HECM loans.",
  alternates: { canonical: "/reverse-mortgage" },
};

/**
 * HECM heir timeline (roadmap Phase 2). This population is
 * reverse-mortgage-exposed, the servicer's due-and-payable letter lands fast,
 * and heirs routinely believe they must either pay the full balance or lose
 * the house — when the two facts that matter most are the 95% option and
 * non-recourse. HECM-scoped throughout; proprietary loans are flagged as
 * different at the top and bottom.
 */
export default function ReverseMortgagePage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/estate" defaultLabel="← Estate basics" />} />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Reverse mortgage
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              The reverse-mortgage letter has a clock. You have more rights
              than it sounds like.
            </h1>
            <p className="text-lg text-ink-soft">
              When someone with a reverse mortgage dies, the loan becomes due —
              and the servicer&rsquo;s &ldquo;due and payable&rdquo; letter
              reads like a demand to pay everything or lose the house. Neither
              is the whole truth. Here&rsquo;s the actual timeline and the two
              protections most families don&rsquo;t know they have.
            </p>
            <p className="text-sm text-ink-muted mt-2">
              This guide covers FHA-insured HECM loans — the large majority of
              reverse mortgages. Proprietary (non-FHA &ldquo;jumbo&rdquo;)
              loans follow their own contracts:{" "}
              <strong className="text-ink">
                first call, ask the servicer which type this is.
              </strong>
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>The two facts that change everything</CardTitle>
            <ul className="mt-3 space-y-3 text-ink text-sm leading-relaxed">
              <li className="border-l-2 border-primary pl-4">
                <strong>Heirs can keep the home for 95% of its appraised
                value</strong> — even if the loan balance is higher. If the
                house appraises at $200,000 and the balance is $260,000, the
                family can satisfy the loan for $190,000. The servicer orders
                the appraisal; you can dispute a bad one.
              </li>
              <li className="border-l-2 border-primary pl-4">
                <strong>The loan is non-recourse.</strong> Nobody inherits a
                shortfall. If the house sells for less than the balance, FHA
                insurance absorbs the difference — the estate and the heirs
                never owe it. Walking away is always an option, and it costs
                the family nothing beyond the house itself.
              </li>
            </ul>
          </Card>

          <Card>
            <CardTitle>The timeline, step by step</CardTitle>
            <ol className="mt-3 space-y-3 text-ink list-decimal pl-5 text-sm leading-relaxed">
              <li>
                <strong>The loan becomes due when the last borrower dies.</strong>{" "}
                (If a surviving spouse is on the loan, nothing happens — and
                even a non-borrowing spouse may qualify to stay under HUD&rsquo;s
                deferral rules; tell the servicer immediately if this is the
                situation.)
              </li>
              <li>
                <strong>The servicer sends a due-and-payable notice</strong>{" "}
                and typically asks for a response within 30 days: whether the
                family intends to pay off the loan, sell the home, buy it at
                the 95% figure, or sign it over (a deed in lieu). Respond
                inside the window — in writing — even if the answer is
                &ldquo;we&rsquo;re deciding.&rdquo; Responding is what keeps
                the extensions available.
              </li>
              <li>
                <strong>The family generally has six months</strong> to sell
                or arrange the payoff.
              </li>
              <li>
                <strong>Two 90-day extensions are possible</strong> (with HUD
                approval, shown as actively marketing or closing the sale) —
                up to roughly a year in total. Ask for them in writing before
                the current period ends.
              </li>
              <li>
                <strong>If nobody responds, foreclosure starts.</strong> The
                worst outcome here is almost always the result of silence, not
                of the loan itself.
              </li>
            </ol>
          </Card>

          <Card>
            <CardTitle>What to send and ask for, this week</CardTitle>
            <ul className="mt-3 space-y-2 text-ink-soft text-sm leading-relaxed list-disc pl-5">
              <li>
                Send the servicer the death certificate and your contact
                details, and ask — in writing — for: the loan type (HECM or
                proprietary), the current payoff figure, and the deadline
                dates as they count them.
              </li>
              <li>
                Ask whether a non-borrowing spouse deferral could apply before
                making any other decision, if a spouse still lives in the home.
              </li>
              <li>
                Keep paying (or confirm escrow covers) property taxes and
                homeowner&rsquo;s insurance — lapses there can accelerate
                foreclosure independent of everything above.
              </li>
              <li>
                Free help exists: HUD-approved housing counselors handle HECM
                cases at no charge — find one at hud.gov or 1-800-569-4287.
              </li>
            </ul>
          </Card>

          <p className="text-sm text-ink-soft">
            Related:{" "}
            <Link href="/estate" className="text-primary-deep underline">
              estate basics
            </Link>{" "}
            ·{" "}
            <Link href="/medicaid-estate-recovery" className="text-primary-deep underline">
              Medicaid estate recovery
            </Link>{" "}
            ·{" "}
            <Link href="/next-30-days" className="text-primary-deep underline">
              the next-30-days checklist
            </Link>
          </p>

          <p className="text-xs text-ink-muted">
            General information, not legal or financial advice. HECM rules are
            federal (HUD/FHA), but servicer practices and state foreclosure law
            vary — a HUD-approved counselor or an attorney can confirm the
            specifics of your loan.
          </p>

          <HelpFooter />
        </div>
      </section>
    </main>
  );
}
