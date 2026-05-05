import type { HTMLAttributes } from "react";
import "./Card.css";

// props for the Card component, extends native div attrs and lets the caller pick how
// much internal padding the card has
type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "md" | "lg";
};

// Shared Card component used to group related content with a consistent surface and
// shadow, used throughout the auth pages and the home page
// Input: CardProps with optional padding plus any native div attrs
// Output: JSX div styled as a card containing the children
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
