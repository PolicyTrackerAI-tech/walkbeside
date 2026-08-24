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

/**
 * THE role sentence (audit A8 gate, 2026-08-18): the persistent plain-language
 * disclaimer required by docs/legal/UTAH_CLEARANCE_DRAFT.md §4 (PR #184) —
 * the platform must visibly disclaim funeral-home / funeral-director status
 * on the surfaces closest to "arranging" (negotiate + decide) and site-wide.
 * Substance is fixed pending counsel blessing (wording tightened for design
 * is fine; the three elements — not a funeral home or director, we do not
 * arrange funerals or handle remains, the family contracts directly — must
 * all survive). Renders via components/RoleDisclaimer.tsx and the global
 * footer. Use the constant; never retype the sentence.
 */
export const NOT_A_FUNERAL_HOME =
  "Honest Funeral Co. is not a funeral home or funeral director. We do not arrange funerals or handle remains. Your family contracts directly with the funeral home you choose.";
