import { NextResponse } from "next/server";
import { z } from "zod";
import { requireServer } from "@/lib/env";
import { findHomesFromDirectory } from "@/lib/negotiation/directory";
import {
  ADVOCATE_NAME,
  buildFamilyLabel,
  buildOutreachEmail,
  outreachFromAddress,
  outreachReplyTo,
} from "@/lib/negotiation/email-body";

const Body = z.object({
  senderFirstName: z.string().min(1).max(60),
  senderLastName: z.string().max(60).optional(),
  timing: z.string().max(120).default("within the next week"),
  zip: z.string().min(3).max(10).optional(),
  homeName: z.string().max(120).optional(),
  homeEmail: z.string().email().max(200).optional(),
});

const PLACEHOLDER_NEG_ID = "preview-00000000-0000-0000-0000-000000000000";
const PLACEHOLDER_AUTH_ID = "WB-PREVIEW";

export async function POST(req: Request) {
  const key = req.headers.get("x-admin-preview-key");
  if (key !== requireServer("ADMIN_PREVIEW_KEY")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const ctx = parsed.data;

  let homeName = ctx.homeName;
  let homeEmail = ctx.homeEmail;
  let homeSource: "input" | "directory" | "placeholder" = "input";

  if (!homeName) {
    if (!ctx.zip) {
      return NextResponse.json(
        { error: "zip_or_home_required" },
        { status: 400 },
      );
    }
    const homes = await findHomesFromDirectory(ctx.zip, 1);
    if (homes.length > 0) {
      homeName = homes[0].name;
      homeEmail = homes[0].email;
      homeSource = "directory";
    } else {
      homeName = "Sample Funeral Home";
      homeEmail = "office@sample-funeral.example";
      homeSource = "placeholder";
    }
  }

  const familyLabel = buildFamilyLabel(ctx.senderFirstName, ctx.senderLastName);
  const { subject, body } = buildOutreachEmail({
    familyLabel,
    authorizationId: PLACEHOLDER_AUTH_ID,
    advocateName: ADVOCATE_NAME,
    timing: ctx.timing,
    homeEmail: homeEmail || "preview@example.com",
  });

  return NextResponse.json({
    from: outreachFromAddress(),
    to: homeEmail,
    replyTo: outreachReplyTo(PLACEHOLDER_NEG_ID),
    subject,
    body,
    home: { name: homeName, email: homeEmail, source: homeSource },
    authorizationIdPlaceholder: PLACEHOLDER_AUTH_ID,
  });
}
