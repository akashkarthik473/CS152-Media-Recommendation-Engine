import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...rest} className={classes} disabled={disabled || loading}>
      {loading ? <span className="ui-button__spinner" aria-hidden /> : null}
      <span className={loading ? "ui-button__label--loading" : ""}>{children}</span>
    </button>
  );
}
