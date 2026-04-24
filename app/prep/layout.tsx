import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arrangement Kit",
  description:
    "Line-item fair prices, scripts for declining upsells, and the one-page cheat sheet to bring to the funeral home.",
};

export default function PrepLayout({ children }: { children: React.ReactNode }) {
  return children;
}
