import { formatDistanceToNow } from "date-fns";
import { Quote } from "lucide-react";

import type { AggregatedNote } from "@/lib/aggregate";

interface NotesFeedProps {
  notes: AggregatedNote[];
}

/**
 * Anonymous freeform notes, newest first. Note text + relative time only -
 * no author info ever reaches this component (the founder-page query never
 * selects juror columns).
 */
export function NotesFeed({ notes }: NotesFeedProps) {
  if (notes.length === 0) return null;

  return (
    <section aria-label="Notes from jurors" className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        Notes ({notes.length})
      </h2>

      <ul className="space-y-2.5">
        {notes.map((note, index) => (
          <li
            key={`${note.createdAt}-${index}`}
            className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="flex gap-3">
              <Quote
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="space-y-1.5">
                <p className="text-sm leading-relaxed text-foreground">
                  {note.note}
                </p>
                <p className="text-xs text-muted-foreground">
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
