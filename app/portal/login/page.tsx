"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";
import { FEATURES } from "@/lib/env";

/**
 * Sign-in for the partner portal — code-first, on purpose. The emailed
 * one-time code is verified right here on the page (verifyOtp), so signing in
 * never depends on a redirect chain: no Site-URL/allowlist configuration, no
 * consumed-by-mail-scanner links, no landing on the homepage silently signed
 * in. The emailed link still works as a bonus for correctly-configured
 * environments; the code is the path we trust. Membership is enforced at
 * /portal (requirePartnerMember), so this page never reveals who is or
 * isn't a member.
 */

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/portal";
  return raw;
}

const ERROR_COPY: Record<string, string> = {
  link_failed:
    "That sign-in link didn't work — it was probably expired or already used. No harm done: enter your email and we'll send a fresh code.",
  signin_incomplete:
    "Sign-in didn't complete. No harm done — enter your email and we'll send a fresh code.",
};

/** Session probe result: still checking, no session, or the signed-in email. */
type SessionState = { phase: "checking" } | { phase: "none" } | { phase: "signed-in"; email: string };

function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const supabaseSet = FEATURES.supabase();
  // Only worth probing for an existing session when Supabase is configured.
  const [session, setSession] = useState<SessionState>(
    supabaseSet ? { phase: "checking" } : { phase: "none" },
  );
  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    urlError ? (ERROR_COPY[urlError] ?? ERROR_COPY.link_failed) : null,
  );

  // Already signed in? Offer the way through — but never auto-redirect: the
  // session might belong to a personal/family account with no portal seat,
  // and bouncing that user into /portal's 404 with no way back to this form
  // is a dead end. A visible choice fixes both that and the "silent loop"
  // (page quietly re-offering the form to someone who IS signed in) that
  // burned the first pilot walkthrough.
  useEffect(() => {
    if (!supabaseSet) return;
    const sb = createClient();
    sb.auth
      .getUser()
      .then(({ data }) => {
        if (data.user) {
          setSession({ phase: "signed-in", email: data.user.email ?? "your account" });
        } else {
          setSession({ phase: "none" });
        }
      })
      .catch(() => setSession({ phase: "none" }));
  }, [supabaseSet]);

  async function useDifferentEmail() {
    setBusy(true);
    try {
      const sb = createClient();
      await sb.auth.signOut();
      setSession({ phase: "none" });
      setError(null);
    } finally {
      setBusy(false);
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        // GoTrue's per-address resend cooldown reports code
        // "over_email_send_rate_limit" / HTTP 429 with a message that says
        // neither "rate" nor "too many" — match on code/status first.
        const rateLimited =
          (error as { code?: string }).code === "over_email_send_rate_limit" ||
          (error as { status?: number }).status === 429 ||
          /rate|too many|only request this after/i.test(error.message);
        setError(
          rateLimited
            ? "Codes can only be sent about once a minute — give it a moment, then try again. The last email we sent still works."
            : "That didn't go through — check the address and try again.",
        );
      } else {
        setCode("");
        setStep("code");
      }
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) {
        setError(
          "That code didn't match or has expired. Only the newest email counts — if in doubt, request a fresh code.",
        );
      } else {
        // Full navigation (not a client route push) so the server sees the
        // new session cookies on the very first render of /portal.
        window.location.assign(next);
        return;
      }
    } finally {
      setBusy(false);
    }
  }

  if (session.phase === "checking") {
    return (
      <main className="flex-1 flex flex-col">
        <SiteHeader navLinks={[]} />
        <div className="max-w-md mx-auto w-full px-5 py-12 text-sm text-ink-muted">
          One moment — checking whether you&rsquo;re already signed in…
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader navLinks={[]} />
      <div className="max-w-md mx-auto w-full px-5 py-12">
        <Card>
          <CardTitle>Partner portal</CardTitle>
          {!supabaseSet ? (
            <p className="text-sm text-ink-soft mt-2">
              Sign-in isn&rsquo;t available in this environment.
            </p>
          ) : session.phase === "signed-in" ? (
            <div className="mt-2 space-y-4">
              <p className="text-sm text-ink">
                You&rsquo;re already signed in as <strong>{session.email}</strong>.
              </p>
              <Button type="button" onClick={() => window.location.assign(next)}>
                Continue to the portal →
              </Button>
              <p className="text-xs text-ink-muted">
                Portal invitation on a different email?{" "}
                <button
                  type="button"
                  onClick={useDifferentEmail}
                  disabled={busy}
                  className="text-primary-deep underline"
                >
                  Sign out and use that one
                </button>
                .
              </p>
            </div>
          ) : step === "email" ? (
            <form onSubmit={sendCode} className="mt-2 space-y-4">
              <p className="text-sm text-ink-soft">
                Use your work email — the one your organization&rsquo;s portal
                invitation went to. We&rsquo;ll email you a one-time sign-in
                code.
              </p>
              <div>
                <Label htmlFor="portal-email">Work email</Label>
                <Input
                  id="portal-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourorganization.org"
                />
              </div>
              {error && (
                <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={busy || !email.trim()}>
                {busy ? "Sending…" : "Email me a sign-in code"}
              </Button>
              <p className="text-xs text-ink-muted">
                Have a password already?{" "}
                <Link
                  href={`/login?next=${encodeURIComponent(next)}`}
                  className="text-primary-deep underline"
                >
                  Sign in with it instead
                </Link>
                . New here? Your organization applies at{" "}
                <Link href="/partners/apply" className="text-primary-deep underline">
                  partners/apply
                </Link>
                .
              </p>
            </form>
          ) : (
            <form onSubmit={confirmCode} className="mt-2 space-y-4">
              <p className="text-sm text-ink">
                We emailed a sign-in code to <strong>{email.trim()}</strong>.
              </p>
              <div>
                <Label htmlFor="portal-code">Sign-in code from the email</Label>
                <Input
                  id="portal-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={10}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="12345678"
                />
              </div>
              {error && (
                <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={busy || code.trim().length < 6}>
                {busy ? "Checking…" : "Sign in"}
              </Button>
              <p className="text-xs text-ink-muted">
                The email&rsquo;s sign-in link works too. One thing to know:
                requesting a new code makes every older email stale — always
                use the newest one.{" "}
                <button
                  type="button"
                  onClick={(e) => sendCode(e as unknown as React.FormEvent)}
                  className="text-primary-deep underline"
                  disabled={busy}
                >
                  Send a fresh code
                </button>{" "}
                ·{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                  className="text-primary-deep underline"
                >
                  Different email
                </button>
              </p>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
