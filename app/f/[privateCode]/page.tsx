import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inbox, Users } from "lucide-react";

import { getAdminClient } from "@/lib/supabase/admin";
import {
  aggregateFeedback,
  type FeedbackInput,
  type FeedbackInputChip,
} from "@/lib/aggregate";
import type { ChipSentiment } from "@/lib/chips";
import { ChipSummary } from "@/components/feedback/ChipSummary";
import { SentimentBar } from "@/components/feedback/SentimentBar";
import { NotesFeed } from "@/components/feedback/NotesFeed";

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
      "id, juror_id, note, created_at, u_feedback_chips(u_chips(label, sentiment))"
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

    return {
      id: fb.id,
      jurorId: fb.juror_id,
      note: fb.note,
      createdAt: fb.created_at,
      chips,
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-10">
      <header className="space-y-1">
        {pitch.eventName && (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {pitch.eventName}
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {pitch.name}
        </h1>
        {hasFeedback && (
          <p className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
            <Users className="size-4" aria-hidden />
            Feedback from {aggregate.jurorCount} juror
            {aggregate.jurorCount === 1 ? "" : "s"}
          </p>
        )}
      </header>

      {hasFeedback ? (
        <>
          <ChipSummary chipCounts={aggregate.chipCounts} />
          <SentimentBar
            positiveCount={aggregate.positiveCount}
            negativeCount={aggregate.negativeCount}
            neutralCount={aggregate.neutralCount}
          />
          <NotesFeed notes={aggregate.notes} />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <Inbox className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-medium">No feedback yet</p>
            <p className="text-sm text-muted-foreground">
              Check back after the pitches - this page updates as jurors submit.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
