import type { Metadata } from "next";
import { Eulogy } from "./Eulogy";

export const metadata: Metadata = {
  title: "Eulogy helper",
  description:
    "Eight short questions. We draft a ready-to-read eulogy you can edit, time, and bring to the service.",
};

export default function Page() {
  return <Eulogy />;
}
