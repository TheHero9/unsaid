/**
 * Pure feedback aggregation for the founder view (HERO #2).
 *
 * No React, no DB - this turns raw feedback rows (already fetched server-side
 * via the service-role client) into the glanceable, anonymous shape the founder
 * page renders. Authorship NEVER crosses this boundary: callers pass `jurorId`
 * only so we can count DISTINCT jurors; it is consumed here and never returned.
 *
 * See specs/03-architecture/01-architecture.md (Aggregation section) and
 * specs/05-setup/06-S5-founder-view.md.
 */
import { normalizeLabel } from "./labels";
import type { ChipSentiment } from "./chips";

/** A single chip selection attached to one feedback submission. */
export interface FeedbackInputChip {
  label: string;
  sentiment: ChipSentiment;
}

/** A single 1-5 score attached to one feedback submission. */
export interface FeedbackInputRating {
  criterionId: string;
  label: string;
  /** true = a juror's personal criterion; false = event-wide. */
  personal: boolean;
  score: number;
}

/** One feedback submission from one juror. */
export interface FeedbackInput {
  id: string;
  /** Used transiently for distinct-juror counting; never returned. */
  jurorId: string;
  note: string | null;
  createdAt: string;
  chips: FeedbackInputChip[];
  /** Optional so chip/note-only callers (and older fixtures) stay valid. */
  ratings?: FeedbackInputRating[];
}

/** One aggregated chip line for the founder summary. */
export interface ChipCount {
  /** Display form - the first-seen original casing for this normalized label. */
  label: string;
  sentiment: ChipSentiment;
  /** Distinct jurors who EVER selected a chip with this label. */
  jurorCount: number;
}

/** One anonymous note for the founder feed. */
export interface AggregatedNote {
  note: string;
  createdAt: string;
}

/** One aggregated 1-5 criterion line for the founder summary. */
export interface CriterionScore {
  label: string;
  /** Mean of all scores for this criterion (full precision; format in UI). */
  average: number;
  /** Number of scores received. */
  count: number;
}

/** One chip on a single juror's submission card. */
export interface SubmissionChip {
  label: string;
  sentiment: ChipSentiment;
}

/** One score on a single juror's submission card. */
export interface SubmissionScore {
  label: string;
  score: number;
  /** true = a juror's personal criterion; false = event-wide. */
  personal: boolean;
}

/**
 * One juror's submission, ANONYMISED. Identity never crosses this boundary:
 * jurors get a stable 1-based `index` (assigned in submission order), never a
 * name or id. This powers the "juror by juror" breakdown on the founder page.
 */
