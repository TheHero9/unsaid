"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { ChipSentiment } from "@/lib/chips";
import { addChipSchema } from "@/schemas/feedback";

import { SENTIMENT_DOT, SENTIMENT_ORDER } from "./sentiment";

export interface AddedChip {
  id: string;
  label: string;
  sentiment: ChipSentiment;
}

interface AddOwnChipProps {
  onAdd: (label: string, sentiment: ChipSentiment) => Promise<AddedChip>;
  onAdded: (chip: AddedChip) => void;
}

/**
 * Inline "add your own" chip: pick a sentiment, type a label, submit. Persists
 * via the server action (upsert by normalized label) and reports the real chip
 * back so the parent can select it.
 */
export function AddOwnChip({ onAdd, onAdded }: AddOwnChipProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [sentiment, setSentiment] = useState<ChipSentiment>("positive");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const reset = () => {
    setLabel("");
    setSentiment("positive");
    setOpen(false);
  };

  const submit = () => {
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
        className="inline-flex min-h-10 select-none items-center gap-1.5 rounded-full border border-dashed border-border-strong px-3.5 text-[14.5px] font-medium text-text-3 transition-colors active:scale-[0.97]"
      >
        <Plus className="size-[15px]" aria-hidden />
        add your own
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-2 bg-surface-2 p-[5px]">
      {SENTIMENT_ORDER.map((s) => {
        const active = sentiment === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => setSentiment(s)}
            aria-label={s}
            aria-pressed={active}
            className={cn(
              "size-[18px] rounded-full border-2 transition-opacity",
              SENTIMENT_DOT[s],
              active ? "opacity-100" : "bg-transparent opacity-60"
            )}
          />
        );
      })}
      <input
        ref={inputRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") reset();
        }}
        maxLength={40}
        placeholder="add a chip"
        aria-label="New chip label"
        disabled={pending}
        className="w-[110px] bg-transparent text-[14.5px] text-text outline-none placeholder:text-text-4"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || label.trim().length === 0}
        aria-label="Add chip"
        className="flex size-[30px] items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
      >
        <Check className="size-4" aria-hidden />
      </button>
    </span>
  );
}
