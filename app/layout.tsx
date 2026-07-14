import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Source_Serif_4 } from "next/font/google";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { RememberReferral } from "@/components/RememberReferral";
import "./globals.css";
import { Footer } from "@/components/Brand";
import { PhaseProvider } from "@/components/PhaseContext";
import { ComfortModeToggle } from "@/components/ComfortModeToggle";

const sans = Inter({
  variable: "--font-sans-stack",
  subsets: ["latin"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif-stack",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://honestfuneral.co"),
  title: {
    default: "Honest Funeral — quiet help after a loss",
    template: "%s — Honest Funeral",
  },
  description:
    "Is your funeral quote fair? Snap a photo of the price list to see overcharges and FTC-rule violations in seconds. Free for families and neutral by design — no money from funeral homes or insurers.",
  openGraph: {
    type: "website",
    siteName: "Honest Funeral",
    title: "Honest Funeral — quiet help after a loss",
    description:
      "Is your funeral quote fair? Snap a photo of the price list to see overcharges and FTC-rule violations in seconds. Free for families and neutral by design — no money from funeral homes or insurers.",
    url: "https://honestfuneral.co",
  },
  twitter: {
    card: "summary_large_image",
    title: "Honest Funeral — quiet help after a loss",
    description:
      "Is your funeral quote fair? Snap a photo of the price list to see overcharges and FTC-rule violations in seconds. Free for families and neutral by design — no money from funeral homes or insurers.",
  },
  robots: { index: true, follow: true },
  // Google Search Console ownership verification. Set GOOGLE_SITE_VERIFICATION
  // to the token from Search Console (Add property → URL prefix → "HTML tag"
  // method → the content value); Next renders the meta tag. Unset → no tag.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

// Explicit viewport (Next injects a default + charset=utf-8 automatically; we
// declare the viewport explicitly so mobile scaling is unambiguous).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {/* Apply the saved comfort-mode choice before paint — no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('honestfuneral.display.v1')==='comfort')document.documentElement.classList.add('comfort-mode')}catch(e){}",
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-lg focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <PhaseProvider>
          <div id="main-content" tabIndex={-1} className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <ComfortModeToggle />
        </PhaseProvider>
        <AnalyticsBeacon />
        {/* Suspense because it reads useSearchParams under a static layout. */}
        <Suspense fallback={null}>
          <RememberReferral />
        </Suspense>
      </body>
    </html>
  );
}
