"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ChipSentiment } from "@/lib/chips";
import {
  addCustomChip,
  submitFeedback,
} from "@/app/e/[eventCode]/p/[pitchId]/actions";

import { ChipsGrid, type CaptureChip } from "./ChipsGrid";
import { NoteInput } from "./NoteInput";
import type { AddedChip } from "./AddChipInline";

interface CaptureScreenProps {
  eventCode: string;
  pitchId: string;
  pitchName: string;
  initialChips: CaptureChip[];
}

export function CaptureScreen({
  eventCode,
  pitchId,
  pitchName,
  initialChips,
}: CaptureScreenProps) {
  const [chips, setChips] = useState<CaptureChip[]>(initialChips);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  const canSubmit = selectedIds.size > 0 || note.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Tap at least one chip or write a note.");
      return;
    }

    const payload = {
      chipIds: Array.from(selectedIds),
      note: note.trim(),
    };

    startTransition(async () => {
      const res = await submitFeedback(eventCode, pitchId, payload);
      if (res.ok) {
        toast.success("Feedback sent");
        setSelectedIds(new Set());
        setNote("");
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

        <section>
          <NoteInput value={note} onChange={setNote} disabled={pending} />
        </section>
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
