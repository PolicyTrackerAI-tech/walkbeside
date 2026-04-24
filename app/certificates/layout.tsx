import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How many death certificates to order",
  description:
    "A family usually needs 10–15 certified death certificates. Here's exactly where each one goes.",
};

export default function CertificatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
