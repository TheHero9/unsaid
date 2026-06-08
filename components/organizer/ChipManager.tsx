"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChipSentiment } from "@/lib/chips";
import {
  addEventChipAction,
  deleteEventChipAction,
} from "@/app/o/[organizerCode]/actions";

export interface ManagedChip {
  id: string;
  label: string;
  sentiment: ChipSentiment;
}

const SENTIMENTS: { value: ChipSentiment; label: string; className: string }[] =
  [
    {
      value: "positive",
      label: "Positive",
      className:
        "border-chip-positive bg-chip-positive-muted text-chip-positive",
    },
    {
      value: "negative",
      label: "Negative",
      className:
        "border-chip-negative bg-chip-negative-muted text-chip-negative",
    },
    {
      value: "neutral",
      label: "Neutral",
      className: "border-chip-neutral bg-chip-neutral-muted text-chip-neutral",
    },
  ];

const badgeBySentiment: Record<ChipSentiment, string> = {
  positive: "border-chip-positive bg-chip-positive-muted text-chip-positive",
  negative: "border-chip-negative bg-chip-negative-muted text-chip-negative",
  neutral: "border-chip-neutral bg-chip-neutral-muted text-chip-neutral",
};

/** Organizer management of the event-wide chip set. */
export function ChipManager({
  organizerCode,
  chips,
}: {
  organizerCode: string;
  chips: ManagedChip[];
}) {
  const [label, setLabel] = useState("");
  const [sentiment, setSentiment] = useState<ChipSentiment>("neutral");
  const [chipToDelete, setChipToDelete] = useState<ManagedChip | null>(null);
  const [pending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addEventChipAction({
        organizer_code: organizerCode,
        label,
        sentiment,
      });
      if (res.ok) {
        toast.success("Chip added");
        setLabel("");
        setSentiment("neutral");
      } else {
        toast.error(res.error ?? "Could not add the chip");
      }
    });
  };

  const handleDelete = () => {
    if (!chipToDelete) return;
    startTransition(async () => {
      const res = await deleteEventChipAction({
        organizer_code: organizerCode,
        chip_id: chipToDelete.id,
      });
      if (res.ok) {
        toast.success("Chip deleted");
        setChipToDelete(null);
      } else {
        toast.error(res.error ?? "Could not delete the chip");
      }
    });
  };

  return (
    <div className="space-y-3">
      {chips.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No chips yet. Add the first one below.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li
              key={chip.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border py-0.5 pl-2.5 pr-1 text-xs font-medium",
                badgeBySentiment[chip.sentiment]
              )}
            >
              {chip.label}
              <button
                type="button"
                aria-label={`Delete chip ${chip.label}`}
                disabled={pending}
                onClick={() => setChipToDelete(chip)}
                className="rounded-full p-1 transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Trash2 className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="space-y-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. strong team"
          maxLength={40}
          disabled={pending}
          aria-label="New chip label"
          className="h-11 text-base"
        />
        <div className="flex flex-wrap gap-2">
          {SENTIMENTS.map((s) => {
            const active = sentiment === s.value;
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={active}
                onClick={() => setSentiment(s.value)}
                disabled={pending}
                className={cn(
                  "min-h-[40px] flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? s.className
                    : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-11 w-full"
          disabled={pending || label.trim().length === 0}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          Add chip
        </Button>
      </form>

      <Dialog
        open={chipToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setChipToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this chip?</DialogTitle>
            <DialogDescription>
              {`"${chipToDelete?.label ?? ""}" will disappear for every juror, and past selections of it are removed from all feedback. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setChipToDelete(null)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="size-4" aria-hidden />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
