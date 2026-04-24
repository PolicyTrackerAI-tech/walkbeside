import Link from "next/link";
import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-colors transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-deep text-on-primary hover:bg-ink shadow-[0_1px_2px_rgba(20,35,28,0.08),0_8px_24px_rgba(47,93,79,0.18)]",
  secondary:
    "bg-surface text-ink border border-border hover:border-primary hover:text-primary-deep",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-soft hover:text-ink",
  danger: "bg-bad text-on-primary hover:bg-bad/90",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Common & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children">) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
