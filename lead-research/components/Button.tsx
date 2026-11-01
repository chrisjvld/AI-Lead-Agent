import type { MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
};

const variantStyles = {
  primary: "border-accent bg-accent text-surface hover:bg-accent-hover",
  secondary:
    "border-border bg-surface text-foreground hover:bg-surface-muted",
  danger: "border-danger bg-surface text-danger hover:bg-surface-muted",
};

export function Button({
  children,
  className = "",
  disabled = false,
  href,
  onClick,
  type = "button",
  variant = "primary",
}: ButtonProps) {
  const disabledStyles = disabled
    ? "pointer-events-none cursor-not-allowed opacity-50"
    : "";
  const styles = `inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${disabledStyles} ${className}`;

  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        className={styles}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={styles}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
