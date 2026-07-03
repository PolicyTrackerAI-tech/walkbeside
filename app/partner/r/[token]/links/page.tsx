import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { PUBLIC, requireServer } from "@/lib/env";
import { LinksClient, type CodeRow } from "./LinksClient";

export const metadata: Metadata = {
  title: "Referral links | Honest Funeral",
  robots: { index: false, follow: false },
};

/**
 * Coordinator self-serve referral links (roadmap Phase 4). Credential = the
 * partner's founder-issued report token, same as the report page one level
 * up. Everything shown here is aggregate: codes, labels, claim COUNTS.
 * Case-level anything is structurally absent (zero-visibility rule).
 */
export default async function PartnerLinksPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length < 16) notFound();

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  let partner: { id: string; name: string; active: boolean } | null = null;
  try {
    const { data } = await admin
      .from("partners")
      .select("id, name, active")
      .eq("report_token", token)
      .single();
    partner = data ?? null;
  } catch {
    partner = null;
  }
  if (!partner || partner.active === false) notFound();

  // Codes + aggregate claim counts. Errors (e.g. the partner_codes migration
  // not applied yet) degrade to an empty list with the create flow available.
  let codes: CodeRow[] = [];
  try {
    const { data: codeRows } = await admin
      .from("partner_codes")
      .select("code, label, active, created_at")
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false });
    const { data: claims } = await admin
      .from("negotiations")
      .select("partner_code")
      .eq("partner_id", partner.id)
      .not("partner_code", "is", null);
    const counts = new Map<string, number>();
    for (const c of claims ?? []) {
      const k = (c as { partner_code: string }).partner_code;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    codes = ((codeRows as Omit<CodeRow, "claims">[] | null) ?? []).map((r) => ({
      ...r,
      claims: counts.get(r.code) ?? 0,
    }));
  } catch {
    codes = [];
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader />
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>{partner.name} · referral links</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink leading-tight mb-2">
              Give families the calm way in.
            </h1>
            <p className="text-ink-soft text-sm">
              Each link opens our free planning tools with your
              organization&rsquo;s name on them. Families use everything at
              their own pace; if they later ask us to gather quotes, the case
              counts toward your{" "}
              <Link href={`/partner/r/${token}`} className="text-primary-deep underline">
                aggregate report
              </Link>
              . You&rsquo;ll never see any family&rsquo;s choices, homes, or
              prices — by design, so the trust runs both ways.
            </p>
          </div>

          <LinksClient token={token} initialCodes={codes} />

          <Card tone="soft">
            <CardTitle>The neutrality pledge, in one paragraph</CardTitle>
            <p className="text-sm text-ink-soft mt-2">
              Honest Funeral is free to families and takes no money from
              funeral homes or insurers. Referral links never influence which
              funeral homes a family sees — attribution exists solely so your
              report can show aggregate outcomes. Families always come to us
              by their own choice.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
