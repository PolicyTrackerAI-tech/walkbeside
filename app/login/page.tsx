"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";
import { FEATURES } from "@/lib/env";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabaseSet = FEATURES.supabase();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!supabaseSet) {
      setError(
        "Supabase isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
      return;
    }
    setBusy(true);
    try {
      const sb = createClient();
      if (mode === "signup") {
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        setInfo(
          "Check your inbox for a confirmation link. You can close this tab — we'll email you back here.",
        );
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <SiteHeader showBack={false} />
      <section className="flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-12">
          <Card>
            <CardTitle>
              {mode === "signup" ? "Save your progress" : "Welcome back"}
            </CardTitle>
            <p className="text-ink-soft mb-6 text-[15px]">
              {mode === "signup"
                ? "An account lets us hold your work while you step away. No credit card. Our flat $249 fee only applies if you go through with advocate outreach and choose a home we present."
                : "Sign in to pick up where you left off."}
            </p>
            {mode === "signup" && (
              <div className="mb-5 text-xs text-ink-muted bg-surface-soft rounded-xl px-4 py-3 border border-border">
                We use your email to save your progress and send you updates on
                any advocate outreach you start. We don&rsquo;t sell email
                addresses. Ever.
              </div>
            )}

            {!supabaseSet ? (
              <>
                <div className="mb-5 p-4 rounded-xl bg-warn-soft border border-warn/30 text-sm text-ink">
                  <strong className="block mb-1">Setup required</strong>
                  Add your Supabase URL and anon key to{" "}
                  <code className="text-xs">.env.local</code> to enable accounts.
                  The free tier (price lookup, prep kit, calculators) works
                  without an account.
                </div>
                <LinkButton href="/where" className="w-full">
                  Continue without an account →
                </LinkButton>
              </>
            ) : (
            <form onSubmit={handle} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password" hint="At least 8 characters.">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-sm text-bad bg-bad-soft border border-bad/30 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              {info && (
                <div className="text-sm text-good bg-good-soft border border-good/30 rounded-xl px-4 py-3">
                  {info}
                </div>
              )}

              <Button type="submit" disabled={busy} className="w-full">
                {busy
                  ? "Working…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>
            )}

            {supabaseSet && (
              <>
                <p className="mt-6 text-sm text-ink-muted text-center">
                  {mode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signin")}
                        className="text-primary-deep underline"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      New here?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-primary-deep underline"
                      >
                        Create an account
                      </button>
                    </>
                  )}
                </p>

                <p className="mt-3 text-xs text-ink-muted text-center">
                  <Link href="/prices">Continue without an account →</Link>
                </p>
              </>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5 py-10 max-w-md mx-auto text-ink-muted">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
