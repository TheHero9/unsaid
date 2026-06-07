import { z } from "zod";

/**
 * Add-pitch input. Validated on the client AND re-validated server-side.
 * `slides_url` must be an https URL when present; `founder_email` a valid
 * email when present. Empty strings are treated as "not provided".
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

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Enter a valid email"
  )
  .optional()
  .or(z.literal(""));

export const createPitchSchema = z.object({
  // The organizer_code re-resolves the event server-side; it is the only
  // authorization. Never trust a client-supplied event id.
  organizer_code: z.string().trim().min(1),
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(120, "Product name is too long"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .or(z.literal("")),
  slides_url: optionalHttpsUrl,
  founder_email: optionalEmail,
});

export type CreatePitchInput = z.infer<typeof createPitchSchema>;

export const deletePitchSchema = z.object({
  organizer_code: z.string().trim().min(1),
  pitch_id: z.string().trim().uuid("Invalid pitch id"),
});

export type DeletePitchInput = z.infer<typeof deletePitchSchema>;
