import type { Metadata } from "next";
import { HeadstoneVendors } from "./HeadstoneVendors";

export const metadata: Metadata = {
  title: "Monument company directory",
  description:
    "Buy the headstone direct from a monument company. Typically 30–60% less than funeral-home pricing for the same stone. Vetted vendors by metro.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return <HeadstoneVendors />;
}
