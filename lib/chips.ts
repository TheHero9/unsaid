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
  // Positive - what landed
  { label: "clear problem", sentiment: "positive" },
  { label: "big market", sentiment: "positive" },
  { label: "strong traction", sentiment: "positive" },
  { label: "great team", sentiment: "positive" },
  { label: "compelling demo", sentiment: "positive" },
  // Negative - what hurt
  { label: "unclear ask", sentiment: "negative" },
  { label: "weak market size", sentiment: "negative" },
  { label: "crowded market", sentiment: "negative" },
  { label: "shaky numbers", sentiment: "negative" },
  { label: "too much jargon", sentiment: "negative" },
  { label: "rushed delivery", sentiment: "negative" },
  // Neutral - observations
  { label: "bold claim", sentiment: "neutral" },
  { label: "memorable", sentiment: "neutral" },
  { label: "needs focus", sentiment: "neutral" },
] as const;
