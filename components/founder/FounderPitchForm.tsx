"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createFounderPitchSchema,
  type CreateFounderPitchInput,
} from "@/schemas/founder";
import { createFounderEventAction } from "@/app/new/actions";

export function FounderPitchForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFounderPitchInput>({
    resolver: zodResolver(createFounderPitchSchema),
    defaultValues: { name: "", description: "", slides_url: "" },
  });

  const onSubmit = (values: CreateFounderPitchInput) => {
    setServerError(null);
    startTransition(async () => {
      // On success the action redirects and never resolves with a value here.
      const result = await createFounderEventAction(values);
      if (result && !result.ok) {
        setServerError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="founder-name">
          Your pitch name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="founder-name"
          placeholder="e.g. Acme AI"
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
        <Label htmlFor="founder-description">One line about it</Label>
        <Input
          id="founder-description"
          placeholder="What you do, in a sentence"
          autoComplete="off"
          className="h-12 text-base"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="founder-slides">Slides link</Label>
        <Input
          id="founder-slides"
          type="url"
          inputMode="url"
          placeholder="https://..."
          autoComplete="off"
          className="h-12 text-base"
          aria-invalid={Boolean(errors.slides_url)}
          {...register("slides_url")}
        />
        {errors.slides_url && (
          <p className="text-sm text-destructive">{errors.slides_url.message}</p>
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
        {isPending ? "Setting up..." : "Create my pitch"}
      </Button>
    </form>
  );
}
