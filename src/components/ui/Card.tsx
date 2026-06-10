import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-ink/15 bg-white p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
