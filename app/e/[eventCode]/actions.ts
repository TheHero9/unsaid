"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getAdminClient } from "@/lib/supabase/admin";
import { JUROR_COOKIE_MAX_AGE, jurorCookieName } from "@/lib/cookies";
import { joinEventSchema } from "@/schemas/juror";

export type JoinResult = { ok: true } | { ok: false; error: string };

/**
 * Join an event as a juror: resolve the public code, create a `u_jurors` row,
 * and set the per-event httpOnly identity cookie. The code is re-resolved
 * server-side - the client never supplies an event id.
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
  return { ok: true };
}
