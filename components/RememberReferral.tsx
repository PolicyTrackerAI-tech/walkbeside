"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { rememberReferral } from "@/lib/referral-codes";

/**
 * Invisible: if the ?ref= (or ?for= / ?partner=) value is a real referral code
 * (HF-XXXXXX), remember it on-device for 30 days so a negotiation started later
 * still attributes to the referring institution. Cosmetic partner-name refs are
 * ignored here and keep their banner-only behavior. Nothing is sent anywhere by
 * this component. Mounted once from the root layout (inside Suspense — it reads
 * useSearchParams) so the memory works on every route a referral link lands on,
 * not just the pages that render a co-brand banner.
 */
export function RememberReferral() {
  const sp = useSearchParams();
  const raw = sp.get("ref") ?? sp.get("for") ?? sp.get("partner");
  useEffect(() => {
    rememberReferral(raw ?? undefined);
  }, [raw]);
  return null;
}
