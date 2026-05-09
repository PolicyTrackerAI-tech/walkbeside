import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Analyzer } from "./Analyzer";

export const metadata: Metadata = {
  title: "Price-list analyzer",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/analyzer");
  return <Analyzer />;
}
