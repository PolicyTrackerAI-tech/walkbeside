import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePartnerToken } from "@/lib/partner-auth";
import { buildPartnerReportData } from "@/lib/partner/report-data";
import { ProofSheet } from "@/components/partner/ProofSheet";
import { PartnerPortalNav } from "@/components/partner/PartnerPortalNav";

export const metadata: Metadata = {
  title: "Partner report",
  // Never index a bearer-token report URL.
  robots: { index: false, follow: false },
};

/**
 * The REAL partner proof report, behind an unguessable report_token. Possession
 * of the token authorizes a read-only, AGGREGATE-ONLY view of the partner's
 * referred families (no per-family detail ever reaches the markup). Data
 * assembly lives in lib/partner/report-data.ts — shared verbatim with the
 * signed-in /portal overview so the two views can never drift. Degrades to a
 * calm empty state (and notFound on a bad token, or before the
 * partners/outcomes migrations are applied). Design: docs/P3_PARTNER_LAYER.md.
 */
export default async function PartnerTokenReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Resolve the token → partner. A bad token, or the table not existing yet
  // (migration unapplied), both 404 — we never confirm the route to a guesser.
  const partner = await resolvePartnerToken(token);
  if (!partner || partner.active === false) notFound();

  const { stats, digest, priceListChecks } = await buildPartnerReportData(partner);

  return (
    <>
      <ProofSheet
        name={partner.name}
        stats={stats}
        live
        digest={digest}
        linksHref={`/partner/r/${token}/links`}
        priceListChecks={priceListChecks}
        partnerType={
          partner.partner_type === "employer" ? "employer" : "hospice"
        }
        portalNav={
          <PartnerPortalNav
            token={token}
            partnerName={partner.name}
            active="report"
          />
        }
      />
      <div className="max-w-2xl mx-auto px-5 pb-10 print:hidden">
        <p className="text-sm text-ink-soft">
          Coordinators:{" "}
          <a
            href={`/partner/r/${token}/links`}
            className="text-primary-deep underline"
          >
            create and manage your referral links
          </a>{" "}
          — each one opens our free planning tools with your name on them, and
          cases started through them count toward this report. Fielding an
          &ldquo;is this quote fair?&rdquo; question in person?{" "}
          <a
            href={`/partner/r/${token}/check`}
            className="text-primary-deep underline"
          >
            Check a family&rsquo;s quote
          </a>{" "}
          for an instant, grounded read.
        </p>
      </div>
    </>
  );
}
