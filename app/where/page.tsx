import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SCENARIO_LABELS, type Scenario } from "@/lib/scenarios";

/**
 * Screen 2 — Where did they pass away?
 * Four large cards. Nothing else. No nav, no login.
 */
const OPTIONS: { key: Scenario; sub: string }[] = [
  { key: "hospital", sub: "Death has been pronounced or is about to be." },
  { key: "home-expected", sub: "Hospice was involved or it was anticipated." },
  { key: "home-unexpected", sub: "It just happened. You may not have called 911 yet." },
  { key: "elsewhere", sub: "Workplace, public space, away from home." },
];

export default function WherePage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="px-5 pt-6">
        <Brand />
      </div>

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            Where did they pass away?
          </h1>
          <p className="text-ink-soft mb-10">
            This tells us what to help with first. There&rsquo;s no wrong answer.
          </p>

          <div className="grid gap-4">
            {OPTIONS.map((opt) => (
              <Link
                key={opt.key}
                href={`/guidance/${opt.key}`}
                className="block bg-surface border border-border hover:border-primary hover:bg-primary-soft rounded-2xl p-6 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-serif text-xl text-ink group-hover:text-primary-deep mb-1">
                      {SCENARIO_LABELS[opt.key]}
                    </div>
                    <div className="text-sm text-ink-soft">{opt.sub}</div>
                  </div>
                  <div className="text-primary text-xl pt-1" aria-hidden>
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
