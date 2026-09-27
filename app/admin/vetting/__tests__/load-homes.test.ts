import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadVettingHomes, VETTING_SELECT_COLS } from "../load-homes";
import type { VettingHome } from "../VettingClient";

const home = (i: number): VettingHome => ({
  id: `id-${String(i).padStart(5, "0")}`,
  name: `Home ${i}`,
  email: null,
  phone: null,
  address: null,
  city: "City",
  state: i < 1200 ? "GA" : "VA",
  zip: "22101",
  google_rating: null,
  google_review_count: null,
  notes: null,
  active: true,
  vetted: false,
  vetted_at: null,
  vetted_by: null,
});

/**
 * A stand-in for the Supabase query builder that behaves like PostgREST:
 * whatever range is asked for, a response never carries more than 1,000
 * rows. Records every query so the test can check order and ranges.
 */
function fakeClient(rows: VettingHome[], failAtOffset?: number) {
  const queries: { table: string; cols: string; orders: string[]; range: [number, number] }[] = [];
  const client = {
    from(table: string) {
      let cols = "";
      const orders: string[] = [];
      const builder = {
        select(c: string) {
          cols = c;
          return builder;
        },
        order(col: string) {
          orders.push(col);
          return builder;
        },
        async range(from: number, to: number) {
          queries.push({ table, cols, orders: [...orders], range: [from, to] });
          if (from === failAtOffset) {
            return { data: null, error: { message: "canceling statement due to statement timeout" } };
          }
          const end = Math.min(to + 1, from + 1000);
          return { data: rows.slice(from, end), error: null };
        },
      };
      return builder;
    },
  };
  return { client: client as unknown as SupabaseClient, queries };
}

describe("loadVettingHomes (the vetting page's 1,000-row cap)", () => {
  it("loads every home when the directory is past 1,000 rows", async () => {
    const rows = Array.from({ length: 1699 }, (_, i) => home(i));
    const { client, queries } = fakeClient(rows);
    const result = await loadVettingHomes(client);
    expect(result.error).toBeNull();
    expect(result.homes).toHaveLength(1699);
    // The rows past the first 1,000 (all of "VA" here) make it through.
    expect(result.homes.filter((h) => h.state === "VA")).toHaveLength(499);
    expect(queries.map((q) => q.range)).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  it("reads funeral_homes in a stable order that ends on the unique id", async () => {
    const { client, queries } = fakeClient([home(1)]);
    await loadVettingHomes(client);
    expect(queries[0].table).toBe("funeral_homes");
    expect(queries[0].cols).toBe(VETTING_SELECT_COLS);
    expect(queries[0].orders).toEqual(["state", "city", "name", "id"]);
  });

  it("asks once more after an exactly-full last page, then stops", async () => {
    const rows = Array.from({ length: 2000 }, (_, i) => home(i));
    const { client, queries } = fakeClient(rows);
    const result = await loadVettingHomes(client);
    expect(result.homes).toHaveLength(2000);
    expect(queries).toHaveLength(3);
  });

  it("fails the whole load, with the database's message, if any page errors", async () => {
    const rows = Array.from({ length: 1699 }, (_, i) => home(i));
    const { client } = fakeClient(rows, 1000);
    const result = await loadVettingHomes(client);
    // Never a partial list shown as the whole directory.
    expect(result.homes).toEqual([]);
    expect(result.error).toBe("canceling statement due to statement timeout");
  });
});
