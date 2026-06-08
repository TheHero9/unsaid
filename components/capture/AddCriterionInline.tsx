"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCriterionSchema } from "@/schemas/feedback";

export interface AddedCriterion {
  id: string;
  label: string;
}

interface AddCriterionInlineProps {
  onAdd: (label: string) => Promise<AddedCriterion>;
  onAdded: (criterion: AddedCriterion) => void;
}

/** Inline creation of a juror-personal rating criterion (label only). */
export function AddCriterionInline({ onAdd, onAdded }: AddCriterionInlineProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setLabel("");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        className="inline-flex min-h-[44px] select-none items-center gap-1.5 rounded-lg border border-dashed border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Plus className="size-4 shrink-0" aria-hidden />
        Add your own criterion
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
        placeholder="e.g. go-to-market"
        maxLength={40}
        autoFocus
        disabled={pending}
        aria-label="New criterion label"
        className="h-11 text-base"
      />

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
          {pending ? "Adding..." : "Add criterion"}
        </Button>
      </div>
    </form>
  );
}
