import { redirect } from "next/navigation";

/**
 * /after used to be the post-funeral surface, but /next-30-days is the
 * better implementation (interactive checklist, progress counter,
 * localStorage persistence, completed-state styling). Promote that one.
 *
 * Sub-pages (/after/death-certificates, /after/accounts-to-close,
 * /after/estate-basics) still exist for now — kept for SEO and direct
 * links — but the index redirects forward.
 */
export default function AfterRedirect() {
  redirect("/next-30-days");
}
