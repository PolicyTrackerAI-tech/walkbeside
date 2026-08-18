import { NextResponse } from "next/server";
import { serviceClient, shareAvailable, isUuid } from "../service";

/**
 * GET /api/share/[id]
 *
 * Returns the snapshot payload for a share link, or 404 if expired/missing.
 * Marks opened_at on first read (best-effort, ignored if it fails).
 *
 * No account required. After audit A8 (2026-08-18) share_links is
 * service-role-only, so this route reads through the service client and
 * scopes strictly to the one row by id + expiry — the UUID is the
 * capability, and the table can no longer be enumerated with the anon key.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!shareAvailable())
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id } = await ctx.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("share_links")
    .select("id, payload, opened_at, expires_at")
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Best-effort: mark opened_at on first read. Don't fail the request if
  // the update is denied (e.g., simultaneous reads).
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
