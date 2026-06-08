import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import QRCode from "qrcode";
import {
  CalendarDays,
  ExternalLink,
  Inbox,
  MapPin,
  SlidersHorizontal,
  Tags,
  Users,
} from "lucide-react";

import { getAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/organizer/CopyButton";
import { AddPitchForm } from "@/components/organizer/AddPitchForm";
import { DeletePitchDialog } from "@/components/organizer/DeletePitchDialog";
import { ChipManager, type ManagedChip } from "@/components/organizer/ChipManager";
import {
  CriteriaManager,
  type ManagedCriterion,
} from "@/components/organizer/CriteriaManager";
import type { Tables } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organizer",
};

type EventRow = Pick<
  Tables<"u_events">,
  "id" | "name" | "event_date" | "location" | "public_code"
>;
type PitchRow = Pick<Tables<"u_pitches">, "id" | "name" | "description" | "slides_url" | "private_code" | "position">;

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

/** Render a scannable QR code (white modules, transparent ground) as a data URL. */
async function qrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: { dark: "#ffffff", light: "#00000000" },
  });
}

export default async function OrganizerDashboardPage({
  params,
}: {
  params: Promise<{ organizerCode: string }>;
}) {
  const { organizerCode } = await params;

  const admin = getAdminClient();
  const { data: event, error } = await admin
    .from("u_events")
    .select("id, name, event_date, location, public_code")
    .eq("organizer_code", organizerCode)
    .maybeSingle<EventRow>();

  // 404 on miss - never 403, do not confirm existence.
  if (error || !event) {
    notFound();
  }

  const { data: pitchesData } = await admin
    .from("u_pitches")
    .select("id, name, description, slides_url, private_code, position")
    .eq("event_id", event.id)
    .order("position", { ascending: true });

  const pitches: PitchRow[] = pitchesData ?? [];

  // Event-wide feedback setup (created_by IS NULL) - jurors' personal chips
  // and criteria belong to them and are not managed here.
  const { data: chipRows } = await admin
    .from("u_chips")
    .select("id, label, sentiment")
    .eq("event_id", event.id)
    .is("created_by", null)
    .order("created_at", { ascending: true });
  const eventChips: ManagedChip[] = chipRows ?? [];

  const { data: criterionRows } = await admin
    .from("u_criteria")
    .select("id, label")
    .eq("event_id", event.id)
    .is("created_by", null)
    .order("created_at", { ascending: true });
  const eventCriteria: ManagedCriterion[] = criterionRows ?? [];

  const base = appUrl();
  const publicLink = `${base}/e/${event.public_code}`;
  const publicQr = await qrDataUrl(publicLink);

  const founderLinks = pitches.map((pitch) => ({
    ...pitch,
    link: `${base}/f/${pitch.private_code}`,
  }));
  const founderQrs = await Promise.all(
    founderLinks.map((p) => qrDataUrl(p.link))
  );

  const dateLabel = event.event_date
    ? format(parseISO(event.event_date), "EEEE, d MMMM yyyy")
    : null;

  return (
    <main className="flex flex-1 flex-col px-5 py-8">
      <div className="mx-auto w-full max-w-md space-y-8">
        {/* Event header */}
        <header className="space-y-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Unsaid
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {event.name}
          </h1>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {dateLabel && (
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden />
                {dateLabel}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {event.location}
              </span>
            )}
          </div>
        </header>

        {/* Share with the jury */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" aria-hidden />
              Share with the jury
            </CardTitle>
            <CardDescription>
              Anyone with this code can give feedback. They can never read it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/40 p-4">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Event code
              </span>
              <span className="font-mono text-4xl font-semibold tracking-[0.2em]">
                {event.public_code}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicQr}
                alt={`QR code linking to ${publicLink}`}
                width={176}
                height={176}
                className="size-44"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-muted/60 px-3 py-2 text-sm">
                  {publicLink}
                </code>
                <CopyButton
                  value={publicLink}
                  what="Event link"
                  size="default"
                />
              </div>
              <div className="flex justify-center">
                <CopyButton
                  value={event.public_code}
                  what="Event code"
                  label="Copy code"
                  variant="secondary"
                  size="default"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="size-4" aria-hidden />
              Feedback chips
            </CardTitle>
            <CardDescription>
              The tap-to-react chips every juror sees. Jurors can still add
              their own on the fly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChipManager organizerCode={organizerCode} chips={eventChips} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" aria-hidden />
              Rating criteria
            </CardTitle>
            <CardDescription>
              1-5 scales every juror can score. Founders see the average per
              criterion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CriteriaManager
              organizerCode={organizerCode}
              criteria={eventCriteria}
            />
          </CardContent>
        </Card>

        {/* Add pitch */}
        <Card>
          <CardHeader>
            <CardTitle>Add a pitch</CardTitle>
            <CardDescription>
              Each pitch gets a private link only its founder can open.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddPitchForm organizerCode={organizerCode} />
          </CardContent>
        </Card>

        {/* Pitch list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Pitches
            </h2>
            <span className="text-sm text-muted-foreground">
              {pitches.length}
            </span>
          </div>

          {founderLinks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">
              <Inbox className="size-6" aria-hidden />
              <p className="text-sm">No pitches yet. Add your first one above.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {founderLinks.map((pitch, index) => (
                <li key={pitch.id}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {index + 1}. {pitch.name}
                          </CardTitle>
                          {pitch.description && (
                            <CardDescription className="text-balance">
                              {pitch.description}
                            </CardDescription>
                          )}
                        </div>
                        <DeletePitchDialog
                          organizerCode={organizerCode}
                          pitchId={pitch.id}
                          pitchName={pitch.name}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pitch.slides_url && (
                        <a
                          href={pitch.slides_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                          Slides
                        </a>
                      )}

                      <Separator />

                      <div className="space-y-3">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Founder private link
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 truncate rounded-md bg-muted/60 px-3 py-2 text-xs">
                            {pitch.link}
                          </code>
                          <CopyButton
                            value={pitch.link}
                            what="Founder link"
                            size="default"
                          />
                        </div>
                        <div className="flex justify-center rounded-lg bg-muted/40 p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={founderQrs[index]}
                            alt={`QR code for ${pitch.name}'s private feedback link`}
                            width={144}
                            height={144}
                            className="size-36"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
