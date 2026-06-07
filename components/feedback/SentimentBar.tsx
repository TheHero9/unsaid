import { Minus } from "lucide-react";

interface SentimentBarProps {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

/**
 * One glanceable positive-vs-negative read. The bar shows the share of positive
 * (green, from the left) vs negative (red) chip SELECTIONS; neutral is excluded
 * from the ratio and noted underneath. Handles the 0-positive + 0-negative case
 * gracefully (neutral-only or nothing-yet).
 */
export function SentimentBar({
  positiveCount,
  negativeCount,
  neutralCount,
}: SentimentBarProps) {
  const ratioTotal = positiveCount + negativeCount;
  const hasRatio = ratioTotal > 0;
  const positiveShare = hasRatio ? (positiveCount / ratioTotal) * 100 : 0;
  const negativeShare = hasRatio ? 100 - positiveShare : 0;

  return (
    <section aria-label="Overall sentiment" className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        Overall read
      </h2>

      {hasRatio ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-chip-positive tabular-nums">
              {positiveCount} positive
            </span>
            <span className="font-semibold text-chip-negative tabular-nums">
              {negativeCount} negative
            </span>
          </div>

          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-secondary"
            role="img"
            aria-label={`${positiveCount} positive and ${negativeCount} negative selections`}
          >
            <div
              className="h-full bg-chip-positive"
              style={{ width: `${positiveShare}%` }}
            />
            <div
              className="h-full bg-chip-negative"
              style={{ width: `${negativeShare}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary" />
      )}

      {neutralCount > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Minus className="size-3.5 text-chip-neutral" aria-hidden />
          {neutralCount} neutral observation{neutralCount === 1 ? "" : "s"} (not
          scored)
        </p>
      )}
    </section>
  );
}
