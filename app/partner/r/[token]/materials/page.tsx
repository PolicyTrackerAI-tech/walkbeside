import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { PartnerPortalNav } from "@/components/partner/PartnerPortalNav";
import { FamilyMaterials } from "@/components/partner/FamilyMaterials";
import { isPartnerParked, resolvePartnerToken } from "@/lib/partner-auth";
import { codesWithClaims } from "@/lib/partner/codes";

export const metadata: Metadata = {
  title: "Family materials",
  robots: { index: false, follow: false },
};

/**
 * Token twin of /portal/materials (audit A5-03). The report_token quick link
 * is the no-account path most line coordinators actually hold — before this
 * page, printing the family kit required a sign-in seat, which was the first
 * friction a real pilot coordinator would hit. Same shared kit component,
 * same aggregate-only rule: nothing case-level renders here.
 */
export default async function PartnerMaterialsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const partner = await resolvePartnerToken(token);
  // Parked orgs (paused/archived/deactivated) lose bearer-link access the
  // moment the founder parks them — same rule as the session portal (A5-02).
  if (!partner || isPartnerParked(partner)) notFound();

  const { rows: codes } = await codesWithClaims(partner.id);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <PartnerPortalNav
            token={token}
            partnerName={partner.name}
            active="materials"
          />
          <FamilyMaterials
            partner={partner}
            codes={codes}
            linksHref={`/partner/r/${token}/links`}
          />
        </div>
      </section>
    </main>
  );
}
