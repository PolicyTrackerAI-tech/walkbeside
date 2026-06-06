import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { adminAllowlistConfigured, isAdminEmail } from "@/lib/admin";
import { FaithQAReview } from "./FaithQAReview";

export const metadata: Metadata = {
  title: "Faith content QA review",
  robots: { index: false, follow: false },
};

/**
 * Internal QA surface for the licensed funeral director cofounder to review
 * every faith claim in lib/faith-traditions.ts in one pass. Not linked from
 * anywhere public; gated to logged-in admins.
 */
export default async function FaithQAPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin/faith-qa");
  if (!isAdminEmail(user.email)) notFound();

  return <FaithQAReview allowlistConfigured={adminAllowlistConfigured()} />;
}
