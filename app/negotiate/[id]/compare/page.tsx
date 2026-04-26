import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { fmtCents } from "@/lib/stripe";
import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";
import {
  buildCompareMatrix,
  RATING_BG,
  RATING_LABEL,
  type CellRating,
  type OutreachForCompare,
} from "@/lib/negotiation/compare";

export default async function NegotiationComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/negotiate/${id}/compare`);

  const { data: neg } = await supabase
    .from("negotiations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!neg) redirect("/dashboard");

  const { data: outreachRaw } = await supabase
    .from("negotiation_outreach")
    .select("id, home_name, quote_cents, quote_items")
    .eq("negotiation_id", id)
    .order("quote_cents", { ascending: true, nullsFirst: false });

  const replies: OutreachForCompare[] = (outreachRaw ?? []).filter(
    (o) => o.quote_cents != null && o.quote_cents > 0,
  );

  const matrix = buildCompareMatrix(replies);
  const anyItemized = matrix.columns.some((c) => c.hasItems);
  const serviceLabel = SERVICE_LABELS[neg.service_type as ServiceType];

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        backHref={`/negotiate/${id}/results`}
        backLabel="← Back to results"
      />

      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-5 py-10 space-y-6">
          <div>
            <CardEyebrow>Side-by-side comparison</CardEyebrow>
            <h1 className="font-serif text-3xl text-ink">
              {serviceLabel} &mdash; {matrix.columns.length} home
              {matrix.columns.length === 1 ? "" : "s"}
            </h1>
            <p className="text-ink-soft mt-2">
              {anyItemized
                ? "Each cell is colored against fair-price ranges. Push back on amber and red lines, or substitute with a third-party vendor."
                : "Quote totals only — no itemized breakdowns recorded yet. Once a home sends a General Price List with line items, this view shows fair-price ratings per row."}
            </p>
          </div>

          {matrix.columns.length === 0 && (
            <Card tone="soft">
              <p className="text-ink-soft">
                No quotes recorded yet. Head back to the{" "}
                <a
                  href={`/negotiate/${id}/status`}
                  className="text-primary-deep underline"
                >
                  status page
                </a>{" "}
                and record what each home sent.
              </p>
            </Card>
          )}

          {matrix.spreadCents > 0 && (
            <Card tone="good">
              <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                Spread between cheapest and most expensive
              </div>
              <div className="font-serif text-3xl text-ink">
                {fmtCents(matrix.spreadCents)} difference
              </div>
              <p className="text-sm text-ink-soft mt-2">
                Same service type, same zip. This is the dollar amount on the
                table for choosing the right home.
              </p>
            </Card>
          )}

          {matrix.columns.length > 0 && (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-ink-muted pb-3 pr-4 align-bottom">
                      Line item
                    </th>
                    {matrix.columns.map((c, i) => (
                      <th
                        key={c.outreachId}
                        className="text-left font-medium pb-3 px-3 align-bottom min-w-[160px]"
                      >
                        <div className="text-ink">{c.homeName}</div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          {i === matrix.cheapestIndex
                            ? "Lowest total"
                            : `Option ${i + 1}`}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.rows.map((row) => (
                    <tr key={row.lineItemId}>
                      <th
                        scope="row"
                        className="text-left font-normal text-ink pr-4 py-2 border-t border-border align-top"
                      >
                        <div>{row.name}</div>
                        {row.knownItem && (
                          <div className="text-xs text-ink-muted mt-0.5">
                            Fair: ${row.knownItem.fairLow.toLocaleString()}–$
                            {row.knownItem.fairHigh.toLocaleString()}
                          </div>
                        )}
                        {!row.knownItem && (
                          <div className="text-xs text-ink-muted mt-0.5">
                            No reference price
                          </div>
                        )}
                      </th>
                      {row.cells.map((cell, i) => (
                        <td
                          key={i}
                          className={`px-3 py-2 border-t border-border align-top ${RATING_BG[cell.rating]}`}
                        >
                          {cell.cents == null ? (
                            <span className="text-ink-muted">&mdash;</span>
                          ) : (
                            <>
                              <div className="font-medium">
                                {fmtCents(cell.cents)}
                              </div>
                              {cell.rating !== "unrated" &&
                                cell.rating !== "fair" && (
                                  <div className="text-xs mt-0.5 opacity-80">
                                    {ratingShort(cell.rating)}
                                  </div>
                                )}
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr>
                    <th
                      scope="row"
                      className="text-left font-medium text-ink pr-4 py-3 border-t-2 border-ink/20 align-top"
                    >
                      Total
                    </th>
                    {matrix.totals.map((cell, i) => (
                      <td
                        key={i}
                        className={`px-3 py-3 border-t-2 border-ink/20 align-top ${RATING_BG[cell.rating]}`}
                      >
                        {cell.cents == null ? (
                          <span className="text-ink-muted">&mdash;</span>
                        ) : (
                          <div className="font-serif text-xl">
                            {fmtCents(cell.cents)}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {matrix.columns.length > 0 && (
            <Card tone="soft">
              <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">
                Color key
              </div>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                {(
                  ["good", "fair", "high", "predatory", "unrated"] as CellRating[]
                ).map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <span
                      className={`inline-block w-4 h-4 rounded ${RATING_BG[r]} border border-border`}
                      aria-hidden
                    />
                    <span className="text-ink-soft">{RATING_LABEL[r]}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card tone="primary">
            <CardTitle>Ready to choose?</CardTitle>
            <p className="text-ink-soft mb-4">
              Pick a home back on the results page. We release contact info and
              charge the flat fee only when you confirm.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href={`/negotiate/${id}/results`}>
                Back to results &amp; choose →
              </LinkButton>
              <LinkButton href="/dashboard" variant="ghost">
                Back to dashboard
              </LinkButton>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

function ratingShort(r: CellRating): string {
  switch (r) {
    case "good":
      return "At/below fair";
    case "high":
      return "Above fair";
    case "predatory":
      return "Predatory";
    default:
      return "";
  }
}
