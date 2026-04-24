import * as React from "react";

export function Label({
  children,
  htmlFor,
  hint,
  className = "mb-2",
}: {
  children: React.ReactNode;
  htmlFor: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm text-ink font-medium ${className}`}
    >
      {children}
      {hint && (
        <span className="block text-ink-muted font-normal mt-0.5">{hint}</span>
      )}
    </label>
  );
}

export const inputBase =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...rest }, ref) {
  return <input ref={ref} className={`${inputBase} ${className}`} {...rest} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`${inputBase} ${className}`}
      {...rest}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...rest }, ref) {
  return (
    <select ref={ref} className={`${inputBase} appearance-none ${className}`} {...rest}>
      {children}
    </select>
  );
});
