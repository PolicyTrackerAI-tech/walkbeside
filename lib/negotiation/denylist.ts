/**
 * Hardcoded email denylist for funeral-home outreach.
 *
 * Checked before any outbound send (outreach, selection, or family-relay).
 * Survives DB resets, re-imports, and accidental directory edits — so any
 * address we know we should never email lives here even if the
 * funeral_homes row gets recreated or `active` flips back to true.
 *
 * Use this for:
 * - SaaS / generic domains that snuck through Outscraper cleanup (whole
 *   domains go in RAW_DOMAIN_DENYLIST below)
 * - Personal emails that asked us to stop (defense in depth on top of the
 *   funeral_homes.active=false opt-out flag)
 * - Test addresses we never want to hit in production
 *
 * Add new entries below. All entries are matched case-insensitively.
 */

const RAW_DENYLIST: ReadonlyArray<string> = [
  // Individual addresses: populate as the founder flags addresses to block.
];

/**
 * Whole domains that are never a funeral home's own inbox: directories,
 * marketplaces, lead-generation and cremation-broker networks that sell
 * through partner homes, and funeral-home SaaS vendors. Contacting one as if
 * it were a home would be wrong on its face. Under Virginia's GD 65-4 frame, a
 * broker "seeking to contract for funeral services" is itself the
 * unlicensed-third-party problem (docs/legal/VA_CLEARANCE_DRAFT.md §4.3).
 * The vetted gate is the primary control; this is defense in depth if a
 * scraped address slips through import.
 *
 * NOT listed on purpose: dignitymemorial.com. SCI's licensed homes (for
 * example Murphy Funeral Homes, Arlington) use it as their own domain.
 */
const RAW_DOMAIN_DENYLIST: ReadonlyArray<string> = [
  "parting.com",
  "funeralocity.com",
  "everloved.com",
  "us-funerals.com",
  "funeralhomedirectories.com",
  "funeroso.com",
  "legacy.com",
  "dfsmemorials.com",
  "legacycremationservices.com",
  "consolidatedfuneralservices.com",
  "runcfs.com",
];

const EMAIL_DENYLIST: ReadonlySet<string> = new Set(
  RAW_DENYLIST.map((e) => e.toLowerCase()),
);
const DOMAIN_DENYLIST: ReadonlySet<string> = new Set(
  RAW_DOMAIN_DENYLIST.map((d) => d.toLowerCase()),
);

export function isEmailDenylisted(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (EMAIL_DENYLIST.has(e)) return true;
  const domain = e.slice(e.lastIndexOf("@") + 1);
  // Match the domain or any subdomain of it (mail.parting.com), never a
  // lookalike suffix (notparting.com).
  for (const d of DOMAIN_DENYLIST) {
    if (domain === d || domain.endsWith(`.${d}`)) return true;
  }
  return false;
}
