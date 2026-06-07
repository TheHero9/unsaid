/**
 * Default chip set seeded into `u_chips` for every new event
 * (created_by NULL = event default). See specs/04-data-model/01-data-model.md.
 */

export type ChipSentiment = "positive" | "negative" | "neutral";

export interface DefaultChip {
  label: string;
  sentiment: ChipSentiment;
}

export const DEFAULT_CHIPS: readonly DefaultChip[] = [
  { label: "unclear ask", sentiment: "negative" },
  { label: "weak market size", sentiment: "negative" },
  { label: "rushed delivery", sentiment: "negative" },
  { label: "too much jargon", sentiment: "negative" },
  { label: "strong traction", sentiment: "positive" },
  { label: "great team", sentiment: "positive" },
  { label: "good demo", sentiment: "positive" },
  { label: "confident", sentiment: "positive" },
  { label: "clear problem", sentiment: "positive" },
  { label: "memorable", sentiment: "neutral" },
  { label: "bold claim", sentiment: "neutral" },
] as const;
