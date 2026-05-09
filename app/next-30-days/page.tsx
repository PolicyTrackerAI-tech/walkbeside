import type { Metadata } from "next";
import { requirePaid } from "@/lib/require-paid";
import { NextThirtyDays } from "./NextThirtyDays";

export const metadata: Metadata = {
  title: "The next 30 days",
  description:
    "A phased checklist for the month after a death: death certificates, notifications, accounts, and the things that quietly matter. Progress saves on your device.",
};

export default async function NextThirtyDaysPage() {
  await requirePaid("/next-30-days");
  return <NextThirtyDays />;
}
