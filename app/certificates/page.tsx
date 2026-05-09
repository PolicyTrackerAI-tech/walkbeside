import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Certificates } from "./Certificates";

export const metadata: Metadata = {
  title: "Death certificate calculator",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/certificates");
  return <Certificates />;
}
