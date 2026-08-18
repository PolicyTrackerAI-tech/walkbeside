import type { Metadata } from "next";
import { RoleDisclaimer } from "@/components/RoleDisclaimer";

export const metadata: Metadata = {
  title: "Have us contact funeral homes — free",
  description:
    "Funeral-home outreach as your authorized advocate: itemized General Price List requests under the FTC Funeral Rule, options side by side. Free to families, always.",
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
