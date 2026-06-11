"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, Send } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { ChipSentiment } from "@/lib/chips";
import { RATING_MAX, RATING_MIN, NOTE_MAX_LENGTH } from "@/schemas/feedback";
import {
  loadCaptureCache,
  saveCaptureCache,
  type CaptureCache,
} from "@/lib/capture-cache";
import {
  addCustomChip,
  addCustomCriterion,
  submitFeedback,
} from "@/app/e/[eventCode]/p/[pitchId]/actions";

import { PitchSwitcher } from "./PitchSwitcher";
import { JumpSheet } from "./JumpSheet";
import { AddOwnChip, type AddedChip } from "./AddOwnChip";
import { AddOwnCriterion, type AddedCriterion } from "./AddOwnCriterion";
import { CHIP_ACTIVE, CHIP_IDLE, SENTIMENT_ORDER } from "./sentiment";

export interface CapturePitch {
  id: string;
  name: string;
  description: string | null;
}
export interface CaptureChip {
  id: string;
  label: string;
  sentiment: ChipSentiment;
}
export interface CaptureCriterion {
  id: string;
  label: string;
}

interface CaptureScreenProps {
  eventCode: string;
  jurorId: string;
  pitches: CapturePitch[];
  initialPitchId: string;
  chips: CaptureChip[];
  criteria: CaptureCriterion[];
  /** Pitch ids this juror has already submitted feedback for. */
  submittedPitchIds: string[];
}

interface Draft {
  chipIds: Set<string>;
  scores: Map<string, number>;
  note: string;
}

const blankDraft = (): Draft => ({
  chipIds: new Set(),
  scores: new Map(),
  note: "",
});

const SCORES = Array.from(
  { length: RATING_MAX - RATING_MIN + 1 },
  (_, i) => RATING_MIN + i
);

