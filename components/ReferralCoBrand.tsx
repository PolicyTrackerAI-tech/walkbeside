"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeReferralCode, readReferral } from "@/lib/referral-codes";
import { NeutralityPledge } from "@/components/partner/NeutralityPledge";
import { FREE_WITH_OR_WITHOUT_LINK } from "@/lib/copy";
import { trackTool } from "@/lib/analytics";

/**
 * The co-branded trust-transfer banner (roadmap Phase 4). When the visit —
 * or the on-device referral memory — carries a real referral code, resolve
 * it to the institution's name and show it NEXT TO the non-overridable
 * neutrality pledge. The pledge is part of this component on purpose:
 * a partner name never renders without it. The pledge wording itself lives
 * in components/partner/NeutralityPledge.tsx — the one reviewed constant.
 */
export function ReferralCoBrand({ refParam }: { refParam?: string }) {
  const [name, setName] = useState<string | null>(null);
  // One delivery event per mount, never one per resolve attempt.
  const tracked = useRef(false);

  useEffect(() => {
    const urlCode = normalizeReferralCode(refParam);
    const code = urlCode ?? readReferral();
    if (!code) return;
    let cancelled = false;
    fetch(`/api/partner/resolve?code=${encodeURIComponent(code)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { name?: string } | null) => {
        if (!cancelled && d?.name) {
          setName(d.name.slice(0, 80));
          // Counts visits that ARRIVED carrying a referral link and resolved
          // to a partner — the delivery seam. Deliberately NOT fired for the
          // on-device 30-day memory fallback (readReferral), or one family's
          // return visits across /plan-now, /analyzer, and the negotiate
          // wizard would inflate the count for a month. NO properties at all —
          // not the code, not the partner name; the page-view sanitizer
          // already strips ?ref, and this event stays aggregate-only. Known
          // accepted noise: a coordinator clicking the materials-page preview
          // link is a real ?ref visit and counts once.
          if (urlCode && !tracked.current) {
            tracked.current = true;
            trackTool("partner_landing_viewed");
          }
        }
      })
      .catch(() => {
        // banner is cosmetic; never surface an error for it
      });
    return () => {
      cancelled = true;
    };
  }, [refParam]);

  if (!name) return null;

  return (
    <div className="print:hidden rounded-xl border border-primary/30 bg-primary-soft/50 px-4 py-3 text-sm text-ink">
      <NeutralityPledge name={name} />
      {/* Institution-type-neutral on purpose: /api/partner/resolve returns the
          name only, and the partner may be an employer, not a hospice — so
          nothing here describes the partner or the people it serves.
          FREE_WITH_OR_WITHOUT_LINK is verbatim law: render the constant, never
          retype the sentence, never swap its em-dash for an &mdash; entity. It
          REPLACES the Day-4 sub-line — exactly one free-promise line renders in
          this banner, never two stacked. Dropping Day 4's "everyone they serve"
          loses nothing: the untouched pledge above already says "free to
          families". The trailing sentence keeps Day 4's exact reviewed words
          because it answers what the constant does not: the constant promises
          PRICE parity, this promises ACCESS parity — the link gates nothing.
          Emphasis is a font-medium <span>, never <strong>: the pledge's own
          lead directly above is font-medium, and a 700-weight sibling would
          invent a third weight in a four-line box. Keep the paragraph at
          text-ink-soft with text-ink on the span — that colour step is what
          preserves the hierarchy after the size promotion. The explicit {" "}
          is required: Turbopack eats a bare space after a JSX expression or
          tag at a line boundary. */}
      <p className="mt-2 text-sm text-ink-soft">
        <span className="font-medium text-ink">{FREE_WITH_OR_WITHOUT_LINK}</span>{" "}
        The link never unlocks anything.
      </p>
    </div>
  );
}
