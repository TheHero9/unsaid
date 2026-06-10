import type { ChipSentiment } from "@/lib/chips";

/**
 * Sentiment -> Tailwind class strings, shared by the capture chips and the
 * "add your own" sentiment picker. The palette is the product's through-line
 * (identical tokens power the founder summary).
 */
export const CHIP_ACTIVE: Record<ChipSentiment, string> = {
  positive: "text-pos bg-pos-wash border-pos-bd",
  negative: "text-neg bg-neg-wash border-neg-bd",
  neutral: "text-neu bg-neu-wash border-neu-bd",
};

export const CHIP_IDLE: Record<ChipSentiment, string> = {
  positive: "text-text-2 border-pos-faint",
  negative: "text-text-2 border-neg-faint",
  neutral: "text-text-2 border-neu-faint",
};

/** Solid sentiment swatch background (used by the add-your-own picker dots). */
export const SENTIMENT_DOT: Record<ChipSentiment, string> = {
  positive: "bg-pos border-pos",
  negative: "bg-neg border-neg",
  neutral: "bg-neu border-neu",
};

/** Group chips positive -> neutral -> negative for a calm reading order. */
export const SENTIMENT_ORDER: ChipSentiment[] = ["positive", "neutral", "negative"];
