"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  /** Accessible label + toast wording, e.g. "Public code" or "Founder link". */
  what?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "outline" | "secondary" | "ghost" | "default";
}

export function CopyButton({
  value,
  label,
  what = "Link",
  className,
  size = "sm",
  variant = "outline",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${what} copied`);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy. Copy it manually.");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(className)}
      aria-label={`Copy ${what.toLowerCase()}`}
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
      {label}
    </Button>
  );
}
