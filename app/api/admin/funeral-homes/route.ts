import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { PUBLIC, requireServer } from "@/lib/env";

/**
 * Admin write endpoint for the funeral-home vetting tool (/admin/vetting).
 * Gated by the same x-admin-preview-key header as the other admin tools and
 * backed by the service-role key (bypasses RLS). Mutations only — the page
 * itself reads directly via service role.
 *
 *   approve → vetted=true,  active=true   (eligible for outreach)
 *   reject  → vetted=true,  active=false  (reviewed, excluded)
 *   reset   → vetted=false, active=true   (back to the pending queue)
 *   save    → email/notes only, no change to vetting status
 */

const SELECT_COLS =
  "id, name, email, phone, address, city, state, zip, google_rating, google_review_count, notes, active, vetted, vetted_at, vetted_by";

const Body = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "reject", "reset", "save"]),
  // email may be a new address, or null to clear it. Omit to leave unchanged.
  email: z.string().email().max(200).nullable().optional(),
  notes: z.string().max(2000).optional(),
  reviewer: z.string().max(80).optional(),
});

export async function PATCH(req: Request) {
  const key = req.headers.get("x-admin-preview-key");
  if (key !== requireServer("ADMIN_PREVIEW_KEY")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const { id, action, email, notes, reviewer } = parsed.data;

  const now = new Date().toISOString();
  const by = (reviewer ?? "admin").trim() || "admin";

  // Build the patch from the action, then layer optional field edits on top.
  const patch: Record<string, unknown> = { updated_at: now };
  if (action === "approve") {
    patch.vetted = true;
    patch.active = true;
    patch.vetted_at = now;
    patch.vetted_by = by;
  } else if (action === "reject") {
    patch.vetted = true;
    patch.active = false;
    patch.vetted_at = now;
    patch.vetted_by = by;
  } else if (action === "reset") {
    patch.vetted = false;
    patch.active = true;
    patch.vetted_at = null;
    patch.vetted_by = null;
  }
  // Field edits apply to every action (including "save").
  if (email !== undefined) patch.email = email;
  if (notes !== undefined) patch.notes = notes;

  const admin = createServiceClient(
    PUBLIC.supabaseUrl,
    requireServer("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data, error } = await admin
    .from("funeral_homes")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, home: data });
}
