"use client";

import { useEffect } from "react";
import { rememberReferral } from "@/lib/referral-codes";

/**
 * Invisible: if the ?ref= value is a real referral code (HF-XXXXXX), remember
 * it on-device for 30 days so a negotiation started later still attributes to
 * the referring institution. Cosmetic partner-name refs are ignored here and
 * keep their banner-only behavior. Nothing is sent anywhere by this component.
 */
export function RememberReferral({ code }: { code?: string }) {
  useEffect(() => {
    rememberReferral(code);
  }, [code]);
  return null;
}
