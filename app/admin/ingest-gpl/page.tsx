import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { CardEyebrow } from "@/components/ui/Card";
import { requireAdminPage } from "@/lib/admin-auth";
import { IngestClient } from "./IngestClient";

export const metadata: Metadata = {
  title: "GPL ingest — admin",
  robots: { index: false, follow: false },
};

/**
 * Founder GPL ingest (D2) — paste or photograph a funeral home's published
 * General Price List, review the parsed items (the human gate), save. The
 * row lands in price_list_analyses tagged `founder_ingest` and feeds the
 * /admin/benchmarks groups; a source URL also stamps gpl_url +
 * last_verified_at on the matched home.
 */
export default async function AdminIngestGplPage() {
  await requireAdminPage("/admin/ingest-gpl");

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <section className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Admin · GPL ingest</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Turn a published price list into benchmark data
            </h1>
            <p className="text-ink-soft text-sm">
              Paste (or photograph) a home&rsquo;s General Price List, review
              the parsed items, and save. The analysis lands with
              founder_ingest provenance and feeds the{" "}
              <a href="/admin/benchmarks" className="text-primary-deep underline">
                /admin/benchmarks
              </a>{" "}
              groups; adding the source URL also stamps gpl_url +
              last_verified_at on the matched home. Watch-out: analyses made
              while signed in as an <strong>active partner member</strong>{" "}
              (e.g. a demo-org owner account) are excluded from the benchmark
              pipeline — ingest from your own admin account only.
            </p>
          </div>
          <IngestClient />
        </div>
      </section>
    </main>
  );
}
