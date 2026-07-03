import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardTitle } from "@/components/ui/Card";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = {
  title: "Partner with Honest Funeral — hospices & employers | Honest Funeral",
  description:
    "Give your families free, neutral funeral-price help — price checking, planning tools, and calm guidance, at no cost to them or to you during the pilot. Apply in two minutes; a person reviews every application.",
  alternates: { canonical: "/partners/apply" },
};

/**
 * Self-serve partner onboarding (roadmap Phase 4). The form creates a PENDING
 * row; nothing goes live until the founder approves it by hand — every new
 * institutional relationship keeps its human gate. The page also states the
 * two commitments that decide whether we're a fit, before anyone applies.
 */
export default function PartnersApplyPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader rightSlot={<BackLink defaultHref="/for-funeral-homes" defaultLabel="← About us" />} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              For hospices &amp; employers
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Give your families the calm way through the funeral.
            </h1>
            <p className="text-lg text-ink-soft">
              Your team hands families a link during admission week. They get
              free, private planning tools — the fair-price checker, the
              family plan, the after-death checklist — and you get an
              aggregate outcomes report showing what it caught for them.
              Nothing to install, no engineer needed, free to families always.
            </p>
          </div>

          <Card tone="primary">
            <CardTitle>Two commitments, before you apply</CardTitle>
            <ul className="mt-3 space-y-3 text-sm text-ink leading-relaxed">
              <li className="border-l-2 border-primary pl-4">
                <strong>We are neutral, structurally.</strong> Honest Funeral
                takes no money from funeral homes or insurers and never steers
                a family to any provider. Your referral link can&rsquo;t
                change what a family sees — attribution exists only so your
                report can count aggregate outcomes.
              </li>
              <li className="border-l-2 border-primary pl-4">
                <strong>You never see a family&rsquo;s choices.</strong> No
                names, no funeral homes, no prices — your report shows
                aggregate, de-identified totals only, and small cohorts are
                suppressed entirely.
              </li>
            </ul>
          </Card>

          <ApplyForm />

          <p className="text-xs text-ink-muted">
            A person reviews every application — usually within a business
            day. Questions first? Email{" "}
            <a href="mailto:partners@honestfuneral.co" className="text-primary-deep underline">
              partners@honestfuneral.co
            </a>
            . Curious what the report looks like?{" "}
            <Link href="/partner/sample-hospice" className="text-primary-deep underline">
              See a sample
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
