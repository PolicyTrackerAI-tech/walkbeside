"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary — catches errors in the ROOT layout itself, so it must
 * render its own <html>/<body> and can't rely on globals.css/fonts (those live
 * in the layout that just failed). Inline styles keep it bulletproof.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error.digest ?? "", error.message);
  }, [error]);

  const phone = process.env.NEXT_PUBLIC_HELP_PHONE ?? "+13855531141";

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f4",
          color: "#1a2b22",
        }}
      >
        <div style={{ maxWidth: 440, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>
            Something went wrong.
          </h1>
          <p style={{ color: "#4b5a52", lineHeight: 1.5, margin: "0 0 24px" }}>
            It&rsquo;s on our end, not anything you did. Please try again. If it
            keeps happening, call us &mdash; a real person will help.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#2f5d4f",
              color: "#fff",
              border: 0,
              borderRadius: 16,
              padding: "14px 28px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: 20 }}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
                intentional plain <a>: this boundary replaces the root layout
                when IT failed, so it can't safely depend on next/link's
                router context — a hard navigation is the reliable recovery. */}
            <a href="/" style={{ color: "#2f5d4f" }}>
              Go home
            </a>
            {"  ·  "}
            <a href={`tel:${phone}`} style={{ color: "#2f5d4f" }}>
              Call us
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
