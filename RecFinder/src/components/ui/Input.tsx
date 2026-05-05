import { forwardRef, type InputHTMLAttributes } from "react";
import "./Input.css";

// props for the shared Input, extends native input attrs and adds an invalid flag that
// toggles the error styling
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

// Shared Input component used by all forms, forwards refs so React Hook Form / focus
// utilities can reach the underlying DOM node
// Input: InputProps including optional invalid flag
// Output: JSX <input> with the right classes
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className = "", ...rest },
  ref,
) {
  const classes = ["ui-input", invalid ? "ui-input--invalid" : "", className]
    .filter(Boolean)
    .join(" ");
  return <input ref={ref} className={classes} {...rest} />;
});
