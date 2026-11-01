import type { MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: "default" | "drawer";
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
};

const variantStyles = {
  primary: "border-foreground bg-foreground text-surface hover:bg-muted",
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
  size = "default",
  type = "button",
  variant = "primary",
}: ButtonProps) {
  const disabledStyles = disabled
    ? "pointer-events-none cursor-not-allowed opacity-50"
    : "";
  const heightStyles = size === "drawer" ? "h-10" : "h-[34px]";
  const styles = `inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${heightStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`;

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
