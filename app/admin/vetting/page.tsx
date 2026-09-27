import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { CardEyebrow } from "@/components/ui/Card";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminPage } from "@/lib/admin-auth";
import { VettingClient } from "./VettingClient";
import { loadVettingHomes } from "./load-homes";

export const metadata: Metadata = {
  title: "Funeral home vetting — admin",
  robots: { index: false, follow: false },
};

export default async function AdminVettingPage() {
  await requireAdminPage("/admin/vetting");

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Pages past Supabase's 1,000-row response cap (see load-homes.ts).
  const { homes, error } = await loadVettingHomes(admin);

  return (
    <main className="flex-1 flex flex-col bg-bg">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-10 space-y-5">
          <div>
            <CardEyebrow>Admin · directory vetting</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              Funeral home vetting
            </h1>
            <p className="text-ink-soft mt-2">
              Review each home before it can receive outreach. A home is only
              contacted when it is <strong className="text-ink">approved</strong>{" "}
              (vetted) <em>and</em> has an email &mdash; unreviewed imports are
              never contacted, even with the live switch on. Approve the real
              ones, fix or add emails, reject duplicates and wrong listings.
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-bad/30 bg-bad/10 text-bad text-sm px-4 py-3">
              Could not load the directory: {error}
            </div>
          ) : (
            <VettingClient initial={homes} />
          )}
        </div>
      </section>
    </main>
  );
}
