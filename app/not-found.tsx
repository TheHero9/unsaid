import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary">
          <SearchX className="size-7 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Nothing here
          </h1>
          <p className="text-muted-foreground">
            This page does not exist, or the code you followed is not valid.
          </p>
        </div>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Back to start</Link>
        </Button>
      </div>
    </main>
  );
}
