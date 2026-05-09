import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { Notifications } from "./Notifications";

export const metadata: Metadata = {
  title: "Notifications hub",
  description:
    "Keep track of who's been told and who still needs to be. Hand the list to a friend so you don't have to make every call yourself.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requirePaid("/notifications");
  return <Notifications />;
}
