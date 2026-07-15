import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";
import { requireAdminApi } from "@/lib/admin-auth";
import { fetchBenchmarkRecords } from "@/lib/benchmark-sources";
import { aggregateAllBenchmarks } from "@/lib/benchmark-pipeline";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/partner-report";

/**
 * Promote a metro group to the verified/community DATA tier — the only write
 * path into regional_benchmarks (guardrail #4: never publish a number we
 * can't defend).
 *
 * THE GATE: the request carries no n and no override switch — the body is
 * .strict(), so an unexpected key is rejected outright. The server recomputes
 * n from the same feeds /admin/benchmarks displays and refuses anything under
 * SMALL_SAMPLE_THRESHOLD. This is a founder-clicked publish gate, not an
 * auto-apply; CODE benchmarks (lib/pricing-data.ts) still only change via a
 * reviewed PR.
 */

const Body = z
  .object({
    scope: z.enum(["zip3", "metro", "state"]),
    scopeValue: z.string().min(1).max(120),
    lineItemId: z.string().min(1).max(120),
    // fair_*_cents columns are int4 — an unbounded dollar value would
    // overflow at insert time; $1M is far above any defensible line item.
    fairLowDollars: z.number().positive().finite().max(1_000_000),
    fairHighDollars: z.number().positive().finite().max(1_000_000),
    predatoryAtDollars: z.number().positive().finite().max(1_000_000).optional(),
    tier: z.enum(["verified", "community"]),
    sourcesNote: z.string().min(3).max(2000),
    version: z
      .string()
      .regex(/^20\d{2}-\d{2}-v\d+$/)
      .default("2026-07-v1"),
  })
  .strict()
  .refine((b) => b.fairLowDollars < b.fairHighDollars, {
    message: "fair low must be below fair high",
  })
  .refine(
    (b) =>
      b.predatoryAtDollars === undefined ||
      b.fairHighDollars < b.predatoryAtDollars,
    { message: "predatory-at must sit above fair high" },
  );

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const body = parsed.data;

  // The pipeline groups by zip-regions metro label; there is no honest n to
  // recompute for a state or zip3 group yet, so those scopes can't publish.
  if (body.scope !== "metro") {
    return NextResponse.json(
      {
        error:
          "promotion is metro-scoped this week: benchmarks aggregate by metro label",
      },
      { status: 422 },
    );
  }

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // n is recomputed server-side from the same feeds the admin page shows —
  // whatever the client claims is irrelevant (it can't even send an n).
  const { analyses, outreach } = await fetchBenchmarkRecords(admin);
  const group = aggregateAllBenchmarks(analyses, outreach).find(
    (g) => g.itemId === body.lineItemId && g.region === body.scopeValue,
  );
  if (!group || group.n < SMALL_SAMPLE_THRESHOLD) {
    return NextResponse.json(
      {
        error: `n=${group?.n ?? 0} below the n≥${SMALL_SAMPLE_THRESHOLD} publish gate`,
      },
      { status: 422 },
    );
  }

  // Insert BEFORE retiring: if the insert fails (e.g. a same-version 409),
  // the currently published row must stay active — retiring first would leave
  // the key with zero active rows and silently unpublish the verified range.
  // The brief two-active-rows window is safe: lib/benchmarks-store.ts picks
  // the latest effective_at within a scope.
  const { data, error } = await admin
    .from("regional_benchmarks")
    .insert({
      scope: body.scope,
      scope_value: body.scopeValue,
      line_item_id: body.lineItemId,
      fair_low_cents: Math.round(body.fairLowDollars * 100),
      fair_high_cents: Math.round(body.fairHighDollars * 100),
      predatory_at_cents:
        body.predatoryAtDollars === undefined
          ? null
          : Math.round(body.predatoryAtDollars * 100),
      tier: body.tier,
      n_data_points: group.n,
      sources: [
        {
          name: body.sourcesNote,
          kind: "founder-note",
          accessed: new Date().toISOString().slice(0, 10),
        },
      ],
      version: body.version,
      active: true,
    })
    .select("id")
    .single();
  if (error) {
    // 23505 = unique (scope, scope_value, line_item_id, version). Nothing was
    // touched: the previously published row is still the active one.
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: `version ${body.version} was already promoted for this item — bump the version to publish again`,
        },
        { status: 409 },
      );
    }
    // Raw Postgres messages never reach the response body.
    console.error("benchmark promote insert failed", error);
    return NextResponse.json(
      { error: "promotion failed — check server logs" },
      { status: 500 },
    );
  }
  const newId = (data as { id: string } | null)?.id;

  // One active row per (scope, scope_value, line_item_id); history stays
  // queryable — prior versions flip inactive, they are never deleted.
  const retire = admin
    .from("regional_benchmarks")
    .update({ active: false })
    .eq("scope", body.scope)
    .eq("scope_value", body.scopeValue)
    .eq("line_item_id", body.lineItemId)
    .eq("active", true);
  const { error: retireErr } = await (newId
    ? retire.neq("id", newId)
    : retire);
  if (retireErr) {
    // The new row is already active and the store picks the latest
    // effective_at, so reads stay correct; the leftover sibling is a hygiene
    // problem worth surfacing, not an unpublish.
    console.error("benchmark promote retire failed", retireErr);
    return NextResponse.json(
      { error: "promotion failed — check server logs" },
      { status: 500 },
    );
  }
  return NextResponse.json({
    ok: true,
    id: newId,
    n: group.n,
  });
}
