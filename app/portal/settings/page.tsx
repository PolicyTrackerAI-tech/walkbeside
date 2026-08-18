import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, FEATURES, requireServer } from "@/lib/env";
import { billingEligible } from "@/lib/billing";
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
export default async function PortalSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  // Guardrail #1: the billing surface exists ONLY for hospice/employer
  // partners. For any other type (insurer) no billing card renders at all —
  // not even the invoiced-by-arrangement copy, which would read as a payment
  // promise to a partner type we never bill.
  const billingApplicable = billingEligible(ctx.partner.partner_type);

  // Billing columns in their OWN query: a pre-Migration-B database errors on
  // them, and one merged select would blank contact_name too. On any error
  // the card just renders the invoiced-by-arrangement state.
  let billingStatus: string | null = null;
  let billingStartedAt: string | null = null;
  let billingReadable = false;
  if (billingApplicable) {
    try {
      const { data, error } = await admin
        .from("partners")
        .select("billing_status, billing_started_at")
        .eq("id", ctx.partner.id)
        .single();
      if (error) throw error;
      const row = data as {
        billing_status: string | null;
        billing_started_at: string | null;
      } | null;
      billingStatus = row?.billing_status ?? null;
      billingStartedAt = row?.billing_started_at ?? null;
      billingReadable = true;
    } catch {
      // Pre-migration: unconfigured state.
    }
  }

  // Computed server-side — env logic never ships to the client. Off (the
  // default, and prod posture until the founder flips it) renders the
  // invoiced-by-arrangement copy.
  const billingConfigured =
    billingApplicable &&
    billingReadable &&
    FEATURES.billing() &&
    process.env.BILLING_LIVE === "true";

  // The redirect back from Stripe usually lands before the webhook does —
  // the card shows a quiet "being confirmed" line for this request.
  const justCheckedOut = (await searchParams).billing === "success";

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
          billingApplicable={billingApplicable}
          billingConfigured={billingConfigured}
          billingStatus={billingStatus}
          billingStartedAt={billingStartedAt}
          billingJustCheckedOut={justCheckedOut}
        />
      </div>
    </main>
  );
}
