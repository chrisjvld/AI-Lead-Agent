import type { MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  download?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: "default" | "drawer" | "small";
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "plain";
  "aria-label"?: string;
};

const variantStyles = {
  primary: "bg-accent text-white hover:brightness-110 shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
  secondary: "bg-fill-2 text-fg hover:bg-[color-mix(in_srgb,var(--text)_12%,transparent)]",
  danger: "bg-fill-2 text-danger hover:bg-[color-mix(in_srgb,var(--danger)_14%,transparent)]",
  plain: "text-accent hover:bg-accent-soft",
};

const sizeStyles = {
  small: "h-8 px-3 text-[0.8125rem]",
  default: "h-9 px-4 text-[0.875rem]",
  drawer: "h-11 px-5 text-[0.9375rem]",
};

export function Button({
  children,
  className = "",
  disabled = false,
  download,
  href,
  onClick,
  size = "default",
  type = "button",
  variant = "primary",
  "aria-label": ariaLabel,
}: ButtonProps) {
  // Disabled buttons go neutral rather than a washed-out tint.
  const tone = disabled
    ? variant === "plain"
      ? "pointer-events-none cursor-not-allowed text-fg-3"
      : "pointer-events-none cursor-not-allowed bg-fill text-fg-3"
    : variantStyles[variant];
  const styles = `pressable focus-ring inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-btn font-medium ${sizeStyles[size]} ${tone} ${className}`;

  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        download={download}
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
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
