import { z } from "zod";

import { chipSentimentSchema } from "./feedback";

/**
 * Organizer dashboard "feedback setup" inputs. The organizer_code re-resolves
 * the event server-side; it is the only authorization. Never trust a
 * client-supplied event id.
 */

export const organizerAddChipSchema = z.object({
  organizer_code: z.string().trim().min(1),
  label: z.string().trim().min(1, "Enter a label").max(40, "Label is too long"),
  sentiment: chipSentimentSchema,
});

export type OrganizerAddChipInput = z.infer<typeof organizerAddChipSchema>;

export const organizerDeleteChipSchema = z.object({
  organizer_code: z.string().trim().min(1),
  chip_id: z.uuid("Invalid chip id"),
});

export type OrganizerDeleteChipInput = z.infer<
  typeof organizerDeleteChipSchema
>;

export const organizerAddCriterionSchema = z.object({
  organizer_code: z.string().trim().min(1),
  label: z.string().trim().min(1, "Enter a label").max(40, "Label is too long"),
});

export type OrganizerAddCriterionInput = z.infer<
  typeof organizerAddCriterionSchema
>;

export const organizerDeleteCriterionSchema = z.object({
  organizer_code: z.string().trim().min(1),
  criterion_id: z.uuid("Invalid criterion id"),
});

export type OrganizerDeleteCriterionInput = z.infer<
  typeof organizerDeleteCriterionSchema
>;
