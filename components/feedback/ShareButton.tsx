"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Subtle share affordance on the founder page. Uses the Web Share sheet when
 * available, otherwise copies the page link. Flips to a check briefly. The link
 * IS the private capability code, so this is "share my own results" only.
 */
export function ShareButton({ title }: { title: string }) {
  const [done, setDone] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setDone(true);
        window.setTimeout(() => setDone(false), 1400);
      }
    } catch {
      // user cancelled the share sheet - no-op
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this feedback page"
      className={cn(
        "mt-1 flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 transition-colors",
        done ? "text-pos" : "text-text-2"
      )}
    >
      {done ? (
        <Check className="size-[18px]" aria-hidden />
      ) : (
        <Share2 className="size-[18px]" aria-hidden />
      )}
    </button>
  );
}
