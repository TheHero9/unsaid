import { formatDistanceToNow } from "date-fns";
import { Quote } from "lucide-react";

import type { AggregatedNote } from "@/lib/aggregate";

import { SectionLabel } from "./SectionLabel";

interface NotesFeedProps {
  notes: AggregatedNote[];
}

/**
 * Anonymous freeform notes, newest first. Note text + relative time only - no
 * author info ever reaches this component (the founder-page query never selects
 * juror columns). This anonymity is a core, non-negotiable product guarantee.
 */
export function NotesFeed({ notes }: NotesFeedProps) {
  if (notes.length === 0) return null;

  return (
    <section aria-label="Notes from jurors">
      <SectionLabel hint={`${notes.length}`}>Notes</SectionLabel>
      <ul className="flex flex-col gap-2.5">
        {notes.map((note, index) => (
          <li
            key={`${note.createdAt}-${index}`}
            className="rounded-[13px] border border-border bg-surface p-[14px]"
          >
            <div className="flex gap-2.5">
              <Quote
                className="mt-0.5 size-4 shrink-0 text-text-4"
                aria-hidden
              />
              <div>
                <p className="text-[14.5px] leading-[1.45] text-text">
                  {note.note}
                </p>
                <p className="mt-[5px] text-[12px] text-text-4">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
