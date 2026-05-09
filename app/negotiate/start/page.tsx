import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Wizard } from "./Wizard";

export const metadata: Metadata = {
  title: "Have us call funeral homes for you",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/negotiate/start");
  return <Wizard />;
}
