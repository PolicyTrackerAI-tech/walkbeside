import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Brand";

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
    "Built by a licensed funeral director. We walk with families through the hardest week, from the first phone call to the last account closed.",
  openGraph: {
    type: "website",
    siteName: "Honest Funeral",
    title: "Honest Funeral — quiet help after a loss",
    description:
      "Built by a licensed funeral director. Fair prices, family advocacy, and the checklist for the next 30 days.",
    url: "https://honestfuneral.co",
  },
  twitter: {
    card: "summary_large_image",
    title: "Honest Funeral — quiet help after a loss",
    description:
      "Built by a licensed funeral director. Fair prices, family advocacy, and the checklist for the next 30 days.",
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
        {children}
        <Footer />
      </body>
    </html>
  );
}
