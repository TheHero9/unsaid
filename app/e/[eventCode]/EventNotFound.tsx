"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchX, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EventNotFoundProps {
  attemptedCode: string;
}

export function EventNotFound({ attemptedCode }: EventNotFoundProps) {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length === 0) return;
    router.push(`/e/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <SearchX className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Event not found
            </h1>
            <p className="text-muted-foreground">
              No event matches the code{" "}
              <span className="font-mono font-medium text-foreground">
                {attemptedCode}
              </span>
              . Double-check it and try again.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <label
            htmlFor="retry-code"
            className="block text-sm font-medium text-muted-foreground"
          >
            Try another event code
          </label>
          <div className="flex gap-2">
            <Input
              id="retry-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7KQ2MX"
              maxLength={6}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="h-12 flex-1 text-center font-mono text-lg tracking-[0.3em] uppercase placeholder:text-sm placeholder:tracking-normal"
            />
            <Button
              type="submit"
              size="icon-lg"
              className="h-12 w-12"
              disabled={code.trim().length === 0}
              aria-label="Try code"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
