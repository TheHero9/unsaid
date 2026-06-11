import { formatDistanceToNow } from "date-fns";
import { Quote, UserPen } from "lucide-react";

import type { JurorSubmission } from "@/lib/aggregate";
import type { ChipSentiment } from "@/lib/chips";

import { SectionLabel } from "./SectionLabel";

interface JurorBreakdownProps {
  submissions: JurorSubmission[];
}

const PILL: Record<ChipSentiment, string> = {
  positive: "text-pos bg-pos-wash border-pos-bd",
  negative: "text-neg bg-neg-wash border-neg-bd",
  neutral: "text-neu bg-neu-wash border-neu-bd",
};

/**
 * Per-juror breakdown - one card per submission so the founder can read each
 * juror's take as a whole (which chips they tapped, how they scored, their
 * note) rather than only the blended totals. Still ANONYMOUS: jurors are
 * "Juror 1", "Juror 2", ... in submission order - no name or id ever reaches
 * here (see the aggregate boundary). Cards are ordered oldest-first to match.
 */
export function JurorBreakdown({ submissions }: JurorBreakdownProps) {
  if (submissions.length === 0) return null;

  return (
    <section aria-label="Juror by juror">
      <SectionLabel hint={`${submissions.length}`}>Juror by juror</SectionLabel>
      <ul className="flex flex-col gap-3">
        {submissions.map((s) => (
          <li
            key={s.index}
            className="nondit-bar-in rounded-[14px] border border-border bg-surface p-[15px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif text-[16px] font-semibold tracking-[-0.01em] text-text">
                Juror {s.index}
              </span>
              <span className="shrink-0 text-[12px] text-text-4">
                {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
              </span>
            </div>

            {s.chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.chips.map((chip, i) => (
                  <span
                    key={`${chip.label}-${i}`}
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[13px] font-medium ${PILL[chip.sentiment]}`}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            )}

            {s.scores.length > 0 && (
              <ul className="mt-3.5 flex flex-col gap-2">
                {s.scores.map((score, i) => (
                  <li
                    key={`${score.label}-${i}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-[13.5px] text-text-2">
                      {score.personal && (
                        <UserPen
                          className="size-3 shrink-0 text-text-4"
                          aria-hidden
                        />
                      )}
                      {score.label}
                    </span>
                    <ScoreDots value={score.score} />
                  </li>
                ))}
              </ul>
            )}

            {s.note && (
              <div className="mt-3.5 flex gap-2 border-t border-border pt-3">
                <Quote
                  className="mt-0.5 size-3.5 shrink-0 text-text-4"
                  aria-hidden
                />
                <p className="text-[14px] leading-[1.45] text-text">{s.note}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

const SCALE_MAX = 5;

/** Compact 1-5 score as filled/empty dots + the number, for a per-juror row. */
function ScoreDots({ value }: { value: number }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: SCALE_MAX }, (_, i) => (
          <span
            key={i}
            className={`size-[7px] rounded-full ${
              i < value ? "bg-text" : "bg-surface-3"
            }`}
          />
        ))}
      </span>
      <span className="font-mono text-[13px] font-bold tabular-nums text-text">
        {value}
        <span className="font-medium text-text-4">/{SCALE_MAX}</span>
      </span>
    </span>
  );
}
