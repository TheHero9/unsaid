"use client";

import type { ChipSentiment } from "@/lib/chips";

import { ChipButton } from "./ChipButton";
import { AddChipInline, type AddedChip } from "./AddChipInline";

export interface CaptureChip {
  id: string;
  label: string;
  sentiment: ChipSentiment;
}

interface ChipsGridProps {
  chips: CaptureChip[];
  selectedIds: ReadonlySet<string>;
  onToggle: (chipId: string) => void;
  onAdd: (label: string, sentiment: ChipSentiment) => Promise<AddedChip>;
  onAdded: (chip: AddedChip) => void;
  disabled?: boolean;
}

export function ChipsGrid({
  chips,
  selectedIds,
  onToggle,
  onAdd,
  onAdded,
  disabled,
}: ChipsGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <ChipButton
          key={chip.id}
          label={chip.label}
          sentiment={chip.sentiment}
          selected={selectedIds.has(chip.id)}
          onToggle={() => {
            if (!disabled) onToggle(chip.id);
          }}
        />
      ))}
      <AddChipInline onAdd={onAdd} onAdded={onAdded} />
    </div>
  );
}
