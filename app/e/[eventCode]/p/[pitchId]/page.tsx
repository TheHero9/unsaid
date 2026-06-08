import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getAdminClient } from "@/lib/supabase/admin";
import { jurorCookieName } from "@/lib/cookies";
import {
  CaptureScreen,
  type CaptureCriterion,
} from "@/components/capture/CaptureScreen";
import type { CaptureChip } from "@/components/capture/ChipsGrid";
import type { JurorSubmission } from "@/components/capture/YourSubmissions";

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

  // Pitch must belong to this event.
  const { data: pitch } = await admin
    .from("u_pitches")
    .select("id, name")
    .eq("id", pitchId)
    .eq("event_id", event.id)
    .maybeSingle();
  if (!pitch) notFound();

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

  // This juror's OWN submissions for this pitch only - never anyone else's.
  const { data: feedbackRows } = await admin
    .from("u_feedback")
    .select(
      "id, note, created_at, u_feedback_chips(u_chips(id, label, sentiment)), u_feedback_ratings(score, u_criteria(id, label))"
    )
    .eq("pitch_id", pitch.id)
    .eq("juror_id", juror.id)
    .order("created_at", { ascending: false });

  const submissions: JurorSubmission[] = (feedbackRows ?? []).map((row) => ({
    id: row.id,
    note: row.note,
    createdAt: row.created_at,
    chips: row.u_feedback_chips
      .map((fc) => fc.u_chips)
      .filter((c) => c !== null),
    ratings: row.u_feedback_ratings.flatMap((fr) =>
      fr.u_criteria
        ? [
            {
              criterionId: fr.u_criteria.id,
              label: fr.u_criteria.label,
              score: fr.score,
            },
          ]
        : []
    ),
  }));

  return (
    <CaptureScreen
      eventCode={normalizedCode}
      pitchId={pitch.id}
      pitchName={pitch.name}
      initialChips={chips}
      initialCriteria={criteria}
      submissions={submissions}
    />
  );
}
