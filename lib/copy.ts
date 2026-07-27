/**
 * Shared, reviewed copy constants. Server-safe (no "use client") so both
 * server pages and client components can render the exact same string.
 */

/**
 * THE free-without-referral sentence (sprint Day 4 gate): a family with no
 * referral must see, verbatim, that everything is free without one. Renders
 * in the homepage hero trust paragraph and unconditionally in the hospice
 * finder. Use this constant — never retype the sentence.
 */
export const FREE_FOR_EVERY_FAMILY =
  "Everything here is free for every family — no referral, no code, no link needed.";

/**
 * THE free-with-or-without-a-link sentence (sprint Day 5 gate): the family who
 * DID arrive through a hospice hand-off must see, verbatim, that the link
 * changed nothing about the price. Render sites: the printed one-pager in
 * app/portal/materials/page.tsx (handed to the family) and the referral
 * arrival banners (components/ReferralCoBrand.tsx, the cosmetic
 * app/plan-now/PlanNow.tsx banner).
 *
 * A DIFFERENT string from FREE_FOR_EVERY_FAMILY above, which addresses the
 * family who arrived with NO referral. Both stay exported; never conflate,
 * replace, or "harmonize" the two — they answer different questions for
 * different readers. Use the constant; never retype the sentence.
 */
export const FREE_WITH_OR_WITHOUT_LINK =
  "Everything here is free for you — with or without this link.";
