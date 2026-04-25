import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Save your progress across devices. Email only — no password. Honest Funeral never shares your email with funeral homes.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
