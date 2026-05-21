import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <PhaseProvider>
          {children}
          <Footer />
        </PhaseProvider>
      </body>
    </html>
  );
}
