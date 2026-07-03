/**
 * Readability scoring for family-facing copy (roadmap Phase 5). Acute grief
 * measurably impairs reading comprehension — the CI gate keeps the prose at
 * a middle-school reading level WITHOUT rewarding the deletion of the hedges
 * that make a claim defensible ("usually", "in most states", "confirm with")
 * — hedges are short words; removing them barely moves the score, so the
 * gate never pressures against them.
 *
 * Flesch-Kincaid grade = 0.39·(words/sentences) + 11.8·(syllables/word) − 15.59.
 * The syllable counter is the standard vowel-group heuristic — imprecise per
 * word, stable in aggregate, and deterministic (what a gate needs).
 */

export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:ed|es)$/, "").replace(/e$/, "");
  const groups = stripped.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

/**
 * Remove the parts the roadmap excludes from scoring: citations, URLs,
 * phone numbers, and bracketed legal references — they're load-bearing but
 * not prose.
 */
export function stripNonProse(text: string): string {
  return text
    .replace(/https?:\/\/\S+|[a-z0-9.-]+\.(?:co|com|org|gov)\S*/gi, " ")
    .replace(/\b\d{1,2} (?:U\.S\.C\.|CFR|C\.F\.R\.)[^.;\n]*/g, " ")
    .replace(/\([^)]*(?:§|Stat\.|Code|CFR|Admin)[^)]*\)/g, " ")
    .replace(/\+?1?[-.\s(]*\d{3}[-.\s)]*\d{3}[-.\s]*\d{4}/g, " ")
    .replace(/\$[\d,.]+/g, "money")
    .replace(/\s+/g, " ")
    .trim();
}

export function fleschKincaidGrade(text: string): number {
  const prose = stripNonProse(text);
  const sentences = prose.split(/[.!?]+\s/).filter((s) => s.trim().length > 0);
  const words = prose.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (sentences.length === 0 || words.length === 0) return 0;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const grade =
    0.39 * (words.length / sentences.length) +
    11.8 * (syllables / words.length) -
    15.59;
  return Math.round(grade * 10) / 10;
}
