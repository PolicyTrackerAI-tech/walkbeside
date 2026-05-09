import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { requirePaid } from "@/lib/require-paid";
import { Worksheet } from "./Worksheet";

export const metadata: Metadata = {
  title: "Pre-meeting preferences worksheet",
  description:
    "Walk into the funeral home knowing what you want. Print this and bring it. The director sees you brought it and the meeting changes.",
};

export default async function WorksheetPage() {
  await requirePaid("/worksheet");
  return <WorksheetView />;
}

function WorksheetView() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={<BackLink defaultHref="/planning" defaultLabel="← Planning" />}
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12">
          <div className="no-print mb-8">
            <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">
              Pre-meeting worksheet
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Walk into the meeting with decisions made.
            </h1>
            <p className="text-lg text-ink-soft mb-2">
              Fill this out before you go to the funeral home. Print
              it. Bring it. The director will see you brought it
              &mdash; and that alone changes the meeting.
            </p>
            <p className="text-sm text-ink-muted">
              Your answers save to this browser only. Nothing is sent.
            </p>
          </div>

          <Worksheet />
        </div>
      </section>
    </main>
  );
}
