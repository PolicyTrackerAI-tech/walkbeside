"use client";

import { useEffect, useState } from "react";
import { normalizeReferralCode, readReferral } from "@/lib/referral-codes";
import { NeutralityPledge } from "@/components/partner/NeutralityPledge";

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

  useEffect(() => {
    const code = normalizeReferralCode(refParam) ?? readReferral();
    if (!code) return;
    let cancelled = false;
    fetch(`/api/partner/resolve?code=${encodeURIComponent(code)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { name?: string } | null) => {
        if (!cancelled && d?.name) setName(d.name.slice(0, 80));
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
          name only, and the partner may be an employer, not a hospice. */}
      <p className="mt-1 text-xs text-ink-muted">
        It&rsquo;s free for everyone they serve, link or no link &mdash; the
        link never unlocks anything.
      </p>
    </div>
  );
}
