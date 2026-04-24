import type { Metadata } from "next";
import { NextThirtyDays } from "./NextThirtyDays";

export const metadata: Metadata = {
  title: "The next 30 days",
  description:
    "A phased checklist for the month after a death: death certificates, notifications, accounts, and the things that quietly matter. Progress saves on your device.",
};

export default function NextThirtyDaysPage() {
  return <NextThirtyDays />;
}
