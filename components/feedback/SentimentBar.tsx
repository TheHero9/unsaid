interface SentimentBarProps {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

/**
 * Compact at-a-glance read: one proportional stacked bar of positive / neutral
 * / critical chip SELECTIONS, with the counts beneath. No verdict sentence -
 * the bar speaks for itself.
 */
export function SentimentBar({
  positiveCount,
  negativeCount,
  neutralCount,
}: SentimentBarProps) {
  const total = positiveCount + neutralCount + negativeCount || 1;
  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <section aria-label="Overall read" className="space-y-2.5">
      <div
        className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-surface-3"
        role="img"
        aria-label={`${positiveCount} positive, ${neutralCount} neutral, ${negativeCount} critical selections`}
      >
        {positiveCount > 0 && (
          <span className="h-full bg-pos" style={{ width: pct(positiveCount) }} />
        )}
        {neutralCount > 0 && (
          <span className="h-full bg-neu" style={{ width: pct(neutralCount) }} />
        )}
        {negativeCount > 0 && (
          <span className="h-full bg-neg" style={{ width: pct(negativeCount) }} />
        )}
      </div>
      <div className="flex justify-between text-[12px] font-semibold tabular-nums">
        <span className="text-pos">{positiveCount} positive</span>
        {neutralCount > 0 && (
          <span className="text-neu">{neutralCount} neutral</span>
        )}
        <span className="text-neg">{negativeCount} critical</span>
      </div>
    </section>
  );
}
