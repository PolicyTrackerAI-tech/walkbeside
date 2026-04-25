"use client";

import { LINE_ITEMS, fmtRange, adjustedRange } from "@/lib/pricing-data";
import { FIVE_QUESTIONS, DECLINE_SCRIPTS } from "@/lib/scenarios";

/**
 * One-page printable cheat sheet for the arrangement meeting.
 * Designed to print cleanly at US Letter, single page.
 */
export function Cheatsheet({ zip }: { zip?: string }) {
  return (
    <div className="print-page bg-white text-black rounded-2xl border border-border p-8 print:p-0 print:border-0 print:rounded-none">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-2xl">
          Arrangement meeting cheat sheet
        </h2>
        <span className="text-xs text-ink-muted">
          honestfuneral.co
        </span>
      </div>

      <p className="text-sm text-ink-soft mb-4">
        Bring this. Refer to it openly. The funeral director will see you
        brought it — that alone changes the meeting.
      </p>

      <div className="mb-5">
        <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
          The first question. Ask it before they show you anything.
        </div>
        <div className="font-serif text-lg italic text-ink">
          &ldquo;Can I see your itemized General Price List before we begin?&rdquo;
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
            Things they cannot legally require
          </div>
          <ul className="text-sm space-y-1 list-disc list-inside text-ink">
            <li>Embalming (in most US states)</li>
            <li>Buying their casket — bring your own from any vendor</li>
            <li>Buying a vault more expensive than the cemetery requires</li>
            <li>Paying a &ldquo;handling fee&rdquo; on a third-party casket</li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
            Top three highest-markup items
          </div>
          <ol className="text-sm space-y-1 list-decimal list-inside text-ink">
            <li>Casket (300–500% markup)</li>
            <li>Embalming (often unnecessary)</li>
            <li>Burial vault / grave liner</li>
          </ol>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
          Fair price ranges to compare against (line items)
        </div>
        <table className="w-full text-sm border-collapse">
          <tbody>
            {LINE_ITEMS.filter((i) => i.highMarkup || i.required === "yes").map(
              (it) => {
                const [low, high] = adjustedRange(it.fairLow, it.fairHigh, zip);
                return (
                  <tr key={it.id} className="border-b border-border/60">
                    <td className="py-1 pr-2">{it.name}</td>
                    <td className="py-1 text-right">{fmtRange(low, high)}</td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
            Five questions to ask
          </div>
          <ol className="text-sm space-y-1 list-decimal list-inside text-ink">
            {FIVE_QUESTIONS.map((q) => (
              <li key={q.q}>{q.q}</li>
            ))}
          </ol>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
            Scripts to decline upsells
          </div>
          <ul className="text-sm space-y-2 text-ink">
            {DECLINE_SCRIPTS.slice(0, 4).map((s) => (
              <li key={s.upsell}>
                <span className="font-medium">{s.upsell}: </span>
                <span className="italic">&ldquo;{s.script}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-ink-muted border-t border-border pt-3">
        These ranges are US national averages adjusted for your region. Your
        local funeral director may quote different numbers — push back politely
        and ask why.
      </p>
    </div>
  );
}
