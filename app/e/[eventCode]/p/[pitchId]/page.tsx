import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getAdminClient } from "@/lib/supabase/admin";
import { jurorCookieName } from "@/lib/cookies";
import {
  CaptureScreen,
  type CaptureChip,
  type CaptureCriterion,
  type CapturePitch,
} from "@/components/capture/CaptureScreen";

interface PageParams {
  params: Promise<{ eventCode: string; pitchId: string }>;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { eventCode, pitchId } = await params;
  const normalized = eventCode.trim().toUpperCase();
  if (!normalized) return { title: "Capture" };

  const admin = getAdminClient();
  const { data: event } = await admin
    .from("u_events")
    .select("id")
    .eq("public_code", normalized)
    .maybeSingle();
  if (!event) return { title: "Capture" };

  const { data: pitch } = await admin
    .from("u_pitches")
    .select("name")
    .eq("id", pitchId)
    .eq("event_id", event.id)
    .maybeSingle();

  return { title: pitch ? pitch.name : "Capture" };
}

export default async function CapturePage({ params }: PageParams) {
  const { eventCode, pitchId } = await params;
  const normalizedCode = eventCode.trim().toUpperCase();

  const admin = getAdminClient();

  const { data: event } = await admin
    .from("u_events")
    .select("id")
    .eq("public_code", normalizedCode)
    .maybeSingle();
  if (!event) notFound();

  // Gate on a valid juror cookie for this event; else back to join.
  const cookieStore = await cookies();
  const jurorId = cookieStore.get(jurorCookieName(event.id))?.value;
  if (!jurorId) redirect(`/e/${normalizedCode}`);

  const { data: juror } = await admin
    .from("u_jurors")
    .select("id")
    .eq("id", jurorId)
    .eq("event_id", event.id)
    .maybeSingle();
  if (!juror) redirect(`/e/${normalizedCode}`);

  // All pitches for the event - the switcher needs the full set.
  const { data: pitchRows } = await admin
    .from("u_pitches")
    .select("id, name, description, position")
    .eq("event_id", event.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const pitches: CapturePitch[] = (pitchRows ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
  }));

  // The requested pitch must belong to this event.
  if (!pitches.some((p) => p.id === pitchId)) notFound();

  // Chips: event defaults (created_by IS NULL) + this juror's own chips.
  const { data: chipRows } = await admin
    .from("u_chips")
    .select("id, label, sentiment, created_by, created_at")
    .eq("event_id", event.id)
    .or(`created_by.is.null,created_by.eq.${juror.id}`)
    .order("created_by", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });

  const chips: CaptureChip[] = (chipRows ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    sentiment: c.sentiment,
  }));

  // Criteria: event-wide (created_by IS NULL) + this juror's own.
  const { data: criterionRows } = await admin
    .from("u_criteria")
    .select("id, label, created_by, created_at")
    .eq("event_id", event.id)
    .or(`created_by.is.null,created_by.eq.${juror.id}`)
    .order("created_by", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });

  const criteria: CaptureCriterion[] = (criterionRows ?? []).map((c) => ({
    id: c.id,
    label: c.label,
  }));

  // Which pitches this juror has already submitted (for the progress strip +
  // jump-sheet checks). Only this juror's own rows - never anyone else's.
  const { data: feedbackRows } = await admin
    .from("u_feedback")
    .select("pitch_id")
    .eq("juror_id", juror.id);

  const submittedPitchIds = Array.from(
    new Set((feedbackRows ?? []).map((f) => f.pitch_id))
  );

  return (
    <CaptureScreen
      eventCode={normalizedCode}
      pitches={pitches}
      initialPitchId={pitchId}
      chips={chips}
      criteria={criteria}
      submittedPitchIds={submittedPitchIds}
    />
  );
}
