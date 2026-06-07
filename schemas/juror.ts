import { z } from "zod";

/**
 * Juror-join validation. A juror provides only a name; identity is a cookie
 * holding the created `u_jurors.id`. Validated on BOTH client and server.
 */
export const jurorNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name")
  .max(60, "Name is too long");

export const joinEventSchema = z.object({
  name: jurorNameSchema,
});

export type JoinEventInput = z.infer<typeof joinEventSchema>;
