import { formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChipSentiment } from "@/lib/chips";

export interface JurorSubmission {
  id: string;
  note: string | null;
  createdAt: string;
  chips: { id: string; label: string; sentiment: ChipSentiment }[];
  ratings: { criterionId: string; label: string; score: number }[];
}

const badgeBySentiment: Record<ChipSentiment, string> = {
  positive: "border-chip-positive bg-chip-positive-muted text-chip-positive",
  negative: "border-chip-negative bg-chip-negative-muted text-chip-negative",
  neutral: "border-chip-neutral bg-chip-neutral-muted text-chip-neutral",
};

/**
 * The juror's OWN previous submissions for this pitch, newest first.
 * Shows only feedback belonging to this juror (cookie-verified server-side) -
 * never anyone else's, so the give-but-never-read access model holds.
 */
export function YourSubmissions({
  submissions,
}: {
  submissions: JurorSubmission[];
}) {
  if (submissions.length === 0) return null;

  return (
    <section aria-label="Your submitted feedback" className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <History className="size-4" aria-hidden />
        Your feedback ({submissions.length})
      </h2>

      <ul className="space-y-2.5">
        {submissions.map((submission) => (
          <li
            key={submission.id}
            className="space-y-2.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            {submission.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {submission.chips.map((chip) => (
                  <span
                    key={chip.id}
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      badgeBySentiment[chip.sentiment]
                    )}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            )}
            {submission.ratings.length > 0 && (
              <dl className="space-y-1">
                {submission.ratings.map((rating) => (
                  <div
                    key={rating.criterionId}
                    className="flex items-baseline justify-between gap-2 text-sm"
                  >
                    <dt className="min-w-0 truncate text-muted-foreground">
                      {rating.label}
                    </dt>
                    <dd className="shrink-0 font-medium tabular-nums text-foreground">
                      {rating.score}/5
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {submission.note && (
              <p className="text-sm leading-relaxed text-foreground">
                {submission.note}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(submission.createdAt), {
                addSuffix: true,
              })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
