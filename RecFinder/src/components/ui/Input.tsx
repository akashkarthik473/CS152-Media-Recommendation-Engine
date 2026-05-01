import { forwardRef, type InputHTMLAttributes } from "react";
import "./Input.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className = "", ...rest },
  ref,
) {
  const classes = ["ui-input", invalid ? "ui-input--invalid" : "", className]
    .filter(Boolean)
    .join(" ");
  return <input ref={ref} className={classes} {...rest} />;
});
