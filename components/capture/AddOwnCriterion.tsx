"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";

import { addCriterionSchema } from "@/schemas/feedback";

export interface AddedCriterion {
  id: string;
  label: string;
}

interface AddOwnCriterionProps {
  onAdd: (label: string) => Promise<AddedCriterion>;
  onAdded: (criterion: AddedCriterion) => void;
}

/**
 * Inline "add your own" rating criterion: type a label, submit. Persists via
 * the server action (upsert by normalized label) and reports the real criterion
 * back so the parent can show it on every pitch. Mirrors AddOwnChip.
 */
export function AddOwnCriterion({ onAdd, onAdded }: AddOwnCriterionProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const reset = () => {
    setLabel("");
    setOpen(false);
  };

  const submit = () => {
    const parsed = addCriterionSchema.safeParse({ label });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a label");
      return;
    }
    startTransition(async () => {
      try {
        const criterion = await onAdd(parsed.data.label);
        onAdded(criterion);
        reset();
      } catch {
        toast.error("Could not add that criterion. Please try again.");
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 select-none items-center gap-1.5 self-start rounded-full border border-dashed border-border-strong px-3.5 text-[14.5px] font-medium text-text-3 transition-colors active:scale-[0.97]"
      >
        <Plus className="size-[15px]" aria-hidden />
        add your own
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-border-2 bg-surface-2 p-[5px] pl-3">
      <input
        ref={inputRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") reset();
        }}
        maxLength={40}
        placeholder="add a criterion"
        aria-label="New criterion label"
        disabled={pending}
        className="w-[130px] bg-transparent text-[14.5px] text-text outline-none placeholder:text-text-4"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || label.trim().length === 0}
        aria-label="Add criterion"
        className="flex size-[30px] items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
      >
        <Check className="size-4" aria-hidden />
      </button>
    </span>
  );
}
