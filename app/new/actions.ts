"use server";

import { redirect } from "next/navigation";

import { getAdminClient } from "@/lib/supabase/admin";
import { generatePublicCode, generatePrivateCode } from "@/lib/codes";
import { DEFAULT_CHIPS } from "@/lib/chips";
import { createEventSchema, type CreateEventInput } from "@/schemas/event";

export interface CreateEventResult {
  ok: false;
  error: string;
}

const PG_UNIQUE_VIOLATION = "23505";
const PUBLIC_CODE_MAX_ATTEMPTS = 8;

/**
 * Server action: create an event with both capability codes, seed the default
 * chip set, then redirect to the organizer dashboard.
 *
 * On success this never returns - it `redirect()`s. It returns a result object
 * only on validation/DB failure so the client form can surface the error.
 */
export async function createEventAction(
  input: CreateEventInput
): Promise<CreateEventResult> {
  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, event_date, location } = parsed.data;
  const admin = getAdminClient();

  const organizerCode = generatePrivateCode();

  // Retry public-code generation on the (rare) unique collision.
  let organizerCodeForRedirect: string | null = null;

  for (let attempt = 0; attempt < PUBLIC_CODE_MAX_ATTEMPTS; attempt++) {
    const publicCode = generatePublicCode();

    const { data: event, error } = await admin
      .from("u_events")
      .insert({
        name,
        event_date: event_date ? event_date : null,
        location: location ? location : null,
        public_code: publicCode,
        organizer_code: organizerCode,
      })
      .select("id, organizer_code")
      .single();

    if (error) {
      // Collision on public_code (or organizer_code) - regenerate and retry.
      if (error.code === PG_UNIQUE_VIOLATION) {
        continue;
      }
      return { ok: false, error: "Could not create the event. Please try again." };
    }

    // Seed default chips for the event (created_by NULL = event default).
    const { error: chipsError } = await admin.from("u_chips").insert(
      DEFAULT_CHIPS.map((chip) => ({
        event_id: event.id,
        label: chip.label,
        sentiment: chip.sentiment,
        created_by: null,
      }))
    );

    if (chipsError) {
      return {
        ok: false,
        error: "Event created but seeding chips failed. Please try again.",
      };
    }

    organizerCodeForRedirect = event.organizer_code;
    break;
  }

  if (!organizerCodeForRedirect) {
    return {
      ok: false,
      error: "Could not generate a unique event code. Please try again.",
    };
  }

  redirect(`/o/${organizerCodeForRedirect}`);
}
