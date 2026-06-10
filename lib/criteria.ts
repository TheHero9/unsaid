/**
 * Default 1-5 rating criteria seeded into `u_criteria` for every new event
 * (created_by NULL = event-wide). Tuned for tech-startup pitch judging
 * (1-slide / 1-min / 5-min Q&A formats). The organizer or founder can delete
 * any of these or add their own. See specs/04-data-model/01-data-model.md.
 */

export interface DefaultCriterion {
  label: string;
}

export const DEFAULT_CRITERIA: readonly DefaultCriterion[] = [
  { label: "problem & solution" },
  { label: "market opportunity" },
  { label: "team" },
  { label: "traction" },
] as const;
