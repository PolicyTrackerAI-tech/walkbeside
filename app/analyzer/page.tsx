import type { Metadata } from "next";
import { Analyzer } from "./Analyzer";

export const metadata: Metadata = {
  title: "Price-list analyzer",
};

export default function Page() {
  return <Analyzer />;
}
