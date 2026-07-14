import type { Metadata } from "next";
import { aggregateCohort, sampleCohort } from "@/lib/partner-report";
// Only fallbackOutcomesDigest — NEVER buildOutcomesDigest or anything from
// lib/claude. This route is a fully public, unauthenticated catch-all (any
// slug renders a page); importing the Claude-calling function here would
// make it a free, unlimited way to trigger real API calls.
import { fallbackOutcomesDigest } from "@/lib/partner-report-digest";
import { ProofSheet } from "@/components/partner/ProofSheet";

export const metadata: Metadata = {
  title: "Partner report",
  robots: { index: false, follow: false },
};

function titleize(slug: string, isEmployer: boolean): string {
  const t = slug.replace(/[-_]+/g, " ").trim();
  const empty = isEmployer ? "Your organization" : "Your hospice";
  return t ? t.replace(/\b\w/g, (c) => c.toUpperCase()) : empty;
}

/**
 * The SAMPLE / sales-deck proof report — illustrative figures so a prospect can
 * see the format before any real data exists. The REAL report lives behind an
 * unguessable token at /partner/r/[token]. Same <ProofSheet>, live={false}.
 * A slug containing "employer" (e.g. /partner/sample-employer) renders the
 * employer variant; /partner/sample-hospice stays the demo-script URL.
 */
export default async function PartnerSampleReportPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const isEmployer = /employer/i.test(code);
  const name = titleize(decodeURIComponent(code), isEmployer);
  const stats = aggregateCohort(sampleCohort());
  // Generic subject ("this hospice" / "this employer"), not the URL-decoded
  // slug — this reads naturally regardless of what a visitor types into
  // /partner/anything-at-all.
  const digest = stats.smallSample
    ? undefined
    : fallbackOutcomesDigest(isEmployer ? "this employer" : "this hospice", stats);
  return (
    <ProofSheet
      name={name}
      stats={stats}
      live={false}
      digest={digest}
      partnerType={isEmployer ? "employer" : "hospice"}
    />
  );
}
