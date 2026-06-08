import { describe, expect, it } from "vitest";

import { aggregateFeedback, type FeedbackInput } from "./aggregate";

function row(overrides: Partial<FeedbackInput>): FeedbackInput {
  return {
    id: "f-default",
    jurorId: "j-default",
    note: null,
    createdAt: "2026-06-07T10:00:00.000Z",
    chips: [],
    ...overrides,
  };
}

describe("aggregateFeedback", () => {
  it("returns an empty, zeroed shape for no rows", () => {
    const result = aggregateFeedback([]);

    expect(result).toEqual({
      jurorCount: 0,
      chipCounts: [],
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
      criteriaScores: [],
      personalScores: [],
      notes: [],
    });
  });

  it("averages event-wide criteria across jurors and separates personal ones", () => {
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "j1",
        ratings: [
          { criterionId: "c1", label: "team", personal: false, score: 4 },
          { criterionId: "c2", label: "market", personal: false, score: 2 },
          { criterionId: "c3", label: "gtm", personal: true, score: 5 },
        ],
      }),
      row({
        id: "f2",
        jurorId: "j2",
        ratings: [
          { criterionId: "c1", label: "team", personal: false, score: 5 },
        ],
      }),
    ]);

    // Most-scored first, tie-break by label.
    expect(result.criteriaScores).toEqual([
      { label: "team", average: 4.5, count: 2 },
      { label: "market", average: 2, count: 1 },
    ]);
    // Personal criteria never mix into the event-wide list.
    expect(result.personalScores).toEqual([
      { label: "gtm", average: 5, count: 1 },
    ]);
  });

  it("averages repeat scores for the same criterion", () => {
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "j1",
        ratings: [
          { criterionId: "c1", label: "team", personal: false, score: 2 },
        ],
      }),
      row({
        id: "f2",
        jurorId: "j1", // same juror re-rates in a later submission
        ratings: [
          { criterionId: "c1", label: "team", personal: false, score: 3 },
        ],
      }),
    ]);

    expect(result.criteriaScores).toEqual([
      { label: "team", average: 2.5, count: 2 },
    ]);
  });

  it("groups chips across different label casings/whitespace under one count", () => {
    const result = aggregateFeedback([
      {
        ...row({
          id: "f1",
          jurorId: "j1",
          chips: [{ label: "Great Team", sentiment: "positive" }],
        }),
      },
      {
        ...row({
          id: "f2",
          jurorId: "j2",
          chips: [{ label: "  great   team ", sentiment: "positive" }],
        }),
      },
      {
        ...row({
          id: "f3",
          jurorId: "j3",
          chips: [{ label: "great team", sentiment: "positive" }],
        }),
      },
    ]);

    expect(result.chipCounts).toHaveLength(1);
    expect(result.chipCounts[0].jurorCount).toBe(3);
    // First-seen original casing is the display label.
    expect(result.chipCounts[0].label).toBe("Great Team");
    expect(result.chipCounts[0].sentiment).toBe("positive");
  });

  it("counts a chip once per juror even if the same juror selects it twice", () => {
    // jurorCount per chip = distinct jurors who EVER selected it.
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "j1",
        chips: [
          { label: "confident", sentiment: "positive" },
          { label: "Confident", sentiment: "positive" },
        ],
      }),
    ]);

    expect(result.chipCounts).toHaveLength(1);
    expect(result.chipCounts[0].jurorCount).toBe(1);
    // ...but raw selections still count twice for the ratio.
    expect(result.positiveCount).toBe(2);
  });

  it("counts DISTINCT jurors per chip across multiple jurors", () => {
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "j1",
        chips: [{ label: "unclear ask", sentiment: "negative" }],
      }),
      row({
        id: "f2",
        jurorId: "j2",
        chips: [{ label: "unclear ask", sentiment: "negative" }],
      }),
      row({
        id: "f3",
        jurorId: "j2", // same juror j2 again
        chips: [{ label: "unclear ask", sentiment: "negative" }],
      }),
    ]);

    expect(result.chipCounts[0].jurorCount).toBe(2); // j1, j2 only
  });

  it("sorts chips by jurorCount desc, tie-broken alphabetically by label", () => {
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "j1",
        chips: [
          { label: "zebra", sentiment: "neutral" },
          { label: "apple", sentiment: "neutral" },
          { label: "unclear ask", sentiment: "negative" },
        ],
      }),
      row({
        id: "f2",
        jurorId: "j2",
        chips: [
          { label: "zebra", sentiment: "neutral" },
          { label: "apple", sentiment: "neutral" },
          { label: "unclear ask", sentiment: "negative" },
        ],
      }),
      row({
        id: "f3",
        jurorId: "j3",
        chips: [{ label: "unclear ask", sentiment: "negative" }],
      }),
    ]);

    expect(result.chipCounts.map((c) => [c.label, c.jurorCount])).toEqual([
      ["unclear ask", 3], // highest count first
      ["apple", 2], // tie at 2 -> alphabetical
      ["zebra", 2],
    ]);
  });

  it("computes positive/negative/neutral as total raw chip selections", () => {
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "j1",
        chips: [
          { label: "good demo", sentiment: "positive" },
          { label: "confident", sentiment: "positive" },
          { label: "unclear ask", sentiment: "negative" },
          { label: "bold claim", sentiment: "neutral" },
        ],
      }),
      row({
        id: "f2",
        jurorId: "j2",
        chips: [
          { label: "good demo", sentiment: "positive" },
          { label: "rushed delivery", sentiment: "negative" },
        ],
      }),
    ]);

    expect(result.positiveCount).toBe(3);
    expect(result.negativeCount).toBe(2);
    expect(result.neutralCount).toBe(1);
  });

  it("counts distinct jurors who submitted any feedback", () => {
    const result = aggregateFeedback([
      row({ id: "f1", jurorId: "j1", note: "a" }),
      row({ id: "f2", jurorId: "j2", note: "b" }),
      row({ id: "f3", jurorId: "j1", note: "c" }), // j1 again
    ]);

    expect(result.jurorCount).toBe(2);
  });

  it("includes only non-empty notes, newest first, trimmed", () => {
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "j1",
        note: "  older note  ",
        createdAt: "2026-06-07T09:00:00.000Z",
      }),
      row({
        id: "f2",
        jurorId: "j2",
        note: "newest note",
        createdAt: "2026-06-07T11:00:00.000Z",
      }),
      row({
        id: "f3",
        jurorId: "j3",
        note: "   ", // whitespace-only -> excluded
        createdAt: "2026-06-07T10:30:00.000Z",
      }),
      row({
        id: "f4",
        jurorId: "j4",
        note: null, // null -> excluded
        createdAt: "2026-06-07T10:00:00.000Z",
      }),
      row({
        id: "f5",
        jurorId: "j5",
        note: "middle note",
        createdAt: "2026-06-07T10:00:00.000Z",
      }),
    ]);

    expect(result.notes).toEqual([
      { note: "newest note", createdAt: "2026-06-07T11:00:00.000Z" },
      { note: "middle note", createdAt: "2026-06-07T10:00:00.000Z" },
      { note: "older note", createdAt: "2026-06-07T09:00:00.000Z" },
    ]);
  });

  it("never leaks juror identity in the output shape", () => {
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "secret-juror-id",
        note: "n",
        chips: [{ label: "memorable", sentiment: "neutral" }],
      }),
    ]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("secret-juror-id");
    expect(serialized).not.toContain("jurorId");
  });

  it("handles a pitch with chips but no notes", () => {
    const result = aggregateFeedback([
      row({
        id: "f1",
        jurorId: "j1",
        chips: [{ label: "clear problem", sentiment: "positive" }],
      }),
    ]);

    expect(result.notes).toEqual([]);
    expect(result.chipCounts).toHaveLength(1);
    expect(result.jurorCount).toBe(1);
  });

  it("handles notes-only feedback (no chips)", () => {
    const result = aggregateFeedback([
      row({ id: "f1", jurorId: "j1", note: "just a thought" }),
    ]);

    expect(result.chipCounts).toEqual([]);
    expect(result.positiveCount).toBe(0);
    expect(result.negativeCount).toBe(0);
    expect(result.neutralCount).toBe(0);
    expect(result.notes).toEqual([
      { note: "just a thought", createdAt: "2026-06-07T10:00:00.000Z" },
    ]);
  });
});
