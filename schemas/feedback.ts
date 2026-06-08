import { z } from "zod";

/**
 * Capture-screen validation (HERO #1). Validated on BOTH client and server.
 * The server action additionally re-verifies the juror/pitch/event triangle
 * and that every chip belongs to the event and is a default or owned by the
 * juror - never trust client-supplied ids for authorization.
 */

export const chipSentimentSchema = z.enum(["positive", "negative", "neutral"]);

/** Custom-chip creation: a short label + a sentiment. */
export const addChipSchema = z.object({
  label: z.string().trim().min(1, "Enter a label").max(40, "Label is too long"),
  sentiment: chipSentimentSchema,
});

export type AddChipInput = z.infer<typeof addChipSchema>;

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Custom rating criterion (1-5 slider): just a short label. */
export const addCriterionSchema = z.object({
  label: z.string().trim().min(1, "Enter a label").max(40, "Label is too long"),
});

export type AddCriterionInput = z.infer<typeof addCriterionSchema>;

/** One slider score attached to a submission. */
export const ratingSchema = z.object({
  criterionId: z.uuid(),
  score: z.number().int().min(RATING_MIN).max(RATING_MAX),
});

export type RatingInput = z.infer<typeof ratingSchema>;

export const NOTE_MAX_LENGTH = 200;

/**
 * Feedback submission. A submission must carry >= 1 chip OR a non-empty note
 * OR >= 1 rating; that cross-field rule is enforced here and re-checked
 * server-side.
 */
export const submitFeedbackSchema = z
  .object({
    chipIds: z.array(z.uuid()).max(60),
    note: z.string().trim().max(NOTE_MAX_LENGTH, "Note is too long"),
    ratings: z.array(ratingSchema).max(40),
  })
  .refine(
    (v) => v.chipIds.length > 0 || v.note.length > 0 || v.ratings.length > 0,
    {
      message: "Tap at least one chip, rate a criterion, or write a note",
      path: ["chipIds"],
    }
  );

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
