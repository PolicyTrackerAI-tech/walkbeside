import type { Metadata } from "next";
import Link from "next/link";
import { requirePartnerMember } from "@/lib/partner/auth";
import {
  buildPartnerReportData,
  activeCodeCount,
} from "@/lib/partner/report-data";
import { ProofSheet } from "@/components/partner/ProofSheet";
import { PortalSessionNav } from "@/components/partner/PortalSessionNav";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Partner portal",
};

/**
 * The signed-in portal overview: exactly the token report's aggregates
 * (shared lib/partner/report-data.ts), behind requirePartnerMember instead
 * of a bearer token. A brand-new org with no referral links yet gets a
 * first-run checklist instead of an empty report.
 */
export default async function PortalOverviewPage() {
  const { partner } = await requirePartnerMember("/portal");

  const [{ stats, digest }, codeCount] = await Promise.all([
    buildPartnerReportData(partner),
    activeCodeCount(partner.id),
  ]);

  const nav = (
    <PortalSessionNav
      token={partner.report_token}
      partnerName={partner.name}
      active="overview"
    />
  );

  if (stats.familiesHelped === 0 && codeCount === 0) {
    return (
      <main className="flex-1 flex flex-col">
        <SiteHeader navLinks={[]} />
        <div className="max-w-3xl mx-auto w-full px-5 pt-6 pb-12 space-y-6">
          {nav}
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              Welcome — three steps to your first report
            </h1>
            <p className="mt-1 text-ink-soft text-sm">
              Nothing appears here until a family you referred uses the tools.
              Here&rsquo;s how that starts.
            </p>
          </div>
          <Card>
            <CardTitle>1. Create your first referral link</CardTitle>
            <p className="text-sm text-ink-soft mt-1">
              A referral link (or its QR code) opens our free planning tools
              with your organization&rsquo;s name on them. Takes about fifteen
              seconds.
            </p>
            <Link
              href={`/partner/r/${partner.report_token}/links`}
              className="inline-block mt-3 rounded-xl border-2 border-primary bg-primary-soft px-4 py-2 text-sm text-primary-deep no-underline font-medium"
            >
              Create a referral link
            </Link>
          </Card>
          <Card>
            <CardTitle>2. Hand it to families, after admission</CardTitle>
            <p className="text-sm text-ink-soft mt-1">
              Print the QR card or paste the link wherever you already share
              resources with families. The family activates it themselves —
              you never enter anything about them, and we never contact anyone
              who didn&rsquo;t come to us first.
            </p>
          </Card>
          <Card>
            <CardTitle>3. Watch the report build itself</CardTitle>
            <p className="text-sm text-ink-soft mt-1">
              As referred families check quotes and complete cases, this page
              becomes your aggregate outcomes report — families served,
              documented savings, satisfaction. Never individual details, and
              dollar figures appear once at least five families have outcomes.
            </p>
          </Card>
          <p className="text-xs text-ink-muted">
            Fielding an &ldquo;is this quote fair?&rdquo; question right now?{" "}
            <Link
              href={`/partner/r/${partner.report_token}/check`}
              className="text-primary-deep underline"
            >
              Check a family&rsquo;s quote
            </Link>{" "}
            — instant and grounded.
          </p>
        </div>
      </main>
    );
  }

  return (
    <ProofSheet
      name={partner.name}
      stats={stats}
      live
      digest={digest}
      token={partner.report_token}
      portalNav={nav}
    />
  );
}
