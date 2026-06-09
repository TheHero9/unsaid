import { z } from "zod";

/**
 * Founder self-serve create input (Flow B - see specs/06-flows/). A founder
 * creates a single-pitch event for themselves: they enter only their pitch /
 * product name, plus an optional one-liner and slides link. Validated on the
 * client AND re-validated server-side - never trust the client.
 */
const optionalHttpsUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https:\/\/\S+$/i.test(value),
    "Slides link must start with https://"
  )
  .optional()
  .or(z.literal(""));

export const createFounderPitchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Your pitch name is required")
    .max(120, "Name is too long"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .or(z.literal("")),
  slides_url: optionalHttpsUrl,
});

export type CreateFounderPitchInput = z.infer<typeof createFounderPitchSchema>;
