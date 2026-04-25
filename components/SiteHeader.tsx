"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "./Brand";
import { createClient } from "@/lib/supabase/client";
import { FEATURES } from "@/lib/env";

interface Props {
  /** Legacy: href for the right-side back link. */
  backHref?: string;
  /** Legacy: label for the right-side back link. */
  backLabel?: string;
  /**
   * Custom content for the right slot. If provided, renders to the LEFT of
   * the auth button (a breadcrumb-style back affordance). Used by sub-pages.
   */
  rightSlot?: React.ReactNode;
  /** Hide the legacy back link. */
  showBack?: boolean;
  /** Extra classes on the outer <header>. */
  className?: string;
}

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/obituary", label: "Obituary helper" },
  { href: "/faq", label: "FAQ" },
  { href: "/after", label: "After the funeral" },
];

export function SiteHeader({
  backHref,
  backLabel = "← Home",
  rightSlot,
  showBack = false,
  className = "",
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Render legacy back link inline if requested.
  const legacyBack =
    rightSlot ??
    (showBack && backHref ? (
      <Link
        href={backHref}
        className="text-sm text-ink-muted hover:text-ink-soft"
      >
        {backLabel}
      </Link>
    ) : null);

  return (
    <header
      className={`border-b border-border bg-surface/70${className ? ` ${className}` : ""}`}
    >
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-4">
        <Brand />

        <nav className="hidden md:flex items-center gap-5 text-sm text-ink-soft ml-6 flex-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-ink underline-offset-2 hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          {legacyBack}
          <HeaderAuthButton />
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden ml-auto inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-ink-soft hover:text-ink"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-3 text-base text-ink-soft">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
              {legacyBack}
              <HeaderAuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderAuthButton() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!FEATURES.supabase()) {
      setSignedIn(false);
      return;
    }
    const sb = createClient();
    let active = true;

    sb.auth.getUser().then(({ data }) => {
      if (!active) return;
      setSignedIn(!!data.user);
      setEmail(data.user?.email ?? null);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session?.user);
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (signedIn === null) {
    return <span className="w-20 h-9" aria-hidden />;
  }

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary-deep text-white hover:opacity-90"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="relative">
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary-deep text-white hover:opacity-90"
      >
        Dashboard
      </Link>
      {email && (
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="ml-2 text-xs text-ink-muted hover:text-ink-soft"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          {email.split("@")[0]} ▾
        </button>
      )}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-surface shadow-md z-10">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-sm text-ink hover:bg-surface-soft"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={async () => {
              setMenuOpen(false);
              if (FEATURES.supabase()) {
                await createClient().auth.signOut();
                window.location.href = "/";
              }
            }}
            className="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-soft"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
