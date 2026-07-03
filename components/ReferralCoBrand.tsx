"use client";

import { useEffect, useState } from "react";
import { normalizeReferralCode, readReferral } from "@/lib/referral-codes";

/**
 * The co-branded trust-transfer banner (roadmap Phase 4). When the visit —
 * or the on-device referral memory — carries a real referral code, resolve
 * it to the institution's name and show it NEXT TO the non-overridable
 * neutrality pledge. The pledge is part of this component on purpose:
 * a partner name never renders without it.
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
      <span className="font-medium">Provided to you free by {name}.</span>{" "}
      Honest Funeral is independent: free to families, no money from funeral
      homes or insurers, and nothing here ever steers you to any provider.
      Your choices are never shared with {name} — they see only anonymous
      totals.
    </div>
  );
}
