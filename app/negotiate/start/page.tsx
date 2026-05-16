import type { Metadata } from "next";
import { requireSignedIn } from "@/lib/require-signed-in";
import { Wizard } from "./Wizard";

export const metadata: Metadata = {
  title: "Have us call funeral homes for you",
  robots: { index: false, follow: false },
};

export default async function Page() {
  // Free to start outreach. V2 canonical model charges $199 only when
  // the family picks a home we presented.
  await requireSignedIn("/negotiate/start");
  return <Wizard />;
}
