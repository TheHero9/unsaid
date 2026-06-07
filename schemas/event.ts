import { z } from "zod";

/**
 * Create-event input. Validated on the client (react-hook-form resolver) AND
 * re-validated server-side in the create action - never trust the client.
 * `event_date` is an optional ISO date string (yyyy-mm-dd from <input type="date">).
 */
export const createEventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Event name is required")
    .max(120, "Event name is too long"),
  event_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .trim()
    .max(160, "Location is too long")
    .optional()
    .or(z.literal("")),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
