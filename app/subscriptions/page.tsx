import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Subscriptions } from "./Subscriptions";

export const metadata: Metadata = {
  title: "Subscription finder",
  description:
    "Paste a bank or credit-card statement. We extract every recurring charge so the family can cancel what they don't need.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/subscriptions");
  return <Subscriptions />;
}
