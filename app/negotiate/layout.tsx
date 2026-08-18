import type { Metadata } from "next";
import { RoleDisclaimer } from "@/components/RoleDisclaimer";

export const metadata: Metadata = {
  title: "Have us contact funeral homes — free",
  description:
    "We contact funeral homes as your authorized advocate, collect itemized General Price Lists, and bring you the options side by side. Free to families — we contact homes on your behalf at no charge.",
};

export default function NegotiateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The role disclaimer renders persistently under every negotiate surface
  // (start wizard + all per-negotiation pages) — see lib/copy.ts
  // NOT_A_FUNERAL_HOME for why it must stay.
  return (
    <>
      {children}
      <div className="max-w-2xl mx-auto px-5 pb-8 w-full">
        <RoleDisclaimer />
      </div>
    </>
  );
}
