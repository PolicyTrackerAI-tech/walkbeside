import { getUser } from "@/lib/supabase/server";
import { EmailCaptureForm } from "./EmailCaptureForm";

interface Props {
  source: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  successTitle?: string;
  successMessage?: string;
  noteText?: string;
}

/**
 * Server-component entrypoint for the email-capture box on guide pages.
 * Reads the logged-in user's email server-side and forwards it to the
 * client form as defaultEmail — so a returning user doesn't have to
 * retype an address we already have. The input stays editable; the
 * user can clear or change it freely.
 *
 * Guide pages (sync server components) render this directly as
 * <EmailCapture .../> — Next.js composes the async child automatically,
 * so no per-page changes were needed when this was introduced.
 *
 * Tradeoff: getUser reads cookies, which marks the host page dynamic
 * (no static caching). For consumer guide pages at this scale that's
 * fine — TTFB stays low, SEO is unaffected — and we can revisit with
 * Partial Prerendering later if it ever matters.
 */
export async function EmailCapture(props: Props) {
  const user = await getUser();
  return <EmailCaptureForm {...props} defaultEmail={user?.email ?? ""} />;
}
