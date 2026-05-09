import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Obituary } from "./Obituary";

export const metadata: Metadata = {
  title: "Obituary helper",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/obituary");
  return <Obituary />;
}
