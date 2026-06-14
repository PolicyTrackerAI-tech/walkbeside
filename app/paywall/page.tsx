import { redirect } from "next/navigation";

/**
 * RETIRED under the Model A pricing model (2026-05-21).
 *
 * The old "$49 upfront toolkit unlock" no longer exists: every tool is free,
 * and the flat $49 is for funeral-home outreach — paid upfront, before we
 * contact any home, and refundable in 14 days (see /negotiate/[id]/results).
 *
 * This route used to host the upfront-unlock checkout (since removed, along
 * with /api/stripe/checkout-account and /paywall/success). Nothing links here
 * anymore; we redirect to the canonical explainer so any stale external link
 * lands somewhere coherent instead of a dead paywall.
 */
export default function PaywallPage() {
  redirect("/how-it-works");
}
