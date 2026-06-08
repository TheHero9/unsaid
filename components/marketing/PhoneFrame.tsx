import { cn } from "@/lib/utils";

/**
 * A lightweight phone-shaped frame used to present the in-app mockups on the
 * marketing page. Decorative - the screens inside carry their own labels, so
 * the frame itself is aria-hidden.
 */
export function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "mx-auto w-full max-w-[260px] rounded-[2.25rem] border border-border bg-card p-2 shadow-xl shadow-black/40",
        className
      )}
    >
      <div className="relative overflow-hidden rounded-[1.75rem] bg-background">
        <div className="absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-border" />
        <div className="px-4 pb-5 pt-7">{children}</div>
      </div>
    </div>
  );
}
