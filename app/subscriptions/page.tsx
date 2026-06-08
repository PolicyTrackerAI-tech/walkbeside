import type { Metadata } from "next";
import { Subscriptions } from "./Subscriptions";

export const metadata: Metadata = {
  title: "Subscription finder",
  description:
    "Paste a bank or credit-card statement. We extract every recurring charge so the family can cancel what they don't need.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return <Subscriptions />;
}
