"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jurorNameSchema } from "@/schemas/juror";

import { joinEvent } from "./actions";

interface JoinCardProps {
  eventCode: string;
  eventName: string;
}

export function JoinCard({ eventCode, eventName }: JoinCardProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = jurorNameSchema.safeParse(name);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Enter your name");
      return;
    }

    const formData = new FormData();
    formData.set("name", result.data);

    startTransition(async () => {
      const res = await joinEvent(eventCode, formData);
      if (res.ok) {
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            You&apos;re joining
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {eventName}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="juror-name">Your name</Label>
            <Input
              id="juror-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              maxLength={60}
              autoComplete="name"
              autoFocus
              disabled={pending}
              className="h-12 text-base"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-base"
            disabled={pending || name.trim().length === 0}
          >
            <LogIn className="size-5" />
            {pending ? "Joining..." : "Start giving feedback"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Your name is shown to event staff only, never to founders.
        </p>
      </div>
    </main>
  );
}
