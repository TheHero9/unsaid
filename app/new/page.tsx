import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateEventForm } from "@/components/organizer/CreateEventForm";

export const metadata: Metadata = {
  title: "Create event",
};

export default function NewEventPage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-10">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an event
            </h1>
            <p className="text-balance text-sm text-muted-foreground">
              An event holds your pitches. You will get a public code for the
              jury and a private link for each founder.
            </p>
          </div>
        </div>

        <CreateEventForm />
      </div>
    </main>
  );
}
