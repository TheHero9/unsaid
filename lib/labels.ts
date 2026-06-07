/**
 * Chip-label normalization - the single definition used by both the
 * custom-chip upsert (capture) and the founder-view aggregation, so
 * "Great Team", " great  team " and "great team" all merge.
 */
export function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}
