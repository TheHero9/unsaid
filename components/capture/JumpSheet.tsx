"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface JumpPitch {
  id: string;
  name: string;
  description: string | null;
}

interface JumpSheetProps {
  pitches: JumpPitch[];
  idx: number;
  /** Indices already submitted by this juror. */
  doneSet: ReadonlySet<number>;
  onPick: (i: number) => void;
  onClose: () => void;
}

/**
 * "Jump to pitch" bottom sheet. One row per pitch, current row highlighted,
 * a green check on rows the juror has already submitted. Tapping a row switches
 * instantly (no reload). No "live" marker - the juror decides where to go.
 */
export function JumpSheet({
  pitches,
  idx,
  doneSet,
  onPick,
  onClose,
}: JumpSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="nondit-fade-in absolute inset-0 bg-black/60"
      />
      <div className="nondit-sheet-up relative flex max-h-[78%] flex-col rounded-t-[22px] border-t border-border-2 bg-surface pb-7">
        <div className="flex justify-center pt-2.5">
          <span className="h-1 w-9 rounded-full bg-border-strong" />
        </div>
        <div className="flex items-center justify-between px-[18px] pb-2 pt-2.5">
          <span className="text-[17px] font-bold tracking-[-0.01em] text-text">
            Jump to pitch
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-[9px] bg-surface-3 text-text-2"
          >
            <X className="size-[17px]" aria-hidden />
          </button>
        </div>

        <div className="nondit-scroll overflow-y-auto px-3 pb-1 pt-0.5">
          {pitches.map((p, i) => {
            const done = doneSet.has(i);
            const selected = i === idx;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => onPick(i)}
                className={cn(
                  "mb-0.5 flex w-full items-center gap-3 rounded-xl border px-3 py-[11px] text-left transition-colors",
                  selected
                    ? "border-border-2 bg-surface-3"
                    : "border-transparent active:bg-surface-2"
                )}
              >
                <span
                  className={cn(
                    "flex size-[30px] shrink-0 items-center justify-center rounded-[9px] border border-border font-mono text-[13px] font-bold",
                    done
                      ? "bg-pos-wash text-pos"
                      : "bg-surface-2 text-text-3"
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-[17px] font-semibold text-text">
                    {p.name}
                  </span>
                  {p.description && (
                    <span className="mt-px block truncate text-[12.5px] text-text-3">
                      {p.description}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[11.5px] font-semibold",
                    done ? "text-pos" : "text-text-4"
                  )}
                >
                  {done ? "done" : "-"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
