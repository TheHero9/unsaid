"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary">
          <TriangleAlert className="size-7 text-destructive" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
