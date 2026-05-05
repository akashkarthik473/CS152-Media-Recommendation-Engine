import type { ReactNode } from "react";
import "./FormField.css";

// props for the FormField wrapper
// label: visible label text shown above the input
// htmlFor: id of the input the label points at for accessibility
// hint: optional helper text shown when there is no error
// error: optional error message that takes precedence over hint
// children: the actual input/select rendered inside the field
type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

// Shared FormField wrapper that pairs a label with an input and shows either a hint or
// a validation error underneath, used by every form on the site for consistency
// Input: FormFieldProps
// Output: JSX field group with label, input, and helper/error text
export function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="ui-field__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="ui-field__hint">{hint}</p>
      ) : null}
    </div>
  );
}
