"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPitchSchema, type CreatePitchInput } from "@/schemas/pitch";
import { addPitchAction } from "@/app/o/[organizerCode]/actions";

interface AddPitchFormProps {
  organizerCode: string;
}

export function AddPitchForm({ organizerCode }: AddPitchFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePitchInput>({
    resolver: zodResolver(createPitchSchema),
    defaultValues: {
      organizer_code: organizerCode,
      name: "",
      description: "",
      slides_url: "",
      founder_email: "",
    },
  });

  const onSubmit = (values: CreatePitchInput) => {
    startTransition(async () => {
      const result = await addPitchAction(values);
      if (result.ok) {
        toast.success("Pitch added");
        reset({
          organizer_code: organizerCode,
          name: "",
          description: "",
          slides_url: "",
          founder_email: "",
        });
      } else {
        toast.error(result.error ?? "Could not add the pitch");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("organizer_code")} />

      <div className="space-y-2">
        <Label htmlFor="pitch-name">
          Product name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="pitch-name"
          placeholder="e.g. Acme AI"
          autoComplete="off"
          className="h-11 text-base"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pitch-description">Description</Label>
        <Input
          id="pitch-description"
          placeholder="One line about the product"
          autoComplete="off"
          className="h-11 text-base"
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
        <Label htmlFor="pitch-slides">Slides link</Label>
        <Input
          id="pitch-slides"
          type="url"
          inputMode="url"
          placeholder="https://..."
          autoComplete="off"
          className="h-11 text-base"
          aria-invalid={Boolean(errors.slides_url)}
          {...register("slides_url")}
        />
        {errors.slides_url && (
          <p className="text-sm text-destructive">{errors.slides_url.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pitch-email">Founder email</Label>
        <Input
          id="pitch-email"
          type="email"
          inputMode="email"
          placeholder="founder@example.com"
          autoComplete="off"
          className="h-11 text-base"
          aria-invalid={Boolean(errors.founder_email)}
          {...register("founder_email")}
        />
        {errors.founder_email && (
          <p className="text-sm text-destructive">
            {errors.founder_email.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full text-base"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <Plus className="size-5" aria-hidden />
        )}
        {isPending ? "Adding..." : "Add pitch"}
      </Button>
    </form>
  );
}
