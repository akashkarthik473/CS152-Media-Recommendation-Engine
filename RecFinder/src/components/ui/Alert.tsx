import type { ReactNode } from "react";
import "./Alert.css";

// props for the Alert component, the variant decides the color/icon and the children
// are the message body
type AlertProps = {
  variant?: "error" | "info" | "success";
  children: ReactNode;
};

// Shared Alert component used to surface inline messages (errors, info, success) above
// forms and around results
// Input: AlertProps with optional variant and required children
// Output: JSX div with role="alert" so screen readers announce it
export function Alert({ variant = "info", children }: AlertProps) {
  return (
    <div className={`ui-alert ui-alert--${variant}`} role="alert">
      {children}
    </div>
  );
}
