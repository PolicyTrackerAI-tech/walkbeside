/**
 * Pure helpers for scripts/dmv-scoreboard.mjs: turn the DMV tracker
 * (supabase/seed/dmv-tracker.csv) and roster (dmv-homes.draft.csv) into a
 * per-area scoreboard and the founder's next-up queue. No network, no DB.
 */

/** Minimal RFC-4180 reader (quoted fields, "" escapes). @param {string} text */
export function parseCsv(text) {
  /** @type {string[][]} */
  const rows = [];
  /** @type {string[]} */
  let row = [];
  let field = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body
    .filter((r) => r.length > 1)
    .map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

/** The n≥5 publish gate (lib/partner-report.ts SMALL_SAMPLE_THRESHOLD). */
export const PUBLISH_N = 5;

const STATUSES = ["reviewed", "held_stale", "link_found", "requested", "site_check", "no_site_known", "none_available"];

/**
 * @typedef {{ area: string, homes: number, needed: number, reviewed: number,
 *   held_stale: number, link_found: number, requested: number,
 *   site_check: number, no_site_known: number, none_available: number }} AreaRow
 */

/**
 * Per benchmark area: how many homes sit at each price-list status, and how
 * many more loadable lists the area needs to reach the publish gate.
 * @param {Record<string, string>[]} tracker
 * @returns {AreaRow[]}
 */
export function areaScoreboard(tracker) {
  /** @type {Map<string, Record<string, number>>} */
  const byArea = new Map();
  for (const r of tracker) {
    const a = byArea.get(r.benchmark_area) ?? Object.fromEntries([["homes", 0], ...STATUSES.map((s) => [s, 0])]);
    a.homes += 1;
    a[r.gpl_status] = (a[r.gpl_status] ?? 0) + 1;
    byArea.set(r.benchmark_area, a);
  }
  return [...byArea.entries()]
    .map(([area, c]) => /** @type {AreaRow} */ ({ area, ...c, needed: Math.max(0, PUBLISH_N - c.reviewed) }))
    .sort((x, y) => y.homes - x.homes || x.area.localeCompare(y.area));
}

// Cheapest action first: a posted list is one click, a held list one
// confirmation, a known site a look-then-ask, no site a phone call.
const ACTION_ORDER = { held_stale: 0, link_found: 1, site_check: 2, no_site_known: 3 };
const ACTION = {
  held_stale: "confirm the list on file is still current",
  link_found: "open the posted list and review it",
  site_check: "look for a posted list, else send the request email",
  no_site_known: "call and ask for the list by email",
};

/**
 * The founder's next-up queue, for areas still short of the gate: DC first
 * (its 10/16 deadline), then the cheapest action first, then the area
 * furthest from the gate.
 * @param {Record<string, string>[]} tracker
 * @param {Record<string, string>[]} roster
 * @param {{ limit?: number, firstArea?: string }} [opts]
 */
export function nextUp(tracker, roster, { limit = 15, firstArea = "Washington DC" } = {}) {
  const phone = new Map(roster.map((r) => [`${r.name.toLowerCase()}|${r.zip}`, r.phone]));
  const need = new Map(areaScoreboard(tracker).map((a) => [a.area, a.needed]));
  return tracker
    .filter((r) => r.gpl_status in ACTION_ORDER && (need.get(r.benchmark_area) ?? 0) > 0)
    .map((r) => ({
      name: r.name,
      area: r.benchmark_area,
      status: r.gpl_status,
      action: ACTION[/** @type {keyof typeof ACTION} */ (r.gpl_status)],
      where: r.gpl_url || phone.get(`${r.name.toLowerCase()}|${r.zip}`) || "",
    }))
    .sort(
      (x, y) =>
        Number(y.area === firstArea) - Number(x.area === firstArea) ||
        ACTION_ORDER[/** @type {keyof typeof ACTION_ORDER} */ (x.status)] -
          ACTION_ORDER[/** @type {keyof typeof ACTION_ORDER} */ (y.status)] ||
        (need.get(y.area) ?? 0) - (need.get(x.area) ?? 0) ||
        x.name.localeCompare(y.name),
    )
    .slice(0, limit);
}
