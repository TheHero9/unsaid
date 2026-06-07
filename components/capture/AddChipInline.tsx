"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChipSentiment } from "@/lib/chips";
import { addChipSchema } from "@/schemas/feedback";

export interface AddedChip {
  id: string;
  label: string;
  sentiment: ChipSentiment;
}

interface AddChipInlineProps {
  onAdd: (label: string, sentiment: ChipSentiment) => Promise<AddedChip>;
  onAdded: (chip: AddedChip) => void;
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

export function AddChipInline({ onAdd, onAdded }: AddChipInlineProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [sentiment, setSentiment] = useState<ChipSentiment>("neutral");
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setLabel("");
    setSentiment("neutral");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = addChipSchema.safeParse({ label, sentiment });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a label");
      return;
    }

    startTransition(async () => {
      try {
        const chip = await onAdd(parsed.data.label, parsed.data.sentiment);
        onAdded(chip);
        reset();
      } catch {
        toast.error("Could not add that chip. Please try again.");
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[44px] select-none items-center gap-1.5 rounded-full border border-dashed border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Plus className="size-4 shrink-0" aria-hidden />
        Add your own
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-3 rounded-xl border border-border bg-card p-3"
    >
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. unclear pricing"
        maxLength={40}
        autoFocus
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

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-11 flex-1"
          onClick={reset}
          disabled={pending}
        >
          <X className="size-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          className="h-11 flex-1"
          disabled={pending || label.trim().length === 0}
        >
          <Check className="size-4" />
          {pending ? "Adding..." : "Add chip"}
        </Button>
      </div>
    </form>
  );
}
