import type { Metadata } from "next";
import { PreviewForm } from "./PreviewForm";
import { requireAdminPage } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Outreach Preview",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requireAdminPage("/admin/outreach-preview");
  return <PreviewForm />;
}
