/**
 * Attachment handling for funeral-home replies (audit A8-06).
 *
 * Postmark's inbound payload carries each attachment's bytes as base64. We
 * never display or parse attachments (the AI quote parse reads the text body
 * only), so storing those bytes in negotiation_messages.raw_payload kept a
 * copy of every file with no retention limit and no use. The stored payload
 * keeps each attachment's name, type and size and drops the bytes.
 */

export interface InboundAttachment {
  Name?: string;
  ContentType?: string;
  ContentLength?: number;
  Content?: string;
  ContentID?: string;
}

export interface AttachmentSummary {
  name: string;
  contentType: string;
  bytes: number | null;
}

/** The payload as stored: identical, except attachment bytes are removed. */
export function withoutAttachmentBytes<T extends object>(payload: T): T {
  const attachments = (payload as { Attachments?: unknown }).Attachments;
  if (!Array.isArray(attachments)) return payload;
  return {
    ...payload,
    Attachments: attachments.map((a) => {
      if (typeof a !== "object" || a === null) return a;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping the bytes is the point
      const { Content, ...rest } = a as InboundAttachment;
      return rest;
    }),
  };
}

/** Name, type and size of each attachment, for the founder alert. */
export function summarizeAttachments(payload: object): AttachmentSummary[] {
  const attachments = (payload as { Attachments?: unknown }).Attachments;
  if (!Array.isArray(attachments)) return [];
  return attachments.filter(
    (a): a is InboundAttachment => typeof a === "object" && a !== null,
  ).map((a) => ({
    name: typeof a.Name === "string" ? a.Name.slice(0, 200) : "(unnamed)",
    contentType: typeof a.ContentType === "string" ? a.ContentType : "unknown",
    bytes: typeof a.ContentLength === "number" ? a.ContentLength : null,
  }));
}
