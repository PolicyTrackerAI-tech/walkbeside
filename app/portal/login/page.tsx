"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";
import { FEATURES } from "@/lib/env";

/**
 * Sign-in for the partner portal. Magic link only — coordinators shouldn't
 * have to manage a password for a tool they touch a few times a month. The
 * link lands on /auth/callback, which exchanges the code and forwards to
 * /portal; membership itself is enforced there (requirePartnerMember), so
 * this page never reveals who is or isn't a member.
 */

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/portal";
  return raw;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseSet = FEATURES.supabase();

  async function sendLink(e: React.FormEvent) {
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
        setError("That didn't go through — check the address and try again.");
      } else {
        setSent(true);
      }
    } finally {
      setBusy(false);
    }
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
          ) : sent ? (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-ink">
                Check your email — we sent a sign-in link to{" "}
                <strong>{email.trim()}</strong>.
              </p>
              <p className="text-sm text-ink-soft">
                It signs you straight in; no password to remember. Wrong
                address?{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-primary-deep underline"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={sendLink} className="mt-2 space-y-4">
              <p className="text-sm text-ink-soft">
                Use your work email — the one your organization&rsquo;s portal
                invitation went to.
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
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button type="submit" disabled={busy || !email.trim()}>
                {busy ? "Sending…" : "Email me a sign-in link"}
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
