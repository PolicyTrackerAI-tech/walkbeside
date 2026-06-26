import { redirect } from "next/navigation";

/**
 * RETIRED.
 *
 * The old upfront toolkit unlock no longer exists: everything is free to
 * families, including the funeral-home outreach (see /negotiate/[id]/results).
 *
 * This route used to host the upfront-unlock checkout (since removed, along
 * with /api/stripe/checkout-account and /paywall/success). Nothing links here
 * anymore; we redirect to the canonical explainer so any stale external link
 * lands somewhere coherent instead of a dead paywall.
 */
export default function PaywallPage() {
  redirect("/how-it-works");
}
