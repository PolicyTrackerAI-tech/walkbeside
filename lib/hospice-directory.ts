import { cache } from "react";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";

/**
 * Server-only reads + pure aggregates over the CMS hospice directory
 * (public.hospices — RLS deny-all, so reads go through the service role,
 * mirroring app/api/hospices/search/route.ts). Never import this from a
 * client component.
 *
 * Every read degrades to null on failure: the pages render an honest
 * "directory temporarily unavailable" state and the build never fails.
 */

export interface HospiceRow {
  /** CMS certification number — ZERO-PADDED, possibly alphanumeric STRING
   * ('011500', 'A01640'). Never Number()/parseInt it anywhere. */
  ccn: string;
  /** VERBATIM UPPERCASE from CMS — render through displayHospiceName(). */
  name: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  ownership: string | null;
}

/**
 * The as-of month of the most recent CMS import (scripts/import-hospices.mjs,
 * run 2026-07-20 against Provider Data Catalog dataset yc9t-dgbk). Hardcoded
 * on purpose: the repo automates no refresh, so the pages cite a fixed
 * snapshot and never promise a cadence. Update only when a re-import runs.
 */
export const DIRECTORY_AS_OF = "July 2026";

const SELECT = "ccn, name, city, state, zip, ownership";
/** Supabase caps a single response at 1,000 rows; CA/TX exceed it. */
const PAGE_SIZE = 1000;

function serviceClient() {
  return createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

/**
 * Drain a paginated read: keep fetching fixed-size pages until a short page
 * arrives. Pure over the injected fetcher so the chunking is unit-testable.
 * Any page-level failure (fetcher returns null) fails the whole read — a
 * partial state list rendered as complete would be a lie.
 */
export async function fetchAllPages<T>(
  fetchPage: (offset: number) => Promise<T[] | null>,
  pageSize: number = PAGE_SIZE,
): Promise<T[] | null> {
  const all: T[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await fetchPage(offset);
    if (page === null) return null;
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}

/**
 * All hospices in a state (two-letter uppercase abbr), name-ordered.
 * TRAP (buildsheet §DAY 6): CA/TX exceed the 1,000-row response cap —
 * paginate with .range() until a short page. React cache()-wrapped so
 * generateMetadata and the page body share ONE read per render (the title
 * count can never disagree with the body count).
 */
export const listHospicesByState = cache(
  async (abbr: string): Promise<HospiceRow[] | null> => {
    try {
      const svc = serviceClient();
      return await fetchAllPages<HospiceRow>(async (offset) => {
        const { data, error } = await svc
          .from("hospices")
          .select(SELECT)
          .eq("state", abbr)
          .order("name")
          .order("ccn") // deterministic pagination when names tie
          .range(offset, offset + PAGE_SIZE - 1);
        if (error) return null;
        return (data ?? []) as HospiceRow[];
      });
    } catch {
      return null;
    }
  },
);

/** One hospice by CCN — VERBATIM string match. Null on miss or any error. */
export const getHospiceByCcn = cache(
  async (ccn: string): Promise<HospiceRow | null> => {
    try {
      const svc = serviceClient();
      const { data, error } = await svc
        .from("hospices")
        .select(SELECT)
        .eq("ccn", ccn)
        .maybeSingle();
      if (error) return null;
      return (data as HospiceRow | null) ?? null;
    } catch {
      return null;
    }
  },
);

/**
 * Ownership mix — labels VERBATIM from the column (null/empty → "not
 * reported"), sorted by count desc (category ordering, never facility
 * ranking), ties broken alphabetically for a stable render.
 */
export function summarizeOwnership(
  rows: Pick<HospiceRow, "ownership">[],
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const label = r.ownership?.trim() || "not reported";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export interface CityGroup {
  /** VERBATIM city value (null = the CMS row had no city; rendered last). */
  city: string | null;
  rows: HospiceRow[];
}

/**
 * Group name-sorted rows by VERBATIM city, cities A→Z, the no-city group
 * last. Display casing happens at render (displayHospiceName covers cities);
 * the group key stays raw so anchors/lookups never drift from the data.
 */
export function groupByCity(rows: HospiceRow[]): CityGroup[] {
  const groups = new Map<string, HospiceRow[]>();
  const noCity: HospiceRow[] = [];
  for (const r of rows) {
    if (!r.city || r.city.trim() === "") {
      noCity.push(r);
      continue;
    }
    const list = groups.get(r.city);
    if (list) list.push(r);
    else groups.set(r.city, [r]);
  }
  const sorted: CityGroup[] = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([city, list]) => ({ city, rows: list }));
  if (noCity.length > 0) sorted.push({ city: null, rows: noCity });
  return sorted;
}
