import type { Metadata } from "next";
import { CashAdvanceCheck } from "./CashAdvanceCheck";

export const metadata: Metadata = {
  title: "Verify cash-advance charges against the vendor's receipt | Honest Funeral",
  description:
    "Flowers, the obituary, death certificates — items the funeral home buys on your behalf. Enter what you were billed next to what the vendor's own receipt says and see the exact documented difference, plus a calm message asking for it to be explained or adjusted. Free, on your device only.",
  alternates: { canonical: "/cash-advance-check" },
};

export default function Page() {
  return <CashAdvanceCheck />;
}
