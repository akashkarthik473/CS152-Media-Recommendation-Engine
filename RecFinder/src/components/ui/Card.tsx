import type { HTMLAttributes } from "react";
import "./Card.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "md" | "lg";
};

export function Card({ padding = "lg", className = "", children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={["ui-card", `ui-card--${padding}`, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
