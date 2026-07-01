import type { Metadata } from "next";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { CardEyebrow } from "@/components/ui/Card";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminPage } from "@/lib/admin-auth";
import {
  OutcomesClient,
  type OutcomeCase,
  type OutcomeHome,
  type PartnerLite,
} from "./OutcomesClient";

export const metadata: Metadata = {
  title: "Negotiation outcomes — admin",
  robots: { index: false, follow: false },
};

const NEG_COLS =
  "id, zip, service_type, status, target_home_estimate_cents, best_quote_cents, negotiated_price_cents, amount_paid_cents, satisfaction_score, savings_vs_listed_cents, outcome_recorded_at, partner_id, created_at";
const OUTREACH_COLS =
  "id, negotiation_id, home_name, quote_cents, chosen, listed_price_cents, negotiated_price_cents, hidden_fees, status";

export default async function AdminOutcomesPage() {
  // Session-based admin gate (logged-in ADMIN_EMAILS allowlist), same as the
  // other /admin/* tools — replaces the deprecated ?key=ADMIN_PREVIEW_KEY scheme.
  await requireAdminPage("/admin/outcomes");

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data: negs, error } = await admin
    .from("negotiations")
    .select(NEG_COLS)
    .order("created_at", { ascending: false })
    .limit(500);

  const negotiations = ((negs as Omit<OutcomeCase, "homes">[] | null) ?? []);
  const ids = negotiations.map((n) => n.id);

  const { data: outreach } = ids.length
    ? await admin
        .from("negotiation_outreach")
        .select(OUTREACH_COLS)
        .in("negotiation_id", ids)
    : { data: [] as OutcomeHome[] };

  const homesByNeg = new Map<string, OutcomeHome[]>();
  for (const h of ((outreach as OutcomeHome[] | null) ?? [])) {
    const arr = homesByNeg.get(h.negotiation_id) ?? [];
    arr.push(h);
    homesByNeg.set(h.negotiation_id, arr);
  }

  const cases: OutcomeCase[] = negotiations.map((n) => ({
    ...n,
    homes: (homesByNeg.get(n.id) ?? []).sort(
      (a, b) => (a.quote_cents ?? Infinity) - (b.quote_cents ?? Infinity),
    ),
  }));

  // The list of partners to tag cases to. Tolerant: if the partners table isn't
  // there yet (migration unapplied), the selector just shows "no partners yet".
  let partners: PartnerLite[] = [];
  try {
    const { data } = await admin
      .from("partners")
      .select("id, name")
      .eq("active", true)
      .order("name", { ascending: true });
    partners = (data as PartnerLite[] | null) ?? [];
  } catch {
    partners = [];
  }

  // So the founder never silently drops a referred case from a partner report.
  const untaggedRecorded = cases.filter(
    (c) => c.outcome_recorded_at && !c.partner_id,
  ).length;

  return (
    <main className="flex-1 flex flex-col bg-bg">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-10 space-y-5">
          <div>
            <CardEyebrow>Admin · outcomes</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              Negotiation outcomes
            </h1>
            <p className="text-ink-soft mt-2">
              What actually happened on each case: which home was chosen, what
              was negotiated and paid, hidden fees, and how the family rated us.
              Savings vs the family&rsquo;s original listed quote is computed by
              the database. Read here via the service role &mdash; family data
              is never exposed publicly.
            </p>
          </div>
          {error ? (
            <div className="rounded-xl border border-bad/30 bg-bad/10 text-bad text-sm px-4 py-3">
              Could not load outcomes: {error.message}
            </div>
          ) : (
            <>
              {untaggedRecorded > 0 && partners.length > 0 && (
                <div className="rounded-xl border border-warn/40 bg-warn-soft/50 text-ink text-sm px-4 py-3">
                  {untaggedRecorded} recorded{" "}
                  {untaggedRecorded === 1 ? "case is" : "cases are"} not tagged to
                  a partner &mdash; tag them below so they appear on the right
                  partner&rsquo;s report.
                </div>
              )}
              <OutcomesClient initial={cases} partners={partners} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
