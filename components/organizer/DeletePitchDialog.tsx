"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deletePitchAction } from "@/app/o/[organizerCode]/actions";

interface DeletePitchDialogProps {
  organizerCode: string;
  pitchId: string;
  pitchName: string;
}

export function DeletePitchDialog({
  organizerCode,
  pitchId,
  pitchName,
}: DeletePitchDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePitchAction({
        organizer_code: organizerCode,
        pitch_id: pitchId,
      });
      if (result.ok) {
        toast.success("Pitch deleted");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Could not delete the pitch");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${pitchName}`}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this pitch?</DialogTitle>
          <DialogDescription>
            {`"${pitchName}" and all of its feedback will be permanently removed. The founder's private link will stop working. This cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4" aria-hidden />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
