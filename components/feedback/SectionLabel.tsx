/** Uppercase section label + optional right-aligned hint (founder view). */
export function SectionLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <span className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-text-3">
        {children}
      </span>
      {hint && <span className="text-[12px] text-text-4">{hint}</span>}
    </div>
  );
}
