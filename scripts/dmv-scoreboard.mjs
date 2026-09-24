/**
 * DMV price-list scoreboard: where each benchmark area stands against the
 * n≥5 publish gate, and the next homes to work, cheapest action first.
 *
 * Reads only the committed seed files; touches no network or database.
 *
 * Usage: npm run dmv:scoreboard [-- --limit=25]
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PUBLISH_N, areaScoreboard, nextUp, parseCsv } from "./lib/dmv-scoreboard.mjs";

const root = process.cwd();
const read = (p) => parseCsv(readFileSync(join(root, p), "utf8"));
const tracker = read("supabase/seed/dmv-tracker.csv");
const roster = read("supabase/seed/dmv-homes.draft.csv");
const limit = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 15);

const pad = (s, n) => String(s).padEnd(n);
const num = (s, n = 7) => String(s).padStart(n);

console.log(`\nDMV price lists by benchmark area (publishes at n≥${PUBLISH_N} loaded lists per item)\n`);
console.log(
  pad("Area", 40) + num("Homes") + num("Loaded") + num("Held") + num("Link") + num("Check") + num("NoSite") + num("Need"),
);
for (const a of areaScoreboard(tracker)) {
  console.log(
    pad(a.area, 40) +
      num(a.homes) +
      num(a.reviewed) +
      num(a.held_stale) +
      num(a.link_found) +
      num(a.site_check) +
      num(a.no_site_known) +
      num(a.needed),
  );
}

console.log(`\nNext up (${limit}):\n`);
for (const [i, r] of nextUp(tracker, roster, { limit }).entries()) {
  console.log(`${num(i + 1, 3)}. ${r.name} (${r.area}): ${r.action}${r.where ? ` · ${r.where}` : ""}`);
}
console.log(
  "\nRecord progress in supabase/seed/dmv-tracker.csv; how-tos in docs/data/DMV_HOMES_ROSTER_2026-09.md.\n",
);
