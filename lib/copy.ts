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
