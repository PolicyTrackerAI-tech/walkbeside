import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SCENARIO_LABELS, type Scenario } from "@/lib/scenarios";

export const metadata: Metadata = {
  title: "What to do right now",
  description:
    "Tell us where the death occurred. We give you the right first steps for your situation — no wrong answer.",
};

/**
 * Screen 2 — Where did they pass away?
 * Four crisis options plus a de-emphasized planning-ahead escape hatch.
 * No nav, no login.
 */
const OPTIONS: { key: Scenario; sub: React.ReactNode }[] = [
  {
    key: "hospital",
    sub: (
      <>
        Death has been <strong className="text-ink">pronounced</strong> or is
        about to be.
      </>
    ),
  },
  {
    key: "home-expected",
    sub: (
      <>
        <strong className="text-ink">Hospice</strong> was involved or it was
        anticipated.
      </>
    ),
  },
  {
    key: "home-unexpected",
    sub: (
      <>
        It just happened. You may not have called{" "}
        <strong className="text-ink">911</strong> yet.
      </>
    ),
  },
  {
    key: "elsewhere",
    sub: (
      <>
        <strong className="text-ink">Workplace</strong>, public space, away
        from home.
      </>
    ),
  },
];

const PLANNING_HREF = "/planning";

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
          <p className="text-ink-soft mb-6">
            This tells us what to help with first. There&rsquo;s no wrong answer.
          </p>

          <div className="mb-8 rounded-2xl border border-border bg-surface-soft px-5 py-4">
            <p className="text-sm text-ink mb-2">
              <strong>
                Has a medical professional pronounced them yet?
              </strong>
            </p>
            <p className="text-sm text-ink-soft mb-3">
              A nurse, paramedic, doctor, or hospice worker. Pronouncement is a
              legal step. Nothing official starts until it happens.
            </p>
            <Link
              href="/guidance/home-unexpected"
              className="inline-block text-sm font-medium text-primary-deep underline underline-offset-2 hover:no-underline"
            >
              Not yet, or I&rsquo;m not sure → start here
            </Link>
          </div>

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

          <div
            className="mt-10 flex items-center gap-4 text-xs uppercase tracking-wider text-ink-muted"
            aria-hidden
          >
            <span className="h-px flex-1 bg-border" />
            <span>Or &mdash;</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Link
            href={PLANNING_HREF}
            className="mt-5 block bg-surface-soft border border-dashed border-border hover:border-primary hover:bg-primary-soft rounded-2xl p-5 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="font-serif text-lg text-ink group-hover:text-primary-deep mb-1">
                  I&rsquo;m planning ahead &mdash; nobody has died.
                </div>
                <div className="text-sm text-ink-soft">
                  Learn what funerals should cost in your area and how to avoid
                  the worst traps.
                </div>
              </div>
              <div className="text-ink-muted text-xl pt-1" aria-hidden>
                →
              </div>
            </div>
          </Link>

          <p className="mt-6 text-center text-sm text-ink-muted">
            <Link
              href="/prices"
              className="underline underline-offset-2 hover:text-ink-soft"
            >
              Already know what you need? Skip to fair price lookup →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
