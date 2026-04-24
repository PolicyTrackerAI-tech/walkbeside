import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isCommercialSuppressed } from "@/lib/suppression";

export const metadata: Metadata = {
  title: "Fair funeral prices for your zip code",
  description:
    "See the regional fair range for direct cremation, burial, or memorial service. Free. Takes about three minutes.",
};

export default async function PricesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isCommercialSuppressed()) redirect("/guidance/home-unexpected");
  return children;
}
