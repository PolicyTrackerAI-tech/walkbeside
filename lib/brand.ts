import { PUBLIC } from "./env";

/**
 * The single source of truth for the brand identity. Every NEW surface reads
 * these constants instead of hardcoding the name/domain.
 *
 * NAMING RESOLVED 2026-08-18: the company is "Honest Funeral Co." — the "Co."
 * absorbs the .co TLD, so the domain reads as the name and no rename or
 * domain migration will ever happen (the 2026-07 Open Farewell plan is dead;
 * see docs/BUSINESS_PLAN.md §1). Style rule: `name` (the full name) on
 * formal/first-mention surfaces — page titles, legal pages, invoices, email
 * signatures; `shortName` is acceptable mid-prose after a first mention.
 * Legacy hardcoded "Honest Funeral" literals are the short form, so they are
 * not wrong — sweep them opportunistically, not atomically.
 */
export const BRAND = {
  name: "Honest Funeral Co.",
  shortName: "Honest Funeral",
  domain: "honestfuneral.co",
  url: PUBLIC.appUrl,
  supportEmail: "support@honestfuneral.co",
} as const;
