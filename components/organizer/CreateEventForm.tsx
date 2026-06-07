"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEventSchema, type CreateEventInput } from "@/schemas/event";
import { createEventAction } from "@/app/new/actions";

export function CreateEventForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { name: "", event_date: "", location: "" },
  });

  const onSubmit = (values: CreateEventInput) => {
    setServerError(null);
    startTransition(async () => {
      // On success the action redirects and never resolves with a value here.
      const result = await createEventAction(values);
      if (result && !result.ok) {
        setServerError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">
          Event name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. Seed Demo Day"
          autoComplete="off"
          className="h-12 text-base"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_date">Date</Label>
        <Input
          id="event_date"
          type="date"
          className="h-12 text-base"
          aria-invalid={Boolean(errors.event_date)}
          {...register("event_date")}
        />
        {errors.event_date && (
          <p className="text-sm text-destructive">{errors.event_date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g. Berlin, or Zoom"
          autoComplete="off"
          className="h-12 text-base"
          aria-invalid={Boolean(errors.location)}
          {...register("location")}
        />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="size-5" aria-hidden />
        )}
        {isPending ? "Creating..." : "Create event"}
      </Button>
    </form>
  );
}
