"use client";

import { LINE_ITEMS, fmtRange, adjustedRange } from "@/lib/pricing-data";
import { FIVE_QUESTIONS, DECLINE_SCRIPTS } from "@/lib/scenarios";
import type { FaithTradition } from "@/lib/faith-traditions";

/**
 * One-page printable cheat sheet, tailored to a faith tradition.
 *
 * Same anchor structure as the generic Cheatsheet (LINE_ITEMS table, FTC
 * rights, scripts) but with a tradition-specific section at the top: opening
 * question, faith-specific questions, and faith-specific decline scripts.
 *
 * Falls back to the generic content for traditions without a `cheatsheet` block
 * (secular, "other") — same component is safe to render either way.
 */
export function FaithCheatsheet({
  tradition,
  zip,
}: {
  tradition: FaithTradition;
  zip?: string;
}) {
  const cs = tradition.cheatsheet;
  const allDeclines = [...(cs?.extraDeclines ?? []), ...DECLINE_SCRIPTS];

  return (
    <div className="print-page bg-white text-black rounded-2xl border border-border p-8 print:p-0 print:border-0 print:rounded-none">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-2xl">
          Arrangement meeting cheat sheet — {tradition.label}
        </h2>
        <span className="text-xs text-ink-muted">honestfuneral.co</span>
      </div>

      <p className="text-sm text-ink-soft mb-4">
        Bring this. Refer to it openly. The funeral director will see you
        brought it — that alone changes the meeting.
      </p>

      <div className="mb-5">
        <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
          {cs?.openingQuestion
            ? "First — set the frame"
            : "The first question. Ask it before they show you anything."}
        </div>
        {cs?.openingQuestion && (
          <div className="font-serif text-lg italic text-ink mb-2">
            &ldquo;{cs.openingQuestion}&rdquo;
          </div>
        )}
        <div className="font-serif text-base italic text-ink">
          &ldquo;Can I see your itemized General Price List before we begin?&rdquo;
        </div>
      </div>

      {cs && (
        <div className="mb-5 rounded-xl border border-border bg-surface-soft p-4">
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-2">
            {tradition.label} — what to ask about
          </div>
          <ul className="text-sm space-y-1.5 text-ink list-disc list-inside">
            {cs.extraQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          {cs.communityNotes && (
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              <span className="font-medium text-ink">Community: </span>
              {cs.communityNotes}
            </p>
          )}
        </div>
      )}

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
            {LINE_ITEMS.filter(
              (i) => i.highMarkup || i.required === "yes",
            ).map((it) => {
              const [low, high] = adjustedRange(it.fairLow, it.fairHigh, zip);
              return (
                <tr key={it.id} className="border-b border-border/60">
                  <td className="py-1 pr-2">{it.name}</td>
                  <td className="py-1 text-right">{fmtRange(low, high)}</td>
                </tr>
              );
            })}
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
            {allDeclines.slice(0, 5).map((s) => (
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
        and ask why. Faith-specific guidance comes from common American
        practice; consult your clergy for community-specific customs.
      </p>
    </div>
  );
}
