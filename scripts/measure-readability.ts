/* Measurement helper — run once to calibrate thresholds. */
import { fleschKincaidGrade } from "../lib/readability";
import { emailFor, smsFor, MILESTONE_ORDER } from "../lib/anniversary-emails";
import { benefitSweep } from "../lib/plan-now";
import { STATEMENTS, selfCheckResult } from "../lib/grief-selfcheck";
import { buildDigestEmail } from "../lib/family-digest";
import { NATIONAL_BASELINE } from "../lib/state-body-care";
import { FEDERAL_BASELINE } from "../lib/merp-by-state";

const sources: Record<string, string> = {
  "anniversary-emails": MILESTONE_ORDER.map((m) => emailFor(m, "https://x").text).join("\n"),
  "anniversary-sms": MILESTONE_ORDER.map((m) => smsFor(m, "https://x")).join("\n"),
  "benefit-sweep": benefitSweep({ veteran: "yes", onSocialSecurity: "yes", lifeInsurance: "unsure", onMedicaid: "yes", wasEmployed: "yes" }).map((b) => `${b.title}. ${b.detail}`).join("\n"),
  "grief-selfcheck": [...STATEMENTS, ...(["under-6mo", "6-12mo", "over-12mo"] as const).flatMap((d) => (["rarely", "most-days"] as const).map((f) => { const r = selfCheckResult(STATEMENTS.map(() => f), d); return `${r.heading} ${r.body}`; }))].join("\n"),
  "family-digest": buildDigestEmail({ assigneeName: "Mike", senderName: "Sarah", items: [{ kind: "task", title: "Forward their mail" }] }).text,
  "state-baseline": `${NATIONAL_BASELINE.headline} ${NATIONAL_BASELINE.detail}`,
  "merp-baseline": `${FEDERAL_BASELINE.headline} ${FEDERAL_BASELINE.points.join(" ")}`,
};
for (const [name, text] of Object.entries(sources)) {
  console.log(name.padEnd(20), fleschKincaidGrade(text));
}
