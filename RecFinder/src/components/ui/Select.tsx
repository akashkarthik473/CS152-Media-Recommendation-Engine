import { forwardRef, type SelectHTMLAttributes } from "react";
import "./Input.css";

type Option = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
};

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
