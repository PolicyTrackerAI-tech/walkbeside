/**
 * The patch a re-import applies to a funeral home that already exists.
 *
 * Re-running an import must only ADD what the file knows. Before this, the
 * importer wrote the whole row back, so a blank CSV cell overwrote a value
 * set later by hand: an email added in /admin/vetting went back to null
 * (the home became uncontactable), and `active: true` revived a home the
 * bounce/complaint webhook had deactivated. So:
 *   - a null or empty field in the file never overwrites the database, and
 *   - `active` is set only on insert, never on update.
 * vetted/vetted_at/vetted_by are never in an import row at all.
 */
const NEVER_ON_UPDATE = new Set(["active", "vetted", "vetted_at", "vetted_by"]);

/**
 * @param {Record<string, unknown>} row
 * @param {Date} [now]
 * @returns {Record<string, unknown>}
 */
export function homeUpdatePatch(row, now = new Date()) {
  /** @type {Record<string, unknown>} */
  const patch = {};
  for (const [key, value] of Object.entries(row)) {
    if (NEVER_ON_UPDATE.has(key)) continue;
    if (value === null || value === undefined || value === "") continue;
    patch[key] = value;
  }
  patch.updated_at = now.toISOString();
  return patch;
}
