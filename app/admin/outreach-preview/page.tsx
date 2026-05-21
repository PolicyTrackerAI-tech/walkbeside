import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewForm } from "./PreviewForm";

export const metadata: Metadata = {
  title: "Outreach Preview",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const sp = await searchParams;
  const expected = process.env.ADMIN_PREVIEW_KEY;
  const provided = (sp.key ?? "").trim();
  if (!expected || provided !== expected) {
    notFound();
  }
  return <PreviewForm previewKey={provided} />;
}
