import type { Metadata } from "next";
import { Briefing } from "./Briefing";

export const metadata: Metadata = {
  title: "The family briefing — everything on one page",
  description:
    "One printable page rolling up where everything stands: the plan and point person, the checklist with who's on what, who's been told, and where every document is. For the out-of-town relative, the folder, or the fridge.",
  alternates: { canonical: "/briefing" },
};

export default function Page() {
  return <Briefing />;
}
