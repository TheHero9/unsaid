import type { ChipCount } from "@/lib/aggregate";
import type { ChipSentiment } from "@/lib/chips";

interface ChipSummaryProps {
  chipCounts: ChipCount[];
}

const SENTIMENT_STYLES: Record<
  ChipSentiment,
  { bar: string; track: string; count: string }
> = {
  positive: {
    bar: "bg-chip-positive",
    track: "bg-chip-positive-muted",
    count: "text-chip-positive",
  },
  negative: {
    bar: "bg-chip-negative",
    track: "bg-chip-negative-muted",
    count: "text-chip-negative",
  },
  neutral: {
    bar: "bg-chip-neutral",
    track: "bg-chip-neutral-muted",
    count: "text-chip-neutral",
  },
};

/**
 * THE STAR of the founder page. Each used chip becomes a sentiment-coloured
 * horizontal bar whose width is proportional to how many jurors selected it.
 * Most-used first; the top item reads big and confident ("5 - unclear ask").
 */
export function ChipSummary({ chipCounts }: ChipSummaryProps) {
  const maxCount = chipCounts.reduce(
    (max, chip) => Math.max(max, chip.jurorCount),
    0
  );

  return (
    <section aria-label="What jurors noticed" className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        What jurors noticed
      </h2>

      <ul className="space-y-2.5">
        {chipCounts.map((chip, index) => {
          const styles = SENTIMENT_STYLES[chip.sentiment];
          const widthPct =
            maxCount > 0 ? Math.max((chip.jurorCount / maxCount) * 100, 8) : 0;
          const isTop = index === 0;

          return (
            <li
              key={`${chip.label}-${chip.sentiment}`}
              className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10"
            >
              {/* Proportional fill behind the label. */}
              <div
                className={`absolute inset-y-0 left-0 ${styles.track}`}
                style={{ width: `${widthPct}%` }}
                aria-hidden
              />
              <div
                className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`}
                aria-hidden
              />

              <div className="relative flex items-center gap-3 px-4 py-3">
                <span
                  className={`${styles.count} ${
                    isTop ? "text-2xl" : "text-lg"
                  } font-bold tabular-nums leading-none`}
                >
                  {chip.jurorCount}
                </span>
                <span
                  className={`${
                    isTop ? "text-base font-medium" : "text-sm"
                  } text-foreground`}
                >
                  {chip.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
