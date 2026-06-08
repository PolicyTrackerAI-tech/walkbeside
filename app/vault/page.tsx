import type { Metadata } from "next";
import { Vault } from "./Vault";

export const metadata: Metadata = {
  title: "Document vault",
  description:
    "Track every document the family needs — death certificates, will, deeds, titles, insurance policies. Note where each one is and what's still missing.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return <Vault />;
}
