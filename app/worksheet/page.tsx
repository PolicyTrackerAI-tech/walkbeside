import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Worksheet } from "./Worksheet";

export const metadata: Metadata = {
  title: "Pre-meeting preferences worksheet",
  description:
    "Walk into the funeral home knowing what you want. Print this and bring it. The director sees you brought it and the meeting changes.",
};

export default function WorksheetPage() {
  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader
        rightSlot={<BackLink defaultHref="/planning" defaultLabel="← Planning" />}
      />

      <section className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-12">
          <div className="no-print mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
              Pre-meeting preferences worksheet
            </h1>
            <p className="text-lg text-ink-soft mb-2">
              Fill this out before you walk into the funeral home. Print it.
              Bring it. The director will see you brought it &mdash; and that
              alone changes the meeting.
            </p>
            <p className="text-sm text-ink-muted">
              Your answers save to this browser only. Nothing is sent. No
              account needed.
            </p>
          </div>

          <Worksheet />
        </div>
      </section>
    </main>
  );
}
