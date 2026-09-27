import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";
import { PUBLISH_N, areaScoreboard, nextUp, parseCsv } from "../lib/dmv-scoreboard.mjs";

const row = (name: string, area: string, gpl_status: string, extra: Record<string, string> = {}) => ({
  name,
  zip: "20001",
  benchmark_area: area,
  gpl_status,
  gpl_url: "",
  ...extra,
});

describe("dmv scoreboard", () => {
  it("uses the product's own publish gate", () => {
    expect(PUBLISH_N).toBe(SMALL_SAMPLE_THRESHOLD);
  });

  it("counts homes by status per area and what each area still needs", () => {
    const board = areaScoreboard([
      row("A", "Washington DC", "reviewed"),
      row("B", "Washington DC", "link_found"),
      row("C", "Arlington", "site_check"),
    ]);
    expect(board[0]).toMatchObject({ area: "Washington DC", homes: 2, reviewed: 1, link_found: 1, needed: 4 });
    expect(board[1]).toMatchObject({ area: "Arlington", homes: 1, site_check: 1, needed: 5 });
  });

  it("queues DC first, the cheapest action first, and skips areas already at the gate", () => {
    const full = Array.from({ length: 5 }, (_, i) => row(`Done ${i}`, "Bethesda/Rockville", "reviewed"));
    const queue = nextUp(
      [
        ...full,
        row("Bethesda extra", "Bethesda/Rockville", "link_found"),
        row("Arl site", "Arlington", "site_check"),
        row("Arl link", "Arlington", "link_found", { gpl_url: "https://example.com/gpl" }),
        row("DC phone", "Washington DC", "no_site_known"),
        row("DC held", "Washington DC", "held_stale"),
      ],
      [{ name: "DC phone", zip: "20001", phone: "(202) 555-0100" }],
      { limit: 10 },
    );
    expect(queue.map((q) => q.name)).toEqual(["DC held", "DC phone", "Arl link", "Arl site"]);
    expect(queue[1].where).toBe("(202) 555-0100");
    expect(queue[2].where).toBe("https://example.com/gpl");
  });

  it("reads the committed tracker: every home is counted once", () => {
    const tracker = parseCsv(readFileSync(join(process.cwd(), "supabase/seed/dmv-tracker.csv"), "utf8"));
    const total = areaScoreboard(tracker).reduce((s, a) => s + a.homes, 0);
    expect(total).toBe(tracker.length);
  });
});
