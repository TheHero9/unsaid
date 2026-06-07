import { describe, expect, it } from "vitest";

import {
  PRIVATE_CODE_ALPHABET,
  PRIVATE_CODE_LENGTH,
  PUBLIC_CODE_ALPHABET,
  PUBLIC_CODE_LENGTH,
  generatePrivateCode,
  generatePublicCode,
} from "./codes";

describe("generatePublicCode", () => {
  it("returns codes of the configured length", () => {
    for (let i = 0; i < 100; i++) {
      expect(generatePublicCode()).toHaveLength(PUBLIC_CODE_LENGTH);
    }
  });

  it("only uses the Crockford-style alphabet (no 0/O/1/I/L/U)", () => {
    const allowed = new Set(PUBLIC_CODE_ALPHABET);
    for (let i = 0; i < 1000; i++) {
      for (const ch of generatePublicCode()) {
        expect(allowed.has(ch)).toBe(true);
      }
    }
  });

  it("excludes the ambiguous characters from the alphabet itself", () => {
    for (const ch of ["0", "O", "1", "I", "L", "U"]) {
      expect(PUBLIC_CODE_ALPHABET).not.toContain(ch);
    }
  });
});

describe("generatePrivateCode", () => {
  it("returns codes of the configured length", () => {
    for (let i = 0; i < 100; i++) {
      expect(generatePrivateCode()).toHaveLength(PRIVATE_CODE_LENGTH);
    }
  });

  it("only uses URL-safe alphanumerics", () => {
    const allowed = new Set(PRIVATE_CODE_ALPHABET);
    for (let i = 0; i < 1000; i++) {
      for (const ch of generatePrivateCode()) {
        expect(allowed.has(ch)).toBe(true);
      }
    }
  });

  it("has no collisions across 10k generations", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      seen.add(generatePrivateCode());
    }
    expect(seen.size).toBe(10_000);
  });
});

describe("public code collision behaviour", () => {
  // 30^6 = 729M combinations - 10k draws may rarely collide by birthday
  // bound (~7% chance); the create-event action retries on unique violation.
  // Here we only sanity-check distribution breadth.
  it("generates a wide spread across 10k draws", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      seen.add(generatePublicCode());
    }
    expect(seen.size).toBeGreaterThan(9_990);
  });
});
