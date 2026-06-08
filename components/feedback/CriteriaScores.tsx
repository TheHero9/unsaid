import { SlidersHorizontal, UserPen } from "lucide-react";

import type { CriterionScore } from "@/lib/aggregate";

const SCALE_MAX = 5;

function formatAverage(value: number): string {
  return (Math.round(value * 10) / 10).toString();
}

function ScoreRow({ score }: { score: CriterionScore }) {
  const pct = Math.max(0, Math.min(100, (score.average / SCALE_MAX) * 100));

  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 truncate font-medium text-foreground">
          {score.label}
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">
            {formatAverage(score.average)}
          </span>
          /{SCALE_MAX}
          {score.count > 1 && <span className="ml-1.5">({score.count})</span>}
        </span>
      </div>
      <div
        role="img"
        aria-label={`${score.label}: ${formatAverage(score.average)} out of ${SCALE_MAX}`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

/**
 * Aggregated 1-5 criteria for the founder view. Event-wide criteria show the
 * average across jurors; juror-personal criteria are listed separately as
 * anonymous individual scores. No juror identity ever reaches this component.
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
    <section aria-label="Scores" className="space-y-5">
      {criteriaScores.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="size-4" aria-hidden />
            Scores
          </h2>
          <ul className="space-y-3">
            {criteriaScores.map((score) => (
              <ScoreRow key={score.label} score={score} />
            ))}
          </ul>
        </div>
      )}

      {personalScores.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <UserPen className="size-4" aria-hidden />
            Jurors&apos; own criteria
          </h2>
          <ul className="space-y-3">
            {personalScores.map((score) => (
              <ScoreRow key={score.label} score={score} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
