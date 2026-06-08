import { redirect } from "next/navigation";

/**
 * RETIRED under the Model A pricing model (2026-05-21).
 *
 * The old "$49 upfront toolkit unlock" no longer exists: every tool is free,
 * and the flat $49 is charged only when a family chooses a funeral home we
 * found for them (a success fee on selection — see /negotiate/[id]/results).
 *
 * This route used to host the upfront-unlock checkout. Nothing should link
 * here anymore; we redirect to the canonical explainer so any stale link
 * (or the checkout-account cancel_url, pending its removal in the payment
 * consolidation) lands somewhere coherent instead of a false paywall.
 */
export default function PaywallPage() {
  redirect("/how-it-works");
}
