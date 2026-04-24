import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isCommercialSuppressed } from "@/lib/suppression";

export const metadata: Metadata = {
  title: "Advocate outreach",
  description:
    "We contact funeral homes as your authorized advocate, collect itemized General Price Lists, and bring you the options side by side. Flat $249 only if you choose a home we present.",
};

export default async function NegotiateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isCommercialSuppressed()) redirect("/guidance/home-unexpected");
  return children;
}
