import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requirePartnerMember } from "@/lib/partner/auth";
import { PortalSessionNav } from "@/components/partner/PortalSessionNav";
import { SiteHeader } from "@/components/SiteHeader";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings · Partner portal",
};

/**
 * /portal/settings — owner-only org settings (contact name, digest
 * recipient, brand accent) plus the quick-link danger zone: rotating
 * report_token kills every shared copy immediately without touching
 * anyone's sign-in.
 */
export default async function PortalSettingsPage() {
  const ctx = await requirePartnerMember("/portal/settings", "owner");

  // contact_name isn't part of the session context — fetch it here.
  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
  let contactName = "";
  try {
    const { data } = await admin
      .from("partners")
      .select("contact_name")
      .eq("id", ctx.partner.id)
      .single();
    contactName = (data as { contact_name: string | null } | null)?.contact_name ?? "";
  } catch {
    // Field loads empty; saving still works.
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <div className="max-w-3xl mx-auto w-full px-5 pt-6 pb-12 space-y-6">
        <PortalSessionNav
          partnerName={ctx.partner.name}
          active="settings"
          role={ctx.member.role}
        />
        <div>
          <h1 className="text-2xl font-semibold text-ink">Settings</h1>
          <p className="mt-1 text-ink-soft text-sm">
            How your organization appears on family-facing materials, and
            where your reports go.
          </p>
        </div>
        <SettingsClient
          orgName={ctx.partner.name}
          contactName={contactName}
          notificationEmail={ctx.partner.notification_email ?? ""}
          contactEmail={ctx.partner.contact_email}
          brandAccent={ctx.partner.brand_accent ?? ""}
          appUrl={PUBLIC.appUrl}
          reportToken={ctx.partner.report_token}
        />
      </div>
    </main>
  );
}
