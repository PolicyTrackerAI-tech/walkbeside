import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Family } from "./Family";

export const metadata: Metadata = {
  title: "Family collaboration",
  description:
    "Send your progress to a sibling, adult child, or trusted friend. They pick up where you left off — no account needed on their end.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/family");
  return <Family />;
}
