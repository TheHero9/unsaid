"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  addEventCriterionAction,
  deleteEventCriterionAction,
} from "@/app/o/[organizerCode]/actions";

export interface ManagedCriterion {
  id: string;
  label: string;
}

/** Organizer management of the event-wide 1-5 rating criteria. */
export function CriteriaManager({
  organizerCode,
  criteria,
}: {
  organizerCode: string;
  criteria: ManagedCriterion[];
}) {
  const [label, setLabel] = useState("");
  const [criterionToDelete, setCriterionToDelete] =
    useState<ManagedCriterion | null>(null);
  const [pending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addEventCriterionAction({
        organizer_code: organizerCode,
        label,
      });
      if (res.ok) {
        toast.success("Criterion added");
        setLabel("");
      } else {
        toast.error(res.error ?? "Could not add the criterion");
      }
    });
  };

  const handleDelete = () => {
    if (!criterionToDelete) return;
    startTransition(async () => {
      const res = await deleteEventCriterionAction({
        organizer_code: organizerCode,
        criterion_id: criterionToDelete.id,
      });
      if (res.ok) {
        toast.success("Criterion deleted");
        setCriterionToDelete(null);
      } else {
        toast.error(res.error ?? "Could not delete the criterion");
      }
    });
  };

  return (
    <div className="space-y-3">
      {criteria.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No rating criteria yet. Jurors score each one 1-5.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {criteria.map((criterion) => (
            <li
              key={criterion.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 py-1.5 pl-3 pr-1.5"
            >
              <span className="inline-flex min-w-0 items-center gap-2 text-sm">
                <SlidersHorizontal
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="truncate">{criterion.label}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={`Delete criterion ${criterion.label}`}
                disabled={pending}
                onClick={() => setCriterionToDelete(criterion)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. product clarity"
          maxLength={40}
          disabled={pending}
          aria-label="New criterion label"
          className="h-11 flex-1 text-base"
        />
        <Button
          type="submit"
          variant="secondary"
          className="h-11"
          disabled={pending || label.trim().length === 0}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          Add
        </Button>
      </form>

      <Dialog
        open={criterionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCriterionToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this criterion?</DialogTitle>
            <DialogDescription>
              {`"${criterionToDelete?.label ?? ""}" will disappear for every juror, and all of its scores are removed from past feedback. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCriterionToDelete(null)}
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
