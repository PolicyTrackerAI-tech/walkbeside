import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your saved progress, active cases, and recent lookups.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
