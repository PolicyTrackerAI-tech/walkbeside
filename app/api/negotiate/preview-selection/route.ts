import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { SERVICE_LABELS, type ServiceType } from "@/lib/pricing-data";
import {
  ADVOCATE_NAME,
  buildSelectionEmail,
  outreachFromAddress,
  outreachReplyTo,
} from "@/lib/negotiation/email-body";

const Body = z.object({
  familyLabel: z.string().min(1).max(120).default("the Alvarez family"),
  homeName: z.string().min(1).max(120).default("Cedar Hill Funeral Home"),
  homeEmail: z
    .string()
    .email()
    .max(200)
    .default("office@cedarhill.example"),
  serviceType: z
    .enum([
      "direct-cremation",
      "cremation-with-service",
      "traditional-burial",
      "graveside-burial",
      "green-burial",
      "aquamation",
      "body-donation",
      "memorial-no-body",
    ])
    .default("direct-cremation"),
  quoteCents: z.number().int().nonnegative().default(199500),
});

const PLACEHOLDER_NEG_ID = "preview-00000000-0000-0000-0000-000000000000";
const PLACEHOLDER_AUTH_ID = "WB-PREVIEW";

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const ctx = parsed.data;

  const serviceLabel =
    SERVICE_LABELS[ctx.serviceType as ServiceType] ?? ctx.serviceType;

  const { subject, body } = buildSelectionEmail({
    familyLabel: ctx.familyLabel,
    homeName: ctx.homeName,
    homeEmail: ctx.homeEmail,
    serviceLabel,
    quoteCents: ctx.quoteCents,
    authorizationId: PLACEHOLDER_AUTH_ID,
    advocateName: ADVOCATE_NAME,
  });

  return NextResponse.json({
    from: outreachFromAddress(),
    to: ctx.homeEmail,
    replyTo: outreachReplyTo(PLACEHOLDER_NEG_ID),
    subject,
    body,
    home: { name: ctx.homeName, email: ctx.homeEmail },
    authorizationIdPlaceholder: PLACEHOLDER_AUTH_ID,
  });
}
