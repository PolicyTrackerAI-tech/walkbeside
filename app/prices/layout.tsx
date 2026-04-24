import type { Metadata } from "next";
import { isCommercialSuppressed } from "@/lib/suppression";
import { CommercialSuppressionNotice } from "@/components/CommercialSuppressionNotice";

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
  if (await isCommercialSuppressed()) {
    return <CommercialSuppressionNotice returnTo="/prices" />;
  }
  return children;
}
