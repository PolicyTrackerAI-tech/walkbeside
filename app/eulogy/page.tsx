import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Eulogy } from "./Eulogy";

export const metadata: Metadata = {
  title: "Eulogy helper",
  description:
    "Eight short questions. We draft a ready-to-read eulogy you can edit, time, and bring to the service.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/eulogy");
  return <Eulogy />;
}
