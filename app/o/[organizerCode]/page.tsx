import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import QRCode from "qrcode";

import { getAdminClient } from "@/lib/supabase/admin";
import {
  OrganizerDashboard,
  type FounderLink,
} from "@/components/organizer/OrganizerDashboard";
import type { ManagedChip } from "@/components/organizer/ChipManager";
import type { ManagedCriterion } from "@/components/organizer/CriteriaManager";
import type { Tables } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organizer",
};

type EventRow = Pick<
  Tables<"u_events">,
  "id" | "name" | "event_date" | "location" | "public_code"
>;
type PitchRow = Pick<
  Tables<"u_pitches">,
  "id" | "name" | "description" | "slides_url" | "private_code" | "position"
>;

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

/** Render a scannable QR (dark modules on white) as a data URL. */
async function qrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: { dark: "#0b0b0d", light: "#ffffff" },
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

  // Event-wide feedback setup (created_by IS NULL).
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

  const founderLinks: FounderLink[] = await Promise.all(
    pitches.map(async (pitch) => {
      const link = `${base}/f/${pitch.private_code}`;
      return {
        id: pitch.id,
        name: pitch.name,
        description: pitch.description,
        slidesUrl: pitch.slides_url,
        link,
        qr: await qrDataUrl(link),
      };
    })
  );

  const dateLabel = event.event_date
    ? format(parseISO(event.event_date), "EEEE, d MMMM yyyy")
    : null;

  return (
    <OrganizerDashboard
      organizerCode={organizerCode}
      eventName={event.name}
      dateLabel={dateLabel}
      location={event.location}
      publicCode={event.public_code}
      publicLink={publicLink}
      publicQr={publicQr}
      founderLinks={founderLinks}
      chips={eventChips}
      criteria={eventCriteria}
    />
  );
}
