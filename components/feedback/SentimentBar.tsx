import { SectionLabel } from "./SectionLabel";

interface SentimentBarProps {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

/**
 * Compact at-a-glance read: one proportional stacked bar of positive / neutral
 * / critical chip TAPS, with the counts beneath. The header spells out that
 * these are chip taps (not jurors), so "4 positive" can't be misread as four
 * people. No verdict sentence - the bar speaks for itself.
 */
export function SentimentBar({
  positiveCount,
  negativeCount,
  neutralCount,
}: SentimentBarProps) {
  const taps = positiveCount + neutralCount + negativeCount;
  const total = taps || 1;
  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <section aria-label="Overall read" className="space-y-2.5">
      <SectionLabel hint={`${taps} chip ${taps === 1 ? "tap" : "taps"}`}>
        Overall read
      </SectionLabel>
      <div
        className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-surface-3"
        role="img"
        aria-label={`${positiveCount} positive, ${neutralCount} neutral, ${negativeCount} critical chip taps`}
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