export function CaptureScreen({
  eventCode,
  jurorId,
  pitches,
  initialPitchId,
  chips: initialChips,
  criteria: initialCriteria,
  submittedPitchIds,
}: CaptureScreenProps) {
  const initialIdx = Math.max(
    0,
    pitches.findIndex((p) => p.id === initialPitchId)
  );

  const [idx, setIdx] = useState(initialIdx);
  const [chips, setChips] = useState<CaptureChip[]>(initialChips);
  const [criteria, setCriteria] =
    useState<CaptureCriterion[]>(initialCriteria);
  const [drafts, setDrafts] = useState<Map<string, Draft>>(new Map());
  const [doneSet, setDoneSet] = useState<Set<number>>(
    () =>
      new Set(
        submittedPitchIds
          .map((id) => pitches.findIndex((p) => p.id === id))
          .filter((i) => i >= 0)
      )
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [anim, setAnim] = useState<"r" | "l" | null>(null);
  const [pending, startTransition] = useTransition();

  // Ids that came from the server this load - everything else in chips/criteria
  // is a juror-added custom item and is what we mirror into the local cache.
  const serverChipIds = useRef(new Set(initialChips.map((c) => c.id)));
  const serverCriterionIds = useRef(
    new Set(initialCriteria.map((c) => c.id))
  );
  const hydrated = useRef(false);

  // Hydrate from localStorage once on mount: re-show the juror's custom chips +
  // criteria (so a slider added on one pitch survives a refresh and appears on
  // every pitch) and restore each pitch's draft so the juror sees exactly what
  // they rated. State updates run asynchronously (never synchronously in the
  // effect body) so the first client render matches the server markup.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cache = loadCaptureCache(eventCode, jurorId);
      if (cancelled) return;

      if (cache.customChips.length > 0) {
        setChips((prev) => {
          const seen = new Set(prev.map((c) => c.id));
          const extra = cache.customChips.filter((c) => !seen.has(c.id));
          return extra.length > 0 ? [...prev, ...extra] : prev;
        });
      }

      if (cache.customCriteria.length > 0) {
        setCriteria((prev) => {
          const seen = new Set(prev.map((c) => c.id));
          const extra = cache.customCriteria.filter((c) => !seen.has(c.id));
          return extra.length > 0 ? [...prev, ...extra] : prev;
        });
      }

      if (Object.keys(cache.drafts).length > 0) {
        const restored = new Map<string, Draft>();
        for (const [pitchId, d] of Object.entries(cache.drafts)) {
          restored.set(pitchId, {
            chipIds: new Set(d.chipIds),
            scores: new Map(Object.entries(d.scores)),
            note: d.note,
          });
        }
        setDrafts(restored);
      }

      if (cache.done.length > 0) {
        setDoneSet((prev) => {
          const next = new Set(prev);
          for (const pid of cache.done) {
            const i = pitches.findIndex((p) => p.id === pid);
            if (i >= 0) next.add(i);
          }
          return next;
        });
      }

      hydrated.current = true;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change (after hydration) so a refresh / re-open restores
  // custom chips, custom criteria, drafts, and submitted state.
  useEffect(() => {
    if (!hydrated.current) return;
    const cache: CaptureCache = {
      customChips: chips.filter((c) => !serverChipIds.current.has(c.id)),
      customCriteria: criteria.filter(
        (c) => !serverCriterionIds.current.has(c.id)
      ),
      drafts: Object.fromEntries(
        Array.from(drafts, ([pitchId, d]) => [
          pitchId,
          {
            chipIds: Array.from(d.chipIds),
            scores: Object.fromEntries(d.scores),
            note: d.note,
          },
        ])
      ),
      done: Array.from(doneSet)
        .map((i) => pitches[i]?.id)
        .filter((id): id is string => Boolean(id)),
    };
    saveCaptureCache(eventCode, jurorId, cache);
  }, [chips, criteria, drafts, doneSet, eventCode, jurorId, pitches]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const pitch = pitches[idx];
  const draft = drafts.get(pitch.id) ?? blankDraft();

  const orderedChips = useMemo(() => {
    return [...chips].sort(
      (a, b) =>
        SENTIMENT_ORDER.indexOf(a.sentiment) -
        SENTIMENT_ORDER.indexOf(b.sentiment)
    );
  }, [chips]);

  const setDraft = (pitchId: string, updater: (d: Draft) => Draft) => {
    setDrafts((prev) => {
      const next = new Map(prev);
      next.set(pitchId, updater(prev.get(pitchId) ?? blankDraft()));
      return next;
    });
  };

  const go = (next: number) => {
    if (next === idx || next < 0 || next >= pitches.length) return;
    setAnim(next > idx ? "r" : "l");
    setIdx(next);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `/e/${eventCode}/p/${pitches[next].id}`
      );
    }
    window.setTimeout(() => setAnim(null), 320);
  };

  const toggleChip = (chipId: string) => {
    setDraft(pitch.id, (d) => {
      const chipIds = new Set(d.chipIds);
      if (chipIds.has(chipId)) chipIds.delete(chipId);
      else chipIds.add(chipId);
      return { ...d, chipIds };
    });
  };

  const setScore = (criterionId: string, score: number | null) => {
    setDraft(pitch.id, (d) => {
      const scores = new Map(d.scores);
      if (score === null) scores.delete(criterionId);
      else scores.set(criterionId, score);
      return { ...d, scores };
    });
  };

  const setNote = (note: string) =>
    setDraft(pitch.id, (d) => ({ ...d, note }));

  const handleAddChip = async (
    label: string,
    sentiment: ChipSentiment
  ): Promise<AddedChip> => {
    const res = await addCustomChip(eventCode, pitch.id, { label, sentiment });
    if (!res.ok) throw new Error(res.error);
    return res.chip;
  };

  const handleChipAdded = (chip: AddedChip) => {
    setChips((prev) => (prev.some((c) => c.id === chip.id) ? prev : [...prev, chip]));
    setDraft(pitch.id, (d) => ({
      ...d,
      chipIds: new Set(d.chipIds).add(chip.id),
    }));
  };

  const handleAddCriterion = async (label: string): Promise<AddedCriterion> => {
    const res = await addCustomCriterion(eventCode, pitch.id, { label });
    if (!res.ok) throw new Error(res.error);
    return res.criterion;
  };

  // A juror-added criterion joins the shared list, so it shows on EVERY pitch,
  // not just the one it was created on, and is cached for the next visit.
  const handleCriterionAdded = (criterion: AddedCriterion) => {
    setCriteria((prev) =>
      prev.some((c) => c.id === criterion.id) ? prev : [...prev, criterion]
    );
  };

  const noticed = draft.chipIds.size;
  const rated = draft.scores.size;
  const done = doneSet.has(idx);
  const canSubmit = noticed > 0 || rated > 0 || draft.note.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const payload = {
      chipIds: Array.from(draft.chipIds),
      note: draft.note.trim(),
      ratings: Array.from(draft.scores, ([criterionId, score]) => ({
        criterionId,
        score,
      })),
    };

    startTransition(async () => {
      const res = await submitFeedback(eventCode, pitch.id, payload);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      const newDone = new Set(doneSet).add(idx);
      setDoneSet(newDone);

      let nextIdx = -1;
      for (let k = 1; k <= pitches.length; k++) {
        const cand = (idx + k) % pitches.length;
        if (!newDone.has(cand)) {
          nextIdx = cand;
          break;
        }
      }

      if (nextIdx === -1) {
        toast.success("All caught up - every pitch logged.");
      } else {
        toast.success(`Saved. Next up: ${pitches[nextIdx].name}`);
        window.setTimeout(() => go(nextIdx), 420);
      }
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!touch.current) return;
    const dx = e.clientX - touch.current.x;
    const dy = e.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) go(Math.min(idx + 1, pitches.length - 1));
      else go(Math.max(idx - 1, 0));
    }
  };

  const statusText = pending
    ? "Saving..."
    : done
      ? "Submitted"
      : noticed || rated
        ? `${noticed} noticed · ${rated} rated`
        : "Tap a chip to start";

  return (
    <>
      <div className="flex h-[100dvh] flex-col">
        <PitchSwitcher
          idx={idx}
          total={pitches.length}
          pitchName={pitch.name}
          doneSet={doneSet}
          onPrev={() => go(idx - 1)}
          onNext={() => go(idx + 1)}
          onOpen={() => setSheetOpen(true)}
        />

        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          className="nondit-scroll flex-1 overflow-y-auto"
        >
          <div
            key={idx}
            className={cn(
              anim === "r" && "nondit-slide-r",
              anim === "l" && "nondit-slide-l"
            )}
          >
            <div className="mx-auto w-full max-w-md px-[18px] pb-6 pt-1">
              {pitch.description && (
                <p className="mb-5 mt-0.5 text-[14.5px] leading-[1.45] text-text-2">
                  {pitch.description}
                </p>
              )}

              <SectionLabel hint={noticed ? `${noticed} selected` : "the priority"}>
                Tap what you noticed
              </SectionLabel>
              <div className="mb-[26px] flex flex-wrap gap-2">
                {orderedChips.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.label}
                    sentiment={c.sentiment}
                    active={draft.chipIds.has(c.id)}
                    onToggle={() => toggleChip(c.id)}
                  />
                ))}
                <AddOwnChip onAdd={handleAddChip} onAdded={handleChipAdded} />
              </div>

              <SectionLabel hint="optional · tap again to clear">
                Rate the pitch
              </SectionLabel>
              <div className="mb-6 flex flex-col gap-4">
                {criteria.map((cr) => (
                  <RatingRow
                    key={cr.id}
                    label={cr.label}
                    value={draft.scores.get(cr.id) ?? null}
                    onSet={(v) => setScore(cr.id, v)}
                  />
                ))}
                <AddOwnCriterion
                  onAdd={handleAddCriterion}
                  onAdded={handleCriterionAdded}
                />
              </div>

              <SectionLabel hint="optional">Add a one-line note</SectionLabel>
              <input
                value={draft.note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={NOTE_MAX_LENGTH}
                placeholder="One honest sentence they'd never hear otherwise..."
                aria-label="One-line note"
                autoComplete="off"
                className="h-[50px] w-full rounded-xl border border-border bg-surface-2 px-[15px] text-[15px] text-text outline-none placeholder:text-text-4 focus-visible:border-border-strong"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-gradient-to-t from-background from-[26%] to-transparent px-4 pb-4 pt-2.5">
          <div className="mx-auto flex w-full max-w-md items-center gap-3">
            <span className="shrink-0 whitespace-nowrap text-[12.5px] font-medium text-text-3">
              {statusText}
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || pending}
              className={cn(
                "flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[14px] text-[16px] font-semibold transition-colors active:scale-[0.99]",
                canSubmit
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-3 text-text-4"
              )}
            >
              {done ? "Update & next" : "Submit & next"}
              <Send className="size-[17px]" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {sheetOpen && (
        <JumpSheet
          pitches={pitches}
          idx={idx}
          doneSet={doneSet}
          onClose={() => setSheetOpen(false)}
          onPick={(i) => {
            setSheetOpen(false);
            go(i);
          }}
        />
      )}
    </>
  );
}

function SectionLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-[11px] flex items-baseline justify-between">
      <span className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-text-3">
        {children}
      </span>
      {hint && <span className="text-[12px] text-text-4">{hint}</span>}
    </div>
  );
}

function Chip({
  label,
  sentiment,
  active,
  onToggle,
}: {
  label: string;
  sentiment: ChipSentiment;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        "inline-flex min-h-10 select-none items-center gap-1.5 rounded-full border py-[9px] text-[14.5px] font-medium tracking-[-0.01em] transition-all active:scale-[0.96]",
        active
          ? cn("pl-[11px] pr-[13px]", CHIP_ACTIVE[sentiment])
          : cn("bg-transparent px-3.5", CHIP_IDLE[sentiment])
      )}
    >
      {active && <Check className="size-[15px] shrink-0" aria-hidden />}
      <span>{label}</span>
    </button>
  );
}

function RatingRow({
  label,
  value,
  onSet,
}: {
  label: string;
  value: number | null;
  onSet: (v: number | null) => void;
}) {
  return (
    <div>
      <div className="mb-[7px] flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-[14.5px] font-semibold text-text">
          {label}
        </span>
        <span
          className={cn(
            "shrink-0 font-mono text-[12.5px] font-semibold tabular-nums",
            value != null ? "text-text-2" : "text-text-4"
          )}
        >
          {value != null ? `${value}/${RATING_MAX}` : "-"}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label={`Rate ${label} from ${RATING_MIN} to ${RATING_MAX}`}
        className="grid grid-cols-5 gap-1.5"
      >
        {SCORES.map((n) => {
          const filled = value != null && n <= value;
          const head = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={head}
              aria-label={`${n} of ${RATING_MAX}`}
              onClick={() => onSet(head ? null : n)}
              className={cn(
                "h-[42px] rounded-[10px] border text-[15px] font-semibold tabular-nums transition-colors active:scale-[0.97]",
                filled ? "bg-surface-3 text-text" : "text-text-3",
                head
                  ? "border-border-strong"
                  : filled
                    ? "border-transparent"
                    : "border-border"
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
