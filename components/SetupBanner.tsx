/**
 * Surfaces missing-config issues only when relevant. Renders nothing if all
 * required env vars are set.
 */
import { FEATURES, PUBLIC } from "@/lib/env";

const checks: { key: string; label: string; ok: () => boolean; envs: string[] }[] = [
  {
    key: "supabase",
    label: "Accounts, dashboard, document vault",
    ok: () => FEATURES.supabase(),
    envs: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  },
  {
    key: "claude",
    label: "AI negotiation, price list analyzer, obituary helper",
    ok: () => FEATURES.claude(),
    envs: ["ANTHROPIC_API_KEY"],
  },
  {
    key: "stripe",
    label: "Stripe checkout (negotiation fee)",
    ok: () => FEATURES.stripe(),
    envs: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  },
  {
    key: "email",
    label: "Outbound negotiation email",
    ok: () => FEATURES.email(),
    envs: ["RESEND_API_KEY"],
  },
];

export function SetupBanner() {
  if (process.env.NODE_ENV === "production") return null;
  const missing = checks.filter((c) => !c.ok());
  if (missing.length === 0) return null;
  return (
    <div className="rounded-2xl border border-warn/30 bg-warn-soft p-5 text-sm text-ink">
      <div className="font-medium mb-2">Setup checklist</div>
      <ul className="space-y-1">
        {missing.map((m) => (
          <li key={m.key}>
            <span className="text-warn">●</span> <strong>{m.label}</strong>{" "}
            <span className="text-ink-soft">
              — set {m.envs.join(", ")} in <code>.env.local</code>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-muted">
        Free-tier features (price lookup, prep kit, calculators) work without
        any setup. App URL: {PUBLIC.appUrl}
      </p>
    </div>
  );
}
