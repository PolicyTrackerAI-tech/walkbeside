import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { fmtCents, FLAT_FEE_CENTS } from "@/lib/stripe";

export interface OutreachRow {
  id: string;
  home_name: string;
  status: string;
  quote_cents: number | null;
}

export interface AdvocateOutreachCardProps {
  negotiationId: string;
  status: string;
  /** True once the family has paid the $49 placement fee (or the deal is closed). */
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
};

/**
 * Dashboard card showing the family's active advocate outreach. Home names
 * are blurred until the placement fee is paid — the family can see how many
 * homes responded and the price spread, but not which home is which until
 * they commit. This is the v2 monetization gate.
 */
export function AdvocateOutreachCard({
  negotiationId,
  status,
  unlocked,
  justStarted,
  outreach,
}: AdvocateOutreachCardProps) {
  const replied = outreach.filter((o) => o.status === "replied");
  const quotes = replied
    .map((o) => o.quote_cents)
    .filter((q): q is number => typeof q === "number" && q > 0);
  const lowQuote = quotes.length ? Math.min(...quotes) : null;
  const highQuote = quotes.length ? Math.max(...quotes) : null;

  const headline =
    status === "closed"
      ? "Your advocate outreach — placed."
      : status === "received" || replied.length > 0
        ? `Your advocate outreach — ${replied.length} ${replied.length === 1 ? "home has" : "homes have"} replied.`
        : "Your advocate outreach — in progress.";

  return (
    <Card tone={unlocked ? "good" : "primary"}>
      <CardEyebrow>Advocate outreach</CardEyebrow>
      <CardTitle>{headline}</CardTitle>

      {justStarted && (
        <div className="mb-4 rounded-xl border border-primary/40 bg-white px-4 py-3 text-sm text-ink-soft">
          Outreach sent. Most homes reply within 24 hours. We&rsquo;ll surface
          the responses here as they come in &mdash; you don&rsquo;t need to
          check email.
        </div>
      )}

      <p className="text-ink-soft mb-4">
        We contacted {outreach.length}{" "}
        {outreach.length === 1 ? "home" : "homes"} as your named advocate and
        requested itemized prices under the FTC Funeral Rule.
        {quotes.length > 0 && lowQuote !== null && highQuote !== null && (
          <>
            {" "}
            Quotes so far range from{" "}
            <strong className="text-ink">{fmtCents(lowQuote)}</strong> to{" "}
            <strong className="text-ink">{fmtCents(highQuote)}</strong>.
          </>
        )}
      </p>

      <ul className="space-y-2 mb-5">
        {outreach.map((o) => (
          <li
            key={o.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/60 px-4 py-3"
          >
            <span
              className={`flex-1 text-sm text-ink ${unlocked ? "" : "select-none"}`}
              style={unlocked ? undefined : { filter: "blur(5px)" }}
              aria-hidden={!unlocked}
            >
              {o.home_name}
            </span>
            <span className="text-xs uppercase tracking-wider text-ink-muted shrink-0">
              {STATUS_LABEL[o.status] ?? o.status}
            </span>
            {o.quote_cents != null && o.quote_cents > 0 && (
              <span
                className={`text-sm font-medium text-ink shrink-0 ${unlocked ? "" : "select-none"}`}
                style={unlocked ? undefined : { filter: "blur(4px)" }}
              >
                {fmtCents(o.quote_cents)}
              </span>
            )}
          </li>
        ))}
      </ul>

      {unlocked ? (
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`/negotiate/${negotiationId}/results`}>
            View full results &rarr;
          </LinkButton>
          <LinkButton
            href={`/negotiate/${negotiationId}/status`}
            variant="secondary"
          >
            Outreach detail
          </LinkButton>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-primary bg-primary-soft/60 px-4 py-4">
          <p className="text-ink mb-3">
            <strong>
              Pay {fmtCents(FLAT_FEE_CENTS)} to unlock the homes
            </strong>{" "}
            and contact your chosen one directly. You only pay because we did
            the calling &mdash; refundable if no presented home honors their
            quote within 14 days.
          </p>
          <form
            action="/api/stripe/unlock"
            method="post"
            className="flex flex-wrap gap-3 items-center"
          >
            <input type="hidden" name="negotiationId" value={negotiationId} />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-primary-deep text-white hover:opacity-90"
            >
              Unlock for {fmtCents(FLAT_FEE_CENTS)} &rarr;
            </button>
            <Link
              href={`/negotiate/${negotiationId}/status`}
              className="text-sm text-ink-soft underline-offset-2 hover:underline"
            >
              See what we sent
            </Link>
          </form>
        </div>
      )}
    </Card>
  );
}
