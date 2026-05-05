import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/share/[id]
 *
 * Returns the snapshot payload for a share link, or 404 if expired/missing.
 * Marks opened_at on first read (best-effort, ignored if it fails).
 *
 * No auth — RLS allows select on non-expired rows.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  // Basic UUID shape check.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("share_links")
    .select("id, payload, opened_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Best-effort: mark opened_at on first read. Don't fail the request if
  // the update is denied (e.g., simultaneous reads, RLS edge cases).
  if (!data.opened_at) {
    await supabase
      .from("share_links")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({
    id: data.id,
    payload: data.payload,
  });
}
