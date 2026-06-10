import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";

import { getAdminClient } from "@/lib/supabase/admin";
import {
  aggregateFeedback,
  type FeedbackInput,
  type FeedbackInputChip,
  type FeedbackInputRating,
} from "@/lib/aggregate";
import type { ChipSentiment } from "@/lib/chips";
import { ChipSummary } from "@/components/feedback/ChipSummary";
import { SentimentBar } from "@/components/feedback/SentimentBar";
import { CriteriaScores } from "@/components/feedback/CriteriaScores";
import { NotesFeed } from "@/components/feedback/NotesFeed";
import { ShareButton } from "@/components/feedback/ShareButton";

// Feedback is live - never cache; fresh on every load.
export const dynamic = "force-dynamic";

interface FounderPageProps {
  params: Promise<{ privateCode: string }>;
}

interface ResolvedPitch {
  id: string;
  name: string;
  eventName: string;
}

/**
 * Resolve a pitch (+ its event name) by private_code. Returns null on miss so
 * the caller can 404 - we never reveal whether a code exists.
 */
async function resolvePitch(
  privateCode: string
): Promise<ResolvedPitch | null> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("u_pitches")
    .select("id, name, u_events!inner(name)")
    .eq("private_code", privateCode)
    .maybeSingle();

  if (error || !data) return null;

  // `u_events` comes back as an object for a to-one relationship.
  const event = data.u_events as unknown as { name: string } | null;

  return {
    id: data.id,
    name: data.name,
    eventName: event?.name ?? "",
  };
}

export async function generateMetadata({
  params,
}: FounderPageProps): Promise<Metadata> {
  const { privateCode } = await params;
  const pitch = await resolvePitch(privateCode);

  return {
    title: pitch?.name ?? "Feedback",
    robots: { index: false, follow: false },
  };
}

/**
 * Fetch feedback for a pitch and aggregate it. The query selects ONLY:
 * juror_id (transient - used for distinct counting, never rendered or passed
 * to a client component), note, created_at, and each chip's label + sentiment.
 * No juror name is ever selected. See the ANONYMITY rule in S5.
 */
async function loadAggregate(pitchId: string) {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("u_feedback")
    .select(
      "id, juror_id, note, created_at, u_feedback_chips(u_chips(label, sentiment)), u_feedback_ratings(score, u_criteria(id, label, created_by))"
    )
    .eq("pitch_id", pitchId);

  if (error || !data) {
    return aggregateFeedback([]);
  }

  const rows: FeedbackInput[] = data.map((fb) => {
    const links = (fb.u_feedback_chips ?? []) as Array<{
      u_chips: { label: string; sentiment: ChipSentiment } | null;
    }>;

    const chips: FeedbackInputChip[] = links
      .map((link) => link.u_chips)
      .filter((chip): chip is { label: string; sentiment: ChipSentiment } =>
        Boolean(chip)
      )
      .map((chip) => ({ label: chip.label, sentiment: chip.sentiment }));

    // created_by is consumed HERE as a boolean only - the juror id behind a
    // personal criterion never reaches the aggregate output or the UI.
    const ratings: FeedbackInputRating[] = (fb.u_feedback_ratings ?? []).flatMap(
      (link) =>
        link.u_criteria
          ? [
              {
                criterionId: link.u_criteria.id,
                label: link.u_criteria.label,
                personal: link.u_criteria.created_by !== null,
                score: link.score,
              },
            ]
          : []
    );

    return {
      id: fb.id,
      jurorId: fb.juror_id,
      note: fb.note,
      createdAt: fb.created_at,
      chips,
      ratings,
    };
  });

  return aggregateFeedback(rows);
}

export default async function FounderPage({ params }: FounderPageProps) {
  const { privateCode } = await params;
  const pitch = await resolvePitch(privateCode);

  if (!pitch) notFound();

  const aggregate = await loadAggregate(pitch.id);
  const hasFeedback = aggregate.jurorCount > 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-[22px] pb-12 pt-14">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {pitch.eventName && (
              <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-text-3">
                {pitch.eventName}
              </p>
            )}
            <h1 className="mt-1.5 font-serif text-[38px] font-semibold leading-[1.02] tracking-[-0.02em] text-text">
              {pitch.name}
            </h1>
          </div>
          <ShareButton title={pitch.name} />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[13.5px] font-medium text-text-3">
          <Users className="size-4" aria-hidden />
          Feedback from {aggregate.jurorCount} juror
          {aggregate.jurorCount === 1 ? "" : "s"}
        </p>
      </header>

      {hasFeedback ? (
        <>
          <div className="mt-7">
            <SentimentBar
              positiveCount={aggregate.positiveCount}
              negativeCount={aggregate.negativeCount}
              neutralCount={aggregate.neutralCount}
            />
          </div>
          <div className="mt-8">
            <ChipSummary chipCounts={aggregate.chipCounts} />
          </div>
          <div className="mt-8">
            <CriteriaScores
              criteriaScores={aggregate.criteriaScores}
              personalScores={aggregate.personalScores}
            />
          </div>
          <div className="mt-8">
            <NotesFeed notes={aggregate.notes} />
          </div>

          <p className="mt-7 border-t border-border pt-[18px] text-center text-[12.5px] leading-[1.5] text-text-4">
            Anonymous by design. No names, no ranking - just the honest read,
            handed back to you.
          </p>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-[18px] py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface-2">
            <Users className="size-[26px] text-text-3" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="font-serif text-[22px] font-semibold text-text">
              No feedback yet
            </p>
            <p className="mx-auto max-w-[280px] text-[14.5px] leading-[1.5] text-text-3">
              When jurors start tapping during your pitch, their honest read
              shows up here - anonymous, and yours alone.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
