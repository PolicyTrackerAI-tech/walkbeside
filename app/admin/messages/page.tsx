import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { PUBLIC, requireServer } from "@/lib/env";

export const metadata: Metadata = {
  title: "Inbound FD messages — admin",
  robots: { index: false, follow: false },
};

interface MessageRow {
  id: string;
  negotiation_id: string;
  outreach_id: string | null;
  direction: "inbound_fd" | "outbound_to_fd" | "outbound_to_family";
  from_address: string | null;
  subject: string | null;
  body_text: string | null;
  created_at: string;
}

interface OutreachLite {
  id: string;
  home_name: string;
}

interface NegotiationLite {
  id: string;
  status: string;
  zip: string;
  service_type: string;
  created_at: string;
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const sp = await searchParams;
  const expected = process.env.ADMIN_PREVIEW_KEY;
  const provided = (sp.key ?? "").trim();
  if (!expected || provided !== expected) {
    notFound();
  }

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data: messages } = await admin
    .from("negotiation_messages")
    .select(
      "id, negotiation_id, outreach_id, direction, from_address, subject, body_text, created_at",
    )
    .eq("direction", "inbound_fd")
    .order("created_at", { ascending: false })
    .limit(100);

  const inbound: MessageRow[] = messages ?? [];

  const negIds = Array.from(new Set(inbound.map((m) => m.negotiation_id)));
  const outreachIds = Array.from(
    new Set(inbound.map((m) => m.outreach_id).filter((x): x is string => !!x)),
  );

  const { data: negsData } = negIds.length
    ? await admin
        .from("negotiations")
        .select("id, status, zip, service_type, created_at")
        .in("id", negIds)
    : { data: [] };
  const negsById = new Map<string, NegotiationLite>(
    (negsData ?? []).map((n) => [n.id, n as NegotiationLite]),
  );

  const { data: outreachData } = outreachIds.length
    ? await admin
        .from("negotiation_outreach")
        .select("id, home_name")
        .in("id", outreachIds)
    : { data: [] };
  const outreachById = new Map<string, OutreachLite>(
    (outreachData ?? []).map((o) => [o.id, o as OutreachLite]),
  );

  return (
    <main className="flex-1 flex flex-col bg-bg">
      <SiteHeader showBack={false} />
      <section className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-10 space-y-5">
          <div>
            <CardEyebrow>Admin · inbound messages</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              Funeral-home replies
            </h1>
            <p className="text-ink-soft mt-2">
              Last 100 messages from funeral homes via Postmark Inbound,
              newest first. Read-only view &mdash; for now, the family
              responds via their /status page (which auto-refreshes every 6
              seconds).
            </p>
          </div>

          {inbound.length === 0 ? (
            <Card tone="soft">
              <p className="text-ink-soft">
                No inbound messages yet. They&rsquo;ll show up here as soon
                as funeral homes start replying to outreach.
              </p>
            </Card>
          ) : (
            <ul className="space-y-3">
              {inbound.map((m) => {
                const neg = negsById.get(m.negotiation_id);
                const outreach = m.outreach_id
                  ? outreachById.get(m.outreach_id)
                  : null;
                const when = new Date(m.created_at).toLocaleString();
                return (
                  <li key={m.id}>
                    <Card>
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-ink-muted">
                            {when}
                          </div>
                          <CardTitle className="mb-1">
                            {outreach?.home_name ?? "Unmatched sender"}
                          </CardTitle>
                          <div className="text-sm text-ink-soft">
                            From:{" "}
                            <span className="text-ink">
                              {m.from_address ?? "unknown"}
                            </span>
                          </div>
                          {m.subject && (
                            <div className="text-sm text-ink-soft mt-0.5">
                              Subject:{" "}
                              <span className="text-ink">{m.subject}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-ink-muted">
                          {neg ? (
                            <>
                              <div>{neg.zip}</div>
                              <div>{neg.service_type}</div>
                              <div className="mt-1 inline-block bg-surface-soft border border-border rounded-full px-2 py-0.5">
                                {neg.status}
                              </div>
                            </>
                          ) : (
                            <div className="text-bad">
                              Negotiation missing
                            </div>
                          )}
                        </div>
                      </div>
                      {m.body_text && (
                        <pre className="bg-surface-soft border border-border rounded-xl p-4 text-sm text-ink whitespace-pre-wrap font-mono">
{m.body_text}
                        </pre>
                      )}
                      {!outreach && m.outreach_id && (
                        <p className="text-xs text-warn mt-3">
                          outreach_id is set but row not found &mdash;
                          maybe deleted
                        </p>
                      )}
                      {!m.outreach_id && (
                        <p className="text-xs text-warn mt-3">
                          Sender didn&rsquo;t match any known
                          negotiation_outreach row by email. Triage
                          manually.
                        </p>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
