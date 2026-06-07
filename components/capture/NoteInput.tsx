"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NOTE_MAX_LENGTH } from "@/schemas/feedback";

interface NoteInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Single-line optional note. Counter appears as the cap nears (> 150). */
export function NoteInput({ value, onChange, disabled }: NoteInputProps) {
  const remaining = NOTE_MAX_LENGTH - value.length;
  const showCounter = value.length > 150;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor="capture-note">Add a one-line note (optional)</Label>
        {showCounter ? (
          <span
            className={cn(
              "text-xs tabular-nums",
              remaining <= 10 ? "text-chip-negative" : "text-muted-foreground"
            )}
          >
            {remaining}
          </span>
        ) : null}
      </div>
      <Input
        id="capture-note"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. great story, but the numbers didn't add up"
        maxLength={NOTE_MAX_LENGTH}
        disabled={disabled}
        autoComplete="off"
        className="h-12 text-base"
      />
    </div>
  );
}
