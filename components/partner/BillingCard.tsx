"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * The INSTITUTIONAL billing card on /portal/settings. Families never see
 * this: the page is requirePartnerMember("/portal/settings", "owner")-gated,
 * and this card must never be extracted into any shared component (Operating
 * Plan guardrail #2 — families are never charged; there is no family billing
 * surface to share it with).
 *
 * No dollar amount is ever rendered here — the price lives in the Stripe
 * dashboard and the hospice reviews it on the Stripe-hosted checkout page.
 * `configured` and `justCheckedOut` are computed SERVER-side (the page is
 * always dynamic behind the owner gate); env logic never ships to the client.
 */
export function BillingCard({
  configured,
  billingStatus,
  billingStartedAt,
  justCheckedOut,
}: {
  configured: boolean;
  billingStatus: string | null;
  billingStartedAt: string | null;
  /** URL carried ?billing=success (the redirect usually beats the webhook). */
  justCheckedOut: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function go(path: "/api/stripe/checkout" | "/api/stripe/portal-link") {
    setBusy(true);
    setNotice(null);
    try {
      const r = await fetch(path, { method: "POST" });
      const body = (await r.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;
      if (r.ok && body?.url) {
        window.location.assign(body.url);
        return;
      }
      // Quiet states, not errors. 403 is terminal (this organization type is
      // never billed — no promise of later setup); already_subscribed means
      // the webhook simply hasn't landed on this page's data yet.
      if (r.status === 403) {
        setNotice("There's nothing to set up for your organization here.");
      } else if (r.status === 409 && body?.error === "already_subscribed") {
        setNotice(
          "You're already set up. Your subscription will show here shortly.",
        );
      } else if (r.status === 409) {
        setNotice(
          "This isn't quite ready for your organization yet. We'll set it up together and it will appear here.",
        );
      } else {
        setNotice("That didn't work just now. Try again in a moment.");
      }
    } catch {
      setNotice("That didn't work just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <Card>
        <CardTitle>Billing</CardTitle>
        <p className="text-sm text-ink-soft">
          Your organization is invoiced by arrangement. There&apos;s nothing to
          set up on this page. Questions go to your usual contact.
        </p>
      </Card>
    );
  }

  const active = billingStatus === "active" || billingStatus === "past_due";

  if (active) {
    const since = billingStartedAt
      ? new Date(billingStartedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;
    return (
      <Card>
        <CardTitle>Billing</CardTitle>
        <p className="text-sm text-ink-soft flex flex-wrap items-center gap-2">
          {billingStatus === "active" ? (
            <span className="rounded-full border border-good/30 bg-good-soft px-2 py-0.5 text-xs font-medium text-good">
              Active
            </span>
          ) : (
            <span className="rounded-full border border-warn/30 bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">
              Past due
            </span>
          )}
          {since && <span>Subscribed since {since}.</span>}
        </p>
        <div className="mt-4">
          <Button
            variant="ghost"
            onClick={() => go("/api/stripe/portal-link")}
            disabled={busy}
          >
            {busy ? "Opening…" : "Manage billing"}
          </Button>
        </div>
        {notice && <p className="text-sm text-ink-soft mt-2">{notice}</p>}
      </Card>
    );
  }

  // Redirect back from checkout usually beats the webhook — show a quiet
  // interim line instead of the start button until the status lands.
  if (justCheckedOut) {
    return (
      <Card>
        <CardTitle>Billing</CardTitle>
        <p className="text-sm text-ink-soft">
          Checkout complete. Your subscription is being confirmed and will
          appear here shortly.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Billing</CardTitle>
      {billingStatus === "canceled" && (
        <p className="text-sm text-ink-soft mb-1">
          Your previous subscription ended.
        </p>
      )}
      <p className="text-sm text-ink-soft">
        Start the pilot subscription for your organization. You&apos;ll review
        the amount on the secure checkout page before anything is charged.
      </p>
      <div className="mt-4">
        <Button onClick={() => go("/api/stripe/checkout")} disabled={busy}>
          {busy ? "Opening…" : "Start the pilot subscription"}
        </Button>
      </div>
      {notice && <p className="text-sm text-ink-soft mt-2">{notice}</p>}
    </Card>
  );
}
