import { redirect } from "next/navigation";

export const metadata = {
  title: "Your funeral-home outreach",
  robots: { index: false, follow: false },
};

/**
 * The legacy pay-to-send teaser is decommissioned — Honest Funeral is free to
 * families. Outreach is triggered when the family submits /negotiate/start, so
 * this route just forwards to the live status page (keeps old links working).
 */
export default async function NegotiationPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/negotiate/${id}/status`);
}