export interface JurorSubmission {
  /** 1-based anonymous label ("Juror 1", "Juror 2", ... in submission order). */
  index: number;
  createdAt: string;
  chips: SubmissionChip[];
  scores: SubmissionScore[];
  note: string | null;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export interface AggregatedFeedback {
  /** Distinct jurors who submitted any feedback for this pitch. */
  jurorCount: number;
  /** Most-used first; tie-break alphabetically by display label. */
  chipCounts: ChipCount[];
  /** Total chip SELECTIONS by sentiment (not distinct - raw selection counts). */
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  /** Event-wide criteria averages; most-scored first, tie-break by label. */
  criteriaScores: CriterionScore[];
  /** Juror-personal criteria, listed separately; alphabetical by label. */
  personalScores: CriterionScore[];
  /** Non-empty notes only, newest first. */
  notes: AggregatedNote[];
  /** Per-juror submissions, anonymised, oldest first. */
  submissions: JurorSubmission[];
}

interface ChipAccumulator {
  label: string;
  sentiment: ChipSentiment;
  jurorIds: Set<string>;
}

interface CriterionAccumulator {
  label: string;
  personal: boolean;
  total: number;
  count: number;
}

/**
 * Keep only each juror's LATEST submission. A juror can have several
 * `u_feedback` rows for one pitch (the capture screen's "Update & next"
 * inserts a fresh row each time); without this, their chips/scores/notes would
 * be counted once per resubmission and inflate every total. We treat the
 * newest row (by `createdAt`) as the juror's current answer.
 */
function latestPerJuror(rows: FeedbackInput[]): FeedbackInput[] {
  const byJuror = new Map<string, FeedbackInput>();
  for (const row of rows) {
    const current = byJuror.get(row.jurorId);
    if (
      !current ||
      new Date(row.createdAt).getTime() >= new Date(current.createdAt).getTime()
    ) {
      byJuror.set(row.jurorId, row);
    }
  }
  return Array.from(byJuror.values());
}

/**
 * Aggregate raw feedback rows into the founder-view shape.
 *
 * - Only each juror's LATEST submission counts (see `latestPerJuror`).
 * - Chips group by `normalizeLabel()` across ALL jurors regardless of which
 *   juror authored the chip; the display label is the first original casing seen.
 * - `jurorCount` per chip = distinct jurors who selected that label at least
 *   once (a juror selecting the same label twice counts once).
 * - positive/negative/neutralCount = total raw selections by sentiment.
 * - notes: non-empty only, newest first.
 * - submissions: one anonymised card per juror, oldest first.
 */
export function aggregateFeedback(input: FeedbackInput[]): AggregatedFeedback {
  // Oldest first so anonymous juror indices follow submission order.
  const rows = latestPerJuror(input).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const jurorIds = new Set<string>();
  const chipMap = new Map<string, ChipAccumulator>();
  const criterionMap = new Map<string, CriterionAccumulator>();
  const submissions: JurorSubmission[] = [];

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  const notes: AggregatedNote[] = [];

  for (const row of rows) {
    jurorIds.add(row.jurorId);

    let subPositive = 0;
    let subNeutral = 0;
    let subNegative = 0;

    for (const chip of row.chips) {
      // Raw selection counts (every selection, including a juror's repeats).
      if (chip.sentiment === "positive") {
        positiveCount += 1;
        subPositive += 1;
      } else if (chip.sentiment === "negative") {
        negativeCount += 1;
        subNegative += 1;
      } else {
        neutralCount += 1;
        subNeutral += 1;
      }

      const key = normalizeLabel(chip.label);
      const existing = chipMap.get(key);
      if (existing) {
        existing.jurorIds.add(row.jurorId);
      } else {
        chipMap.set(key, {
          // First-seen original casing wins as the display label.
          label: chip.label,
          sentiment: chip.sentiment,
          jurorIds: new Set([row.jurorId]),
        });
      }
    }

    for (const rating of row.ratings ?? []) {
      // Keyed by criterion id - labels are already unique per event at the DB.
      const existing = criterionMap.get(rating.criterionId);
      if (existing) {
        existing.total += rating.score;
        existing.count += 1;
      } else {
        criterionMap.set(rating.criterionId, {
          label: rating.label,
          personal: rating.personal,
          total: rating.score,
          count: 1,
        });
      }
    }

    const trimmedNote = row.note?.trim();
    if (trimmedNote) {
      notes.push({ note: trimmedNote, createdAt: row.createdAt });
    }

    submissions.push({
      index: submissions.length + 1,
      createdAt: row.createdAt,
      chips: row.chips.map((c) => ({ label: c.label, sentiment: c.sentiment })),
      scores: (row.ratings ?? []).map((r) => ({
        label: r.label,
        score: r.score,
        personal: r.personal,
      })),
      note: trimmedNote || null,
      positiveCount: subPositive,
      neutralCount: subNeutral,
      negativeCount: subNegative,
    });
  }

  const chipCounts: ChipCount[] = Array.from(chipMap.values())
    .map((acc) => ({
      label: acc.label,
      sentiment: acc.sentiment,
      jurorCount: acc.jurorIds.size,
    }))
    .sort((a, b) => {
      if (b.jurorCount !== a.jurorCount) return b.jurorCount - a.jurorCount;
      return a.label.localeCompare(b.label);
    });

  const toScore = (acc: CriterionAccumulator): CriterionScore => ({
    label: acc.label,
    average: acc.total / acc.count,
    count: acc.count,
  });

  const allCriteria = Array.from(criterionMap.values());

  const criteriaScores: CriterionScore[] = allCriteria
    .filter((acc) => !acc.personal)
    .map(toScore)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });

  const personalScores: CriterionScore[] = allCriteria
    .filter((acc) => acc.personal)
    .map(toScore)
    .sort((a, b) => a.label.localeCompare(b.label));

  notes.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    jurorCount: jurorIds.size,
    chipCounts,
    positiveCount,
    negativeCount,
    neutralCount,
    criteriaScores,
    personalScores,
    notes,
    submissions,
  };
}
