/**
 * Per-family-member task digest (roadmap Phase 2) — the "here's your part of
 * the list" email a point person sends a sibling. One-time, family-initiated,
 * read-only; the recipient needs no login and gets ONLY their assigned items.
 *
 * Privacy shape: the CLIENT filters the device-local data down to the one
 * person's items before anything reaches the server — the rest of the
 * family's plan never leaves the device. The server just formats and sends.
 *
 * Tone: quiet friend, not marketing (house rule) — calm, direct, no
 * performed empathy, no taglines, nothing to unsubscribe from because
 * there's no list.
 */

export type DigestKind = "task" | "contact" | "document";

export interface DigestItem {
  kind: DigestKind;
  /** e.g. "Forward their mail" / "Aunt Carol (sister)" / "DD-214 (military discharge)". */
  title: string;
  /** Optional short note, e.g. "location: filing cabinet". */
  note?: string;
}

export const MAX_DIGEST_ITEMS = 40;

const KIND_HEADING: Record<DigestKind, string> = {
  task: "On the checklist",
  contact: "People to reach",
  document: "Documents to find",
};

/** True when the item set is well-formed enough to send. */
export function validDigestItems(items: unknown): items is DigestItem[] {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_DIGEST_ITEMS)
    return false;
  return items.every(
    (i) =>
      !!i &&
      typeof i === "object" &&
      ["task", "contact", "document"].includes((i as DigestItem).kind) &&
      typeof (i as DigestItem).title === "string" &&
      (i as DigestItem).title.trim().length > 0 &&
      (i as DigestItem).title.length <= 160 &&
      ((i as DigestItem).note === undefined ||
        (typeof (i as DigestItem).note === "string" &&
          ((i as DigestItem).note as string).length <= 200)),
  );
}

export function buildDigestEmail(input: {
  assigneeName: string;
  senderName?: string;
  items: DigestItem[];
}): { subject: string; text: string } {
  const name = input.assigneeName.trim();
  const sender = input.senderName?.trim();
  const n = input.items.length;

  const sections: string[] = [];
  for (const kind of ["task", "contact", "document"] as DigestKind[]) {
    const rows = input.items.filter((i) => i.kind === kind);
    if (rows.length === 0) continue;
    sections.push(
      `${KIND_HEADING[kind]}:\n` +
        rows
          .map((r) => `  - ${r.title.trim()}${r.note?.trim() ? ` (${r.note.trim()})` : ""}`)
          .join("\n"),
    );
  }

  const subject = sender
    ? `Your part of the list, from ${sender} — ${n} item${n === 1 ? "" : "s"}`
    : `Your part of the family's list — ${n} item${n === 1 ? "" : "s"}`;

  const text = [
    `Hi ${name},`,
    ``,
    sender
      ? `${sender} is coordinating things for the family and asked us to send you the pieces with your name on them:`
      : `The person coordinating things for the family asked us to send you the pieces with your name on them:`,
    ``,
    sections.join("\n\n"),
    ``,
    `That's the whole list — nothing else is expected of you. If something here is done or doesn't make sense, just tell ${sender ?? "them"} directly.`,
    ``,
    `Free tools that help with most of these (no account needed): honestfuneral.co`,
    ``,
    `— Honest Funeral`,
    `Free help for families handling a funeral. No money from funeral homes or insurers.`,
    `This was a one-time message sent at your family's request — you're not on any list.`,
  ].join("\n");

  return { subject, text };
}
