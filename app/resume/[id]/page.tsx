import type { Metadata } from "next";
import { ResumeClient } from "./ResumeClient";

export const metadata: Metadata = {
  title: "Pick up where she left off",
  description:
    "A family member started this for the funeral arrangements. Pick up where they left off — their answers are restored on this device.",
  // Don't index resume URLs.
  robots: { index: false, follow: false },
};

export default async function ResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResumeClient id={id} />;
}
