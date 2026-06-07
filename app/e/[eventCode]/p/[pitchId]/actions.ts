"use server";

import { cookies } from "next/headers";

import { getAdminClient } from "@/lib/supabase/admin";
import { jurorCookieName } from "@/lib/cookies";
import { normalizeLabel } from "@/lib/labels";
import type { ChipSentiment } from "@/lib/chips";
import { addChipSchema, submitFeedbackSchema } from "@/schemas/feedback";

/**
 * Re-resolve and verify the full capability triangle server-side:
 * event (from the public code) → juror (from the per-event cookie) → pitch
 * (must belong to the event). Never trust client-supplied ids for authz.
 * Returns null on any failure (do not leak which leg failed).
 */
async function resolveContext(eventCode: string, pitchId: string) {
  const normalizedCode = eventCode.trim().toUpperCase();
  if (normalizedCode.length === 0) return null;

  const admin = getAdminClient();

  const { data: event } = await admin
    .from("u_events")
    .select("id")
    .eq("public_code", normalizedCode)
    .maybeSingle();
  if (!event) return null;

  const cookieStore = await cookies();
  const jurorId = cookieStore.get(jurorCookieName(event.id))?.value;
  if (!jurorId) return null;

  const { data: juror } = await admin
    .from("u_jurors")
    .select("id")
    .eq("id", jurorId)
    .eq("event_id", event.id)
    .maybeSingle();
  if (!juror) return null;

  const { data: pitch } = await admin
    .from("u_pitches")
    .select("id")
    .eq("id", pitchId)
    .eq("event_id", event.id)
    .maybeSingle();
  if (!pitch) return null;

  return { admin, eventId: event.id, jurorId: juror.id, pitchId: pitch.id };
}

export type AddChipResult =
  | { ok: true; chip: { id: string; label: string; sentiment: ChipSentiment } }
  | { ok: false; error: string };

/**
 * Upsert a custom chip by (event_id, normalized label). On a unique-violation
 * (label already exists for this event) re-select and return the existing row,
 * so creating an existing label reuses it (keeping its original sentiment).
 */
export async function addCustomChip(
  eventCode: string,
  pitchId: string,
  input: unknown
): Promise<AddChipResult> {
  const parsed = addChipSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid label" };
  }

  const ctx = await resolveContext(eventCode, pitchId);
  if (!ctx) return { ok: false, error: "Your session has expired. Rejoin the event." };

  const { admin, eventId, jurorId } = ctx;
  const normalized = normalizeLabel(parsed.data.label);

  const { data: inserted, error: insertError } = await admin
    .from("u_chips")
    .insert({
      event_id: eventId,
      label: normalized,
      sentiment: parsed.data.sentiment,
      created_by: jurorId,
    })
    .select("id, label, sentiment")
    .single();

  if (!insertError && inserted) {
    return { ok: true, chip: inserted };
  }

  // Unique-violation (or any insert miss): re-select the existing label.
  const { data: existing } = await admin
    .from("u_chips")
    .select("id, label, sentiment")
    .eq("event_id", eventId)
    .eq("label", normalized)
    .maybeSingle();

  if (existing) {
    return { ok: true, chip: existing };
  }

  return { ok: false, error: "Could not add that chip. Please try again." };
}

export type SubmitFeedbackResult = { ok: true } | { ok: false; error: string };

/**
 * Insert one feedback row + its chip junction rows after verifying the
 * triangle. Every submitted chip must belong to this event AND be a default
 * (created_by IS NULL) or owned by this juror. Requires >= 1 chip OR a
 * non-empty note. Note trimmed; stored NULL when empty.
 */
export async function submitFeedback(
  eventCode: string,
  pitchId: string,
  input: unknown
): Promise<SubmitFeedbackResult> {
  const parsed = submitFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Add at least one chip or a note",
    };
  }

  const ctx = await resolveContext(eventCode, pitchId);
  if (!ctx) return { ok: false, error: "Your session has expired. Rejoin the event." };

  const { admin, eventId, jurorId, pitchId: verifiedPitchId } = ctx;

  const noteTrimmed = parsed.data.note.trim();
  const chipIds = Array.from(new Set(parsed.data.chipIds));

  if (chipIds.length === 0 && noteTrimmed.length === 0) {
    return { ok: false, error: "Tap at least one chip or write a note." };
  }

  // Verify every chip belongs to this event AND is default or owned by juror.
  if (chipIds.length > 0) {
    const { data: validChips } = await admin
      .from("u_chips")
      .select("id, created_by")
      .eq("event_id", eventId)
      .in("id", chipIds);

    const allowed = new Set(
      (validChips ?? [])
        .filter((c) => c.created_by === null || c.created_by === jurorId)
        .map((c) => c.id)
    );

    if (allowed.size !== chipIds.length) {
      return { ok: false, error: "Some chips are no longer available." };
    }
  }

  const { data: feedback, error: feedbackError } = await admin
    .from("u_feedback")
    .insert({
      pitch_id: verifiedPitchId,
      juror_id: jurorId,
      note: noteTrimmed.length > 0 ? noteTrimmed : null,
    })
    .select("id")
    .single();

  if (feedbackError || !feedback) {
    return { ok: false, error: "Could not submit. Please try again." };
  }

  if (chipIds.length > 0) {
    const { error: junctionError } = await admin
      .from("u_feedback_chips")
      .insert(chipIds.map((chipId) => ({ feedback_id: feedback.id, chip_id: chipId })));

    if (junctionError) {
      // Best-effort rollback so we don't leave an orphan feedback row.
      await admin.from("u_feedback").delete().eq("id", feedback.id);
      return { ok: false, error: "Could not submit. Please try again." };
    }
  }

  return { ok: true };
}
