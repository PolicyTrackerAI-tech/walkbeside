import { PUBLIC } from "./env";

/**
 * The single source of truth for the brand identity. Every NEW surface reads
 * these constants instead of hardcoding the name/domain — so Rename Day
 * (Honest Funeral → Open Farewell, scheduled Mon Jul 27, see
 * docs/NAMING_SPRINT_2026-07.md §5) is one file plus a grep of the legacy
 * literals, not an archaeology dig. Existing hardcoded strings are swept in
 * one atomic pass on Rename Day itself — do not migrate them piecemeal.
 */
export const BRAND = {
  name: "Honest Funeral",
  domain: "honestfuneral.co",
  url: PUBLIC.appUrl,
  supportEmail: "support@honestfuneral.co",
} as const;
