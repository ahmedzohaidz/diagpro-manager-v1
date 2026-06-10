import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className = "", ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-bold text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ink focus:ring-2 focus:ring-brand ${className}`}
        {...props}
      />
    </div>
  );
});
