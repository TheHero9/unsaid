import { UserPen } from "lucide-react";

import type { CriterionScore } from "@/lib/aggregate";

import { SectionLabel } from "./SectionLabel";

const SCALE_MAX = 5;

function formatAverage(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function ScoreRow({ score }: { score: CriterionScore }) {
  const pct = Math.max(0, Math.min(100, (score.average / SCALE_MAX) * 100));
  return (
    <li>
      <div className="mb-[7px] flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-[14.5px] font-semibold text-text">
          {score.label}
        </span>
        <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums text-text">
          {formatAverage(score.average)}
          <span className="font-medium text-text-4">/{SCALE_MAX}</span>
          {score.count > 1 && (
            <span className="ml-1.5 font-medium text-text-4">({score.count})</span>
          )}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-text"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

/**
 * Aggregated 1-5 criteria. Event-wide criteria show the average across jurors;
 * juror-personal criteria are listed separately. No juror identity ever reaches
 * this component.
 */
export function CriteriaScores({
  criteriaScores,
  personalScores,
}: {
  criteriaScores: CriterionScore[];
  personalScores: CriterionScore[];
}) {
  if (criteriaScores.length === 0 && personalScores.length === 0) return null;

  return (
    <section aria-label="Scores" className="space-y-6">
      {criteriaScores.length > 0 && (
        <div>
          <SectionLabel hint="1-5 average">Scores</SectionLabel>
          <ul className="flex flex-col gap-4">
            {criteriaScores.map((score) => (
              <ScoreRow key={score.label} score={score} />
            ))}
          </ul>
        </div>
      )}

      {personalScores.length > 0 && (
        <div>
          <SectionLabel
            hint={
              <span className="inline-flex items-center gap-1.5">
                <UserPen className="size-3.5" aria-hidden />
                juror-added
              </span>
            }
          >
            Their own criteria
          </SectionLabel>
          <ul className="flex flex-col gap-4">
            {personalScores.map((score) => (
              <ScoreRow key={score.label} score={score} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
