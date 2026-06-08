import type { Metadata } from "next";
import { Obituary } from "./Obituary";

export const metadata: Metadata = {
  title: "Obituary helper",
};

export default function Page() {
  return <Obituary />;
}
