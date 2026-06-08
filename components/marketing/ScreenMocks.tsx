import { Check, Lock, Star, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

/* Marketing-only static mockups of the three core product screens. No state,
   no data - they exist to show the shape of the product on the landing page.
   They lean on the same chip-* sentiment tokens the real screens use. */

type Sentiment = "positive" | "negative" | "neutral";

const chipTone: Record<Sentiment, string> = {
  positive:
    "border-chip-positive/40 bg-chip-positive-muted text-chip-positive",
  negative:
    "border-chip-negative/40 bg-chip-negative-muted text-chip-negative",
  neutral: "border-chip-neutral/40 bg-chip-neutral-muted text-chip-neutral",
};

const idleChip =
  "border-border bg-secondary/40 text-muted-foreground";

function Chip({
  label,
  sentiment,
  active = false,
}: {
  label: string;
  sentiment: Sentiment;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        active ? chipTone[sentiment] : idleChip
      )}
    >
      {active && <Check className="size-3" />}
      {label}
    </span>
  );
}

function ScreenLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}

/** Step 1 - the juror taps chips and leaves one line, live on a phone. */
export function CaptureMock() {
  return (
    <div>
      <ScreenLabel>Capture · live</ScreenLabel>
      <p className="mb-3 text-sm font-semibold">Atlas - seed round</p>
      <div className="flex flex-wrap gap-1.5">
        <Chip label="Clear story" sentiment="positive" active />
        <Chip label="Big market" sentiment="positive" active />
        <Chip label="Weak ask" sentiment="negative" active />
        <Chip label="Confident" sentiment="positive" />
        <Chip label="Slow start" sentiment="negative" />
        <Chip label="Unclear moat" sentiment="negative" active />
        <Chip label="Team" sentiment="neutral" />
      </div>
      <div className="mt-4 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-[11px] text-muted-foreground">
        The ask slide lost me - what&apos;s the raise for?
      </div>
      <div className="mt-3 rounded-lg bg-primary py-2 text-center text-[11px] font-semibold text-primary-foreground">
        Submit feedback
      </div>
    </div>
  );
}

/** Step 2 - many jurors merge into one anonymized signal. */
export function ConsolidateMock() {
  return (
    <div>
      <ScreenLabel>Consolidate · auto</ScreenLabel>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-2.5 py-1.5"
          >
            <UserRound className="size-3.5 text-muted-foreground" />
            <div className="h-2 flex-1 rounded-full bg-border" />
            <Lock className="size-3 text-muted-foreground" />
          </div>
        ))}
      </div>
      <div className="my-3 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        names removed
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-chip-positive">Clear story</span>
          <span className="text-muted-foreground">×7</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="font-medium text-chip-negative">Unclear moat</span>
          <span className="text-muted-foreground">×4</span>
        </div>
      </div>
    </div>
  );
}

/** Step 3 - the founder gets one clean anonymous page. */
export function DeliverMock() {
  return (
    <div>
      <ScreenLabel>Deliver · founder</ScreenLabel>
      <p className="mb-2 text-sm font-semibold">Your feedback</p>
      <div className="flex h-2.5 overflow-hidden rounded-full">
        <div className="h-full w-[68%] bg-chip-positive" />
        <div className="h-full w-[32%] bg-chip-negative" />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>68% positive</span>
        <span>32% critical</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip label="Clear story ×7" sentiment="positive" active />
        <Chip label="Big market ×5" sentiment="positive" active />
        <Chip label="Unclear moat ×4" sentiment="negative" active />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-[11px] text-muted-foreground">
          &ldquo;Tighten the ask slide.&rdquo;
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-[11px] text-muted-foreground">
          &ldquo;Loved the demo, lead with it.&rdquo;
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Star className="size-3 fill-chip-positive text-chip-positive" />
        <span>Clarity 4.2 · Market 4.6</span>
      </div>
    </div>
  );
}
