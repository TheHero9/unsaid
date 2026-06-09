import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowRight,
  Bookmark,
  ScanLine,
  SlidersHorizontal,
  Tags,
  TriangleAlert,
} from "lucide-react";

import { getAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/organizer/CopyButton";
import { ChipManager, type ManagedChip } from "@/components/organizer/ChipManager";
import {
  CriteriaManager,
  type ManagedCriterion,
} from "@/components/organizer/CriteriaManager";
import type { Tables } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your pitch",
  // Holds the founder's private feedback link - never index.
  robots: { index: false, follow: false },
};

type EventRow = Pick<Tables<"u_events">, "id" | "name" | "public_code">;
type PitchRow = Pick<Tables<"u_pitches">, "name" | "private_code">;

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

export default async function FounderManagePage({
  params,
}: {
  params: Promise<{ manageCode: string }>;
}) {
  const { manageCode } = await params;

  const admin = getAdminClient();

  // The event's organizer_code doubles as the founder's manage code.
  const { data: event, error } = await admin
    .from("u_events")
    .select("id, name, public_code")
    .eq("organizer_code", manageCode)
    .maybeSingle<EventRow>();

  // 404 on miss - never 403, never confirm existence.
  if (error || !event) {
    notFound();
  }

  // The founder's single pitch (Flow B always has exactly one; take the first).
  const { data: pitch } = await admin
    .from("u_pitches")
    .select("name, private_code")
    .eq("event_id", event.id)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle<PitchRow>();

  if (!pitch) {
    notFound();
  }

  // Event-wide chips + criteria (created_by IS NULL).
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
  const manageLink = `${base}/p/${manageCode}`;
  const publicLink = `${base}/e/${event.public_code}`;
  const feedbackLink = `${base}/f/${pitch.private_code}`;
  const publicQr = await qrDataUrl(publicLink);

  return (
    <main className="flex flex-1 flex-col px-5 py-8">
      <div className="mx-auto w-full max-w-md space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Nondit
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {pitch.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            You&apos;re all set. Show the room your QR code, then come back here
            to read your feedback.
          </p>
        </header>

        {/* Save-this-page warning (no login - this is the only way back) */}
        <div className="space-y-3 rounded-xl border border-chip-negative/60 bg-chip-negative-muted/40 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert
              className="mt-0.5 size-5 shrink-0 text-chip-negative"
              aria-hidden
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Save this page now</p>
              <p className="text-sm text-muted-foreground">
                There&apos;s no login. This link is the only way back to your QR
                code and your feedback. Bookmark it or screenshot it.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-background/60 px-3 py-2 text-xs">
              {manageLink}
            </code>
            <CopyButton value={manageLink} what="This page link" size="default" />
          </div>
        </div>

        {/* Share with the room */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="size-4" aria-hidden />
              Show this to the room
            </CardTitle>
            <CardDescription>
              Anyone who scans this can leave feedback. They can never read it.
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

            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-muted/60 px-3 py-2 text-sm">
                {publicLink}
              </code>
              <CopyButton value={publicLink} what="Feedback link" size="default" />
            </div>
          </CardContent>
        </Card>

        {/* View my feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="size-4" aria-hidden />
              Your feedback
            </CardTitle>
            <CardDescription>
              Private to you. It fills in as the room submits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild size="lg" className="h-12 w-full text-base">
              <Link href={`/f/${pitch.private_code}`}>
                View my feedback
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-muted/60 px-3 py-2 text-xs">
                {feedbackLink}
              </code>
              <CopyButton
                value={feedbackLink}
                what="Private feedback link"
                size="default"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feedback chips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="size-4" aria-hidden />
              Feedback chips
            </CardTitle>
            <CardDescription>
              The tap-to-react chips the room sees. Tune them before you pitch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChipManager organizerCode={manageCode} chips={eventChips} />
          </CardContent>
        </Card>

        {/* Rating criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" aria-hidden />
              Rating criteria
            </CardTitle>
            <CardDescription>
              1-5 scales the room can score. You see the average per criterion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CriteriaManager organizerCode={manageCode} criteria={eventCriteria} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
