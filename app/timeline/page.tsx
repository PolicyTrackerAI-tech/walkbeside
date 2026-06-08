import type { Metadata } from "next";
import { Timeline } from "./Timeline";

export const metadata: Metadata = {
  title: "Service-day timeline",
  description:
    "A printable timeline for the service day. Helps everyone know where to be and when — out-of-town family, pallbearers, officiant, caterer.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return <Timeline />;
}
