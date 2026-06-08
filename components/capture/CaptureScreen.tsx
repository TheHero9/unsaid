"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ChipSentiment } from "@/lib/chips";
import {
  addCustomChip,
  addCustomCriterion,
  submitFeedback,
} from "@/app/e/[eventCode]/p/[pitchId]/actions";

import { ChipsGrid, type CaptureChip } from "./ChipsGrid";
import { NoteInput } from "./NoteInput";
import { RatingRow } from "./RatingRow";
import { AddCriterionInline, type AddedCriterion } from "./AddCriterionInline";
import { YourSubmissions, type JurorSubmission } from "./YourSubmissions";
import type { AddedChip } from "./AddChipInline";

export interface CaptureCriterion {
  id: string;
  label: string;
}

interface CaptureScreenProps {
  eventCode: string;
  pitchId: string;
  pitchName: string;
  initialChips: CaptureChip[];
  initialCriteria: CaptureCriterion[];
  submissions: JurorSubmission[];
}

export function CaptureScreen({
  eventCode,
  pitchId,
  pitchName,
  initialChips,
  initialCriteria,
  submissions,
}: CaptureScreenProps) {
  const router = useRouter();
  const [chips, setChips] = useState<CaptureChip[]>(initialChips);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [criteria, setCriteria] = useState<CaptureCriterion[]>(initialCriteria);
  const [scores, setScores] = useState<Map<string, number>>(new Map());
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const toggleChip = (chipId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(chipId)) next.delete(chipId);
      else next.add(chipId);
      return next;
    });
  };

  const handleAdd = async (
    label: string,
    sentiment: ChipSentiment
  ): Promise<AddedChip> => {
    const res = await addCustomChip(eventCode, pitchId, { label, sentiment });
    if (!res.ok) throw new Error(res.error);
    return res.chip;
  };

  const handleAdded = (chip: AddedChip) => {
    // Add to the grid if new; always select it.
    setChips((prev) =>
      prev.some((c) => c.id === chip.id) ? prev : [...prev, chip]
    );
    setSelectedIds((prev) => new Set(prev).add(chip.id));
  };

  const handleAddCriterion = async (label: string): Promise<AddedCriterion> => {
    const res = await addCustomCriterion(eventCode, pitchId, { label });
    if (!res.ok) throw new Error(res.error);
    return res.criterion;
  };

  const handleCriterionAdded = (criterion: AddedCriterion) => {
    setCriteria((prev) =>
      prev.some((c) => c.id === criterion.id) ? prev : [...prev, criterion]
    );
  };

  const setScore = (criterionId: string, score: number | null) => {
    setScores((prev) => {
      const next = new Map(prev);
      if (score === null) next.delete(criterionId);
      else next.set(criterionId, score);
      return next;
    });
  };

  const canSubmit =
    selectedIds.size > 0 || scores.size > 0 || note.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Tap at least one chip, rate a criterion, or write a note.");
      return;
    }

    const payload = {
      chipIds: Array.from(selectedIds),
      note: note.trim(),
      ratings: Array.from(scores, ([criterionId, score]) => ({
        criterionId,
        score,
      })),
    };

    startTransition(async () => {
      const res = await submitFeedback(eventCode, pitchId, payload);
      if (res.ok) {
        toast.success("Feedback sent");
        setSelectedIds(new Set());
        setScores(new Map());
        setNote("");
        // Re-fetch the server page so the new submission shows up below.
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/90 px-2 py-2 backdrop-blur">
        <Button asChild variant="ghost" size="icon-lg" aria-label="Back to pitch list">
          <Link href={`/e/${eventCode}`}>
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
          {pitchName}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 pb-32 pt-5">
        <section className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Tap what you noticed
          </p>
          <ChipsGrid
            chips={chips}
            selectedIds={selectedIds}
            onToggle={toggleChip}
            onAdd={handleAdd}
            onAdded={handleAdded}
            disabled={pending}
          />
        </section>

        <section className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            Rate the pitch
          </p>
          {criteria.map((criterion) => (
            <RatingRow
              key={criterion.id}
              label={criterion.label}
              score={scores.get(criterion.id) ?? null}
              onScore={(score) => {
                if (!pending) setScore(criterion.id, score);
              }}
              disabled={pending}
            />
          ))}
          <AddCriterionInline
            onAdd={handleAddCriterion}
            onAdded={handleCriterionAdded}
          />
        </section>

        <section>
          <NoteInput value={note} onChange={setNote} disabled={pending} />
        </section>

        <YourSubmissions submissions={submissions} />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-md">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full text-base"
            onClick={handleSubmit}
            disabled={pending || !canSubmit}
          >
            <Send className="size-5" />
            {pending ? "Sending..." : "Submit feedback"}
          </Button>
        </div>
      </div>
    </div>
  );
}
