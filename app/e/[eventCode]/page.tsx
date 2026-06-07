import type { Metadata } from "next";
import { cookies } from "next/headers";

import { getAdminClient } from "@/lib/supabase/admin";
import { jurorCookieName } from "@/lib/cookies";

import { EventNotFound } from "./EventNotFound";
import { JoinCard } from "./JoinCard";
import { PitchRow } from "./PitchRow";

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

  // Verify the juror cookie: the row must exist AND belong to THIS event.
  const cookieStore = await cookies();
  const jurorId = cookieStore.get(jurorCookieName(event.id))?.value;

  const admin = getAdminClient();

  let juror: { id: string; name: string } | null = null;
  if (jurorId) {
    const { data } = await admin
      .from("u_jurors")
      .select("id, name")
      .eq("id", jurorId)
      .eq("event_id", event.id)
      .maybeSingle();
    juror = data;
  }

  if (!juror) {
    return <JoinCard eventCode={normalizedCode} eventName={event.name} />;
  }

  // Pitch list. NOTE: this surface NEVER reads feedback - only pitches.
  const { data: pitches } = await admin
    .from("u_pitches")
    .select("id, name, description, slides_url, position")
    .eq("event_id", event.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const rows = pitches ?? [];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-8">
      <header className="space-y-1 px-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {event.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re giving feedback as{" "}
          <span className="font-medium text-foreground">{juror.name}</span>
        </p>
      </header>

      <p className="mt-6 px-1 text-sm font-medium text-muted-foreground">
        Tap the pitch being presented now
      </p>

      {rows.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No pitches have been added to this event yet.
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((pitch) => (
            <PitchRow
              key={pitch.id}
              eventCode={normalizedCode}
              pitchId={pitch.id}
              name={pitch.name}
              description={pitch.description}
              slidesUrl={pitch.slides_url}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
