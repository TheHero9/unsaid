import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";

import { getAdminClient } from "@/lib/supabase/admin";
import { jurorCookieName } from "@/lib/cookies";

import { EventNotFound } from "./EventNotFound";
import { JoinGate } from "./JoinGate";

interface PageParams {
  params: Promise<{ eventCode: string }>;
}

/**
 * Resolve an event by its public code (stored uppercase, compared
 * case-insensitively). Returns null on miss - the page then renders a branded
 * not-found state rather than the global 404.
 */
async function resolveEvent(eventCode: string) {
  const normalized = eventCode.trim().toUpperCase();
  if (normalized.length === 0) return null;

  const admin = getAdminClient();
  const { data } = await admin
    .from("u_events")
    .select("id, name, public_code")
    .eq("public_code", normalized)
    .maybeSingle();

  return data;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { eventCode } = await params;
  const event = await resolveEvent(eventCode);
  return { title: event ? event.name : "Event not found" };
}

export default async function JurorEventPage({ params }: PageParams) {
  const { eventCode } = await params;
  const normalizedCode = eventCode.trim().toUpperCase();
  const event = await resolveEvent(eventCode);

  if (!event) {
    return <EventNotFound attemptedCode={normalizedCode} />;
  }

  const admin = getAdminClient();

  // First pitch (running order) - where a joined juror lands.
  const { data: pitchRows } = await admin
    .from("u_pitches")
    .select("id, position")
    .eq("event_id", event.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  const firstPitchId = pitchRows?.[0]?.id ?? null;

  // Already joined (valid cookie)? Go straight to capture.
  const cookieStore = await cookies();
  const jurorId = cookieStore.get(jurorCookieName(event.id))?.value;
  let joined = false;
  if (jurorId) {
    const { data } = await admin
      .from("u_jurors")
      .select("id")
      .eq("id", jurorId)
      .eq("event_id", event.id)
      .maybeSingle();
    joined = Boolean(data);
  }

  if (joined && firstPitchId) {
    redirect(`/e/${normalizedCode}/p/${firstPitchId}`);
  }

  if (joined && !firstPitchId) {
    return (
      <main className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-2">
          <Inbox className="size-7 text-text-3" aria-hidden />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-text">
          {event.name}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-text-3">
          No pitches have been added to this event yet. Check back once the
          organizer adds them.
        </p>
      </main>
    );
  }

  return (
    <JoinGate
      eventCode={normalizedCode}
      eventName={event.name}
      firstPitchId={firstPitchId}
    />
  );
}
