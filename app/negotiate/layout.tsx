import type { Metadata } from "next";
import { isCommercialSuppressed } from "@/lib/suppression";
import { CommercialSuppressionNotice } from "@/components/CommercialSuppressionNotice";

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
  if (await isCommercialSuppressed()) {
    return <CommercialSuppressionNotice returnTo="/negotiate/start" />;
  }
  return children;
}
