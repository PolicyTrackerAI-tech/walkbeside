import type { Metadata } from "next";
import { aggregateCohort, sampleCohort } from "@/lib/partner-report";
import { ProofSheet } from "@/components/partner/ProofSheet";

export const metadata: Metadata = {
  title: "Partner report — Honest Funeral",
  robots: { index: false, follow: false },
};

function titleize(slug: string): string {
  const t = slug.replace(/[-_]+/g, " ").trim();
  return t ? t.replace(/\b\w/g, (c) => c.toUpperCase()) : "Your hospice";
}

/**
 * The SAMPLE / sales-deck proof report — illustrative figures so a prospect can
 * see the format before any real data exists. The REAL report lives behind an
 * unguessable token at /partner/r/[token]. Same <ProofSheet>, live={false}.
 */
export default async function PartnerSampleReportPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const name = titleize(decodeURIComponent(code));
  return <ProofSheet name={name} stats={aggregateCohort(sampleCohort())} live={false} />;
}
