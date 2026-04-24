import { redirect } from "next/navigation";
import { isCommercialSuppressed } from "@/lib/suppression";

export default async function NegotiateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isCommercialSuppressed()) redirect("/guidance/home-unexpected");
  return children;
}
