/**
 * Shared label/value row used inside admin cards. Wraps long values safely on
 * small screens (break-words + min-w-0) to avoid horizontal overflow in RTL.
 */
export function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 gap-2">
      <dt className="shrink-0 font-bold text-ink-soft">{label}:</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}
