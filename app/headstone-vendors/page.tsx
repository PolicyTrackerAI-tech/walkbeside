import type { Metadata } from "next";
import { HeadstoneVendors } from "./HeadstoneVendors";

export const metadata: Metadata = {
  title: "Monument company directory",
  description:
    "Buy the headstone direct from a monument company — often meaningfully less than the funeral-home price for the same stone. Companies to start from, plus how to find one your cemetery approves.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return <HeadstoneVendors />;
}
