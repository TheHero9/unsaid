"use client";

import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface PitchSwitcherProps {
  idx: number;
  total: number;
  pitchName: string;
  /** Indices of pitches this juror has already submitted. */
  doneSet: ReadonlySet<number>;
  onPrev: () => void;
  onNext: () => void;
  onOpen: () => void;
}

/**
 * Sticky pitch switcher (HERO). Prev / center pill / next + a progress strip.
 * The center pill shows the running index (no "live" concept - the juror moves
 * themselves) and opens the jump sheet. Always one tap to the next pitch.
 */
export function PitchSwitcher({
  idx,
  total,
  pitchName,
  doneSet,
  onPrev,
  onNext,
  onOpen,
}: PitchSwitcherProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2 bg-gradient-to-b from-background from-70% to-transparent px-3 pb-2.5 pt-2">
      <div className="flex items-stretch gap-2">
        <Arrow direction="prev" disabled={idx === 0} onClick={onPrev} />
        <button
          type="button"
          onClick={onOpen}
          aria-label="Jump to a different pitch"
          className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3.5 transition-colors active:bg-surface-3"
        >
          <span className="shrink-0 font-mono text-[11px] font-bold tracking-[0.06em] text-text-3">
            {String(idx + 1).padStart(2, "0")}
            <span className="opacity-50">/{String(total).padStart(2, "0")}</span>
          </span>
          <span className="min-w-0 flex-1 truncate text-left font-serif text-[19px] font-semibold tracking-[-0.01em] text-text">
            {pitchName}
          </span>
          <ChevronDown className="size-[18px] shrink-0 text-text-3" aria-hidden />
        </button>
        <Arrow direction="next" disabled={idx === total - 1} onClick={onNext} />
      </div>

      <div className="flex gap-[3px] px-0.5" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-[3px] flex-1 rounded-full transition-colors",
              i === idx
                ? "bg-text"
                : doneSet.has(i)
                  ? "bg-pos/80"
                  : "bg-border-strong"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous pitch" : "Next pitch"}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-text-2 transition-opacity disabled:opacity-40 active:scale-[0.97]"
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
