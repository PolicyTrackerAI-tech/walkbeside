import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardTitle } from "@/components/ui/Card";
import { FEDERAL_BASELINE } from "@/lib/merp-by-state";
import { StateMerp } from "./StateMerp";

export const metadata: Metadata = {
  title: "Medicaid estate recovery, explained calmly",
  description:
    "If your person was on Medicaid, the state may send a letter months after the death claiming repayment from the estate — usually the house. What the law actually allows, the protections every family has, your state's rules with citations, and what to do before paying anything.",
  alternates: { canonical: "/medicaid-estate-recovery" },
};

/**
 * The MERP navigator (roadmap Phase 2). Hospice decedents skew
 * Medicaid/dual-eligible; the recovery notice lands months after the death,
 * when the family thinks the paperwork is over. The page leads with the two
 * facts that stop the panic: it's a claim against the estate (not the
 * family), and federal law builds in deferrals + a hardship waiver.
 */
export default function MerpPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/estate" defaultLabel="← Estate basics" />} />

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Medicaid estate recovery
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              A letter from the state about the house is not a bill you owe.
            </h1>
            <p className="text-lg text-ink-soft">
              If your person received Medicaid long-term care, the state is
              required by federal law to try to recover those costs from the
              estate after death — that&rsquo;s called Medicaid estate
              recovery, and the notice often arrives months later, out of
              nowhere. Families panic and pay, or sign things they
              shouldn&rsquo;t. Here&rsquo;s what the law actually allows, and
              the protections built in for you.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>{FEDERAL_BASELINE.headline}</CardTitle>
            <ul className="mt-3 space-y-3 text-ink">
              {FEDERAL_BASELINE.points.map((p) => (
                <li key={p.slice(0, 40)} className="border-l-2 border-primary pl-4 text-sm leading-relaxed">
                  {p}
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-muted mt-3">
              Federal law: {FEDERAL_BASELINE.cite}. True in every state.
            </p>
          </Card>

          <StateMerp />

          <Card>
            <CardTitle>Before you pay or sign anything</CardTitle>
            <ol className="mt-3 space-y-3 text-ink list-decimal pl-5 text-sm leading-relaxed">
              <li>
                <strong>Don&rsquo;t pay from your own pocket.</strong> Recovery
                comes from the estate. If there is no estate, or the estate is
                worth less than the claim, that is the state&rsquo;s problem —
                not a debt the family inherits.
              </li>
              <li>
                <strong>Check the deferrals first.</strong> A surviving spouse,
                a child under 21, or a blind or disabled child of any age
                pauses recovery — in every state. If any of those apply, say so
                in writing.
              </li>
              <li>
                <strong>Ask for the rule in writing.</strong> Request the
                statute or manual section the recovery unit is acting under,
                an itemized statement of what Medicaid actually paid, and the
                hardship-waiver application. All three are reasonable, normal
                requests.
              </li>
              <li>
                <strong>Apply for the hardship waiver if it bites.</strong>{" "}
                Losing the family home, a working farm, or ending up needing
                public assistance yourself are exactly what waivers are for.
                Deadlines are short — send the application even if it
                isn&rsquo;t perfect.
              </li>
              <li>
                <strong>Talk to an elder-law attorney before responding.</strong>{" "}
                Many offer free consultations; legal aid organizations handle
                estate-recovery cases routinely. One hour of advice often
                changes the outcome here.
              </li>
            </ol>
          </Card>

          <p className="text-sm text-ink-soft">
            Related:{" "}
            <Link href="/estate" className="text-primary-deep underline">
              estate basics by state
            </Link>{" "}
            ·{" "}
            <Link href="/survivor-benefits" className="text-primary-deep underline">
              survivor benefits
            </Link>{" "}
            ·{" "}
            <Link href="/after" className="text-primary-deep underline">
              what comes after the funeral
            </Link>
          </p>

          <p className="text-xs text-ink-muted">
            General information, not legal advice. Estate-recovery rules change
            and every estate is different — confirm anything that matters with
            a local elder-law attorney or your state&rsquo;s legal-aid program.
          </p>
        </div>
      </section>
    </main>
  );
}
