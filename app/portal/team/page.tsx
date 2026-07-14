import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requirePartnerMember } from "@/lib/partner/auth";
import { listMembers } from "@/lib/partner/team";
import { PortalSessionNav } from "@/components/partner/PortalSessionNav";
import { SiteHeader } from "@/components/SiteHeader";
import { TeamClient } from "./TeamClient";

export const metadata: Metadata = {
  title: "Team · Partner portal",
};

/**
 * /portal/team — owner-only seat management. The gate 404s plain members
 * (the route's existence is never confirmed); all reads/writes go through
 * the service role scoped to this org's partner_id.
 */
export default async function PortalTeamPage() {
  const ctx = await requirePartnerMember("/portal/team", "owner");

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const members = await listMembers(admin, ctx.partner.id);

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <div className="max-w-3xl mx-auto w-full px-5 pt-6 pb-12 space-y-6">
        <PortalSessionNav
          partnerName={ctx.partner.name}
          active="team"
          role={ctx.member.role}
        />
        <div>
          <h1 className="text-2xl font-semibold text-ink">Team</h1>
          <p className="mt-1 text-ink-soft text-sm">
            Who can sign in to this portal. Everyone here sees the same
            aggregate report and tools — never any individual family&rsquo;s
            details.
          </p>
        </div>
        <TeamClient members={members} selfMemberId={ctx.member.id} />
      </div>
    </main>
  );
}
