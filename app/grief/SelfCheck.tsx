"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Label, Select } from "@/components/ui/Field";
import {
  STATEMENTS,
  selfCheckResult,
  type Frequency,
  type Duration,
} from "@/lib/grief-selfcheck";

const FREQ_LABEL: Record<Frequency, string> = {
  rarely: "Rarely",
  sometimes: "Sometimes",
  "most-days": "Most days",
};

/**
 * The quiet self-check — reflection, not diagnosis, nothing saved anywhere.
 * Every result path ends at a human (hospice bereavement line, 988, a grief
 * therapist). Anchored (#self-check) so the 6- and 12-month check-in emails
 * can point here.
 */
export function SelfCheck() {
  const [answers, setAnswers] = useState<(Frequency | null)[]>(
    STATEMENTS.map(() => null),
  );
  const [duration, setDuration] = useState<Duration>("");
  const [shown, setShown] = useState(false);

  const complete = answers.every((a) => a !== null) && duration !== "";
  const result = shown && complete
    ? selfCheckResult(answers as Frequency[], duration)
    : null;

  return (
    <div id="self-check" className="scroll-mt-6">
    <Card>
      <CardEyebrow>A quiet self-check</CardEyebrow>
      <CardTitle>How is it sitting with you lately?</CardTitle>
      <p className="text-sm text-ink-soft mt-2">
        Nine statements, three answers each. This is reflection, not a test
        &mdash; it produces no score, diagnoses nothing, and nothing you mark
        is saved or sent anywhere. It&rsquo;s informed by the clinical themes
        of prolonged grief, but it is not a screening instrument.
      </p>
      <p className="text-xs text-ink-muted mt-2">
        If you&rsquo;re in crisis right now, skip all of this: call or text{" "}
        <strong className="text-ink">988</strong> — staffed 24 hours, not only
        for suicide.
      </p>

      <div className="mt-4 space-y-4">
        {STATEMENTS.map((s, i) => (
          <div key={s}>
            <p className="text-sm text-ink mb-1.5">{s}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FREQ_LABEL) as Frequency[]).map((f) => (
                <StatusPill
                  key={f}
                  active={answers[i] === f}
                  onClick={() => {
                    setAnswers((prev) => prev.map((a, j) => (j === i ? f : a)));
                    setShown(false);
                  }}
                >
                  {FREQ_LABEL[f]}
                </StatusPill>
              ))}
            </div>
          </div>
        ))}
        <div className="max-w-xs">
          <Label htmlFor="grief-duration">How long has it been?</Label>
          <Select
            id="grief-duration"
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value as Duration);
              setShown(false);
            }}
          >
            <option value="">Choose…</option>
            <option value="under-6mo">Less than 6 months</option>
            <option value="6-12mo">6 to 12 months</option>
            <option value="over-12mo">More than a year</option>
          </Select>
        </div>
        <Button onClick={() => setShown(true)} disabled={!complete}>
          Show me the honest read →
        </Button>
      </div>

      {result && (
        <div
          className={`mt-5 rounded-xl border px-4 py-4 ${
            result.tone === "please-reach-out"
              ? "border-warn/40 bg-warn-soft"
              : "border-primary/30 bg-primary-soft/50"
          }`}
        >
          <h3 className="font-serif text-lg text-ink">{result.heading}</h3>
          <p className="text-sm text-ink-soft mt-2 leading-relaxed">
            {result.body}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink">
            <li>
              <strong>Your hospice&rsquo;s bereavement line</strong> — free
              counseling, groups, and check-ins for about 13 months after the
              death. You&rsquo;re entitled to it; one call starts it.
            </li>
            <li>
              <strong>988</strong> (call or text) — 24 hours, for any level of
              crisis, not only suicide.
            </li>
            <li>
              <strong>A grief therapist</strong> — the directories and search
              terms are just below on this page.
            </li>
          </ul>
          <p className="text-xs text-ink-muted mt-3">
            Only a clinician can assess or diagnose anything — this page
            can&rsquo;t and doesn&rsquo;t. If a result here worried you, that
            worry is itself a good reason to talk to a person.{" "}
            <Link href="/talking-to-kids" className="underline">
              For children&rsquo;s grief, start here instead.
            </Link>
          </p>
        </div>
      )}
    </Card>
    </div>
  );
}
