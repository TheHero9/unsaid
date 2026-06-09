"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageSquareOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinPage() {
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
      <div className="w-full max-w-sm space-y-10">
        <div className="space-y-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <MessageSquareOff className="size-7 text-foreground" aria-hidden />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Nondit</h1>
          <p className="text-balance text-muted-foreground">
            The feedback founders never hear.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label
            htmlFor="event-code"
            className="block text-sm font-medium text-muted-foreground"
          >
            I have an event code
          </label>
          <div className="flex gap-2">
            <Input
              id="event-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7KQ2MX"
              maxLength={6}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="h-12 flex-1 text-center font-mono text-lg tracking-[0.3em] uppercase placeholder:tracking-normal placeholder:text-sm"
            />
            <Button
              type="submit"
              size="icon-lg"
              className="h-12 w-12"
              disabled={code.trim().length === 0}
              aria-label="Join event"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Organizing a pitch event?{" "}
          <Link
            href="/new"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an event
          </Link>
        </p>
      </div>
    </main>
  );
}
