import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { CardEyebrow } from "@/components/ui/Card";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminPage } from "@/lib/admin-auth";
import { PartnersClient, type PartnerRow, type CodeStat } from "./PartnersClient";

export const metadata: Metadata = {
  title: "Partners — admin",
  robots: { index: false, follow: false },
};

/**
 * The founder's partner desk (roadmap Phase 4): approve/pause applications
 * (the human gate on every institutional money relationship) and the
 * unclaimed-referral safety net — codes issued vs claimed, founder-only,
 * never shown to the hospice — to prompt a human check-in when a
 * coordinator's links sit unused.
 */
export default async function AdminPartnersPage() {
  await requireAdminPage("/admin/partners");

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  let partners: PartnerRow[] = [];
  let codeStats: CodeStat[] = [];
  try {
    const { data } = await admin
      .from("partners")
      .select(
        "id, name, partner_type, status, active, report_token, contact_name, contact_email, application_notes, created_at",
      )
      .order("created_at", { ascending: false });
    partners = (data as PartnerRow[] | null) ?? [];

    const { data: codes } = await admin
      .from("partner_codes")
      .select("code, partner_id, label, active, created_at");
    const { data: claims } = await admin
      .from("negotiations")
      .select("partner_code")
      .not("partner_code", "is", null);
    const claimCounts = new Map<string, number>();
    for (const c of (claims ?? []) as { partner_code: string }[]) {
      claimCounts.set(c.partner_code, (claimCounts.get(c.partner_code) ?? 0) + 1);
    }
    codeStats = (
      (codes as Omit<CodeStat, "claims">[] | null) ?? []
    ).map((c) => ({ ...c, claims: claimCounts.get(c.code) ?? 0 }));
  } catch {
    // pre-migration: empty desk, page still renders
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <section className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Admin · partners</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              The partner desk
            </h1>
            <p className="text-ink-soft text-sm">
              Every application waits here until a person approves it —
              activating a partner is what turns on their report link,
              referral codes, and co-branding. The codes table below is the
              unclaimed-referral safety net: issued-vs-claimed, visible only
              to you, so a quiet coordinator gets a friendly check-in instead
              of a dead pilot.
            </p>
          </div>

          <PartnersClient partners={partners} codeStats={codeStats} />
        </div>
      </section>
    </main>
  );
}
