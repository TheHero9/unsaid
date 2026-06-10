"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getAdminClient } from "@/lib/supabase/admin";
import { JUROR_COOKIE_MAX_AGE, jurorCookieName } from "@/lib/cookies";
import { joinEventSchema } from "@/schemas/juror";

export type JoinResult =
  | { ok: true; jurorId: string; name: string }
  | { ok: false; error: string };

/**
 * Join an event as a juror: resolve the public code, create a `u_jurors` row,
 * and set the per-event httpOnly identity cookie. The code is re-resolved
 * server-side - the client never supplies an event id.
 *
 * Returns the new juror id + name so the client can cache them in
 * localStorage and auto-resume the session on a later visit/refresh (the
 * cookie alone is httpOnly and can vanish across some mobile reloads).
 */
export async function joinEvent(
  eventCode: string,
  formData: FormData
): Promise<JoinResult> {
  const parsed = joinEventSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid name" };
  }

  const normalizedCode = eventCode.trim().toUpperCase();
  if (normalizedCode.length === 0) {
    return { ok: false, error: "Missing event code" };
  }

  const admin = getAdminClient();

  const { data: event, error: eventError } = await admin
    .from("u_events")
    .select("id")
    .eq("public_code", normalizedCode)
    .maybeSingle();

  if (eventError) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  if (!event) {
    return { ok: false, error: "That event code is no longer valid." };
  }

  const { data: juror, error: insertError } = await admin
    .from("u_jurors")
    .insert({ event_id: event.id, name: parsed.data.name })
    .select("id")
    .single();

  if (insertError || !juror) {
    return { ok: false, error: "Could not join. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(jurorCookieName(event.id), juror.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: JUROR_COOKIE_MAX_AGE,
  });

  revalidatePath(`/e/${normalizedCode}`);
  return { ok: true, jurorId: juror.id, name: parsed.data.name };
}

export type ResumeResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

/**
 * Re-establish a juror's session from a locally-cached juror id (localStorage).
 * Verifies the id belongs to THIS event, then re-sets the httpOnly cookie. Used
 * to recover from a dropped cookie on refresh/re-open so a juror keeps the name
 * they joined with - no new juror row, no duplicate identity. Never trusts the
 * client: the id must resolve to a real `u_jurors` row scoped to this event.
 */
export async function resumeJuror(
  eventCode: string,
  jurorId: string
): Promise<ResumeResult> {
  const normalizedCode = eventCode.trim().toUpperCase();
  if (normalizedCode.length === 0 || !jurorId) {
    return { ok: false, error: "Missing session" };
  }

  const admin = getAdminClient();

  const { data: event } = await admin
    .from("u_events")
    .select("id")
    .eq("public_code", normalizedCode)
    .maybeSingle();
  if (!event) return { ok: false, error: "That event code is no longer valid." };

  const { data: juror } = await admin
    .from("u_jurors")
    .select("id, name")
    .eq("id", jurorId)
    .eq("event_id", event.id)
    .maybeSingle();
  if (!juror) return { ok: false, error: "Session expired" };

  const cookieStore = await cookies();
  cookieStore.set(jurorCookieName(event.id), juror.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: JUROR_COOKIE_MAX_AGE,
  });

  return { ok: true, name: juror.name };
}
