import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { PortalSessionNav } from "@/components/partner/PortalSessionNav";
import { FamilyMaterials } from "@/components/partner/FamilyMaterials";
import { requirePartnerMember } from "@/lib/partner/auth";
import { codesWithClaims } from "@/lib/partner/codes";

export const metadata: Metadata = {
  title: "Family materials",
};

/**
 * Session-portal wrapper for the family materials kit. The kit itself lives
 * in components/partner/FamilyMaterials.tsx, shared with the token surface
 * (/partner/r/[token]/materials) so a coordinator holding only the quick
 * link can print the same kit (audit A5-03).
 */
export default async function PortalMaterialsPage() {
  const ctx = await requirePartnerMember("/portal/materials");
  const { partner } = ctx;

  const { rows: codes } = await codesWithClaims(partner.id);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <PortalSessionNav
            partnerName={partner.name}
            active="materials"
            role={ctx.member.role}
          />
          <FamilyMaterials
            partner={partner}
            codes={codes}
            linksHref="/portal/links"
          />
        </div>
      </section>
    </main>
  );
}
