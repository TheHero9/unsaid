"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChipSentiment } from "@/lib/chips";

/**
 * Sentiment-coloured chip toggle (HERO #1). Selected = filled muted bg +
 * coloured border/text + check icon; unselected = subtle outline. Min 44px
 * tap target, instant active-press feedback. Pure local state - the parent
 * owns selection.
 */
const chipVariants = cva(
  "inline-flex min-h-[44px] select-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-[transform,background-color,border-color,color] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
  {
    variants: {
      sentiment: {
        positive: "",
        negative: "",
        neutral: "",
      },
      selected: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        sentiment: "positive",
        selected: false,
        className:
          "border-border bg-transparent text-foreground hover:border-chip-positive/60",
      },
      {
        sentiment: "positive",
        selected: true,
        className:
          "border-chip-positive bg-chip-positive-muted text-chip-positive",
      },
      {
        sentiment: "negative",
        selected: false,
        className:
          "border-border bg-transparent text-foreground hover:border-chip-negative/60",
      },
      {
        sentiment: "negative",
        selected: true,
        className:
          "border-chip-negative bg-chip-negative-muted text-chip-negative",
      },
      {
        sentiment: "neutral",
        selected: false,
        className:
          "border-border bg-transparent text-foreground hover:border-chip-neutral/60",
      },
      {
        sentiment: "neutral",
        selected: true,
        className:
          "border-chip-neutral bg-chip-neutral-muted text-chip-neutral",
      },
    ],
    defaultVariants: {
      sentiment: "neutral",
      selected: false,
    },
  }
);

interface ChipButtonProps
  extends Omit<VariantProps<typeof chipVariants>, "sentiment" | "selected"> {
  label: string;
  sentiment: ChipSentiment;
  selected: boolean;
  onToggle: () => void;
}

export function ChipButton({
  label,
  sentiment,
  selected,
  onToggle,
}: ChipButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(chipVariants({ sentiment, selected }))}
    >
      {selected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
      <span>{label}</span>
    </button>
  );
}
