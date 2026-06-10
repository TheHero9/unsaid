"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { jurorNameSchema } from "@/schemas/juror";
import {
  loadStoredJuror,
  saveStoredJuror,
  clearStoredJuror,
} from "@/lib/juror-storage";

import { joinEvent, resumeJuror } from "./actions";

interface JoinGateProps {
  eventCode: string;
  eventName: string;
  firstPitchId: string | null;
}

/**
 * Juror entry. On mount it tries to silently resume a cached session
 * (localStorage juror id -> re-set the cookie) so a refresh / re-open keeps the
 * name the juror walked in with. Falls back to a one-field join form.
 */
export function JoinGate({ eventCode, eventName, firstPitchId }: JoinGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "form">("checking");
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const enter = () => {
    if (firstPitchId) router.replace(`/e/${eventCode}/p/${firstPitchId}`);
    else router.refresh();
  };

  // Attempt silent resume from cached identity (all state updates happen
  // asynchronously inside the IIFE, never synchronously in the effect body).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = loadStoredJuror(eventCode);
      if (!stored) {
        if (!cancelled) setStatus("form");
        return;
      }
      const res = await resumeJuror(eventCode, stored.jurorId);
      if (cancelled) return;
      if (res.ok) {
        enter();
      } else {
        clearStoredJuror(eventCode);
        setName(stored.name);
        setStatus("form");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventCode]);

  useEffect(() => {
    if (status === "form") inputRef.current?.focus();
  }, [status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = jurorNameSchema.safeParse(name);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter your name");
      return;
    }

    const formData = new FormData();
    formData.set("name", parsed.data);

    startTransition(async () => {
      const res = await joinEvent(eventCode, formData);
      if (res.ok) {
        saveStoredJuror(eventCode, { jurorId: res.jurorId, name: res.name });
        enter();
      } else {
        toast.error(res.error);
      }
    });
  };

  if (status === "checking") {
    return (
      <main className="flex min-h-[100dvh] flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-3" aria-hidden />
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col px-[22px] pb-4">
      <div className="flex flex-1 flex-col justify-center">
        <p className="mb-1.5 text-[13px] font-semibold tracking-[0.04em] text-text-3">
          YOU&apos;RE JOINING
        </p>
        <h1 className="font-serif text-[44px] font-semibold leading-[1.02] tracking-[-0.02em] text-text">
          {eventName}
        </h1>
        <p className="mb-[30px] mt-3.5 max-w-[320px] text-[15.5px] leading-[1.5] text-text-2">
          Tap what you notice as each founder pitches. It&apos;s anonymous - they
          only ever see the totals, never who said what.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="juror-name"
            className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-text-3"
          >
            Your name
          </label>
          <input
            id="juror-name"
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            maxLength={60}
            autoComplete="name"
            disabled={pending}
            className="mt-2.5 h-[52px] w-full rounded-[13px] border border-border-2 bg-surface-2 px-4 text-[16px] text-text outline-none placeholder:text-text-4 focus-visible:border-border-strong"
          />
        </form>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending || name.trim().length === 0}
        className="flex h-[54px] items-center justify-center gap-2 rounded-[14px] bg-primary text-[16.5px] font-semibold text-primary-foreground transition-colors active:scale-[0.99] disabled:bg-surface-3 disabled:text-text-4"
      >
        {pending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <>
            Start judging
            <ArrowRight className="size-[19px]" aria-hidden />
          </>
        )}
      </button>
    </main>
  );
}
