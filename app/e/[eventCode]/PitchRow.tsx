import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

interface PitchRowProps {
  eventCode: string;
  pitchId: string;
  name: string;
  description: string | null;
  slidesUrl: string | null;
}

/**
 * A tap-friendly pitch row. The whole row is a link into the capture screen
 * via an absolutely-positioned overlay anchor; the optional slides link sits
 * ABOVE the overlay (higher z-index, sibling - not nested) so tapping it opens
 * the slides in a new tab without triggering the row navigation.
 */
export function PitchRow({
  eventCode,
  pitchId,
  name,
  description,
  slidesUrl,
}: PitchRowProps) {
  return (
    <li className="relative">
      <div
        className={cn(
          "flex min-h-[64px] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
          "transition-colors active:bg-muted"
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-foreground">
            {name}
          </p>
          {description ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {slidesUrl ? (
          <a
            href={slidesUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open slides for ${name}`}
            className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-5" />
          </a>
        ) : null}

        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </div>

      {/* Overlay link covers the row for navigation into capture. */}
      <Link
        href={`/e/${eventCode}/p/${pitchId}`}
        aria-label={`Give feedback on ${name}`}
        className="absolute inset-0 z-0 rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="sr-only">Give feedback on {name}</span>
      </Link>
    </li>
  );
}
