/**
 * Client-side capture-screen cache (localStorage).
 *
 * The DB is the source of truth for *submitted* feedback, but two things are
 * easy to lose on a mobile refresh / re-open and are not re-hydrated from the
 * server into the capture screen:
 *
 *   1. In-progress + already-submitted DRAFTS (which chips a juror tapped, the
 *      1-5 scores they gave, their one-line note) - so after a refresh a juror
 *      still sees exactly what they rated for each pitch.
 *   2. The juror's OWN custom chips + rating criteria - so a slider/chip they
 *      added survives even if the session briefly hiccups, and shows on every
 *      pitch, not just the one it was created on.
 *
 * Keyed by public event code + juror id (same device, same person - the same
 * trust boundary as the juror cookie). Never leaves the browser.
 */

import type { ChipSentiment } from "@/lib/chips";

export interface CachedChip {
  id: string;
  label: string;
  sentiment: ChipSentiment;
}

export interface CachedCriterion {
  id: string;
  label: string;
}

export interface CachedDraft {
  chipIds: string[];
  scores: Record<string, number>;
  note: string;
}

export interface CaptureCache {
  /** Custom chips this juror added (mirrors what the server persisted). */
  customChips: CachedChip[];
  /** Custom rating criteria this juror added. */
  customCriteria: CachedCriterion[];
  /** Per-pitch draft content, keyed by pitch id. */
  drafts: Record<string, CachedDraft>;
  /** Pitch ids this juror has submitted feedback for. */
  done: string[];
}

const EMPTY: CaptureCache = {
  customChips: [],
  customCriteria: [],
  drafts: {},
  done: [],
};

function key(eventCode: string, jurorId: string): string {
  return `nondit_capture_${eventCode.trim().toUpperCase()}_${jurorId}`;
}

export function loadCaptureCache(
  eventCode: string,
  jurorId: string
): CaptureCache {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(key(eventCode, jurorId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<CaptureCache>;
    return {
      customChips: Array.isArray(parsed.customChips) ? parsed.customChips : [],
      customCriteria: Array.isArray(parsed.customCriteria)
        ? parsed.customCriteria
        : [],
      drafts:
        parsed.drafts && typeof parsed.drafts === "object" ? parsed.drafts : {},
      done: Array.isArray(parsed.done) ? parsed.done : [],
    };
  } catch {
    // Corrupt / blocked storage - fall back to server data only.
    return EMPTY;
  }
}

export function saveCaptureCache(
  eventCode: string,
  jurorId: string,
  cache: CaptureCache
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(eventCode, jurorId), JSON.stringify(cache));
  } catch {
    // Private mode / storage full - non-fatal, the DB still holds submissions.
  }
}
