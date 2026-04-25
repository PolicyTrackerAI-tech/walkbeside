import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fair funeral prices for your zip code",
  description:
    "See the regional fair range for direct cremation, burial, or memorial service. Free. Takes about three minutes.",
};

export default function PricesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
