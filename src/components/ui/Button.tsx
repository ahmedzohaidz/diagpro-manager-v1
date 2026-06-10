import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary brand button — DiagPro yellow with black text
  primary: "bg-brand text-ink hover:bg-brand-dark",
  secondary: "bg-ink text-white hover:bg-ink-soft",
  outline: "border-2 border-ink bg-white text-ink hover:bg-brand",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
