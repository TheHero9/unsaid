import type { ChipCount } from "@/lib/aggregate";
import type { ChipSentiment } from "@/lib/chips";

import { SectionLabel } from "./SectionLabel";

interface ChipSummaryProps {
  chipCounts: ChipCount[];
}

const FILL: Record<ChipSentiment, string> = {
  positive: "bg-pos-wash border-pos",
  negative: "bg-neg-wash border-neg",
  neutral: "bg-neu-wash border-neu",
};

const TONE: Record<ChipSentiment, string> = {
  positive: "text-pos",
  negative: "text-neg",
  neutral: "text-neu",
};

/**
 * THE STAR of the founder page. Each used chip becomes a horizontal bar whose
 * fill width is proportional to how many jurors selected it, in the chip's
 * sentiment colour. Most-used first.
 */
export function ChipSummary({ chipCounts }: ChipSummaryProps) {
  if (chipCounts.length === 0) return null;

  const max = chipCounts.reduce((m, c) => Math.max(m, c.jurorCount), 1);

  return (
    <section aria-label="What jurors noticed">
      <SectionLabel>What jurors noticed</SectionLabel>
      <ul className="flex flex-col gap-2">
        {chipCounts.map((chip) => {
          const width = Math.max((chip.jurorCount / max) * 100, 6);
          return (
            <li
              key={`${chip.label}-${chip.sentiment}`}
              className="nondit-bar-in relative flex h-[46px] items-center gap-[11px] overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div
                aria-hidden
                className={`absolute inset-y-0 left-0 border-r-2 ${FILL[chip.sentiment]}`}
                style={{ width: `${width}%` }}
              />
              <span
                className={`relative ml-[14px] min-w-[14px] font-mono text-[14px] font-bold tabular-nums ${TONE[chip.sentiment]}`}
              >
                {chip.jurorCount}
              </span>
              <span className="relative text-[14.5px] font-medium text-text">
                {chip.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
