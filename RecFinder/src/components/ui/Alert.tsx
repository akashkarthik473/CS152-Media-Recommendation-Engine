import type { ReactNode } from "react";
import "./Alert.css";

type AlertProps = {
  variant?: "error" | "info" | "success";
  children: ReactNode;
};

export function Alert({ variant = "info", children }: AlertProps) {
  return (
    <div className={`ui-alert ui-alert--${variant}`} role="alert">
      {children}
    </div>
  );
}
