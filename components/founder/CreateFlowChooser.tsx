"use client";

import { useState } from "react";
import { ArrowLeft, Building2, ChevronRight, UserRound } from "lucide-react";

import { CreateEventForm } from "@/components/organizer/CreateEventForm";
import { FounderPitchForm } from "@/components/founder/FounderPitchForm";

type Mode = "choose" | "organizer" | "founder";

/**
 * The /new fork (Flow A vs Flow B - see specs/06-flows/). First asks how the
 * event is being run, then shows the matching create form. Founders get a
 * single-pitch setup; organizers get the full event form + dashboard.
 */
export function CreateFlowChooser() {
  const [mode, setMode] = useState<Mode>("choose");

  if (mode === "choose") {
    return (
      <div className="space-y-3">
        <ChoiceCard
          icon={<Building2 className="size-5" aria-hidden />}
          title="I'm running an event"
          body="A competition, demo day or accelerator with several startups pitching."
          onClick={() => setMode("organizer")}
        />
        <ChoiceCard
          icon={<UserRound className="size-5" aria-hidden />}
          title="I'm pitching myself"
          body="Just you. Get a QR for the room and your own private feedback page."
          onClick={() => setMode("founder")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setMode("choose")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Choose a different setup
      </button>

      {mode === "founder" ? (
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">
            Set up your pitch
          </h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ll make a QR code for the room and a private page where only
            you see the feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">
            Create your event
          </h2>
          <p className="text-sm text-muted-foreground">
            You&apos;ll get a public code for the jury and a private link for each
            founder.
          </p>
        </div>
      )}

      {mode === "founder" ? <FounderPitchForm /> : <CreateEventForm />}
    </div>
  );
}

function ChoiceCard({
  icon,
  title,
  body,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-foreground/30 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
        {icon}
      </span>
      <span className="flex-1 space-y-1">
        <span className="block font-semibold tracking-tight">{title}</span>
        <span className="block text-sm leading-snug text-muted-foreground">
          {body}
        </span>
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </button>
  );
}
