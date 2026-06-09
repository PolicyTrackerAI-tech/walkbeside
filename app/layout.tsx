import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Brand";
import { PhaseProvider } from "@/components/PhaseContext";

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
    "Compare funeral home prices, avoid common upsells, and decide with confidence. Consumer advocacy for families — paid only by you, never by funeral homes.",
  openGraph: {
    type: "website",
    siteName: "Honest Funeral",
    title: "Honest Funeral — quiet help after a loss",
    description:
      "Compare funeral home prices, avoid common upsells, and decide with confidence. Consumer advocacy for families — paid only by you, never by funeral homes.",
    url: "https://honestfuneral.co",
  },
  twitter: {
    card: "summary_large_image",
    title: "Honest Funeral — quiet help after a loss",
    description:
      "Compare funeral home prices, avoid common upsells, and decide with confidence. Consumer advocacy for families — paid only by you, never by funeral homes.",
  },
  robots: { index: true, follow: true },
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
        </PhaseProvider>
      </body>
    </html>
  );
}
