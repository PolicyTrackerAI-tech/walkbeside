import type { Metadata } from "next";
import { Memorial } from "./Memorial";

export const metadata: Metadata = {
  title: "Memorial program helper",
  description:
    "Build the print-ready program for the service. Fill in what you know, skip what you haven't decided. Print or email to the funeral home.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return <Memorial />;
}
