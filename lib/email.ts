import { Resend } from "resend";
import { FEATURES, requireServer } from "./env";

let _resend: Resend | null = null;
function resend(): Resend {
  if (!_resend) {
    _resend = new Resend(requireServer("RESEND_API_KEY"));
  }
  return _resend;
}

export const FROM_DEFAULT =
  process.env.RESEND_FROM ?? "Walk Beside <hello@walkbeside.example>";

export interface OutboundEmail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  fromName?: string;
}

/**
 * Send an email. In development without a Resend key, logs to console
 * so the negotiation flow stays exercisable without external service setup.
 */
export async function sendEmail(msg: OutboundEmail): Promise<{ id: string }> {
  if (!FEATURES.email()) {
    const id = `dryrun_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // eslint-disable-next-line no-console
    console.log("[email:dryrun]", id, {
      to: msg.to,
      subject: msg.subject,
      bodyPreview: msg.text.slice(0, 200),
    });
    return { id };
  }
  const from = msg.fromName ? `${msg.fromName} <hello@walkbeside.example>` : FROM_DEFAULT;
  const result = await resend().emails.send({
    from,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    replyTo: msg.replyTo,
  });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data?.id ?? "" };
}
