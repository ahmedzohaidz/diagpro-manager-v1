type BadgeTone = "neutral" | "brand" | "dark" | "danger" | "success";

interface StatusBadgeProps {
  /** The Arabic label to display. */
  label: string;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-ink/5 text-ink-soft border-ink/15",
  brand: "bg-brand text-ink border-brand-dark",
  dark: "bg-ink text-white border-ink",
  danger: "bg-red-100 text-red-800 border-red-200",
  success: "bg-green-100 text-green-800 border-green-200",
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
