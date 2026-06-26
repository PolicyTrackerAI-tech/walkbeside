import type { Metadata } from "next";
import { requireSignedIn } from "@/lib/require-signed-in";
import { Wizard } from "./Wizard";

export const metadata: Metadata = {
  title: "Have us call funeral homes for you",
  robots: { index: false, follow: false },
};

export default async function Page() {
  // Free to families — outreach is sent at no charge (dry_run until
  // OUTREACH_LIVE is enabled).
  await requireSignedIn("/negotiate/start");
  return <Wizard />;
}
