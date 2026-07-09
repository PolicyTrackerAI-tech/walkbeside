import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import {
  CaseStepper,
  stageForNegotiationStatus,
} from "@/components/negotiate/CaseStepper";
import { fmtCents } from "@/lib/stripe";

export interface OutreachRow {
  id: string;
  home_name: string;
  status: string;
  quote_cents: number | null;
}

export interface FuneralHomeOutreachCardProps {
  negotiationId: string;
  status: string;
  /** True once the deal is closed (the family chose a home). Tones the card. */
  unlocked: boolean;
  /** True when this card was just created (renders a confirmation banner). */
  justStarted?: boolean;
  outreach: OutreachRow[];
}

const STATUS_LABEL: Record<string, string> = {
  sent: "Awaiting reply",
  replied: "Replied",
  "no-reply": "No reply yet",
  declined: "Declined",
  dry_run: "Dry-run (test mode)",
};

/**
 * Dashboard card showing the family's active funeral-home outreach.
 *
 * The outreach is free to families; results are free to view and choosing a
 * home costs nothing. The family sees every home and quote with no reveal
 * paywall.
 */
export function FuneralHomeOutreachCard({
  negotiationId,
  status,
  unlocked,
  justStarted,
  outreach,
}: FuneralHomeOutreachCardProps) {
  const replied = outreach.filter((o) => o.status === "replied");
  const quotes = replied
    .map((o) => o.quote_cents)
    .filter((q): q is number => typeof q === "number" && q > 0);
  const lowQuote = quotes.length ? Math.min(...quotes) : null;
  const highQuote = quotes.length ? Math.max(...quotes) : null;
  const pendingPayment = status === "pending_payment";
  const closed = status === "closed";

  const headline = pendingPayment
    ? "Your funeral-home outreach — ready to send."
    : closed
      ? "Your funeral-home outreach — placed."
      : status === "received" || replied.length > 0
        ? `Your funeral-home outreach — ${replied.length} ${replied.length === 1 ? "home has" : "homes have"} replied.`
        : "Your funeral-home outreach — in progress.";

  return (
    <Card tone={unlocked ? "good" : "primary"}>
      <CardEyebrow>Funeral-home outreach</CardEyebrow>
      <CardTitle>{headline}</CardTitle>

      <div className="mb-4">
        <CaseStepper stage={stageForNegotiationStatus(status)} />
      </div>

      {justStarted && (
        <div className="mb-4 rounded-xl border border-primary/40 bg-white px-4 py-3 text-sm text-ink-soft">
          Outreach sent. Most homes reply within 24 hours. We&rsquo;ll surface
          the responses here as they come in &mdash; you don&rsquo;t need to
          check email.
        </div>
      )}

      <p className="text-ink-soft mb-4">
        {pendingPayment ? (
          <>
            We found {outreach.length}{" "}
            {outreach.length === 1 ? "home" : "homes"} near you and prepared a
            request to each. <strong className="text-ink">Nothing has been
            sent yet</strong> &mdash; review and send to start getting quotes.
          </>
        ) : (
          <>
            We contacted {outreach.length}{" "}
            {outreach.length === 1 ? "home" : "homes"} on your behalf and
            requested itemized prices under the FTC Funeral Rule.
            {quotes.length > 0 && lowQuote !== null && highQuote !== null && (
              <>
                {" "}
                Quotes so far range from{" "}
                <strong className="text-ink">{fmtCents(lowQuote)}</strong> to{" "}
                <strong className="text-ink">{fmtCents(highQuote)}</strong>.
              </>
            )}
          </>
        )}
      </p>

      {!pendingPayment && (
        <ul className="space-y-2 mb-5">
          {outreach.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/60 px-4 py-3"
            >
              <span className="flex-1 text-sm text-ink">{o.home_name}</span>
              <span className="text-xs uppercase tracking-wider text-ink-muted shrink-0">
                {STATUS_LABEL[o.status] ?? o.status}
              </span>
              {o.quote_cents != null && o.quote_cents > 0 && (
                <span className="text-sm font-medium text-ink shrink-0">
                  {fmtCents(o.quote_cents)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {pendingPayment ? (
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`/negotiate/${negotiationId}/preview`}>
            Review &amp; send →
          </LinkButton>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={`/negotiate/${negotiationId}/results`}>
              {closed ? "View results" : "View results & choose a home →"}
            </LinkButton>
            <LinkButton
              href={`/negotiate/${negotiationId}/status`}
              variant="secondary"
            >
              Outreach detail
            </LinkButton>
          </div>
          {!closed && (
            <p className="text-xs text-ink-muted mt-3">
              This is what we knew a moment ago &mdash; outreach detail has the
              live view, updated as replies come in.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
