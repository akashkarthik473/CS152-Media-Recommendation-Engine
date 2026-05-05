import { forwardRef, type SelectHTMLAttributes } from "react";
import "./Input.css";

// shape of a single option rendered inside the Select
type Option = { value: string; label: string };

// props for the Select, extends native select attrs and requires the list of options
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
};

// Shared Select component used for the media type dropdown on the home page, forwards
// refs and renders the supplied options in order
// Input: SelectProps with required options array
// Output: JSX <select> populated with <option> children
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, className = "", ...rest },
  ref,
) {
  return (
    <select ref={ref} className={["ui-select", className].filter(Boolean).join(" ")} {...rest}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});
