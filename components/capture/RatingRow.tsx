"use client";

import { cn } from "@/lib/utils";
import { RATING_MIN, RATING_MAX } from "@/schemas/feedback";

const SCORES = Array.from(
  { length: RATING_MAX - RATING_MIN + 1 },
  (_, i) => RATING_MIN + i
);

interface RatingRowProps {
  label: string;
  /** null = not rated (ratings are optional per submission). */
  score: number | null;
  onScore: (score: number | null) => void;
  disabled?: boolean;
}

/**
 * One 1-5 rating criterion as a segmented tap scale (faster than a drag
 * slider on a phone held mid-pitch). Tapping the current score again clears
 * it - every criterion stays optional.
 */
export function RatingRow({ label, score, onScore, disabled }: RatingRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {score !== null ? `${score}/${RATING_MAX}` : "-"}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label={`Rate ${label} from ${RATING_MIN} to ${RATING_MAX}`}
        className="flex gap-1.5"
      >
        {SCORES.map((value) => {
          const active = score !== null && value <= score;
          const isCurrent = score === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isCurrent}
              aria-label={`${value} of ${RATING_MAX}`}
              disabled={disabled}
              onClick={() => onScore(isCurrent ? null : value)}
              className={cn(
                "min-h-[44px] flex-1 rounded-lg border text-sm font-medium tabular-nums transition-[transform,background-color,border-color,color] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
