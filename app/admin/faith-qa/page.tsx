import type { Metadata } from "next";
import { adminAllowlistConfigured } from "@/lib/admin";
import { requireAdminPage } from "@/lib/admin-auth";
import { FaithQAReview } from "./FaithQAReview";

export const metadata: Metadata = {
  title: "Faith content QA review",
  robots: { index: false, follow: false },
};

/**
 * Internal QA surface to review every faith claim in lib/faith-traditions.ts
 * in one pass before it ships — a place for a domain expert (e.g. a funeral
 * director or clergy advisor) to validate accuracy. Not linked from anywhere
 * public; gated to logged-in admins.
 */
export default async function FaithQAPage() {
  await requireAdminPage("/admin/faith-qa");
  return <FaithQAReview allowlistConfigured={adminAllowlistConfigured()} />;
}
