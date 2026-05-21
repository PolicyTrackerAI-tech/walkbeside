/**
 * Hardcoded email denylist for funeral-home outreach.
 *
 * Checked before any outbound send (outreach, selection, or family-relay).
 * Survives DB resets, re-imports, and accidental directory edits — so any
 * address we know we should never email lives here even if the
 * funeral_homes row gets recreated or `active` flips back to true.
 *
 * Use this for:
 * - SaaS / generic domains that snuck through Outscraper cleanup
 *   (consolidatedfuneralservices.com, runcfs.com, etc.)
 * - Personal emails that asked us to stop (defense in depth on top of the
 *   funeral_homes.active=false opt-out flag)
 * - Test addresses we never want to hit in production
 *
 * Add new entries below. All entries are matched case-insensitively.
 */

const RAW_DENYLIST: ReadonlyArray<string> = [
  // Examples / placeholders — populate as Sister flags addresses to block.
  // "office@consolidatedfuneralservices.com",
  // "info@runcfs.com",
];

const EMAIL_DENYLIST: ReadonlySet<string> = new Set(
  RAW_DENYLIST.map((e) => e.toLowerCase()),
);

export function isEmailDenylisted(email: string | null | undefined): boolean {
  if (!email) return false;
  return EMAIL_DENYLIST.has(email.toLowerCase());
}
