/**
 * The quiet grief self-check on /grief (roadmap Phase 3) — reflection, not
 * diagnosis. Deliberately NOT the PG-13 or any validated instrument: the
 * PG-13 is copyrighted (Prigerson & Maciejewski) and reproducing it needs the
 * authors' permission — queued as a founder action before any scored version
 * ships. These statements describe, in plain words, the public-domain
 * clinical THEMES of Prolonged Grief Disorder (DSM-5-TR): yearning,
 * preoccupation, identity disruption, disbelief, avoidance, emotional pain,
 * numbness, loneliness, meaninglessness, difficulty re-engaging.
 *
 * No score is produced, nothing is stored anywhere, and every result path
 * ends in a human: the hospice bereavement line, 988, or a grief therapist.
 */

export type Frequency = "rarely" | "sometimes" | "most-days";
export type Duration = "" | "under-6mo" | "6-12mo" | "over-12mo";

export const STATEMENTS: string[] = [
  "I long or ache for them most of the day.",
  "Thoughts of them crowd out almost everything else.",
  "It feels like part of me died with them.",
  "Some days I still can't believe it really happened.",
  "I avoid places, people, or things that remind me of them.",
  "The emotional pain is intense — anger, guilt, or deep sorrow.",
  "I feel numb, or cut off from other people.",
  "Life feels empty or meaningless without them.",
  "I can't seem to step back into my own life — friends, plans, purpose.",
];

export interface SelfCheckResult {
  /** Which calm message the family sees. */
  tone: "early" | "steady" | "worth-a-conversation" | "please-reach-out";
  heading: string;
  body: string;
}

/**
 * Non-diagnostic bucketing. Duration gates everything: in the first six
 * months, intense grief is EXPECTED — no count of "most days" produces an
 * alarming read. The 12-month + persistent-pattern path mirrors where the
 * clinical threshold for Prolonged Grief Disorder sits, in plain words.
 */
export function selfCheckResult(
  answers: Frequency[],
  duration: Duration,
): SelfCheckResult {
  const heavy = answers.filter((a) => a === "most-days").length;

  if (duration === "under-6mo" || duration === "") {
    return {
      tone: "early",
      heading: "This early, what you're feeling is grief doing what grief does.",
      body: "Nothing you marked here is a disorder or a diagnosis — in the first months, intense yearning, disbelief, and pain ARE the expected shape of loss. Be gentle with yourself. If any of it feels unbearable rather than heavy, you don't have to wait any amount of time to talk to someone — the supports below are for now, too.",
    };
  }

  if (heavy >= 4 && duration === "over-12mo") {
    return {
      tone: "please-reach-out",
      heading: "This pattern, carried this long, deserves real support.",
      body: "When grief is still this intense and this consuming past a year, clinicians call it prolonged grief — not a failure, not weakness, a treatable condition with good outcomes. This isn't a diagnosis (only a person can do that), but it is a strong reason to talk to someone who works with grief. Start with any of the supports below — the hospice bereavement line is free and one call starts it.",
    };
  }

  if (heavy >= 3) {
    return {
      tone: "worth-a-conversation",
      heading: "Worth a conversation with someone who works with grief.",
      body: "Several of these are still with you most days. That doesn't mean something is wrong with you — it means you're carrying a lot, and carrying it alone is the hard way. A grief counselor or your hospice's free bereavement support can genuinely lighten this. One conversation is a fine place to start.",
    };
  }

  return {
    tone: "steady",
    heading: "You're carrying this the way most people do.",
    body: "Grief this far in usually looks like what you described — present, sometimes heavy, not all-consuming. Keep whatever is helping. If it turns heavier later (anniversaries do this), the supports below will still be here.",
  };
}
