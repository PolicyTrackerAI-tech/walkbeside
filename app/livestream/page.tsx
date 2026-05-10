import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Livestream } from "./Livestream";

export const metadata: Metadata = {
  title: "Live-stream coordinator",
  description:
    "Build a single shareable card for everyone who can't be at the service in person. Platform, URL, dial-in, password, and host contact — print or email once.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/livestream");
  return <Livestream />;
}
