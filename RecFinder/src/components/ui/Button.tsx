import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

// supported visual styles for the Button, matches the css modifier classes
type Variant = "primary" | "secondary" | "ghost";

// supported size keys for the Button, also matches css modifier classes
type Size = "sm" | "md" | "lg";

// props accepted by the shared Button component, extends native button attrs with our
// own variant/size/loading/fullWidth customizations
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

// Shared Button component used everywhere a clickable action is rendered, handles the
// loading state by swapping in a spinner and disabling the button
// Input: ButtonProps including variant, size, loading, fullWidth and any native button attrs
// Output: JSX <button> with the right classes and content
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
  // builds the className string by joining the variant/size/fullWidth modifiers with any
  // extra class names passed in by the caller
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
