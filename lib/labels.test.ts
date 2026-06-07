import { describe, expect, it } from "vitest";

import { normalizeLabel } from "./labels";

describe("normalizeLabel", () => {
  it("lowercases", () => {
    expect(normalizeLabel("Great Team")).toBe("great team");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeLabel("  unclear ask  ")).toBe("unclear ask");
  });

  it("collapses internal whitespace runs", () => {
    expect(normalizeLabel("great   \t team")).toBe("great team");
  });

  it("handles already-normalized input", () => {
    expect(normalizeLabel("bold claim")).toBe("bold claim");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeLabel("   ")).toBe("");
  });
});
