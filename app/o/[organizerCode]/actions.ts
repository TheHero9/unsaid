"use server";

import { revalidatePath } from "next/cache";

import { getAdminClient } from "@/lib/supabase/admin";
import { generatePrivateCode } from "@/lib/codes";
import {
  createPitchSchema,
  deletePitchSchema,
  type CreatePitchInput,
  type DeletePitchInput,
} from "@/schemas/pitch";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const PG_UNIQUE_VIOLATION = "23505";
const PRIVATE_CODE_MAX_ATTEMPTS = 8;

/**
 * Re-resolve the organizer_code → event server-side. The code IS the
 * authorization; we never trust a client-supplied event id. Returns the
 * event id, or null when the code does not match an event.
 */
async function resolveEventId(organizerCode: string): Promise<string | null> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("u_events")
    .select("id")
    .eq("organizer_code", organizerCode)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

/** Add a pitch to the event resolved from the organizer_code. */
export async function addPitchAction(
  input: CreatePitchInput
): Promise<ActionResult> {
  const parsed = createPitchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { organizer_code, name, description, slides_url, founder_email } =
    parsed.data;

  const eventId = await resolveEventId(organizer_code);
  if (!eventId) {
    return { ok: false, error: "Event not found." };
  }

  const admin = getAdminClient();

  // position = max existing + 1 (insertion order; no reorder UI in v1).
  const { data: lastPitch, error: positionError } = await admin
    .from("u_pitches")
    .select("position")
    .eq("event_id", eventId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    return { ok: false, error: "Could not add the pitch. Please try again." };
  }

  const nextPosition = (lastPitch?.position ?? -1) + 1;

  for (let attempt = 0; attempt < PRIVATE_CODE_MAX_ATTEMPTS; attempt++) {
    const privateCode = generatePrivateCode();

    const { error } = await admin.from("u_pitches").insert({
      event_id: eventId,
      name,
      description: description ? description : null,
      slides_url: slides_url ? slides_url : null,
      founder_email: founder_email ? founder_email : null,
      private_code: privateCode,
      position: nextPosition,
    });

    if (error) {
      if (error.code === PG_UNIQUE_VIOLATION) {
        continue; // private_code collision - regenerate and retry
      }
      return { ok: false, error: "Could not add the pitch. Please try again." };
    }

    revalidatePath(`/o/${organizer_code}`);
    return { ok: true };
  }

  return {
    ok: false,
    error: "Could not generate a unique pitch code. Please try again.",
  };
}

/**
 * Delete a pitch. The pitch must belong to the event resolved from the
 * organizer_code - the delete is scoped by both ids so a stray pitch_id from
 * the client cannot remove another event's pitch.
 */
export async function deletePitchAction(
  input: DeletePitchInput
): Promise<ActionResult> {
  const parsed = deletePitchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { organizer_code, pitch_id } = parsed.data;

  const eventId = await resolveEventId(organizer_code);
  if (!eventId) {
    return { ok: false, error: "Event not found." };
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from("u_pitches")
    .delete()
    .eq("id", pitch_id)
    .eq("event_id", eventId);

  if (error) {
    return { ok: false, error: "Could not delete the pitch. Please try again." };
  }

  revalidatePath(`/o/${organizer_code}`);
  return { ok: true };
}
